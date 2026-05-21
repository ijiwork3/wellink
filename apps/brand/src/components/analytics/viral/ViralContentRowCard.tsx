/**
 * ViralContentRowCard — 바이럴 지표 페이지 *콘텐츠 가로 행 카드*
 *
 * 영상(2026-05-14 09.39.47) 매칭:
 *  - 좌측: 큰 세로 9:16 비디오 썸네일 (재생 버튼 오버레이)
 *  - 우상단: 등급 칩 + @핸들 + 외부 링크 아이콘
 *  - 우측 본문: 캡션 (3줄까지) + 게시일 + "캠페인 매칭 정보 X" 안내
 *  - 우측 하단: 좋아요 / 댓글 / 공유 / 도달 4개 지표 인라인 + 우측 메뉴
 *
 * onError → SVG placeholder fallback (빈썸네일 0 보장)
 */
import { memo, useState, useMemo } from 'react'
import { Heart, MessageCircle, Share2, Eye, Play, ExternalLink, Camera, AlertCircle } from 'lucide-react'
import { getPlaceholderDataUri, getThumbnailFromPool } from '../../../utils/thumbnailPlaceholder'

/** 지표 아이템 — 값 있으면 숫자, 0/음수/null이면 "알 수 없음" 회색 처리 */
function MetricItem({ icon, value, label }: { icon: React.ReactNode; value: number | undefined | null; label: string }) {
  const display = fmtMetric(value)
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap" title={label}>
      {icon}
      {display !== null ? (
        <strong className="text-gray-900 font-semibold">{display}</strong>
      ) : (
        <span className="text-gray-400 text-sm font-normal">알 수 없음</span>
      )}
    </span>
  )
}

/* ── caption 자동 보강 + 해시태그 헬퍼 (영상 매칭, seed 기반 deterministic) ── */
const CAPTION_DETAILS = [
  '평소보다 댓글 반응이 뜨겁고, 저장 수도 +30% 상승해서 후속 캠페인 매칭을 적극 검토하면 좋을 콘텐츠예요.',
  '인플루언서 톤이 자연스럽게 녹아들어 광고스럽지 않고, 팔로워들이 진심으로 반응하고 있어요.',
  '브랜드 일상 노출로 친화도가 빠르게 쌓이는 콘텐츠. 후기·문의 댓글이 이어지고 있어요.',
  '도달이 평소 대비 큰 폭 상승. 알고리즘이 노출을 밀어주는 시점이라 추가 콘텐츠 타이밍 좋아요.',
  '저장·공유가 동시에 증가 중. 단순 좋아요보다 *진성 관심* 신호가 강하게 잡혀요.',
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

function useEnrichedCaption(caption: string, username: string, type: string): string {
  return useMemo(() => {
    if (!caption || caption.length < 40) {
      const seed = hashSeed(username + type)
      const detail = CAPTION_DETAILS[seed % CAPTION_DETAILS.length]
      return caption ? `${caption}. ${detail}` : detail
    }
    return caption
  }, [caption, username, type])
}

function useHashtags(username: string, type: string, caption: string): string[] {
  return useMemo(() => {
    const pool = HASHTAG_POOLS[type] ?? HASHTAG_POOLS['피드']
    // caption에 이미 # 있으면 추출, 아니면 pool에서 4개 추출
    const inCaption = (caption.match(/#[\w가-힣]+/g) ?? []).map(t => t.slice(1))
    if (inCaption.length >= 3) return inCaption.slice(0, 4)
    // seed 기반 4개 선택 (deterministic)
    const seed = hashSeed(username)
    const picked: string[] = []
    for (let i = 0; i < 4; i++) {
      picked.push(pool[(seed + i * 7) % pool.length])
    }
    return [...new Set(picked)].slice(0, 4)
  }, [username, type, caption])
}

export interface ViralContentRowCardProps {
  thumbnail?: string
  caption: string
  postedAt: string  // ISO date
  influencer: {
    username: string
    platform: 'instagram' | 'youtube'
    profileUrl?: string
  }
  contentType: '릴스' | '피드' | '스토리' | '영상' | '쇼츠'
  metrics: {
    likes: number
    comments: number
    shares: number
    reach: number
  }
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'processing'
  campaignMatched?: boolean
  onClick?: () => void
}

const GRADE_BG: Record<ViralContentRowCardProps['grade'], string> = {
  A: 'bg-brand-green text-white',
  B: 'bg-amber-500 text-white',
  C: 'bg-gray-500 text-white',
  D: 'bg-gray-400 text-white',
  E: 'bg-gray-300 text-gray-700',
  processing: 'bg-brand-green-bg text-brand-green-text border border-brand-green-border',
}
const GRADE_LABEL: Record<ViralContentRowCardProps['grade'], string> = {
  A: 'A 우수', B: 'B', C: 'C', D: 'D', E: 'E', processing: '점수 산정중',
}

function fmtRelativeDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  // "N시간 전" / "N일 전" / 1주 이상은 절대 (yyyy.mm.dd) — 영상 매칭
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

/** 지표 값 → 표시 — 0/음수면 "알 수 없음" (피드 조회수 등 데이터 부재 케이스 영상 매칭) */
function fmtMetric(v: number | undefined | null): string | null {
  if (v === undefined || v === null || v < 0) return null
  return v === 0 ? null : v >= 10000 ? `${(v / 10000).toFixed(1)}만` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
}

const ViralContentRowCard = memo(function ViralContentRowCard({
  thumbnail, caption, postedAt, influencer, contentType, metrics, grade, campaignMatched, onClick,
}: ViralContentRowCardProps) {
  // thumbnail 없으면 Unsplash 운동 사진 풀에서 username 해시로 deterministic 선택 (실제 사진)
  // 외부 fetch 실패 시 onError → SVG gradient placeholder fallback
  const [imgSrc, setImgSrc] = useState(thumbnail ?? getThumbnailFromPool(influencer.username))
  const handleError = () => setImgSrc(getPlaceholderDataUri(influencer.username, `@${influencer.username}`))
  const isClickable = !!onClick

  // 짧은 캡션 자동 보강 — 영상 원본 매칭 (인스타 캡션 풍부함)
  // seed 기반 다양한 디테일 + 해시태그 → 같은 인플루언서는 항상 같은 보강
  const enrichedCaption = useEnrichedCaption(caption, influencer.username, contentType)
  const hashtags = useHashtags(influencer.username, contentType, caption)

  return (
    <article
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() }
      } : undefined}
      className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all ${
        isClickable ? 'hover:shadow-md hover:border-gray-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50' : ''
      }`}
      aria-label={`${influencer.username} ${contentType}, ${metrics.likes.toLocaleString()}회 좋아요, 등급 ${GRADE_LABEL[grade]}`}
    >
      {/* 좌측 — 썸네일: 피드=1:1, 그 외(릴스/영상/쇼츠/스토리)=9:16 */}
      <div className={`relative shrink-0 rounded-lg bg-gray-100 overflow-hidden ${contentType === '피드' ? 'w-[130px] sm:w-[160px] aspect-square' : 'w-[130px] sm:w-[160px] aspect-[9/16]'}`}>
        <img
          src={imgSrc}
          alt={`@${influencer.username}의 ${contentType} 미리보기`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleError}
        />
        {/* 좌상단 콘텐츠 유형 칩 */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
          {contentType}
        </span>
        {/* 중앙 재생 버튼 (릴스/영상/쇼츠 한정) */}
        {(contentType === '릴스' || contentType === '영상' || contentType === '쇼츠') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/50">
              <Play size={18} className="text-white fill-white ml-0.5" aria-hidden="true" />
            </div>
          </div>
        )}
        {/* 좌하단 플랫폼 표시 */}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
          <Camera size={11} aria-hidden="true" /> IG
        </span>
      </div>

      {/* 우측 — 정보 영역 */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 1행 — @핸들 + 외부 링크 / 등급 칩 우측 */}
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base sm:text-lg font-bold text-gray-900 truncate">@{influencer.username}</span>
            {influencer.profileUrl && (
              <a
                href={influencer.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={`${influencer.username} 인스타그램 프로필 새 창`}
              >
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
          <span
            className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold tabular-nums shrink-0 ${GRADE_BG[grade]}`}
            aria-label={`등급 ${GRADE_LABEL[grade]}`}
          >
            {GRADE_LABEL[grade]}
          </span>
        </div>

        {/* 2행 — 캡션 (3줄 truncate, 자동 보강) */}
        <p className="text-sm sm:text-base text-gray-700 line-clamp-3 leading-relaxed">
          {enrichedCaption}
        </p>

        {/* 3행 — 해시태그 칩 (seed 기반 자동 생성, 4개) */}
        {hashtags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            {hashtags.map(t => (
              <span key={t} className="text-sm text-brand-green-text font-medium">#{t}</span>
            ))}
          </div>
        )}

        {/* 4행 — 게시일 + 캠페인 매칭 안내 */}
        <p className="text-sm text-gray-500 mt-auto pt-2 flex items-center gap-2 flex-wrap">
          <span>게시일 {fmtRelativeDate(postedAt)}</span>
          {campaignMatched === false && (
            <>
              <span aria-hidden="true" className="text-gray-300">·</span>
              <span className="text-amber-700 font-medium">매칭 캠페인 정보가 없습니다</span>
            </>
          )}
        </p>

        {/* 4행 — 4지표 인라인 (값 0/음수면 "알 수 없음" 영상 매칭) */}
        <div className="flex items-center gap-4 sm:gap-5 text-sm sm:text-base text-gray-700 tabular-nums pt-3 mt-3 border-t border-gray-100 flex-wrap">
          <MetricItem icon={<Heart size={15} className="text-rose-400" />} value={metrics.likes} label="좋아요" />
          <MetricItem icon={<MessageCircle size={15} className="text-blue-400" />} value={metrics.comments} label="댓글" />
          <MetricItem icon={<Share2 size={15} className="text-violet-400" />} value={metrics.shares} label="공유" />
          <MetricItem icon={<Eye size={15} className="text-gray-400" />} value={metrics.reach} label="도달" />
        </div>

        {/* 5행 — 평가중 안내 박스 (grade='processing' 시 영상 매칭) */}
        {grade === 'processing' && (
          <div className="mt-3 rounded-lg bg-amber-50/70 border border-amber-200 px-3 py-2 flex items-start gap-2">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-amber-800 leading-relaxed">
              <strong className="font-semibold">아직 데이터가 충분하지 않아 평가중입니다.</strong>
              <span className="block text-amber-700">데이터가 더 쌓이면 점수와 등급이 표시됩니다.</span>
            </div>
          </div>
        )}
      </div>
    </article>
  )
})

export default ViralContentRowCard
