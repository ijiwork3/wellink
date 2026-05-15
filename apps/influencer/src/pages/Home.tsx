import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, ChevronRight, Heart, TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useQAMode, fmtDate, StatusBadge, fmtFollowers, ErrorState, EmptyState, Skeleton } from '@wellink/ui'
import { mockMyCampaigns } from '../services/mock/campaigns'
import { mockProfile, mockCampaignSummary, mockInstaStats } from '../services/mock/profile'
import { useBookmarks } from '../services/userState'

const SUMMARY_CARDS = [
  { label: '지원 완료', key: 'applied' as const,   color: 'text-gray-900' },
  { label: '참여중',    key: 'ongoing' as const,    color: 'text-brand-green-text' },
  { label: '참여 완료', key: 'completed' as const,  color: 'text-gray-900' },
  // MyCampaign 탭과 표기 통일 ('탈락' → '미선정')
  { label: '미선정',    key: 'eliminated' as const, color: 'text-red-400' },
]

export default function Home() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const bookmarks = useBookmarks()

  // mockMyCampaigns 는 정적 import 라 useMemo 불필요.
  // 마감 임박 계산도 mount 시 한 번 캡처(useState 지연 초기화)해 React 19 purity 규칙을 위반하지 않는다.
  const [now] = useState(() => Date.now())
  const activeCampaigns = mockMyCampaigns.filter(c =>
    ['지원완료', '검토중', '콘텐츠대기', '검수중'].includes(c.status)
  )
  const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3
  const urgentCampaigns = mockMyCampaigns.filter(c => {
    if (c.status !== '콘텐츠대기' || !c.contentDeadline) return false
    const diff = new Date(c.contentDeadline).getTime() - now
    return diff > 0 && diff < THREE_DAYS_MS
  })
  const bookmarkCount = bookmarks.size

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton shape="card" height={96} width="100%" />
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} shape="card" height={80} width="100%" />)}
          </div>
          <Skeleton shape="card" height={144} width="100%" />
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <ErrorState message="홈 데이터를 불러오지 못했어요" onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  if (qa === 'empty') {
    return (
      <Layout>
        <div className="bg-white rounded-2xl border border-gray-100 py-12">
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
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="sr-only">홈</h1>

        {/* 인사말 배너 — 인스타 미연결이면 follower 카운트는 비공개, 연결 안내로 대체 */}
        <div className="bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl p-5 text-white">
          <p className="text-sm font-medium opacity-80 mb-0.5">안녕하세요 <span aria-hidden="true">👋</span></p>
          <p className="text-lg font-bold truncate">{mockProfile.name}님</p>
          {mockProfile.instagramConnected ? (
            <p className="text-sm opacity-80 mt-1 truncate">@{mockProfile.instagram} · {fmtFollowers(mockInstaStats.followers)} 팔로워</p>
          ) : (
            <button
              onClick={() => navigate('/media')}
              className="text-sm opacity-90 mt-1 truncate underline underline-offset-2 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-md"
            >
              SNS를 연결하면 더 많은 캠페인을 추천받아요
            </button>
          )}
        </div>

        {/* 활동 통계 */}
        <div className="grid grid-cols-2 @[480px]:grid-cols-4 gap-2">
          {SUMMARY_CARDS.map(card => (
            <button
              key={card.key}
              onClick={() => navigate('/campaigns/my')}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:border-gray-200 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              aria-label={`${card.label} ${mockCampaignSummary[card.key]}건 보기`}
            >
              <p className={`text-xl font-bold tabular-nums ${card.color}`}>{mockCampaignSummary[card.key]}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-tight whitespace-nowrap">{card.label}</p>
            </button>
          ))}
        </div>

        {/* 마감 임박 알림 */}
        {urgentCampaigns.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-orange-500 shrink-0" />
              <p className="text-sm font-semibold text-orange-700">콘텐츠 제출 마감 임박!</p>
            </div>
            <div className="space-y-1.5">
              {urgentCampaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate('/campaigns/my')}
                  className="w-full flex items-center justify-between text-left bg-white rounded-xl px-3 py-2.5 hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  aria-label={`${c.name} — ${fmtDate(c.contentDeadline!)}까지 콘텐츠 제출`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 break-keep line-clamp-1">{c.name}</p>
                    <p className="text-sm text-orange-600 mt-0.5">{fmtDate(c.contentDeadline!)}까지</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 shrink-0 ml-2" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 진행 중인 캠페인 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900">진행 중인 캠페인</p>
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
            <div className="divide-y divide-gray-50">
              {activeCampaigns.slice(0, 3).map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate('/campaigns/my')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  aria-label={`${c.name} — ${c.progress}`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 break-keep line-clamp-1">{c.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{c.progress}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 빠른 메뉴 — 모바일 360px 한 셀 약 95px. 라벨은 4글자 이내로 통일하고 카운트는 별도 줄. */}
        <div className="grid grid-cols-3 gap-3">
          <QuickMenu
            icon={<Compass size={20} className="text-brand-green" />}
            label="캠페인 탐색"
            onClick={() => navigate('/campaigns/browse')}
          />
          <QuickMenu
            icon={<Heart size={20} className="text-red-400" />}
            label="관심 캠페인"
            badge={bookmarkCount > 0 ? String(bookmarkCount) : undefined}
            onClick={() => navigate('/campaigns/favorites')}
          />
          <QuickMenu
            icon={<Wallet size={20} className="text-blue-400" />}
            label="정산"
            onClick={() => navigate('/settlement')}
          />
        </div>

        {/* SNS 지표 요약 — 인스타 연결된 경우만 표시. 미연결이면 연결 CTA 카드 */}
        {mockProfile.instagramConnected ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-900">SNS 지표</p>
              <button
                onClick={() => navigate('/media')}
                className="flex items-center gap-0.5 text-sm text-brand-green-text font-medium rounded-md transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                자세히 <ChevronRight size={14} />
              </button>
            </div>
            {/* 360px 한 셀 가용 80px. fmtFollowers가 6자(예 123.4만) 일 때 text-base는 overflow → text-sm + px 축소 */}
            <div className="grid grid-cols-3 divide-x divide-gray-50 px-1 py-3">
              {[
                { label: '팔로워', value: fmtFollowers(mockInstaStats.followers) },
                { label: '참여율', value: `${mockInstaStats.engagementRate}%`, highlight: true },
                { label: '게시물', value: String(mockInstaStats.posts) },
              ].map(item => (
                <div key={item.label} className="text-center px-1.5 min-w-0">
                  <p className={`text-sm @[480px]:text-base font-bold tabular-nums truncate ${item.highlight ? 'text-brand-green-text' : 'text-gray-900'}`}>{item.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5 whitespace-nowrap">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mx-4 mb-3 px-3 py-2 rounded-xl bg-gray-50">
              <TrendingUp size={14} className="text-brand-green flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-gray-600 truncate flex-1 min-w-0">인스타그램 <span className="font-medium text-gray-800">@{mockProfile.instagram}</span> 연결됨</p>
            </div>
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
                <p className="text-sm text-gray-500 mt-0.5 break-keep">팔로워·참여율 정보로 더 적합한 캠페인을 추천받을 수 있어요</p>
              </div>
              <ChevronRight size={18} className="text-gray-400 shrink-0" aria-hidden="true" />
            </div>
          </button>
        )}

      </div>
    </Layout>
  )
}

function QuickMenu({ icon, label, badge, onClick }: { icon: React.ReactNode; label: string; badge?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 py-4 px-2 hover:border-gray-200 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
    >
      {icon}
      <span className="text-sm font-medium text-gray-700 text-center leading-tight break-keep">
        {label}
      </span>
      {badge && (
        <span
          className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center"
          aria-label={`${badge}개`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
