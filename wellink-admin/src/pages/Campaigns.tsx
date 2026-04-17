import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Megaphone } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

const campaigns = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8, deadline: '2026-04-11', budget: '2,000,000원', category: '피트니스' },
  { id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0, deadline: '2026-04-18', budget: '1,500,000원', category: '뷰티/웰니스' },
]

const tabs = ['전체', '대기중', '모집중', '종료']

function getDDay(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff === 0) return 'D-Day'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}

export default function Campaigns() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('전체')

  const filtered = campaigns.filter(c => activeTab === '전체' || c.status === activeTab)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">캠페인 목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">진행 중인 캠페인을 관리합니다.</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 bg-[#8CC63F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors"
        >
          <Plus size={16} />
          새 캠페인 등록
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-[#8CC63F] font-semibold text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
            {tab !== '전체' && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#8CC63F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {campaigns.filter(c => c.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <Megaphone size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">등록된 캠페인이 없습니다.</p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="mt-4 text-sm bg-[#8CC63F] text-white px-4 py-2 rounded-xl hover:bg-[#7AB535] transition-colors"
          >
            첫 캠페인 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(c => {
            const progress = c.total > 0 ? Math.round((c.current / c.total) * 100) : 0
            const dday = getDDay(c.deadline)
            const ddayNum = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000)
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/campaigns/${c.id}`)}
                className="bg-white rounded-xl border border-gray-100 p-5 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{c.name}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>카테고리: {c.category}</span>
                      <span>예산: {c.budget}</span>
                      <span>마감: {c.deadline} <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-0.5 ${ddayNum <= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{dday}</span></span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/campaigns/${c.id}`) }}
                    className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
                  >
                    상세보기
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>모집 현황</span>
                    <span>{c.current}/{c.total}명 ({progress}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#8CC63F' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
