import { useState, useEffect } from 'react'
import { Wallet, AlertCircle, XCircle, RefreshCw, ChevronRight, FileText, BanknoteIcon } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal, useToast, useQAMode, ErrorState, fmtNumber, fmtDate } from '@wellink/ui'

type SettlementStatus = '정산가능' | '지급완료' | '정산대기'

interface SettlementItem {
  id: number
  campaign: string
  type: string
  amount: number
  status: SettlementStatus
  completedAt: string
  paidAt?: string
}

const MOCK_DATA: SettlementItem[] = [
  { id: 1, campaign: '봄 요가 프로모션', type: '릴스', amount: 150000, status: '정산가능', completedAt: '2026-04-18' },
  { id: 2, campaign: '비건 신제품 론칭', type: '피드', amount: 120000, status: '지급완료', completedAt: '2026-04-10', paidAt: '2026-04-12' },
  { id: 3, campaign: '여름 캠페인', type: '스토리', amount: 80000, status: '정산대기', completedAt: '2026-05-01' },
]

const STATUS_BADGE: Record<SettlementStatus, string> = {
  '정산가능': 'bg-brand-green/10 text-brand-green-text border border-brand-green/20',
  '지급완료': 'bg-slate-100 text-slate-600 border border-slate-200',
  '정산대기': 'bg-amber-50 text-amber-700 border border-amber-200',
}

// 사업자 등록 여부 (더미: 등록됨)
const HAS_BUSINESS_REG = true
// 계좌 등록 여부 (더미: 미등록)
const HAS_BANK_ACCOUNT = false

export default function Settlement() {
  const qa = useQAMode()
  const { showToast } = useToast()

  const [items, setItems] = useState<SettlementItem[]>(() =>
    qa === 'empty' ? [] : MOCK_DATA
  )
  const [requestModal, setRequestModal] = useState(qa === 'modal-request')
  const [requestTarget, setRequestTarget] = useState<SettlementItem | null>(
    qa === 'modal-request' ? MOCK_DATA[0] : null
  )

  useEffect(() => {
    if (qa === 'empty') { setItems([]); return }
    if (qa === 'modal-request') { setRequestTarget(MOCK_DATA[0]); setRequestModal(true); return }
    setItems(MOCK_DATA)
  }, [qa])

  // QA: 로딩
  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse px-4 py-5">
          {/* 요약 카드 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="h-4 w-28 bg-gray-200 rounded-full" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 bg-gray-100 rounded-full" />
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          {/* 카드 목록 스켈레톤 */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded-full" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
              <div className="h-3 w-20 bg-gray-100 rounded-full" />
              <div className="h-5 w-24 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  // QA: 에러
  if (qa === 'error') {
    return (
      <Layout>
        <ErrorState message="정산 정보를 불러올 수 없습니다." onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  // 집계
  const thisMonthEarnings = items
    .filter(i => i.completedAt.startsWith('2026-04'))
    .reduce((s, i) => s + i.amount, 0)
  const totalEarnings = items.reduce((s, i) => s + i.amount, 0)
  const availableAmount = items
    .filter(i => i.status === '정산가능')
    .reduce((s, i) => s + i.amount, 0)

  const handleRequest = (item: SettlementItem) => {
    setRequestTarget(item)
    setRequestModal(true)
  }

  const confirmRequest = () => {
    if (!requestTarget) return
    setItems(prev => prev.map(i =>
      i.id === requestTarget.id ? { ...i, status: '지급완료' as SettlementStatus, paidAt: '2026-04-19' } : i
    ))
    setRequestModal(false)
    setRequestTarget(null)
    showToast('정산 요청이 완료되었습니다.', 'success')
  }

  return (
    <Layout>
      <div className="space-y-4 px-4 py-5">
        {/* 헤더 */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">정산</h1>
          <p className="text-xs text-gray-500 mt-0.5">캠페인 수익을 확인하고 정산을 요청하세요.</p>
        </div>

        {/* 계좌 미등록 안내 배너 */}
        {!HAS_BANK_ACCOUNT && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <AlertCircle size={16} className="text-amber-600 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">계좌 정보가 등록되지 않았습니다</p>
              <p className="text-xs text-amber-600 mt-0.5">정산을 받으려면 계좌를 먼저 등록해야 합니다.</p>
            </div>
            <button
              onClick={() => showToast('계좌 등록 화면으로 이동합니다.', 'info')}
              className="text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shrink-0"
            >
              계좌 등록
            </button>
          </div>
        )}

        {/* 요약 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">수익 요약</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">이번 달 수익</p>
              <p className="text-base font-bold text-gray-900">{fmtNumber(thisMonthEarnings)}<span className="text-xs font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">총 누적 수익</p>
              <p className="text-base font-bold text-gray-900">{fmtNumber(totalEarnings)}<span className="text-xs font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">정산 가능</p>
              <p className="text-base font-bold text-brand-green-text">{fmtNumber(availableAmount)}<span className="text-xs font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
          </div>
        </div>

        {/* 정산 내역 */}
        <h2 className="text-sm font-semibold text-gray-700">정산 내역</h2>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-4">
            <Wallet size={36} className="text-gray-300" aria-hidden="true" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">정산 내역이 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">캠페인을 완료하면 정산 내역이 표시됩니다.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.campaign}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.type} · {fmtDate(item.completedAt)} 완료</p>
                    {item.paidAt && (
                      <p className="text-xs text-gray-400 mt-0.5">지급일: {fmtDate(item.paidAt)}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[item.status]}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <p className="text-lg font-bold text-gray-900">{fmtNumber(item.amount)}<span className="text-sm font-normal text-gray-500 ml-0.5">원</span></p>
                  <div className="flex items-center gap-2">
                    {/* 지급완료 시 세금계산서 버튼 */}
                    {item.status === '지급완료' && HAS_BUSINESS_REG && (
                      <button
                        onClick={() => showToast('세금계산서 발행을 요청했습니다.', 'success')}
                        className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText size={12} aria-hidden="true" />
                        세금계산서
                      </button>
                    )}
                    {/* 정산가능 시 정산요청 버튼 */}
                    {item.status === '정산가능' && (
                      <button
                        onClick={() => handleRequest(item)}
                        disabled={!HAS_BANK_ACCOUNT}
                        className="flex items-center gap-1 text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:bg-brand-green-hover transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <BanknoteIcon size={12} aria-hidden="true" />
                        정산 요청
                      </button>
                    )}
                    {item.status === '정산대기' && (
                      <span className="text-xs text-gray-400">콘텐츠 완료 후 정산 가능</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 정산 요청 모달 */}
      <Modal
        open={requestModal}
        onClose={() => { setRequestModal(false); setRequestTarget(null) }}
        title="정산 요청"
      >
        {requestTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">캠페인</span>
                <span className="font-semibold text-gray-900">{requestTarget.campaign}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">콘텐츠 유형</span>
                <span className="font-medium text-gray-700">{requestTarget.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">정산 금액</span>
                <span className="font-bold text-gray-900">{fmtNumber(requestTarget.amount)}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">완료일</span>
                <span className="text-gray-700">{fmtDate(requestTarget.completedAt)}</span>
              </div>
            </div>
            {!HAS_BANK_ACCOUNT && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700">계좌 정보가 없습니다. 먼저 계좌를 등록해 주세요.</p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              정산 요청 후 영업일 기준 3~5일 내 등록 계좌로 지급됩니다.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setRequestModal(false); setRequestTarget(null) }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmRequest}
                disabled={!HAS_BANK_ACCOUNT}
                className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                요청하기
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
