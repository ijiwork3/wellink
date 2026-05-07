import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Download,
  Eye,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  TrendingUp,
  Crown,
  ImageOff,
  Sparkles,
  Tag,
  CheckCircle,
  Send,
} from 'lucide-react'
import { Modal, StatusBadge, useToast, ErrorState, fmtNumber, ENGAGEMENT_THRESHOLD, CONTENT_TYPE_STYLE, CustomSelect, Pagination } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { fmtDate } from '../utils/fmtDate'

/* ───── Mock Data ───── */

interface Content {
  id: number
  creator: string
  creatorUsername: string
  campaign: string
  type?: '피드' | '릴스' | '스토리' | '영상' | '쇼츠'
  platform: '인스타그램' | '유튜브' | '네이버 블로그' | '틱톡'
  date: string
  reach: number
  likes: number
  comments: number
  saves: number
  shareRate: number
  engagementRate: number
  status: '승인' | '검수중' | '대기중' | '반려'
  thumbnailClass: string
  postUrl?: string
}

// 100개 더미 + 엣지케이스 (썸네일 누락, 0값 등) — 원본 ContentList rawFileUrl=#일 때 ImageIcon fallback 보강
const CREATOR_POOL: Array<{ name: string; username: string }> = [
  { name: '이창민', username: 'changmin_fit' },
  { name: '김가애', username: 'gae.yoga' },
  { name: '박리나', username: 'lina_wellness' },
  { name: '민경완', username: 'min_crossfit' },
  { name: '장영훈', username: 'younghoon_run' },
  { name: '한서연', username: 'seoyeon_health' },
  { name: '오진석', username: 'jinseok_gym' },
  { name: '정예린', username: 'yerin_pilates' },
  { name: '최다은', username: 'daeun_vegan' },
  { name: '김태우', username: 'taewoo_ft' },
  { name: '윤소영', username: 'soyoung_life' },
  { name: '강도현', username: 'dohyun_fit' },
  { name: '신혜진', username: 'hyejin_yoga' },
  { name: '백지호', username: 'jiho_sport' },
  { name: '권나연', username: 'nayeon_wellness' },
  { name: '문태진', username: 'taejin_outdoor' },
  { name: '조성훈', username: 'seonghoon_wod' },
  { name: '송예린', username: 'yerin_clean' },
  { name: '홍은수', username: 'eunsoo_healthy' },
  { name: '배유나', username: 'yuna_active' },
]
const CAMPAIGN_POOL = ['봄 요가 프로모션', '비건 신제품 론칭', '여름 캠페인', '주방 가전 런칭', '겨울 운동 챌린지']
type LibPlatform = '인스타그램' | '유튜브' | '네이버 블로그' | '틱톡'
type LibSubType = '피드' | '릴스' | '스토리' | '영상' | '쇼츠'
const LIB_PS: Array<{ p: LibPlatform; t: LibSubType | undefined }> = [
  { p: '인스타그램', t: '피드' }, { p: '인스타그램', t: '릴스' }, { p: '인스타그램', t: '스토리' },
  { p: '유튜브', t: '영상' }, { p: '유튜브', t: '쇼츠' },
  { p: '네이버 블로그', t: undefined },
  { p: '틱톡', t: undefined },
]
// 플랫폼+유형 통합 필터 옵션 — 유효한 조합만 노출
const PLATFORM_TYPE_OPTIONS: Array<{ label: string; value: string; platform: LibPlatform | null; type: LibSubType | null }> = [
  { label: '전체', value: '전체', platform: null, type: null },
  { label: '인스타그램 · 피드', value: '인스타그램_피드', platform: '인스타그램', type: '피드' },
  { label: '인스타그램 · 릴스', value: '인스타그램_릴스', platform: '인스타그램', type: '릴스' },
  { label: '인스타그램 · 스토리', value: '인스타그램_스토리', platform: '인스타그램', type: '스토리' },
  { label: '유튜브 · 영상', value: '유튜브_영상', platform: '유튜브', type: '영상' },
  { label: '유튜브 · 쇼츠', value: '유튜브_쇼츠', platform: '유튜브', type: '쇼츠' },
  { label: '네이버 블로그', value: '네이버 블로그', platform: '네이버 블로그', type: null },
  { label: '틱톡', value: '틱톡', platform: '틱톡', type: null },
]
const THUMB_POOL = ['from-pink-100 to-pink-200', 'from-blue-100 to-blue-200', 'from-violet-100 to-violet-200', 'from-red-100 to-red-200', 'from-yellow-100 to-yellow-200', 'from-emerald-100 to-emerald-200', 'from-orange-100 to-orange-200', 'from-indigo-100 to-indigo-200', 'from-rose-100 to-rose-200', 'from-green-100 to-green-200', 'from-cyan-100 to-cyan-200', 'from-lime-100 to-lime-200', 'from-amber-100 to-amber-200', 'from-fuchsia-100 to-fuchsia-200', 'from-teal-100 to-teal-200']
const STATUS_CYCLE: Content['status'][] = ['승인', '승인', '승인', '승인', '승인', '검수중', '검수중', '대기중', '반려']
const contents: Content[] = Array.from({ length: 100 }, (_, i) => {
  const creatorEntry = CREATOR_POOL[i % CREATOR_POOL.length]
  const creator = creatorEntry.name
  const creatorUsername = creatorEntry.username
  const campaign = CAMPAIGN_POOL[i % CAMPAIGN_POOL.length]
  const ps = LIB_PS[i % LIB_PS.length]
  // 엣지: i % 17 == 0 썸네일 누락 (placeholder), i % 23 == 0 zero reach
  const thumbnailMissing = i % 17 === 0
  const isZero = i % 23 === 0
  const reach = isZero ? 0 : 1000 + (i * 311) % 30000
  const likes = isZero ? 0 : Math.floor(reach * (0.04 + (i % 7) * 0.005))
  const comments = isZero ? 0 : Math.floor(likes * (0.1 + (i % 5) * 0.02))
  const saves = isZero ? 0 : Math.floor(likes * (0.15 + (i % 4) * 0.02))
  const shareRate = isZero ? 0 : +(0.5 + (i % 9) * 0.6).toFixed(1)
  const engagementRate = isZero ? 0 : +(((likes + comments + saves) / Math.max(reach, 1)) * 100).toFixed(1)
  const monthIdx = (i * 7) % 4   // 0~3 = 1~4월
  const dayIdx = ((i * 13) % 28) + 1
  const date = `2026-${String(monthIdx + 1).padStart(2, '0')}-${String(dayIdx).padStart(2, '0')}`
  return {
    id: i + 1,
    creator,
    creatorUsername,
    campaign,
    type: ps.t,
    platform: ps.p,
    date,
    reach, likes, comments, saves, shareRate, engagementRate,
    status: STATUS_CYCLE[i % STATUS_CYCLE.length],
    thumbnailClass: thumbnailMissing ? '' : THUMB_POOL[i % THUMB_POOL.length],
    postUrl: (i % 5 !== 0 && i % 7 !== 3) ? `https://www.instagram.com/p/mock_${i + 1}/` : undefined,
  }
})

/* ───── Thumbnail helpers ───── */

function thumbnailIconColor(cls: string) {
  return cls ? 'text-white/60' : 'text-gray-300'
}
function thumbnailBg(cls: string) {
  return cls ? `bg-gradient-to-br ${cls}` : 'bg-gray-100'
}

// 플랫폼별 배지 컬러 — 정책 §8.3
const PLATFORM_BADGE_STYLE: Record<string, string> = {
  '인스타그램':    'bg-pink-500/90 text-white',
  '유튜브':        'bg-red-500/90 text-white',
  '네이버 블로그': 'bg-green-600/90 text-white',
  '틱톡':          'bg-black/80 text-white',
}

/* ───── Campaign list ───── */
const campaigns = ['전체', '봄 요가 프로모션', '비건 신제품 론칭', '여름 캠페인', '주방 가전 런칭', '겨울 운동 챌린지']

/* ───── Modal helpers ───── */
const CAMPAIGN_KEYWORDS: Record<string, string[]> = {
  '봄 요가 프로모션':  ['#봄요가', '#요가스튜디오', '#강남요가', '#필라테스', '#요가일상'],
  '비건 신제품 론칭':  ['#비건뷰티', '#클린뷰티', '#비건라이프', '#신제품'],
  '여름 캠페인':       ['#여름', '#썸머룩', '#시즌', '#여름일상'],
  '주방 가전 런칭':    ['#홈쿠킹', '#신가전', '#주방인테리어', '#요리'],
  '겨울 운동 챌린지':  ['#겨울운동', '#운동챌린지', '#홈트', '#다이어트'],
}

function modalInsight(c: Content, saveRate: number, commentRate: number, diffPct: number): string {
  const lines: string[] = []
  if (c.reach === 0) return '집계 데이터가 없어 분석을 생성할 수 없습니다.'
  if (saveRate >= 3) lines.push(`저장률 ${saveRate.toFixed(1)}%로 구매 전환 의도가 높습니다.`)
  else if (saveRate < 1) lines.push(`저장률이 낮아 브랜드 인지 목적에 적합한 콘텐츠입니다.`)
  if (diffPct >= 20) lines.push(`캠페인 평균 대비 참여율이 ${diffPct}% 높아 확산 잠재력이 있습니다.`)
  else if (diffPct <= -20) lines.push(`캠페인 평균 대비 참여율이 ${Math.abs(diffPct)}% 낮아 보완이 필요합니다.`)
  else lines.push(`캠페인 평균 수준의 참여율을 유지하고 있습니다.`)
  if (commentRate > 1) lines.push(`댓글 반응이 활발해 진성 팬 기반이 강한 크리에이터입니다.`)
  return lines.slice(0, 2).join(' ')
}

/* ───── 제안 가능 캠페인 (인플루언서 리스트와 동일 mock) ───── */
interface ProposalCampaign { id: number; name: string; summary: string; period: string; reward: string }
const PROPOSABLE_CAMPAIGNS: ProposalCampaign[] = [
  { id: 1, name: '봄 요가 프로모션',  summary: '봄맞이 요가복 신상 라인 협찬 및 콘텐츠 1건. 봄 시즌 라이트 톤 스타일링과 일상 속 요가 루틴을 자연스럽게 녹여낸 피드/릴스를 함께 제작해 주세요.', period: '2026-04-15 ~ 2026-05-15', reward: '제품 협찬 + 콘텐츠비 30만원' },
  { id: 2, name: '비건 신제품 론칭',  summary: '신규 비건 단백질 바 시식 후기 콘텐츠 1건. 운동 전후 간편 영양 보충 시나리오로 자연스럽게 노출 부탁드립니다.',                                  period: '2026-05-01 ~ 2026-05-31', reward: '제품 협찬 + 콘텐츠비 25만원' },
  { id: 3, name: '여름 캠페인',       summary: '여름 시즌 신상 라인 콘텐츠 1건. 썸머 무드의 스타일링 콘텐츠를 제작해 주세요.',                                                               period: '2026-06-01 ~ 2026-07-31', reward: '제품 협찬 + 콘텐츠비 35만원' },
]

/* ───── Sort helpers ───── */
type SortKey = '최신순' | '도달순' | '참여율 높은순'
const SORT_KEYS: SortKey[] = ['최신순', '도달순', '참여율 높은순']

function sortContents(items: Content[], key: SortKey): Content[] {
  const sorted = [...items]
  switch (key) {
    case '최신순': return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    case '도달순': return sorted.sort((a, b) => b.reach - a.reach)
    case '참여율 높은순': return sorted.sort((a, b) => b.engagementRate - a.engagementRate)
    default: return sorted
  }
}

/* ───── ConfirmState ───── */
interface ConfirmState {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
}
const defaultConfirm: ConfirmState = { open: false, title: '', description: '', onConfirm: () => {} }

/* ───── NOW (module-level) ───── */
const NOW = new Date()
const THIS_MONTH = `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}`

/* ───── Component ───── */

export default function Library() {
  const { showToast } = useToast()
  const qa = useQAMode()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCampaign = searchParams.get('campaign') ?? ''
  // URL ?q= 딥링크 지원 (정책서 § 5, CampaignDetail에서 검색어 자동 채움)
  const initialQ = searchParams.get('q') ?? ''
  const [search, setSearch] = useState(initialQ)
  // URL ?campaign=<name>로 진입 시 해당 캠페인으로 자동 필터 (CampaignDetail '라이브러리에서 보기' 점프)
  const [campaignFilter, setCampaignFilter] = useState(
    initialCampaign && campaigns.includes(initialCampaign) ? initialCampaign : '전체'
  )
  const [statusFilter, setStatusFilter] = useState('전체')
  const [platformTypeFilter, setPlatformTypeFilter] = useState('전체')

  // ?campaign 미매칭 시 검색어로 폴백 → 사용자가 어떤 캠페인에서 점프했는지 보이도록
  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    let changed = false
    if (initialCampaign) {
      if (!campaigns.includes(initialCampaign)) setSearch(initialCampaign)
      next.delete('campaign')
      changed = true
    }
    if (initialQ) { next.delete('q'); changed = true }
    if (changed) setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // 페이지네이션 — 신규
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12  // grid 4 cols × 3 rows = 12 / list 12개
  const [approvedIds, setApprovedIds] = useState<Set<number>>(new Set(contents.filter(c => c.status === '승인').map(c => c.id)))
  const [rejectedIds, setRejectedIds] = useState<Set<number>>(new Set(contents.filter(c => c.status === '반려').map(c => c.id)))
  const [sortKey, setSortKey] = useState<SortKey>('최신순')
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(qa === 'view-list' ? 'list' : 'grid')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [previewItem, setPreviewItem] = useState<Content | null>(null)
  const [rejectConfirm, setRejectConfirm] = useState<ConfirmState>(defaultConfirm)
  const [rejectReason, setRejectReason] = useState('')
  // 다운로드 건당 결제 모달
  const [downloadModal, setDownloadModal] = useState<{ open: boolean; scope: 'selected' | 'all' | 'single'; singleId?: number }>({ open: false, scope: 'selected' })
  const [isPaying, setIsPaying] = useState(false)
  // 결제 완료된 콘텐츠 id 목록 (서버 연동 전 세션 메모리로 관리)
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set())
  // 인플루언서 찜하기 — creator 이름 기반 (서버 연동 전 세션 메모리)
  const [libBookmarked, setLibBookmarked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('wl_lib_bookmarks') ?? '[]')) } catch { return new Set() }
  })
  // 제안 모달
  const [libProposalModal, setLibProposalModal] = useState(false)
  const [libProposalCreator, setLibProposalCreator] = useState<string>('')
  const [libSelectedCampaign, setLibSelectedCampaign] = useState<number | null>(null)
  const [libProposalExpandedId, setLibProposalExpandedId] = useState<number | null>(null)
  const [libProposalSent, setLibProposalSent] = useState(false)
  const [libProposedCreators, setLibProposedCreators] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('wl_lib_proposed') ?? '[]')) } catch { return new Set() }
  })

  const sortListboxRef = useRef<HTMLDivElement>(null)
  const [focusSortKey, setFocusSortKey] = useState<SortKey | null>(null)
  const tabListRef = useRef<HTMLDivElement>(null)
  const [tabScroll, setTabScroll] = useState({ left: false, right: false })
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [canTableScrollLeft, setCanTableScrollLeft] = useState(false)
  const [canTableScrollRight, setCanTableScrollRight] = useState(false)
  const [tableBtnTop, setTableBtnTop] = useState<number | null>(null)

  const [focusTabId, setFocusTabId] = useState<string | null>(null)

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const idx = campaigns.indexOf(campaignFilter)
    const next = e.key === 'ArrowRight'
      ? campaigns[(idx + 1) % campaigns.length]
      : campaigns[(idx - 1 + campaigns.length) % campaigns.length]
    setCampaignFilter(next)
    setFocusTabId(`tab-${next}`)
  }, [campaignFilter])

  useEffect(() => {
    if (!focusTabId) return
    document.getElementById(focusTabId)?.focus()
    setFocusTabId(null)
  }, [focusTabId])

  const updateTabScroll = useCallback(() => {
    const el = tabListRef.current
    if (!el) return
    setTabScroll({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    })
  }, [])

  useEffect(() => {
    const el = tabListRef.current
    if (!el) return
    updateTabScroll()
    el.addEventListener('scroll', updateTabScroll, { passive: true })
    const ro = new ResizeObserver(updateTabScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateTabScroll); ro.disconnect() }
  }, [updateTabScroll])

  useEffect(() => {
    if (viewMode !== 'list') return
    const el = tableScrollRef.current
    if (!el) return
    const update = () => {
      setCanTableScrollLeft(el.scrollLeft > 0)
      setCanTableScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [viewMode])

  useEffect(() => {
    if (viewMode !== 'list') { setTableBtnTop(null); return }
    const update = () => {
      const el = tableRef.current ?? tableWrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const visTop = Math.max(rect.top, 0)
      const visBottom = Math.min(rect.bottom, window.innerHeight)
      setTableBtnTop(visBottom > visTop + 40 ? (visTop + visBottom) / 2 : null)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    if (tableRef.current) ro.observe(tableRef.current)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); ro.disconnect() }
  }, [viewMode])

  const handleSortKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!sortOpen) return
    if (e.key === 'Escape') { setSortOpen(false); return }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      // 단일 계산으로 sortKey 변경 + 포커스 이동 대상 결정
      const idx = SORT_KEYS.indexOf(sortKey)
      const next = e.key === 'ArrowDown'
        ? SORT_KEYS[(idx + 1) % SORT_KEYS.length]
        : SORT_KEYS[(idx - 1 + SORT_KEYS.length) % SORT_KEYS.length]
      setSortKey(next)
      setFocusSortKey(next)
    }
  }, [sortOpen, sortKey])

  // focusSortKey가 바뀌면 해당 option으로 DOM 포커스 이동
  useEffect(() => {
    if (!focusSortKey) return
    const option = sortListboxRef.current?.querySelector<HTMLElement>(`[data-sort-key="${focusSortKey}"]`)
    option?.focus()
    setFocusSortKey(null)
  }, [focusSortKey])

  // sort dropdown 외부 클릭 시 닫기
  useEffect(() => {
    if (!sortOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-sort-dropdown]')) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    // listbox 열리면 현재 선택된 option으로 포커스 이동 (rAF로 paint 후 실행)
    const rafId = requestAnimationFrame(() => {
      const selectedOption = sortListboxRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
      selectedOption?.focus()
    })
    return () => {
      document.removeEventListener('mousedown', handler)
      cancelAnimationFrame(rafId)
    }
  }, [sortOpen])


  /* ── Filter & Sort — hooks rule 준수: early return 전에 위치 ── */
  const filtered = useMemo(() => qa === 'empty' ? [] : sortContents(
    contents.filter(c => {
      const matchSearch = c.creator.includes(search) || c.campaign.includes(search)
      const matchCampaign = campaignFilter === '전체' || c.campaign === campaignFilter
      const matchStatus = statusFilter === '전체' || c.status === statusFilter
      const ptOpt = PLATFORM_TYPE_OPTIONS.find(o => o.value === platformTypeFilter)
      const matchPlatformType = !ptOpt || ptOpt.platform === null
        ? true
        : c.platform === ptOpt.platform && (ptOpt.type === null || c.type === ptOpt.type)
      return matchSearch && matchCampaign && matchStatus && matchPlatformType
    }),
    sortKey,
  ), [qa, search, campaignFilter, statusFilter, platformTypeFilter, sortKey])

  // 검색·필터·정렬 변경 시 페이지 1로 리셋
  useEffect(() => { setPage(1) }, [search, campaignFilter, statusFilter, platformTypeFilter, sortKey])

  // 캠페인 필터 기반 요약 지표 — 캠페인 탭 변경 시 갱신
  const campaignStats = useMemo(() => {
    const pool = campaignFilter === '전체' ? contents : contents.filter(c => c.campaign === campaignFilter)
    const thisMonth = pool.filter(c => c.date.startsWith(THIS_MONTH))
    const topPool = thisMonth.length > 0 ? thisMonth : pool
    return {
      total: pool.length,
      totalReach: pool.reduce((s, c) => s + c.reach, 0),
      avgEngagement: pool.length > 0
        ? (pool.reduce((s, c) => s + c.engagementRate, 0) / pool.length).toFixed(1)
        : '0',
      topPerformer: pool.length > 0
        ? [...topPool].sort((a, b) => b.engagementRate - a.engagementRate)[0]
        : null,
    }
  }, [campaignFilter])

  // 페이지네이션 슬라이스 — 신규
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const openRejectConfirm = useCallback((item: Content) => {
    setRejectConfirm({
      open: true,
      title: '이 콘텐츠를 반려할까요?',
      description: '이 작업은 되돌릴 수 없습니다.',
      onConfirm: () => {
        setRejectedIds(prev => new Set([...prev, item.id]))
        setPreviewItem(null)
        showToast('콘텐츠가 반려되었습니다.', 'info')
      },
    })
  }, [showToast])

  const closeRejectConfirm = useCallback(() => {
    setRejectConfirm(defaultConfirm)
    setRejectReason('')
  }, [])

  const handleRejectConfirm = useCallback(() => {
    rejectConfirm.onConfirm()
    closeRejectConfirm()
  }, [rejectConfirm, closeRejectConfirm])

  const closePreview = useCallback(() => setPreviewItem(null), [])

  const toggleLibBookmark = useCallback((creator: string) => {
    setLibBookmarked(prev => {
      const next = new Set(prev)
      if (next.has(creator)) { next.delete(creator); showToast(`${creator}님 찜을 해제했습니다.`, 'info') }
      else { next.add(creator); showToast(`${creator}님을 찜했습니다.`, 'success') }
      try { sessionStorage.setItem('wl_lib_bookmarks', JSON.stringify(Array.from(next))) } catch { /* noop */ }
      return next
    })
  }, [showToast])

  const openLibProposal = useCallback((creator: string) => {
    setLibProposalCreator(creator)
    setLibSelectedCampaign(null)
    setLibProposalExpandedId(null)
    setLibProposalSent(false)
    setLibProposalModal(true)
  }, [])

  const handleLibProposal = useCallback(() => {
    if (!libSelectedCampaign) { showToast('캠페인을 선택해주세요.', 'error'); return }
    setLibProposalSent(true)
    setLibProposedCreators(prev => {
      const next = new Set(prev)
      next.add(libProposalCreator)
      try { sessionStorage.setItem('wl_lib_proposed', JSON.stringify(Array.from(next))) } catch { /* noop */ }
      return next
    })
    showToast(`${libProposalCreator}님에게 제안을 전송했습니다.`, 'success')
  }, [libSelectedCampaign, libProposalCreator, showToast])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(c => c.id)))
  }, [selectedIds.size, filtered])

  if (qa === 'loading') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
          <div>
            <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-gray-200 rounded-xl" />
            <div className="h-9 w-28 bg-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
          <div className="h-9 w-20 bg-gray-200 rounded-xl" />
          <div className="h-9 w-24 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 @lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200" />
              <div className="p-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (qa === 'error') {
    return <ErrorState message="라이브러리를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  const isAllSelected = filtered.length > 0 && selectedIds.size === filtered.length
  const { total: campTotal, totalReach, avgEngagement, topPerformer } = campaignStats

  /* ─────────── Render ─────────── */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">콘텐츠 라이브러리</h1>
        <p className="text-base text-gray-500 mt-0.5">인플루언서가 제작한 콘텐츠를 한 곳에서 관리합니다.</p>
      </div>

      {/* Summary Stats — 캠페인 탭 연동 */}
      <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-base text-gray-500 mb-1">총 콘텐츠</div>
          <div className="text-2xl font-bold text-gray-900">{campTotal}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-base text-gray-500 mb-1">총 도달</div>
          <div className="text-2xl font-bold text-gray-900">{fmtNumber(totalReach)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-1 text-base text-gray-500 mb-1">
            <TrendingUp size={12} aria-hidden="true" />
            평균 참여율
          </div>
          <div className="text-2xl font-bold text-brand-green">{avgEngagement}%</div>
        </div>
      </div>

      {/* Top Performer */}
      {topPerformer && (
        <button
          type="button"
          onClick={() => setPreviewItem(topPerformer)}
          aria-label="이번 달 최고 성과 콘텐츠 상세 보기"
          className="w-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md p-4 flex items-center gap-3 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-green/10">
            <Crown size={16} className="text-brand-green" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <span className="text-base text-gray-500">이번 달 최고 성과 콘텐츠</span>
            <div className="text-base font-semibold text-gray-900">
              {topPerformer.creator} — {topPerformer.campaign}
            </div>
          </div>
          <div className="text-right">
            <div className="text-base text-gray-500">참여율</div>
            <div className="text-base font-bold text-brand-green">{topPerformer.engagementRate}%</div>
          </div>
          <div className="text-right">
            <div className="text-base text-gray-500">도달</div>
            <div className="text-base font-bold text-gray-900">{fmtNumber(topPerformer.reach)}</div>
          </div>
        </button>
      )}

      {/* Campaign Tab Filter */}
      <div className="relative border-b border-gray-200">
        {tabScroll.left && (
          <button
            onClick={() => tabListRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
            aria-label="이전 탭"
            className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pr-3 focus-visible:outline-none"
          >
            <ChevronLeft size={16} className="text-gray-400" aria-hidden="true" />
          </button>
        )}
        <div
          ref={tabListRef}
          className="flex gap-1 overflow-x-auto scrollbar-none"
          role="tablist"
          aria-label="캠페인 필터"
          onKeyDown={handleTabKeyDown}
        >
          {campaigns.map(camp => {
            const count = camp === '전체' ? contents.length : contents.filter(c => c.campaign === camp).length
            const isActive = campaignFilter === camp
            const tabId = `tab-${camp}`
            return (
              <button
                key={camp}
                id={tabId}
                role="tab"
                aria-selected={isActive}
                aria-controls="tab-panel-content"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setCampaignFilter(camp)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-base border-b-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                  isActive
                    ? 'border-brand-green font-semibold text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {camp}
                <span className={`text-base px-2 py-1 rounded-full font-medium ${
                  isActive ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        {tabScroll.right && (
          <button
            onClick={() => tabListRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
            aria-label="다음 탭"
            className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-1 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pl-3 focus-visible:outline-none"
          >
            <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Search + Filters Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="제작자, 캠페인 검색..."
              aria-label="콘텐츠 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-base border border-gray-200 rounded-xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:border-brand-green transition-colors"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1) }}
                aria-label="검색어 초기화"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div role="group" aria-label="보기 모드" className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => { setViewMode('grid'); setSelectedIds(new Set()) }}
              aria-label="그리드 보기"
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${viewMode === 'grid' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
            <button
              onClick={() => { setViewMode('list'); setSelectedIds(new Set()) }}
              aria-label="리스트 보기"
              aria-pressed={viewMode === 'list'}
              className={`p-2 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${viewMode === 'list' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative" data-sort-dropdown onKeyDown={handleSortKeyDown}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              aria-label={`정렬 기준: ${sortKey}`}
              className="flex items-center gap-1.5 text-base px-3 py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors bg-white text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              {sortKey}
              <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div
                ref={sortListboxRef}
                role="listbox"
                aria-label="정렬 기준 선택"
                className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 min-w-[120px]"
              >
                {SORT_KEYS.map(key => (
                  <div
                    key={key}
                    role="option"
                    aria-selected={sortKey === key}
                    data-sort-key={key}
                    tabIndex={sortKey === key ? 0 : -1}
                    onClick={() => { setSortKey(key); setSortOpen(false) }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSortKey(key); setSortOpen(false) } }}
                    className={`cursor-pointer px-3 py-2 text-base hover:bg-gray-50 transition-colors flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${sortKey === key ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                  >
                    {key}
                    {sortKey === key && <Check size={14} className="text-brand-green" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base text-gray-600 font-medium shrink-0">상태</span>
            <CustomSelect
              value={statusFilter}
              onChange={v => setStatusFilter(v)}
              options={['전체', '승인', '검수중', '대기중', '반려'].map(s => ({ label: s, value: s }))}
              className="flex-1 min-w-0"
            />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base text-gray-600 font-medium shrink-0">채널</span>
            <CustomSelect
              value={platformTypeFilter}
              onChange={v => setPlatformTypeFilter(v)}
              options={PLATFORM_TYPE_OPTIONS.map(o => ({ label: o.label, value: o.value }))}
              className="flex-1 min-w-0"
            />
          </div>
        </div>
      </div>

      {/* ────── Content Area ────── */}
      <h2 className="sr-only">{campaignFilter} 캠페인 콘텐츠</h2>
      <div id="tab-panel-content" role="tabpanel" aria-labelledby={`tab-${campaignFilter}`}>

      {filtered.length === 0 ? (
        /* Empty State — 2케이스 분기 (정책서 § 9) */
        (() => {
          const hasFilters = search || campaignFilter !== '전체' || statusFilter !== '전체' || platformTypeFilter !== '전체'
          return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <ImageOff size={28} className="text-gray-400" aria-hidden="true" />
              </div>
              {hasFilters ? (
                <>
                  <p className="text-base font-medium text-gray-500 mb-1">조건에 맞는 콘텐츠가 없습니다</p>
                  <p className="text-base text-gray-400">검색 조건을 변경하거나 필터를 초기화해 보세요.</p>
                  <button
                    onClick={() => { setSearch(''); setCampaignFilter('전체'); setStatusFilter('전체'); setPlatformTypeFilter('전체') }}
                    className="mt-4 text-base px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    필터 초기화
                  </button>
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-gray-500 mb-1">아직 등록된 콘텐츠가 없습니다</p>
                  <p className="text-base text-gray-400">캠페인이 진행되면 인플루언서들이 등록한 콘텐츠가 이곳에 표시됩니다.</p>
                </>
              )}
            </div>
          )
        })()
      ) : viewMode === 'grid' ? (
        /* ───── Grid View ───── */
        <div>
          {/* Select all bar */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={toggleSelectAll}
              aria-pressed={isAllSelected}
              aria-label="전체 선택"
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                isAllSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              {isAllSelected && <Check size={12} className="text-white" aria-hidden="true" />}
            </button>
            <span className="text-base text-gray-500">전체 선택 ({filtered.length})</span>
            <div className="ml-auto flex items-center gap-1.5">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => setDownloadModal({ open: true, scope: 'selected' })}
                  className="flex items-center gap-1 bg-brand-green text-white px-2.5 py-1 rounded-lg text-base font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Download size={11} aria-hidden="true" />
                  선택 ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => setDownloadModal({ open: true, scope: 'all' })}
                className="flex items-center gap-1 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg text-base hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Download size={11} aria-hidden="true" />
                전체
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-4">
            {paginated.map(c => {
              const isSelected = selectedIds.has(c.id)
              const isDownloaded = downloadedIds.has(c.id)
              const displayStatus = approvedIds.has(c.id) ? '승인' : rejectedIds.has(c.id) ? '반려' : c.status
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all group relative ${
                    isSelected ? 'border-brand-green ring-1 ring-brand-green' : 'border-gray-100'
                  }`}
                >
                  {/* Checkbox — 항상 tabIndex=0으로 키보드 접근 보장, 미선택 시 시각적으로만 숨김 */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleSelect(c.id) }}
                    aria-pressed={isSelected}
                    aria-label={`${c.creator} 콘텐츠 선택`}
                    className={`absolute top-3 left-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                      isSelected
                        ? 'border-brand-green bg-brand-green'
                        : 'border-white/80 bg-white/80'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" aria-hidden="true" />}
                  </button>

                  {/* Thumbnail — button으로 교체하여 iOS VoiceOver 호환성 확보 */}
                  <button
                    type="button"
                    aria-label={`${c.creator} 콘텐츠 미리보기`}
                    className={`w-full aspect-square rounded-t-xl flex items-center justify-center relative overflow-hidden ${thumbnailBg(c.thumbnailClass)} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50`}
                    onClick={() => setPreviewItem(c)}
                  >
                    <ImageOff size={36} className={thumbnailIconColor(c.thumbnailClass)} aria-hidden="true" />
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className={`text-base px-2.5 py-1 rounded-full font-medium ${PLATFORM_BADGE_STYLE[c.platform] ?? 'bg-gray-500/80 text-white'}`}>{c.platform}</span>
                      {c.type && (
                        <span className={`text-base px-2.5 py-1 rounded-full font-medium ${CONTENT_TYPE_STYLE[c.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-700'}`}>{c.type}</span>
                      )}
                    </div>
                    {isDownloaded && (
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-brand-green text-white font-semibold">
                          <Check size={9} aria-hidden="true" />결제 완료
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent h-12 opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 transition-opacity flex items-end justify-center pb-2 gap-1" aria-hidden="true">
                      <Eye size={13} className="text-white" />
                      <span className="text-base text-white font-medium">미리보기</span>
                    </div>
                  </button>

                  <div className="p-3">
                    <button
                      type="button"
                      aria-label={`${c.creator} 콘텐츠 상세 보기`}
                      onClick={() => setPreviewItem(c)}
                      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <span className="block text-base font-semibold text-gray-900">@{c.creatorUsername}</span>
                          <span className="block text-base text-gray-400">{c.creator}</span>
                        </div>
                        <StatusBadge status={displayStatus} dot={false} size="sm" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/campaigns?q=${encodeURIComponent(c.campaign)}`) }}
                        className="block w-full text-left text-base text-gray-500 hover:text-brand-green hover:underline line-clamp-2 mb-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green/50 rounded"
                      >{c.campaign}</button>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-base text-gray-400 mb-2">
                        <span className="flex items-center gap-0.5">
                          <Eye size={11} aria-hidden="true" /> {c.reach === 0 ? '—' : fmtNumber(c.reach)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart size={11} aria-hidden="true" /> {c.reach === 0 ? '—' : fmtNumber(c.likes)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle size={11} aria-hidden="true" /> {c.reach === 0 ? '—' : c.comments}
                        </span>
                      </div>
                    </button>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-400">{fmtDate(c.date)}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleLibBookmark(c.creator) }}
                        aria-label={libBookmarked.has(c.creator) ? `${c.creator} 찜 해제` : `${c.creator} 찜하기`}
                        aria-pressed={libBookmarked.has(c.creator)}
                        className={`p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                          libBookmarked.has(c.creator) ? 'text-red-400' : 'text-gray-300 hover:text-red-400'
                        }`}
                      >
                        <Heart size={13} className={libBookmarked.has(c.creator) ? 'fill-red-400' : ''} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* 페이지네이션 — grid 모드 */}
          <Pagination total={filtered.length} page={safePage} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      ) : (
        /* ───── List (Table) View ───── */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* List view download bar */}
          <div className="flex items-center justify-end gap-1.5 px-3 py-2 border-b border-gray-100">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setDownloadModal({ open: true, scope: 'selected' })}
                className="flex items-center gap-1 bg-brand-green text-white px-2.5 py-1 rounded-lg text-base font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Download size={11} aria-hidden="true" />
                선택 ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => setDownloadModal({ open: true, scope: 'all' })}
              className="flex items-center gap-1 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg text-base hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <Download size={11} aria-hidden="true" />
              전체
            </button>
          </div>
          {/* 플로팅 스크롤 버튼 */}
          {tableBtnTop !== null && canTableScrollLeft && (
            <button type="button" onClick={() => tableScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })} aria-label="왼쪽으로 스크롤"
              style={{ top: tableBtnTop }}
              className="fixed left-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all">
              <ChevronLeft size={15} />
            </button>
          )}
          {tableBtnTop !== null && canTableScrollRight && (
            <button type="button" onClick={() => tableScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })} aria-label="오른쪽으로 스크롤"
              style={{ top: tableBtnTop }}
              className="fixed right-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all">
              <ChevronRight size={15} />
            </button>
          )}
          <div className="relative" ref={tableWrapperRef}>
            {canTableScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
            {canTableScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
          <div className="overflow-x-auto scrollbar-none" ref={tableScrollRef}>
          <table className="w-full" ref={tableRef}>
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th scope="col" className="py-3 px-3 w-8 whitespace-nowrap">
                  <button
                    onClick={toggleSelectAll}
                    aria-pressed={isAllSelected}
                    aria-label="전체 선택"
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                      isAllSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isAllSelected && <Check size={10} className="text-white" aria-hidden="true" />}
                  </button>
                </th>
                {['콘텐츠', '제작자', '캠페인', '유형', '플랫폼', '날짜', '도달', '좋아요', '댓글', '저장', '참여율', '상태'].map(h => (
                  <th key={h} scope="col" className="text-left text-base font-medium text-gray-500 py-3 px-3 whitespace-nowrap">{h}</th>
                ))}
                <th scope="col" className="py-3 px-3"><span className="sr-only">작업</span></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const isSelected = selectedIds.has(c.id)
                const isDownloaded = downloadedIds.has(c.id)
                const displayStatus = approvedIds.has(c.id) ? '승인' : rejectedIds.has(c.id) ? '반려' : c.status
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150 ${isSelected ? 'bg-brand-green/5' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleSelect(c.id)}
                        aria-pressed={isSelected}
                        aria-label={`${c.creator} 콘텐츠 선택`}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                          isSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={10} className="text-white" aria-hidden="true" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        aria-label={`${c.creator} 콘텐츠 미리보기`}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${thumbnailBg(c.thumbnailClass)} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50`}
                        onClick={() => setPreviewItem(c)}
                      >
                        <ImageOff size={16} className={thumbnailIconColor(c.thumbnailClass)} aria-hidden="true" />
                      </button>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="min-w-0">
                          <span className="block text-base font-semibold text-gray-900">@{c.creatorUsername}</span>
                          <span className="block text-base text-gray-400">{c.creator}</span>
                        </div>
                        {isDownloaded && (
                          <span className="inline-flex items-center gap-0.5 text-sm px-2 py-1 rounded-full bg-brand-green text-white font-semibold">
                            <Check size={8} aria-hidden="true" />결제 완료
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-[140px]">
                      <button
                        type="button"
                        onClick={() => navigate(`/campaigns?q=${encodeURIComponent(c.campaign)}`)}
                        className="text-base text-gray-600 hover:text-brand-green hover:underline truncate block w-full text-left"
                      >{c.campaign}</button>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {c.type ? (
                        <span className={`text-base px-2.5 py-1 rounded-full font-medium ${CONTENT_TYPE_STYLE[c.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-700'}`}>{c.type}</span>
                      ) : (
                        <span className="text-base text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-base text-gray-500 whitespace-nowrap">{c.platform}</td>
                    <td className="py-3 px-3 text-base text-gray-500 whitespace-nowrap">{fmtDate(c.date)}</td>
                    <td className="py-3 px-3 text-base text-gray-700 whitespace-nowrap">{fmtNumber(c.reach)}</td>
                    <td className="py-3 px-3 text-base text-gray-700 whitespace-nowrap">{fmtNumber(c.likes)}</td>
                    <td className="py-3 px-3 text-base text-gray-700 whitespace-nowrap">{c.comments}</td>
                    <td className="py-3 px-3 text-base text-gray-700 whitespace-nowrap">{c.saves}</td>
                    <td className="py-3 px-3 text-base font-medium whitespace-nowrap">
                      <span className={c.engagementRate >= ENGAGEMENT_THRESHOLD.high ? 'text-brand-green-text' : c.engagementRate >= ENGAGEMENT_THRESHOLD.low ? 'text-gray-700' : 'text-red-500'}>{c.engagementRate}%</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={displayStatus} dot={false} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreviewItem(c)}
                          aria-label={`${c.creator} 미리보기`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                        >
                          <Eye size={14} aria-hidden="true" />
                        </button>
                        {isDownloaded ? (
                          <button
                            onClick={() => showToast(`${c.creator}님의 콘텐츠를 다운로드합니다.`, 'success')}
                            aria-label={`${c.creator} 다시 다운로드 (결제 완료)`}
                            className="p-1.5 rounded-lg hover:bg-brand-green/10 text-brand-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                          >
                            <Download size={14} aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDownloadModal({ open: true, scope: 'single', singleId: c.id })}
                            aria-label={`${c.creator} 다운로드`}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                          >
                            <Download size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>{/* /overflow-x-auto */}
          </div>{/* /tableWrapperRef */}
          {/* 페이지네이션 — list 모드 */}
          <Pagination total={filtered.length} page={safePage} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}
      </div>{/* /tab-panel-content */}

      {/* ────── Preview Modal ────── */}
      <Modal
        open={!!previewItem}
        onClose={closePreview}
        title="콘텐츠 상세"
        size="lg"
        noDividers
        footer={previewItem ? (
          <div className="flex flex-col gap-2 w-full">
            {!approvedIds.has(previewItem.id) && !rejectedIds.has(previewItem.id) && (
              <div className="flex gap-2">
                <button onClick={() => { setApprovedIds(prev => new Set([...prev, previewItem.id])); setPreviewItem(null) }} className="flex-1 flex items-center justify-center gap-1.5 bg-brand-green text-white py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors"><Check size={14} aria-hidden="true" /> 승인</button>
                <button onClick={() => openRejectConfirm(previewItem)} className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2.5 rounded-xl text-base font-medium hover:bg-red-50 transition-colors">반려</button>
              </div>
            )}
            {downloadedIds.has(previewItem.id) ? (
              <button
                onClick={() => showToast(`${previewItem.creator}님의 콘텐츠를 다운로드합니다.`, 'success')}
                className="w-full flex items-center justify-center gap-1.5 border border-brand-green/30 text-brand-green py-2.5 rounded-xl text-base font-medium hover:bg-brand-green/5 transition-colors"
              >
                <Download size={14} aria-hidden="true" /> 다시 다운로드
              </button>
            ) : (
              <button
                onClick={() => setDownloadModal({ open: true, scope: 'single', singleId: previewItem.id })}
                className="w-full flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
              >
                <Download size={14} aria-hidden="true" /> 다운로드
              </button>
            )}
          </div>
        ) : undefined}
      >
        {previewItem && (() => {
          const modalDisplayStatus = approvedIds.has(previewItem.id) ? '승인' : rejectedIds.has(previewItem.id) ? '반려' : previewItem.status
          const saveRate   = previewItem.reach > 0 ? previewItem.saves    / previewItem.reach * 100 : 0
          const commentRate = previewItem.reach > 0 ? previewItem.comments / previewItem.reach * 100 : 0
          const likeRate   = previewItem.reach > 0 ? previewItem.likes    / previewItem.reach * 100 : 0
          const campItems  = contents.filter(c => c.campaign === previewItem.campaign)
          const campAvgEng = campItems.reduce((s, c) => s + c.engagementRate, 0) / campItems.length
          const diffPct    = campAvgEng > 0 ? Math.round((previewItem.engagementRate - campAvgEng) / campAvgEng * 100) : 0
          const hashtags   = (CAMPAIGN_KEYWORDS[previewItem.campaign] ?? []).slice(0, 5)
          return (
            <div className="space-y-5">
              {/* 썸네일 */}
              <div className={`relative w-full aspect-video rounded-xl flex items-center justify-center ${thumbnailBg(previewItem.thumbnailClass)}`} aria-hidden="true">
                <ImageOff size={56} className={thumbnailIconColor(previewItem.thumbnailClass)} />
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  <span className={`text-base px-2.5 py-1 rounded-full font-medium ${PLATFORM_BADGE_STYLE[previewItem.platform] ?? 'bg-gray-500/80 text-white'}`}>{previewItem.platform}</span>
                  {previewItem.type && (
                    <span className={`text-base px-2.5 py-1 rounded-full font-medium ${CONTENT_TYPE_STYLE[previewItem.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-700'}`}>{previewItem.type}</span>
                  )}
                </div>
              </div>

              {/* 크리에이터 */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-semibold text-gray-900">@{previewItem.creatorUsername}</h4>
                      <span className="text-base text-gray-400">{previewItem.creator}</span>
                      {previewItem.engagementRate >= ENGAGEMENT_THRESHOLD.high && (
                        <span className="inline-flex items-center gap-1 text-base px-2.5 py-1 rounded-full bg-brand-green/10 text-brand-green font-semibold">
                          <Crown size={11} aria-hidden="true" />상위 참여율
                        </span>
                      )}
                      {downloadedIds.has(previewItem.id) && (
                        <span className="inline-flex items-center gap-1 text-base px-2.5 py-1 rounded-full bg-brand-green text-white font-semibold">
                          <Check size={9} aria-hidden="true" />결제 완료
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-base text-gray-400">{previewItem.campaign} · {previewItem.date}</p>
                      {previewItem.postUrl && (
                        <a
                          href={previewItem.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-base text-brand-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
                          aria-label="게시물 원본 보기 (새 탭)"
                        >
                          게시물 보기 ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={modalDisplayStatus} dot={false} size="md" />
                </div>
                {/* 인플루언서 액션 */}
                <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-2">
                  <p className="text-base text-gray-400 truncate">
                    <span className="font-medium text-gray-600">@{previewItem.creatorUsername}</span> 님
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleLibBookmark(previewItem.creator)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-base font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                        libBookmarked.has(previewItem.creator)
                          ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
                          : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-100'
                      }`}
                    >
                      <Heart size={12} className={libBookmarked.has(previewItem.creator) ? 'fill-red-500' : ''} aria-hidden="true" />
                      {libBookmarked.has(previewItem.creator) ? '찜 해제' : '찜하기'}
                    </button>
                    <button
                      onClick={() => openLibProposal(previewItem.creator)}
                      disabled={libProposedCreators.has(previewItem.creator)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-base font-medium border border-brand-green/30 text-brand-green bg-white hover:bg-brand-green/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={12} aria-hidden="true" />
                      {libProposedCreators.has(previewItem.creator) ? '제안 완료' : '제안하기'}
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI 6개 */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: <Eye size={13} />,          label: '도달',   value: fmtNumber(previewItem.reach) },
                  { icon: <Heart size={13} />,         label: '좋아요', value: fmtNumber(previewItem.likes) },
                  { icon: <MessageCircle size={13} />, label: '댓글',   value: String(previewItem.comments) },
                  { icon: <Bookmark size={13} />,      label: '저장',   value: String(previewItem.saves) },
                  { icon: <Share2 size={13} />,        label: '공유율', value: previewItem.shareRate + '%' },
                  { icon: <TrendingUp size={13} />,    label: '참여율', value: previewItem.engagementRate + '%' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">{stat.icon}<span className="text-base">{stat.label}</span></div>
                    <div className="text-base font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* 성과 비율 분석 */}
              <div className="space-y-2.5">
                <p className="text-base font-semibold text-gray-500">성과 비율 분석</p>
                {[
                  { label: '저장률',   value: saveRate,    cap: 10,  desc: '구매 전환 의도',  color: 'bg-brand-green' },
                  { label: '좋아요율', value: likeRate,    cap: 20,  desc: '콘텐츠 호감도',   color: 'bg-blue-400' },
                  { label: '댓글률',   value: commentRate, cap: 5,   desc: '진성 참여',       color: 'bg-violet-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-base text-gray-500 w-14 shrink-0">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${Math.min(item.value / item.cap * 100, 100)}%` }} />
                    </div>
                    <span className="text-base font-semibold text-gray-700 w-10 text-right">{item.value.toFixed(1)}%</span>
                    <span className="text-sm text-gray-400 w-20 shrink-0">{item.desc}</span>
                  </div>
                ))}
              </div>

              {/* 캠페인 비교 + 해시태그 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-400 mb-1">캠페인 평균 대비 참여율</p>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className={`text-xl font-bold ${diffPct >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                      {diffPct >= 0 ? '+' : ''}{diffPct}%
                    </span>
                    <span className="text-sm text-gray-400">
                      {diffPct >= 0 ? '높음' : '낮음'} (avg {campAvgEng.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-400 mb-1.5 flex items-center gap-1"><Tag size={10} />캠페인 필수 키워드</p>
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map(tag => (
                      <span key={tag} className="text-sm px-2 py-1 bg-white border border-gray-200 text-gray-500 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI 인사이트 */}
              <div className="bg-brand-green/5 border border-brand-green/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-brand-green" aria-hidden="true" />
                  <span className="text-base font-semibold text-brand-green">AI 인사이트</span>
                </div>
                <p className="text-base text-gray-600 leading-relaxed">
                  {modalInsight(previewItem, saveRate, commentRate, diffPct)}
                </p>
              </div>

            </div>
          )
        })()}
      </Modal>

      {/* 반려 확인 모달 */}
      <Modal
        open={rejectConfirm.open}
        onClose={closeRejectConfirm}
        size="sm"
        title="콘텐츠 반려"
        footer={
          <>
            <button onClick={closeRejectConfirm} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors">취소</button>
            <button onClick={handleRejectConfirm} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-base hover:bg-red-600 transition-colors">반려</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-gray-900">{rejectConfirm.title}</p>
            <p className="text-base text-gray-500 mt-1">{rejectConfirm.description}</p>
          </div>
          <textarea
            aria-label="반려 사유 (선택)"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="인플루언서에게 전달할 반려 사유를 입력해 주세요 (선택)"
            maxLength={300}
            rows={4}
            className="w-full text-base border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-all placeholder:text-gray-400"
          />
          <div className="text-right text-base text-gray-400">{rejectReason.length}/300</div>
        </div>
      </Modal>

      {/* 콘텐츠 다운로드 모달 — 건당 결제 */}
      {(() => {
        const count = downloadModal.scope === 'all' ? filtered.length : downloadModal.scope === 'single' ? 1 : selectedIds.size
        const PRICE_PER_DOWNLOAD = 10000 // 단가 임시값 (정책 확정 후 교체)
        const totalAmount = PRICE_PER_DOWNLOAD * count
        const closeDownloadModal = () => {
          if (isPaying) return
          setDownloadModal({ open: false, scope: 'selected' })
        }
        const handlePayAndDownload = () => {
          if (isPaying) return
          setIsPaying(true)
          showToast('PG 결제 진행 중입니다... (mock)', 'info')
          setTimeout(() => {
            const ids = downloadModal.scope === 'all'
              ? new Set(filtered.map(c => c.id))
              : downloadModal.scope === 'single' && downloadModal.singleId != null
                ? new Set([downloadModal.singleId])
                : new Set([...selectedIds])
            setDownloadedIds(prev => new Set([...prev, ...ids]))
            if (downloadModal.scope !== 'single') setSelectedIds(new Set())
            closeDownloadModal()
            setIsPaying(false)
            showToast(`${count}건 결제 완료. 다운로드를 시작합니다.`, 'success')
          }, 1200)
        }
        return (
          <Modal
            open={downloadModal.open}
            onClose={closeDownloadModal}
            size="sm"
            title="콘텐츠를 다운로드하시겠습니까?"
            footer={
              <>
                <button onClick={closeDownloadModal} disabled={isPaying} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors disabled:opacity-50">취소</button>
                <button onClick={handlePayAndDownload} disabled={isPaying || count === 0} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors disabled:opacity-50">
                  {isPaying ? '결제 중…' : '결제 후 다운로드'}
                </button>
              </>
            }
          >
            <div className="space-y-3">
              <p className="text-base text-gray-600">
                다운로드 1건당 <strong className="text-gray-900">₩{PRICE_PER_DOWNLOAD.toLocaleString()}</strong>이 부과됩니다.
              </p>
              <div className="space-y-2 text-base bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between"><span className="text-gray-500">다운로드 대상</span><span className="font-medium">{downloadModal.scope === 'all' ? '전체 콘텐츠' : downloadModal.scope === 'single' ? '단건 콘텐츠' : '선택한 콘텐츠'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">건수</span><span className="font-medium">{count}건</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                  <span className="text-gray-500">결제 금액</span>
                  <span className="font-semibold text-gray-900">₩{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-base text-gray-400">등록된 기본 결제 수단으로 결제됩니다. 결제 내역은 마이페이지 결제 내역에서 확인할 수 있습니다.</p>
              <p className="text-base text-gray-400">다운로드한 콘텐츠는 계약된 SNS 채널 및 광고 활용 범위 내에서만 사용 가능합니다.</p>
            </div>
          </Modal>
        )
      })()}
      {/* 인플루언서 제안 모달 */}
      <Modal
        open={libProposalModal}
        onClose={() => { setLibProposalModal(false); setLibSelectedCampaign(null); setLibProposalExpandedId(null); setLibProposalSent(false) }}
        title="캠페인 제안보내기"
        size="md"
        footer={!libProposalSent ? (
          <>
            <button
              onClick={() => { setLibProposalModal(false); setLibSelectedCampaign(null); setLibProposalExpandedId(null); setLibProposalSent(false) }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleLibProposal}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors"
            >
              제안 보내기
            </button>
          </>
        ) : (
          <button
            onClick={() => { setLibProposalModal(false); setLibSelectedCampaign(null); setLibProposalExpandedId(null); setLibProposalSent(false) }}
            className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors"
          >
            확인
          </button>
        )}
      >
        {libProposalSent ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-brand-green mx-auto mb-3" aria-hidden="true" />
            <p className="text-base font-semibold text-gray-900">제안이 전송되었습니다!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-base text-gray-600">
              <strong>{libProposalCreator}</strong>님에게 제안을 보낼 캠페인을 선택하세요.
            </p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {PROPOSABLE_CAMPAIGNS.map(c => {
                const isSelected = libSelectedCampaign === c.id
                const isExpanded = libProposalExpandedId === c.id
                return (
                  <div
                    key={c.id}
                    className={`border rounded-xl transition-all duration-150 ${
                      isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setLibProposalExpandedId(isExpanded ? null : c.id)}
                      className="w-full flex items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-xl"
                      aria-expanded={isExpanded}
                    >
                      <input
                        type="radio"
                        name="lib-campaign"
                        value={c.id}
                        checked={isSelected}
                        onChange={() => setLibSelectedCampaign(c.id)}
                        onClick={e => e.stopPropagation()}
                        className="accent-gray-900"
                      />
                      <span className="text-base flex-1 truncate text-gray-700">{c.name}</span>
                      <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-3 py-3 text-base">
                        <dl className="flex flex-col gap-y-3">
                          <div className="flex gap-3">
                            <dt className="w-16 shrink-0 text-gray-400">개요</dt>
                            <dd className="flex-1 min-w-0 text-gray-700 leading-relaxed">{c.summary}</dd>
                          </div>
                          <div className="flex gap-3">
                            <dt className="w-16 shrink-0 text-gray-400">기간</dt>
                            <dd className="flex-1 min-w-0 text-gray-700">{c.period}</dd>
                          </div>
                          <div className="flex gap-3">
                            <dt className="w-16 shrink-0 text-gray-400">리워드</dt>
                            <dd className="flex-1 min-w-0 text-gray-700">{c.reward}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

