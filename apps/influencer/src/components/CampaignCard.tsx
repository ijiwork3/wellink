import { useState, useEffect, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Users, Gift, CheckCircle2 } from 'lucide-react'
import { StatusBadge, PlatformBadge, TIMER_MS, getDDay, getDDayBadgeStyle, PROGRESS_THRESHOLD, SEMANTIC_COLORS } from '@wellink/ui'
import type { Campaign } from '../services/mock/campaigns'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'

interface CampaignCardProps {
  campaign: Campaign
  liked?: boolean
  applied?: boolean
  onToggleLike?: (id: number) => void
  showLike?: boolean
  onCardClick?: (campaign: Campaign) => void
}

const CampaignCard = memo(function CampaignCard({ campaign, liked = false, applied = false, onToggleLike, showLike = true, onCardClick }: CampaignCardProps) {
  const navigate = useNavigate()
  const [heartAnim, setHeartAnim] = useState(false)
  const heartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (heartTimerRef.current) clearTimeout(heartTimerRef.current)
  }, [])
  const isUrgent = campaign.status === '마감임박'
  const progressPct = Math.min(100, Math.round((campaign.applied / (campaign.headcount || 1)) * 100))
  const dday = getDDay(campaign.applyEnd)
  const progressFull = progressPct >= PROGRESS_THRESHOLD.warning

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHeartAnim(true)
    if (heartTimerRef.current) clearTimeout(heartTimerRef.current)
    heartTimerRef.current = setTimeout(() => setHeartAnim(false), TIMER_MS.HEART_ANIMATION)
    onToggleLike?.(campaign.id)
  }

  const handleCardActivate = () => {
    if (onCardClick) onCardClick(campaign)
    else navigate(`/campaigns/${campaign.id}`)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${campaign.brand} ${campaign.name} 상세 보기`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
      onClick={handleCardActivate}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardActivate() } }}
    >
      {/* 마감임박 상단 띠 */}
      {isUrgent && (
        <div className="bg-orange-500 text-white text-xs font-semibold text-center py-1 tracking-wide whitespace-nowrap">
          마감 임박
        </div>
      )}

      {/* 이미지 영역 — Unsplash 운동 사진 풀(seed=campaign.id로 deterministic). 실패 시 SVG 그라데이션 fallback. */}
      <div className="h-36 relative bg-gray-100 overflow-hidden">
        <img
          src={getThumbnailFromPool(campaign.id)}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(campaign.id, campaign.brand) }}
        />
        {showLike && (
          <button
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            onClick={handleLike}
            aria-pressed={liked}
            aria-label={liked ? '북마크 해제' : '북마크'}
          >
            <Heart
              size={17}
              fill={liked ? SEMANTIC_COLORS.heart : 'none'}
              color={liked ? SEMANTIC_COLORS.heart : SEMANTIC_COLORS.heartInactive}
              style={{ transform: heartAnim ? 'scale(1.35)' : 'scale(1)', transition: 'transform 0.15s ease-out' }}
            />
          </button>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <StatusBadge status={campaign.status} />
          <PlatformBadge platform={campaign.channel} />
          {applied && (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-green-bg text-brand-green-text whitespace-nowrap">
              <CheckCircle2 size={11} aria-hidden="true" />신청완료
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 truncate">{campaign.brand}</p>
        <p className="text-base font-bold text-gray-900 leading-snug line-clamp-2 break-keep mt-0.5 mb-3">{campaign.name}</p>

        {/* 리워드 */}
        {campaign.reward && (
          <div className="flex items-start gap-1.5 mb-3 px-3 py-2 rounded-lg bg-brand-green-bg border border-brand-green-border">
            <Gift size={14} className="text-brand-green-text shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-800 break-keep line-clamp-2 min-w-0 flex-1">{campaign.reward}</span>
          </div>
        )}

        {/* 모집 현황 + 진행률 바 + D-day — 캐러셀 X, 명시적 progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1 text-gray-700 whitespace-nowrap tabular-nums min-w-0 truncate font-medium">
              <Users size={13} aria-hidden="true" className="shrink-0 text-gray-400" />
              <span className="truncate">{campaign.applied.toLocaleString('ko-KR')}/{campaign.headcount.toLocaleString('ko-KR')}명 모집</span>
            </span>
            <span className={`${getDDayBadgeStyle(dday.color, dday.pulse)} shrink-0 whitespace-nowrap tabular-nums`}>{dday.label}</span>
          </div>
          <div
            className="h-2 bg-gray-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-label={`모집률 ${progressPct}%`}
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${progressFull ? 'bg-orange-400' : 'bg-brand-green'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export default CampaignCard
