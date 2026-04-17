import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, CheckCircle, Heart } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const influencers = [
  { id: 1, name: '이창민', platform: '인스타그램', followers: 8700, engagement: 4.1, posts: 234, authentic: 64.7, category: ['피트니스', '크로스핏'], lastActive: '2일 전', fitScore: 92 },
  { id: 2, name: '민경완', platform: '인스타그램', followers: 120000, engagement: 3.8, posts: 412, authentic: 9.9, category: ['운동'], lastActive: '1일 전', fitScore: 78 },
  { id: 3, name: '장영훈', platform: '인스타그램', followers: 960, engagement: 0, posts: 89, authentic: 85.7, category: ['필라테스'], lastActive: '5일 전', fitScore: 65 },
  { id: 4, name: '김가애', platform: '인스타그램', followers: 18900, engagement: 4.2, posts: 567, authentic: 5.5, category: ['요가'], lastActive: '오늘', fitScore: 88 },
  { id: 5, name: '박리나', platform: '인스타그램', followers: 7120, engagement: 2.23, posts: 178, authentic: 1.6, category: ['웰니스'], lastActive: '3일 전', fitScore: 71 },
]

const campaigns = [
  { id: 1, name: '봄 요가 프로모션' },
  { id: 2, name: '비건 신제품 론칭' },
]

function formatFollowers(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return `${n}`
}

const avatarColors = ['bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200']

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
  { label: 'Fit Score', value: '' },
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
  { label: '나노 (~1천)', value: 'nano' },
  { label: '마이크로 (1천~1만)', value: 'micro' },
  { label: '미드 (1만~10만)', value: 'mid' },
  { label: '매크로 (10만+)', value: 'macro' },
]

function getFollowerTier(followers: number): string {
  if (followers < 1000) return 'nano'
  if (followers < 10000) return 'micro'
  if (followers < 100000) return 'mid'
  return 'macro'
}

function fitScoreBadge(score: number) {
  if (score >= 85) return 'bg-green-100 text-green-700'
  if (score >= 70) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-500'
}

export default function InfluencerList() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [fitScoreFilter, setFitScoreFilter] = useState('')
  const [engagementFilter, setEngagementFilter] = useState('')
  const [followerTier, setFollowerTier] = useState('')
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [selectedInfluencer, setSelectedInfluencer] = useState<typeof influencers[0] | null>(null)
  const [detailTab, setDetailTab] = useState('overview')
  const [proposalModal, setProposalModal] = useState(false)

  // QA: ?modal=detail | proposal
  useEffect(() => {
    const m = searchParams.get('modal')
    if (m === 'detail' || m === 'proposal') {
      setSelectedInfluencer(influencers[0])
      if (m === 'proposal') setProposalModal(true)
    }
  }, [searchParams, location.key])
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [proposalSent, setProposalSent] = useState(false)
  const PER_PAGE = 5
  const [page, setPage] = useState(1)
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set([1, 4, 5]))
  const { showToast } = useToast()

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

  const handleProposal = () => {
    if (!selectedCampaign) { showToast('캠페인을 선택해주세요.', 'error'); return }
    setProposalSent(true)
    setTimeout(() => {
      setProposalModal(false)
      setProposalSent(false)
      setSelectedCampaign(null)
      setSelectedInfluencer(null)
      showToast(`${selectedInfluencer?.name}님에게 제안을 전송했습니다.`, 'success')
    }, 1200)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
        <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
      </div>

      {/* 검색 & 필터 */}
      <div className="flex gap-2.5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="이름으로 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150"
          />
        </div>
        <div className="w-36">
          <CustomSelect
            value={category}
            onChange={v => setCategory(v as string)}
            options={categoryOptions}
          />
        </div>
        <div className="w-36">
          <CustomSelect
            value={fitScoreFilter}
            onChange={v => setFitScoreFilter(v as string)}
            options={fitScoreOptions}
          />
        </div>
        <div className="w-36">
          <CustomSelect
            value={engagementFilter}
            onChange={v => setEngagementFilter(v as string)}
            options={engagementOptions}
          />
        </div>
        <div className="w-40">
          <CustomSelect
            value={followerTier}
            onChange={v => setFollowerTier(v as string)}
            options={followerTierOptions}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm text-gray-500 font-medium">검색 조건에 맞는 인플루언서가 없습니다.</p>
                  <p className="text-xs text-gray-400 mt-1">필터를 조정해보세요.</p>
                  <button
                    onClick={() => { setSearch(''); setCategory(''); setFitScoreFilter(''); setEngagementFilter(''); setFollowerTier('') }}
                    className="mt-3 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    필터 초기화
                  </button>
                </td>
              </tr>
            ) : filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(inf => (
              <tr
                key={inf.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => { setSelectedInfluencer(inf); setDetailTab('overview') }}
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
                      className="shrink-0"
                      aria-label={bookmarked.has(inf.id) ? '북마크 해제' : '북마크 추가'}
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
                <td className="py-3 px-4 text-sm text-gray-700">{inf.engagement}%</td>

                {/* Fit Score (원형 배지) */}
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${fitScoreBadge(inf.fitScore)}`}>
                    {inf.fitScore}
                  </span>
                </td>

                {/* 진성비율 */}
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${inf.authentic > 50 ? 'text-green-600' : inf.authentic > 20 ? 'text-orange-500' : 'text-red-500'}`}>
                    {inf.authentic}%
                  </span>
                </td>

                {/* 최근 콘텐츠 미리보기 (3개 플레이스홀더) */}
                <td className="py-3 px-4">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-8 h-8 rounded bg-gray-100" />
                    ))}
                  </div>
                </td>

                {/* 액션 */}
                <td className="py-3 px-4">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedInfluencer(inf); setProposalModal(true) }}
                    className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors duration-150"
                  >
                    제안하기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
          <span className="text-xs text-gray-500">총 {filtered.length}개 중 {Math.min(page * PER_PAGE, filtered.length)}개 표시</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors duration-150"
              disabled={page === 1}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.ceil(filtered.length / PER_PAGE) || 1 }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs transition-colors duration-150 ${page === p ? 'bg-[#8CC63F] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PER_PAGE), p + 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors duration-150"
              disabled={page === Math.ceil(filtered.length / PER_PAGE)}
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
            <div className="flex items-center gap-4 mb-5 -mt-2">
              <div className={`w-14 h-14 rounded-full ${avatarColors[selectedInfluencer.id % avatarColors.length]} flex items-center justify-center text-gray-700 font-bold text-xl shrink-0`}>
                {selectedInfluencer.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{selectedInfluencer.name}</h2>
                  <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${fitScoreBadge(selectedInfluencer.fitScore)}`}>
                    Fit {selectedInfluencer.fitScore}
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
                className="shrink-0 bg-[#8CC63F] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#7AB535] transition-colors duration-150"
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
                    ['팔로워', formatFollowers(selectedInfluencer.followers)],
                    ['참여율', `${selectedInfluencer.engagement}%`],
                    ['게시물 수', `${selectedInfluencer.posts}개`],
                    ['진성 비율', `${selectedInfluencer.authentic}%`],
                    ['최근 활동', selectedInfluencer.lastActive],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className="text-sm font-semibold text-gray-900">{value}</div>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Fit Score</div>
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${fitScoreBadge(selectedInfluencer.fitScore)}`}>
                      {selectedInfluencer.fitScore}
                    </span>
                  </div>
                </div>

                {/* AI 추천 인사이트 */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
                  <p className="text-sm font-semibold text-gray-900 mb-3">AI 추천 인사이트</p>
                  <ul className="space-y-2.5 text-sm text-gray-700 leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-purple-500 shrink-0 mt-0.5">&#9679;</span>
                      <span>이 인플루언서는 <strong>{selectedInfluencer.category.join(', ')}</strong> 분야에서 <strong>{selectedInfluencer.fitScore}점</strong>의 적합도를 보입니다.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-500 shrink-0 mt-0.5">&#9679;</span>
                      <span>진성 팔로워 비율이 <strong>{selectedInfluencer.authentic}%</strong>로 {selectedInfluencer.authentic > 50 ? '높은 신뢰도를 가지고 있어 캠페인 효과가 기대됩니다.' : '보통 수준이므로 콘텐츠 품질에 집중하는 전략이 적합합니다.'}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-500 shrink-0 mt-0.5">&#9679;</span>
                      <span>추천 캠페인 유형: <strong>{selectedInfluencer.fitScore >= 85 ? '유가 시딩' : '무가 시딩'}</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {detailTab === 'content' && (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors duration-150">
                    <span className="text-xs text-gray-400">콘텐츠 {i}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 제안 모달 */}
      <Modal open={proposalModal} onClose={() => setProposalModal(false)} title="캠페인에 제안 보내기">
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
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
              >
                취소
              </button>
              <button
                onClick={handleProposal}
                className="flex-1 bg-[#8CC63F] text-white py-2 rounded-lg text-sm hover:bg-[#7AB535] transition-colors duration-150"
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
