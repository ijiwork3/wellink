import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, CheckCircle, Heart, Sparkles, Target, Lightbulb, TrendingUp, Image, MessageCircle, Users } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import ErrorState from '../components/ErrorState'
import { avatarColors, formatFollowers, fitScoreBadge, fitScoreLabel } from '../utils/influencerUtils'
import { useQAMode } from '../utils/useQAMode'

// NOTE: 인플루언서 mock 데이터 — 추후 src/data/influencers.ts로 통합 예정
const influencers = [
  { id: 1, name: '이창민', platform: '인스타그램', followers: 8700, engagement: 4.1, posts: 234, authentic: 92.3, category: ['피트니스', '크로스핏'], lastActive: '2일 전', fitScore: 92 },
  { id: 2, name: '민경완', platform: '인스타그램', followers: 120000, engagement: 3.8, posts: 412, authentic: 78.5, category: ['운동'], lastActive: '1일 전', fitScore: 78 },
  { id: 3, name: '장영훈', platform: '인스타그램', followers: 960, engagement: 2.8, posts: 89, authentic: 95.1, category: ['필라테스'], lastActive: '5일 전', fitScore: 65 },
  { id: 4, name: '김가애', platform: '인스타그램', followers: 18900, engagement: 4.2, posts: 567, authentic: 88.7, category: ['요가'], lastActive: '오늘', fitScore: 88 },
  { id: 5, name: '박리나', platform: '인스타그램', followers: 7120, engagement: 2.23, posts: 178, authentic: 85.2, category: ['웰니스'], lastActive: '3일 전', fitScore: 71 },
]

const campaigns = [
  { id: 1, name: '봄 요가 프로모션' },
  { id: 2, name: '비건 신제품 론칭' },
]

const categoryOptions = [
  { label: '카테고리', value: '' },
  { label: '피트니스', value: '피트니스' },
  { label: '요가', value: '요가' },
  { label: '웰니스', value: '웰니스' },
  { label: '필라테스', value: '필라테스' },
  { label: '운동', value: '운동' },
  { label: '크로스핏', value: '크로스핏' },
]

const fitScoreOptions = [
  { label: '핏 스코어', value: '' },
  { label: '85점 이상', value: '85+' },
  { label: '70점 이상', value: '70+' },
  { label: '70점 미만', value: 'under70' },
]

const engagementOptions = [
  { label: '참여율', value: '' },
  { label: '3% 이상', value: '3+' },
  { label: '5% 이상', value: '5+' },
]

const followerTierOptions = [
  { label: '팔로워급', value: '' },
  { label: '나노 (~1만)', value: 'nano' },
  { label: '마이크로 (1만~10만)', value: 'micro' },
  { label: '매크로 (10만+)', value: 'macro' },
]

function getFollowerTier(followers: number): string {
  if (followers < 10000) return 'nano'
  if (followers < 100000) return 'micro'
  return 'macro'
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
  const [bookmarked, setBookmarked] = useState<Set<number>>(() => {
    try {
      const raw = sessionStorage.getItem('wl_bookmarks')
      if (raw) return new Set<number>(JSON.parse(raw) as number[])
    } catch {}
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
          <Users size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400 mb-1">인플루언서 데이터가 없습니다</p>
          <p className="text-xs text-gray-300">구독 플랜에 따라 접근 가능한 인플루언서 수가 결정됩니다.</p>
        </div>
      </div>
    )
  }

  const toggleBookmark = (id: number) => {
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
      } catch {}
      return next
    })
  }

  useEffect(() => {
    try {
      sessionStorage.setItem('wl_bookmarks', JSON.stringify(Array.from(bookmarked)))
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = influencers.filter(inf => {
    if (search && !inf.name.includes(search)) return false
    if (category && !inf.category.includes(category)) return false
    if (fitScoreFilter === '85+' && inf.fitScore < 85) return false
    if (fitScoreFilter === '70+' && inf.fitScore < 70) return false
    if (fitScoreFilter === 'under70' && inf.fitScore >= 70) return false
    if (engagementFilter === '3+' && inf.engagement < 3) return false
    if (engagementFilter === '5+' && inf.engagement < 5) return false
    if (followerTier && getFollowerTier(inf.followers) !== followerTier) return false
    return true
  })

  const perPage = 5
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

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
    }, 1200)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
        <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3">
        {[
          { label: '전체 인플루언서', value: influencers.length + '명' },
          { label: '즐겨찾기', value: bookmarked.size + '명' },
          { label: '평균 Fit Score', value: Math.round(influencers.reduce((s, i) => s + i.fitScore, 0) / influencers.length) + '점' },
          { label: '평균 참여율', value: (influencers.filter(i => i.engagement > 0).reduce((s, i) => s + i.engagement, 0) / influencers.filter(i => i.engagement > 0).length).toFixed(1) + '%' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 검색 & 필터 */}
      <div className="flex flex-col @sm:flex-row gap-2.5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="이름으로 검색..."
            aria-label="인플루언서 검색"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
          />
        </div>
        <div className="w-full @sm:w-36">
          <CustomSelect
            value={category}
            onChange={v => { setCategory(v as string); setPage(1) }}
            options={categoryOptions}
          />
        </div>
        <div className="w-full @sm:w-36">
          <CustomSelect
            value={fitScoreFilter}
            onChange={v => { setFitScoreFilter(v as string); setPage(1) }}
            options={fitScoreOptions}
          />
        </div>
        <div className="w-full @sm:w-36">
          <CustomSelect
            value={engagementFilter}
            onChange={v => { setEngagementFilter(v as string); setPage(1) }}
            options={engagementOptions}
          />
        </div>
        <div className="w-full @sm:w-40">
          <CustomSelect
            value={followerTier}
            onChange={v => { setFollowerTier(v as string); setPage(1) }}
            options={followerTierOptions}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {['인플루언서', '카테고리', '팔로워', '참여율', 'Fit Score', '진성비율', '최근 콘텐츠', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Search size={40} className="text-gray-200 mx-auto mb-3" />
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
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => { setSelectedInfluencer(inf); setDetailTab('overview') }}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') { setSelectedInfluencer(inf); setDetailTab('overview') } }}
              >
                {/* 인플루언서 (이름 + 북마크) */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarColors[inf.id % avatarColors.length]} flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0`}>
                      {inf.name[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{inf.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark(inf.id) }}
                      aria-label={bookmarked.has(inf.id) ? '찜 해제' : '찜하기'}
                      className="shrink-0"
                    >
                      <Heart
                        size={14}
                        className={bookmarked.has(inf.id) ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'}
                      />
                    </button>
                  </div>
                </td>

                {/* 카테고리 */}
                <td className="py-3 px-4">
                  <div className="flex gap-1 flex-wrap">
                    {inf.category.map(c => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </td>

                {/* 팔로워 */}
                <td className="py-3 px-4 text-sm text-gray-700">{formatFollowers(inf.followers)}</td>

                {/* 참여율 */}
                <td className="py-3 px-4 text-sm font-medium">
                  <span className={inf.engagement >= 4 ? 'text-[#5a8228]' : inf.engagement >= 2.5 ? 'text-gray-700' : 'text-red-500'}>
                    {inf.engagement}%
                  </span>
                </td>

                {/* Fit Score (원형 배지) */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${fitScoreBadge(inf.fitScore)}`}
                    aria-label={`Fit Score ${inf.fitScore} — ${fitScoreLabel(inf.fitScore)}`}
                    title={`Fit Score ${inf.fitScore} — ${fitScoreLabel(inf.fitScore)}`}
                  >
                    {inf.fitScore}
                  </span>
                </td>

                {/* 진성비율 */}
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${inf.authentic >= 80 ? 'text-[#5a8228]' : inf.authentic >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                    {inf.authentic}%
                  </span>
                </td>

                {/* 최근 콘텐츠 미리보기 (3개 플레이스홀더) */}
                <td className="py-3 px-4">
                  <div className="flex gap-1.5">
                    {[
                      'bg-gradient-to-br from-pink-100 to-pink-200',
                      'bg-gradient-to-br from-blue-100 to-blue-200',
                      'bg-gradient-to-br from-green-100 to-green-200',
                    ].map((bg, i) => (
                      <div key={i} className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center`}>
                        <Image size={12} className="text-white/60" />
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
          <span className="text-xs text-gray-500">총 {filtered.length}명 중 {paginated.length}명 표시</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              aria-label="이전 페이지"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors duration-150"
              disabled={page === 1}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs transition-colors duration-150 ${page === p ? 'bg-[#8CC63F] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              aria-label="다음 페이지"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors duration-150"
              disabled={page === totalPages}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 인플루언서 상세 모달 */}
      <Modal
        open={!!selectedInfluencer && !proposalModal}
        onClose={() => setSelectedInfluencer(null)}
        size="lg"
      >
        {selectedInfluencer && (
          <div>
            <div className="flex items-center flex-wrap gap-4 mb-5 -mt-2">
              <div className={`w-14 h-14 rounded-full ${avatarColors[selectedInfluencer.id % avatarColors.length]} flex items-center justify-center text-gray-700 font-bold text-xl shrink-0`}>
                {selectedInfluencer.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{selectedInfluencer.name}</h2>
                  <span
                    className={`text-xs font-bold rounded-full px-2.5 py-1 ${fitScoreBadge(selectedInfluencer.fitScore)}`}
                    aria-label={`Fit Score ${selectedInfluencer.fitScore} — ${fitScoreLabel(selectedInfluencer.fitScore)}`}
                  >
                    Fit {selectedInfluencer.fitScore} ({fitScoreLabel(selectedInfluencer.fitScore)})
                  </span>
                </div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {selectedInfluencer.category.map(c => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setProposalModal(true)}
                className="shrink-0 bg-[#8CC63F] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#7AB535] transition-colors duration-150"
              >
                캠페인에 제안 보내기
              </button>
            </div>

            {/* 탭 (개요 / 최근 콘텐츠) */}
            <div className="flex border-b border-gray-100 mb-4 -mx-6 px-6">
              {[['overview', '개요'], ['content', '최근 콘텐츠']].map(([key, label]) => (
                <button
                  key={key}
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
                {/* 지표 그리드 */}
                <div className="grid grid-cols-3 gap-3">
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
                    <div className={`text-sm font-semibold ${selectedInfluencer.engagement >= 4 ? 'text-[#5a8228]' : selectedInfluencer.engagement >= 2.5 ? 'text-gray-700' : 'text-red-500'}`}>
                      {selectedInfluencer.engagement}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">진성 비율</div>
                    <div className={`text-sm font-semibold ${selectedInfluencer.authentic >= 80 ? 'text-[#5a8228]' : selectedInfluencer.authentic >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                      {selectedInfluencer.authentic}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Fit Score</div>
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${fitScoreBadge(selectedInfluencer.fitScore)}`}>
                      {selectedInfluencer.fitScore}
                    </span>
                  </div>
                </div>

                {/* AI 인사이트 가이드 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles size={13} className="text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">AI 인사이트 가이드</p>
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">Beta</span>
                  </div>
                  <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2.5">
                    {/* 카드 1: 핏 스코어 */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Target size={12} className="text-gray-400" />
                        <span className="text-[11px] font-semibold text-gray-600">브랜드 핏 스코어</span>
                      </div>
                      <div className="flex items-end gap-1 mb-1.5">
                        <span className={`text-2xl font-bold ${selectedInfluencer.fitScore >= 80 ? 'text-[#8CC63F]' : selectedInfluencer.fitScore >= 60 ? 'text-gray-700' : 'text-gray-500'}`}>
                          {selectedInfluencer.fitScore}
                        </span>
                        <span className="text-xs text-gray-400 mb-1">/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full rounded-full bg-[#8CC63F]"
                          style={{ width: `${selectedInfluencer.fitScore}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">카테고리 매칭도 · 팔로워 겹침률 기반</p>
                    </div>

                    {/* 카드 2: 추천 캠페인 타입 */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp size={12} className="text-gray-400" />
                        <span className="text-[11px] font-semibold text-gray-600">추천 캠페인</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 mb-1.5">
                        {selectedInfluencer.fitScore >= 85 ? '릴스 리뷰형' : selectedInfluencer.fitScore >= 70 ? '피드 협찬형' : '스토리 언급형'}
                      </p>
                      <p className="text-[10px] text-gray-500 leading-snug">
                        평균 대비 <span className="font-semibold text-gray-700">{selectedInfluencer.fitScore >= 85 ? '2.3배' : selectedInfluencer.fitScore >= 70 ? '1.7배' : '1.2배'}</span> 높은 참여율
                      </p>
                    </div>

                    {/* 카드 3: 협업 팁 */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb size={12} className="text-gray-400" />
                        <span className="text-[11px] font-semibold text-gray-600">협업 팁</span>
                      </div>
                      <p className="text-[10px] text-gray-600 leading-snug">
                        {selectedInfluencer.authentic >= 60
                          ? '월·목 오전 포스팅이 최고 도달률'
                          : '스토리 연동 세트 콘텐츠 효과적'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5">
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
                        <Image size={20} className="text-white/60" />
                        <span className="absolute top-2 right-2 text-[10px] bg-white/80 text-gray-700 px-1.5 py-0.5 rounded-full font-medium">
                          {c.type}
                        </span>
                      </div>
                      <div className="px-2.5 py-2 bg-white flex items-center gap-2.5">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Heart size={10} className="text-red-400" />{c.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <MessageCircle size={10} className="text-gray-400" />{c.comments}
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
      <Modal open={proposalModal} onClose={() => { setProposalModal(false); setSelectedCampaign(null); setProposalSent(false) }} title="캠페인에 제안 보내기">
        {proposalSent ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
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
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setProposalModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150"
              >
                취소
              </button>
              <button
                onClick={handleProposal}
                className="flex-1 bg-[#8CC63F] text-white py-2 rounded-xl text-sm hover:bg-[#7AB535] transition-colors duration-150"
              >
                제안 보내기
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
