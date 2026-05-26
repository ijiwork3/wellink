import { useState, useEffect } from 'react'
import { Wallet, AlertCircle, BanknoteIcon, TrendingUp, CheckCircle2, Download } from 'lucide-react'
import Layout from '../components/Layout'
import { ResponsiveSheet, CustomSelect, INPUT_BASE, useToast, useQAMode, ErrorState, EmptyState, fmtDate, Skeleton, StatusBadge, Tabs, Pagination } from '@wellink/ui'
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

/**
 * 정산 플로우: 수익 자동 누적 (마일리지) → 계좌 등록 후 인출 요청 1회
 * - '미인출': 잔액에 쌓인 상태. 개별 요청 없이 자동 누적.
 * - '지급완료': 인출 요청 후 계좌로 지급된 상태.
 * - 검수중 캠페인은 목록에서 제외 (완료 즉시 자동 누적).
 */
type SettlementStatus = '미인출' | '지급완료'
type SettlementTab = '전체' | '다운로드 수익' | '캠페인 리워드'

const PAGE_SIZE = 5

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
 * 과거에 인출된 캠페인 기록 (mockMyCampaigns에 없는 이력 데이터)
 */
const HISTORIC_PAYMENTS: SettlementItem[] = [
  { id: 'h-1', campaign: '봄 요가 프로모션', type: '릴스', amount: 150000, status: '지급완료', completedAt: '2026-04-18', paidAt: '2026-04-20' },
  { id: 'h-2', campaign: '비건 신제품 론칭', type: '피드', amount: 120000, status: '지급완료', completedAt: '2026-04-10', paidAt: '2026-04-12' },
  { id: 'h-3', campaign: '홈트레이닝 챌린지', type: '릴스', amount: 200000, status: '지급완료', completedAt: '2026-03-25', paidAt: '2026-03-27' },
  { id: 'h-4', campaign: '스킨케어 브랜드 홍보', type: '피드', amount: 90000, status: '지급완료', completedAt: '2026-03-12', paidAt: '2026-03-14' },
  { id: 'h-5', campaign: '프리미엄 커피 체험', type: '스토리', amount: 60000, status: '지급완료', completedAt: '2026-02-28', paidAt: '2026-03-02' },
  { id: 'h-6', campaign: '운동복 신제품 리뷰', type: '릴스', amount: 175000, status: '지급완료', completedAt: '2026-02-14', paidAt: '2026-02-16' },
]

interface DownloadRevenueItem {
  id: string
  campaign: string
  contentType: string
  brand: string
  downloadedAt: string
  amount: number
  status: SettlementStatus
  paidAt?: string
}

/** 광고주 콘텐츠 다운로드로 발생한 수익 내역 (mock) */
const MOCK_DOWNLOAD_REVENUE: DownloadRevenueItem[] = [
  { id: 'dr-1', campaign: '헬스 보충제 캠페인', contentType: '피드', brand: 'SMILEATO', downloadedAt: '2026-05-20', amount: 3000, status: '미인출' },
  { id: 'dr-2', campaign: '아웃도어 장비 리뷰', contentType: '블로그', brand: '아웃도어킹', downloadedAt: '2026-05-18', amount: 3000, status: '미인출' },
  { id: 'dr-3', campaign: '봄 요가 프로모션', contentType: '릴스', brand: '요가랩', downloadedAt: '2026-04-22', amount: 3000, status: '지급완료', paidAt: '2026-04-25' },
  { id: 'dr-4', campaign: '봄 요가 프로모션', contentType: '릴스', brand: '요가랩', downloadedAt: '2026-04-22', amount: 3000, status: '지급완료', paidAt: '2026-04-25' },
  { id: 'dr-5', campaign: '비건 신제품 론칭', contentType: '피드', brand: '그린푸드', downloadedAt: '2026-04-12', amount: 3000, status: '지급완료', paidAt: '2026-04-15' },
  { id: 'dr-6', campaign: '홈트레이닝 챌린지', contentType: '릴스', brand: '아이언짐', downloadedAt: '2026-03-30', amount: 3000, status: '지급완료', paidAt: '2026-04-02' },
  { id: 'dr-7', campaign: '스킨케어 브랜드 홍보', contentType: '피드', brand: '글로우랩', downloadedAt: '2026-03-15', amount: 3000, status: '지급완료', paidAt: '2026-03-18' },
  { id: 'dr-8', campaign: '프리미엄 커피 체험', contentType: '스토리', brand: '카페모어', downloadedAt: '2026-03-05', amount: 3000, status: '지급완료', paidAt: '2026-03-08' },
  { id: 'dr-9', campaign: '운동복 신제품 리뷰', contentType: '릴스', brand: '스포럭스', downloadedAt: '2026-02-20', amount: 3000, status: '지급완료', paidAt: '2026-02-22' },
]

function buildSettlementItems(): SettlementItem[] {
  // 완료된 캠페인만 → 즉시 미인출 상태로 누적 (검수중 제외)
  const fromMyCampaigns: SettlementItem[] = mockMyCampaigns
    .filter(c => c.status === '완료')
    .map(c => ({
      id: `sl-${c.id}`,
      campaign: c.name,
      type: c.channel,
      amount: c.rewardAmount,
      status: '미인출' as const,
      completedAt: c.deadline,
    }))
  return [...fromMyCampaigns, ...HISTORIC_PAYMENTS]
}

const MOCK_DATA = buildSettlementItems()

export default function Settlement() {
  const qa = useQAMode()
  const { showToast } = useToast()

  const [items, setItems] = useState<SettlementItem[]>(() => qa === 'empty' ? [] : MOCK_DATA)
  const [downloadItems, setDownloadItems] = useState<DownloadRevenueItem[]>(() => qa === 'empty' ? [] : MOCK_DOWNLOAD_REVENUE)
  const [withdrawModal, setWithdrawModal] = useState(qa === 'modal-request')

  // 탭 + 페이지
  const [activeTab, setActiveTab] = useState<SettlementTab>('전체')
  const [page, setPage] = useState(1)

  // 계좌 정보
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(() => {
    if (qa === 'no-account') return null
    if (qa === 'has-account' || mockProfile.hasBankAccount) return { bank: 'KB국민은행', accountNumber: '123-456-789012', holder: mockProfile.name }
    return null
  })
  const hasBankAccount = bankAccount !== null
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [bankDraft, setBankDraft] = useState<BankAccount>({ bank: '', accountNumber: '', holder: mockProfile.name })

  const handleBankRegister = () => {
    if (!bankDraft.bank) { showToast('은행을 선택해 주세요', 'error'); return }
    if (!/^\d[\d-]{6,18}\d$/.test(bankDraft.accountNumber)) { showToast('계좌번호 형식을 확인해 주세요', 'error'); return }
    if (!bankDraft.holder.trim()) { showToast('예금주를 입력해 주세요', 'error'); return }
    setBankAccount({ ...bankDraft })
    setBankModalOpen(false)
    setBankDraft({ bank: '', accountNumber: '', holder: mockProfile.name })
    showToast('계좌가 등록됐어요!', 'success')
  }

  // QA 파라미터 외부 동기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (qa === 'empty') { setItems([]); setDownloadItems([]); return }
    if (qa === 'modal-request') { setWithdrawModal(true); return }
    if (qa === 'no-account') { setBankAccount(null); return }
    if (qa === 'has-account') { setBankAccount({ bank: 'KB국민은행', accountNumber: '123-456-789012', holder: mockProfile.name }); return }
    setItems(MOCK_DATA)
    setDownloadItems(MOCK_DOWNLOAD_REVENUE)
  }, [qa])

  // 탭 변경 시 페이지 1로 리셋
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as SettlementTab)
    setPage(1)
  }

  if (qa === 'loading') {
    return (
      <Layout>
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
      <Layout>
        <ErrorState message="정산 정보를 불러오지 못했어요" onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  // 잔액 계산 (미인출 합산)
  const withdrawableAmount =
    items.filter(i => i.status === '미인출').reduce((s, i) => s + i.amount, 0) +
    downloadItems.filter(i => i.status === '미인출').reduce((s, i) => s + i.amount, 0)
  const withdrawableCount =
    items.filter(i => i.status === '미인출').length +
    downloadItems.filter(i => i.status === '미인출').length

  const thisMonthPrefix = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()
  const thisMonthEarnings = [...items, ...downloadItems]
    .filter(i => i.completedAt.startsWith(thisMonthPrefix))
    .reduce((s, i) => s + i.amount, 0)
  const totalEarnings = [...items, ...downloadItems]
    .reduce((s, i) => s + i.amount, 0)

  const confirmWithdraw = () => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setItems(prev => prev.map(i => i.status === '미인출' ? { ...i, status: '지급완료' as const, paidAt: today } : i))
    setDownloadItems(prev => prev.map(i => i.status === '미인출' ? { ...i, status: '지급완료' as const, paidAt: today } : i))
    setWithdrawModal(false)
    showToast(`${withdrawableCount}건 인출 요청이 완료됐어요!`, 'success')
  }

  // 탭별 데이터 + 페이지네이션
  type UnifiedItem = { kind: 'campaign'; data: SettlementItem } | { kind: 'download'; data: DownloadRevenueItem }

  const allUnified: UnifiedItem[] = [
    ...downloadItems.map(d => ({ kind: 'download' as const, data: d })),
    ...items.map(c => ({ kind: 'campaign' as const, data: c })),
  ]

  const tabData: UnifiedItem[] =
    activeTab === '다운로드 수익' ? downloadItems.map(d => ({ kind: 'download', data: d })) :
    activeTab === '캠페인 리워드' ? items.map(c => ({ kind: 'campaign', data: c })) :
    allUnified

  const totalPages = Math.max(1, Math.ceil(tabData.length / PAGE_SIZE))
  const pagedData = tabData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const tabItems = [
    { value: '전체', label: `전체 (${allUnified.length})` },
    { value: '다운로드 수익', label: `다운로드 수익 (${downloadItems.length})` },
    { value: '캠페인 리워드', label: `캠페인 리워드 (${items.length})` },
  ]

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="sr-only">정산</h1>

        {/* 계좌 미등록 배너 */}
        {!hasBankAccount && (
          <div className="bg-brand-green-bg border border-brand-green-border rounded-2xl px-4 py-3 flex flex-col @[400px]:flex-row @[400px]:items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <AlertCircle size={16} className="text-brand-green shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 break-keep">계좌 정보가 없어요</p>
                <p className="text-sm text-brand-green-text mt-0.5 break-keep">인출 요청을 하려면 계좌를 먼저 등록해야 해요</p>
              </div>
            </div>
            <button onClick={() => setBankModalOpen(true)} className="w-full @[400px]:w-auto shrink-0 text-sm font-semibold text-white bg-brand-green px-4 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              계좌 등록
            </button>
          </div>
        )}

        {/* 등록된 계좌 */}
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

        {/* 잔액 요약 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">인출 가능 잔액</p>
          <p className="text-2xl @[400px]:text-3xl font-bold text-brand-green-text tabular-nums leading-tight">
            {withdrawableAmount.toLocaleString('ko-KR')}<span className="text-base font-normal text-gray-500 ml-1">원</span>
          </p>
          {withdrawableAmount > 0 && (
            <button
              onClick={() => { if (!hasBankAccount) { setBankModalOpen(true); return }; setWithdrawModal(true) }}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-green px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <BanknoteIcon size={14} />인출 요청
            </button>
          )}
          {withdrawableAmount === 0 && withdrawableCount === 0 && (
            <p className="mt-1.5 text-sm text-gray-400">인출 가능한 잔액이 없어요</p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp size={14} className="text-gray-400" />
                <p className="text-sm text-gray-500">이번 달 수익</p>
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

        {/* 탭 */}
        <Tabs
          variant="underline"
          value={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          ariaLabel="정산 내역 탭"
        />

        {/* 내역 리스트 */}
        {tabData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12">
            <EmptyState
              icon={<Wallet size={32} className="text-gray-400" aria-hidden="true" />}
              title="수익 내역이 없어요"
              description="캠페인을 완료하거나 다운로드 수익이 생기면 여기에 쌓여요"
            />
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {pagedData.map(row => {
                if (row.kind === 'download') {
                  const item = row.data
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                              <Download size={10} />다운로드
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 break-keep">{item.campaign}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.brand} · {item.contentType} · {fmtDate(item.downloadedAt)} 다운로드{item.paidAt ? ` · 지급 ${fmtDate(item.paidAt)}` : ''}</p>
                        </div>
                        <StatusBadge status={item.status} size="sm" className="shrink-0" />
                      </div>
                      <div className="pt-2.5 border-t border-gray-50">
                        <p className="text-base font-bold text-gray-900 tabular-nums">
                          {item.amount.toLocaleString('ko-KR')}<span className="text-sm font-normal text-gray-500 ml-0.5">원</span>
                        </p>
                      </div>
                    </div>
                  )
                }

                // campaign reward
                const item = row.data
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                            <Wallet size={10} />캠페인
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 break-keep">{item.campaign}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.type} · {fmtDate(item.completedAt)} 완료{item.paidAt ? ` · 지급 ${fmtDate(item.paidAt)}` : ''}</p>
                      </div>
                      <StatusBadge status={item.status} size="sm" className="shrink-0" />
                    </div>
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-lg font-bold text-gray-900 tabular-nums whitespace-nowrap">{item.amount.toLocaleString('ko-KR')}<span className="text-sm font-normal text-gray-500 ml-0.5">원</span></p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* 인출 요청 확인 모달 */}
      <ResponsiveSheet open={withdrawModal} onClose={() => setWithdrawModal(false)} title="인출 요청" size="sm">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500 shrink-0">인출 건수</span>
              <span className="font-medium text-gray-900 tabular-nums">{withdrawableCount}건</span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-500 shrink-0">인출 금액</span>
              <span className="font-medium text-gray-900 tabular-nums text-right">{withdrawableAmount.toLocaleString('ko-KR')}원</span>
            </div>
            {bankAccount && (
              <div className="flex justify-between gap-3 text-sm pt-2 mt-1 border-t border-gray-200">
                <span className="text-gray-500 shrink-0">입금 계좌</span>
                <span className="font-medium text-gray-900 text-right break-keep">{bankAccount.bank} {bankAccount.accountNumber}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">요청 후 영업일 기준 3~5일 내 등록 계좌로 지급돼요</p>
          <div className="flex gap-2">
            <button onClick={() => setWithdrawModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
            <button onClick={confirmWithdraw} className="flex-1 bg-brand-green text-white py-3 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">요청하기</button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* 계좌 등록 */}
      <ResponsiveSheet open={bankModalOpen} onClose={() => setBankModalOpen(false)} title="정산 계좌 등록" size="sm">
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
      </ResponsiveSheet>
    </Layout>
  )
}
