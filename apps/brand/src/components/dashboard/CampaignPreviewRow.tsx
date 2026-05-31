/**
 * CampaignPreviewRow — 대시보드 v2 캠페인 미리보기 행
 *
 * 진행률 바 + D-day 칩 + 인플루언서 수 + 핵심 지표 (도달/결과/ROAS) 인라인.
 * hover: bg-gray-50 + cursor-pointer.
 */
import { memo } from 'react'
import { Users, ArrowRight } from 'lucide-react'
import { StatusBadge, fmtNumber, getDDay, getDDayBadgeStyle } from '@wellink/ui'

export interface CampaignPreviewRowProps {
  name: string
  status: 'active' | 'paused' | 'closed' | 'review'
  goal: { current: number; target: number; unit: string }
  influencers: { matched: number; reviewing: number }
  startDate: string
  endDate: string
  metrics: {
    reach: number
    results: number
    roas: number
  }
  onClick?: () => void
}

const CampaignPreviewRow = memo(function CampaignPreviewRow({
  name, status, goal, influencers, endDate, metrics, onClick,
}: CampaignPreviewRowProps) {
  const goalPct = Math.min(100, Math.max(0, Math.round((goal.current / Math.max(1, goal.target)) * 100)))
  const dday = getDDay(endDate)
  const isClickable = !!onClick

  return (
    <div
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() }
      } : undefined}
      className={`flex flex-col gap-2.5 p-3 @sm:p-4 rounded-xl border border-gray-100 bg-white transition-colors ${
        isClickable ? 'hover:bg-gray-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50' : ''
      }`}
    >
      {/* 1행 — 캠페인명 + 상태 + D-day */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[15px] font-semibold text-gray-900 break-keep">{name}</span>
          <StatusBadge status={status === 'active' ? '게재중' : status === 'paused' ? '일시중지' : status === 'closed' ? '종료' : '검토중'} dot={false} />
        </div>
        {status === 'active' && (
          <span
            className={`${getDDayBadgeStyle(dday.color, dday.pulse)} shrink-0 tabular-nums`}
            aria-label={`종료까지 ${dday.label}`}
          >
            {dday.label}
          </span>
        )}
      </div>

      {/* 2행 — 진행률 바 */}
      <div className="flex items-center gap-3">
        <span className="text-[15px] text-gray-600 whitespace-nowrap tabular-nums shrink-0">
          {goal.unit} <strong className="text-gray-900 font-semibold">{fmtNumber(goal.current)}</strong> / {fmtNumber(goal.target)}
        </span>
        <div
          className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-label={`${name} 진행률 ${goalPct}%`}
          aria-valuenow={goalPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-brand-green rounded-full transition-[width] duration-500"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <span className="text-[15px] font-bold text-brand-green-text tabular-nums shrink-0">{goalPct}%</span>
      </div>

      {/* 3행 — 인플루언서 + 핵심 지표 */}
      <div className="flex items-center justify-between gap-3 text-[15px] flex-wrap">
        <span className="flex items-center gap-1 text-gray-600">
          <Users size={12} aria-hidden="true" />
          <span className="tabular-nums">
            인플루언서 <strong className="text-gray-900">{influencers.matched + influencers.reviewing}</strong>명
          </span>
          {influencers.reviewing > 0 && (
            <span className="text-gray-400">(매칭 {influencers.matched} · 검토 {influencers.reviewing})</span>
          )}
        </span>
        <div className="flex items-center gap-3 text-gray-600 tabular-nums">
          <span>도달 <strong className="text-gray-900">{fmtNumber(metrics.reach)}</strong></span>
          <span>결과 <strong className="text-gray-900">{fmtNumber(metrics.results)}</strong></span>
          <span>ROAS <strong className="text-brand-green-text">{metrics.roas.toFixed(1)}x</strong></span>
          {isClickable && <ArrowRight size={12} className="text-gray-300" aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
})

export default CampaignPreviewRow
