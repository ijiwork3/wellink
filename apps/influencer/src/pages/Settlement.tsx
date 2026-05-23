import { useState, useEffect } from 'react'
import { Wallet, AlertCircle, FileText, BanknoteIcon, TrendingUp, CheckCircle2 } from 'lucide-react'
import Layout from '../components/Layout'
import { BottomSheet, CustomSelect, INPUT_BASE, useToast, useQAMode, ErrorState, EmptyState, fmtDate, Skeleton, StatusBadge } from '@wellink/ui'
import { mockProfile } from '../services/mock/profile'
import { mockMyCampaigns } from '../services/mock/campaigns'

interface BankAccount {
  bank: string
  accountNumber: string
  holder: string
}

const BANK_OPTIONS = [
  { label: 'KB국민은행', value: 'KB국민은행' },
  { label: '신한은행', value: '신한은행' },
  { label: '우리은행', value: '우리은행' },
  { label: '하나은행', value: '하나은행' },
  { label: 'NH농협은행', value: 'NH농협은행' },
  { label: 'IBK기업은행', value: 'IBK기업은행' },
  { label: '카카오뱅크', value: '카카오뱅크' },
  { label: '토스뱅크', value: '토스뱅크' },
]

type SettlementStatus = '정산가능' | '지급완료' | '정산대기'

interface SettlementItem {
  id: string
  campaign: string
  type: string
  amount: number
  status: SettlementStatus
  completedAt: string
  paidAt?: string
}

/**
 * 정산 항목은 두 소스에서 derive:
 *  1) mockMyCampaigns 의 status='완료' → 정산가능 (또는 '검수중' → 정산대기) — A2 단일 마스터
 *  2) HISTORIC_PAYMENTS — 이미 과거에 지급된 캠페인 (mockMyCampaigns에 없는 기록 데이터)
 */
const HISTORIC_PAYMENTS: SettlementItem[] = [
  { id: 'h-1', campaign: '봄 요가 프로모션', type: '릴스', amount: 150000, status: '지급완료', completedAt: '2026-04-18', paidAt: '2026-04-20' },
  { id: 'h-2', campaign: '비건 신제품 론칭', type: '피드', amount: 120000, status: '지급완료', completedAt: '2026-04-10', paidAt: '2026-04-12' },
]

function buildSettlementItems(): SettlementItem[] {
  const fromMyCampaigns: SettlementItem[] = mockMyCampaigns
    .filter(c => c.status === '완료' || c.status === '검수중')
    .map(c => ({
      id: `sl-${c.id}`,
      campaign: c.name,
      type: c.channel,
      amount: c.rewardAmount,
      status: c.status === '완료' ? '정산가능' as const : '정산대기' as const,
      completedAt: c.status === '완료' ? c.deadline : (c.contentDeadline ?? c.deadline),
    }))
  return [...fromMyCampaigns, ...HISTORIC_PAYMENTS]
}

const MOCK_DATA = buildSettlementItems()

const HAS_BUSINESS_REG = mockProfile.hasBusinessReg

export default function Settlement() {
  const qa = useQAMode()
  const { showToast } = useToast()

  const [items, setItems] = useState<SettlementItem[]>(() => qa === 'empty' ? [] : MOCK_DATA)
  const [requestModal, setRequestModal] = useState(qa === 'modal-request')
  // requestTarget: SettlementItem (개별) | 'all' (전체 정산 요청)
  const [requestTarget, setRequestTarget] = useState<SettlementItem | 'all' | null>(qa === 'modal-request' ? MOCK_DATA[0] : null)

  // 계좌 정보 — mockProfile 초기값 기반 + 사용자 등록 액션으로 갱신 (D1)
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(
    mockProfile.hasBankAccount ? { bank: 'KB국민은행', accountNumber: '123-456-789012', holder: mockProfile.name } : null
  )
  const hasBankAccount = bankAccount !== null
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [bankDraft, setBankDraft] = useState<BankAccount>({ bank: '', accountNumber: '', holder: mockProfile.name })

  const handleBankRegister = () => {
    if (!bankDraft.bank) { showToast('은행을 선택해 주세요', 'error'); return }
    // 시작·끝은 숫자 + 중간에 숫자·하이픈 허용 — 하이픈만 8개로는 통과 X (cold-review 7차 M12)
    if (!/^\d[\d-]{6,18}\d$/.test(bankDraft.accountNumber)) { showToast('계좌번호 형식을 확인해 주세요', 'error'); return }
    if (!bankDraft.holder.trim()) { showToast('예금주를 입력해 주세요', 'error'); return }
    setBankAccount({ ...bankDraft })
    setBankModalOpen(false)
    setBankDraft({ bank: '', accountNumber: '', holder: mockProfile.name })
    showToast('계좌가 등록됐어요!', 'success')
  }

  // QA 파라미터 외부 동기화 (정책 §외부동기화)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (qa === 'empty') { setItems([]); return }
    if (qa === 'modal-request') { setRequestTarget(MOCK_DATA[0]); setRequestModal(true); return }
    setItems(MOCK_DATA)
  }, [qa])

  if (qa === 'loading') {
    return (
      <Layout showProfileHeader={false}>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <Skeleton shape="text" height={16} width="7rem" />
            <Skeleton shape="card" height={56} width="100%" />
            <div className="grid grid-cols-2 gap-3">
              {[1,2].map(i => <Skeleton key={i} shape="card" height={48} width="100%" />)}
            </div>
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton shape="text" height={16} width="8rem" />
                <Skeleton shape="circle" height={20} width="4rem" />
              </div>
              <Skeleton shape="text" height={12} width="5rem" />
              <Skeleton shape="text" height={20} width="6rem" />
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout showProfileHeader={false}>
        <ErrorState message="정산 정보를 불러오지 못했어요" onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  const availableAmount = items.filter(i => i.status === '정산가능').reduce((s, i) => s + i.amount, 0)
  // KST 기준 이번 달 prefix (UTC slice는 자정 시간대 오차) — 단순화: toLocaleDateString
  const thisMonthPrefix = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()
  const thisMonthEarnings = items
    .filter(i => i.completedAt.startsWith(thisMonthPrefix) && i.status !== '정산대기')
    .reduce((s, i) => s + i.amount, 0)
  // 누적 수익: 확정 수익만 (정산대기 제외)
  const totalEarnings = items
    .filter(i => i.status !== '정산대기')
    .reduce((s, i) => s + i.amount, 0)

  const confirmRequest = () => {
    if (!requestTarget) return
    // KST 기준 오늘 날짜 (UTC slice는 자정 시간대 오차)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (requestTarget === 'all') {
      // 전체 정산 가능 항목을 일괄 지급완료 처리
      const count = items.filter(i => i.status === '정산가능').length
      setItems(prev => prev.map(i => i.status === '정산가능' ? { ...i, status: '지급완료' as const, paidAt: today } : i))
      showToast(`${count}건 전체 정산 요청이 완료됐어요!`, 'success')
    } else {
      setItems(prev => prev.map(i => i.id === requestTarget.id ? { ...i, status: '지급완료' as const, paidAt: today } : i))
      showToast('정산 요청이 완료됐어요!', 'success')
    }
    setRequestModal(false)
    setRequestTarget(null)
  }

  return (
    <Layout showProfileHeader={false}>
      <div className="space-y-4">
        <h1 className="sr-only">정산</h1>
        {/* 계좌 미등록 배너 */}
        {!hasBankAccount && (
          <div className="bg-brand-green-bg border border-brand-green-border rounded-2xl px-4 py-3 flex flex-col @[400px]:flex-row @[400px]:items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <AlertCircle size={16} className="text-brand-green shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 break-keep">계좌 정보가 없어요</p>
                <p className="text-sm text-brand-green-text mt-0.5 break-keep">정산을 받으려면 계좌를 먼저 등록해야 해요</p>
              </div>
            </div>
            <button onClick={() => setBankModalOpen(true)} className="w-full @[400px]:w-auto shrink-0 text-sm font-semibold text-white bg-brand-green px-4 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              계좌 등록
            </button>
          </div>
        )}

        {/* 등록된 계좌 — 표시 + 변경 (D1) */}
        {hasBankAccount && bankAccount && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-brand-green shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">정산 계좌</p>
              <p className="text-sm font-medium text-gray-900 truncate">{bankAccount.bank} <span className="tabular-nums">{bankAccount.accountNumber}</span> ({bankAccount.holder})</p>
            </div>
            <button
              onClick={() => { setBankDraft(bankAccount); setBankModalOpen(true) }}
              className="shrink-0 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              변경
            </button>
          </div>
        )}

        {/* 요약 카드 — 정산 가능 금액 중심 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">정산 가능 금액</p>
          <p className="text-2xl @[400px]:text-3xl font-bold text-brand-green-text mb-1 tabular-nums leading-tight">
            {availableAmount.toLocaleString('ko-KR')}<span className="text-base font-normal text-gray-500 ml-1">원</span>
          </p>
          {availableAmount > 0 && (
            <button
              onClick={() => { if (!hasBankAccount) { setBankModalOpen(true); return }; setRequestTarget('all'); setRequestModal(true) }}
              className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-green px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <BanknoteIcon size={14} />전체 정산 요청
            </button>
          )}

          {/* 보조 지표 — 360px 한 셀 약 124px. 6-7자리(천만원대)까지 text-sm으로 안전, 큰 폭에서 text-base */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp size={14} className="text-gray-400" />
                <p className="text-sm text-gray-500">이번 달</p>
              </div>
              <p className="text-sm @[480px]:text-base font-bold text-gray-900 tabular-nums break-keep">{thisMonthEarnings.toLocaleString('ko-KR')}<span className="text-sm font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Wallet size={14} className="text-gray-400" />
                <p className="text-sm text-gray-500">누적 수익</p>
              </div>
              <p className="text-sm @[480px]:text-base font-bold text-gray-900 tabular-nums break-keep">{totalEarnings.toLocaleString('ko-KR')}<span className="text-sm font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
          </div>
        </div>

        {/* 정산 내역 */}
        <h2 className="text-base font-semibold text-gray-900">정산 내역</h2>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12">
            <EmptyState
              icon={<Wallet size={32} className="text-gray-400" aria-hidden="true" />}
              title="정산 내역이 없어요"
              description="캠페인을 완료하면 내역이 쌓여요"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 break-keep">{item.campaign}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.type} · {fmtDate(item.completedAt)} 완료{item.paidAt ? ` · 지급 ${fmtDate(item.paidAt)}` : ''}</p>
                  </div>
                  <StatusBadge status={item.status} size="sm" className="shrink-0" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-50">
                  <p className="text-lg font-bold text-gray-900 tabular-nums whitespace-nowrap">{item.amount.toLocaleString('ko-KR')}<span className="text-sm font-normal text-gray-500 ml-0.5">원</span></p>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === '지급완료' && HAS_BUSINESS_REG && (
                      <button onClick={() => showToast('세금계산서 발행을 요청했어요', 'success')} className="flex items-center gap-1 text-sm text-gray-500 border border-gray-200 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                        <FileText size={14} />세금계산서
                      </button>
                    )}
                    {item.status === '정산가능' && (
                      <button
                        onClick={() => { if (!hasBankAccount) { setBankModalOpen(true); return }; setRequestTarget(item); setRequestModal(true) }}
                        className="flex items-center gap-1 text-sm bg-brand-green text-white px-3 py-2.5 rounded-lg hover:bg-brand-green-hover transition-colors font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                      >
                        <BanknoteIcon size={14} />정산 요청
                      </button>
                    )}
                    {item.status === '정산대기' && (
                      <span className="text-sm text-gray-500 whitespace-nowrap">콘텐츠 완료 후 정산 가능</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 정산 요청 바텀시트 */}
      <BottomSheet open={requestModal} onClose={() => { setRequestModal(false); setRequestTarget(null) }} title={requestTarget === 'all' ? '전체 정산 요청' : '정산 요청'}>
        {requestTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {requestTarget === 'all' ? (
                <>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 shrink-0">정산 가능 건수</span>
                    <span className="font-medium text-gray-900 tabular-nums">{items.filter(i => i.status === '정산가능').length}건</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 shrink-0">총 정산 금액</span>
                    <span className="font-medium text-gray-900 tabular-nums text-right break-keep min-w-0">{availableAmount.toLocaleString('ko-KR')}원</span>
                  </div>
                </>
              ) : (
                [
                  ['캠페인', requestTarget.campaign],
                  ['콘텐츠 유형', requestTarget.type],
                  ['정산 금액', `${requestTarget.amount.toLocaleString('ko-KR')}원`],
                  ['완료일', fmtDate(requestTarget.completedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-500 shrink-0">{label}</span>
                    <span className="font-medium text-gray-900 text-right break-keep min-w-0">{value}</span>
                  </div>
                ))
              )}
            </div>
            <p className="text-sm text-gray-500">정산 요청 후 영업일 기준 3~5일 내 등록 계좌로 지급돼요</p>
            <div className="flex gap-2">
              <button onClick={() => { setRequestModal(false); setRequestTarget(null) }} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
              <button onClick={confirmRequest} className="flex-1 bg-brand-green text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">요청하기</button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 계좌 등록 바텀시트 (D1) */}
      <BottomSheet open={bankModalOpen} onClose={() => setBankModalOpen(false)} title="정산 계좌 등록">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 break-keep">정산 금액을 지급받을 본인 명의 계좌를 등록해 주세요.</p>

          <div>
            <label htmlFor="bank-select" className="block text-sm font-medium text-gray-700 mb-1.5">은행 <span className="text-red-400" aria-label="필수">*</span></label>
            <CustomSelect
              value={bankDraft.bank}
              onChange={v => setBankDraft(prev => ({ ...prev, bank: v }))}
              options={BANK_OPTIONS}
              placeholder="은행 선택"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="bank-account" className="block text-sm font-medium text-gray-700 mb-1.5">계좌번호 <span className="text-red-400" aria-label="필수">*</span></label>
            <input
              id="bank-account"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={bankDraft.accountNumber}
              onChange={e => setBankDraft(prev => ({ ...prev, accountNumber: e.target.value.replace(/[^0-9-]/g, '') }))}
              placeholder="숫자만 입력 (예: 123-456-789012)"
              maxLength={20}
              className={`${INPUT_BASE} tabular-nums`}
            />
          </div>

          <div>
            <label htmlFor="bank-holder" className="block text-sm font-medium text-gray-700 mb-1.5">예금주 <span className="text-red-400" aria-label="필수">*</span></label>
            <input
              id="bank-holder"
              type="text"
              autoComplete="name"
              value={bankDraft.holder}
              onChange={e => setBankDraft(prev => ({ ...prev, holder: e.target.value }))}
              maxLength={20}
              placeholder="본인 명의여야 해요"
              className={INPUT_BASE}
            />
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-brand-green-bg border border-brand-green-border">
            <AlertCircle size={14} className="text-brand-green shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-brand-green-text break-keep">본인 명의 계좌만 등록할 수 있어요</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setBankModalOpen(false)}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >취소</button>
            <button
              onClick={handleBankRegister}
              className="flex-1 bg-brand-green text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >등록하기</button>
          </div>
        </div>
      </BottomSheet>
    </Layout>
  )
}
