import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Megaphone, ChevronRight, Calendar, Users, Wallet, Search, X, RotateCcw,
  MoreVertical, Copy, Share2,
  Utensils, Sparkles, Dumbbell, Plane, Home, Baby,
} from 'lucide-react'
import { ErrorState, StatusBadge, PlatformBadge, CustomSelect, Dropdown, AlertModal, Tooltip, Pagination, Modal, getDDay, getDDayBadgeStyle, useToast } from '@wellink/ui'
import type { CampaignStatus } from '@wellink/ui'
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
  id: number; name: string; status: CampaignStatus;
  total: number; current: number; deadline: string; budget: number;
  category: string; platform: string;
  imageUrl?: string  // 캠페인 대표 이미지 — 원본 displayImgUrl 동등
  createdAt: string  // 캠페인 등록일 (YYYY-MM-DD) — 원본 createdAt 동등, 최근 등록순 정렬·관리에 사용
  selectedCount?: number  // 선정 인원 (정책서 § 7-2) — 광고주가 지원자 중 선정한 수
}

const SEED_CAMPAIGNS: Campaign[] = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8, deadline: '2026-04-28', budget: 2000000, category: '피트니스', platform: '인스타그램', imageUrl: 'https://picsum.photos/seed/wellink-1/160/160', createdAt: '2026-04-10' },
  { id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0, deadline: '2026-05-05', budget: 1500000, category: '뷰티/패션', platform: '유튜브', imageUrl: 'https://picsum.photos/seed/wellink-2/160/160', createdAt: '2026-04-18' },
  { id: 3, name: '여름 홈트 챌린지', status: '완료', total: 20, current: 20, deadline: '2026-04-01', budget: 3200000, category: '피트니스', platform: '인스타그램', imageUrl: 'https://picsum.photos/seed/wellink-3/160/160', createdAt: '2026-03-05' },
  { id: 4, name: '프로틴 파우더 리뷰', status: '종료', total: 8, current: 8, deadline: '2026-03-20', budget: 800000, category: '피트니스', platform: '네이버 블로그', imageUrl: 'https://picsum.photos/seed/wellink-4/160/160', createdAt: '2026-02-25' },
  { id: 5, name: '뷰티 디바이스 체험단', status: '진행중', total: 12, current: 12, deadline: '2026-05-10', budget: 1800000, category: '뷰티/패션', platform: '인스타그램', imageUrl: 'https://picsum.photos/seed/wellink-5/160/160', createdAt: '2026-04-12' },
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
const STATUS_LIST: CampaignStatus[] = ['대기중', '모집중', '진행중', '완료', '종료']

const generated: Campaign[] = Array.from({ length: 95 }, (_, i) => {
  const id = i + 6
  const category = CATEGORY_LIST[i % CATEGORY_LIST.length]
  const tplList = NAME_TEMPLATES[category]
  const baseName = tplList[i % tplList.length]
  const status = STATUS_LIST[i % STATUS_LIST.length]
  const platform = PLATFORM_LIST[i % PLATFORM_LIST.length]
  const total = 5 + (i % 8) * 5
  const current = status === '대기중' ? 0
                : status === '모집중' ? Math.floor(total * ((i % 5) + 1) / 6)
                : total
  // 선정 인원: 진행중·완료·종료는 모집과 동일, 모집중은 일부만 선정, 대기중은 0 (정책서 § 7-2)
  const selectedCount = status === '대기중' ? 0
                      : status === '모집중' ? Math.max(0, current - Math.ceil(current / 3))
                      : current
  const month = ((i % 6) + 1).toString().padStart(2, '0')
  const day = ((i % 27) + 1).toString().padStart(2, '0')
  const deadline = `2026-${month}-${day}`
  // 등록일은 마감 7~30일 전으로 추정 (i 기반 결정성 유지)
  const createdMonth = (((i % 6) + 1) - 1 || 1).toString().padStart(2, '0')
  const createdDay = (((i % 20) + 1)).toString().padStart(2, '0')
  const createdAt = `2026-${createdMonth}-${createdDay}`
  const budget = (i % 7 + 1) * 500000
  return {
    id, name: `${baseName} #${id}`, status, total, current, selectedCount, deadline, budget, category, platform,
    imageUrl: `https://picsum.photos/seed/wellink-${id}/160/160`,
    createdAt,
  }
})

const campaigns: Campaign[] = [...SEED_CAMPAIGNS, ...generated]

const tabs = ['전체', '대기중', '모집중', '마감임박', '진행중', '완료', '종료'] as const
type Tab = typeof tabs[number]

/**
 * 마감임박 D-Day 임계값 (정책서 § 4 Q4) — 추후 변경 가능성 대비 상수로 관리
 */
const URGENT_THRESHOLD_DAYS = 3

/**
 * 콘텐츠 등록 마감 후 자동 대기 기간 (정책서 § 7-1) — 마감일 이후에도 14일까지는 등록을 기다림
 */
const UPLOAD_GRACE_DAYS = 14

/**
 * 컨텍스트별 마감일 라벨 산출 (정책서 § 7-1)
 *
 * 반환: { prefix, deadline, gracePassed, graceDaysLeft }
 * - prefix: "모집 ~" / "등록 ~" / "종료" 등
 * - graceDaysLeft: 등록 마감 후 추가 대기 잔여 일수 (양수면 표시)
 */
function getCampaignDeadlineMeta(c: Campaign): { prefix: string; muted: boolean; graceText?: string } {
  const display = deriveDisplayStatus(c)
  if (display === '완료' || display === '종료') {
    return { prefix: '종료', muted: true }
  }
  if (display === '진행중') {
    const d = getDDay(c.deadline)
    if (d.label.startsWith('D+')) {
      const passed = Number(d.label.slice(2))
      const left = UPLOAD_GRACE_DAYS - passed
      if (left > 0) {
        return { prefix: '등록 ~', muted: false, graceText: `등록 마감 D+${passed} · 추가 등록 대기 중` }
      }
    }
    return { prefix: '등록 ~', muted: false }
  }
  return { prefix: '모집 ~', muted: false }
}

/**
 * "선정 필요" 판정 — 모집중인데 D-Day가 지난(마감 후) + 미선정 캠페인 (정책서 § 4-2)
 */
function needsSelection(c: Campaign): boolean {
  if (c.status !== '모집중') return false
  const d = getDDay(c.deadline)
  // D+1 이상이면 마감일 경과
  const passed = d.label.startsWith('D+')
  return passed && (c.selectedCount ?? 0) < c.current
}

/**
 * 표시용 status 파생 — 정책서 § 4-0 친절화
 * - 모집중 + D-Day 임계값 이하 = '마감임박'
 * - 모집 마감 후 미선정 = '선정 필요' (광고주 액션 필요)
 * - 진행중 + 선정 인원 < 모집 인원 = '업로드 대기'(향후) — 현 mock 데이터 기준 단순화
 * (원 데이터 status는 보존, UI 분류 전용)
 */
function deriveDisplayStatus(c: Campaign): CampaignStatus {
  if (needsSelection(c)) return '선정 필요'
  if (c.status === '모집중') {
    const d = getDDay(c.deadline)
    if (d.label === 'D-Day' || (d.label.startsWith('D-') && Number(d.label.slice(2)) <= URGENT_THRESHOLD_DAYS)) {
      return '마감임박'
    }
  }
  return c.status
}

/**
 * 칩 보조 설명 (Tooltip 컨텐츠) — 정책서 § 4-0
 */
function getStatusTooltip(status: string): string | null {
  switch (status) {
    case '대기중':       return '지원자 발생을 기다리는 단계입니다.'
    case '선정 필요':    return '모집이 끝났습니다. 지원자 선정을 진행해주세요.'
    case '진행중':       return '인플루언서가 콘텐츠를 등록하는 단계입니다.'
    default:             return null
  }
}

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

  // 다중 탭 선택 (정책서 § 4-1) — Cmd/Ctrl 클릭으로 토글, "전체"는 단일 전용
  const [activeTabs, setActiveTabs] = useState<Tab[]>(() => {
    const raw = searchParams.get('tab')
    if (!raw) return ['전체']
    const list = raw.split(',').filter(isTab)
    if (list.length === 0) return ['전체']
    if (list.includes('전체')) return ['전체']
    return list
  })
  const isAllTabActive = activeTabs.length === 1 && activeTabs[0] === '전체'
  const handleTabClick = (tab: Tab, e?: { metaKey?: boolean; ctrlKey?: boolean }) => {
    const multi = !!(e?.metaKey || e?.ctrlKey)
    if (tab === '전체' || !multi) {
      setActiveTabs([tab])
    } else if (activeTabs.includes(tab)) {
      const next = activeTabs.filter(t => t !== tab)
      setActiveTabs(next.length === 0 ? ['전체'] : next)
    } else {
      const next = activeTabs.filter(t => t !== '전체')
      setActiveTabs([...next, tab])
    }
    setPage(1)
  }
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [platformFilter, setPlatformFilter] = useState<string>(() => searchParams.get('platform') ?? '전체')
  const [categoryFilter, setCategoryFilter] = useState<string>(() => searchParams.get('category') ?? '전체')
  const [sort, setSort] = useState<SortKey>(() => {
    const v = searchParams.get('sort'); return isSort(v) ? v : 'deadline'
  })
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1))

  // AI 캠페인 생성 (정책서 § 16) — input → loading → result
  const [aiModalStep, setAiModalStep] = useState<null | 'input' | 'loading' | 'result'>(null)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiPhase, setAiPhase] = useState<1 | 2 | 3 | 4>(1)
  const [aiInput, setAiInput] = useState({ brand: '', category: '피트니스', headcount: 5, requirement: '' })
  useEffect(() => {
    if (aiModalStep !== 'loading') return
    setAiProgress(0); setAiPhase(1)
    const start = Date.now()
    const total = 90_000
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const ratio = Math.min(0.99, elapsed / total)
      const pct = Math.round(ratio * 100)
      setAiProgress(pct)
      if (pct < 22) setAiPhase(1)
      else if (pct < 50) setAiPhase(2)
      else if (pct < 83) setAiPhase(3)
      else setAiPhase(4)
      if (elapsed >= total) {
        clearInterval(tick)
        setAiProgress(100)
        setAiModalStep('result')
      }
    }, 250)
    return () => clearInterval(tick)
  }, [aiModalStep])
  const PAGE_SIZE = 10

  // 캠페인 삭제는 캠페인 상세 화면에서만 가능 (정책서 § 8 — 의도적으로 번거롭게)
  // 일괄 삭제·체크박스 다중 선택 모두 제거: 단건 삭제는 상세 진입 후 헤더 액션으로 수행
  const [confirm, setConfirm] = useState<
    | null
    | { kind: 'delete-one'; id: number; name: string }
  >(null)
  const { showToast } = useToast()

  // state → URL 동기화 (기본값은 URL에서 제거해 깔끔하게)
  useEffect(() => {
    const next = new URLSearchParams()
    if (!isAllTabActive)              next.set('tab', activeTabs.join(','))
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
  }, [activeTabs, search, platformFilter, categoryFilter, sort, page])

  const hasActiveFilters =
    search !== '' || platformFilter !== '전체' || categoryFilter !== '전체' || !isAllTabActive

  const resetAllFilters = () => {
    setActiveTabs(['전체'])
    setSearch('')
    setPlatformFilter('전체')
    setCategoryFilter('전체')
    setPage(1)
  }

  const handleDuplicate = (c: Campaign) => {
    showToast(`'${c.name}' 복제 (mock)`, 'info')
  }
  const handleShare = async (c: Campaign) => {
    const url = `${window.location.origin}/campaigns/${c.id}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('캠페인 링크가 복사되었습니다', 'success')
    } catch {
      showToast('링크 복사 실패', 'error')
    }
  }
  const handleConfirmAction = () => {
    if (!confirm) return
    if (confirm.kind === 'delete-one') showToast(`'${confirm.name}' 캠페인을 삭제했습니다 (mock)`, 'success')
    setConfirm(null)
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
    const list = campaigns.filter(c => {
      const display = deriveDisplayStatus(c)
      // 다중 탭: "전체" 활성이면 모두 / 그 외엔 활성 탭 중 하나라도 매치되면 통과
      const tabMatch = isAllTabActive || activeTabs.includes(display as Tab)
      return tabMatch &&
        (platformFilter === '전체' || c.platform === platformFilter) &&
        (categoryFilter === '전체' || c.category === categoryFilter) &&
        (!q || c.name.toLowerCase().includes(q))
    })
    const sorted = [...list]
    const tieBreak = (a: Campaign, b: Campaign) => b.id - a.id // 동률 → 최신순
    // 1차: 전체 탭에서는 "선정 필요" 캠페인을 상단 고정 (정책서 § 4-2)
    sorted.sort((a, b) => {
      if (isAllTabActive) {
        const aNeeds = needsSelection(a) ? 1 : 0
        const bNeeds = needsSelection(b) ? 1 : 0
        if (aNeeds !== bNeeds) return bNeeds - aNeeds
      }
      let primary = 0
      if (sort === 'deadline')          primary = a.deadline.localeCompare(b.deadline)
      else if (sort === 'recent')       primary = b.createdAt.localeCompare(a.createdAt) || (b.id - a.id)
      else if (sort === 'budget-desc')  primary = b.budget - a.budget
      else if (sort === 'budget-asc')   primary = a.budget - b.budget
      else if (sort === 'applicants-desc') primary = b.current - a.current
      else if (sort === 'progress-desc')   primary = (b.current / Math.max(b.total, 1)) - (a.current / Math.max(a.total, 1))
      return primary !== 0 ? primary : tieBreak(a, b)
    })
    return sorted
  }, [qaEmpty, search, activeTabs, isAllTabActive, platformFilter, categoryFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const resetPage = () => setPage(1)

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl @md:text-2xl font-bold text-gray-900">캠페인 목록</h1>
        <div className="flex items-center gap-2">
          {/* AI 캠페인 생성 (정책서 § 16) — 보조 CTA */}
          <button
            onClick={() => setAiModalStep('input')}
            className="flex items-center gap-1.5 border border-brand-green text-brand-green px-3 py-2 @sm:px-4 @sm:py-2.5 rounded-xl text-xs @sm:text-sm font-medium hover:bg-brand-green/5 transition-colors"
          >
            <Sparkles size={14} aria-hidden="true" />
            AI로 만들기
          </button>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="flex items-center gap-1.5 bg-brand-green text-white px-3 py-2 @sm:px-4 @sm:py-2.5 rounded-xl text-xs @sm:text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} aria-hidden="true" />
            새 캠페인 등록
          </button>
        </div>
      </div>

      {/* 본문 카드 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 탭 — 다중 선택 (정책서 § 4-1): Cmd/Ctrl 클릭으로 토글 */}
        <div className="flex items-center gap-1 px-2 @sm:px-4 border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => {
            const isActive = activeTabs.includes(tab)
            return (
              <button
                key={tab}
                onClick={(e) => handleTabClick(tab, e)}
                title={tab !== '전체' ? 'Cmd/Ctrl + 클릭으로 여러 탭 비교' : undefined}
                className={`px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-gray-900 font-semibold text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            )
          })}
          {!isAllTabActive && activeTabs.length >= 2 && (
            <span className="ml-2 text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full whitespace-nowrap">
              {activeTabs.length} 선택됨
            </span>
          )}
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

        {/* 일괄 삭제 액션바는 정책서 § 8 (의도적으로 삭제를 번거롭게) 에 따라 제거 — 캠페인 상세에서만 단건 삭제 */}

        {/* 활성 필터 칩 */}
        {hasActiveFilters && (
          <div className="px-3 @sm:px-5 py-2 border-b border-gray-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 shrink-0">적용된 필터:</span>
            {!isAllTabActive && activeTabs.map(t => (
              <FilterChip
                key={t}
                label={`상태: ${t}`}
                onRemove={() => {
                  const next = activeTabs.filter(x => x !== t)
                  setActiveTabs(next.length === 0 ? ['전체'] : next)
                  resetPage()
                }}
              />
            ))}
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
              const display = deriveDisplayStatus(c)
              const showDDay = c.status !== '종료' && c.status !== '완료'
              const pct = c.total > 0 ? Math.min(100, Math.round((c.current / c.total) * 100)) : 0
              const goDetail = () => navigate(`/campaigns/${c.id}`)
              return (
              <li
                key={c.id}
                className="flex items-center gap-3 @sm:gap-4 px-3 @sm:px-5 py-3.5 @sm:py-4 hover:bg-gray-50 transition-colors group"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={goDetail}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goDetail() } }}
                  className="flex-1 flex items-center gap-3 @sm:gap-4 min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-lg"
                >
                  <div className={`relative w-12 h-12 @sm:w-14 @sm:h-14 rounded-lg overflow-hidden ${cat.bg} flex items-center justify-center shrink-0`}>
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : null}
                    {!c.imageUrl && <CatIcon size={20} className={cat.fg} aria-hidden="true" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      {/* 칩 친절화 — 액션 필요 단계는 Tooltip 보조 설명 (정책서 § 4-0) */}
                      {(() => {
                        const tooltip = getStatusTooltip(display)
                        const badge = <StatusBadge status={display} dot={false} />
                        return tooltip ? <Tooltip content={tooltip} multiline>{badge}</Tooltip> : badge
                      })()}
                      <PlatformBadge platform={c.platform} />
                      {showDDay && (
                        <span className={getDDayBadgeStyle(dday.color, dday.pulse)}>{dday.label}</span>
                      )}
                    </div>
                    <p className="text-sm @sm:text-[15px] font-semibold text-gray-900 truncate mb-1">{c.name}</p>
                    <div className="flex items-center gap-x-3 @sm:gap-x-4 gap-y-1 text-xs flex-wrap">
                      {/* 마감일(to) 강조 — 단계별 라벨 (정책서 § 7-1) */}
                      {(() => {
                        const meta = getCampaignDeadlineMeta(c)
                        return (
                          <span className={`flex items-center gap-1 ${meta.muted ? 'text-gray-400' : 'font-medium text-gray-700'}`}>
                            <Calendar size={11} aria-hidden="true" />
                            <span>{meta.prefix} {fmtDate(c.deadline)}</span>
                          </span>
                        )
                      })()}
                      {/* 인원 3분할 — 지원 / 선정 / 모집 (정책서 § 7-2) */}
                      <span className="flex items-center gap-1 text-gray-500">
                        <Users size={11} aria-hidden="true" />
                        <span className="hidden @sm:inline">지원 {c.current} · 선정 {c.selectedCount ?? 0} · 모집 {c.total}</span>
                        <span className="@sm:hidden">{c.current} · {c.selectedCount ?? 0} · {c.total}</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-500"><Wallet size={11} aria-hidden="true" />예산 {fmtBudget(c.budget)}</span>
                    </div>
                    {/* 등록 마감 + 추가 대기 기간 보조 안내 (정책서 § 7-1) */}
                    {(() => {
                      const meta = getCampaignDeadlineMeta(c)
                      return meta.graceText ? (
                        <p className="text-[11px] text-gray-400 mt-0.5">{meta.graceText}</p>
                      ) : null
                    })()}
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
                  <ChevronRight size={16} className="text-gray-300 shrink-0 group-hover:text-gray-500 transition-colors" aria-hidden="true" />
                </div>
                <div className="shrink-0" onClick={e => e.stopPropagation()}>
                  <Dropdown
                    trigger={
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                        aria-label="캠페인 액션"
                      >
                        <MoreVertical size={16} aria-hidden="true" />
                      </span>
                    }
                  >
                    <div className="py-1 min-w-[140px]">
                      <button type="button" onClick={() => handleDuplicate(c)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left">
                        <Copy size={12} aria-hidden="true" /> 복제
                      </button>
                      <button type="button" onClick={() => handleShare(c)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left">
                        <Share2 size={12} aria-hidden="true" /> 링크 복사
                      </button>
                      {/* 삭제는 캠페인 상세 화면에서만 가능 (정책서 § 8 — 의도적으로 삭제를 번거롭게) */}
                    </div>
                  </Dropdown>
                </div>
              </li>
              )
            })}
          </ul>
        )}

        {/* 페이지네이션 */}
        <Pagination
          total={filtered.length}
          page={safePage}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      {/* 확인 모달 */}
      <AlertModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === 'delete-one' ? '캠페인을 삭제하시겠습니까?' : ''}
        description={confirm?.kind === 'delete-one' ? `'${confirm.name}' 캠페인이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.` : ''}
        confirmLabel="삭제"
        cancelLabel="닫기"
        variant="danger"
        onConfirm={handleConfirmAction}
      />

      {/* AI 캠페인 생성 모달 (정책서 § 16) */}
      <Modal
        open={aiModalStep !== null}
        onClose={() => { if (aiModalStep !== 'loading') setAiModalStep(null) }}
        title={aiModalStep === 'input' ? 'AI 캠페인 생성' : aiModalStep === 'loading' ? 'AI가 캠페인을 만들고 있어요' : 'AI 생성 결과 검토'}
        size="lg"
      >
        {aiModalStep === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">브랜드/제품 한 줄 소개</label>
              <textarea
                value={aiInput.brand}
                onChange={e => setAiInput(v => ({ ...v, brand: e.target.value }))}
                rows={3}
                placeholder="예: 자연 유래 성분으로 만든 비건 단백질 바, 운동 후 간편 영양 보충"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">카테고리</label>
                <CustomSelect
                  value={aiInput.category}
                  onChange={v => setAiInput(av => ({ ...av, category: v }))}
                  options={['피트니스', '뷰티/패션', '맛집/푸드', '여행', '라이프스타일', '육아'].map(c => ({ label: c, value: c }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">모집 인원</label>
                <input
                  type="number"
                  min={1}
                  value={aiInput.headcount}
                  onChange={e => setAiInput(v => ({ ...v, headcount: Number(e.target.value) || 0 }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">추가 요청사항 (선택)</label>
              <textarea
                value={aiInput.requirement}
                onChange={e => setAiInput(v => ({ ...v, requirement: e.target.value }))}
                rows={2}
                placeholder="예: 봄 시즌 톤, 운동 전후 시나리오 자연스럽게 노출"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAiModalStep(null)} className="text-sm text-gray-600 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">취소</button>
              <button
                onClick={() => setAiModalStep('loading')}
                disabled={!aiInput.brand.trim()}
                className="text-sm bg-brand-green text-white px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Sparkles size={14} aria-hidden="true" />
                AI로 캠페인 생성하기
              </button>
            </div>
          </div>
        )}

        {aiModalStep === 'loading' && (
          <div className="py-6 text-center space-y-5 bg-gradient-to-br from-brand-green/5 to-blue-50 rounded-xl px-4">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Sparkles size={32} className="text-brand-green animate-pulse absolute inset-0 m-auto" aria-hidden="true" />
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" stroke="rgba(0,0,0,0.06)" strokeWidth="4" fill="none" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-brand-green" strokeWidth="4" fill="none"
                    strokeDasharray={`${aiProgress * 1.76} 176`} strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {aiPhase === 1 ? '캠페인 컨셉 분석 중...' : aiPhase === 2 ? '추천 인플루언서 매칭 검토 중...' : aiPhase === 3 ? '캠페인 가이드 작성 중...' : '마무리 중...'}
              </p>
              <p className="text-xs text-gray-500 mt-1">최대 1분 30초 정도 소요됩니다.</p>
            </div>
            <div className="max-w-xs mx-auto">
              <div className="h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-brand-green transition-all duration-300" style={{ width: `${aiProgress}%` }} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">{aiProgress}%</p>
            </div>
          </div>
        )}

        {aiModalStep === 'result' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-brand-green/5 border border-brand-green/20 rounded-xl px-3 py-2">
              <Sparkles size={14} className="text-brand-green" aria-hidden="true" />
              <span className="text-xs text-gray-700">AI가 캠페인 초안을 만들었어요. 등록 화면에서 검토 후 저장하세요.</span>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">캠페인명</p>
                <p className="font-semibold text-gray-900">{aiInput.brand.split(',')[0].slice(0, 30) || '신규 캠페인'} 체험단 모집</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">기간 (추천)</p>
                <p className="text-gray-700">모집 2주 · 콘텐츠 등록 3주</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">캠페인 설명</p>
                <p className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3 text-xs leading-relaxed">{aiInput.brand}{aiInput.requirement ? `\n\n요청: ${aiInput.requirement}` : ''}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAiModalStep('loading')} className="text-sm text-gray-600 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">다시 생성</button>
              <button
                onClick={() => { setAiModalStep(null); navigate('/campaigns/new') }}
                className="text-sm bg-brand-green text-white px-4 py-2 rounded-xl hover:opacity-90"
              >
                이대로 등록 화면으로
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
