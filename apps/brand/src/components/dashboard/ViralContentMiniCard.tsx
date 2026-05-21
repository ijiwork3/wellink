/**
 * ViralContentMiniCard — 대시보드 v2 멘션 콘텐츠 카드 (영상 매칭 v2)
 *
 * 영상(2026-05-14 09.39.47) 매칭:
 *  - 세로 9:16 비디오 비율 썸네일 (Instagram 릴스/Reels 표준)
 *  - 등급 칩 *우상단* (영상 frame #2-3 매칭)
 *  - 캡션 + 인플루언서 + 좋아요·댓글·조회수 인라인 (3개 지표)
 *  - hover: 썸네일 살짝 zoom + 카드 shadow ↑
 *
 * 빈 썸네일 방지: thumbnail 미제공 또는 onError 시 SVG gradient placeholder fallback.
 */
import { memo, useState } from 'react'
import { Heart, Eye, MessageCircle, Camera } from 'lucide-react'
import { getPlaceholderDataUri, getThumbnailFromPool } from '../../utils/thumbnailPlaceholder'

/** 미니 카드 전용 압축 포맷 — 160px 너비 3개 지표 동시 표기 */
function fmtCompact(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}만`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export interface ViralContentMiniCardProps {
  thumbnail?: string  // URL — 없으면 placeholder 자동
  caption: string
  contentType?: 'reels' | 'feed'  // 릴스=9:16, 피드 이미지=1:1 (default: 'reels')
  influencer: {
    username: string
    platform: 'instagram' | 'youtube'
  }
  metrics: {
    likes: number
    reach: number
    comments?: number
    viralScore?: number
  }
  grade: 'A' | 'B' | 'C' | 'D' | 'processing'
  onClick?: () => void
}

const GRADE_BG: Record<ViralContentMiniCardProps['grade'], string> = {
  A: 'bg-brand-green text-white',
  B: 'bg-amber-500 text-white',
  C: 'bg-gray-500 text-white',
  D: 'bg-gray-400 text-white',
  processing: 'bg-blue-500 text-white',
}
const GRADE_LABEL: Record<ViralContentMiniCardProps['grade'], string> = {
  A: 'A', B: 'B', C: 'C', D: 'D', processing: '...',
}

const ViralContentMiniCard = memo(function ViralContentMiniCard({
  thumbnail, caption, contentType = 'reels', influencer, metrics, grade, onClick,
}: ViralContentMiniCardProps) {
  // thumbnail 없으면 Unsplash 운동 사진 풀 자동 선택. 외부 fetch 실패 시 SVG placeholder
  const [imgSrc, setImgSrc] = useState(thumbnail ?? getThumbnailFromPool(influencer.username))
  const handleError = () => setImgSrc(getPlaceholderDataUri(influencer.username, `@${influencer.username}`))

  const isClickable = !!onClick

  return (
    <article
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() }
      } : undefined}
      className={`group flex flex-col w-[160px] sm:w-[180px] shrink-0 rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100 transition-all duration-200 ${
        isClickable ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50' : ''
      }`}
      aria-label={`${influencer.username} 콘텐츠, ${metrics.likes.toLocaleString()} 좋아요`}
    >
      {/* 썸네일 — 9:16보다 짧은 3:4 비율, object-cover 크롭 */}
      <div className="relative bg-gray-100 overflow-hidden aspect-[3/4]">
        <img
          src={imgSrc}
          alt={`@${influencer.username}의 콘텐츠 미리보기`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={handleError}
        />
        {/* 등급 칩 — 우상단 */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold tabular-nums shadow-sm ${GRADE_BG[grade]}`}
          aria-label={`등급 ${GRADE_LABEL[grade]}`}
        >
          {GRADE_LABEL[grade]}
        </span>
        {/* 좌하단 콘텐츠 타입 배지 */}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-xs font-medium">
          <Camera size={11} aria-hidden="true" />
          {contentType === 'feed' ? '피드' : '릴스'}
        </span>
      </div>

      {/* 본문 — @핸들 + 캡션 + 지표 */}
      <div className="p-3 flex flex-col gap-2">
        <div className="text-base font-bold text-gray-900 truncate">@{influencer.username}</div>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.6em]">{caption}</p>
        <div className="flex items-center justify-between text-sm text-gray-700 tabular-nums pt-2 border-t border-gray-100 break-keep">
          <span className="flex items-center gap-1 shrink-0 whitespace-nowrap" title="좋아요">
            <Heart size={13} className="text-rose-400" aria-hidden="true" />
            <strong className="text-gray-900 font-semibold whitespace-nowrap">{fmtCompact(metrics.likes)}</strong>
          </span>
          <span className="flex items-center gap-1 shrink-0 whitespace-nowrap" title="댓글">
            <MessageCircle size={13} className="text-blue-400" aria-hidden="true" />
            <strong className="text-gray-900 font-semibold whitespace-nowrap">{fmtCompact(metrics.comments ?? 0)}</strong>
          </span>
          <span className="flex items-center gap-1 shrink-0 whitespace-nowrap" title="도달">
            <Eye size={13} className="text-gray-400" aria-hidden="true" />
            <strong className="text-gray-900 font-semibold whitespace-nowrap">{fmtCompact(metrics.reach)}</strong>
          </span>
        </div>
      </div>
    </article>
  )
})

export default ViralContentMiniCard
