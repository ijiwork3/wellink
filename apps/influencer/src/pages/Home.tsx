import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass, ChevronRight, Heart, TrendingUp, AlertCircle,
  Camera, Star, Activity,
} from 'lucide-react'
import Layout from '../components/Layout'
import {
  useQAMode, fmtDate, StatusBadge, fmtFollowers, ErrorState,
  EmptyState, Skeleton, fmtNumber,
} from '@wellink/ui'
import { mockMyCampaigns } from '../services/mock/campaigns'
import { mockProfile, mockCampaignSummary, mockInstaStats, INFLUENCER_TYPES } from '../services/mock/profile'
import { useBookmarks } from '../services/userState'

const STAT_CARDS = [
  { label: '지원 완료',  key: 'applied'    as const, color: 'text-gray-900',      bg: 'bg-gray-50',           border: 'border-gray-100' },
  { label: '참여 중',    key: 'ongoing'    as const, color: 'text-brand-green-text', bg: 'bg-brand-green-bg', border: 'border-brand-green-border' },
  { label: '참여 완료',  key: 'completed'  as const, color: 'text-gray-900',      bg: 'bg-gray-50',           border: 'border-gray-100' },
  { label: '미선정',     key: 'eliminated' as const, color: 'text-red-400',       bg: 'bg-red-50',            border: 'border-red-100' },
]

export default function Home() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const bookmarks = useBookmarks()

  const [now] = useState(() => Date.now())
  const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3

  const activeCampaigns = mockMyCampaigns.filter(c =>
    ['지원완료', '검토중', '콘텐츠대기', '검수중'].includes(c.status)
  )
  const urgentCampaigns = mockMyCampaigns.filter(c => {
    if (c.status !== '콘텐츠대기' || !c.contentDeadline) return false
    const diff = new Date(c.contentDeadline).getTime() - now
    return diff > 0 && diff < THREE_DAYS_MS
  })
  const bookmarkCount = bookmarks.size
  const influencerTypeLabel = INFLUENCER_TYPES.find(t => t.value === mockProfile.influencerType)?.label

  /* ── QA 상태 ── */
  if (qa === 'loading') {
    return (
      <Layout showSidebar={false} showBottomTab={false}>
        <div className="space-y-3 p-4">
          <Skeleton shape="card" height={120} width="100%" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} shape="card" height={72} width="100%" />)}
          </div>
          <Skeleton shape="card" height={200} width="100%" />
          <Skeleton shape="card" height={120} width="100%" />
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

  if (qa === 'empty') {
    return (
      <Layout showSidebar={false} showBottomTab={false}>
        <div className="p-4">
          <WelcomeBanner influencerTypeLabel={influencerTypeLabel} />
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm py-12">
            <EmptyState
              title="아직 활동 내역이 없어요"
              description="첫 캠페인에 신청해 보세요"
              action={
                <button
                  onClick={() => navigate('/campaigns/browse')}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  캠페인 찾아보기
                </button>
              }
            />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false} showBottomTab={false}>
      <div className="@container space-y-3 p-4 max-w-xl mx-auto">
        <h1 className="sr-only">홈</h1>

        {/* 인사말 배너 */}
        <WelcomeBanner influencerTypeLabel={influencerTypeLabel} />

        {/* 활동 통계 */}
        <div className="grid grid-cols-4 gap-2">
          {STAT_CARDS.map(card => (
            <button
              key={card.key}
              onClick={() => navigate('/campaigns/my')}
              className={`rounded-2xl border ${card.border} ${card.bg} p-3 text-center hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50`}
              aria-label={`${card.label} ${mockCampaignSummary[card.key]}건 보기`}
            >
              <p className={`text-xl font-bold tabular-nums ${card.color}`}>{mockCampaignSummary[card.key]}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight whitespace-nowrap">{card.label}</p>
            </button>
          ))}
        </div>

        {/* 마감 임박 알림 */}
        {urgentCampaigns.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertCircle size={14} className="text-orange-500 shrink-0" aria-hidden="true" />
              <p className="text-sm font-semibold text-orange-700">콘텐츠 제출 마감 임박!</p>
            </div>
            <div className="space-y-2">
              {urgentCampaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate('/campaigns/my')}
                  className="w-full flex items-center justify-between text-left bg-white rounded-xl px-3 py-2.5 hover:bg-orange-50 transition-colors border border-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  aria-label={`${c.name} — ${fmtDate(c.contentDeadline!)}까지 콘텐츠 제출`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 break-keep line-clamp-1">{c.name}</p>
                    <p className="text-xs text-orange-600 mt-0.5">마감 {fmtDate(c.contentDeadline!)}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 shrink-0 ml-2" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 진행 중인 캠페인 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-brand-green" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-900">진행 중인 캠페인</p>
            </div>
            <button
              onClick={() => navigate('/campaigns/my')}
              className="flex items-center gap-0.5 text-sm text-brand-green-text font-medium rounded-md transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              전체보기 <ChevronRight size={14} />
            </button>
          </div>

          {activeCampaigns.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">진행 중인 캠페인이 없어요</p>
              <button
                onClick={() => navigate('/campaigns/browse')}
                className="mt-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                캠페인 찾아보기
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {activeCampaigns.slice(0, 4).map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => navigate('/campaigns/my')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    aria-label={`${c.name} — ${c.status}`}
                  >
                    <div className="shrink-0">
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-keep line-clamp-1">{c.name}</p>
                      {c.progress && <p className="text-xs text-gray-500 mt-0.5 truncate">{c.progress}</p>}
                    </div>
                    <ChevronRight size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 gap-2.5">
          <QuickMenu
            icon={<Compass size={20} className="text-brand-green" />}
            label="캠페인 탐색"
            description="새 캠페인 찾기"
            onClick={() => navigate('/campaigns/browse')}
          />
          <QuickMenu
            icon={<Heart size={20} className="text-red-400" />}
            label="관심 캠페인"
            description={bookmarkCount > 0 ? `${bookmarkCount}개 저장됨` : '저장된 캠페인'}
            badge={bookmarkCount > 0 ? String(bookmarkCount) : undefined}
            onClick={() => navigate('/campaigns/favorites')}
          />
        </div>

        {/* SNS 지표 */}
        {mockProfile.instagramConnected ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-brand-green" aria-hidden="true" />
                <p className="text-sm font-semibold text-gray-900">SNS 지표</p>
              </div>
              <button
                onClick={() => navigate('/media')}
                className="flex items-center gap-0.5 text-sm text-brand-green-text font-medium rounded-md transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                자세히 <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-50 py-4">
              {[
                { label: '팔로워',  value: fmtFollowers(mockInstaStats.followers),            highlight: false },
                { label: '참여율',  value: `${mockInstaStats.engagementRate}%`,                highlight: true  },
                { label: '게시물',  value: fmtNumber(mockInstaStats.posts),                    highlight: false },
              ].map(item => (
                <div key={item.label} className="text-center px-2 min-w-0">
                  <p className={`text-base font-bold tabular-nums truncate ${item.highlight ? 'text-brand-green-text' : 'text-gray-900'}`}>
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center pb-3">@{mockProfile.instagram}</p>
          </div>
        ) : (
          <button
            onClick={() => navigate('/media')}
            className="w-full bg-white rounded-2xl border border-dashed border-gray-300 px-4 py-5 text-left hover:border-brand-green hover:bg-brand-green-bg/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-green-bg flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-brand-green-text" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">SNS를 연결해 주세요</p>
                <p className="text-xs text-gray-500 mt-0.5 break-keep">팔로워·참여율 정보로 더 적합한 캠페인을 추천받을 수 있어요</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
            </div>
          </button>
        )}

        {/* 인플루언서 등급 카드 (고정 정보) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-brand-green" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-900">나의 등급</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-brand-green-text">B+</p>
              <p className="text-xs text-gray-500 mt-0.5">상위 20%</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>C</span><span>B</span><span>A</span><span>S</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-[55%] rounded-full bg-gradient-to-r from-brand-green-border to-brand-green" />
              </div>
            </div>
            <button
              onClick={() => navigate('/media')}
              className="text-xs text-brand-green-text font-medium whitespace-nowrap hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >
              지표 확인
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}

function WelcomeBanner({ influencerTypeLabel }: { influencerTypeLabel?: string }) {
  return (
    <div className="bg-gradient-to-br from-brand-green to-[#7ABD28] rounded-2xl p-5 text-white shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl shrink-0 mt-0.5"
          aria-hidden="true"
        >
          🏃
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-lg font-bold truncate">{mockProfile.name}님</p>
            {influencerTypeLabel && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 whitespace-nowrap">
                {influencerTypeLabel}
              </span>
            )}
          </div>
          <p className="text-sm opacity-80">안녕하세요 <span aria-hidden="true">👋</span></p>
          {mockProfile.instagramConnected && (
            <p className="text-xs opacity-70 mt-1.5 truncate">
              @{mockProfile.instagram} · {fmtFollowers(mockInstaStats.followers)} 팔로워
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickMenu({
  icon, label, description, badge, onClick,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  badge?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start gap-2 p-4 hover:border-gray-200 hover:shadow-md transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
    >
      {icon}
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{description}</p>}
      </div>
      {badge && (
        <span
          className="absolute top-2.5 right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center"
          aria-label={`${badge}개`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
