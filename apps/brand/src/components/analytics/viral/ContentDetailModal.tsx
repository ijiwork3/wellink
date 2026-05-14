/**
 * ContentDetailModal — 바이럴 콘텐츠 상세 모달
 *
 * 헤더 + 캠페인 매칭 + 주요 지표 그리드 + 성과 점수(perf/momentum) + 점수 추이 차트(ScoreHistoryChart).
 * 본 파일에 ScoreHistoryChart 내포 (모달 외 재사용 의도 없음).
 */

import { memo, useState, useEffect, useRef } from 'react'
import { Megaphone, Info, Eye, Heart, MessageCircle, Bookmark, Share2, TrendingUp } from 'lucide-react'
import { Modal, Tooltip, PlatformBadge, fmtNumber, ChartScrollContainer, useChartScrollContext, useIsTouchDevice, type ChartScrollContainerHandle } from '@wellink/ui'
import GradePill from './GradePill'
import { CAMPAIGN_MATCH_MAP, type ViralContent } from '../../../data/analytics/viral'

interface Props {
  content: ViralContent | null
  onClose: () => void
}

const ContentDetailModal = memo(function ContentDetailModal({ content, onClose }: Props) {
  const isTouch = useIsTouchDevice()
  const campaignMatch = content ? (CAMPAIGN_MATCH_MAP[content.id] ?? null) : null

  // 점수 시계열 더미 (7포인트)
  const scoreHistory = content && content.grade !== 'processing' ? Array.from({ length: 7 }, (_, i) => {
    const base = Math.max(0, content.performanceScore - (6 - i) * 4 + (i % 3) * 2)
    const mom  = Math.max(0, content.momentumScore  - (6 - i) * 3 + (i % 4) * 3)
    return { label: `D-${6 - i}`, performance: Math.min(100, base), momentum: Math.min(100, mom) }
  }) : []

  // 차트 인터랙티브 인덱스 (모달 열릴 때 마지막 인덱스). content=null이면 빈 배열이라 null 안전 폴백.
  const [scoreIdx, setScoreIdx] = useState<number | null>(0)
  const scoreScrollRef = useRef<ChartScrollContainerHandle>(null)

  // content 변경 시 차트 인덱스·스크롤 초기화 — 맨 왼쪽 포인트(0) 기본 노출 + scrollToStart
  useEffect(() => {
    const len = scoreHistory.length
    setScoreIdx(len > 0 ? 0 : null)
    requestAnimationFrame(() => { scoreScrollRef.current?.scrollToStart() })
  }, [content, scoreHistory.length])


  const metrics = content ? [
    { label: '도달',   value: content.reach,    icon: <Eye size={14} aria-hidden="true" />,          color: 'text-blue-600' },
    { label: '좋아요', value: content.likes,    icon: <Heart size={14} aria-hidden="true" />,         color: 'text-rose-500' },
    { label: '댓글',   value: content.comments, icon: <MessageCircle size={14} aria-hidden="true" />, color: 'text-amber-600' },
    { label: '저장',   value: content.saves,    icon: <Bookmark size={14} aria-hidden="true" />,      color: 'text-violet-600' },
    { label: '공유',   value: content.shares,   icon: <Share2 size={14} aria-hidden="true" />,        color: 'text-emerald-600' },
    { label: '바이럴 점수', value: content.viralScore, icon: <TrendingUp size={14} aria-hidden="true" />, color: 'text-brand-green' },
  ] : []

  return (
    <Modal
      open={content !== null}
      onClose={onClose}
      size="md"
      label="콘텐츠 상세"
    >
      {content && (
        <div className="space-y-5">
          {/* 헤더 정보 */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <GradePill grade={content.grade} />
              <PlatformBadge platform={content.platform} />
              <span className="text-sm font-medium text-gray-500">{content.type}</span>
            </div>
            <p className="text-base font-semibold text-gray-900 mt-1 leading-snug">{content.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{content.influencer} · {content.createdAt}</p>
          </div>

          {/* 캠페인 매칭 */}
          {campaignMatch && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-green-bg border border-brand-green-border rounded-xl">
              <Megaphone size={14} className="text-brand-green-text shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-green-text">{campaignMatch.campaignName}</p>
                <p className="text-sm text-brand-green-text/70">{campaignMatch.uploadPeriodLabel}</p>
              </div>
            </div>
          )}

          {/* 주요 지표 그리드 */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">주요 지표</h2>
            <div className="grid grid-cols-3 gap-2">
              {metrics.map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                  <div className={`flex items-center gap-1 mb-1 ${m.color}`}>{m.icon}<span className="text-sm text-gray-500">{m.label}</span></div>
                  <p className="text-base font-bold text-gray-900">
                    {m.value > 0 ? fmtNumber(m.value) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 점수 섹션 */}
          {content.grade !== 'processing' ? (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">성과 점수</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">퍼포먼스 점수</span>
                    <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교한 누적 조회수 수준" multiline>
                      <Info size={12} className="text-gray-400" aria-hidden="true" />
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{content.performanceScore}</p>
                  <div
                    className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label="퍼포먼스 점수"
                    aria-valuenow={content.performanceScore}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuetext={`${content.performanceScore}점 / 100점`}
                  >
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${content.performanceScore}%` }} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">모멘텀 점수</span>
                    <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교한 최근 조회수 증가 속도" multiline>
                      <Info size={12} className="text-gray-400" aria-hidden="true" />
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{content.momentumScore}</p>
                  <div
                    className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label="모멘텀 점수"
                    aria-valuenow={content.momentumScore}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuetext={`${content.momentumScore}점 / 100점`}
                  >
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${content.momentumScore}%` }} />
                  </div>
                </div>
              </div>

              {/* 점수 추이 차트 */}
              {scoreHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3 text-sm">
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
                    <ScoreHistoryChart
                      data={scoreHistory}
                      activeIndex={scoreIdx}
                      onActiveIndex={setScoreIdx}
                      isTouch={isTouch}
                    />
                  </ChartScrollContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
              점수 산정 중입니다. 게시 후 일정 시간이 지나면 자동으로 산출됩니다.
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
  data,
  activeIndex,
  onActiveIndex,
  isTouch,
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
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="[&_*]:pointer-events-none"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: Math.max(400, data.length * 44), height: H }}
      role="img"
      aria-label="퍼포먼스·모멘텀 점수 추이 차트"
      onMouseMove={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      /* PC hover 떠나도 activeIndex 유지 — 항상 1개 노출 정책 */
      onClick={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchStart={isTouch ? (e) => handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) } : undefined}
    >
      {[0, 0.5, 1].map(r => (
        <line key={r} x1={padL} y1={padT + plotH - r * plotH} x2={W - padR} y2={padT + plotH - r * plotH} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      <path d={line('performance')} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={line('momentum')} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = padL + i * stepX
        return <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize={11} fill="#9ca3af">{d.label}</text>
      })}

      {/* 인터랙티브 crosshair + 활성 도트 — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const x = padL + activeIndex * stepX
        const perfY = toY(d.performance)
        const momoY = toY(d.momentum)
        return (
          <g key="active">
            <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={x} cy={perfY} r={3.5} fill="#8b5cf6" stroke="white" strokeWidth={1.5} />
            <circle cx={x} cy={momoY} r={3.5} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
          </g>
        )
      })()}
    </svg>
  )
})
