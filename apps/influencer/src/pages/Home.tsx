/**
 * 홈 페이지 — 액션 드리븐 대시보드
 *
 * 설계 원칙: "지금 무엇을 해야 하는가"에 즉각 답한다.
 *
 * 섹션 순서:
 * 1. 프로필 배너 (이름·팔로워·통계 스트립)
 * 2. 지금 할 일 (콘텐츠대기 → "제출하기", 지원완료 → "수정하기") — 없으면 숨김
 * 3. 진행 중인 캠페인 리스트 (상태별 컨텍스트)
 * 4. 관심 캠페인 (북마크 있을 때만, 없으면 숨김)
 * 5. 새 캠페인 캐러셀 (탐색 진입점)
 * 6. 인스타 지표 요약 (연결 여부 분기)
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, AlertCircle, Camera, ChevronLeft,
  Upload, Pencil, Heart,
} from 'lucide-react'
import Layout from '../components/Layout'
import {
  useQAMode, fmtDate, StatusBadge, fmtFollowers,
  ErrorState, Skeleton, fmtPrice, getDDay,
} from '@wellink/ui'
import { mockCampaigns, mockMyCampaigns, type MyCampaign } from '../services/mock/campaigns'
import {
  mockProfile, mockCampaignSummary, mockInstaStats, INFLUENCER_TYPES,
} from '../services/mock/profile'
import { useBookmarks } from '../services/userState'
import {
  getThumbnailFromPool, getPlaceholderDataUri,
} from '../utils/thumbnailPlaceholder'

// ─── 상수 ────────────────────────────────────────────────────────────────────

const STAT_ITEMS = [
  { label: '지원',   key: 'applied'    as const },
  { label: '참여중', key: 'ongoing'    as const },
  { label: '완료',   key: 'completed'  as const },
  { label: '미선정', key: 'eliminated' as const },
]

// ─── 메인 ────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const qa      = useQAMode()
  const bookmarks = useBookmarks()

  const [now] = useState(() => Date.now())
  const influencerTypeLabel =
    INFLUENCER_TYPES.find(t => t.value === mockProfile.influencerType)?.label

  // 상태별 분류
  const contentWaiting = mockMyCampaigns.filter(c => c.status === '콘텐츠대기')
  const appliedWaiting  = mockMyCampaigns.filter(c => c.status === '지원완료')
  const activeCampaigns = mockMyCampaigns.filter(c =>
    ['지원완료', '검토중', '콘텐츠대기', '검수중'].includes(c.status)
  )

  // 관심 캠페인 (북마크된 것 중 최대 4개 미리보기)
  const bookmarkedCampaigns = mockCampaigns
    .filter(c => bookmarks.has(c.id))
    .slice(0, 4)

  // 새 캠페인 캐러셀 (모집중·마감임박 최대 12개)
  const browseCampaigns = mockCampaigns
    .filter(c => ['모집중', '마감임박'].includes(c.status))
    .slice(0, 12)

  // 할 일 있는지 여부
  const hasTodo = contentWaiting.length > 0 || appliedWaiting.length > 0

  /* ── QA 상태 ── */
  if (qa === 'loading') {
    return (
      <Layout showSidebar={false} showBottomTab={false}>
        <div className="space-y-3 p-4 max-w-lg mx-auto">
          <Skeleton shape="card" height={110} width="100%" />
          <Skeleton shape="card" height={88} width="100%" />
          <Skeleton shape="card" height={200} width="100%" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} shape="card" height={200} width="160px" className="shrink-0" />
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout showSidebar={false} showBottomTab={false}>
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <ErrorState
            message="홈 데이터를 불러오지 못했어요"
            onRetry={() => window.location.reload()}
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false} showBottomTab={false}>
      <div className="space-y-4 p-4 max-w-lg mx-auto pb-8">
        <h1 className="sr-only">홈</h1>

        {/* ── 1. 프로필 배너 ── */}
        <div className="bg-gradient-to-br from-brand-green to-[#7ABD28] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0"
              aria-hidden
            >
              🏃
            </div>
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
          <div className="grid grid-cols-4 gap-2">
            {STAT_ITEMS.map(s => (
              <button
                key={s.key}
                onClick={() => navigate('/campaigns/my')}
                className="bg-white/15 rounded-xl py-2 text-center hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={`${s.label} ${mockCampaignSummary[s.key]}건`}
              >
                <p className="text-base font-bold tabular-nums">{mockCampaignSummary[s.key]}</p>
                <p className="text-[10px] opacity-75 mt-0.5 whitespace-nowrap">{s.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── 2. 지금 할 일 ── */}
        {hasTodo && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-50">
              <AlertCircle size={14} className="text-orange-500 shrink-0" aria-hidden />
              <p className="text-sm font-semibold text-gray-900">지금 할 일</p>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full tabular-nums ml-auto">
                {contentWaiting.length + appliedWaiting.length}
              </span>
            </div>
            <ul>
              {/* 콘텐츠 제출 대기 — 가장 긴박 */}
              {contentWaiting.map((c, i) => (
                <TodoRow
                  key={c.id}
                  campaign={c}
                  now={now}
                  divider={i > 0}
                  actionLabel="제출하기"
                  actionIcon={<Upload size={13} />}
                  actionVariant="primary"
                  onAction={() => navigate('/campaigns/my')}
                  onRowClick={() => navigate('/campaigns/my')}
                />
              ))}
              {/* 지원완료 — 수정 가능 */}
              {appliedWaiting.map((c, i) => (
                <TodoRow
                  key={c.id}
                  campaign={c}
                  now={now}
                  divider={contentWaiting.length > 0 || i > 0}
                  actionLabel="수정하기"
                  actionIcon={<Pencil size={13} />}
                  actionVariant="secondary"
                  onAction={() => c.campaignRef
                    ? navigate(`/campaigns/${c.campaignRef}/apply?mode=edit`)
                    : navigate('/campaigns/my')
                  }
                  onRowClick={() => navigate('/campaigns/my')}
                />
              ))}
            </ul>
          </div>
        )}

        {/* ── 3. 진행 중인 캠페인 ── */}
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
                      <div className="flex items-center gap-2 min-w-0">
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

        {/* ── 4. 관심 캠페인 — 북마크 있을 때만 ── */}
        {bookmarkedCampaigns.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader
              title="관심 캠페인"
              count={bookmarks.size}
              onMore={() => navigate('/campaigns/favorites')}
            />
            <ul>
              {bookmarkedCampaigns.map((c, i) => {
                const dday = getDDay(c.applyEnd)
                const isEnded = dday.label.startsWith('D+')
                return (
                  <li key={c.id} className={i > 0 ? 'border-t border-gray-50' : ''}>
                    <button
                      onClick={() => navigate(`/campaigns/${c.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                      aria-label={c.name}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={getThumbnailFromPool(c.id)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.src = getPlaceholderDataUri(c.id, c.brand) }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{c.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{c.brand} · {c.channel}</p>
                      </div>
                      {isEnded ? (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">종료</span>
                      ) : (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${dday.color === 'text-red-500' ? 'text-red-500 bg-red-50 border-red-100' : dday.color === 'text-orange-400' ? 'text-orange-500 bg-orange-50 border-orange-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
                          {dday.label}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
            {bookmarks.size > 4 && (
              <button
                onClick={() => navigate('/campaigns/favorites')}
                className="w-full py-3 text-xs text-brand-green-text font-medium border-t border-gray-50 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                {bookmarks.size - 4}개 더 보기
              </button>
            )}
          </div>
        )}

        {/* ── 5. 새 캠페인 캐러셀 ── */}
        <CampaignCarousel
          campaigns={browseCampaigns}
          onCardClick={id => navigate(`/campaigns/${id}`)}
          onMore={() => navigate('/campaigns/browse')}
        />

        {/* ── 6. 인스타 지표 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Camera size={14} className="text-brand-green" aria-hidden />
              <p className="text-sm font-semibold text-gray-900">인스타그램</p>
            </div>
            <button
              onClick={() => navigate('/media')}
              className="flex items-center gap-0.5 text-xs text-brand-green-text font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >
              {mockProfile.instagramConnected ? '상세 분석' : '연결하기'} <ChevronRight size={13} />
            </button>
          </div>
          {mockProfile.instagramConnected ? (
            <div className="grid grid-cols-3 divide-x divide-gray-50 px-1 py-4">
              {[
                { label: '팔로워',  value: fmtFollowers(mockInstaStats.followers), highlight: false },
                { label: '참여율',  value: `${mockInstaStats.engagementRate}%`,     highlight: true  },
                { label: '평균 좋아요', value: mockInstaStats.avgLikes.toLocaleString('ko-KR'), highlight: false },
              ].map(item => (
                <div key={item.label} className="text-center px-3">
                  <p className={`text-base font-bold tabular-nums ${item.highlight ? 'text-brand-green-text' : 'text-gray-900'}`}>
                    {item.value}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">{item.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5">
              <p className="text-sm text-gray-500 mb-3 break-keep">
                SNS를 연결하면 팔로워·참여율 데이터를 기반으로 더 적합한 캠페인을 추천받을 수 있어요
              </p>
              <button
                onClick={() => navigate('/media')}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                인스타그램 연결하기
              </button>
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function SectionHeader({
  title, count, onMore,
}: {
  title: string; count?: number; onMore?: () => void
}) {
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

/** 지금 할 일 행 — 콘텐츠 제출 / 신청 수정 */
function TodoRow({
  campaign, now, divider,
  actionLabel, actionIcon, actionVariant,
  onAction, onRowClick,
}: {
  campaign: MyCampaign
  now: number
  divider: boolean
  actionLabel: string
  actionIcon: React.ReactNode
  actionVariant: 'primary' | 'secondary'
  onAction: () => void
  onRowClick: () => void
}) {
  return (
    <li className={divider ? 'border-t border-gray-50' : ''}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          <img
            src={getThumbnailFromPool(campaign.campaignRef ?? campaign.id)}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.src = getPlaceholderDataUri(campaign.campaignRef ?? campaign.id) }}
          />
        </div>
        <button
          onClick={onRowClick}
          className="flex-1 min-w-0 text-left focus-visible:outline-none"
          aria-label={campaign.name}
        >
          <p className="text-sm font-medium text-gray-900 line-clamp-1">{campaign.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={campaign.status} size="sm" />
            {campaign.contentDeadline && (
              <DeadlineChip deadline={campaign.contentDeadline} now={now} />
            )}
          </div>
        </button>
        <button
          onClick={e => { e.stopPropagation(); onAction() }}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap ${
            actionVariant === 'primary'
              ? 'bg-brand-green text-white hover:bg-brand-green-hover'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {actionIcon}
          {actionLabel}
        </button>
      </div>
    </li>
  )
}

function DeadlineChip({ deadline, now }: { deadline: string; now: number }) {
  const diff = Math.ceil((new Date(deadline).getTime() - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  const label = diff === 0 ? 'D-Day' : `D-${diff}`
  const color =
    diff <= 3 ? 'text-red-500 bg-red-50 border-red-100'
    : diff <= 7 ? 'text-orange-500 bg-orange-50 border-orange-100'
    : 'text-gray-400 bg-gray-50 border-gray-100'
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${color}`}>
      {label}
    </span>
  )
}

function CampaignCarousel({
  campaigns, onCardClick, onMore,
}: {
  campaigns: typeof mockCampaigns
  onCardClick: (id: number) => void
  onMore: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <SectionHeader title="새 캠페인" onMore={onMore} />

      <div className="relative">
        {canLeft && (
          <button onClick={() => scroll('left')} aria-label="이전"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <ChevronLeft size={14} className="text-gray-600" />
          </button>
        )}
        {canRight && (
          <button onClick={() => scroll('right')} aria-label="다음"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>
        )}
        {canLeft  && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[5]" />}
        {canRight && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-[5]" />}

        <div
          ref={scrollRef}
          onScroll={updateScroll}
          className="flex gap-3 overflow-x-auto px-4 py-3 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {campaigns.map(c => {
            const dday = getDDay(c.applyEnd)
            const isUrgent = c.status === '마감임박'
            return (
              <button
                key={c.id}
                onClick={() => onCardClick(c.id)}
                className="shrink-0 w-[152px] text-left rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                aria-label={c.name}
              >
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={getThumbnailFromPool(c.id)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = getPlaceholderDataUri(c.id, c.brand) }}
                  />
                </div>
                <div className="p-2.5">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-semibold text-gray-400 truncate">{c.brand}</span>
                    {isUrgent && (
                      <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded whitespace-nowrap shrink-0">마감임박</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">{c.name}</p>
                  <div className="flex items-center justify-between gap-1">
                    {c.rewardAmount
                      ? <p className="text-[11px] font-bold text-brand-green-text truncate">{fmtPrice(c.rewardAmount)} 상당</p>
                      : <p className="text-[11px] text-gray-400">리워드 미정</p>
                    }
                    <span className={`text-[9px] font-bold whitespace-nowrap shrink-0 ${dday.color === 'text-red-500' ? 'text-red-400' : dday.color === 'text-orange-400' ? 'text-orange-400' : 'text-gray-400'}`}>
                      {dday.label}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}

          {/* 끝 더보기 카드 */}
          <button
            onClick={onMore}
            className="shrink-0 w-[100px] rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-center hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 py-4"
          >
            <Heart size={18} className="text-gray-300" aria-hidden />
            <span className="text-xs font-medium text-gray-400 leading-tight">캠페인<br/>더 보기</span>
          </button>
        </div>
      </div>
    </div>
  )
}
