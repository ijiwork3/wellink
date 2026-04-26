import { useState, useEffect } from 'react'
import { Wallet, AlertCircle, FileText, BanknoteIcon, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal, useToast, useQAMode, ErrorState, fmtNumber, fmtDate } from '@wellink/ui'
import { mockProfile } from '../services/mock/profile'

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
  { id: 3, campaign: '헬스 보충제 캠페인', type: '피드', amount: 95000, status: '지급완료', completedAt: '2026-03-20', paidAt: '2026-03-22' },
  { id: 4, campaign: '여름 캠페인', type: '스토리', amount: 80000, status: '정산대기', completedAt: '2026-05-01' },
]

const STATUS_BADGE: Record<SettlementStatus, string> = {
  '정산가능': 'bg-brand-green/10 text-brand-green-text border border-brand-green/20',
  '지급완료': 'bg-slate-100 text-slate-600 border border-slate-200',
  '정산대기': 'bg-amber-50 text-amber-700 border border-amber-200',
}

const HAS_BUSINESS_REG = mockProfile.hasBusinessReg
const HAS_BANK_ACCOUNT = mockProfile.hasBankAccount

export default function Settlement() {
  const qa = useQAMode()
  const { showToast } = useToast()

  const [items, setItems] = useState<SettlementItem[]>(() => qa === 'empty' ? [] : MOCK_DATA)
  const [requestModal, setRequestModal] = useState(qa === 'modal-request')
  const [requestTarget, setRequestTarget] = useState<SettlementItem | null>(qa === 'modal-request' ? MOCK_DATA[0] : null)

  useEffect(() => {
    if (qa === 'empty') { setItems([]); return }
    if (qa === 'modal-request') { setRequestTarget(MOCK_DATA[0]); setRequestModal(true); return }
    setItems(MOCK_DATA)
  }, [qa])

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="h-4 w-28 bg-gray-200 rounded-full" />
            <div className="h-14 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              {[1,2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
          {[1,2,3].map(i => (
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

  if (qa === 'error') {
    return (
      <Layout>
        <ErrorState message="정산 정보를 불러올 수 없습니다." onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  const availableAmount = items.filter(i => i.status === '정산가능').reduce((s, i) => s + i.amount, 0)
  const thisMonthEarnings = items.filter(i => i.completedAt.startsWith('2026-04')).reduce((s, i) => s + i.amount, 0)
  const totalEarnings = items.reduce((s, i) => s + i.amount, 0)

  const confirmRequest = () => {
    if (!requestTarget) return
    setItems(prev => prev.map(i => i.id === requestTarget.id ? { ...i, status: '지급완료' as const, paidAt: '2026-04-25' } : i))
    setRequestModal(false)
    setRequestTarget(null)
    showToast('정산 요청이 완료됐어요!', 'success')
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* 계좌 미등록 배너 */}
        {!HAS_BANK_ACCOUNT && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">계좌 정보가 없어요</p>
              <p className="text-xs text-amber-600 mt-0.5">정산을 받으려면 계좌를 먼저 등록해야 해요.</p>
            </div>
            <button onClick={() => showToast('계좌 등록 화면으로 이동합니다.', 'info')} className="shrink-0 text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
              계좌 등록
            </button>
          </div>
        )}

        {/* 요약 카드 — 정산 가능 금액 중심 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">정산 가능 금액</p>
          <p className="text-3xl font-bold text-brand-green-text mb-1">
            {fmtNumber(availableAmount)}<span className="text-base font-normal text-gray-500 ml-1">원</span>
          </p>
          {availableAmount > 0 && HAS_BANK_ACCOUNT && (
            <button
              onClick={() => { setRequestTarget(items.find(i => i.status === '정산가능') ?? null); setRequestModal(true) }}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-green px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              <BanknoteIcon size={13} />전체 정산 요청
            </button>
          )}
          {availableAmount > 0 && !HAS_BANK_ACCOUNT && (
            <p className="mt-1 text-xs text-amber-600">계좌 등록 후 정산 요청이 가능해요</p>
          )}

          {/* 보조 지표 */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp size={12} className="text-gray-400" />
                <p className="text-xs text-gray-500">이번 달</p>
              </div>
              <p className="text-base font-bold text-gray-900">{fmtNumber(thisMonthEarnings)}<span className="text-xs font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Wallet size={12} className="text-gray-400" />
                <p className="text-xs text-gray-500">누적 수익</p>
              </div>
              <p className="text-base font-bold text-gray-900">{fmtNumber(totalEarnings)}<span className="text-xs font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
          </div>
        </div>

        {/* 정산 내역 */}
        <h2 className="text-sm font-semibold text-gray-700">정산 내역</h2>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 gap-3">
            <Wallet size={36} className="text-gray-300" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">정산 내역이 없어요</p>
              <p className="text-xs text-gray-400 mt-0.5">캠페인을 완료하면 내역이 쌓여요</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.campaign}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.type} · {fmtDate(item.completedAt)} 완료{item.paidAt ? ` · 지급 ${fmtDate(item.paidAt)}` : ''}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[item.status]}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <p className="text-lg font-bold text-gray-900">{fmtNumber(item.amount)}<span className="text-sm font-normal text-gray-500 ml-0.5">원</span></p>
                  <div className="flex items-center gap-2">
                    {item.status === '지급완료' && HAS_BUSINESS_REG && (
                      <button onClick={() => showToast('세금계산서 발행을 요청했어요', 'success')} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText size={12} />세금계산서
                      </button>
                    )}
                    {item.status === '정산가능' && (
                      <button
                        onClick={() => { setRequestTarget(item); setRequestModal(true) }}
                        disabled={!HAS_BANK_ACCOUNT}
                        className="flex items-center gap-1 text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <BanknoteIcon size={12} />정산 요청
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
      <Modal open={requestModal} onClose={() => { setRequestModal(false); setRequestTarget(null) }} title="정산 요청">
        {requestTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {[
                ['캠페인', requestTarget.campaign],
                ['콘텐츠 유형', requestTarget.type],
                ['정산 금액', `${fmtNumber(requestTarget.amount)}원`],
                ['완료일', fmtDate(requestTarget.completedAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
            {!HAS_BANK_ACCOUNT && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700">계좌 정보가 없어요. 먼저 계좌를 등록해 주세요.</p>
              </div>
            )}
            <p className="text-xs text-gray-400">정산 요청 후 영업일 기준 3~5일 내 등록 계좌로 지급돼요.</p>
            <div className="flex gap-2">
              <button onClick={() => { setRequestModal(false); setRequestTarget(null) }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={confirmRequest} disabled={!HAS_BANK_ACCOUNT} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">요청하기</button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
