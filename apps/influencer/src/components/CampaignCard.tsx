import { useState, useEffect, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Video, Package, Footprints, CheckCircle2 } from 'lucide-react'
import { PlatformBadge, SEMANTIC_COLORS, TIMER_MS, getDDay } from '@wellink/ui'
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

  const dday = getDDay(campaign.applyEnd)

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

  const rewardText = campaign.rewardAmount
    ? `${campaign.rewardAmount.toLocaleString('ko-KR')} 상당 혜택`
    : campaign.reward ?? '혜택 정보 준비 중'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${campaign.brand} ${campaign.name} 상세 보기`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
      onClick={handleCardActivate}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardActivate() } }}
    >
      {/* 썸네일 — 원본 CampaignList.tsx L237: aspect-video */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={getThumbnailFromPool(campaign.id)}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.src = getPlaceholderDataUri(campaign.id, campaign.brand) }}
        />
        {showLike && (
          <button
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
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
        {/* D-day + 타입 배지 — 원본 CampaignList.tsx L271-292 */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`flex items-center gap-1 text-xs font-bold whitespace-nowrap ${dday.color}`}>
            <Video size={12} aria-hidden="true" />
            {dday.label}
          </span>
          {campaign.type === 'delivery'
            ? <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap"><Package size={10} aria-hidden="true" />배송형</span>
            : campaign.type
              ? <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap"><Footprints size={10} aria-hidden="true" />방문형</span>
              : null
          }
          {applied && (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-green-bg text-brand-green-text whitespace-nowrap">
              <CheckCircle2 size={11} aria-hidden="true" />신청완료
            </span>
          )}
        </div>

        {/* 제목 — 원본 CampaignList.tsx L296-298 */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 break-keep leading-snug mb-1">{campaign.name}</h3>

        {/* 리워드 — 원본 CampaignList.tsx L301-305: "N 상당 혜택" 텍스트 */}
        <p className="text-sm text-gray-500 truncate mb-3">{rewardText}</p>

        {/* 하단: 모집인원 + 플랫폼 — 원본 CampaignList.tsx L308-322 */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-500 whitespace-nowrap">모집 인원: {campaign.headcount.toLocaleString('ko-KR')}</span>
          <PlatformBadge platform={campaign.channel} className="text-xs py-0 px-1.5" />
        </div>
      </div>
    </div>
  )
})

export default CampaignCard
