import { useNavigate } from 'react-router-dom'
import { Compass, ChevronRight, Heart, TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useQAMode, fmtDate, StatusBadge, fmtFollowers } from '@wellink/ui'
import type { ParticipationStatus } from '@wellink/ui'
import { mockMyCampaigns, mockBookmarkedCampaigns } from '../services/mock/campaigns'
import { mockProfile, mockCampaignSummary, mockInstaStats } from '../services/mock/profile'

const SUMMARY_CARDS = [
  { label: '지원 완료', key: 'applied' as const,   color: 'text-gray-900' },
  { label: '참여중',    key: 'ongoing' as const,    color: 'text-brand-green' },
  { label: '참여 완료', key: 'completed' as const,  color: 'text-gray-900' },
  { label: '탈락',      key: 'eliminated' as const, color: 'text-red-400' },
]

export default function Home() {
  const navigate = useNavigate()
  const qa = useQAMode()

  const activeCampaigns = mockMyCampaigns.filter(c =>
    ['지원완료', '검토중', '콘텐츠대기', '검수중'].includes(c.status)
  )
  const urgentCampaigns = mockMyCampaigns.filter(c => {
    if (c.status !== '콘텐츠대기' || !c.contentDeadline) return false
    const diff = new Date(c.contentDeadline).getTime() - Date.now()
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 3
  })
  const bookmarkCount = mockBookmarkedCampaigns.length

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
          </div>
          <div className="h-36 bg-gray-100 rounded-2xl" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">

        {/* 인사말 배너 */}
        <div className="bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl p-5 text-white">
          <p className="text-sm font-medium opacity-80 mb-0.5">안녕하세요 👋</p>
          <p className="text-lg font-bold">{mockProfile.name}님</p>
          <p className="text-xs opacity-70 mt-1">@{mockProfile.instagram} · {fmtFollowers(mockInstaStats.followers)} 팔로워</p>
        </div>

        {/* 활동 통계 */}
        <div className="grid grid-cols-4 gap-2">
          {SUMMARY_CARDS.map(card => (
            <button
              key={card.key}
              onClick={() => navigate('/campaigns/my')}
              className="bg-white rounded-2xl border border-gray-100 p-3 text-center hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <p className={`text-xl font-bold ${card.color}`}>{mockCampaignSummary[card.key]}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{card.label}</p>
            </button>
          ))}
        </div>

        {/* 마감 임박 알림 */}
        {urgentCampaigns.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-orange-500 shrink-0" />
              <p className="text-xs font-semibold text-orange-700">콘텐츠 제출 마감 임박!</p>
            </div>
            <div className="space-y-1.5">
              {urgentCampaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate('/campaigns/my')}
                  className="w-full flex items-center justify-between text-left bg-white rounded-xl px-3 py-2.5 hover:bg-orange-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-orange-500">{fmtDate(c.contentDeadline!)}까지</p>
                  </div>
                  <ChevronRight size={13} className="text-gray-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 진행 중인 캠페인 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900">진행 중인 캠페인</p>
            <button
              onClick={() => navigate('/campaigns/my')}
              className="flex items-center gap-0.5 text-xs text-brand-green font-medium hover:underline"
            >
              전체보기 <ChevronRight size={13} />
            </button>
          </div>
          {activeCampaigns.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs text-gray-400">진행 중인 캠페인이 없어요</p>
              <button
                onClick={() => navigate('/campaigns/browse')}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-medium text-white bg-brand-green"
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
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusBadge status={c.status as ParticipationStatus} size="sm" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{c.progress}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-3 gap-3">
          <QuickMenu
            icon={<Compass size={20} className="text-brand-green" />}
            label="캠페인 탐색"
            onClick={() => navigate('/campaigns/browse')}
          />
          <QuickMenu
            icon={<Heart size={20} className="text-red-400" />}
            label={`관심 캠페인 ${bookmarkCount}`}
            onClick={() => navigate('/campaigns/favorites')}
          />
          <QuickMenu
            icon={<Wallet size={20} className="text-blue-400" />}
            label="정산"
            onClick={() => navigate('/settlement')}
          />
        </div>

        {/* SNS 지표 요약 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900">SNS 지표</p>
            <button
              onClick={() => navigate('/media')}
              className="flex items-center gap-0.5 text-xs text-brand-green font-medium hover:underline"
            >
              자세히 <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-50 px-2 py-3">
            {[
              { label: '팔로워', value: fmtFollowers(mockInstaStats.followers) },
              { label: '참여율', value: `${mockInstaStats.engagementRate}%`, highlight: true },
              { label: '게시물', value: String(mockInstaStats.posts) },
            ].map(item => (
              <div key={item.label} className="text-center px-3">
                <p className={`text-base font-bold ${item.highlight ? 'text-brand-green' : 'text-gray-900'}`}>{item.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mx-4 mb-3 px-3 py-2 rounded-xl bg-gray-50">
            <TrendingUp size={12} className="text-brand-green" />
            <p className="text-[11px] text-gray-500">인스타그램 <span className="font-medium text-gray-700">@{mockProfile.instagram}</span> 연결됨</p>
          </div>
        </div>

      </div>
    </Layout>
  )
}

function QuickMenu({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 py-4 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      {icon}
      <span className="text-[11px] font-medium text-gray-600 text-center leading-tight">{label}</span>
    </button>
  )
}
