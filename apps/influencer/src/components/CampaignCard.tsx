import { useState, useEffect, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { SEMANTIC_COLORS, TIMER_MS, getDDay } from '@wellink/ui'
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
  const isEnded = dday.label.startsWith('D+')
  const isToday = dday.label === 'D-Day'
  const ddayDiff = isEnded || isToday ? null : parseInt(dday.label.replace('D-', ''), 10)
  const ddayText = isEnded
    ? '캠페인 종료'
    : isToday
      ? '오늘 마감'
      : `마감 ${ddayDiff}일 전`
  const ddayBgClass = isEnded
    ? 'bg-gray-100 text-gray-400'                                          // 종료 — 회색
    : dday.color === 'text-red-500'
      ? 'bg-red-100 text-red-600 border border-red-200'                    // D-3 이하 — 빨강
      : dday.color === 'text-orange-400'
        ? 'bg-amber-100 text-amber-600 border border-amber-200'            // D-4~7 — 노랑
        : 'bg-green-100 text-green-700 border border-green-200'            // D-8+ — 초록

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

  const benefitTags = [
    (campaign.rewardAmount ?? 0) > 0 ? '제품 협찬' : null,
    (campaign.activityFee ?? 0) > 0 ? '활동비' : null,
    (campaign.downloadPrice ?? 0) > 0 ? '콘텐츠 수익' : null,
  ].filter(Boolean)

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
        {applied && (
          <span className="absolute top-3 left-3 z-10 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm whitespace-nowrap">신청완료</span>
        )}
        {showLike && (
          <button
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            onClick={handleLike}
            aria-pressed={liked}
            aria-label={liked ? '북마크 해제' : '북마크'}
          >
            <Heart
              size={22}
              fill={liked ? SEMANTIC_COLORS.heart : 'none'}
              color={liked ? SEMANTIC_COLORS.heart : 'rgba(255,255,255,0.85)'}
              strokeWidth={liked ? 0 : 2}
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))', transform: heartAnim ? 'scale(1.35)' : 'scale(1)', transition: 'transform 0.15s ease-out' }}
            />
          </button>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        {/* D-day + 타입 배지 — 원본 CampaignList.tsx L271-292 */}
        {/* 1행: 캠페인 메타 */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ddayBgClass}`}>
            {ddayText}
          </span>
          {campaign.type === 'delivery'
            ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 whitespace-nowrap">배송형</span>
            : campaign.type
              ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 whitespace-nowrap">방문형</span>
              : null
          }
        </div>

        {/* 제목 — 원본 CampaignList.tsx L296-298 */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 break-keep leading-snug mb-1">{campaign.name}</h3>

        {/* 혜택 유형 + 리워드 — benefitTags는 텍스트로, rewardText는 금액 */}
        <div className="mb-3">
          {benefitTags.length > 0 && (
            <p className="text-xs text-gray-400 mb-0.5">{(benefitTags as string[]).join(' · ')}</p>
          )}
          <p className="text-sm text-gray-500 truncate">{rewardText}</p>
        </div>

        {/* 하단: 모집인원 + 플랫폼 — 원본 CampaignList.tsx L308-322 */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-500 whitespace-nowrap">모집 인원: {campaign.headcount.toLocaleString('ko-KR')}</span>
          <span className="text-xs text-gray-400 whitespace-nowrap">{campaign.channel}</span>
        </div>
      </div>
    </div>
  )
})

export default CampaignCard
