import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Calendar } from 'lucide-react'
import { StatusBadge, PlatformBadge, fmtDate } from '@wellink/ui'
import type { Campaign } from '../data/campaigns'

// 카드 이미지 영역 파스텔 배경색 — 카테고리별
const categoryBg: Record<string, string> = {
  '뷰티': '#fce7f3',
  '스포츠': '#e0f2fe',
  '푸드': '#fef9c3',
  '라이프스타일': '#f0fce8',
  '건강': '#d1fae5',
  '기타': '#f3f4f6',
}

interface CampaignCardProps {
  campaign: Campaign
  liked?: boolean
  onToggleLike?: (id: number) => void
  showLike?: boolean
}

export default function CampaignCard({ campaign, liked = false, onToggleLike, showLike = true }: CampaignCardProps) {
  const navigate = useNavigate()
  const [heartAnim, setHeartAnim] = useState(false)
  const bg = categoryBg[campaign.category] ?? '#f3f4f6'
  const isUrgent = campaign.status === '마감임박'

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 300)
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
      <div
        className="h-40 flex items-center justify-center text-5xl relative"
        style={{ backgroundColor: bg }}
      >
        {campaign.image}
        {showLike && (
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-150"
            onClick={handleLike}
            aria-label={liked ? '관심 해제' : '관심 등록'}
          >
            <Heart
              size={16}
              fill={liked ? '#ef4444' : 'none'}
              color={liked ? '#ef4444' : '#9ca3af'}
              style={{ transform: heartAnim ? 'scale(1.3)' : 'scale(1)', transition: 'transform 0.15s ease-out' }}
            />
          </button>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-0.5 truncate">{campaign.brand}</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">{campaign.name}</p>

        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <StatusBadge status={campaign.status} />
          <PlatformBadge platform={campaign.channel} />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Calendar size={12} />
          <span>신청 마감 <span className="font-medium text-gray-600">{fmtDate(campaign.applyEnd)}</span></span>
        </div>

        <button
          className="w-full py-2 rounded-xl text-sm font-medium text-brand-green-text border border-brand-green/30 bg-brand-green/5 hover:bg-brand-green/10 transition-all duration-150"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/campaigns/${campaign.id}`)
          }}
        >
          신청하기
        </button>
      </div>
    </div>
  )
}
