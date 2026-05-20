/**
 * ContentDetailModal — 바이럴 콘텐츠 상세 모달 v2
 *
 * 개선 (2026-05-18):
 *  - 상단 썸네일 배너 추가 (16:9, getThumbnailFromPool)
 *  - 날짜 ISO 원본 → 상대 포맷 (N시간 전 / N일 전 / yyyy.mm.dd)
 *  - 콘텐츠 타입 배지 스타일 통일
 *  - 캡션 자동 보강 + 해시태그 추가 (ViralContentRowCard 동일 로직)
 *  - 인플루언서 외부 링크 (플랫폼별 URL)
 *  - 산정 중 안내박스: blue → amber (ViralContentRowCard와 동일 톤)
 *  - 성과 점수 섹션 유지
 */

import { memo, useState, useEffect, useRef, useMemo } from 'react'
import { Megaphone, Info, Eye, Heart, MessageCircle, Bookmark, Share2, TrendingUp, ExternalLink, Play, AlertCircle, Camera, X } from 'lucide-react'
import { Modal, Tooltip, PlatformBadge, fmtNumber, ChartScrollContainer, useChartScrollContext, useIsTouchDevice, CHART_COLORS, type ChartScrollContainerHandle } from '@wellink/ui'
import GradePill from './GradePill'
import { CAMPAIGN_MATCH_MAP, type ViralContent } from '../../../data/analytics/viral'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../../../utils/thumbnailPlaceholder'

interface Props {
  content: ViralContent | null
  onClose: () => void
}

/* ── 날짜 포맷 ── */
function fmtRelativeDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const diffMs = Date.now() - d.getTime()
  const hours = Math.floor(diffMs / 3600000)
  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}.${m}.${day}`
}

/* ── 캡션 자동 보강 ── */
const CAPTION_DETAILS = [
  '평소보다 댓글 반응이 뜨겁고, 저장 수도 +30% 상승해서 후속 캠페인 매칭을 적극 검토하면 좋을 콘텐츠예요.',
  '인플루언서 톤이 자연스럽게 녹아들어 광고스럽지 않고, 팔로워들이 진심으로 반응하고 있어요.',
  '브랜드 일상 노출로 친화도가 빠르게 쌓이는 콘텐츠. 후기·문의 댓글이 이어지고 있어요.',
  '도달이 평소 대비 큰 폭 상승. 알고리즘이 노출을 밀어주는 시점이라 추가 콘텐츠 타이밍 좋아요.',
  '저장·공유가 동시에 증가 중. 단순 좋아요보다 진성 관심 신호가 강하게 잡혀요.',
  '댓글의 90%가 긍정·문의 톤이라 브랜드 호감도 점수가 높게 산출됐어요.',
]

const HASHTAG_POOLS: Record<string, string[]> = {
  '릴스':   ['크로스핏', 'enuf', 'hyrox', '운동', 'wod', 'fitness', '오운완', 'gymlife'],
  '피드':   ['데일리', 'sports', '운동스타그램', 'enuf', '크로스핏', 'protein', 'fitness'],
  '영상':   ['vlog', '운동', 'crossfit', 'protein', 'enuf', 'sports', 'training'],
  '쇼츠':   ['shorts', 'crossfit', 'enuf', 'sports', 'wod', 'fitness'],
  '스토리': ['daily', '일상', 'enuf', '운동'],
}

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function useDerivedContent(content: ViralContent | null) {
  return useMemo(() => {
    if (!content) return { caption: '', hashtags: [] as string[], profileUrl: '', thumbSrc: '' }
    const seed = hashSeed(content.influencer + content.type)
    const caption = CAPTION_DETAILS[seed % CAPTION_DETAILS.length]
    const pool = HASHTAG_POOLS[content.type] ?? HASHTAG_POOLS['피드']
    const picked: string[] = []
    const s = hashSeed(content.influencer)
    for (let i = 0; i < 4; i++) picked.push(pool[(s + i * 7) % pool.length])
    const hashtags = [...new Set(picked)].slice(0, 4)
    const handle = content.influencer.replace('@', '')
    const profileUrl =
      content.platform === 'instagram' ? `https://instagram.com/${handle}` :
      content.platform === 'youtube'   ? `https://youtube.com/@${handle}` :
                                         `https://tiktok.com/@${handle}`
    const thumbSrc = getThumbnailFromPool(content.influencer)
    return { caption, hashtags, profileUrl, thumbSrc }
  }, [content])
}

/* ── 콘텐츠 타입 칩 스타일 ── */
const TYPE_CHIP = 'px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium whitespace-nowrap'

const ContentDetailModal = memo(function ContentDetailModal({ content, onClose }: Props) {
  const isTouch = useIsTouchDevice()
  const campaignMatch = content ? (CAMPAIGN_MATCH_MAP[content.id] ?? null) : null
  const { caption, hashtags, profileUrl, thumbSrc } = useDerivedContent(content)
  const [imgSrc, setImgSrc] = useState(thumbSrc)

  useEffect(() => { setImgSrc(thumbSrc) }, [thumbSrc])
  const handleImgError = () => {
    if (content) setImgSrc(getPlaceholderDataUri(content.influencer, content.influencer))
  }

  const isVideoType = content && (content.type === '릴스' || content.type === '영상' || content.type === '쇼츠')

  // 점수 시계열
  const scoreHistory = content && content.grade !== 'processing' ? Array.from({ length: 7 }, (_, i) => {
    const base = Math.max(0, content.performanceScore - (6 - i) * 4 + (i % 3) * 2)
    const mom  = Math.max(0, content.momentumScore  - (6 - i) * 3 + (i % 4) * 3)
    return { label: `D-${6 - i}`, performance: Math.min(100, base), momentum: Math.min(100, mom) }
  }) : []

  const [scoreIdx, setScoreIdx] = useState<number | null>(0)
  const scoreScrollRef = useRef<ChartScrollContainerHandle>(null)

  useEffect(() => {
    const len = scoreHistory.length
    setScoreIdx(len > 0 ? 0 : null)
    requestAnimationFrame(() => { scoreScrollRef.current?.scrollToStart() })
  }, [content, scoreHistory.length])

  const metrics = content ? [
    { label: '도달',       value: content.reach,     icon: <Eye size={14} aria-hidden="true" />,           color: 'text-blue-500' },
    { label: '좋아요',     value: content.likes,     icon: <Heart size={14} aria-hidden="true" />,          color: 'text-rose-400' },
    { label: '댓글',       value: content.comments,  icon: <MessageCircle size={14} aria-hidden="true" />,  color: 'text-amber-500' },
    { label: '저장',       value: content.saves,     icon: <Bookmark size={14} aria-hidden="true" />,       color: 'text-violet-500' },
    { label: '공유',       value: content.shares,    icon: <Share2 size={14} aria-hidden="true" />,         color: 'text-emerald-500' },
    { label: '바이럴 점수', value: content.viralScore, icon: <TrendingUp size={14} aria-hidden="true" />,  color: 'text-brand-green' },
  ] : []

  return (
    <Modal open={content !== null} onClose={onClose} size="lg" label="콘텐츠 상세" showClose={false}>
      {content && (
        <div className="space-y-4">

          {/* 썸네일 배너 — 16:9, cover crop */}
          <div className="relative -mx-4 -mt-4 @sm:-mx-6 @sm:-mt-6 overflow-hidden rounded-t-2xl" style={{ aspectRatio: '16/9' }}>
            <img
              src={imgSrc}
              alt={`${content.influencer} ${content.type} 미리보기`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={handleImgError}
            />
            {/* 닫기 버튼 — 우상단 */}
            <button
              onClick={onClose}
              aria-label="닫기"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <X size={16} aria-hidden="true" />
            </button>
            {/* 콘텐츠 타입 칩 — 좌상단 */}
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-xs font-semibold">
              {content.type}
            </span>
            {/* 플랫폼 칩 — 좌하단 */}
            <span className="absolute bottom-3 left-3 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-xs font-medium">
              <Camera size={11} aria-hidden="true" />
              {content.platform === 'instagram' ? 'IG' : content.platform === 'youtube' ? 'YT' : 'TT'}
            </span>
            {/* 재생 버튼 오버레이 — 영상성 콘텐츠 */}
            {isVideoType && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/50">
                  <Play size={20} className="text-white fill-white ml-0.5" aria-hidden="true" />
                </div>
              </div>
            )}
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* 헤더 — 등급 + 플랫폼 + 타입 + 인플루언서 */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <GradePill grade={content.grade} />
              <PlatformBadge platform={content.platform} />
              <span className={TYPE_CHIP}>{content.type}</span>
            </div>
            <p className="text-base font-bold text-gray-900 mt-2 leading-snug">{content.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm text-gray-500">{content.influencer}</span>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={`${content.influencer} 프로필 새 창`}
              >
                <ExternalLink size={13} aria-hidden="true" />
              </a>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-sm text-gray-400">{fmtRelativeDate(content.createdAt)}</span>
            </div>
          </div>

          {/* 캡션 + 해시태그 */}
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{caption}</p>
            {hashtags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {hashtags.map(t => (
                  <span key={t} className="text-sm text-brand-green-text font-medium">#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* 캠페인 매칭 */}
          {campaignMatch && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-green-bg border border-brand-green-border rounded-xl">
              <Megaphone size={14} className="text-brand-green-text shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-green-text">{campaignMatch.campaignName}</p>
                <p className="text-sm text-brand-green-text/70">{fmtRelativeDate(campaignMatch.uploadPeriodLabel.replace(' 등록', ''))} 등록</p>
              </div>
            </div>
          )}

          {/* 주요 지표 그리드 */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">주요 지표</h2>
            <div className="grid grid-cols-3 gap-2">
              {metrics.map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                  <div className={`flex items-center gap-1 mb-1 ${m.color}`}>
                    {m.icon}
                    <span className="text-xs text-gray-500">{m.label}</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 tabular-nums">
                    {m.value > 0 ? fmtNumber(m.value) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 점수 섹션 or 산정 중 안내 */}
          {content.grade !== 'processing' ? (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">성과 점수</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">퍼포먼스</span>
                    <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교한 누적 조회수 수준" multiline>
                      <Info size={12} className="text-gray-400" aria-hidden="true" />
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{content.performanceScore}</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={content.performanceScore} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${content.performanceScore}%` }} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">모멘텀</span>
                    <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교한 최근 조회수 증가 속도" multiline>
                      <Info size={12} className="text-gray-400" aria-hidden="true" />
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{content.momentumScore}</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={content.momentumScore} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${content.momentumScore}%` }} />
                  </div>
                </div>
              </div>

              {scoreHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-violet-500 inline-block rounded" />퍼포먼스</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded" />모멘텀</span>
                  </div>
                  <ChartScrollContainer
                    ref={scoreScrollRef}
                    chartW={400} padL={8} padR={8}
                    dataLength={scoreHistory.length}
                    activeIndex={scoreIdx}
                    tooltipContent={(i) => {
                      const d = scoreHistory[i]
                      if (!d) return null
                      return (
                        <>
                          <p className="text-sm text-gray-500 mb-1.5 whitespace-nowrap">{d.label}</p>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-violet-500" />
                            <span className="text-sm text-gray-700 whitespace-nowrap font-medium">퍼포먼스 {d.performance}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-amber-400" />
                            <span className="text-sm text-gray-700 whitespace-nowrap font-medium">모멘텀 {d.momentum}</span>
                          </div>
                        </>
                      )
                    }}
                  >
                    <ScoreHistoryChart data={scoreHistory} activeIndex={scoreIdx} onActiveIndex={setScoreIdx} isTouch={isTouch} />
                  </ChartScrollContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-amber-800 leading-relaxed">
                <strong className="font-semibold">아직 데이터가 충분하지 않아 평가중입니다.</strong>
                <span className="block text-amber-700">데이터가 더 쌓이면 점수와 등급이 표시됩니다.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
})

export default ContentDetailModal

/** 점수 추이 미니 라인 차트 — ContentDetailModal 내부 전용 */
const ScoreHistoryChart = memo(function ScoreHistoryChart({
  data, activeIndex, onActiveIndex, isTouch,
}: {
  data: { label: string; performance: number; momentum: number }[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}) {
  const ctx = useChartScrollContext()
  const W = ctx?.measuredW ?? 400
  const H = 120, padL = 8, padR = 8, padT = 8, padB = 24
  const plotW = W - padL - padR, plotH = H - padT - padB
  const stepX = plotW / Math.max(data.length - 1, 1)
  const toY = (v: number) => padT + plotH - (v / 100) * plotH
  const line = (key: 'performance' | 'momentum') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * stepX} ${toY(d[key])}`).join(' ')

  const handlePointerAt = (clientX: number, rect: DOMRect) => {
    const ratio = (clientX - rect.left) / rect.width
    const svgX = ratio * W - padL
    const idx = Math.round(svgX / stepX)
    onActiveIndex?.(Math.max(0, Math.min(data.length - 1, idx)))
  }

  return (
    <svg
      width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
      className="[&_*]:pointer-events-none"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: Math.max(400, data.length * 44), height: H }}
      role="img" aria-label="퍼포먼스·모멘텀 점수 추이 차트"
      onMouseMove={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onClick={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchStart={isTouch ? (e) => handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) } : undefined}
    >
      {[0, 0.5, 1].map(r => (
        <line key={r} x1={padL} y1={padT + plotH - r * plotH} x2={W - padR} y2={padT + plotH - r * plotH} stroke={CHART_COLORS.grid} strokeWidth={1} />
      ))}
      <path d={line('performance')} fill="none" stroke={CHART_COLORS.saves} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={line('momentum')} fill="none" stroke={CHART_COLORS.warn} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={i} x={padL + i * stepX} y={H - 4} textAnchor="middle" fontSize={11} fill={CHART_COLORS.axisLabel}>{d.label}</text>
      ))}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const x = padL + activeIndex * stepX
        return (
          <g key="active">
            <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke={CHART_COLORS.axisLabel} strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={x} cy={toY(d.performance)} r={3.5} fill={CHART_COLORS.saves} stroke="white" strokeWidth={1.5} />
            <circle cx={x} cy={toY(d.momentum)} r={3.5} fill={CHART_COLORS.warn} stroke="white" strokeWidth={1.5} />
          </g>
        )
      })()}
    </svg>
  )
})
