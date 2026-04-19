import { useState, useEffect } from 'react'
import { Receipt, XCircle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { Modal, useToast, useQAMode, ErrorState, fmtNumber } from '@wellink/ui'
import { fmtDate } from '../utils/fmtDate'

type SettlementStatus = '정산예정' | '승인대기' | '지급완료' | '세금계산서완료'

interface SettlementItem {
  id: number
  influencer: string
  campaign: string
  type: string
  amount: number
  fee: number
  status: SettlementStatus
  settledAt: string
  paidAt?: string
}

const MOCK_DATA: SettlementItem[] = [
  { id: 1, influencer: '이창민', campaign: '봄 요가 프로모션', type: '릴스', amount: 150000, fee: 7500, status: '승인대기', settledAt: '2026-04-20' },
  { id: 2, influencer: '김가애', campaign: '봄 요가 프로모션', type: '피드', amount: 120000, fee: 6000, status: '지급완료', settledAt: '2026-04-18', paidAt: '2026-04-19' },
  { id: 3, influencer: '박리나', campaign: '봄 요가 프로모션', type: '스토리', amount: 80000, fee: 4000, status: '세금계산서완료', settledAt: '2026-04-15' },
  { id: 4, influencer: '민경완', campaign: '비건 신제품 론칭', type: '피드', amount: 200000, fee: 10000, status: '정산예정', settledAt: '2026-05-01' },
  { id: 5, influencer: '장영훈', campaign: '비건 신제품 론칭', type: '릴스', amount: 180000, fee: 9000, status: '승인대기', settledAt: '2026-04-25' },
]

const STATUS_BADGE: Record<SettlementStatus, string> = {
  '정산예정':     'bg-amber-50 text-amber-700 border border-amber-200',
  '승인대기':     'bg-sky-50 text-sky-700 border border-sky-200',
  '지급완료':     'bg-slate-100 text-slate-600 border border-slate-200',
  '세금계산서완료': 'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function Settlement() {
  const qa = useQAMode()
  const { showToast } = useToast()

  const [items, setItems] = useState<SettlementItem[]>(() =>
    qa === 'empty' ? [] : MOCK_DATA
  )
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [approveTarget, setApproveTarget] = useState<SettlementItem | null>(null)
  const [approveModal, setApproveModal] = useState(qa === 'modal-approve')
  const [bulkApproveModal, setBulkApproveModal] = useState(false)

  // QA 파라미터 변경 동기화
  useEffect(() => {
    if (qa === 'empty') { setItems([]); return }
    if (qa === 'modal-approve') { setApproveTarget(MOCK_DATA[0]); setApproveModal(true); return }
    setItems(MOCK_DATA)
  }, [qa])

  // QA: 로딩
  if (qa === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-28 bg-gray-200 rounded-full" />
            <div className="h-3 w-52 bg-gray-100 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 @lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-2">
              <div className="h-3 w-24 bg-gray-100 rounded-full" />
              <div className="h-7 w-20 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-4 w-20 bg-gray-200 rounded-full" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
              <div className="h-4 w-4 bg-gray-100 rounded" />
              <div className="flex-1 h-4 bg-gray-100 rounded-full" />
              <div className="h-4 w-16 bg-gray-100 rounded-full" />
              <div className="h-4 w-16 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // QA: 에러
  if (qa === 'error') {
    return <ErrorState message="정산 데이터를 불러올 수 없습니다." onRetry={() => window.location.reload()} />
  }

  // KPI 집계
  const pendingAmount = items.filter(i => i.status === '정산예정').reduce((s, i) => s + i.amount, 0)
  const awaitingCount = items.filter(i => i.status === '승인대기').length
  const paidAmount    = items.filter(i => i.status === '지급완료' || i.status === '세금계산서완료').reduce((s, i) => s + i.amount, 0)
  const unpaidCount   = items.filter(i => i.status === '정산예정' || i.status === '승인대기').length

  const kpiCards = [
    { label: '이번 달 정산 예정액', value: `${fmtNumber(pendingAmount)}원`, icon: <Receipt size={18} className="text-amber-500" /> },
    { label: '승인 대기 건수',     value: `${awaitingCount}건`,             icon: <AlertCircle size={18} className="text-sky-500" /> },
    { label: '지급 완료액',        value: `${fmtNumber(paidAmount)}원`,     icon: <CheckCircle2 size={18} className="text-slate-500" /> },
    { label: '미처리 건수',        value: `${unpaidCount}건`,               icon: <XCircle size={18} className="text-gray-400" /> },
  ]

  // 전체 선택
  const approvableItems = items.filter(i => i.status === '승인대기')
  const allSelected = approvableItems.length > 0 && approvableItems.every(i => selected.has(i.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        approvableItems.forEach(i => next.delete(i.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        approvableItems.forEach(i => next.add(i.id))
        return next
      })
    }
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleApprove = (item: SettlementItem) => {
    setApproveTarget(item)
    setApproveModal(true)
  }

  const confirmApprove = () => {
    if (!approveTarget) return
    setItems(prev => prev.map(i =>
      i.id === approveTarget.id ? { ...i, status: '지급완료' as SettlementStatus, paidAt: '2026-04-19' } : i
    ))
    setApproveModal(false)
    setApproveTarget(null)
    showToast(`${approveTarget.influencer} 정산이 승인되었습니다.`, 'success')
  }

  const selectedApprovable = [...selected].filter(id =>
    items.find(i => i.id === id)?.status === '승인대기'
  )

  const confirmBulkApprove = () => {
    setItems(prev => prev.map(i =>
      selectedApprovable.includes(i.id) ? { ...i, status: '지급완료' as SettlementStatus, paidAt: '2026-04-19' } : i
    ))
    setSelected(new Set())
    setBulkApproveModal(false)
    showToast(`${selectedApprovable.length}건 일괄 승인되었습니다.`, 'success')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">정산 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">인플루언서 정산 현황을 확인하고 승인하세요.</p>
        </div>
        {selectedApprovable.length > 0 && (
          <button
            onClick={() => setBulkApproveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            일괄 승인 ({selectedApprovable.length}건)
          </button>
        )}
      </div>

      {/* 수수료 안내 배너 */}
      <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl px-5 py-3.5 flex items-center gap-3">
        <AlertCircle size={16} className="text-brand-green-text shrink-0" aria-hidden="true" />
        <p className="text-sm text-brand-green-text">
          브랜드가 인플루언서에게 직접 지급하며, 웰링크 플랫폼 수수료 <strong>5%</strong>가 별도 청구됩니다.
          세금계산서는 지급 완료 후 발행 가능합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">{card.label}</span>
              {card.icon}
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 정산 목록 */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 gap-4">
          <Receipt size={40} className="text-gray-300" aria-hidden="true" />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">정산 내역이 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">캠페인 콘텐츠가 완료되면 정산 내역이 표시됩니다.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
            {/* 전체선택 체크박스 */}
            <button
              onClick={toggleSelectAll}
              role="checkbox"
              aria-checked={allSelected}
              aria-label="승인 대기 전체 선택"
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                allSelected ? 'bg-brand-green border-brand-green' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {allSelected && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className="text-xs font-semibold text-gray-500 flex-[2]">인플루언서 / 캠페인</span>
            <span className="text-xs font-semibold text-gray-500 w-16 text-center hidden @md:block">유형</span>
            <span className="text-xs font-semibold text-gray-500 w-24 text-right">정산 금액</span>
            <span className="text-xs font-semibold text-gray-500 w-20 text-right hidden @md:block">수수료(5%)</span>
            <span className="text-xs font-semibold text-gray-500 w-28 text-center">상태</span>
            <span className="text-xs font-semibold text-gray-500 w-16 text-right">액션</span>
          </div>

          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {/* 체크박스 (승인대기만 선택 가능) */}
              <button
                onClick={() => item.status === '승인대기' && toggleSelect(item.id)}
                role="checkbox"
                aria-checked={selected.has(item.id)}
                aria-label={`${item.influencer} 선택`}
                disabled={item.status !== '승인대기'}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.status !== '승인대기' ? 'border-gray-100 cursor-not-allowed' :
                  selected.has(item.id) ? 'bg-brand-green border-brand-green' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selected.has(item.id) && (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* 인플루언서 / 캠페인 */}
              <div className="flex-[2] min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.influencer}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{item.campaign}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtDate(item.settledAt)} 예정</p>
              </div>

              {/* 유형 */}
              <span className="text-xs text-gray-600 w-16 text-center hidden @md:block">{item.type}</span>

              {/* 정산 금액 */}
              <span className="text-sm font-semibold text-gray-900 w-24 text-right">{fmtNumber(item.amount)}원</span>

              {/* 수수료 */}
              <span className="text-xs text-gray-500 w-20 text-right hidden @md:block">{fmtNumber(item.fee)}원</span>

              {/* 상태 배지 */}
              <div className="w-28 flex justify-center">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[item.status]}`}>
                  {item.status}
                </span>
              </div>

              {/* 액션 */}
              <div className="w-16 flex justify-end">
                {item.status === '승인대기' ? (
                  <button
                    onClick={() => handleApprove(item)}
                    className="text-xs px-3 py-1.5 bg-brand-green text-white rounded-lg hover:bg-brand-green-hover transition-colors font-medium"
                  >
                    승인
                  </button>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 승인 확인 모달 */}
      <Modal
        open={approveModal}
        onClose={() => { setApproveModal(false); setApproveTarget(null) }}
        title="정산 승인 확인"
      >
        {approveTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">인플루언서</span>
                <span className="font-semibold text-gray-900">{approveTarget.influencer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">캠페인</span>
                <span className="font-medium text-gray-700">{approveTarget.campaign}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">정산 금액</span>
                <span className="font-bold text-gray-900">{fmtNumber(approveTarget.amount)}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">웰링크 수수료 (5%)</span>
                <span className="font-medium text-gray-700">{fmtNumber(approveTarget.fee)}원</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              승인 후 인플루언서에게 직접 지급을 진행해 주세요. 수수료는 별도로 청구됩니다.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setApproveModal(false); setApproveTarget(null) }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmApprove}
                className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
              >
                승인하기
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 일괄 승인 모달 */}
      <Modal
        open={bulkApproveModal}
        onClose={() => setBulkApproveModal(false)}
        title="일괄 승인 확인"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            선택한 <strong>{selectedApprovable.length}건</strong>의 정산을 일괄 승인하시겠습니까?
          </p>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">승인 대상</p>
            {items
              .filter(i => selectedApprovable.includes(i.id))
              .map(i => (
                <div key={i.id} className="flex justify-between text-sm py-1">
                  <span className="text-gray-700">{i.influencer}</span>
                  <span className="font-semibold text-gray-900">{fmtNumber(i.amount)}원</span>
                </div>
              ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setBulkApproveModal(false)}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={confirmBulkApprove}
              className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
            >
              일괄 승인
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
