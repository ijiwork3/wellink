import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Megaphone, ChevronRight, Calendar, Users, Wallet, Search, X, RotateCcw,
  Utensils, Sparkles, Dumbbell, Plane, Home, Baby,
} from 'lucide-react'
import { ErrorState, StatusBadge, PlatformBadge, CustomSelect, getDDay, getDDayBadgeStyle } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { fmtDate } from '../utils/fmtDate'

const CATEGORY_ICON: Record<string, { Icon: typeof Megaphone; bg: string; fg: string }> = {
  '맛집/푸드':     { Icon: Utensils, bg: 'bg-orange-50',   fg: 'text-orange-500' },
  '뷰티/패션':     { Icon: Sparkles, bg: 'bg-pink-50',     fg: 'text-pink-500' },
  '피트니스':      { Icon: Dumbbell, bg: 'bg-emerald-50',  fg: 'text-emerald-600' },
  '여행':          { Icon: Plane,    bg: 'bg-sky-50',      fg: 'text-sky-500' },
  '라이프스타일':  { Icon: Home,     bg: 'bg-violet-50',   fg: 'text-violet-500' },
  '육아':          { Icon: Baby,     bg: 'bg-amber-50',    fg: 'text-amber-500' },
}

type Campaign = {
  id: number; name: string; status: '모집중' | '대기중' | '종료';
  total: number; current: number; deadline: string; budget: number;
  category: string; platform: string;
}

const SEED_CAMPAIGNS: Campaign[] = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8, deadline: '2026-04-28', budget: 2000000, category: '피트니스', platform: '인스타그램' },
  { id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0, deadline: '2026-05-05', budget: 1500000, category: '뷰티/패션', platform: '유튜브' },
  { id: 3, name: '여름 홈트 챌린지', status: '종료', total: 20, current: 20, deadline: '2026-04-01', budget: 3200000, category: '피트니스', platform: '인스타그램' },
  { id: 4, name: '프로틴 파우더 리뷰', status: '종료', total: 8, current: 8, deadline: '2026-03-20', budget: 800000, category: '피트니스', platform: '네이버 블로그' },
]

const NAME_TEMPLATES: Record<string, string[]> = {
  '맛집/푸드': ['신메뉴 시식 리뷰', '비건 디저트 체험', '수제 베이커리 캠페인', '프리미엄 한식 디너'],
  '뷰티/패션': ['앰플 신제품 체험', '봄 신상 메이크업', 'SS 컬렉션 룩북', '향수 시그니처 라인'],
  '피트니스': ['홈트 루틴 챌린지', '단백질 보충제 리뷰', '필라테스 클래스 체험', '러닝화 신제품'],
  '여행': ['제주 호캉스 패키지', '동남아 휴양지 후기', '강원도 워케이션', '유럽 자유여행 가이드'],
  '라이프스타일': ['미니멀 인테리어', '홈카페 굿즈 리뷰', '반려동물 용품', '독서 챌린지'],
  '육아': ['신생아 용품 체험', '유아식 레시피', '교육 완구 리뷰', '주말 가족 나들이'],
}
const PLATFORM_LIST = ['인스타그램', '유튜브', '네이버 블로그', '틱톡']
const CATEGORY_LIST = Object.keys(NAME_TEMPLATES)
const STATUS_LIST: Campaign['status'][] = ['모집중', '대기중', '종료']

const generated: Campaign[] = Array.from({ length: 96 }, (_, i) => {
  const id = i + 5
  const category = CATEGORY_LIST[i % CATEGORY_LIST.length]
  const tplList = NAME_TEMPLATES[category]
  const baseName = tplList[i % tplList.length]
  const status = STATUS_LIST[i % STATUS_LIST.length]
  const platform = PLATFORM_LIST[i % PLATFORM_LIST.length]
  const total = 5 + (i % 8) * 5
  const current = status === '종료' ? total : status === '대기중' ? 0 : Math.floor(total * ((i % 5) + 1) / 6)
  const month = ((i % 6) + 1).toString().padStart(2, '0')
  const day = ((i % 27) + 1).toString().padStart(2, '0')
  const deadline = `2026-${month}-${day}`
  const budget = (i % 7 + 1) * 500000
  return { id, name: `${baseName} #${id}`, status, total, current, deadline, budget, category, platform }
})

const campaigns: Campaign[] = [...SEED_CAMPAIGNS, ...generated]

const tabs = ['전체', '대기중', '모집중', '종료'] as const
type Tab = typeof tabs[number]

const PLATFORMS = ['전체', '인스타그램', '유튜브', '네이버 블로그', '틱톡'] as const
const CATEGORIES = ['전체', '맛집/푸드', '뷰티/패션', '피트니스', '여행', '라이프스타일', '육아'] as const
const SORTS = [
  { value: 'deadline', label: '마감 임박순' },
  { value: 'recent', label: '최근 등록순' },
  { value: 'budget-desc', label: '예산 높은순' },
  { value: 'budget-asc', label: '예산 낮은순' },
  { value: 'applicants-desc', label: '지원자 많은순' },
  { value: 'progress-desc', label: '모집률 높은순' },
] as const
type SortKey = typeof SORTS[number]['value']

const fmtBudget = (n: number) => n === 0 ? '-' : `₩${(n / 10000).toFixed(0)}만`

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-700 -mr-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-full"
        aria-label={`${label} 제거`}
      >
        <X size={10} aria-hidden="true" />
      </button>
    </span>
  )
}

export default function Campaigns() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL ←→ state 초기값 동기화 (한 번만)
  const isTab = (v: string | null): v is Tab => !!v && (tabs as readonly string[]).includes(v)
  const isSort = (v: string | null): v is SortKey => !!v && SORTS.some(s => s.value === v)

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const v = searchParams.get('tab'); return isTab(v) ? v : '전체'
  })
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [platformFilter, setPlatformFilter] = useState<string>(() => searchParams.get('platform') ?? '전체')
  const [categoryFilter, setCategoryFilter] = useState<string>(() => searchParams.get('category') ?? '전체')
  const [sort, setSort] = useState<SortKey>(() => {
    const v = searchParams.get('sort'); return isSort(v) ? v : 'deadline'
  })
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1))
  const PAGE_SIZE = 10

  // state → URL 동기화 (기본값은 URL에서 제거해 깔끔하게)
  useEffect(() => {
    const next = new URLSearchParams()
    if (activeTab !== '전체')         next.set('tab', activeTab)
    if (search)                       next.set('q', search)
    if (platformFilter !== '전체')    next.set('platform', platformFilter)
    if (categoryFilter !== '전체')    next.set('category', categoryFilter)
    if (sort !== 'deadline')          next.set('sort', sort)
    if (page !== 1)                   next.set('page', String(page))
    // QA 파라미터 보존
    const qaParam = searchParams.get('qa')
    if (qaParam) next.set('qa', qaParam)
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, search, platformFilter, categoryFilter, sort, page])

  const hasActiveFilters =
    search !== '' || platformFilter !== '전체' || categoryFilter !== '전체' || activeTab !== '전체'

  const resetAllFilters = () => {
    setActiveTab('전체')
    setSearch('')
    setPlatformFilter('전체')
    setCategoryFilter('전체')
    setPage(1)
  }

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
  const filtered = useMemo(() => {
    if (qaEmpty) return []
    const q = search.trim().toLowerCase()
    const list = campaigns.filter(c =>
      (activeTab === '전체' || c.status === activeTab) &&
      (platformFilter === '전체' || c.platform === platformFilter) &&
      (categoryFilter === '전체' || c.category === categoryFilter) &&
      (!q || c.name.toLowerCase().includes(q))
    )
    const sorted = [...list]
    const tieBreak = (a: Campaign, b: Campaign) => b.id - a.id // 동률 → 최신순
    sorted.sort((a, b) => {
      let primary = 0
      if (sort === 'deadline')          primary = a.deadline.localeCompare(b.deadline)
      else if (sort === 'recent')       primary = b.id - a.id
      else if (sort === 'budget-desc')  primary = b.budget - a.budget
      else if (sort === 'budget-asc')   primary = a.budget - b.budget
      else if (sort === 'applicants-desc') primary = b.current - a.current
      else if (sort === 'progress-desc')   primary = (b.current / Math.max(b.total, 1)) - (a.current / Math.max(a.total, 1))
      return primary !== 0 ? primary : tieBreak(a, b)
    })
    return sorted
  }, [qaEmpty, search, activeTab, platformFilter, categoryFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const resetPage = () => setPage(1)

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl @md:text-2xl font-bold text-gray-900">캠페인 목록</h1>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-1.5 bg-brand-green text-white px-3 py-2 @sm:px-4 @sm:py-2.5 rounded-xl text-xs @sm:text-sm font-medium hover:opacity-90 transition-opacity"
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
              onClick={() => { setActiveTab(tab); resetPage() }}
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

        {/* 검색 + 필터 + 정렬 */}
        <div className="px-3 @sm:px-5 py-3 border-b border-gray-100 space-y-2 @sm:space-y-0 @sm:flex @sm:items-center @sm:gap-2 @sm:flex-wrap">
          <div className="relative w-full @sm:flex-1 @sm:min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage() }}
              placeholder="캠페인명 검색"
              className="w-full pl-8 pr-8 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:bg-white focus:border-gray-300 placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); resetPage() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                aria-label="검색어 지우기"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 @sm:flex @sm:items-center @sm:gap-2">
            <CustomSelect
              value={platformFilter}
              onChange={v => { setPlatformFilter(v); resetPage() }}
              options={PLATFORMS.map(p => ({ label: p === '전체' ? '플랫폼 전체' : p, value: p }))}
              className="@sm:w-36"
            />
            <CustomSelect
              value={categoryFilter}
              onChange={v => { setCategoryFilter(v); resetPage() }}
              options={CATEGORIES.map(c => ({ label: c === '전체' ? '카테고리 전체' : c, value: c }))}
              className="@sm:w-36"
            />
            <CustomSelect
              value={sort}
              onChange={v => { setSort(v as SortKey); resetPage() }}
              options={SORTS.map(s => ({ label: s.label, value: s.value }))}
              className="col-span-2 @sm:col-span-1 @sm:w-36"
            />
          </div>
        </div>

        {/* 활성 필터 칩 */}
        {hasActiveFilters && (
          <div className="px-3 @sm:px-5 py-2 border-b border-gray-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 shrink-0">적용된 필터:</span>
            {activeTab !== '전체' && (
              <FilterChip label={`상태: ${activeTab}`} onRemove={() => { setActiveTab('전체'); resetPage() }} />
            )}
            {search && (
              <FilterChip label={`검색: ${search}`} onRemove={() => { setSearch(''); resetPage() }} />
            )}
            {platformFilter !== '전체' && (
              <FilterChip label={`플랫폼: ${platformFilter}`} onRemove={() => { setPlatformFilter('전체'); resetPage() }} />
            )}
            {categoryFilter !== '전체' && (
              <FilterChip label={`카테고리: ${categoryFilter}`} onRemove={() => { setCategoryFilter('전체'); resetPage() }} />
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <RotateCcw size={11} aria-hidden="true" />
              초기화
            </button>
          </div>
        )}

        {/* 리스트 / 빈 상태 */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Megaphone size={36} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-400 mb-3">
              {qaEmpty
                ? '등록된 캠페인이 없습니다.'
                : hasActiveFilters
                ? '조건에 맞는 캠페인이 없습니다.'
                : '등록된 캠페인이 없습니다.'}
            </p>
            {!qaEmpty && hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
              >
                <RotateCcw size={12} aria-hidden="true" />
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {paged.map(c => {
              const cat = CATEGORY_ICON[c.category] ?? { Icon: Megaphone, bg: 'bg-gray-100', fg: 'text-gray-400' }
              const CatIcon = cat.Icon
              const dday = getDDay(c.deadline)
              const showDDay = c.status !== '종료'
              const pct = c.total > 0 ? Math.min(100, Math.round((c.current / c.total) * 100)) : 0
              return (
              <li
                key={c.id}
                onClick={() => navigate(`/campaigns/${c.id}`)}
                className="flex items-center gap-3 @sm:gap-4 px-3 @sm:px-5 py-3.5 @sm:py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className={`w-12 h-12 @sm:w-14 @sm:h-14 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                  <CatIcon size={20} className={cat.fg} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <StatusBadge status={c.status} dot={false} />
                    <PlatformBadge platform={c.platform} />
                    {showDDay && (
                      <span className={getDDayBadgeStyle(dday.color, dday.pulse)}>{dday.label}</span>
                    )}
                  </div>
                  <p className="text-sm @sm:text-[15px] font-semibold text-gray-900 truncate mb-1">{c.name}</p>
                  <div className="flex items-center gap-x-3 @sm:gap-x-4 gap-y-1 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={11} aria-hidden="true" />{fmtDate(c.deadline)}</span>
                    <span className="flex items-center gap-1"><Users size={11} aria-hidden="true" />{c.current}/{c.total}명</span>
                    <span className="flex items-center gap-1"><Wallet size={11} aria-hidden="true" />예산 {fmtBudget(c.budget)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-gray-400' : 'bg-brand-green'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 tabular-nums shrink-0">{pct}%</span>
                  </div>
                </div>
                <div className="hidden @sm:flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-700 transition-colors shrink-0">
                  <span>관리하기</span>
                  <ChevronRight size={14} aria-hidden="true" />
                </div>
                <ChevronRight size={16} className="@sm:hidden text-gray-300 shrink-0" aria-hidden="true" />
              </li>
              )
            })}
          </ul>
        )}

        {/* 페이지네이션 */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-2 px-3 @sm:px-5 py-3 border-t border-gray-100 flex-wrap">
            <span className="text-xs text-gray-500 shrink-0">
              총 {filtered.length}개 · {safePage} / {totalPages}
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >이전</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | '…')[]>((acc, p) => {
                  if (acc.length && p - (acc[acc.length - 1] as number) > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`gap-${i}`} className="text-xs text-gray-400 px-1">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        safePage === p
                          ? 'bg-gray-100 text-gray-900'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >{p}</button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >다음</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
