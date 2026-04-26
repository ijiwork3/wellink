import { useState, useMemo, useCallback } from 'react'
import { Search, CheckCircle, Heart, Sparkles, Target, Lightbulb, TrendingUp, Image, MessageCircle, Users } from 'lucide-react'
import { CustomSelect, Pagination, TIMER_MS } from '@wellink/ui'
import { Modal } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { fmtFollowers as formatFollowers } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { AVATAR_COLORS } from '@wellink/ui'
import { getEngagementColor, getAuthenticColor, getFitScoreBadge, getFitScoreLabel, getFitScoreColor, getRecommendedCampaignType } from '@wellink/ui'
import { FITSCORE_THRESHOLD, ENGAGEMENT_THRESHOLD } from '@wellink/ui'
import {
  INFLUENCER_SORT_OPTIONS,
  DEFAULT_INFLUENCER_SORT,
  sortInfluencers,
  type InfluencerSortKey,
} from '@wellink/ui'

// 인플루언서 더미 데이터 100개 — 다양한 카테고리·팔로워 규모·엣지케이스 (avgLikes·avgComments 추가)
type InfluencerCat = '피트니스' | '요가' | '웰니스' | '필라테스' | '운동' | '크로스핏'
const INF_CAT_POOL: InfluencerCat[][] = [
  ['피트니스', '크로스핏'], ['운동'], ['필라테스'], ['요가'], ['웰니스'],
  ['피트니스'], ['요가', '웰니스'], ['크로스핏', '운동'], ['필라테스', '요가'], ['운동', '웰니스'],
]
const INF_NAMES = [
  '이창민', '민경완', '장영훈', '김가애', '박리나', '서유진', '한지수', '최민호', '윤아름', '강태현',
  '임소희', '구하늘', '나은영', '도성재', '류지원', '명세현', '변하경', '심태웅', '엄혜린', '오지훈',
]
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
  return {
    id: i + 1,
    name: i < INF_NAMES.length ? INF_NAMES[i] : `${INF_NAMES[i % INF_NAMES.length]}${Math.floor(i / INF_NAMES.length) + 1}`,
    platform: '인스타그램',
    followers: baseFollowers,
    engagement,
    posts,
    avgLikes,
    avgComments,
    authentic,
    category: INF_CAT_POOL[i % INF_CAT_POOL.length],
    lastActive,
    fitScore,
  }
})

const campaigns = [
  { id: 1, name: '봄 요가 프로모션' },
  { id: 2, name: '비건 신제품 론칭' },
]

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

// 핏스코어 — 데이터 정책 v1 §2-1: 85+ 우수(green) / 70~84 보통(amber) / 70미만 개선필요(gray)
const fitScoreOptions = [
  { label: '핏 스코어', value: '' },
  { label: '85점 이상 (우수)', value: '85+' },
  { label: '70점 이상 (보통)', value: '70+' },
  { label: '70점 미만 (개선필요)', value: 'under70' },
]

// 참여율 필터 — 데이터 정책 v1 §2-3: 4%+ 높음, 2~4% 보통, 2% 미만 낮음
const engagementOptions = [
  { label: '참여율', value: '' },
  { label: '높음 (4% 이상)', value: 'high' },
  { label: '보통 (2~4%)', value: 'mid' },
  { label: '낮음 (2% 미만)', value: 'low' },
]

// 팔로워 Tier 필터 — 데이터 정책 v1 §2-2
const followerTierOptions = [
  { label: '팔로워급', value: '' },
  { label: '나노 (~1만)', value: 'nano' },
  { label: '마이크로 (1만~10만)', value: 'micro' },
  { label: '매크로 (10만~100만)', value: 'macro' },
  { label: '메가 (100만+)', value: 'mega' },
]

function getFollowerTier(followers: number): string {
  if (followers < 10_000) return 'nano'
  if (followers < 100_000) return 'micro'
  if (followers < 1_000_000) return 'macro'
  return 'mega'
}

export default function InfluencerList() {
  const qa = useQAMode()
  const [search, setSearch] = useState(qa === 'empty-search' || qa === 'filter-empty' ? '매칭없는검색어' : '')
  const [category, setCategory] = useState(qa === 'filter-empty' ? '뷰티/패션' : '')
  const [fitScoreFilter, setFitScoreFilter] = useState('')
  const [engagementFilter, setEngagementFilter] = useState('')
  const [followerTier, setFollowerTier] = useState('')
  // QA: modal-detail → 첫 번째 인플루언서로 상세 모달 미리 열기
  const [selectedInfluencer, setSelectedInfluencer] = useState<typeof influencers[0] | null>(
    qa === 'modal-detail' || qa === 'modal-proposal' ? influencers[0] : null
  )
  const [detailTab, setDetailTab] = useState('overview')
  const [proposalModal, setProposalModal] = useState(qa === 'modal-proposal')
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [proposalSent, setProposalSent] = useState(false)
  const [proposedSet, setProposedSet] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<InfluencerSortKey>(DEFAULT_INFLUENCER_SORT)
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

  // QA: 로딩 스켈레톤
  if (qa === 'loading') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
          <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
        </div>
        {/* KPI 4개 스켈레톤 */}
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 animate-pulse">
          {[0, 1, 2, 3].map(i => (
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

  const toggleBookmark = useCallback((id: number) => {
    // 최초 찜 클릭 시 sessionStorage 소멸 안내 (1회만)
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
    if (fitScoreFilter === '85+' && inf.fitScore < FITSCORE_THRESHOLD.excellent) return false
    if (fitScoreFilter === '70+' && inf.fitScore < FITSCORE_THRESHOLD.average) return false
    if (fitScoreFilter === 'under70' && inf.fitScore >= FITSCORE_THRESHOLD.average) return false
    if (engagementFilter === 'high' && inf.engagement < ENGAGEMENT_THRESHOLD.high) return false
    if (engagementFilter === 'mid' && (inf.engagement < ENGAGEMENT_THRESHOLD.low || inf.engagement >= ENGAGEMENT_THRESHOLD.high)) return false
    if (engagementFilter === 'low' && inf.engagement >= ENGAGEMENT_THRESHOLD.low) return false
    if (followerTier && getFollowerTier(inf.followers) !== followerTier) return false
    return true
  }), [search, category, fitScoreFilter, engagementFilter, followerTier])

  const summaryStats = useMemo(() => [
    { label: '전체 인플루언서', value: influencers.length + '명' },
    { label: '즐겨찾기', value: bookmarked.size + '명' },
    { label: '평균 Fit Score', value: Math.round(influencers.reduce((s, i) => s + i.fitScore, 0) / influencers.length) + '점' },
    { label: '평균 참여율', value: (influencers.filter(i => i.engagement > 0).reduce((s, i) => s + i.engagement, 0) / influencers.filter(i => i.engagement > 0).length).toFixed(1) + '%' },
  ], [bookmarked.size])

  const sorted = useMemo(() => sortInfluencers(filtered, sortKey), [filtered, sortKey])

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
        setProposedSet(prev => new Set(prev).add(influencerId))
      }
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
      <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3">
        {summaryStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 검색 & 필터 */}
      <div className="flex flex-col @sm:flex-row gap-2.5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="이름으로 검색..."
            aria-label="인플루언서 검색"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green transition-all duration-150"
          />
        </div>
        <div className="w-full @sm:w-36">
          <CustomSelect
            value={category}
            onChange={v => { setCategory(v); setPage(1) }}
            options={categoryOptions}
          />
        </div>
        <div className="w-full @sm:w-36">
          <CustomSelect
            value={fitScoreFilter}
            onChange={v => { setFitScoreFilter(v); setPage(1) }}
            options={fitScoreOptions}
          />
        </div>
        <div className="w-full @sm:w-36">
          <CustomSelect
            value={engagementFilter}
            onChange={v => { setEngagementFilter(v); setPage(1) }}
            options={engagementOptions}
          />
        </div>
        <div className="w-full @sm:w-40">
          <CustomSelect
            value={followerTier}
            onChange={v => { setFollowerTier(v); setPage(1) }}
            options={followerTierOptions}
          />
        </div>
        {/* 공통 정렬 — 인플루언서 프로필 화면 통일 정책 */}
        <div className="w-full @sm:w-44">
          <CustomSelect
            value={sortKey}
            onChange={v => { setSortKey(v as InfluencerSortKey); setPage(1) }}
            options={INFLUENCER_SORT_OPTIONS.map(o => ({ label: o.label, value: o.value }))}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden @container">
        <div className="overflow-x-auto">
        <table className="w-full">
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
                { h: 'Fit Score', cls: '' },
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
                <td colSpan={12} className="py-16 text-center">
                  <Search size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-gray-500 font-medium">
                    {qa === 'filter-empty' ? '필터 조건에 맞는 인플루언서가 없습니다' : '검색 조건에 맞는 인플루언서가 없습니다.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">필터를 조정해보세요.</p>
                  <button
                    onClick={() => { setSearch(''); setCategory(''); setFitScoreFilter(''); setEngagementFilter(''); setFollowerTier(''); setPage(1) }}
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
                onClick={() => { setSelectedInfluencer(inf); setDetailTab('overview') }}
                role="button"
                tabIndex={0}
                aria-label={`${inf.name} 상세 보기`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedInfluencer(inf); setDetailTab('overview') } }}
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

                {/* Fit Score (원형 배지) */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${getFitScoreBadge(inf.fitScore)}`}
                    aria-label={`Fit Score ${inf.fitScore} — ${getFitScoreLabel(inf.fitScore)}`}
                    title={`Fit Score ${inf.fitScore} — ${getFitScoreLabel(inf.fitScore)}`}
                  >
                    {inf.fitScore}
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

                {/* 최근 콘텐츠 미리보기 */}
                <td className="py-3 px-4 hidden @xl:table-cell">
                  <div className="flex gap-1.5">
                    {[
                      'bg-gradient-to-br from-pink-100 to-pink-200',
                      'bg-gradient-to-br from-blue-100 to-blue-200',
                      'bg-gradient-to-br from-green-100 to-green-200',
                    ].map((bg, i) => (
                      <div key={i} className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center`}>
                        <Image size={12} className="text-white/60" aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                </td>

                {/* 액션 */}
                <td className="py-3 px-4">
                  {proposedSet.has(inf.id) ? (
                    <span className="text-xs border border-gray-100 text-gray-400 px-3 py-1.5 rounded-xl bg-gray-50 cursor-not-allowed">
                      제안 완료
                    </span>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedInfluencer(inf); setProposalModal(true) }}
                      disabled={proposalSent}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* 인플루언서 상세 모달 */}
      <Modal
        open={!!selectedInfluencer && !proposalModal}
        onClose={() => setSelectedInfluencer(null)}
        size="lg"
        footer={selectedInfluencer ? (
          <button
            onClick={() => setProposalModal(true)}
            className="w-full bg-brand-green text-white text-sm px-4 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors duration-150 font-medium"
          >
            캠페인에 제안 보내기
          </button>
        ) : undefined}
      >
        {selectedInfluencer && (
          <div>
            <div className="flex items-center flex-wrap gap-4 mb-5 -mt-2">
              <div className={`w-14 h-14 rounded-full ${AVATAR_COLORS[selectedInfluencer.id % AVATAR_COLORS.length]} flex items-center justify-center text-gray-700 font-bold text-xl shrink-0`}>
                {selectedInfluencer.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{selectedInfluencer.name}</h2>
                  <span
                    className={`text-xs font-bold rounded-full px-2.5 py-1 ${getFitScoreBadge(selectedInfluencer.fitScore)}`}
                    aria-label={`Fit Score ${selectedInfluencer.fitScore} — ${getFitScoreLabel(selectedInfluencer.fitScore)}`}
                  >
                    Fit {selectedInfluencer.fitScore} ({getFitScoreLabel(selectedInfluencer.fitScore)})
                  </span>
                </div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {selectedInfluencer.category.map(c => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* 탭 (개요 / 최근 콘텐츠) */}
            <div role="tablist" className="flex border-b border-gray-100 mb-4 -mx-6 px-6">
              {[['overview', '개요'], ['content', '최근 콘텐츠']].map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={detailTab === key}
                  onClick={() => setDetailTab(key)}
                  className={`text-sm px-3 py-2.5 border-b-2 transition-all duration-150 ${
                    detailTab === key
                      ? 'border-gray-900 font-semibold text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {detailTab === 'overview' && (
              <div className="space-y-4">
                {/* 지표 그리드 — 모바일 2cols, 태블릿+ 3cols */}
                <div className="grid grid-cols-2 @sm:grid-cols-3 gap-3">
                  {[
                    ['팔로워', formatFollowers(selectedInfluencer.followers), 'text-gray-900'],
                    ['게시물 수', `${selectedInfluencer.posts}개`, 'text-gray-900'],
                    ['최근 활동', selectedInfluencer.lastActive, 'text-gray-900'],
                  ].map(([label, value, cls]) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className={`text-sm font-semibold ${cls}`}>{value}</div>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">참여율</div>
                    <div className={`text-sm font-semibold ${getEngagementColor(selectedInfluencer.engagement)}`}>
                      {selectedInfluencer.engagement}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">진성 비율</div>
                    <div className={`text-sm font-semibold ${getAuthenticColor(selectedInfluencer.authentic)}`}>
                      {selectedInfluencer.authentic}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Fit Score</div>
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${getFitScoreBadge(selectedInfluencer.fitScore)}`}>
                      {selectedInfluencer.fitScore}
                    </span>
                  </div>
                </div>

                {/* AI 인사이트 가이드 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles size={13} className="text-gray-400" aria-hidden="true" />
                    <p className="text-sm font-semibold text-gray-900">AI 인사이트 가이드</p>
                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">Beta</span>
                  </div>
                  <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2.5">
                    {/* 카드 1: 핏 스코어 */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Target size={12} className="text-gray-400" aria-hidden="true" />
                        <span className="text-xs font-semibold text-gray-600">브랜드 핏 스코어</span>
                      </div>
                      <div className="flex items-end gap-1 mb-1.5">
                        <span className={`text-2xl font-bold ${getFitScoreColor(selectedInfluencer.fitScore)}`}>
                          {selectedInfluencer.fitScore}
                        </span>
                        <span className="text-xs text-gray-400 mb-1">/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full rounded-full bg-brand-green"
                          style={{ width: `${selectedInfluencer.fitScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 leading-snug">카테고리 매칭도 · 팔로워 겹침률 기반</p>
                    </div>

                    {/* 카드 2: 추천 캠페인 타입 */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp size={12} className="text-gray-400" aria-hidden="true" />
                        <span className="text-xs font-semibold text-gray-600">추천 캠페인</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 mb-1.5">
                        {getRecommendedCampaignType(selectedInfluencer.fitScore)}
                      </p>
                      <p className="text-xs text-gray-500 leading-snug">
                        평균 대비 <span className="font-semibold text-gray-700">{selectedInfluencer.fitScore >= 85 ? '2.3배' : selectedInfluencer.fitScore >= 70 ? '1.7배' : '1.2배'}</span> 높은 참여율
                      </p>
                    </div>

                    {/* 카드 3: 협업 팁 */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb size={12} className="text-gray-400" aria-hidden="true" />
                        <span className="text-xs font-semibold text-gray-600">협업 팁</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-snug">
                        {selectedInfluencer.authentic >= 60
                          ? '월·목 오전 포스팅이 최고 도달률'
                          : '스토리 연동 세트 콘텐츠 효과적'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        주 {selectedInfluencer.authentic >= 60 ? '3' : '2'}회 업로드 패턴
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'content' && (() => {
              const seed = selectedInfluencer.id
              const bgOptions = [
                'from-pink-100 to-pink-200',
                'from-blue-100 to-blue-200',
                'from-green-100 to-green-200',
                'from-yellow-100 to-yellow-200',
                'from-purple-100 to-purple-200',
                'from-amber-100 to-amber-200',
              ]
              const typeOptions = ['릴스', '피드', '이미지', '릴스', '피드', '이미지']
              const seededContents = Array.from({ length: 6 }, (_, i) => ({
                bg: bgOptions[(seed + i) % bgOptions.length],
                type: typeOptions[(seed * 3 + i) % typeOptions.length],
                likes: Math.round((seed * 137 + i * 79) % 900 + 100),
                comments: Math.round((seed * 53 + i * 31) % 80 + 10),
              }))
              return (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2.5">
                  {seededContents.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-gray-100 transition-shadow duration-150 cursor-default"
                      onClick={() => showToast('콘텐츠 상세는 준비 중이에요.', 'info')}
                    >
                      <div className={`aspect-square bg-gradient-to-br ${c.bg} flex items-center justify-center relative`}>
                        <Image size={20} className="text-white/60" aria-hidden="true" />
                        <span className="absolute top-2 right-2 text-xs bg-white/80 text-gray-700 px-1.5 py-0.5 rounded-full font-medium">
                          {c.type}
                        </span>
                      </div>
                      <div className="px-2.5 py-2 bg-white flex items-center gap-2.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Heart size={10} className="text-red-400" aria-hidden="true" />{c.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MessageCircle size={10} className="text-gray-400" aria-hidden="true" />{c.comments}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )
            })()}
          </div>
        )}
      </Modal>

      {/* 제안 모달 */}
      <Modal
        open={proposalModal}
        onClose={() => { setProposalModal(false); setSelectedCampaign(null); setProposalSent(false) }}
        title="캠페인에 제안 보내기"
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
            <div className="space-y-2">
              {campaigns.map(c => (
                <label
                  key={c.id}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-150 ${
                    selectedCampaign === c.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="campaign"
                    value={c.id}
                    checked={selectedCampaign === c.id}
                    onChange={() => setSelectedCampaign(c.id)}
                    className="accent-gray-900"
                  />
                  <span className="text-sm text-gray-700">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
