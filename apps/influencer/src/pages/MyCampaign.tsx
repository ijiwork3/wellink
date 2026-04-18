import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Upload, X, XCircle, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { useToast } from '@wellink/ui'

type CampaignStatus = '신청완료' | '진행중' | '게시완료' | '포인트지급'

interface Campaign {
  id: string
  name: string
  channel: string
  appliedAt: string
  deadline: string
  status: CampaignStatus
  progress: string
  reward: string
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: '프로틴 파워 챌린지', channel: '인스타그램', appliedAt: '2026-03-15', deadline: '2026-04-20', status: '진행중', progress: '콘텐츠 제작 중', reward: '80,000원' },
  { id: '2', name: '필라테스 스튜디오 체험', channel: '인스타그램', appliedAt: '2026-03-10', deadline: '2026-04-25', status: '신청완료', progress: '검토 중', reward: '50,000원' },
  { id: '3', name: '아웃도어 장비 리뷰', channel: '네이버 블로그', appliedAt: '2026-02-28', deadline: '2026-04-10', status: '게시완료', progress: '게시 확인 중', reward: '120,000원' },
  { id: '4', name: '헬스 보충제 캠페인', channel: '인스타그램', appliedAt: '2026-02-10', deadline: '2026-03-20', status: '포인트지급', progress: '완료', reward: '95,000원' },
]

const STATUS_TABS = ['전체', '신청완료', '진행중', '게시완료', '포인트지급'] as const

const statusBadgeClass: Record<CampaignStatus, string> = {
  '신청완료': 'bg-gray-100 text-gray-600',
  '진행중': 'bg-amber-50 text-amber-700',
  '게시완료': 'bg-[#8CC63F]/10 text-[#5a8228]',
  '포인트지급': 'bg-[#8CC63F]/10 text-[#5a8228]',
}

/** 상태별 가능한 액션 */
function getActions(status: CampaignStatus): Array<'수정' | '취소' | '콘텐츠 제출' | '상세보기'> {
  switch (status) {
    case '신청완료': return ['수정', '취소']
    case '진행중': return ['콘텐츠 제출']
    case '게시완료': return ['상세보기']
    case '포인트지급': return ['상세보기']
  }
}

export default function MyCampaign() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()

  const initStatus = () => {
    if (qa.startsWith('tab-') && qa.endsWith('-empty')) {
      return qa.replace('tab-', '').replace('-empty', '')
    }
    if (qa.startsWith('tab-')) return qa.replace('tab-', '')
    return '전체'
  }

  const initCampaigns = () => {
    if (qa === 'empty' || qa.endsWith('-empty')) return []
    return MOCK_CAMPAIGNS
  }

  const [activeStatus, setActiveStatus] = useState<string>(initStatus)
  const [cancelModal, setCancelModal] = useState<Campaign | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>(initCampaigns)
  const [contentUrl, setContentUrl] = useState('')
  const firstActive = MOCK_CAMPAIGNS.find(c => c.status === '진행중') ?? null
  const [submitModal, setSubmitModal] = useState<Campaign | null>(
    qa === 'modal-submit' ? firstActive : null
  )

  const handleContentSubmit = () => {
    if (!contentUrl.trim()) { showToast('콘텐츠 URL을 입력해 주세요', 'error'); return }
    try { const u = new URL(contentUrl); if (!/^https?:/.test(u.protocol)) throw new Error() } catch { showToast('유효한 URL을 입력해 주세요 (http/https)', 'error'); return }
    if (submitModal) {
      setCampaigns(prev => prev.map(c =>
        c.id === submitModal.id ? { ...c, status: '게시완료', progress: '게시 확인 중' } : c
      ))
      setActiveStatus('게시완료')
    }
    setSubmitModal(null)
    setContentUrl('')
    showToast('콘텐츠가 제출되었습니다!', 'success')
  }

  // qa 변경 동기화
  useEffect(() => {
    if (qa.startsWith('tab-') && qa.endsWith('-empty')) {
      setActiveStatus(qa.replace('tab-', '').replace('-empty', ''))
      setCampaigns([])
    } else if (qa.startsWith('tab-')) {
      setActiveStatus(qa.replace('tab-', ''))
    }
    if (qa === 'empty' || qa.endsWith('-empty')) setCampaigns([])
    if (qa === 'modal-cancel') setCancelModal(MOCK_CAMPAIGNS[0] ?? null)
    if (qa === 'modal-submit') setSubmitModal(firstActive)
  }, [qa])

  // qa=loading → 스켈레톤
  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          {/* 헤더 스켈레톤 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-100 rounded-xl w-28 mb-1.5" />
              <div className="h-3 bg-gray-100 rounded-xl w-16" />
            </div>
            <div className="h-7 bg-gray-100 rounded-xl w-24" />
          </div>
          {/* 탭 바 스켈레톤 */}
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-7 bg-gray-100 rounded-full w-16" />
            ))}
          </div>
          {/* 카드 스켈레톤 3개 */}
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-100 rounded-full w-14" />
                    <div className="h-4 bg-gray-100 rounded-full w-16" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded-xl w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
                </div>
                <div className="text-right space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded-xl w-10 ml-auto" />
                  <div className="h-4 bg-gray-100 rounded-xl w-16" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-xl w-2/5" />
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
                <div className="w-20 h-8 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  // qa=error
  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">캠페인 정보를 불러오지 못했어요</p>
            <p className="text-xs text-gray-500 mt-1">잠시 후 다시 시도해 주세요</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-sm font-medium text-white px-5 py-2.5 rounded-xl transition-colors hover:opacity-90"
            style={{ backgroundColor: '#8CC63F' }}
          >
            <RefreshCw size={14} />다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  const filtered = activeStatus === '전체'
    ? campaigns
    : campaigns.filter((c) => c.status === activeStatus)

  const countByStatus = (status: string) =>
    status === '전체' ? campaigns.length : campaigns.filter((c) => c.status === status).length

  const handleCancel = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
    setCancelModal(null)
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">나의 캠페인</h2>
            <p className="text-xs text-gray-400 mt-0.5">{activeStatus === '전체' ? `전체 ${campaigns.length}개` : `${activeStatus} ${filtered.length}개`}</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors self-start @sm:self-auto"
          >
            캠페인 찾기 <ChevronRight size={12} />
          </button>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((status) => {
            const count = countByStatus(status)
            return (
              <button
                key={status}
                onClick={() => { setActiveStatus(status); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  activeStatus === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeStatus === status ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 카드 리스트 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: '#f0fce8' }}>
              <Search size={24} style={{ color: '#8CC63F' }} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">해당 상태의 캠페인이 없어요</p>
            <button
              onClick={() => navigate('/campaigns/browse')}
              className="mt-3 px-5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90"
              style={{ backgroundColor: '#8CC63F' }}
            >
              캠페인 찾아보기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const actions = getActions(c.status)
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadgeClass[c.status]}`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">{c.channel}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">신청일 {c.appliedAt} · 마감 {c.deadline}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">리워드</p>
                      <p className="text-sm font-bold text-gray-900">{c.reward}</p>
                    </div>
                  </div>

                  {/* 진행 상황 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8CC63F]" />
                    <span className="text-xs text-gray-500">{c.progress}</span>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    {actions.map(action => {
                      if (action === '수정') return (
                        <button key={action}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                          수정하기
                        </button>
                      )
                      if (action === '취소') return (
                        <button key={action}
                          onClick={() => setCancelModal(c)}
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-red-100 text-red-400 hover:bg-red-50 transition-colors">
                          <X size={12} />
                          신청 취소
                        </button>
                      )
                      if (action === '콘텐츠 제출') return (
                        <button key={action}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-[#5a8228] border border-[#8CC63F]/30 bg-[#8CC63F]/5 hover:bg-[#8CC63F]/10 transition-colors">
                          <Upload size={12} />
                          콘텐츠 제출
                        </button>
                      )
                      return (
                        <button key={action}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
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

      {/* 콘텐츠 제출 모달 (qa=modal-submit) */}
      <Modal open={!!submitModal} onClose={() => { setSubmitModal(null); setContentUrl('') }} title="콘텐츠 제출">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">{submitModal?.name}</strong>에 대한 콘텐츠를 제출합니다.
          </p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Upload size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">콘텐츠 URL을 붙여넣거나 파일을 업로드하세요</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">콘텐츠 URL</label>
            <input
              type="text"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleContentSubmit() }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8CC63F] focus:ring-2 focus:ring-[#8CC63F]/20 transition-colors"
              placeholder="https://instagram.com/p/..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setSubmitModal(null); setContentUrl('') }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">취소</button>
            <button
              onClick={handleContentSubmit}
              disabled={!contentUrl.trim()}
              className="flex-1 bg-[#8CC63F] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              제출하기
            </button>
          </div>
        </div>
      </Modal>

      {/* 취소 확인 모달 */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="신청 취소">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">{cancelModal?.name}</strong> 캠페인 신청을 취소하시겠습니까?
          </p>
          <p className="text-xs text-gray-400">취소 후에는 다시 신청하셔야 합니다.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCancelModal(null)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              유지하기
            </button>
            <button
              onClick={() => cancelModal && handleCancel(cancelModal.id)}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
            >
              취소하기
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
