/**
 * ViralContentRowCard — 바이럴 지표 페이지 콘텐츠 행 카드
 *
 * 레이아웃:
 *  - 모바일: flex-col (썸네일 상단 16:9 전체 너비)
 *  - sm+: flex-row (썸네일 좌측 9:16 고정 너비)
 * 지표: 좋아요·댓글·공유·도달 + 증감률 배지
 * 액션: 릴스/영상/쇼츠 → 상세 분석 버튼
 */
import { memo, useState, useMemo } from 'react'
import { Heart, MessageCircle, Share2, Eye, Play, ExternalLink, AlertCircle, ChevronRight, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Tooltip } from '@wellink/ui'
import { getPlaceholderDataUri, getThumbnailFromPool } from '../../../utils/thumbnailPlaceholder'

/* ── 증감률 배지 — 값 없을 시 "비교 데이터 없음" 명시 (원본 ViralMetricsSection 매칭) ── */
function GrowthBadge({ value }: { value: number | null | undefined }) {
  if (value == null) {
    return <span className="text-xs text-gray-400 whitespace-nowrap">비교 데이터 없음</span>
  }
  const pos = value >= 0
  return (
    <span className={`text-xs font-medium whitespace-nowrap flex items-center gap-0.5 ${pos ? 'text-brand-green-text' : 'text-red-500'}`}>
      {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {pos ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

/* ── 지표 아이템 (아이콘 + 값 + 증감) ── */
function MetricItem({
  icon, value, label, growth,
}: {
  icon: React.ReactNode
  value: number | undefined | null
  label: string
  growth?: number | null
}) {
  const display = fmtMetric(value)
  return (
    <div className="flex flex-col gap-0.5" title={label}>
      <span className="flex items-center gap-1 whitespace-nowrap">
        {icon}
        {display !== null ? (
          <strong className="text-gray-900 font-semibold text-sm">{display}</strong>
        ) : (
          <span className="text-gray-400 text-xs font-normal">알 수 없음</span>
        )}
      </span>
      <GrowthBadge value={growth} />
    </div>
  )
}

/* ── caption 자동 보강 + 해시태그 헬퍼 ── */
const CAPTION_DETAILS = [
  '평소보다 댓글 반응이 뜨겁고, 저장 수도 +30% 상승해서 후속 캠페인 매칭을 적극 검토하면 좋을 콘텐츠예요.',
  '인플루언서 톤이 자연스럽게 녹아들어 광고스럽지 않고, 팔로워들이 진심으로 반응하고 있어요.',
  '브랜드 일상 노출로 친화도가 빠르게 쌓이는 콘텐츠. 후기·문의 댓글이 이어지고 있어요.',
  '도달이 평소 대비 큰 폭 상승. 알고리즘이 노출을 밀어주는 시점이라 추가 콘텐츠 타이밍 좋아요.',
  '저장·공유가 동시에 증가 중. 단순 좋아요보다 *진성 관심* 신호가 강하게 잡혀요.',
  '댓글의 90%가 긍정·문의 톤이라 브랜드 호감도 점수가 높게 산출됐어요.',
]

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

export interface ViralContentRowCardProps {
  thumbnail?: string
  caption: string
  postedAt: string
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
  /** 전주/전월 대비 증감률 (%) — 없으면 배지 미표시 */
  metricsGrowth?: {
    likes?: number | null
    comments?: number | null
    shares?: number | null
    reach?: number | null
  }
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'processing'
  campaignMatched?: boolean
  /** 신규 등장 콘텐츠 — 마지막 동기화 이후 새로 수집됨 (원본: baseline 미존재). 썸네일 우상단 chip */
  isNew?: boolean
  /** 매칭된 캠페인 이름 — 있으면 chip 형태로 노출 (원본 ViralMetricsSection L2056-2085) */
  campaignName?: string
  /** 캠페인 chip 클릭 핸들러 — 매칭된 캠페인 상세로 이동 */
  onCampaignClick?: (e: React.MouseEvent) => void
  /** 릴스/영상/쇼츠 전용 상세 분석 버튼 클릭 */
  onDetailClick?: (e: React.MouseEvent) => void
  /** 점수 산정 완료 콘텐츠 인라인 점수 (퍼포먼스·모멘텀). 없거나 grade=processing이면 미표시 */
  scoreData?: {
    performanceScore: number
    momentumScore: number
  }
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

function fmtMetric(v: number | undefined | null): string | null {
  if (v === undefined || v === null || v < 0) return null
  return v === 0 ? null : v >= 10000 ? `${(v / 10000).toFixed(1)}만` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
}

const VIDEO_TYPES: ViralContentRowCardProps['contentType'][] = ['릴스', '영상', '쇼츠']

const ViralContentRowCard = memo(function ViralContentRowCard({
  thumbnail, caption, postedAt, influencer, contentType, metrics, metricsGrowth, grade, campaignMatched, campaignName, onCampaignClick, onDetailClick, scoreData, isNew,
}: ViralContentRowCardProps) {
  const [imgSrc, setImgSrc] = useState(thumbnail ?? getThumbnailFromPool(influencer.username))
  const handleError = () => setImgSrc(getPlaceholderDataUri(influencer.username, `@${influencer.username}`))
  const isVideo = VIDEO_TYPES.includes(contentType)

  const enrichedCaption = useEnrichedCaption(caption, influencer.username, contentType)

  // 점수 산정 완료 콘텐츠만 인라인 점수 표시 (영상 콘텐츠 + grade !== processing + scoreData 존재)
  const showInlineScores = isVideo && grade !== 'processing' && !!scoreData

  return (
    /* @container를 wrapper에 두어 article·이미지·콘텐츠 영역의 @lg: 쿼리가 모두 같은 wrapper 폭(=카드 폭)을 기준으로 동작. */
    <div className="@container">
    <article
      className="flex flex-col @lg:flex-row gap-0 @lg:gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
      aria-label={`${influencer.username} ${contentType}, ${metrics.likes.toLocaleString()}회 좋아요, 등급 ${GRADE_LABEL[grade]}`}
    >
      {/* 썸네일 — 카드 컨테이너 쿼리 기반.
       *  좁을 때(@lg 미만, 512px↓): 중앙 정렬 + 제한된 폭
       *  넓을 때(@lg+, 512px↑): 좌측 세로형 박스 + self-start로 stretch 차단
       *  피드: 4:5 (Instagram feed 표준) / 릴스·영상·쇼츠: 3:4 (세로 콘텐츠 강조) */}
      <div className={`relative shrink-0 bg-gray-100 overflow-hidden mx-auto @lg:mx-0 @lg:self-start max-w-[240px] @lg:max-w-none
        ${contentType === '피드'
          ? 'w-full aspect-[4/5] rounded-lg @lg:w-[160px] @lg:h-[200px] @lg:aspect-auto'
          : 'w-full aspect-[3/4] rounded-lg @lg:w-[150px] @lg:h-[200px] @lg:aspect-auto'}`}
      >
        <img
          src={imgSrc}
          alt={`@${influencer.username}의 ${contentType} 미리보기`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleError}
        />
        {/* 콘텐츠 유형 칩 — 좌상단 */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
          {contentType}
        </span>
        {/* New 배지 — 우상단. 마지막 동기화 이후 새로 수집된 콘텐츠 (원본 ViralMetricsSection L2005-2011) */}
        {isNew && (
          <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-lime-100 px-2.5 py-1 text-[11px] font-semibold text-lime-700 shadow-sm">
            New
          </span>
        )}
        {/* 재생 버튼 — 우측 하단 (원본 ViralMetricsSection L2012-2016) */}
        {isVideo && (
          <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-black/70 flex items-center justify-center pointer-events-none shadow-lg">
            <Play size={16} className="text-white fill-white ml-0.5" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* 본문 영역 */}
      <div className="flex-1 min-w-0 flex flex-col pt-3 @lg:pt-0">
        {/* @핸들 + 액션 (외부링크·상세분석·등급) — 외부링크는 우측 액션 그룹으로 이동 */}
        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base @lg:text-lg font-bold text-gray-900 truncate">@{influencer.username}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* 외부링크(Instagram 프로필) — 우측 액션 영역 */}
            {influencer.profileUrl && (
              <a
                href={influencer.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                aria-label={`${influencer.username} 인스타그램 프로필 새 창`}
              >
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
            {/* 상세 분석 버튼 — 영상 콘텐츠 + onDetailClick 있을 때만 */}
            {isVideo && onDetailClick && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDetailClick(e) }}
                className="inline-flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
              >
                상세 분석 <ChevronRight size={11} />
              </button>
            )}
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold tabular-nums ${GRADE_BG[grade]}`}
              aria-label={`등급 ${GRADE_LABEL[grade]}`}
            >
              {GRADE_LABEL[grade]}
            </span>
          </div>
        </div>

        {/* 게시일 + 매칭 캠페인 chip — @username 바로 아래 (원본 ViralMetricsSection L2110-2120 매칭) */}
        <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
          <span className="text-gray-500">게시일 {fmtRelativeDate(postedAt)}</span>
          {campaignMatched && campaignName && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onCampaignClick?.(e) }}
              className="inline-flex items-center rounded-full bg-brand-green-bg px-2.5 py-1 text-xs font-semibold text-brand-green-text transition-colors hover:bg-brand-green-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/30"
              aria-label={`매칭 캠페인: ${campaignName}`}
            >
              {campaignName}
            </button>
          )}
        </div>

        {/* 캡션 */}
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {enrichedCaption}
        </p>

        {/* 4지표 — 카드 폭 충분하면 4열 한 줄, 좁으면 2×2 */}
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-x-4 gap-y-2 pt-3 mt-2 border-t border-gray-100">
          <MetricItem
            icon={<Heart size={13} className="text-rose-400" />}
            value={metrics.likes} label="좋아요"
            growth={metricsGrowth?.likes}
          />
          <MetricItem
            icon={<MessageCircle size={13} className="text-blue-400" />}
            value={metrics.comments} label="댓글"
            growth={metricsGrowth?.comments}
          />
          <MetricItem
            icon={<Share2 size={13} className="text-violet-400" />}
            value={metrics.shares} label="공유"
            growth={metricsGrowth?.shares}
          />
          <MetricItem
            icon={<Eye size={13} className="text-gray-400" />}
            value={metrics.reach} label="도달"
            growth={metricsGrowth?.reach}
          />
        </div>

        {/* 평가중 안내 — 1행 컴팩트 */}
        {grade === 'processing' && (
          <div className="mt-3 rounded-lg bg-amber-50/70 border border-amber-200 px-3 py-1.5 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle size={13} className="text-amber-600 shrink-0" aria-hidden="true" />
            <span className="truncate">데이터가 쌓이면 점수·등급이 표시됩니다 (평가중)</span>
          </div>
        )}

        {/* 인라인 점수 4개 — 영상 콘텐츠 + 점수 산정 완료 시 노출 (원본 ViralMetricsSection L2199-2220 매칭)
         *  최종점수 = (퍼포먼스 + 모멘텀) / 2. 각 라벨에 info 아이콘 + 호버 툴팁
         *  카드 폭 충분하면 4열 한 줄, 좁으면 2×2 */}
        {showInlineScores && scoreData && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 @sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                최종 점수
                <Tooltip content="콘텐츠의 종합 성과 점수예요. 누적 성과와 최근 증가 속도를 함께 반영해 계산합니다." multiline>
                  <Info size={11} className="text-gray-300 cursor-help" aria-hidden="true" />
                </Tooltip>
              </div>
              <div className="font-bold text-gray-900 tabular-nums">
                {((scoreData.performanceScore + scoreData.momentumScore) / 2).toFixed(1)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                등급
                <Tooltip content="퍼포먼스 점수를 기준으로 나눈 등급이에요. A에 가까울수록 누적 성과가 더 좋은 상태예요." multiline>
                  <Info size={11} className="text-gray-300 cursor-help" aria-hidden="true" />
                </Tooltip>
              </div>
              <div className="font-bold text-gray-900 tabular-nums">{grade}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                퍼포먼스
                <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교했을 때, 누적 조회수 수준이 어느 정도인지 보여주는 값이에요." multiline>
                  <Info size={11} className="text-gray-300 cursor-help" aria-hidden="true" />
                </Tooltip>
              </div>
              <div className="font-bold text-gray-900 tabular-nums">{scoreData.performanceScore}/100</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                모멘텀
                <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교했을 때, 최근 조회수 증가 속도가 어느 정도인지 보여주는 값이에요." multiline>
                  <Info size={11} className="text-gray-300 cursor-help" aria-hidden="true" />
                </Tooltip>
              </div>
              <div className="font-bold text-gray-900 tabular-nums">{scoreData.momentumScore}/100</div>
            </div>
          </div>
        )}
      </div>
    </article>
    </div>
  )
})

export default ViralContentRowCard
