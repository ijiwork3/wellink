import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Upload, X, XCircle, RefreshCw, AlertCircle, Compass } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal, StatusBadge } from '@wellink/ui'
import type { ParticipationStatus } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { fmtDate } from '@wellink/ui'
import { mockMyCampaigns } from '../services/mock/campaigns'
import type { MyCampaign } from '../services/mock/campaigns'

// 탭: 진행중(지원완료+검토중+콘텐츠대기+검수중) / 완료 / 미선정
type TabKey = '전체' | '진행중' | '완료' | '미선정'
const STATUS_TABS: TabKey[] = ['전체', '진행중', '완료', '미선정']

const ACTIVE_STATUSES: Set<string> = new Set(['지원완료', '검토중', '콘텐츠대기', '검수중'])

function statusToTab(s: string): TabKey {
  if (ACTIVE_STATUSES.has(s)) return '진행중'
  if (s === '완료') return '완료'
  if (s === '미선정') return '미선정'
  return '전체'
}

const ACTION_MAP: Partial<Record<string, Array<'수정' | '취소' | '콘텐츠 제출' | '상세보기'>>> = {
  '지원완료':   ['수정', '취소'],
  '검토중':     ['취소'],
  '콘텐츠대기': ['콘텐츠 제출'],
  '검수중':     ['상세보기'],
  '완료':       ['상세보기'],
  '미선정':     ['상세보기'],
}

function getActions(status: string) {
  return ACTION_MAP[status] ?? ['상세보기']
}

// 콘텐츠 제출 마감 임박 여부 (3일 이내)
function isDeadlineUrgent(dateStr?: string): boolean {
  if (!dateStr) return false
  const diff = new Date(dateStr).getTime() - Date.now()
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 3
}

export default function MyCampaign() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()

  const [campaigns, setCampaigns] = useState<MyCampaign[]>(() => qa === 'empty' ? [] : mockMyCampaigns)
  const [activeTab, setActiveTab] = useState<TabKey>('전체')
  const [cancelModal, setCancelModal] = useState<MyCampaign | null>(null)
  const [submitModal, setSubmitModal] = useState<MyCampaign | null>(null)
  const [contentUrl, setContentUrl] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (qa === 'empty') { setCampaigns([]); return }
    if (qa === 'modal-cancel') { setCancelModal(mockMyCampaigns[0]); return }
    if (qa === 'modal-submit') { setSubmitModal(mockMyCampaigns[0]); return }
    const tabMap: Record<string, TabKey> = {
      'tab-신청완료': '진행중', 'tab-진행중': '진행중',
      'tab-게시완료': '완료', 'tab-포인트지급': '완료',
    }
    if (qa && tabMap[qa]) setActiveTab(tabMap[qa])
    setCampaigns(mockMyCampaigns)
  }, [qa])

  const filtered = useMemo(() => {
    let list = campaigns
    if (activeTab !== '전체') list = list.filter(c => statusToTab(c.status) === activeTab)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q))
    return list
  }, [campaigns, activeTab, search])

  const countByTab = (tab: TabKey) => {
    if (tab === '전체') return campaigns.length
    return campaigns.filter(c => statusToTab(c.status) === tab).length
  }

  const handleContentSubmit = () => {
    if (!contentUrl.trim()) { showToast('콘텐츠 URL을 입력해 주세요', 'error'); return }
    setCampaigns(prev => prev.map(c => c.id === submitModal?.id ? { ...c, status: '검수중' as const, progress: '게시 콘텐츠 확인 중' } : c))
    showToast('콘텐츠를 제출했어요!', 'success')
    setSubmitModal(null)
    setContentUrl('')
  }

  const handleCancel = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
    setCancelModal(null)
    showToast('신청이 취소되었어요.', 'info')
  }

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          <div className="h-5 bg-gray-100 rounded-xl w-32" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-7 bg-gray-100 rounded-full w-16" />)}
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded-xl w-36" />
                <div className="h-5 bg-gray-100 rounded-full w-16" />
              </div>
              <div className="h-3 bg-gray-100 rounded-xl w-48" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-100 rounded-xl flex-1" />
                <div className="h-8 bg-gray-100 rounded-xl w-20" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" />
          <p className="text-sm font-semibold text-gray-900">나의 캠페인을 불러오지 못했어요</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green">
            <RefreshCw size={14} />다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">나의 캠페인</h2>
            <p className="text-xs text-gray-400 mt-0.5">총 {campaigns.length}개 참여 중</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Compass size={12} />
            캠페인 찾기
          </button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="캠페인 또는 브랜드 검색"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-brand-green focus:bg-white transition-colors"
          />
        </div>

        {/* 탭 */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(tab => {
            const count = countByTab(tab)
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  activeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 카드 리스트 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center">
              <Search size={24} className="text-brand-green" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                {search ? '검색 결과가 없어요' : '해당 상태의 캠페인이 없어요'}
              </p>
              {!search && <p className="text-xs text-gray-400 mt-0.5">새로운 캠페인에 신청해 보세요</p>}
            </div>
            {!search && (
              <button onClick={() => navigate('/campaigns/browse')} className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-brand-green hover:opacity-90 transition-opacity">
                캠페인 찾아보기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const actions = getActions(c.status)
              const urgent = c.status === '콘텐츠대기' && isDeadlineUrgent(c.contentDeadline)
              return (
                <div key={c.id} className={`bg-white rounded-2xl border p-4 transition-all ${urgent ? 'border-orange-200' : 'border-gray-100'}`}>
                  {/* 마감 임박 알림 */}
                  {urgent && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">
                      <AlertCircle size={12} />
                      콘텐츠 제출 마감이 {fmtDate(c.contentDeadline!)}까지예요!
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge status={c.status as ParticipationStatus} size="sm" />
                        <span className="text-[10px] text-gray-400">{c.channel}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.brand} · 신청 {fmtDate(c.appliedAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">리워드</p>
                      <p className="text-sm font-bold text-gray-900">{c.reward}</p>
                    </div>
                  </div>

                  {/* 진행 상황 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.status === '완료' ? 'bg-gray-400' : c.status === '미선정' ? 'bg-red-300' : 'bg-brand-green'}`} />
                    <span className="text-xs text-gray-500">{c.progress}</span>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    {actions.map(action => {
                      if (action === '콘텐츠 제출') return (
                        <button key={action}
                          onClick={() => setSubmitModal(c)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity">
                          <Upload size={12} />콘텐츠 제출
                        </button>
                      )
                      if (action === '수정') return (
                        <button key={action}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                          신청 정보 보기
                        </button>
                      )
                      if (action === '취소') return (
                        <button key={action}
                          onClick={() => setCancelModal(c)}
                          className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium border border-red-100 text-red-400 hover:bg-red-50 transition-colors">
                          <X size={12} />신청 취소
                        </button>
                      )
                      return (
                        <button key={action}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                          상세보기
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 콘텐츠 제출 모달 */}
      <Modal open={!!submitModal} onClose={() => { setSubmitModal(null); setContentUrl('') }} title="콘텐츠 제출">
        <div className="space-y-4">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{submitModal?.name}</strong>에 게시한 콘텐츠 URL을 입력해 주세요.</p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center">
            <Upload size={22} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">인스타그램, 블로그, 유튜브 등 게시 링크</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">콘텐츠 URL</label>
            <input
              type="text"
              value={contentUrl}
              onChange={e => setContentUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleContentSubmit()}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-colors"
              placeholder="https://instagram.com/p/..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setSubmitModal(null); setContentUrl('') }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">취소</button>
            <button onClick={handleContentSubmit} disabled={!contentUrl.trim()} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">제출하기</button>
          </div>
        </div>
      </Modal>

      {/* 신청 취소 모달 */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="신청 취소">
        <div className="space-y-4">
          <p className="text-sm text-gray-600"><strong className="text-gray-900">{cancelModal?.name}</strong> 신청을 취소하시겠어요?</p>
          <p className="text-xs text-gray-400">취소 후 재신청이 가능하지 않을 수 있어요.</p>
          <div className="flex gap-2">
            <button onClick={() => setCancelModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">유지하기</button>
            <button onClick={() => cancelModal && handleCancel(cancelModal.id)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">취소하기</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
