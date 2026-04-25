import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Users, Gift } from 'lucide-react'
import { StatusBadge, PlatformBadge, fmtDate, TIMER_MS } from '@wellink/ui'
import type { Campaign } from '../services/mock/campaigns'

interface CampaignCardProps {
  campaign: Campaign
  liked?: boolean
  onToggleLike?: (id: number) => void
  showLike?: boolean
}

const CampaignCard = memo(function CampaignCard({ campaign, liked = false, onToggleLike, showLike = true }: CampaignCardProps) {
  const navigate = useNavigate()
  const [heartAnim, setHeartAnim] = useState(false)
  const isUrgent = campaign.status === '마감임박'
  const progressPct = Math.min(100, Math.round((campaign.applied / (campaign.headcount || 1)) * 100))

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), TIMER_MS.HEART_ANIMATION)
    onToggleLike?.(campaign.id)
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
    >
      {/* 마감임박 상단 띠 */}
      {isUrgent && (
        <div className="bg-orange-500 text-white text-[11px] font-semibold text-center py-1 tracking-wide">
          마감 임박
        </div>
      )}

      {/* 이미지 영역 */}
      <div className="h-36 flex items-center justify-center text-5xl relative bg-gray-50">
        <span role="img" aria-hidden="true">{campaign.image}</span>
        {showLike && (
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-150"
            onClick={handleLike}
            aria-label={liked ? '북마크 해제' : '북마크'}
          >
            <Heart
              size={15}
              fill={liked ? '#ef4444' : 'none'}
              color={liked ? '#ef4444' : '#9ca3af'}
              style={{ transform: heartAnim ? 'scale(1.35)' : 'scale(1)', transition: 'transform 0.15s ease-out' }}
            />
          </button>
        )}
        {/* 모집률 바 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className={`h-full ${progressPct >= 80 ? 'bg-orange-400' : 'bg-brand-green'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <StatusBadge status={campaign.status} />
          <PlatformBadge platform={campaign.channel} />
        </div>

        <p className="text-xs text-gray-400 truncate">{campaign.brand}</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mt-0.5 mb-3">{campaign.name}</p>

        {/* 리워드 */}
        {campaign.reward && (
          <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-brand-green/5 border border-brand-green/10">
            <Gift size={12} className="text-brand-green shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate">{campaign.reward}</span>
          </div>
        )}

        {/* 모집 현황 + 마감일 */}
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {campaign.applied}/{campaign.headcount}명 모집
          </span>
          <span>마감 {fmtDate(campaign.applyEnd)}</span>
        </div>
      </div>
    </div>
  )
})

export default CampaignCard
