import { useState, useEffect, useRef } from 'react'
import { Heart, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { fmtFollowers as formatFollowers } from '@wellink/ui'
import { AVATAR_COLORS } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { getEngagementColor, getFitScoreBadge } from '@wellink/ui'

interface Influencer {
  id: number
  name: string
  category: string[]
  followers: number
  engagement: number
  fitScore: number
  groups: string[]
}

interface ConfirmState {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
}

const initialInfluencers: Influencer[] = [
  { id: 1, name: '이창민', category: ['피트니스', '크로스핏'], followers: 8700, engagement: 4.1, fitScore: 92, groups: ['우수 인플루언서'] },
  { id: 4, name: '김가애', category: ['요가'], followers: 18900, engagement: 4.2, fitScore: 88, groups: ['우수 인플루언서', '요가/필라테스'] },
  { id: 5, name: '박리나', category: ['웰니스'], followers: 7120, engagement: 2.2, fitScore: 71, groups: [] },
]

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
  // 초기값은 항상 전체 목록. 북마크 탭 필터링은 렌더링 시 bookmarkedIds로 처리.
  const [influencers, setInfluencers] = useState<Influencer[]>(initialInfluencers)
  const [groups, setGroups] = useState<string[]>(initialGroups)
  const [activeTab, setActiveTab] = useState('전체')
  const [newGroupModal, setNewGroupModal] = useState(qa === 'modal-new-group')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupError, setNewGroupError] = useState('')
  const [addToGroupDropdown, setAddToGroupDropdown] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState>(defaultConfirm)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 그룹 추가 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    if (addToGroupDropdown === null) return
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAddToGroupDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [addToGroupDropdown])

  const openConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirm({ open: true, title, description, onConfirm })
  }

  const closeConfirm = () => setConfirm(defaultConfirm)

  const handleConfirm = () => {
    confirm.onConfirm()
    closeConfirm()
  }

  const removeBookmark = (id: number, name: string) => {
    openConfirm(
      `'${name}'을 찜 목록에서 제거할까요?`,
      '찜 목록에서 제외됩니다. 언제든 다시 찜할 수 있어요.',
      () => {
        setInfluencers(prev => {
          const updated = prev.filter(inf => inf.id !== id)
          sessionStorage.setItem('wl_bookmarks', JSON.stringify(updated.map(inf => inf.id)))
          return updated
        })
      }
    )
  }

  const addToGroup = (infId: number, group: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === infId && !inf.groups.includes(group)
        ? { ...inf, groups: [...inf.groups, group] }
        : inf
    ))
    setAddToGroupDropdown(null)
  }

  const removeFromGroup = (infId: number, group: string) => {
    openConfirm(
      `'${group}' 그룹에서 제거할까요?`,
      '그룹에서만 제거되며, 찜 목록에는 유지됩니다.',
      () => setInfluencers(prev => prev.map(inf =>
        inf.id === infId
          ? { ...inf, groups: inf.groups.filter(g => g !== group) }
          : inf
      ))
    )
  }

  const deleteGroup = (group: string) => {
    openConfirm(
      `'${group}' 그룹을 삭제할까요?`,
      '그룹 내 인플루언서는 삭제되지 않습니다.',
      () => {
        setGroups(prev => prev.filter(g => g !== group))
        setInfluencers(prev => prev.map(inf => ({
          ...inf,
          groups: inf.groups.filter(g => g !== group),
        })))
        if (activeTab === group) setActiveTab('전체')
      }
    )
  }

  const GROUP_NAME_MAX = 30

  const validateGroupName = (name: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return '그룹명을 입력해 주세요.'
    if (trimmed.length > GROUP_NAME_MAX) return `그룹명은 ${GROUP_NAME_MAX}자 이하로 입력해 주세요.`
    if (groups.includes(trimmed)) return '이미 존재하는 그룹명입니다.'
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

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-5 animate-pulse">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">북마크한 인플루언서를 그룹별로 관리하세요.</p>
        </div>
        {/* 탭 바 스켈레톤 */}
        <div className="flex gap-2 flex-wrap">
          {[60, 52, 80, 72].map((w, i) => (
            <div key={i} className="h-9 rounded-full bg-gray-200" style={{ width: w + 'px' }} />
          ))}
        </div>
        {/* 카드 3개 스켈레톤 */}
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="flex gap-1">
                    <div className="h-4 w-14 bg-gray-200 rounded-full" />
                    <div className="h-4 w-14 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="인플루언서 관리 데이터를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  /* ── QA: 빈 상태 ── */
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

  // 탭별 필터
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

  return (
    <div className="space-y-5">
      {/* 상단 헤더 */}
      <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">북마크한 인플루언서를 그룹별로 관리하세요.</p>
        </div>
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
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {getTabCount(tab)}
              </span>
            </button>
            {tab !== '전체' && tab !== '북마크' && (
              <button
                onClick={() => deleteGroup(tab)}
                aria-label={`${tab} 그룹 삭제`}
                className={`ml-0.5 rounded-full transition-colors ${
                  activeTab === tab
                    ? 'text-white/70 hover:text-white'
                    : 'text-gray-400 hover:text-red-500'
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

      {/* 인플루언서 카드 그리드 또는 빈 상태 */}
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
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
          {filteredInfluencers.map(inf => (
            <div
              key={inf.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative group"
            >
              {/* 북마크 하트 (우측 상단) */}
              <button
                onClick={() => removeBookmark(inf.id, inf.name)}
                className="absolute top-4 right-4"
                title={`${inf.name} 찜 해제`}
                aria-label={`${inf.name} 찜 해제`}
              >
                <Heart size={16} className="text-red-500 fill-red-500 hover:opacity-70 transition-opacity" aria-hidden="true" />
              </button>

              {/* 프로필 영역 */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full ${AVATAR_COLORS[inf.id % AVATAR_COLORS.length]} flex items-center justify-center text-gray-700 font-bold text-base shrink-0`}>
                  {inf.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{inf.name}</p>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {inf.category.map(c => (
                      <span key={c} className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 지표 */}
              <div className="flex items-center gap-4 text-sm mb-3">
                <div>
                  <span className="text-xs text-gray-400">팔로워</span>
                  <p className="font-semibold text-gray-900">{formatFollowers(inf.followers)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">참여율</span>
                  <p className={`font-semibold ${getEngagementColor(inf.engagement)}`}>{inf.engagement}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">핏 스코어</span>
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${getFitScoreBadge(inf.fitScore)}`}>
                    {inf.fitScore}
                  </span>
                </div>
              </div>

              {/* 그룹 태그 + 호버 시 "그룹에 추가" */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {inf.groups.map(g => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-brand-green/10 text-brand-green"
                  >
                    {g}
                    <button
                      onClick={() => removeFromGroup(inf.id, g)}
                      aria-label={`${g} 그룹에서 제거`}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={11} aria-hidden="true" />
                    </button>
                  </span>
                ))}
                <div className="relative" ref={addToGroupDropdown === inf.id ? dropdownRef : null}>
                  <button
                    onClick={() => setAddToGroupDropdown(addToGroupDropdown === inf.id ? null : inf.id)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    <Plus size={11} aria-hidden="true" />
                    그룹에 추가
                  </button>
                  {addToGroupDropdown === inf.id && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
                      {groups.filter(g => !inf.groups.includes(g)).length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400">모든 그룹에 소속됨</div>
                      ) : (
                        groups.filter(g => !inf.groups.includes(g)).map(g => (
                          <button
                            key={g}
                            onClick={() => addToGroup(inf.id, g)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
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
      )}

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
                newGroupError
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-gray-200'
              }`}
              onKeyDown={e => e.key === 'Enter' && createGroup()}
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

      {/* 삭제 컨펌 다이얼로그 */}
      <Modal open={confirm.open} onClose={closeConfirm} size="sm" title={confirm.title}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500">{confirm.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeConfirm}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm hover:bg-red-600 transition-colors duration-150"
            >
              삭제
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
