import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Megaphone, Search, X, BarChart2, Users, Clock, TrendingUp, ChevronRight, LayoutGrid, List } from 'lucide-react'
import { ErrorState, StatusBadge, useQAMode, fmtNumber, ENGAGEMENT_THRESHOLD, getDDay, getDDayBadgeStyle, PROGRESS_THRESHOLD } from '@wellink/ui'
import { fmtDate } from '../utils/fmtDate'


const campaigns = [
  {
    id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8,
    deadline: '2026-04-28', budget: '2,000,000', category: '피트니스',
    platform: 'Instagram', reach: 48200, engRate: 4.2,
    thumbnail: null,
  },
  {
    id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0,
    deadline: '2026-05-05', budget: '1,500,000', category: '뷰티/웰니스',
    platform: 'Instagram', reach: 0, engRate: 0,
    thumbnail: null,
  },
  {
    id: 3, name: '여름 홈트 챌린지', status: '종료', total: 20, current: 20,
    deadline: '2026-04-01', budget: '3,200,000', category: '피트니스',
    platform: 'Instagram + YouTube', reach: 128000, engRate: 5.8,
    thumbnail: null,
  },
  {
    id: 4, name: '프로틴 파우더 리뷰', status: '종료', total: 8, current: 8,
    deadline: '2026-03-20', budget: '800,000', category: '헬스/영양',
    platform: 'Instagram', reach: 62400, engRate: 3.9,
    thumbnail: null,
  },
]

const tabs = ['전체', '대기중', '모집중', '종료'] as const
type Tab = typeof tabs[number]


export default function Campaigns() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const [activeTab, setActiveTab] = useState<Tab>('전체')
  const [search, setSearch] = useState(qa === 'filter-empty' ? '매칭없는검색어zzz' : '')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(qa === 'grid' ? 'grid' : 'list')

  // sync grid view mode — early return 이전에 선언 (Rules of Hooks)
  useEffect(() => {
    if (qa === 'grid') setViewMode('grid')
  }, [qa])

  // qa=loading
  if (qa === 'loading') {
    return (
      <div className="space-y-5 animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-xl" />
        </div>
        {/* 필터 바 스켈레톤 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
          <div className="h-10 w-20 bg-gray-200 rounded-lg" />
        </div>
        {/* 탭 스켈레톤 */}
        <div className="flex gap-1 border-b border-gray-200 pb-2">
          {[52, 44, 44, 44].map((w, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded" style={{ width: w + 'px' }} />
          ))}
        </div>
        {/* 카드 그리드 4개 스켈레톤 */}
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="h-5 w-16 bg-gray-200 rounded-full mb-2" />
                  <div className="h-4 w-36 bg-gray-200 rounded mb-1.5" />
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
                <div className="h-5 w-10 bg-gray-200 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[0, 1, 2].map(j => (
                  <div key={j} className="h-14 bg-gray-100 rounded-lg" />
                ))}
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // qa=error
  if (qa === 'error') {
    return <ErrorState message="캠페인 목록을 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  // qa=empty → override filtered to show empty state
  const qaEmpty = qa === 'empty'

  const filtered = qaEmpty ? [] : campaigns.filter(c => {
    const matchTab = activeTab === '전체' || c.status === activeTab
    const matchSearch = search === '' || c.name.includes(search) || c.category.includes(search)
    return matchTab && matchSearch
  })

  // 검색어+탭 필터 적용된 결과 (탭별 카운트 계산용 — 검색어만 적용, 탭 필터 미적용)
  const filteredBySearch = qaEmpty ? [] : campaigns.filter(c =>
    search === '' || c.name.includes(search) || c.category.includes(search)
  )
  const tabCounts: Record<Tab, number> = {
    전체: filteredBySearch.length,
    대기중: filteredBySearch.filter(c => c.status === '대기중').length,
    모집중: filteredBySearch.filter(c => c.status === '모집중').length,
    종료: filteredBySearch.filter(c => c.status === '종료').length,
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">캠페인 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {filtered.length}개 캠페인</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
        >
          <Plus size={16} aria-hidden="true" />
          새 캠페인 등록
        </button>
      </div>

      {/* 검색 + 뷰 토글 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="캠페인명, 카테고리 검색..."
            aria-label="캠페인 검색"
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="검색어 삭제"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('list')}
            aria-label="리스트 보기"
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
          >
            <List size={14} aria-hidden="true" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            aria-label="그리드 보기"
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
          >
            <LayoutGrid size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-green font-semibold text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === tab ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* 빈 상태 */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
          <Megaphone size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-400">
            {search
              ? `'${search}' 검색 결과가 없습니다.`
              : activeTab !== '전체'
              ? `'${activeTab}' 상태의 캠페인이 없습니다.`
              : '등록된 캠페인이 없습니다.'}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/campaigns/new')}
              className="mt-4 text-sm bg-brand-green text-white px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors"
            >
              첫 캠페인 만들기
            </button>
          )}
        </div>
      )}

      {/* 리스트 뷰 */}
      {filtered.length > 0 && viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-5">캠페인</th>
                <th scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">카테고리</th>
                <th scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">플랫폼</th>
                <th scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">상태</th>
                <th scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">모집 현황</th>
                <th scope="col" className="text-right text-xs font-medium text-gray-500 py-3 px-4">도달 / 참여율</th>
                <th scope="col" className="text-left text-xs font-medium text-gray-500 py-3 px-4">마감</th>
                <th scope="col" className="py-3 px-4"><span className="sr-only">액션</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => {
                const progress = c.total > 0 ? Math.round((c.current / c.total) * 100) : 0
                const { label: ddayLabel, color: ddayColor, pulse: ddayPulse } = getDDay(c.deadline)
                const ddayBadge = getDDayBadgeStyle(ddayColor, ddayPulse)
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Megaphone size={14} className="text-gray-400" aria-hidden="true" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 max-w-[180px] truncate">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{c.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">{c.platform}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          {/* data-policy-v1 §3: 모집 진행률 80%+ 빨강 */}
                          <div
                            className={`h-full rounded-full ${progress === 0 ? 'bg-gray-200' : progress >= PROGRESS_THRESHOLD.warning ? 'bg-red-500' : 'bg-brand-green'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{c.current}/{c.total}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.reach > 0 ? (
                        <div>
                          <p className="text-xs font-medium text-gray-700">{fmtNumber(c.reach)} 도달</p>
                          <p className={`text-xs font-semibold ${c.engRate >= ENGAGEMENT_THRESHOLD.high ? 'text-brand-green-text' : c.engRate >= ENGAGEMENT_THRESHOLD.low ? 'text-gray-700' : 'text-red-500'}`}>
                            {c.engRate}% 참여율
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" aria-hidden="true" />
                        <span className="text-xs text-gray-500">{fmtDate(c.deadline)}</span>
                        <span className={`text-[10px] ${ddayBadge}`}>{ddayLabel}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" aria-hidden="true" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* 그리드 뷰 */}
      {filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
          {filtered.map(c => {
            const progress = c.total > 0 ? Math.round((c.current / c.total) * 100) : 0
            const { label: ddayLabel, color: ddayColor, pulse: ddayPulse } = getDDay(c.deadline)
            const ddayBadge = getDDayBadgeStyle(ddayColor, ddayPulse)
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/campaigns/${c.id}`)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <StatusBadge status={c.status} dot={false} />
                    <h3 className="text-sm font-semibold text-gray-900 mt-2 truncate max-w-[200px]">{c.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{c.category} · {c.platform}</p>
                  </div>
                  <span className={`text-[10px] ${ddayBadge}`}>{ddayLabel}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <Users size={12} className="text-gray-400 mx-auto mb-0.5" aria-hidden="true" />
                    <p className="text-xs font-semibold text-gray-700">{c.current}/{c.total}</p>
                    <p className="text-[10px] text-gray-400">모집</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <BarChart2 size={12} className="text-gray-400 mx-auto mb-0.5" aria-hidden="true" />
                    <p className="text-xs font-semibold text-gray-700">{c.reach > 0 ? fmtNumber(c.reach) : '—'}</p>
                    <p className="text-[10px] text-gray-400">도달</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <TrendingUp size={12} className="text-gray-400 mx-auto mb-0.5" aria-hidden="true" />
                    <p className={`text-xs font-semibold ${c.engRate >= ENGAGEMENT_THRESHOLD.high ? 'text-brand-green-text' : c.engRate >= ENGAGEMENT_THRESHOLD.low ? 'text-gray-700' : c.engRate > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {c.engRate > 0 ? `${c.engRate}%` : '—'}
                    </p>
                    <p className="text-[10px] text-gray-400">참여율</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>모집 진행률</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    {/* data-policy-v1 §3: 모집 진행률 80%+ 빨강 */}
                    <div className={`h-full rounded-full ${progress === 0 ? 'bg-gray-200' : progress >= PROGRESS_THRESHOLD.warning ? 'bg-red-500' : 'bg-brand-green'}`} style={{ width: `${progress}%` }} />
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
