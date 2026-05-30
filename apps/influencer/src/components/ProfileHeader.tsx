import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { mockProfile, mockCampaignSummary, INFLUENCER_TYPES } from '../services/mock/profile'
import { useEscToClose } from '../utils/useEscToClose'

const stats = [
  { label: '지원 완료', value: mockCampaignSummary.applied,    tab: '지원완료' },
  { label: '참여중',   value: mockCampaignSummary.ongoing,    tab: '참여중', highlight: true },
  { label: '참여 완료', value: mockCampaignSummary.completed,  tab: '완료' },
  { label: '미선정',   value: mockCampaignSummary.eliminated, tab: '미선정' },
]

export default function ProfileHeader() {
  const [, setSnsOpen] = useState(false)
  const navigate = useNavigate()
  const initial = mockProfile.name.charAt(0)
  const displayType = INFLUENCER_TYPES.find(t => t.value === mockProfile.influencerType)?.label ?? '개인 인플루언서'
  useEscToClose(false, () => setSnsOpen(false))

  return (
    <div className="@container bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-4 @[640px]:px-6 @[640px]:py-5">

        {/* 프로필 행 */}
        <div className="flex items-start gap-3 @[640px]:gap-4 mb-3 @[640px]:mb-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-start gap-3 @[640px]:gap-4 flex-1 text-left rounded-xl hover:bg-gray-50 -mx-1 px-1 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            aria-label="마이페이지로 이동"
          >
            <div className="w-12 h-12 @[640px]:w-14 @[640px]:h-14 rounded-full ring-2 ring-brand-green/40 ring-offset-2 bg-brand-green flex items-center justify-center text-white text-lg @[640px]:text-xl font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-base @[640px]:text-lg font-bold text-gray-900 truncate">{mockProfile.name}님</span>
                <span className="px-2 py-0.5 bg-lime-100 text-lime-700 text-[10px] font-bold rounded-full flex-shrink-0 whitespace-nowrap">{displayType}</span>
                {/* 인스타 연결 시 핸들 인라인 표시 */}
                {mockProfile.instagramConnected && (
                  <span className="text-sm text-gray-400 font-normal flex-shrink-0 whitespace-nowrap">@{mockProfile.instagram}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-1 break-keep">{mockProfile.bio}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 mt-1 flex-shrink-0 @[640px]:hidden" aria-hidden="true" />
          </button>
        </div>

        {/* 통계 행 */}
        <div className="grid grid-cols-4 gap-1.5 @[640px]:gap-2 @[640px]:ml-[calc(3.5rem+1rem)]">
          {stats.map(s => (
            <button
              type="button"
              key={s.label}
              onClick={() => navigate(`/campaigns/my?tab=${s.tab}`)}
              className="bg-gray-50 hover:bg-gray-100 rounded-xl py-2.5 px-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              aria-label={`${s.label} ${s.value}건 보기`}
            >
              <p className={`text-lg @[640px]:text-xl font-bold tabular-nums ${s.highlight ? 'text-brand-green-text' : 'text-gray-900'}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap truncate">{s.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
