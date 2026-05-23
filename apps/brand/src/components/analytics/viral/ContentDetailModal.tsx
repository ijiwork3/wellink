/**
 * ContentDetailModal — 바이럴 콘텐츠 상세 분석 드로어 패널 v3
 *
 * 실제 서비스 기준 (2026-05-23):
 *  - 우측에서 슬라이드인하는 드로어 패널 (Modal → drawer)
 *  - 상단 4개 점수 카드: 최종점수 · 등급 · 퍼포먼스 · 오멘팅
 *  - 시계열 추이 5개 차트: 조회수 · 증가 조회수 · 좋아요수 · 댓글수 · 참여율
 *    각 차트에 내 것(solid) vs 평균(dashed) 비교선
 *  - X축: N일차 (0일차 ~ 27일차)
 *  - 툴팁: "N일차 / 내 [지표]: v / 평균 [지표]: v"
 */

import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { X, ExternalLink, Link2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fmtNumber, CHART_COLORS } from '@wellink/ui'
import { type ViralContent, CAMPAIGN_MATCH_MAP } from '../../../data/analytics/viral'

/* ── 시리즈 데이터 생성 ───────────────────────────────────────────── */

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xFFFFFFFF
  }
}

interface SeriesPoint { my: number; avg: number }

function buildSeries(content: ViralContent, days = 28) {
  const rand = seededRand(hashSeed(content.id + content.influencer))

  const peakDay = 1 + Math.floor(rand() * 2)           // 1~2일차에 피크
  const peakMult = 2.5 + rand() * 4                    // 피크 배율

  // 조회수 시리즈 생성 함수
  const makeViews = (base: number): number[] =>
    Array.from({ length: days }, (_, d) => {
      const n = rand()
      if (d <= peakDay) {
        const rising = base * (0.2 + (d / peakDay) * 0.8) * peakMult
        return Math.round(rising * (0.85 + n * 0.3))
      }
      const decay = Math.max(0.03, 1 - (d - peakDay) * 0.085)
      return Math.round(base * decay * (0.8 + n * 0.4))
    })

  const myViews = makeViews(content.reach)
  const avgBase = content.reach * (1.1 + rand() * 0.6)
  const avgViews = Array.from({ length: days }, (_, d) => {
    const n = rand()
    const decay = Math.max(0.05, 1 - d * 0.045)
    return Math.round(avgBase * decay * peakMult * 0.7 * (0.9 + n * 0.2))
  })

  const views: SeriesPoint[] = myViews.map((v, i) => ({ my: v, avg: avgViews[i] }))

  // 증가 조회수 (delta)
  const viewsInc: SeriesPoint[] = views.map((v, i) => ({
    my:  i === 0 ? v.my  : Math.max(0, v.my  - views[i - 1].my),
    avg: i === 0 ? v.avg : Math.max(0, v.avg - views[i - 1].avg),
  }))

  // 좋아요
  const likesBase = content.likes / Math.max(content.reach, 1)
  const likes: SeriesPoint[] = views.map(v => ({
    my:  Math.round(v.my  * likesBase * (0.9 + rand() * 0.2)),
    avg: Math.round(v.avg * likesBase * (0.85 + rand() * 0.3)),
  }))

  // 댓글
  const commBase = content.comments / Math.max(content.reach, 1)
  const comments: SeriesPoint[] = views.map(v => ({
    my:  Math.round(v.my  * commBase * (0.8 + rand() * 0.4)),
    avg: Math.round(v.avg * commBase * (0.9 + rand() * 0.2)),
  }))

  // 참여율 (%)
  const engagement: SeriesPoint[] = views.map((v, i) => ({
    my:  v.my  > 0 ? parseFloat(((likes[i].my  + comments[i].my)  / v.my  * 100).toFixed(2)) : 0,
    avg: v.avg > 0 ? parseFloat(((likes[i].avg + comments[i].avg) / v.avg * 100).toFixed(2)) : 0,
  }))

  return { views, viewsInc, likes, comments, engagement }
}

/* ── 시계열 라인 차트 ────────────────────────────────────────────── */

// 차트 per-metric 색상 (원본 서비스 기준)
const COLORS = {
  views:    { my: '#16a34a', avg: '#4ade80' },  // 조회수:      초록 solid / 초록 연한 dashed
  viewsInc: { my: '#f97316', avg: '#fbbf24' },  // 증가 조회수: 오렌지 / 앰버 dashed
  likes:    { my: '#ec4899', avg: '#f9a8d4' },  // 좋아요:      핑크 / 연핑크 dashed
  comments: { my: '#7c3aed', avg: '#a78bfa' },  // 댓글:        보라 / 연보라 dashed
  engage:   { my: '#0891b2', avg: '#67e8f9' },  // 참여율:      시안 / 연시안 dashed
}

interface LineChartProps {
  title: string
  series: SeriesPoint[]
  myLabel: string
  avgLabel: string
  formatValue?: (v: number) => string
  myColor: string
  avgColor: string
}

const LineChart = memo(function LineChart({
  title, series, myLabel, avgLabel,
  formatValue = (v) => fmtNumber(v),
  myColor, avgColor,
}: LineChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const W = 480, H = 160, padL = 44, padR = 12, padT = 12, padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = series.length

  const maxVal = useMemo(() => {
    const all = series.flatMap(p => [p.my, p.avg])
    return Math.max(...all, 1)
  }, [series])

  const toX = useCallback((i: number) => padL + (i / (n - 1)) * plotW, [n, plotW])
  const toY = useCallback((v: number) => padT + plotH - (v / maxVal) * plotH, [maxVal, plotH])

  const myPath  = series.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.my).toFixed(1)}`).join(' ')
  const avgPath = series.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.avg).toFixed(1)}`).join(' ')

  // X 라벨: 0, 5, 10, 15, 20, 25일차
  const xLabels = [0, 5, 10, 15, 20, 25].filter(d => d < n)

  // Y 그리드 3개
  const yGrids = [0, 0.5, 1].map(r => padT + plotH - r * plotH)

  const handleMove = useCallback((clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    // SVG 실제 렌더 너비
    const svgW = rect.width
    const svgRatio = W / svgW
    const svgX = (clientX - rect.left) * svgRatio
    const rawI = Math.round((svgX - padL) / (plotW / (n - 1)))
    setHoverIdx(Math.max(0, Math.min(n - 1, rawI)))
  }, [n, plotW])

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
      {/* 범례 */}
      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={myColor} strokeWidth="2" strokeLinecap="round" /></svg>
          {myLabel}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={avgColor} strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" /></svg>
          {avgLabel}
        </span>
      </div>
      <div className="relative select-none">
        <svg
          ref={svgRef}
          width="100%" viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ height: H, touchAction: 'pan-y' }}
          onMouseMove={e => handleMove(e.clientX)}
          onMouseLeave={() => setHoverIdx(null)}
          onClick={e => handleMove(e.clientX)}
          onTouchStart={e => handleMove(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX) }}
          role="img"
          aria-label={title}
        >
          {/* 그리드 */}
          {yGrids.map(y => (
            <line key={y} x1={padL} y1={y} x2={W - padR} y2={y} stroke={CHART_COLORS.grid} strokeWidth={1} />
          ))}

          {/* Y 라벨 */}
          {[1, 0.5, 0].map(r => {
            const v = maxVal * r
            return (
              <text key={r} x={padL - 4} y={padT + plotH - r * plotH + 4}
                textAnchor="end" fontSize={9} fill={CHART_COLORS.axisLabel}>
                {formatValue(Math.round(v))}
              </text>
            )
          })}

          {/* 평균 점선 */}
          <path d={avgPath} fill="none" stroke={avgColor} strokeWidth={1.5} strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" />

          {/* 내 것 실선 */}
          <path d={myPath} fill="none" stroke={myColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {/* X 축 라벨 */}
          {xLabels.map(d => (
            <text key={d} x={toX(d)} y={H - 4} textAnchor="middle" fontSize={9} fill={CHART_COLORS.axisLabel}>
              {d}일차
            </text>
          ))}

          {/* hover 수직선 + 점 */}
          {hoverIdx != null && (() => {
            const x = toX(hoverIdx)
            const pt = series[hoverIdx]
            return (
              <g>
                <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke={CHART_COLORS.axisLabel} strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
                <circle cx={x} cy={toY(pt.my)}  r={3.5} fill={myColor}  stroke="white" strokeWidth={1.5} />
                <circle cx={x} cy={toY(pt.avg)} r={3.5} fill={avgColor} stroke="white" strokeWidth={1.5} />
              </g>
            )
          })()}
        </svg>

        {/* hover 툴팁 — SVG 위에 HTML 오버레이 */}
        {hoverIdx != null && (() => {
          const pt = series[hoverIdx]
          // SVG 내 X 비율로 HTML 툴팁 위치 계산
          const xRatio = (hoverIdx / (n - 1))
          const isRight = xRatio > 0.6
          return (
            <div
              className="absolute top-2 pointer-events-none z-10"
              style={{ [isRight ? 'right' : 'left']: `${isRight ? (1 - xRatio) * 100 : xRatio * 100}%`, transform: isRight ? 'translateX(8px)' : 'translateX(-8px)' }}
            >
              <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-2 shadow-lg whitespace-nowrap">
                <p className="text-gray-300 mb-1">{hoverIdx}일차</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: myColor }} />
                  <span>{myLabel}: {formatValue(pt.my)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: avgColor }} />
                  <span>{avgLabel}: {formatValue(pt.avg)}</span>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
})

/* ── 등급 카드 배경색 ────────────────────────────────────────────── */

function gradeCardClass(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-amber-50 border-amber-200 text-amber-800'
    case 'B': return 'bg-blue-50 border-blue-200 text-blue-800'
    case 'C': return 'bg-gray-50 border-gray-200 text-gray-700'
    default:  return 'bg-gray-50 border-gray-200 text-gray-500'
  }
}

/* ── 요청 기준일 ─────────────────────────────────────────────────── */

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateMinusDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── 메인 컴포넌트 ───────────────────────────────────────────────── */

interface Props {
  content: ViralContent | null
  onClose: () => void
}

const ContentDetailModal = memo(function ContentDetailModal({ content, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const series = useMemo(() => content ? buildSeries(content) : null, [content])

  useEffect(() => {
    if (content) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
    }
  }, [content])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 260)
  }, [onClose])

  // Escape 키
  useEffect(() => {
    if (!content) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [content, handleClose])

  if (!content) return null

  const finalScore = content.grade !== 'processing'
    ? ((content.performanceScore + content.momentumScore) / 2).toFixed(1)
    : '—'

  const handle = content.influencer.replace('@', '')
  const profileUrl = `https://instagram.com/${handle}`

  return (
    <>
      {/* 백드롭 */}
      <div
        className={`fixed inset-0 z-[199] bg-black/45 backdrop-blur-sm transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 드로어 패널 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${content.influencer} 상세 분석`}
        className={`fixed top-0 right-0 h-full z-[200] w-full sm:w-[560px] bg-white shadow-2xl flex flex-col transition-transform duration-250 ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 패널 헤더 */}
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                {content.type} 상세 점수
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-xl font-bold text-gray-900">{content.influencer}</p>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="인스타그램 프로필 새 창"
                >
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">요청 기준일 {todayStr()}</p>
            </div>
            <button
              onClick={handleClose}
              aria-label="닫기"
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* 날짜 기준 notice */}
          <div className="mb-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500">{todayStr()} 기준 데이터입니다.</p>
          </div>

          {/* 4개 점수 카드 — 2x2 그리드 (드로어 폭에서 4열 시 값 큰 경우 깨짐 방지) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-500 mb-1">최종 점수</p>
              <p className="text-xl font-bold text-blue-900 tabular-nums">{finalScore}</p>
            </div>
            <div className={`border rounded-xl p-3 ${gradeCardClass(content.grade)}`}>
              <p className="text-xs opacity-70 mb-1">등급</p>
              <p className="text-xl font-bold tabular-nums">{content.grade === 'processing' ? '—' : content.grade}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">퍼포먼스</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {content.grade !== 'processing' ? `${content.performanceScore}/100` : '—'}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">모멘텀</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">
                {content.grade !== 'processing' ? `${content.momentumScore}/100` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* 연결된 캠페인 — 원본 ViralMetricsSection L1078-1095 보강 */}
          {(() => {
            const match = CAMPAIGN_MATCH_MAP[content.id]
            if (!match) return null
            return (
              <Link
                to={`/campaigns/${match.campaignId}`}
                onClick={handleClose}
                className="block rounded-xl border border-brand-green-border bg-brand-green-bg/40 p-4 hover:bg-brand-green-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-brand-green-text mb-1.5">
                  <Link2 size={12} aria-hidden="true" />
                  연결된 캠페인
                </div>
                <p className="text-base font-bold text-gray-900 mb-1 break-words">{match.campaignName}</p>
                <p className="text-xs text-gray-500">업로드 기간 · {match.uploadPeriodLabel}</p>
              </Link>
            )
          })()}

          {content.grade === 'processing' ? (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong className="font-semibold">아직 데이터가 충분하지 않아 평가 중입니다.</strong>
                <span className="block text-amber-700 mt-0.5">데이터가 더 쌓이면 점수와 시계열 차트가 표시됩니다.</span>
              </p>
            </div>
          ) : series ? (
            <>
              {/* 시계열 추이 헤더 */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-1">시계열 추이</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {dateMinusDays(27)}부터 {todayStr()}까지 조회한 데이터를 게시 후 일차 기준으로 보여줍니다.
                  평균선과 내 값을 함께 확인할 수 있습니다.
                </p>
              </div>

              <LineChart
                title="조회수"
                series={series.views}
                myLabel="내 조회수"
                avgLabel="평균 조회수"
                myColor={COLORS.views.my}
                avgColor={COLORS.views.avg}
              />

              <LineChart
                title="증가 조회수"
                series={series.viewsInc}
                myLabel="내 증가 조회수"
                avgLabel="평균 증가 조회수"
                myColor={COLORS.viewsInc.my}
                avgColor={COLORS.viewsInc.avg}
              />

              <LineChart
                title="좋아요 수"
                series={series.likes}
                myLabel="내 좋아요 수"
                avgLabel="평균 좋아요 수"
                myColor={COLORS.likes.my}
                avgColor={COLORS.likes.avg}
              />

              <LineChart
                title="댓글 수"
                series={series.comments}
                myLabel="내 댓글 수"
                avgLabel="평균 댓글 수"
                myColor={COLORS.comments.my}
                avgColor={COLORS.comments.avg}
              />

              <LineChart
                title="참여율"
                series={series.engagement}
                myLabel="내 참여율"
                avgLabel="평균 참여율"
                formatValue={(v) => `${v.toFixed(1)}%`}
                myColor={COLORS.engage.my}
                avgColor={COLORS.engage.avg}
              />
            </>
          ) : null}
        </div>
      </div>
    </>
  )
})

export default ContentDetailModal
