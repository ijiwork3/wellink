import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, AlertCircle, Camera, Star, ChevronLeft,
} from 'lucide-react'
import Layout from '../components/Layout'
import {
  useQAMode, fmtDate, StatusBadge, fmtFollowers,
  ErrorState, Skeleton, fmtPrice,
} from '@wellink/ui'
import { mockCampaigns } from '../services/mock/campaigns'
import { mockMyCampaigns } from '../services/mock/campaigns'
import { mockProfile, mockCampaignSummary, mockInstaStats, INFLUENCER_TYPES } from '../services/mock/profile'
import { useBookmarks } from '../services/userState'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'

// ─── 상수 ────────────────────────────────────────────────────────────────────

const STAT_ITEMS = [
  { label: '지원',    key: 'applied'    as const },
  { label: '참여중',  key: 'ongoing'    as const },
  { label: '완료',    key: 'completed'  as const },
  { label: '미선정',  key: 'eliminated' as const },
]

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const bookmarks = useBookmarks()

  const [now] = useState(() => Date.now())
  const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3
  const influencerTypeLabel = INFLUENCER_TYPES.find(t => t.value === mockProfile.influencerType)?.label

  const activeCampaigns = mockMyCampaigns.filter(c =>
    ['지원완료', '검토중', '콘텐츠대기', '검수중'].includes(c.status)
  )
  const urgentCampaigns = mockMyCampaigns.filter(c => {
    if (c.status !== '콘텐츠대기' || !c.contentDeadline) return false
    const diff = new Date(c.contentDeadline).getTime() - now
    return diff > 0 && diff < THREE_DAYS_MS
  })

  // 캐러셀: 모집중·마감임박 캠페인 최대 12개
  const browseCampaigns = mockCampaigns
    .filter(c => ['모집중', '마감임박'].includes(c.status))
    .slice(0, 12)

  /* ── QA 상태 ── */
  if (qa === 'loading') {
    return (
      <Layout showSidebar={false} showBottomTab={false}>
        <div className="space-y-3 p-4 max-w-lg mx-auto">
          <Skeleton shape="card" height={110} width="100%" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} shape="card" height={64} width="100%" />)}
          </div>
          <Skeleton shape="card" height={180} width="100%" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map(i => <Skeleton key={i} shape="card" height={200} width="160px" className="shrink-0" />)}
          </div>
          <Skeleton shape="card" height={72} width="100%" />
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout showSidebar={false} showBottomTab={false}>
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <ErrorState message="홈 데이터를 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false} showBottomTab={false}>
      <div className="space-y-4 p-4 max-w-lg mx-auto pb-8">
        <h1 className="sr-only">홈</h1>

        {/* ── 프로필 배너 ── */}
        <div className="bg-gradient-to-br from-brand-green to-[#7ABD28] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0" aria-hidden>🏃</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base font-bold truncate">{mockProfile.name}님</span>
                {influencerTypeLabel && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20 whitespace-nowrap shrink-0">
                    {influencerTypeLabel}
                  </span>
                )}
              </div>
              {mockProfile.instagramConnected && (
                <p className="text-xs opacity-75 truncate">
                  @{mockProfile.instagram} · {fmtFollowers(mockInstaStats.followers)} 팔로워 · 참여율 {mockInstaStats.engagementRate}%
                </p>
              )}
            </div>
          </div>

          {/* 활동 통계 스트립 */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {STAT_ITEMS.map(s => (
              <button
                key={s.key}
                onClick={() => navigate('/campaigns/my')}
                className="bg-white/15 rounded-xl py-2 text-center hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={`${s.label} ${mockCampaignSummary[s.key]}건`}
              >
                <p className="text-base font-bold tabular-nums">{mockCampaignSummary[s.key]}</p>
                <p className="text-[10px] opacity-80 mt-0.5 whitespace-nowrap">{s.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── 마감 임박 알림 ── */}
        {urgentCampaigns.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <AlertCircle size={13} className="text-orange-500 shrink-0" aria-hidden />
              <p className="text-sm font-semibold text-orange-700">콘텐츠 마감 임박!</p>
            </div>
            <div className="space-y-1.5">
              {urgentCampaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate('/campaigns/my')}
                  className="w-full flex items-center justify-between text-left bg-white rounded-xl px-3 py-2.5 hover:bg-orange-50 border border-orange-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{c.name}</p>
                    <p className="text-xs text-orange-600 mt-0.5">마감 {fmtDate(c.contentDeadline!)}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 shrink-0 ml-2" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 진행 중인 캠페인 리스트 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader
            title="진행 중인 캠페인"
            count={activeCampaigns.length}
            onMore={() => navigate('/campaigns/my')}
          />
          {activeCampaigns.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400 mb-3">아직 참여 중인 캠페인이 없어요</p>
              <button
                onClick={() => navigate('/campaigns/browse')}
                className="text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover px-4 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                캠페인 찾아보기
              </button>
            </div>
          ) : (
            <ul>
              {activeCampaigns.map((c, i) => (
                <li key={c.id} className={i > 0 ? 'border-t border-gray-50' : ''}>
                  <button
                    onClick={() => navigate('/campaigns/my')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    aria-label={`${c.name} — ${c.status}`}
                  >
                    {/* 썸네일 */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={getThumbnailFromPool(c.campaignRef ?? c.id)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = getPlaceholderDataUri(c.campaignRef ?? c.id) }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{c.name}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.status} size="sm" />
                        <span className="text-xs text-gray-400 truncate">{c.progress}</span>
                      </div>
                    </div>
                    {c.contentDeadline && (
                      <DeadlineChip deadline={c.contentDeadline} now={now} />
                    )}
                    <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── 새 캠페인 캐러셀 ── */}
        <CampaignCarousel
          campaigns={browseCampaigns}
          bookmarks={bookmarks}
          onCardClick={id => navigate(`/campaigns/${id}`)}
          onMore={() => navigate('/campaigns/browse')}
        />

        {/* ── 등급 + SNS ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* 등급 카드 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={13} className="text-brand-green" aria-hidden />
              <p className="text-xs font-semibold text-gray-700">내 등급</p>
            </div>
            <p className="text-3xl font-black text-brand-green-text leading-none">B+</p>
            <p className="text-xs text-gray-400 mt-1">상위 20%</p>
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-[55%] rounded-full bg-gradient-to-r from-brand-green-border to-brand-green" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-300">C</span>
                <span className="text-[9px] text-gray-300">S</span>
              </div>
            </div>
          </div>

          {/* SNS 지표 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Camera size={13} className="text-brand-green" aria-hidden />
                <p className="text-xs font-semibold text-gray-700">인스타그램</p>
              </div>
              <button
                onClick={() => navigate('/media')}
                className="text-[10px] text-brand-green-text font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green/50 rounded"
              >
                상세
              </button>
            </div>
            {mockProfile.instagramConnected ? (
              <div className="space-y-2.5">
                <div>
                  <p className="text-xl font-bold text-gray-900 tabular-nums">{fmtFollowers(mockInstaStats.followers)}</p>
                  <p className="text-[10px] text-gray-400">팔로워</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-bold text-brand-green-text tabular-nums">{mockInstaStats.engagementRate}%</p>
                    <p className="text-[10px] text-gray-400">참여율</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{mockInstaStats.posts}</p>
                    <p className="text-[10px] text-gray-400">게시물</p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/media')}
                className="w-full text-xs text-brand-green-text font-medium bg-brand-green-bg rounded-xl py-2.5 hover:bg-brand-green/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                SNS 연결하기
              </button>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function SectionHeader({ title, count, onMore }: { title: string; count?: number; onMore?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {count !== undefined && count > 0 && (
          <span className="text-xs font-bold text-brand-green-text bg-brand-green-bg px-1.5 py-0.5 rounded-full tabular-nums">
            {count}
          </span>
        )}
      </div>
      {onMore && (
        <button
          onClick={onMore}
          className="flex items-center gap-0.5 text-xs text-brand-green-text font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
        >
          전체보기 <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}

function DeadlineChip({ deadline, now }: { deadline: string; now: number }) {
  const diff = Math.ceil((new Date(deadline).getTime() - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  const label = diff === 0 ? 'D-Day' : `D-${diff}`
  const color = diff <= 3 ? 'text-red-500 bg-red-50 border-red-100' : diff <= 7 ? 'text-orange-500 bg-orange-50 border-orange-100' : 'text-gray-500 bg-gray-50 border-gray-100'
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${color}`}>
      {label}
    </span>
  )
}

function CampaignCarousel({
  campaigns,
  bookmarks,
  onCardClick,
  onMore,
}: {
  campaigns: typeof mockCampaigns
  bookmarks: ReturnType<typeof useBookmarks>
  onCardClick: (id: number) => void
  onMore: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <SectionHeader title="새 캠페인" onMore={onMore} />

      <div className="relative">
        {/* 왼쪽 쉐브론 */}
        {canLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="이전"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <ChevronLeft size={14} className="text-gray-600" />
          </button>
        )}
        {/* 오른쪽 쉐브론 */}
        {canRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="다음"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>
        )}

        {/* 그라디언트 오버레이 */}
        {canLeft && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[5]" />}
        {canRight && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-[5]" />}

        <div
          ref={scrollRef}
          onScroll={updateScroll}
          className="flex gap-3 overflow-x-auto px-4 py-3 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {campaigns.map(c => (
            <button
              key={c.id}
              onClick={() => onCardClick(c.id)}
              className="shrink-0 w-[152px] text-left rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              aria-label={c.name}
            >
              {/* 썸네일 — 16:9 */}
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={getThumbnailFromPool(c.id)}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src = getPlaceholderDataUri(c.id, c.brand) }}
                />
              </div>
              {/* 콘텐츠 */}
              <div className="p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-gray-400 truncate">{c.brand}</span>
                  {c.status === '마감임박' && (
                    <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded whitespace-nowrap shrink-0 ml-1">마감임박</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">{c.name}</p>
                {c.rewardAmount ? (
                  <p className="text-[11px] font-bold text-brand-green-text">{fmtPrice(c.rewardAmount)} 상당</p>
                ) : (
                  <p className="text-[11px] text-gray-400">리워드 미정</p>
                )}
              </div>
            </button>
          ))}

          {/* 끝 — 더보기 카드 */}
          <button
            onClick={onMore}
            className="shrink-0 w-[100px] rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-center hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 py-4"
          >
            <span className="text-2xl" aria-hidden>🔍</span>
            <span className="text-xs font-medium text-gray-500 leading-tight">캠페인<br />더 보기</span>
          </button>
        </div>
      </div>
    </div>
  )
}
