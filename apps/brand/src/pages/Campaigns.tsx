import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Megaphone, ChevronRight, Calendar, Users, Wallet } from 'lucide-react'
import { ErrorState, StatusBadge, useQAMode } from '@wellink/ui'
import { fmtDate } from '../utils/fmtDate'

const campaigns = [
  {
    id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8,
    deadline: '2026-04-28', budget: 2000000, category: '피트니스',
  },
  {
    id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0,
    deadline: '2026-05-05', budget: 1500000, category: '뷰티/웰니스',
  },
  {
    id: 3, name: '여름 홈트 챌린지', status: '종료', total: 20, current: 20,
    deadline: '2026-04-01', budget: 3200000, category: '피트니스',
  },
  {
    id: 4, name: '프로틴 파우더 리뷰', status: '종료', total: 8, current: 8,
    deadline: '2026-03-20', budget: 800000, category: '헬스/영양',
  },
]

const tabs = ['전체', '대기중', '모집중', '종료'] as const
type Tab = typeof tabs[number]

const fmtBudget = (n: number) => n === 0 ? '-' : `₩${(n / 10000).toFixed(0)}만`

export default function Campaigns() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const [activeTab, setActiveTab] = useState<Tab>('전체')

  if (qa === 'loading') {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 bg-gray-200 rounded" />
          <div className="h-9 w-32 bg-gray-200 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex gap-4 px-5 py-3 border-b border-gray-100">
            {[40, 40, 40, 40].map((w, i) => (
              <div key={i} className="h-5 bg-gray-200 rounded" style={{ width: w + 'px' }} />
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-56 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (qa === 'error') {
    return <ErrorState message="캠페인 목록을 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  const qaEmpty = qa === 'empty'
  const filtered = qaEmpty ? [] : campaigns.filter(c => activeTab === '전체' || c.status === activeTab)

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl @md:text-2xl font-bold text-gray-900">캠페인 목록</h1>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-2 @sm:px-4 @sm:py-2.5 rounded-xl text-xs @sm:text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={14} aria-hidden="true" />
          새 캠페인 등록
        </button>
      </div>

      {/* 본문 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 탭 */}
        <div className="flex gap-1 px-2 @sm:px-4 border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-gray-900 font-semibold text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 리스트 / 빈 상태 */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Megaphone size={36} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-400">
              {activeTab !== '전체' ? `'${activeTab}' 상태의 캠페인이 없습니다.` : '등록된 캠페인이 없습니다.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map(c => (
              <li
                key={c.id}
                onClick={() => navigate(`/campaigns/${c.id}`)}
                className="flex items-center gap-3 @sm:gap-4 px-3 @sm:px-5 py-3.5 @sm:py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 @sm:w-14 @sm:h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Megaphone size={18} className="text-gray-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={c.status} dot={false} />
                    <span className="text-sm @sm:text-[15px] font-semibold text-gray-900 truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 @sm:gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={11} aria-hidden="true" />{fmtDate(c.deadline)}</span>
                    <span className="flex items-center gap-1"><Users size={11} aria-hidden="true" />지원자 {c.current}명</span>
                    <span className="flex items-center gap-1"><Wallet size={11} aria-hidden="true" />예산 {fmtBudget(c.budget)}</span>
                  </div>
                </div>
                <div className="hidden @sm:flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-700 transition-colors shrink-0">
                  <span>관리하기</span>
                  <ChevronRight size={14} aria-hidden="true" />
                </div>
                <ChevronRight size={16} className="@sm:hidden text-gray-300 shrink-0" aria-hidden="true" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
