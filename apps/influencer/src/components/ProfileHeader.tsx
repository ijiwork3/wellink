import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Link2, X } from 'lucide-react'
import { SNSPanel } from '@wellink/ui'
import { mockProfile, mockCampaignSummary } from '../services/mock/profile'
import { useEscToClose } from '../utils/useEscToClose'

const stats = [
  { label: '지원 완료', value: mockCampaignSummary.applied },
  { label: '참여중',   value: mockCampaignSummary.ongoing, highlight: true },
  { label: '참여 완료', value: mockCampaignSummary.completed },
  { label: '미선정',   value: mockCampaignSummary.eliminated },
]

export default function ProfileHeader() {
  const [snsOpen, setSnsOpen] = useState(false)
  const navigate = useNavigate()
  const initial = mockProfile.name.charAt(0)
  useEscToClose(snsOpen, () => setSnsOpen(false))

  return (
    <div className="@container bg-white border-b border-gray-100 px-4 py-4 @[640px]:px-6 @[640px]:py-5">
      <div className="max-w-screen-xl mx-auto flex flex-col @[640px]:flex-row @[640px]:items-start @[640px]:justify-between gap-3 @[640px]:gap-6">

        {/* 프로필 영역 */}
        <div className="flex flex-col gap-3 flex-1">

          {/* 상단 행: 아바타·이름·소개 (클릭 → 마이페이지) + SNS 버튼 */}
          <div className="flex items-start gap-3 @[640px]:gap-4">
            {/* 클릭 영역: 아바타 + 이름/소개 + chevron */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-start gap-3 @[640px]:gap-4 flex-1 text-left rounded-xl hover:bg-gray-50 -mx-1 px-1 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              aria-label="마이페이지로 이동"
            >
              {/* 아바타 */}
              <div className="w-12 h-12 @[640px]:w-16 @[640px]:h-16 text-lg @[640px]:text-2xl rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm bg-brand-green">
                {initial}
              </div>

              {/* 이름 + 소개 */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base @[640px]:text-lg font-bold text-gray-900 truncate">{mockProfile.name}님</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-green-bg text-brand-green-text flex-shrink-0 whitespace-nowrap">
                    인플루언서
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 @[640px]:line-clamp-none break-keep">
                  {mockProfile.bio}
                </p>
              </div>

              {/* 모바일 이동 표시 */}
              <ChevronRight size={16} className="text-gray-400 mt-1 flex-shrink-0 @[640px]:hidden" aria-hidden="true" />
            </button>

            {/* 모바일 SNS 버튼 — 클릭 영역 밖 */}
            <button
              onClick={() => setSnsOpen(true)}
              className="@[640px]:hidden flex-shrink-0 flex items-center gap-1 text-sm text-brand-green-text font-medium border border-brand-green-border rounded-lg px-2.5 py-1.5 mt-1 hover:bg-brand-green/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              aria-label="SNS 연결 상태 보기"
            >
              <Link2 size={14} aria-hidden="true" />
              SNS
            </button>
          </div>

          {/* 통계 4개 */}
          <div className="grid grid-cols-4 gap-1 @[640px]:gap-3 @[640px]:ml-20">
            {stats.map((s, i) => (
              <div key={s.label} className={`text-center min-w-0 ${i > 0 ? 'border-l border-gray-100' : ''}`}>
                <p className={`text-base @[640px]:text-xl font-bold tabular-nums truncate ${s.highlight ? 'text-brand-green-text' : 'text-gray-900'}`}>
                  {s.value}
                </p>
                <p className="text-xs @[640px]:text-sm text-gray-500 whitespace-nowrap truncate">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SNS 패널: 데스크탑 인라인 */}
        <div className="hidden @[640px]:block w-64 flex-shrink-0">
          <SNSPanel
            platforms={[
              { id: 'instagram', connected: mockProfile.instagramConnected, handle: mockProfile.instagramConnected ? mockProfile.instagram : undefined },
              { id: 'naver',     connected: false },
              { id: 'youtube',   connected: false },
            ]}
          />
        </div>
      </div>

      {/* 모바일 SNS 모달 */}
      {snsOpen && (
        <div
          className="@[640px]:hidden fixed inset-0 z-[200] flex items-end justify-center"
          onClick={() => setSnsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="연결된 SNS"
            className="relative w-full max-w-md bg-white rounded-t-2xl p-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-900">연결된 SNS</span>
              <button
                onClick={() => setSnsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <SNSPanel
              platforms={[
                { id: 'instagram', connected: mockProfile.instagramConnected, handle: mockProfile.instagramConnected ? mockProfile.instagram : undefined },
                { id: 'naver',     connected: false },
                { id: 'youtube',   connected: false },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
