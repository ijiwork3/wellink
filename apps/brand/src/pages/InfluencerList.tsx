import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, CheckCircle, Heart, Sparkles, Lightbulb, TrendingUp, Image, MessageCircle, Users, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react'
import { CustomSelect, Pagination, TIMER_MS, Tooltip } from '@wellink/ui'
import { Modal } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { fmtFollowers as formatFollowers } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useDeviceMode } from '../qa-mockup-kit'
import { AVATAR_COLORS } from '@wellink/ui'
import { getEngagementColor, getAuthenticColor } from '@wellink/ui'
import { ENGAGEMENT_THRESHOLD } from '@wellink/ui'
import {
  INFLUENCER_SORT_OPTIONS,
  DEFAULT_INFLUENCER_SORT,
  sortInfluencers,
  type InfluencerSortKey,
} from '@wellink/ui'

// 인플루언서 더미 데이터 100개 — 다양한 카테고리·팔로워 규모·엣지케이스 (avgLikes·avgComments 추가)
type InfluencerCat = '피트니스' | '요가' | '웰니스' | '필라테스' | '운동' | '크로스핏'
type InfluencerType = '개인 인플루언서' | '크루/그룹' | '센터' | '행사'
const INF_CAT_POOL: InfluencerCat[][] = [
  ['피트니스', '크로스핏'], ['운동'], ['필라테스'], ['요가'], ['웰니스'],
  ['피트니스'], ['요가', '웰니스'], ['크로스핏', '운동'], ['필라테스', '요가'], ['운동', '웰니스'],
]
const INF_NAMES = [
  '이창민', '민경완', '장영훈', '김가애', '박리나', '서유진', '한지수', '최민호', '윤아름', '강태현',
  '임소희', '구하늘', '나은영', '도성재', '류지원', '명세현', '변하경', '심태웅', '엄혜린', '오지훈',
]
const INF_INSTAGRAM_IDS = [
  'changmin_fit', 'minkyung_run', 'younghoon_pb', 'gae_yoga', 'lina_wellness',
  'youjin_pilates', 'jisoo_core', 'minho_active', 'areum_yoon', 'k_health',
  'sohee_lim', 'sky_wu', 'eunyoung_n', 'sungjae_d', 'jiwon_move',
  'sehyun_m', 'hk_byun', 'taewung_s', 'hyerin_e', 'jihoon_o',
]
const INF_BIOS = [
  '꾸준한 활동과 높은 진성 팔로워 | 브랜드 협업 문의 DM',
  '매일 아침 요가로 하루를 시작합니다 🧘 몸과 마음의 균형',
  '웰니스 라이프스타일 | 비건 푸드 | 마인드풀니스',
  '헬스 코치 5년차 | 바른 식단과 운동으로 지속 가능한 몸만들기',
  '필라테스 강사 | 몸의 균형과 유연성을 함께 키워요',
  '크로스핏 선수 출신 | 기능적 운동 루틴 공유',
  '운동과 식단으로 변화한 내 이야기 | 일상 공유',
  '요가 지도자 | 내면의 평화를 찾는 여정',
]
const INF_TYPES: InfluencerType[] = ['개인 인플루언서', '개인 인플루언서', '개인 인플루언서', '크루/그룹', '센터', '행사']
const PLATFORM_POOL = ['인스타그램', '인스타그램', '인스타그램', '유튜브', '틱톡', '인스타그램', '유튜브']
const LAST_ACTIVE_POOL = ['오늘', '1일 전', '2일 전', '3일 전', '5일 전', '1주 전', '2주 전', '3주 전']
const influencers = Array.from({ length: 100 }, (_, i) => {
  const baseFollowers = i % 7 === 0 ? 800 + (i * 31) % 800        // nano (~1만)
    : i % 7 === 6 ? 1500000 + (i * 12300) % 500000                 // mega (100만+)
    : i % 5 === 0 ? 150000 + (i * 4400) % 250000                   // macro
    : 5000 + (i * 270) % 50000                                     // micro
  const engagement = +(1.5 + (i * 7 % 50) / 10).toFixed(2)
  const posts = 80 + (i * 17) % 600
  const avgLikes = Math.floor(baseFollowers * (engagement / 100) * 0.7)
  const avgComments = Math.max(2, Math.floor(avgLikes * (0.04 + (i % 5) * 0.01)))
  const authentic = +(70 + (i * 13 % 25) + 0.5).toFixed(1)
  const fitScore = Math.max(45, Math.min(98, 60 + (i * 11 % 40)))
  const lastActive = LAST_ACTIVE_POOL[i % LAST_ACTIVE_POOL.length]
  const baseName = INF_NAMES[i % INF_NAMES.length]
  const baseId = INF_INSTAGRAM_IDS[i % INF_INSTAGRAM_IDS.length]
  return {
    id: i + 1,
    name: i < INF_NAMES.length ? baseName : `${baseName}${Math.floor(i / INF_NAMES.length) + 1}`,
    instagramId: i < INF_INSTAGRAM_IDS.length ? baseId : `${baseId}${Math.floor(i / INF_INSTAGRAM_IDS.length) + 1}`,
    type: INF_TYPES[i % INF_TYPES.length],
    bio: INF_BIOS[i % INF_BIOS.length],
    followers: baseFollowers,
    engagement,
    posts,
    avgLikes,
    avgComments,
    authentic,
    category: INF_CAT_POOL[i % INF_CAT_POOL.length],
    lastActive,
    fitScore,
    platform: PLATFORM_POOL[i % PLATFORM_POOL.length],
    scrapingStatus: (i < 5 ? 'in_progress' : 'completed') as 'in_progress' | 'completed',
  }
})

// 정책서 § 6-1 — status가 '대기중' | '모집중' | '진행중' 인 캠페인만 제안 가능
type CampaignProposalStatus = '대기중' | '모집중' | '진행중' | '종료' | '완료'
interface ProposalCampaign {
  id: number
  name: string
  summary: string
  period: string
  reward: string
  status: CampaignProposalStatus
}
const campaigns: ProposalCampaign[] = [
  {
    id: 1,
    name: '봄 요가 프로모션',
    summary: '봄맞이 요가복 신상 라인 협찬 및 콘텐츠 1건. 봄 시즌에 어울리는 라이트 톤 스타일링과 일상 속 요가 루틴을 자연스럽게 녹여낸 피드/릴스를 함께 제작해주세요.',
    period: '2026-04-15 ~ 2026-05-15',
    reward: '제품 협찬 + 콘텐츠 비 30만원',
    status: '모집중',
  },
  {
    id: 2,
    name: '비건 신제품 론칭',
    summary: '신규 비건 단백질 바 시식 후기 콘텐츠 1건. 운동 전후 간편 영양 보충 시나리오로 자연스럽게 노출 부탁드립니다.',
    period: '2026-05-01 ~ 2026-05-31',
    reward: '제품 협찬 + 콘텐츠 비 25만원',
    status: '진행중',
  },
]
const PROPOSABLE_STATUSES: CampaignProposalStatus[] = ['대기중', '모집중', '진행중']
const proposableCampaigns = campaigns.filter(c => PROPOSABLE_STATUSES.includes(c.status))
const getAppliedCampaignIds = (influencerId: number): number[] => {
  return influencerId % 3 === 0 ? [campaigns[0]?.id].filter((id): id is number => typeof id === 'number') : []
}

// 카테고리 옵션 — 데이터 정책 v1 §2-4 (결정 필요 항목, 확정 시 업데이트)
// 현재: 웰링크 앱 내 실제 사용 카테고리 기준
const categoryOptions = [
  { label: '카테고리', value: '' },
  { label: '피트니스', value: '피트니스' },
  { label: '요가', value: '요가' },
  { label: '웰니스', value: '웰니스' },
  { label: '필라테스', value: '필라테스' },
  { label: '운동', value: '운동' },
  { label: '크로스핏', value: '크로스핏' },
]

// Fit Score 필터/노출은 v1.1부터 제거 (캠페인 매칭 컨텍스트에서만 사용 — § 03 캠페인 상세)

// 참여율 필터 — 데이터 정책 v1 §2-3: 4%+ 높음, 2~4% 보통, 2% 미만 낮음
const engagementOptions = [
  { label: '참여율', value: '' },
  { label: '4%~', value: 'high' },
  { label: '2~4%', value: 'mid' },
  { label: '~2%', value: 'low' },
]

const followerTierOptions = [
  { label: '팔로워수', value: '' },
  { label: '1만 미만', value: 'nano' },
  { label: '1만~10만', value: 'micro' },
  { label: '10만~100만', value: 'macro' },
  { label: '100만 이상', value: 'mega' },
]

const joinTypeOptions = [
  { label: '가입 타입', value: '' },
  { label: '개인 인플루언서', value: '개인 인플루언서' },
  { label: '크루/그룹', value: '크루/그룹' },
  { label: '센터', value: '센터' },
  { label: '행사', value: '행사' },
]

const platformOptions = [
  { label: '활동 유형', value: '' },
  { label: '인스타그램', value: '인스타그램' },
  { label: '유튜브', value: '유튜브' },
  { label: '틱톡', value: '틱톡' },
]

const THUMB_GRADIENTS = [
  'from-pink-100 to-pink-200', 'from-blue-100 to-blue-200',
  'from-green-100 to-green-200', 'from-yellow-100 to-yellow-200',
  'from-purple-100 to-purple-200', 'from-amber-100 to-amber-200',
]

function getFollowerTier(followers: number): string {
  if (followers < 10_000) return 'nano'
  if (followers < 100_000) return 'micro'
  if (followers < 1_000_000) return 'macro'
  return 'mega'
}


export default function InfluencerList() {
  const qa = useQAMode()
  const device = useDeviceMode()
  const [params, setParams] = useSearchParams()

  const [search, setSearch] = useState(() =>
    qa === 'empty-search' || qa === 'filter-empty' ? '매칭없는검색어' : (qa ? '' : (params.get('q') ?? ''))
  )
  const [searchInput, setSearchInput] = useState(() =>
    qa === 'empty-search' || qa === 'filter-empty' ? '매칭없는검색어' : (qa ? '' : (params.get('q') ?? ''))
  )
  const [category, setCategory] = useState(() =>
    qa === 'filter-empty' ? '크로스핏' : (qa ? '' : (params.get('cat') ?? ''))
  )
  const [engagementFilter, setEngagementFilter] = useState(() =>
    qa ? '' : (params.get('eng') ?? '')
  )
  const [followerTier, setFollowerTier] = useState(() =>
    qa ? '' : (params.get('tier') ?? '')
  )
  const [joinType, setJoinType] = useState(() =>
    qa ? '' : (params.get('jtype') ?? '')
  )
  const [platform, setPlatform] = useState(() =>
    qa ? '' : (params.get('plt') ?? '')
  )
  // QA: modal-detail → 첫 번째 인플루언서로 상세 모달 미리 열기
  const [selectedInfluencer, setSelectedInfluencer] = useState<typeof influencers[0] | null>(
    qa === 'modal-detail' || qa === 'modal-proposal' ? influencers[0] : null
  )
  const [contentSubTab, setContentSubTab] = useState<'feed' | 'reels'>('feed')
  const [contentSort, setContentSort] = useState<'latest' | 'likes' | 'comments'>('latest')
  const [contentModalPage, setContentModalPage] = useState(1)
  const [contentDetail, setContentDetail] = useState<{
    bg: string; likes: number; comments: number; saves: number; views?: number;
    caption: string; postedAt: string; type: 'feed' | 'reels'; index: number
  } | null>(null)
  const [proposalModal, setProposalModal] = useState(qa === 'modal-proposal')
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [proposalExpandedId, setProposalExpandedId] = useState<number | null>(null)
  const [proposalSent, setProposalSent] = useState(false)
  const [proposedSet, setProposedSet] = useState<Set<number>>(() => {
    try {
      const raw = sessionStorage.getItem('wl_proposed')
      if (raw) return new Set<number>(JSON.parse(raw) as number[])
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[sessionStorage]', e)
    }
    return new Set<number>()
  })
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<InfluencerSortKey>(() =>
    qa ? DEFAULT_INFLUENCER_SORT : ((params.get('sort') as InfluencerSortKey) ?? DEFAULT_INFLUENCER_SORT)
  )
  const [bookmarked, setBookmarked] = useState<Set<number>>(() => {
    try {
      const raw = sessionStorage.getItem('wl_bookmarks')
      if (raw) return new Set<number>(JSON.parse(raw) as number[])
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[sessionStorage]', e)
    }
    return new Set<number>()
  })
  const { showToast } = useToast()
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [btnTop, setBtnTop] = useState<number | null>(null)

  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  useEffect(() => {
    const update = () => {
      // tableRef(실제 <table> 높이 기준) → 빈 공간에 버튼 떠있는 문제 방지
      const el = tableRef.current ?? tableWrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const visTop = Math.max(rect.top, 0)
      const visBottom = Math.min(rect.bottom, window.innerHeight)
      setBtnTop(visBottom > visTop + 40 ? (visTop + visBottom) / 2 : null)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    if (tableRef.current) ro.observe(tableRef.current)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); ro.disconnect() }
  }, [])

  const scrollTable = (dir: 'left' | 'right') => {
    tableScrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  // URL ↔ 필터 상태 동기화 (QA 모드에서는 건너뜀)
  useEffect(() => {
    if (qa) return
    const next = new URLSearchParams()
    if (search) next.set('q', search)
    if (category) next.set('cat', category)
    if (engagementFilter) next.set('eng', engagementFilter)
    if (followerTier) next.set('tier', followerTier)
    if (joinType) next.set('jtype', joinType)
    if (platform) next.set('plt', platform)
    if (sortKey !== DEFAULT_INFLUENCER_SORT) next.set('sort', sortKey)
    setParams(next, { replace: true })
  }, [search, category, engagementFilter, followerTier, joinType, platform, sortKey, qa, setParams])

  const hasActiveFilters = !!(category || engagementFilter || followerTier || joinType || platform)

  // 모든 hook을 조기 return 이전에 선언 (Rules of Hooks)
  const toggleBookmark = useCallback((id: number) => {
    if (!sessionStorage.getItem('wl_bookmark_warned')) {
      sessionStorage.setItem('wl_bookmark_warned', '1')
      showToast('찜 목록은 현재 브라우저 세션에만 저장돼요. 로그아웃하거나 창을 닫으면 초기화됩니다.', 'info')
    }
    setBookmarked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        sessionStorage.setItem('wl_bookmarks', JSON.stringify(Array.from(next)))
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[sessionStorage]', e)
      }
      return next
    })
  }, [showToast])

  const filtered = useMemo(() => influencers.filter(inf => {
    if (search && !inf.name.includes(search)) return false
    if (category && !inf.category.includes(category as InfluencerCat)) return false
    if (engagementFilter === 'high' && inf.engagement < ENGAGEMENT_THRESHOLD.high) return false
    if (engagementFilter === 'mid' && (inf.engagement < ENGAGEMENT_THRESHOLD.low || inf.engagement >= ENGAGEMENT_THRESHOLD.high)) return false
    if (engagementFilter === 'low' && inf.engagement >= ENGAGEMENT_THRESHOLD.low) return false
    if (followerTier && getFollowerTier(inf.followers) !== followerTier) return false
    if (joinType && inf.type !== joinType) return false
    if (platform && inf.platform !== platform) return false
    return true
  }), [search, category, engagementFilter, followerTier, joinType, platform])

  const summaryStats = useMemo(() => [
    { label: '전체 인플루언서', value: influencers.length + '명' },
    { label: '즐겨찾기', value: bookmarked.size + '명' },
    { label: '평균 참여율', value: (influencers.filter(i => i.engagement > 0).reduce((s, i) => s + i.engagement, 0) / influencers.filter(i => i.engagement > 0).length).toFixed(1) + '%' },
  ], [bookmarked.size])

  const sorted = useMemo(() => sortInfluencers(filtered, sortKey), [filtered, sortKey])

  // QA: 로딩 스켈레톤
  if (qa === 'loading') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
          <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
        </div>
        {/* KPI 3개 스켈레톤 */}
        <div className="grid grid-cols-2 @md:grid-cols-3 gap-3 animate-pulse">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        {/* 필터 바 스켈레톤 */}
        <div className="flex gap-2.5 flex-wrap items-center animate-pulse">
          <div className="h-9 flex-1 min-w-[200px] bg-gray-200 rounded-xl" />
          <div className="h-9 w-36 bg-gray-200 rounded-xl" />
          <div className="h-9 w-36 bg-gray-200 rounded-xl" />
          <div className="h-9 w-36 bg-gray-200 rounded-xl" />
          <div className="h-9 w-40 bg-gray-200 rounded-xl" />
        </div>
        {/* 테이블 스켈레톤 */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="bg-gray-50/50 border-b border-gray-100 h-10" />
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded ml-2" />
              <div className="h-4 w-12 bg-gray-200 rounded ml-2" />
              <div className="h-4 w-12 bg-gray-200 rounded ml-2" />
              <div className="w-9 h-9 rounded-full bg-gray-200 ml-2" />
              <div className="h-4 w-12 bg-gray-200 rounded ml-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // QA: 에러 상태
  if (qa === 'error') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
          <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
        </div>
        <ErrorState message="인플루언서 목록을 불러올 수 없습니다" onRetry={() => window.location.reload()} />
      </div>
    )
  }

  // QA: 전체 빈 상태 (인플루언서 DB 자체가 비어있는 경우)
  if (qa === 'empty') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
          <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Users size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-400 mb-1">인플루언서 데이터가 없습니다</p>
          <p className="text-xs text-gray-400">구독 플랜에 따라 접근 가능한 인플루언서 수가 결정됩니다.</p>
        </div>
      </div>
    )
  }

  const perPage = 10
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paginated = sorted.slice((safePage - 1) * perPage, safePage * perPage)

  const handleProposal = () => {
    if (!selectedCampaign) { showToast('캠페인을 선택해주세요.', 'error'); return }
    const influencerName = selectedInfluencer?.name
    const influencerId = selectedInfluencer?.id
    setProposalSent(true)
    setTimeout(() => {
      setProposalModal(false)
      setProposalSent(false)
      setSelectedCampaign(null)
      if (influencerId !== undefined) {
        setProposedSet(prev => {
          const next = new Set(prev).add(influencerId)
          try {
            sessionStorage.setItem('wl_proposed', JSON.stringify(Array.from(next)))
          } catch (e) {
            if (import.meta.env.DEV) console.warn('[sessionStorage]', e)
          }
          return next
        })
      }
      setContentSubTab('feed'); setContentSort('latest'); setContentDetail(null); setContentModalPage(1)
      setSelectedInfluencer(null)
      showToast(`${influencerName}님에게 제안을 전송했습니다.`, 'success')
    }, TIMER_MS.MOCK_SEND)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
        <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 @md:grid-cols-3 gap-3">
        {summaryStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 검색 & 필터 */}
      <div className="flex flex-col gap-2.5">
        {/* 1행: 검색창 + 검색 버튼 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="이름으로 검색..."
              aria-label="인플루언서 검색"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:border-brand-green transition-all duration-150"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                aria-label="검색어 초기화"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-full p-0.5"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setSearch(searchInput); setPage(1) }}
            className="shrink-0 px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-xl hover:bg-brand-green-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            검색
          </button>
          <CustomSelect value={sortKey} onChange={v => { setSortKey(v as InfluencerSortKey); setPage(1) }} options={INFLUENCER_SORT_OPTIONS.map(o => ({ label: o.label, value: o.value }))} className="shrink-0" />
        </div>
        {/* 2행: 필터 — flex-wrap 없음으로 항상 1행 유지, overflow-x-auto 미사용(드롭다운 클리핑 방지) */}
        <div className="flex gap-2 items-center">
          <CustomSelect value={category} onChange={v => { setCategory(v); setPage(1) }} options={categoryOptions} className="shrink-0" />
          <CustomSelect value={engagementFilter} onChange={v => { setEngagementFilter(v); setPage(1) }} options={engagementOptions} className="shrink-0" />
          <CustomSelect value={followerTier} onChange={v => { setFollowerTier(v); setPage(1) }} options={followerTierOptions} className="shrink-0" />
          <CustomSelect value={joinType} onChange={v => { setJoinType(v); setPage(1) }} options={joinTypeOptions} className="shrink-0" />
          <CustomSelect value={platform} onChange={v => { setPlatform(v); setPage(1) }} options={platformOptions} className="shrink-0" />
        </div>
      </div>


      {/* fixed 플로팅 스크롤 버튼 — 테이블 visible 영역 중앙에 동적 배치 */}
      {btnTop !== null && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollTable('left')}
          aria-label="왼쪽으로 스크롤"
          style={{ top: btnTop }}
          className="fixed left-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 hover:shadow-xl transition-all duration-150"
        >
          <ChevronLeft size={15} />
        </button>
      )}
      {btnTop !== null && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollTable('right')}
          aria-label="오른쪽으로 스크롤"
          style={{ top: btnTop }}
          className="fixed right-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 hover:shadow-xl transition-all duration-150"
        >
          <ChevronRight size={15} />
        </button>
      )}

      {/* 테이블 */}
      <div className="relative" ref={tableWrapperRef}>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden @container relative">
          {/* 그라데이션 페이드 오버레이 */}
          {canScrollLeft && (
            <div className="absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />
          )}
          <div className="overflow-x-auto" ref={tableScrollRef}>
        <table className="w-full" ref={tableRef}>
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {[
                { h: '인플루언서', cls: '' },
                { h: '카테고리',  cls: 'hidden @md:table-cell' },
                { h: '팔로워',    cls: '' },
                { h: '게시물수',  cls: 'hidden @lg:table-cell' },
                { h: '평균 좋아요', cls: 'hidden @lg:table-cell' },
                { h: '평균 댓글',   cls: 'hidden @xl:table-cell' },
                { h: '참여율',    cls: '' },
                { h: '진성비율',  cls: 'hidden @lg:table-cell' },
                { h: '최근 활동', cls: 'hidden @xl:table-cell' },
                { h: '최근 콘텐츠', cls: 'hidden @xl:table-cell' },
                { h: '액션',      cls: '' },
              ].map(({ h, cls }) => (
                <th key={h} scope="col" className={`text-left text-xs font-medium text-gray-500 py-3 px-4 whitespace-nowrap ${cls}`}>{h === '액션' ? <span className="sr-only">액션</span> : h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center">
                  <Search size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-gray-500 font-medium">
                    {hasActiveFilters ? '필터 조건에 맞는 인플루언서가 없습니다.' : '검색 조건에 맞는 인플루언서가 없습니다.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">필터를 조정해보세요.</p>
                  <button
                    onClick={() => { setSearch(''); setSearchInput(''); setCategory(''); setEngagementFilter(''); setFollowerTier(''); setJoinType(''); setPlatform(''); setPage(1) }}
                    className="mt-3 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
                  >
                    필터 초기화
                  </button>
                </td>
              </tr>
            ) : paginated.map(inf => (
              <tr
                key={inf.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:bg-brand-green/5"
                onClick={() => { setSelectedInfluencer(inf); setContentSubTab('feed'); setContentSort('latest'); setContentDetail(null); setContentModalPage(1) }}
                role="button"
                tabIndex={0}
                aria-label={`${inf.name} 상세 보기`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedInfluencer(inf); setContentSubTab('feed'); setContentSort('latest'); setContentDetail(null) } }}
              >
                {/* 인플루언서 (이름 + 북마크) */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[inf.id % AVATAR_COLORS.length]} flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0`}>
                      {inf.name[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{inf.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark(inf.id) }}
                      aria-label={bookmarked.has(inf.id) ? '찜 해제' : '찜하기'}
                      className="shrink-0 p-2 -m-2"
                    >
                      <Heart
                        size={14}
                        className={bookmarked.has(inf.id) ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </td>

                {/* 카테고리 */}
                <td className="py-3 px-4 hidden @md:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {inf.category.map(c => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{c}</span>
                    ))}
                  </div>
                </td>

                {/* 팔로워 */}
                <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{formatFollowers(inf.followers)}</td>

                {/* 게시물수 */}
                <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap hidden @lg:table-cell">{inf.posts.toLocaleString()}</td>

                {/* 평균 좋아요 */}
                <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap hidden @lg:table-cell">{formatFollowers(inf.avgLikes)}</td>

                {/* 평균 댓글 */}
                <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap hidden @xl:table-cell">{inf.avgComments.toLocaleString()}</td>

                {/* 참여율 */}
                <td className="py-3 px-4 text-sm font-medium whitespace-nowrap">
                  <span className={getEngagementColor(inf.engagement)}>
                    {inf.engagement}%
                  </span>
                </td>

                {/* 진성비율 */}
                <td className="py-3 px-4 hidden @lg:table-cell whitespace-nowrap">
                  <span className={`text-sm font-medium ${getAuthenticColor(inf.authentic)}`}>
                    {inf.authentic}%
                  </span>
                </td>

                {/* 최근 활동 */}
                <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap hidden @xl:table-cell">{inf.lastActive}</td>

                {/* 최근 콘텐츠 미리보기 — inf.id 기반 개별화 */}
                <td className="py-3 px-4 hidden @xl:table-cell">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => {
                      const bg = THUMB_GRADIENTS[(inf.id + i) % THUMB_GRADIENTS.length]
                      return (
                        <div key={i} aria-label={`최근 콘텐츠 ${i + 1}`} className={`w-12 h-12 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center`}>
                          <Image size={12} className="text-white/60" aria-hidden="true" />
                        </div>
                      )
                    })}
                  </div>
                </td>

                {/* 액션 */}
                <td className="py-3 px-4">
                  {proposedSet.has(inf.id) ? (
                    <span className="text-xs border border-gray-100 text-gray-400 px-3 py-1.5 rounded-xl bg-gray-50 cursor-not-allowed">
                      제안 완료
                    </span>
                  ) : proposableCampaigns.length === 0 ? (
                    <Tooltip content="진행 중인 캠페인이 없습니다. 캠페인을 먼저 등록해주세요." multiline>
                      <button
                        type="button"
                        disabled
                        className="text-xs border border-gray-200 text-gray-400 px-3 py-1.5 rounded-xl bg-gray-50 cursor-not-allowed whitespace-nowrap"
                      >
                        제안하기
                      </button>
                    </Tooltip>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedInfluencer(inf); setProposalModal(true) }}
                      disabled={proposalSent}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      제안하기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* 페이지네이션 */}
          <Pagination
            total={sorted.length}
            page={safePage}
            pageSize={perPage}
            onChange={setPage}
          />
        </div>
      </div>

      {/* 인플루언서 상세 모달 */}
      {/* 인플루언서 상세 — InfluencerManage와 동일한 커스텀 overlay 구조 */}
      {selectedInfluencer && !proposalModal && (() => {
        const inf = selectedInfluencer
        const closeDetail = () => { setSelectedInfluencer(null); setContentSubTab('feed'); setContentSort('latest'); setContentDetail(null); setContentModalPage(1) }
        const s = inf.id
        const bgOptions = ['from-pink-100 to-pink-200','from-blue-100 to-blue-200','from-green-100 to-green-200','from-yellow-100 to-yellow-200','from-purple-100 to-purple-200','from-amber-100 to-amber-200']
        const makeItems = (offset: number) => Array.from({ length: 12 }, (_, i) => ({
          bg: bgOptions[(s + i + offset) % bgOptions.length],
          likes: Math.round((s * 137 + i * 79 + offset * 13) % 900 + 100),
          comments: Math.round((s * 53 + i * 31 + offset * 7) % 80 + 10),
        }))
        const feedItems = makeItems(0)
        const reelsItems = makeItems(3)
        const avgLikes = Math.round(feedItems.reduce((sum, c) => sum + c.likes, 0) / feedItems.length)
        const avgComments = Math.round(feedItems.reduce((sum, c) => sum + c.comments, 0) / feedItems.length)
        const avgReelsViews = Math.round(reelsItems.reduce((sum, c) => sum + c.likes * 4.2, 0) / reelsItems.length)
        const avgReelsEng = (reelsItems.reduce((sum, c) => sum + c.likes / (inf.followers || 1) * 100, 0) / reelsItems.length).toFixed(1)
        const baseItems = contentSubTab === 'feed' ? feedItems : reelsItems
        const sortedItems = [...baseItems].sort((a, b) => {
          if (contentSort === 'likes') return b.likes - a.likes
          if (contentSort === 'comments') return b.comments - a.comments
          return 0
        })
        const CONTENT_PER_PAGE = 6
        const pagedItems = sortedItems.slice((contentModalPage - 1) * CONTENT_PER_PAGE, contentModalPage * CONTENT_PER_PAGE)
        const captions = [
          '오늘의 운동 루틴 공유합니다 💪 꾸준함이 답이에요.',
          '새 시즌 컬렉션 협찬으로 받았어요. 핏감이 진짜 좋네요!',
          '아침 요가로 하루를 시작하면 마음까지 가벼워져요 🧘',
          '비건 단백질 바 먹어봤는데 이건 진짜 맛있다 👍',
          '오랜만에 새벽 러닝, 공기가 다르네요.',
          '주말은 회복 운동으로! 폼롤러 스트레칭 추천합니다.',
        ]
        const isFeed = contentSubTab === 'feed'
        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={closeDetail}
          >
            <div
              className={`bg-white shadow-2xl w-full flex flex-col ${device === 'phone' ? 'h-full rounded-none' : 'rounded-2xl max-w-2xl mx-4'}`}
              style={{ height: device === 'phone' ? '100%' : '90%' }}
              onClick={e => e.stopPropagation()}
            >
              {/* 고정 헤더 */}
              <div className="shrink-0 px-6 pt-5 pb-0">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-14 h-14 rounded-full ${AVATAR_COLORS[inf.id % AVATAR_COLORS.length]} flex items-center justify-center text-gray-700 font-bold text-xl shrink-0`}>
                    {inf.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* 1행: 이름 + 배지 + X */}
                    <div className="flex items-center gap-1.5 flex-wrap pr-1">
                      <h2 className="text-base font-bold text-gray-900 leading-tight">{inf.name}</h2>
                      {inf.scrapingStatus === 'in_progress' && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">데이터 수집 중</span>
                      )}
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{inf.type}</span>
                      <button onClick={closeDetail} aria-label="닫기" className="ml-auto text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150 shrink-0">
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                    {/* 2행: 팔로워 + 인스타 */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-500" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                        <span className="font-semibold text-gray-700">{formatFollowers(inf.followers)}</span>
                      </span>
                      {inf.instagramId ? (
                        <a href={`https://instagram.com/${inf.instagramId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-xs text-brand-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded">
                          <ExternalLink size={11} aria-hidden="true" />인스타 바로가기
                        </a>
                      ) : (
                        <Tooltip content="인스타그램 username이 등록되지 않았습니다." multiline>
                          <button type="button" disabled className="flex items-center gap-0.5 text-xs text-gray-400 cursor-not-allowed">
                            <ExternalLink size={11} aria-hidden="true" />인스타 바로가기
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    {/* 3행: bio */}
                    <p className="text-xs text-gray-400 mt-1.5 leading-snug">{inf.bio}</p>
                  </div>
                </div>
                <div className="border-b border-gray-100 -mx-6" />
              </div>

              {/* 스크롤 콘텐츠 */}
              <div className="overflow-y-auto px-6 py-4" style={{ flex: '1 1 0', minHeight: 0 }}>
                <div className="space-y-5">
                  {/* 지표 그리드 */}
                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">공통 프로필 정보</p>
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {inf.category.map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{c}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        ['팔로워', formatFollowers(inf.followers), 'text-gray-900'],
                        ['게시물 수', `${inf.posts}개`, 'text-gray-900'],
                        ['최근 활동', inf.lastActive, 'text-gray-900'],
                        ['참여율', `${inf.engagement}%`, getEngagementColor(inf.engagement)],
                        ['진성 비율', `${inf.authentic}%`, getAuthenticColor(inf.authentic)],
                      ].map(([label, value, cls]) => (
                        <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                          <div className="text-xs text-gray-400 mb-1">{label}</div>
                          <div className={`text-sm font-semibold ${cls}`}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI 인사이트 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Sparkles size={13} className="text-gray-400" aria-hidden="true" />
                      <p className="text-sm font-semibold text-gray-900">AI 인사이트 가이드</p>
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">Beta</span>
                    </div>
                    <div className={`grid gap-2.5 ${device === 'phone' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2"><TrendingUp size={12} className="text-gray-400" /><span className="text-xs font-semibold text-gray-600">추천 캠페인</span></div>
                        <p className="text-xs font-bold text-gray-900 mb-1.5">{inf.engagement >= 4 ? '브랜디드 콘텐츠' : inf.engagement >= 2 ? '제품 리뷰' : '인지도 강화'}</p>
                        <p className="text-xs text-gray-500 leading-snug">평균 대비 <span className="font-semibold text-gray-700">{inf.engagement >= 4 ? '2.3배' : inf.engagement >= 2 ? '1.7배' : '1.2배'}</span> 높은 참여율</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2"><Lightbulb size={12} className="text-gray-400" /><span className="text-xs font-semibold text-gray-600">협업 팁</span></div>
                        <p className="text-xs text-gray-600 leading-snug">{inf.authentic >= 60 ? '월·목 오전 포스팅이 최고 도달률' : '스토리 연동 세트 콘텐츠 효과적'}</p>
                        <p className="text-xs text-gray-400 mt-1.5">주 {inf.authentic >= 60 ? '3' : '2'}회 업로드 패턴</p>
                      </div>
                    </div>
                  </div>

                  {/* 최근 콘텐츠 */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-3">최근 콘텐츠</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-0">
                        {(['feed', 'reels'] as const).map(tab => (
                          <button key={tab} onClick={() => { setContentSubTab(tab); setContentSort('latest'); setContentModalPage(1) }}
                            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 font-medium ${contentSubTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab === 'feed' ? '피드' : '릴스'}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {([['latest', '최신순'], ['likes', '좋아요순'], ['comments', '댓글순']] as const).map(([val, label]) => (
                          <button key={val} onClick={() => { setContentSort(val); setContentModalPage(1) }}
                            className={`text-xs px-2 py-1 rounded-lg transition-all duration-150 ${contentSort === val ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 mb-3">
                      {isFeed ? (
                        <><span>평균 좋아요 <span className="font-semibold text-gray-600">{formatFollowers(avgLikes)}</span></span><span>평균 댓글 <span className="font-semibold text-gray-600">{avgComments}</span></span></>
                      ) : (
                        <><span>평균 조회수 <span className="font-semibold text-gray-600">{formatFollowers(avgReelsViews)}</span></span><span>평균 참여율 <span className="font-semibold text-gray-600">{avgReelsEng}%</span></span></>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {pagedItems.map((c, i) => {
                        const globalIdx = (contentModalPage - 1) * CONTENT_PER_PAGE + i
                        const saves = Math.round(c.likes * 0.18)
                        const views = !isFeed ? Math.round(c.likes * 4.2 + 500) : undefined
                        return (
                          <div key={globalIdx} className="rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-150"
                            onClick={() => setContentDetail({ bg: c.bg, likes: c.likes, comments: c.comments, saves, views, caption: captions[(s + globalIdx) % captions.length], postedAt: `${(globalIdx % 7) + 1}일 전`, type: contentSubTab, index: globalIdx })}>
                            <div className={`bg-gradient-to-br ${c.bg} flex items-center justify-center relative ${isFeed ? 'aspect-square' : 'aspect-[9/16]'}`}>
                              <Image size={18} className="text-white/50" aria-hidden="true" />
                              {!isFeed && <span className="absolute top-1.5 right-1.5 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-full">릴스</span>}
                            </div>
                            <div className="px-2 py-1.5 bg-white flex gap-2">
                              <span className="flex items-center gap-0.5 text-xs text-gray-400"><Heart size={9} className="text-red-400" aria-hidden="true" />{c.likes.toLocaleString()}</span>
                              <span className="flex items-center gap-0.5 text-xs text-gray-400"><MessageCircle size={9} className="text-gray-300" aria-hidden="true" />{c.comments}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Pagination total={sortedItems.length} page={contentModalPage} pageSize={CONTENT_PER_PAGE} onChange={setContentModalPage} showSummary={false} className="mt-3" />
                  </div>
                </div>
              </div>

              {/* 고정 푸터 */}
              <div className="border-t border-gray-100 px-6 py-4 shrink-0">
                {proposedSet.has(inf.id) ? (
                  <div className="w-full flex items-center justify-center gap-2 py-1.5">
                    <CheckCircle size={15} className="text-green-500" aria-hidden="true" />
                    <span className="text-sm text-gray-500">이미 제안을 보냈습니다</span>
                  </div>
                ) : proposableCampaigns.length === 0 ? (
                  <div className="w-full space-y-2">
                    <Tooltip content="진행 중인 캠페인이 없습니다. 캠페인을 먼저 등록해주세요." multiline>
                      <button type="button" disabled className="w-full bg-brand-green/50 text-white text-sm px-4 py-2.5 rounded-xl font-medium opacity-50 cursor-not-allowed">
                        캠페인 제안보내기
                      </button>
                    </Tooltip>
                    <p className="text-xs text-gray-500 text-center">
                      진행 중인 캠페인이 없습니다.{' '}
                      <Link to="/company/campaigns/new" className="text-brand-green underline underline-offset-2 hover:text-brand-green-hover">캠페인 등록</Link>
                    </p>
                  </div>
                ) : (
                  <button onClick={() => setProposalModal(true)} className="w-full bg-brand-green text-white text-sm px-4 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors duration-150 font-medium">
                    캠페인 제안보내기
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* 콘텐츠 상세 모달 */}
      <Modal
        open={contentDetail !== null}
        onClose={() => setContentDetail(null)}
        title={contentDetail?.type === 'feed' ? '피드 상세' : '릴스 상세'}
        size="md"
      >
        {contentDetail && (
          <div className="space-y-4">
            <div className={`bg-gradient-to-br ${contentDetail.bg} rounded-xl flex items-center justify-center relative ${contentDetail.type === 'feed' ? 'aspect-square' : 'aspect-[9/16] max-h-[280px] mx-auto'}`}>
              <Image size={32} className="text-white/60" aria-hidden="true" />
              {contentDetail.type === 'reels' && (
                <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">릴스</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">좋아요</p>
                <p className="text-sm font-semibold text-gray-900">{contentDetail.likes.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">댓글</p>
                <p className="text-sm font-semibold text-gray-900">{contentDetail.comments.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">저장</p>
                <p className="text-sm font-semibold text-gray-900">{contentDetail.saves.toLocaleString()}</p>
              </div>
              {contentDetail.views !== undefined ? (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">조회수</p>
                  <p className="text-sm font-semibold text-gray-900">{contentDetail.views.toLocaleString()}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">게시 시점</p>
                  <p className="text-sm font-semibold text-gray-900">{contentDetail.postedAt}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">캡션</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{contentDetail.caption}</p>
            </div>
            <p className="text-xs text-gray-400 text-center">※ POC 목업 데이터입니다. 실데이터는 인스타그램 API 연동 후 표시됩니다.</p>
          </div>
        )}
      </Modal>

      {/* 제안 모달 — 아코디언 UI (정책서 § 6-2) */}
      <Modal
        open={proposalModal}
        onClose={() => { setProposalModal(false); setSelectedCampaign(null); setProposalSent(false); setProposalExpandedId(null) }}
        title="캠페인 제안보내기"
        size="md"
        footer={!proposalSent ? (
          <>
            <button
              onClick={() => setProposalModal(false)}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              취소
            </button>
            <button
              onClick={handleProposal}
              className="flex-1 bg-brand-green text-white py-2 rounded-xl text-sm hover:bg-brand-green-hover transition-colors duration-150"
            >
              제안 보내기
            </button>
          </>
        ) : undefined}
      >
        {proposalSent ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-900">제안이 전송되었습니다!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <strong>{selectedInfluencer?.name}</strong>님에게 제안을 보낼 캠페인을 선택하세요.
            </p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {proposableCampaigns.map(c => {
                const appliedIds = selectedInfluencer ? getAppliedCampaignIds(selectedInfluencer.id) : []
                const hasApplied = appliedIds.includes(c.id)
                const isSelected = selectedCampaign === c.id
                const isExpanded = proposalExpandedId === c.id
                return (
                  <div
                    key={c.id}
                    className={`border rounded-xl transition-all duration-150 ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : hasApplied
                          ? 'border-gray-200 bg-gray-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setProposalExpandedId(isExpanded ? null : c.id)}
                      className="w-full flex items-center gap-3 p-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-xl"
                      aria-expanded={isExpanded}
                    >
                      <input
                        type="radio"
                        name="campaign"
                        value={c.id}
                        checked={isSelected}
                        disabled={hasApplied}
                        onChange={() => { if (!hasApplied) setSelectedCampaign(c.id) }}
                        onClick={e => e.stopPropagation()}
                        className="accent-gray-900 disabled:cursor-not-allowed"
                      />
                      <span className={`text-sm flex-1 truncate ${hasApplied ? 'text-gray-400' : 'text-gray-700'}`}>{c.name}</span>
                      {hasApplied && (
                        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">이미 신청함</span>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-3 py-3 text-xs">
                        <dl className="flex flex-col gap-y-3">
                          <div className="flex gap-3">
                            <dt className="w-16 shrink-0 text-gray-400">개요</dt>
                            <dd className="flex-1 min-w-0 text-gray-700 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-line break-words">{c.summary}</dd>
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
