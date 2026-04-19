import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, Plus, X, Loader2, Image, MessageCircle, Sparkles, Target, TrendingUp, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal, BottomSheet } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { fmtFollowers as formatFollowers, TIMER_MS } from '@wellink/ui'
import { AVATAR_COLORS } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { getEngagementColor, getFitScoreColor, getFitScoreBadge, getAuthenticColor, getRecommendedCampaignType } from '@wellink/ui'
import { useDeviceMode } from '../qa-mockup-kit'

const INITIAL_SIZE = 100
const PAGE_SIZE = 20

interface Influencer {
  id: number
  name: string
  category: string[]
  followers: number
  engagement: number
  posts: number
  authentic: number
  lastActive: string
  fitScore: number
  groups: string[]
  addedAt: number // timestamp ms — BE 연동 시 서버 값으로 교체
}

const campaigns = [
  { id: 1, name: '봄 요가 프로모션' },
  { id: 2, name: '비건 신제품 론칭' },
]

interface ConfirmState {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
}

const NOW = Date.now()
const DAY_MS = 86_400_000

// 목업 데이터 — BE 연동 시 API로 교체 (최근 추가순 정렬 기준: addedAt 내림차순)
const ALL_INFLUENCERS: Influencer[] = Array.from({ length: 200 }, (_, i) => {
  const base = [
    { id: 1, name: '이창민',                     category: ['피트니스', '크로스핏'],  followers: 8700,  engagement: 4.1, posts: 234, authentic: 92.3, lastActive: '2일 전', fitScore: 92, groups: ['우수 인플루언서'] },
    { id: 4, name: '김가애',                     category: ['요가'],                followers: 18900, engagement: 4.2, posts: 567, authentic: 88.7, lastActive: '오늘',  fitScore: 88, groups: ['우수 인플루언서', '요가/필라테스'] },
    { id: 5, name: '박리나',                     category: ['웰니스'],               followers: 7120,  engagement: 2.2, posts: 178, authentic: 85.2, lastActive: '3일 전', fitScore: 71, groups: [] },
    { id: 6, name: '최수진나이스바디핏니스트레이너', category: ['러닝', '마라톤', '트레일'],  followers: 12400, engagement: 3.8, posts: 302, authentic: 79.4, lastActive: '1일 전', fitScore: 85, groups: [] },
    { id: 7, name: '정민준헬스앤라이프스타일코치',  category: ['헬스', 'PT', '다이어트'],  followers: 5300,  engagement: 5.1, posts: 145, authentic: 91.0, lastActive: '4일 전', fitScore: 79, groups: [] },
  ]
  const src = base[i % base.length]
  // 앞쪽 인덱스일수록 최근 추가 (index 0 = 오늘, 이후 하루씩 과거)
  return {
    ...src,
    id: i + 1,
    name: i < 3 ? src.name : `${src.name} ${i + 1}`,
    addedAt: NOW - i * DAY_MS,
  }
}).sort((a, b) => b.addedAt - a.addedAt)

const initialGroups = ['우수 인플루언서', '요가/필라테스']
const defaultConfirm: ConfirmState = { open: false, title: '', description: '', onConfirm: () => {} }

function getBookmarkedIds(): Set<number> {
  try {
    const raw = sessionStorage.getItem('wl_bookmarks')
    if (raw) return new Set<number>(JSON.parse(raw) as number[])
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[sessionStorage]', e)
  }
  return new Set<number>()
}

export default function InfluencerManage() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()
  const device = useDeviceMode()
  const isMobile = device !== 'desktop'

  const [influencers, setInfluencers] = useState<Influencer[]>(ALL_INFLUENCERS.slice(0, INITIAL_SIZE))
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(ALL_INFLUENCERS.length > INITIAL_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [groups, setGroups] = useState<string[]>(initialGroups)
  const [activeTab, setActiveTab] = useState('전체')
  const [newGroupModal, setNewGroupModal] = useState(qa === 'modal-new-group')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupError, setNewGroupError] = useState('')
  const [addToGroupTarget, setAddToGroupTarget] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState>(defaultConfirm)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 상세 모달
  const [detailInfluencer, setDetailInfluencer] = useState<Influencer | null>(null)
  const [detailTab, setDetailTab] = useState('overview')
  const [contentSubTab, setContentSubTab] = useState<'feed' | 'reels'>('feed')
  const [contentSort, setContentSort] = useState<'latest' | 'likes' | 'comments'>('latest')
  const [proposalModal, setProposalModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null)
  const [proposalSent, setProposalSent] = useState(false)

  const GROUP_NAME_MAX = 30

  // ── 무한 스크롤 ──────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    // BE 연동 시 API 호출로 교체
    setTimeout(() => {
      const start = INITIAL_SIZE + page * PAGE_SIZE
      const more = ALL_INFLUENCERS.slice(start, start + PAGE_SIZE)
      if (more.length > 0) {
        setInfluencers(prev => [...prev, ...more])
        setPage(p => p + 1)
        setHasMore(start + PAGE_SIZE < ALL_INFLUENCERS.length)
      } else {
        setHasMore(false)
      }
      setLoadingMore(false)
    }, 600)
  }, [loadingMore, hasMore, page])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '100px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  // ── 드롭다운 바깥 클릭 닫기 (데스크톱) ───────────────────
  useEffect(() => {
    if (isMobile || addToGroupTarget === null) return
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAddToGroupTarget(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [addToGroupTarget, isMobile])

  // ── 액션 ─────────────────────────────────────────────────
  const openConfirm = (title: string, description: string, onConfirm: () => void) =>
    setConfirm({ open: true, title, description, onConfirm })

  const closeConfirm = () => setConfirm(defaultConfirm)

  const removeBookmark = (id: number, name: string) =>
    openConfirm(
      `'${name}'을 찜 목록에서 제거할까요?`,
      '찜 목록에서 제외됩니다. 언제든 다시 찜할 수 있어요.',
      () => setInfluencers(prev => {
        const updated = prev.filter(inf => inf.id !== id)
        sessionStorage.setItem('wl_bookmarks', JSON.stringify(updated.map(inf => inf.id)))
        return updated
      })
    )

  const addToGroup = (infId: number, group: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === infId && !inf.groups.includes(group)
        ? { ...inf, groups: [...inf.groups, group] }
        : inf
    ))
    setAddToGroupTarget(null)
  }

  const removeFromGroup = (infId: number, group: string) =>
    openConfirm(
      `'${group}' 그룹에서 제거할까요?`,
      '그룹에서만 제거되며, 찜 목록에는 유지됩니다.',
      () => setInfluencers(prev => prev.map(inf =>
        inf.id === infId ? { ...inf, groups: inf.groups.filter(g => g !== group) } : inf
      ))
    )

  const deleteGroup = (group: string) =>
    openConfirm(
      `'${group}' 그룹을 삭제할까요?`,
      '그룹 내 인플루언서는 삭제되지 않습니다.',
      () => {
        setGroups(prev => prev.filter(g => g !== group))
        setInfluencers(prev => prev.map(inf => ({ ...inf, groups: inf.groups.filter(g => g !== group) })))
        if (activeTab === group) setActiveTab('전체')
      }
    )

  const handleProposal = () => {
    if (!selectedCampaign) { showToast('캠페인을 선택해주세요.', 'error'); return }
    const influencerName = detailInfluencer?.name
    setProposalSent(true)
    setTimeout(() => {
      setProposalModal(false)
      setProposalSent(false)
      setSelectedCampaign(null)
      setDetailInfluencer(null)
      showToast(`${influencerName}님에게 제안을 전송했습니다.`, 'success')
    }, TIMER_MS.MOCK_SEND)
  }

  const validateGroupName = (name: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return '그룹명을 입력해 주세요.'
    if (trimmed.length > GROUP_NAME_MAX) return `그룹명은 ${GROUP_NAME_MAX}자 이하로 입력해 주세요.`
    if (groups.map(g => g.toLowerCase()).includes(trimmed.toLowerCase())) return '이미 존재하는 그룹명입니다.'
    return ''
  }

  const createGroup = () => {
    const trimmed = newGroupName.trim()
    const error = validateGroupName(trimmed)
    if (error) { setNewGroupError(error); return }
    setGroups(prev => [...prev, trimmed])
    setNewGroupName('')
    setNewGroupError('')
    setNewGroupModal(false)
    showToast('그룹이 생성되었습니다.', 'success')
  }

  // ── QA 상태 ───────────────────────────────────────────────
  if (qa === 'loading') {
    return (
      <div className="space-y-5 animate-pulse">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">북마크한 인플루언서를 그룹별로 관리하세요.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[60, 52, 80, 72].map((w, i) => (
            <div key={i} className="h-9 rounded-full bg-gray-200" style={{ width: w + 'px' }} />
          ))}
        </div>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="flex gap-1"><div className="h-4 w-14 bg-gray-200 rounded-full" /></div>
                </div>
              </div>
              <div className="flex gap-3 mb-3">
                {[0, 1, 2].map(j => <div key={j} className="h-12 w-20 bg-gray-200 rounded" />)}
              </div>
              <div className="flex gap-1.5">
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (qa === 'error') {
    return <ErrorState message="인플루언서 관리 데이터를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center w-full max-w-sm">
          <Heart size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-400 mb-1">찜한 인플루언서가 없습니다</p>
          <p className="text-xs text-gray-400 mb-4">인플루언서 리스트에서 마음에 드는 인플루언서를 찜해보세요</p>
          <button
            onClick={() => navigate('/influencers/list')}
            className="text-sm bg-brand-green text-white px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors"
          >
            인플루언서 찾아보기
          </button>
        </div>
      </div>
    )
  }

  // ── 탭 필터 ──────────────────────────────────────────────
  const tabs = ['전체', '북마크', ...groups]
  const bookmarkedIds = getBookmarkedIds()
  const bookmarkedInfluencers = influencers.filter(inf => bookmarkedIds.has(inf.id))
  const filteredInfluencers = activeTab === '전체'
    ? influencers
    : activeTab === '북마크'
      ? bookmarkedInfluencers
      : influencers.filter(inf => inf.groups.includes(activeTab))

  const getTabCount = (tab: string) => {
    if (tab === '전체') return influencers.length
    if (tab === '북마크') return bookmarkedInfluencers.length
    return influencers.filter(inf => inf.groups.includes(tab)).length
  }

  // "그룹에 추가" 드롭다운/바텀시트에 보여줄 그룹 목록
  const getAddableGroups = (inf: Influencer) => groups.filter(g => !inf.groups.includes(g))

  const targetInfluencer = influencers.find(inf => inf.id === addToGroupTarget) ?? null

  return (
    <div className="space-y-5">
      {/* 상단 헤더 + 탭 (sticky) */}
      <div className={`sticky ${device === 'desktop' ? 'top-0' : 'top-12'} z-40 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pt-4 pb-3 bg-gray-50/95 backdrop-blur-sm space-y-4`}>
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">북마크한 인플루언서를 그룹별로 관리하세요.</p>
        </div>

      {/* 그룹 탭 */}
      <div role="tablist" className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-all duration-150 ${
              activeTab === tab
                ? 'bg-brand-green text-white font-medium'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            <button
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5"
            >
              {tab === '북마크' && <Heart size={13} aria-hidden="true" />}
              {tab}
            </button>
            {tab !== '전체' && tab !== '북마크' && (
              <button
                onClick={() => deleteGroup(tab)}
                aria-label={`${tab} 그룹 삭제`}
                className={`ml-0.5 rounded-full transition-colors ${
                  activeTab === tab ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setNewGroupModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <Plus size={13} aria-hidden="true" />
          그룹 추가
        </button>
      </div>
      </div>

      {/* 인플루언서 카드 목록 */}
      {filteredInfluencers.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={40} className="mx-auto text-gray-400 mb-4" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-500 mb-1">저장된 인플루언서가 없습니다.</p>
          <p className="text-xs text-gray-400 mb-4">인플루언서 리스트에서 하트를 눌러 저장해보세요.</p>
          <button
            onClick={() => navigate('/influencers/list')}
            className="inline-flex items-center gap-1.5 bg-brand-green text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors duration-150"
          >
            인플루언서 찾아보기
          </button>
        </div>
      ) : (
        <>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {filteredInfluencers.map(inf => (
              <div
                key={inf.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow duration-150"
                onClick={() => { setDetailInfluencer(inf); setDetailTab('overview') }}
              >
                {/* 프로필 행 */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex w-11 h-11 rounded-full ${AVATAR_COLORS[inf.id % AVATAR_COLORS.length]} items-center justify-center text-gray-700 font-bold text-base shrink-0`}>
                    {inf.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate min-w-0">{inf.name}</p>
                      {NOW - inf.addedAt <= 3 * DAY_MS && (
                        <span className="shrink-0 text-[10px] font-semibold bg-brand-green text-white px-1.5 py-0.5 rounded-full">NEW</span>
                      )}
                    </div>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      {inf.category.map(c => (
                        <span key={c} className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeBookmark(inf.id, inf.name) }}
                    className="shrink-0 mt-0.5"
                    aria-label={`${inf.name} 찜 해제`}
                  >
                    <Heart size={16} className="text-red-500 fill-red-500 hover:opacity-70 transition-opacity" aria-hidden="true" />
                  </button>
                </div>

                {/* 지표 — 배지 형태, 가로 나열 + 줄바꿈 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-400">팔로워</span>
                    <span className="text-sm font-semibold text-gray-900">{formatFollowers(inf.followers)}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-400">참여율</span>
                    <span className={`text-sm font-semibold ${getEngagementColor(inf.engagement)}`}>{inf.engagement}%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-400">핏 스코어</span>
                    <span className={`text-sm font-semibold ${getFitScoreColor(inf.fitScore)}`}>{inf.fitScore}</span>
                  </div>
                </div>

                {/* 그룹 태그 + 그룹에 추가 */}
                <div className="flex items-center gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
                  {inf.groups.map(g => (
                    <span key={g} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-brand-green/10 text-brand-green">
                      {g}
                      <button onClick={() => removeFromGroup(inf.id, g)} aria-label={`${g} 그룹에서 제거`} className="hover:text-red-500 transition-colors">
                        <X size={11} aria-hidden="true" />
                      </button>
                    </span>
                  ))}

                  {/* 데스크톱: 드롭다운 / 모바일·태블릿: 바텀시트 */}
                  <div className="relative" ref={!isMobile && addToGroupTarget === inf.id ? dropdownRef : null}>
                    <button
                      onClick={() => setAddToGroupTarget(addToGroupTarget === inf.id ? null : inf.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-600 transition-colors duration-150"
                    >
                      <Plus size={11} aria-hidden="true" />
                      그룹에 추가
                    </button>

                    {/* 데스크톱 드롭다운 */}
                    {!isMobile && addToGroupTarget === inf.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-[160px]">
                        {getAddableGroups(inf).length === 0 ? (
                          groups.length === 0
                            ? (
                              <div className="px-3 py-2 text-xs text-gray-400">
                                생성된 그룹이 없습니다.
                                <button onClick={() => { setAddToGroupTarget(null); setNewGroupModal(true) }} className="block text-brand-green mt-1 hover:underline">새 그룹 만들기</button>
                              </div>
                            ) : (
                              <div className="px-3 py-2 text-xs text-gray-400">모든 그룹에 소속됨</div>
                            )
                        ) : (
                          getAddableGroups(inf).map(g => (
                            <button key={g} onClick={() => addToGroup(inf.id, g)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              {g}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 무한 스크롤 sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {/* 로딩 스피너 또는 끝 표시 */}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-gray-400" aria-label="추가 로드 중" />
            </div>
          )}
          {!hasMore && influencers.length > PAGE_SIZE && (
            <div className="pb-8" />
          )}
        </>
      )}

      {/* 바텀시트 — 모바일/태블릿 그룹 추가 */}
      <BottomSheet
        open={isMobile && addToGroupTarget !== null}
        onClose={() => setAddToGroupTarget(null)}
        title="그룹에 추가"
      >
        {targetInfluencer && (
          <div>
            {getAddableGroups(targetInfluencer).length === 0 ? (
              <div className="px-5 py-6 text-center">
                {groups.length === 0 ? (
                  <>
                    <p className="text-sm text-gray-500 mb-3">생성된 그룹이 없습니다.</p>
                    <button
                      onClick={() => { setAddToGroupTarget(null); setNewGroupModal(true) }}
                      className="text-sm text-brand-green font-medium hover:underline"
                    >
                      새 그룹 만들기
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">모든 그룹에 소속되어 있습니다.</p>
                )}
              </div>
            ) : (
              <ul className="py-2">
                {getAddableGroups(targetInfluencer).map(g => (
                  <li key={g}>
                    <button
                      onClick={() => addToGroup(targetInfluencer.id, g)}
                      className="w-full text-left px-5 py-3.5 text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-brand-green shrink-0" />
                      {g}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </BottomSheet>

      {/* 새 그룹 만들기 모달 */}
      <Modal
        open={newGroupModal}
        onClose={() => { setNewGroupModal(false); setNewGroupName(''); setNewGroupError('') }}
        title="새 그룹 만들기"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">그룹명</label>
            <input
              type="text"
              value={newGroupName}
              onChange={e => { setNewGroupName(e.target.value); setNewGroupError('') }}
              placeholder="예: VIP 인플루언서"
              maxLength={GROUP_NAME_MAX + 1}
              aria-invalid={!!newGroupError}
              aria-describedby={newGroupError ? 'group-name-error' : undefined}
              className={`w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 transition-all duration-150 ${
                newGroupError ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200'
              }`}
              onKeyDown={e => e.key === 'Enter' && createGroup()}
              autoFocus
            />
            <div className="flex items-start justify-between mt-1.5">
              {newGroupError
                ? <p id="group-name-error" role="alert" className="text-xs text-red-500">{newGroupError}</p>
                : <span />
              }
              <span className={`text-xs ml-auto ${newGroupName.trim().length > GROUP_NAME_MAX ? 'text-red-500' : 'text-gray-400'}`}>
                {newGroupName.trim().length}/{GROUP_NAME_MAX}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setNewGroupModal(false); setNewGroupName(''); setNewGroupError('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              취소
            </button>
            <button
              onClick={createGroup}
              disabled={!newGroupName.trim()}
              className="flex-1 bg-brand-green text-white py-2 rounded-xl text-sm hover:bg-brand-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              생성
            </button>
          </div>
        </div>
      </Modal>

      {/* 삭제 컨펌 */}
      <Modal open={confirm.open} onClose={closeConfirm} size="sm" title={confirm.title}>
        <div className="space-y-4">
          <p className="text-xs text-gray-500">{confirm.description}</p>
          <div className="flex gap-2">
            <button onClick={closeConfirm} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150">
              취소
            </button>
            <button onClick={() => { confirm.onConfirm(); closeConfirm() }} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm hover:bg-red-600 transition-colors duration-150">
              삭제
            </button>
          </div>
        </div>
      </Modal>

      {/* 인플루언서 상세 모달 */}
      {!!detailInfluencer && !proposalModal && (() => {
        const inf = detailInfluencer
        const s = inf.id
        const avgLikes = Math.round((s * 137 + 50) % 4000 + 200)
        const avgComments = Math.round((s * 53 + 10) % 200 + 10)
        const avgReelsViews = Math.round((s * 271 + 300) % 8000 + 500)
        const avgReelsEng = ((avgLikes / avgReelsViews) * 100).toFixed(1)
        const bgOptions = ['from-pink-100 to-pink-200','from-blue-100 to-blue-200','from-green-100 to-green-200','from-yellow-100 to-yellow-200','from-purple-100 to-purple-200','from-amber-100 to-amber-200']
        const feedCount = 6 + (s % 4)
        const reelsCount = 2 + (s % 3)
        const imgCount = 1 + (s % 2)
        const totalContent = feedCount + reelsCount + imgCount
        const feedContents = Array.from({ length: Math.min(feedCount, 9) }, (_, i) => ({
          bg: bgOptions[(s + i) % bgOptions.length],
          likes: Math.round((s * 137 + i * 79) % 3000 + 100),
          comments: Math.round((s * 53 + i * 31) % 150 + 5),
        }))
        const reelsContents = Array.from({ length: reelsCount }, (_, i) => ({
          bg: bgOptions[(s * 2 + i) % bgOptions.length],
          likes: Math.round((s * 97 + i * 113) % 2000 + 50),
          comments: Math.round((s * 41 + i * 17) % 80 + 2),
        }))
        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => { setDetailInfluencer(null); setDetailTab('overview'); setContentSubTab('feed'); setContentSort('latest') }}
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
                    <div className="flex items-center">
                      <h2 className="text-base font-bold text-gray-900 flex-1">{inf.name}</h2>
                      <button
                        onClick={() => { setDetailInfluencer(null); setDetailTab('overview'); setContentSubTab('feed'); setContentSort('latest') }}
                        aria-label="닫기"
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150 shrink-0"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {inf.category.map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{c}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                      {inf.authentic >= 80 ? '꾸준한 활동과 높은 진성 팔로워로 신뢰도 높은 인플루언서' : '활발한 콘텐츠 업로드와 카테고리 전문성 보유'}
                    </p>
                  </div>
                </div>
                <div role="tablist" className="flex border-b border-gray-100 -mx-6 px-6">
                  {[['overview', '개요'], ['content', '최근 콘텐츠']].map(([key, label]) => (
                    <button key={key} role="tab" aria-selected={detailTab === key} onClick={() => setDetailTab(key)}
                      className={`text-sm px-3 py-2.5 border-b-2 transition-all duration-150 ${detailTab === key ? 'border-gray-900 font-semibold text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 스크롤 콘텐츠 */}
              <div className="overflow-y-auto px-6 py-4" style={{ flex: '1 1 0', minHeight: 0 }}>

            {detailTab === 'overview' && (
              <div className="space-y-5">
                {/* 공통 프로필 정보 */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">공통 프로필 정보</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      ['팔로워', formatFollowers(inf.followers), 'text-gray-900'],
                      ['게시물 수', `${inf.posts}개`, 'text-gray-900'],
                      ['최근 활동', inf.lastActive, 'text-gray-900'],
                      ['참여율', `${inf.engagement}%`, getEngagementColor(inf.engagement)],
                      ['진성 비율', `${inf.authentic}%`, getAuthenticColor(inf.authentic)],
                      ['Fit Score', null, ''],
                    ].map(([label, value, cls]) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                        <div className="text-[11px] text-gray-400 mb-1">{label}</div>
                        {label === 'Fit Score'
                          ? <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${getFitScoreBadge(inf.fitScore)}`}>{inf.fitScore}</span>
                          : <div className={`text-sm font-semibold ${cls}`}>{value}</div>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* 성과 지표 + 콘텐츠 분석 */}
                <div className={`grid gap-4 ${device === 'phone' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <MessageCircle size={13} className="text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500">성과 지표</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['평균 댓글', `${avgComments}개`],
                        ['평균 좋아요', formatFollowers(avgLikes)],
                        ['릴스 평균 조회수', formatFollowers(avgReelsViews)],
                        ['릴스 평균 참여율', `${avgReelsEng}%`],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-[11px] text-gray-400">{label}</p>
                          <p className="text-sm font-semibold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Image size={13} className="text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500">최근 콘텐츠 분석</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* 도넛 차트 SVG */}
                      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
                        {(() => {
                          const items = [
                            { pct: feedCount / totalContent, color: '#f97316' },
                            { pct: reelsCount / totalContent, color: '#8b5cf6' },
                            { pct: imgCount / totalContent, color: '#22c55e' },
                          ]
                          let offset = 0
                          const r = 24, cx = 32, cy = 32, stroke = 10
                          const circ = 2 * Math.PI * r
                          return items.map((item, i) => {
                            const dash = item.pct * circ
                            const el = (
                              <circle key={i} cx={cx} cy={cy} r={r}
                                fill="none" stroke={item.color} strokeWidth={stroke}
                                strokeDasharray={`${dash} ${circ - dash}`}
                                strokeDashoffset={-offset * circ}
                                transform="rotate(-90 32 32)"
                              />
                            )
                            offset += item.pct
                            return el
                          })
                        })()}
                        <text x="32" y="36" textAnchor="middle" className="text-xs font-bold fill-gray-700" fontSize="12" fontWeight="bold">{totalContent}</text>
                      </svg>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />피드 {feedCount}개 ({Math.round(feedCount/totalContent*100)}%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />릴스 {reelsCount}개 ({Math.round(reelsCount/totalContent*100)}%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />이미지 {imgCount}개 ({Math.round(imgCount/totalContent*100)}%)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI 인사이트 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles size={13} className="text-gray-400" aria-hidden="true" />
                    <p className="text-sm font-semibold text-gray-900">AI 인사이트 가이드</p>
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">Beta</span>
                  </div>
                  <div className={`grid gap-2.5 ${device === 'phone' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2"><Target size={12} className="text-gray-400" /><span className="text-[11px] font-semibold text-gray-600">브랜드 핏 스코어</span></div>
                      <div className="flex items-end gap-1 mb-1.5">
                        <span className={`text-2xl font-bold ${getFitScoreColor(inf.fitScore)}`}>{inf.fitScore}</span>
                        <span className="text-xs text-gray-400 mb-1">/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                        <div className={`h-full rounded-full ${inf.fitScore >= 85 ? 'bg-green-500' : inf.fitScore >= 70 ? 'bg-amber-400' : 'bg-gray-400'}`} style={{ width: `${inf.fitScore}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">카테고리 매칭도 · 팔로워 겹침률 기반</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2"><TrendingUp size={12} className="text-gray-400" /><span className="text-[11px] font-semibold text-gray-600">추천 캠페인</span></div>
                      <p className="text-xs font-bold text-gray-900 mb-1.5">{getRecommendedCampaignType(inf.fitScore)}</p>
                      <p className="text-[10px] text-gray-500 leading-snug">평균 대비 <span className="font-semibold text-gray-700">{inf.fitScore >= 85 ? '2.3배' : inf.fitScore >= 70 ? '1.7배' : '1.2배'}</span> 높은 참여율</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2"><Lightbulb size={12} className="text-gray-400" /><span className="text-[11px] font-semibold text-gray-600">협업 팁</span></div>
                      <p className="text-[10px] text-gray-600 leading-snug">{inf.authentic >= 60 ? '월·목 오전 포스팅이 최고 도달률' : '스토리 연동 세트 콘텐츠 효과적'}</p>
                      <p className="text-[10px] text-gray-400 mt-1.5">주 {inf.authentic >= 60 ? '3' : '2'}회 업로드 패턴</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'content' && (() => {
              const isFeed = contentSubTab === 'feed'
              const baseItems = isFeed ? feedContents : reelsContents
              const sorted = [...baseItems].sort((a, b) => {
                if (contentSort === 'likes') return b.likes - a.likes
                if (contentSort === 'comments') return b.comments - a.comments
                return 0 // latest: 원래 순서 유지
              })
              return (
                <div>
                  {/* 서브탭 + 정렬 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0">
                      {(['feed', 'reels'] as const).map(tab => (
                        <button key={tab} onClick={() => { setContentSubTab(tab); setContentSort('latest') }}
                          className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 font-medium ${contentSubTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                          {tab === 'feed' ? '피드' : '릴스'}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {([['latest', '최신순'], ['likes', '좋아요순'], ['comments', '댓글순']] as const).map(([val, label]) => (
                        <button key={val} onClick={() => setContentSort(val)}
                          className={`text-[11px] px-2 py-1 rounded-lg transition-all duration-150 ${contentSort === val ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="flex gap-3 text-[11px] text-gray-400 mb-3">
                    {isFeed ? (
                      <>
                        <span>평균 좋아요 <span className="font-semibold text-gray-600">{formatFollowers(avgLikes)}</span></span>
                        <span>평균 댓글 <span className="font-semibold text-gray-600">{avgComments}</span></span>
                      </>
                    ) : (
                      <>
                        <span>평균 조회수 <span className="font-semibold text-gray-600">{formatFollowers(avgReelsViews)}</span></span>
                        <span>평균 참여율 <span className="font-semibold text-gray-600">{avgReelsEng}%</span></span>
                      </>
                    )}
                  </div>

                  {/* 그리드 */}
                  <div className="grid grid-cols-3 gap-2">
                    {sorted.map((c, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-gray-100 cursor-default" onClick={() => showToast('콘텐츠 상세는 준비 중이에요.', 'info')}>
                        <div className={`bg-gradient-to-br ${c.bg} flex items-center justify-center relative ${isFeed ? 'aspect-square' : 'aspect-[9/16]'}`}>
                          <Image size={18} className="text-white/50" aria-hidden="true" />
                          {!isFeed && <span className="absolute top-1.5 right-1.5 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">릴스</span>}
                        </div>
                        <div className="px-2 py-1.5 bg-white flex gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Heart size={9} className="text-red-400" />{c.likes.toLocaleString()}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><MessageCircle size={9} className="text-gray-300" />{c.comments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
              </div>

              <div className="border-t border-gray-100 px-6 py-4 shrink-0">
                <button
                  onClick={() => setProposalModal(true)}
                  className="w-full bg-brand-green text-white text-sm py-3 rounded-xl hover:bg-brand-green-hover transition-colors duration-150 font-medium"
                >
                  캠페인에 제안 보내기
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 제안 모달 */}
      <Modal open={proposalModal} onClose={() => { setProposalModal(false); setSelectedCampaign(null); setProposalSent(false) }} title="캠페인에 제안 보내기" size="sm">
        {proposalSent ? (
          <div className="text-center py-6">
            <p className="text-sm font-semibold text-gray-900">제안이 전송되었습니다!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600"><strong>{detailInfluencer?.name}</strong>님에게 제안을 보낼 캠페인을 선택하세요.</p>
            <div className="space-y-2 max-h-[228px] overflow-y-auto pr-1">
              {campaigns.map(c => (
                <label key={c.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-150 ${selectedCampaign === c.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="campaign" value={c.id} checked={selectedCampaign === c.id} onChange={() => setSelectedCampaign(c.id)} className="accent-gray-900" />
                  <span className="text-sm text-gray-700">{c.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setProposalModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150">취소</button>
              <button onClick={handleProposal} className="flex-1 bg-brand-green text-white py-2 rounded-xl text-sm hover:bg-brand-green-hover transition-colors duration-150">제안 보내기</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
