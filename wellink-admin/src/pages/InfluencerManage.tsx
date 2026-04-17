import { useState, useEffect } from 'react'
import { Heart, Plus, FolderPlus, Users, X } from 'lucide-react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Modal from '../components/Modal'
import Dropdown from '../components/Dropdown'

interface Influencer {
  id: number
  name: string
  category: string[]
  followers: number
  engagement: number
  fitScore: number
  groups: string[]
  bookmarked: boolean
}

const initialInfluencers: Influencer[] = [
  { id: 1, name: '이창민', category: ['피트니스', '크로스핏'], followers: 8700, engagement: 4.1, fitScore: 92, groups: ['우수 인플루언서'], bookmarked: true },
  { id: 4, name: '김가애', category: ['요가'], followers: 18900, engagement: 4.2, fitScore: 88, groups: ['우수 인플루언서', '요가/필라테스'], bookmarked: true },
  { id: 5, name: '박리나', category: ['웰니스'], followers: 7120, engagement: 2.23, fitScore: 71, groups: [], bookmarked: false },
]

const initialGroups = ['우수 인플루언서', '요가/필라테스']

function formatFollowers(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return `${n}`
}

const avatarColors = ['bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200']

function fitScoreBadge(score: number) {
  if (score >= 85) return 'bg-green-100 text-green-700'
  if (score >= 70) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-500'
}

export default function InfluencerManage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [influencers, setInfluencers] = useState<Influencer[]>(initialInfluencers)
  const [groups, setGroups] = useState<string[]>(initialGroups)
  const [activeTab, setActiveTab] = useState('전체')
  const [searchParams] = useSearchParams()
  const [newGroupModal, setNewGroupModal] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('modal') === 'newgroup') setNewGroupModal(true)
  }, [searchParams, location.key])
  const [newGroupName, setNewGroupName] = useState('')
  const removeBookmark = (id: number) => {
    setInfluencers(prev => prev.filter(inf => inf.id !== id))
  }

  const addToGroup = (infId: number, group: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === infId && !inf.groups.includes(group)
        ? { ...inf, groups: [...inf.groups, group] }
        : inf
    ))
  }

  const removeFromGroup = (infId: number, group: string) => {
    setInfluencers(prev => prev.map(inf =>
      inf.id === infId
        ? { ...inf, groups: inf.groups.filter(g => g !== group) }
        : inf
    ))
  }

  const createGroup = () => {
    const trimmed = newGroupName.trim()
    if (!trimmed || groups.includes(trimmed)) return
    setGroups(prev => [...prev, trimmed])
    setNewGroupName('')
    setNewGroupModal(false)
  }

  const deleteGroup = (name: string) => {
    setGroups(prev => prev.filter(g => g !== name))
    setInfluencers(prev => prev.map(inf => ({ ...inf, groups: inf.groups.filter(g => g !== name) })))
    if (activeTab === name) setActiveTab('전체')
    setConfirmDeleteGroup(null)
  }

  // 탭별 필터
  const tabs = ['전체', '북마크', ...groups]
  const filteredInfluencers = activeTab === '전체'
    ? influencers
    : activeTab === '북마크'
      ? influencers.filter(inf => inf.bookmarked)
      : influencers.filter(inf => inf.groups.includes(activeTab))

  const getTabCount = (tab: string) => {
    if (tab === '전체') return influencers.length
    if (tab === '북마크') return influencers.filter(inf => inf.bookmarked).length
    return influencers.filter(inf => inf.groups.includes(tab)).length
  }

  return (
    <div className="space-y-5">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">인플루언서 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">북마크한 인플루언서를 그룹별로 관리하세요.</p>
        </div>
        <button
          onClick={() => setNewGroupModal(true)}
          className="flex items-center gap-1.5 bg-[#8CC63F] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#7AB535] transition-colors duration-150"
        >
          <FolderPlus size={15} />
          새 그룹 만들기
        </button>
      </div>

      {/* 그룹 탭 */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => {
          const isCustomGroup = tab !== '전체' && tab !== '북마크'
          const isActive = activeTab === tab
          const baseClass = `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-all duration-150 ${
            isActive ? 'bg-[#8CC63F] text-white font-medium' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
          }`
          const countBadge = (
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {getTabCount(tab)}
            </span>
          )
          if (isCustomGroup) {
            return (
              <div key={tab} className={baseClass}>
                <button onClick={() => setActiveTab(tab)} className="flex items-center gap-1.5">
                  <Users size={13} />
                  {tab}
                  {countBadge}
                </button>
                <button
                  onClick={() => setConfirmDeleteGroup(tab)}
                  aria-label={`${tab} 그룹 삭제`}
                  className={`ml-0.5 transition-opacity hover:opacity-70 ${isActive ? 'text-white' : 'text-gray-400'}`}
                >
                  <X size={11} />
                </button>
              </div>
            )
          }
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} className={baseClass}>
              {tab === '북마크' && <Heart size={13} />}
              {tab}
              {countBadge}
            </button>
          )
        })}
        <button
          onClick={() => setNewGroupModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <Plus size={13} />
          그룹 추가
        </button>
      </div>

      {/* 인플루언서 카드 그리드 또는 빈 상태 */}
      {filteredInfluencers.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-500 mb-1">저장된 인플루언서가 없습니다.</p>
          <p className="text-xs text-gray-400 mb-4">인플루언서 리스트에서 하트를 눌러 저장해보세요.</p>
          <button
            onClick={() => navigate('/influencers/list')}
            className="inline-flex items-center gap-1.5 bg-[#8CC63F] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#7AB535] transition-colors duration-150"
          >
            인플루언서 찾아보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredInfluencers.map(inf => (
            <div
              key={inf.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative group"
            >
              {/* 북마크 하트 (우측 상단) */}
              <button
                onClick={() => setConfirmRemoveId(inf.id)}
                className="absolute top-4 right-4"
                aria-label="북마크 해제"
              >
                <Heart size={16} className="text-red-500 fill-red-500 hover:opacity-70 transition-opacity" />
              </button>

              {/* 프로필 영역 */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full ${avatarColors[inf.id % avatarColors.length]} flex items-center justify-center text-gray-700 font-bold text-base shrink-0`}>
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
                  <p className="font-semibold text-gray-900">{inf.engagement}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Fit Score</span>
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${fitScoreBadge(inf.fitScore)}`}>
                    {inf.fitScore}
                  </span>
                </div>
              </div>

              {/* 그룹 태그 + 호버 시 "그룹에 추가" */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {inf.groups.map(g => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-[#8CC63F]/10 text-[#8CC63F]"
                  >
                    {g}
                    <button
                      onClick={() => removeFromGroup(inf.id, g)}
                      className="hover:text-red-500 transition-colors"
                      aria-label={`${g} 그룹에서 제거`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <Dropdown
                  align="left"
                  trigger={
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-600 transition-colors duration-150 cursor-pointer">
                      <Plus size={11} />
                      그룹에 추가
                    </span>
                  }
                >
                  <div className="py-1 min-w-[140px]">
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
                </Dropdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 북마크 해제 확인 모달 */}
      <Modal open={confirmRemoveId !== null} onClose={() => setConfirmRemoveId(null)} title="북마크 해제" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">이 인플루언서를 북마크에서 해제하시겠습니까?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmRemoveId(null)}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (confirmRemoveId !== null) { removeBookmark(confirmRemoveId); setConfirmRemoveId(null) }
              }}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition-colors duration-150"
            >
              해제
            </button>
          </div>
        </div>
      </Modal>

      {/* 그룹 삭제 확인 모달 */}
      <Modal open={confirmDeleteGroup !== null} onClose={() => setConfirmDeleteGroup(null)} title="그룹 삭제" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">'{confirmDeleteGroup}'</span> 그룹을 삭제하시겠습니까?<br />
            <span className="text-xs text-gray-400">그룹만 삭제되며 인플루언서 정보는 유지됩니다.</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDeleteGroup(null)}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              취소
            </button>
            <button
              onClick={() => { if (confirmDeleteGroup) deleteGroup(confirmDeleteGroup) }}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition-colors duration-150"
            >
              삭제
            </button>
          </div>
        </div>
      </Modal>

      {/* 새 그룹 만들기 모달 */}
      <Modal open={newGroupModal} onClose={() => { setNewGroupModal(false); setNewGroupName('') }} title="새 그룹 만들기">
        <div className="space-y-4">
          <div>
            <label htmlFor="new-group-name" className="block text-sm font-medium text-gray-700 mb-1.5">그룹명</label>
            <input
              id="new-group-name"
              type="text"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="예: VIP 인플루언서"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150"
              onKeyDown={e => e.key === 'Enter' && createGroup()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setNewGroupModal(false); setNewGroupName('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              취소
            </button>
            <button
              onClick={createGroup}
              disabled={!newGroupName.trim()}
              className="flex-1 bg-[#8CC63F] text-white py-2 rounded-lg text-sm hover:bg-[#7AB535] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              생성
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
