import { useState, useEffect, useRef } from 'react'
import { Wallet, AlertCircle, BanknoteIcon, TrendingUp, CheckCircle2, Search, CheckCircle, Upload, X } from 'lucide-react'
import Layout from '../components/Layout'
import { ResponsiveSheet, CustomSelect, INPUT_BASE, useToast, useQAMode, ErrorState, EmptyState, fmtDate, Skeleton, Tabs, Pagination, CustomCheckbox } from '@wellink/ui'
import { mockProfile } from '../services/mock/profile'
import { mockMyCampaigns } from '../services/mock/campaigns'

type PayerType = '개인' | '개인사업자'

interface BankAccount {
  bank: string
  accountNumber: string
  holder: string
  payerType?: PayerType
  name?: string
  phone?: string
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
    if (qa === 'has-account' || mockProfile.hasBankAccount) return { bank: 'KB국민은행', accountNumber: '123-456-789012', holder: mockProfile.name, payerType: '개인', name: mockProfile.name, phone: '010-1234-5678' }
    return null
  })
  const hasBankAccount = bankAccount !== null
  const [bankModalOpen, setBankModalOpen] = useState(false)

  // 폼 draft — 개인 / 개인사업자 공통
  const [payerType, setPayerType] = useState<PayerType>('개인')
  // 개인 필드
  const [draftName, setDraftName] = useState('')
  const [draftResidentNo, setDraftResidentNo] = useState('') // 주민등록번호 raw
  const [draftPhone, setDraftPhone] = useState('')
  const [draftBank, setDraftBank] = useState('')
  const [draftAccount, setDraftAccount] = useState('')
  const [draftPrivacyAgree, setDraftPrivacyAgree] = useState(false)
  // 개인사업자 추가 필드
  const [draftBizRegFile, setDraftBizRegFile] = useState<File | null>(null)
  const [draftBizNo, setDraftBizNo] = useState('') // 사업자등록번호
  const [draftBizName, setDraftBizName] = useState('') // 상호
  const [draftCeoName, setDraftCeoName] = useState('') // 대표자명
  const [draftBizPhone, setDraftBizPhone] = useState('')
  const [draftBizEmail, setDraftBizEmail] = useState('')
  const [draftBizResidentNo, setDraftBizResidentNo] = useState('') // 개인사업자용 주민등록번호 (optional)

  const [holderVerified, setHolderVerified] = useState<string | null>(null)
  const [holderChecking, setHolderChecking] = useState(false)
  const holderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetBankModal = () => {
    setPayerType('개인')
    setDraftName(''); setDraftResidentNo(''); setDraftPhone('')
    setDraftBank(''); setDraftAccount(''); setDraftPrivacyAgree(false)
    setDraftBizRegFile(null); setDraftBizNo(''); setDraftBizName('')
    setDraftCeoName(''); setDraftBizPhone(''); setDraftBizEmail(''); setDraftBizResidentNo('')
    setHolderVerified(null)
    setHolderChecking(false)
    if (holderTimerRef.current) clearTimeout(holderTimerRef.current)
  }

  // 계좌번호 변경 시 예금주 조회 초기화
  const handleAccountNumberChange = (v: string) => {
    setDraftAccount(v.replace(/[^0-9-]/g, ''))
    setHolderVerified(null)
  }

  // 주민등록번호 포맷: 000000-0000000
  const formatResidentNo = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 13)
    if (digits.length > 6) return digits.slice(0, 6) + '-' + digits.slice(6)
    return digits
  }

  // 전화번호 포맷: 010-0000-0000
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 11)
    if (digits.length > 7) return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7)
    if (digits.length > 3) return digits.slice(0, 3) + '-' + digits.slice(3)
    return digits
  }

  // 사업자등록번호 포맷: 000-00-00000
  const formatBizNo = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 10)
    if (digits.length > 5) return digits.slice(0, 3) + '-' + digits.slice(3, 5) + '-' + digits.slice(5)
    if (digits.length > 3) return digits.slice(0, 3) + '-' + digits.slice(3)
    return digits
  }

  // 예금주 조회 — mock: 1.2초 후 mockProfile.name 반환
  const handleHolderLookup = () => {
    const bank = payerType === '개인' ? draftBank : draftBank
    const account = draftAccount
    if (!bank) { showToast('은행을 먼저 선택해 주세요', 'error'); return }
    if (!/^\d[\d-]{6,18}\d$/.test(account)) { showToast('계좌번호 형식을 확인해 주세요', 'error'); return }
    setHolderChecking(true)
    setHolderVerified(null)
    holderTimerRef.current = setTimeout(() => {
      setHolderChecking(false)
      setHolderVerified(mockProfile.name)
    }, 1200)
  }

  const handleBankRegister = () => {
    if (!draftBank) { showToast('은행을 선택해 주세요', 'error'); return }
    if (!holderVerified) { showToast('예금주 조회를 먼저 해주세요', 'error'); return }
    if (payerType === '개인') {
      if (!draftName) { showToast('이름을 입력해 주세요', 'error'); return }
      if (!draftPhone) { showToast('전화번호를 입력해 주세요', 'error'); return }
      if (!draftPrivacyAgree) { showToast('개인정보 수집·이용에 동의해 주세요', 'error'); return }
    } else {
      if (!draftBizName) { showToast('상호를 입력해 주세요', 'error'); return }
      if (!draftCeoName) { showToast('대표자명을 입력해 주세요', 'error'); return }
    }
    setBankAccount({
      bank: draftBank,
      accountNumber: draftAccount,
      holder: holderVerified,
      payerType,
      name: payerType === '개인' ? draftName : draftCeoName,
      phone: payerType === '개인' ? draftPhone : draftBizPhone,
    })
    setBankModalOpen(false)
    resetBankModal()
    showToast('정산 정보가 등록됐어요!', 'success')
  }

  // QA 파라미터 외부 동기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (qa === 'empty') { setItems([]); setDownloadItems([]); return }
    if (qa === 'modal-request') { setWithdrawModal(true); return }
    if (qa === 'no-account') { setBankAccount(null); return }
    if (qa === 'has-account') { setBankAccount({ bank: 'KB국민은행', accountNumber: '123-456-789012', holder: mockProfile.name, payerType: '개인', name: mockProfile.name, phone: '010-1234-5678' }); return }
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
  const thisMonthEarnings =
    items.filter(i => i.completedAt.startsWith(thisMonthPrefix)).reduce((s, i) => s + i.amount, 0) +
    downloadItems.filter(i => i.downloadedAt.startsWith(thisMonthPrefix)).reduce((s, i) => s + i.amount, 0)
  const totalEarnings =
    items.reduce((s, i) => s + i.amount, 0) +
    downloadItems.reduce((s, i) => s + i.amount, 0)

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
                <p className="text-[15px] font-semibold text-gray-900 break-keep">계좌 정보가 없어요</p>
                <p className="text-[15px] text-brand-green-text mt-0.5 break-keep">인출 요청을 하려면 계좌를 먼저 등록해야 해요</p>
              </div>
            </div>
            <button onClick={() => setBankModalOpen(true)} className="w-full @[400px]:w-auto shrink-0 text-[15px] font-semibold text-white bg-brand-green px-4 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              계좌 등록
            </button>
          </div>
        )}

        {/* 등록된 계좌 */}
        {hasBankAccount && bankAccount && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-brand-green shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[15px] text-gray-500">정산 계좌</p>
                {bankAccount.payerType && (
                  <span className="text-xs font-medium bg-brand-green-bg text-brand-green-text px-1.5 py-0.5 rounded-full whitespace-nowrap">{bankAccount.payerType}</span>
                )}
              </div>
              {bankAccount.name && (
                <p className="text-xs text-gray-500 mb-0.5">{bankAccount.name}{bankAccount.phone ? ` · ${bankAccount.phone}` : ''}</p>
              )}
              <p className="text-[15px] font-medium text-gray-900 truncate">{bankAccount.bank} <span className="tabular-nums">{bankAccount.accountNumber}</span> ({bankAccount.holder})</p>
            </div>
            <button
              onClick={() => { setBankModalOpen(true) }}
              className="shrink-0 text-[15px] text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              변경
            </button>
          </div>
        )}

        {/* 잔액 요약 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[15px] font-medium text-gray-500 mb-1">인출 가능 잔액</p>
          <p className="text-2xl @[400px]:text-3xl font-bold text-brand-green-text tabular-nums leading-tight">
            {withdrawableAmount.toLocaleString('ko-KR')}<span className="text-[15px] font-normal text-gray-500 ml-1">원</span>
          </p>
          {withdrawableAmount > 0 && (
            <button
              onClick={() => { if (!hasBankAccount) { setBankModalOpen(true); return }; setWithdrawModal(true) }}
              className="mt-3 flex items-center gap-1.5 text-[15px] font-semibold text-white bg-brand-green px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <BanknoteIcon size={14} />인출 요청
            </button>
          )}
          {withdrawableAmount === 0 && withdrawableCount === 0 && (
            <p className="mt-1.5 text-[15px] text-gray-400">인출 가능한 잔액이 없어요</p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp size={14} className="text-gray-400" />
                <p className="text-[15px] text-gray-500">이번 달 수익</p>
              </div>
              <p className="text-[15px] @[480px]:text-[15px] font-bold text-gray-900 tabular-nums break-keep">{thisMonthEarnings.toLocaleString('ko-KR')}<span className="text-[15px] font-normal text-gray-500 ml-0.5">원</span></p>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Wallet size={14} className="text-gray-400" />
                <p className="text-[15px] text-gray-500">누적 수익</p>
              </div>
              <p className="text-[15px] @[480px]:text-[15px] font-bold text-gray-900 tabular-nums break-keep">{totalEarnings.toLocaleString('ko-KR')}<span className="text-[15px] font-normal text-gray-500 ml-0.5">원</span></p>
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
                // 공통 필드 추출
                const isDownload = row.kind === 'download'
                const id = row.data.id
                const campaign = row.data.campaign
                const amount = row.data.amount
                const date = isDownload ? (row.data as DownloadRevenueItem).downloadedAt : (row.data as SettlementItem).completedAt
                const paidAt = row.data.paidAt
                const subLabel = isDownload
                  ? `${(row.data as DownloadRevenueItem).brand} · ${(row.data as DownloadRevenueItem).contentType}`
                  : (row.data as SettlementItem).type

                const status = row.data.status
                return (
                  <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 tabular-nums mb-1">
                          {fmtDate(paidAt ?? date)}{paidAt ? ' 지급' : ''}
                        </p>
                        <p className="text-[15px] font-semibold text-gray-900 break-keep">{campaign}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{subLabel}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <p className="text-[15px] @[640px]:text-lg font-bold text-gray-900 tabular-nums whitespace-nowrap">
                          {amount.toLocaleString('ko-KR')}<span className="text-[15px] font-normal text-gray-500 ml-0.5">원</span>
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          status === '미인출'
                            ? 'bg-amber-100 text-amber-600 border border-amber-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 페이지네이션 */}
            <Pagination
              total={tabData.length}
              page={page}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* 인출 요청 확인 모달 */}
      <ResponsiveSheet open={withdrawModal} onClose={() => setWithdrawModal(false)} title="인출 요청" size="sm">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between gap-3 text-[15px]">
              <span className="text-gray-500 shrink-0">인출 건수</span>
              <span className="font-medium text-gray-900 tabular-nums">{withdrawableCount}건</span>
            </div>
            <div className="flex justify-between gap-3 text-[15px]">
              <span className="text-gray-500 shrink-0">인출 금액</span>
              <span className="font-medium text-gray-900 tabular-nums text-right">{withdrawableAmount.toLocaleString('ko-KR')}원</span>
            </div>
            {bankAccount && (
              <div className="flex justify-between gap-3 text-[15px] pt-2 mt-1 border-t border-gray-200">
                <span className="text-gray-500 shrink-0">입금 계좌</span>
                <span className="font-medium text-gray-900 text-right break-keep">{bankAccount.bank} {bankAccount.accountNumber}</span>
              </div>
            )}
          </div>
          <p className="text-[15px] text-gray-500">요청 후 영업일 기준 3~5일 내 등록 계좌로 지급돼요</p>
          <div className="flex gap-2">
            <button onClick={() => setWithdrawModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-[15px] hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
            <button onClick={confirmWithdraw} className="flex-1 bg-brand-green text-white py-3 rounded-xl text-[15px] font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">요청하기</button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* 정산 정보 등록 / 변경 */}
      <ResponsiveSheet
        open={bankModalOpen}
        onClose={() => { setBankModalOpen(false); resetBankModal() }}
        title={hasBankAccount ? '정산 계좌 변경' : '정산 정보 등록'}
        size="md"
      >
        <div className="flex flex-col">
        <div className="space-y-5 pb-2">
          {/* 사업자 유형 선택 */}
          <div>
            <p className="text-[15px] font-medium text-gray-700 mb-2">사업자 유형 <span className="text-red-400" aria-label="필수">*</span></p>
            <div className="flex gap-2">
              {(['개인', '개인사업자'] as PayerType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setPayerType(t); setHolderVerified(null) }}
                  className={`flex-1 py-2.5 rounded-xl border text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                    payerType === t
                      ? 'border-brand-green bg-brand-green-bg text-brand-green-text'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {payerType === '개인' ? (
            <>
              {/* 이름 */}
              <div>
                <label htmlFor="reg-name" className="block text-[15px] font-medium text-gray-700 mb-1.5">이름 <span className="text-red-400" aria-label="필수">*</span></label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  placeholder="홍길동"
                  className={INPUT_BASE}
                />
              </div>

              {/* 주민등록번호 */}
              <div>
                <label htmlFor="reg-resident" className="block text-[15px] font-medium text-gray-700 mb-1.5">주민등록번호 <span className="text-red-400" aria-label="필수">*</span></label>
                <input
                  id="reg-resident"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={draftResidentNo}
                  onChange={e => setDraftResidentNo(formatResidentNo(e.target.value))}
                  placeholder="000000-0000000"
                  maxLength={14}
                  className={`${INPUT_BASE} tabular-nums`}
                />
                <p className="text-xs text-gray-400 mt-1">뒷자리 7자리는 마스킹 처리됩니다</p>
              </div>

              {/* 전화번호 */}
              <div>
                <label htmlFor="reg-phone" className="block text-[15px] font-medium text-gray-700 mb-1.5">전화번호 <span className="text-red-400" aria-label="필수">*</span></label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={draftPhone}
                  onChange={e => setDraftPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  className={`${INPUT_BASE} tabular-nums`}
                />
              </div>

              {/* 은행 */}
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1.5">은행명 <span className="text-red-400" aria-label="필수">*</span></label>
                <CustomSelect
                  value={draftBank}
                  onChange={v => { setDraftBank(v); setHolderVerified(null) }}
                  options={BANK_OPTIONS}
                  placeholder="은행 선택"
                  className="w-full"
                />
              </div>

              {/* 계좌번호 + 조회 */}
              <div>
                <label htmlFor="reg-account" className="block text-[15px] font-medium text-gray-700 mb-1.5">계좌번호 <span className="text-red-400" aria-label="필수">*</span></label>
                <div className="flex gap-2">
                  <input
                    id="reg-account"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={draftAccount}
                    onChange={e => handleAccountNumberChange(e.target.value)}
                    placeholder="숫자만 입력 (예: 123-456-789012)"
                    maxLength={20}
                    className={`${INPUT_BASE} tabular-nums flex-1`}
                  />
                  <button
                    onClick={handleHolderLookup}
                    disabled={holderChecking || !draftAccount}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[15px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
                  >
                    {holderChecking ? <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Search size={13} />}
                    조회
                  </button>
                </div>
              </div>

              {/* 예금주명 */}
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1.5">예금주명</label>
                {holderVerified ? (
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-brand-green-bg border border-brand-green-border">
                    <CheckCircle size={15} className="text-brand-green shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand-green-text">예금주 확인됨</p>
                      <p className="text-[15px] font-semibold text-gray-900">{holderVerified}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[15px] text-gray-400 px-1">
                    {holderChecking ? '예금주 조회 중...' : '계좌번호 입력 후 조회하면 자동으로 확인돼요'}
                  </p>
                )}
              </div>

              {/* 개인정보 동의 */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <CustomCheckbox
                    checked={draftPrivacyAgree}
                    onChange={() => setDraftPrivacyAgree(v => !v)}
                    label="개인정보 수집·이용 동의 (필수)"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-6">정산 지급을 위한 본인 확인 목적으로만 사용됩니다.</p>
              </div>
            </>
          ) : (
            <>
              {/* 사업자등록증 첨부 */}
              <div>
                <p className="block text-[15px] font-medium text-gray-700 mb-1.5">사업자등록증 <span className="text-red-400" aria-label="필수">*</span></p>
                <label
                  htmlFor="biz-reg-file"
                  className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-green-border hover:bg-brand-green-bg/30 transition-colors"
                >
                  {draftBizRegFile ? (
                    <div className="flex items-center gap-2 text-[15px] text-gray-700 px-4">
                      <CheckCircle size={16} className="text-brand-green shrink-0" />
                      <span className="truncate">{draftBizRegFile.name}</span>
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setDraftBizRegFile(null) }}
                        className="shrink-0 text-gray-400 hover:text-gray-700"
                        aria-label="파일 제거"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} className="text-gray-400" aria-hidden="true" />
                      <span className="text-[15px] text-gray-500">클릭하여 파일 첨부</span>
                      <span className="text-xs text-gray-400">JPG, PNG, PDF 지원</span>
                    </>
                  )}
                </label>
                <input
                  id="biz-reg-file"
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={e => { if (e.target.files?.[0]) setDraftBizRegFile(e.target.files[0]) }}
                />
              </div>

              {/* 사업자등록번호 */}
              <div>
                <label htmlFor="biz-reg-no" className="block text-[15px] font-medium text-gray-700 mb-1.5">사업자등록번호 <span className="text-red-400" aria-label="필수">*</span></label>
                <input
                  id="biz-reg-no"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={draftBizNo}
                  onChange={e => setDraftBizNo(formatBizNo(e.target.value))}
                  placeholder="000-00-00000"
                  maxLength={12}
                  className={`${INPUT_BASE} tabular-nums`}
                />
              </div>

              {/* 상호 */}
              <div>
                <label htmlFor="biz-name" className="block text-[15px] font-medium text-gray-700 mb-1.5">상호 <span className="text-red-400" aria-label="필수">*</span></label>
                <input
                  id="biz-name"
                  type="text"
                  value={draftBizName}
                  onChange={e => setDraftBizName(e.target.value)}
                  placeholder="예: 홍길동 마케팅"
                  className={INPUT_BASE}
                />
              </div>

              {/* 대표자명 */}
              <div>
                <label htmlFor="biz-ceo" className="block text-[15px] font-medium text-gray-700 mb-1.5">대표자명 <span className="text-red-400" aria-label="필수">*</span></label>
                <input
                  id="biz-ceo"
                  type="text"
                  autoComplete="name"
                  value={draftCeoName}
                  onChange={e => setDraftCeoName(e.target.value)}
                  placeholder="홍길동"
                  className={INPUT_BASE}
                />
              </div>

              {/* 전화번호 */}
              <div>
                <label htmlFor="biz-phone" className="block text-[15px] font-medium text-gray-700 mb-1.5">전화번호</label>
                <input
                  id="biz-phone"
                  type="tel"
                  value={draftBizPhone}
                  onChange={e => setDraftBizPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  className={`${INPUT_BASE} tabular-nums`}
                />
              </div>

              {/* 은행 */}
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1.5">은행명 <span className="text-red-400" aria-label="필수">*</span></label>
                <CustomSelect
                  value={draftBank}
                  onChange={v => { setDraftBank(v); setHolderVerified(null) }}
                  options={BANK_OPTIONS}
                  placeholder="은행 선택"
                  className="w-full"
                />
              </div>

              {/* 계좌번호 + 조회 */}
              <div>
                <label htmlFor="biz-account" className="block text-[15px] font-medium text-gray-700 mb-1.5">계좌번호 <span className="text-red-400" aria-label="필수">*</span></label>
                <div className="flex gap-2">
                  <input
                    id="biz-account"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={draftAccount}
                    onChange={e => handleAccountNumberChange(e.target.value)}
                    placeholder="숫자만 입력 (예: 123-456-789012)"
                    maxLength={20}
                    className={`${INPUT_BASE} tabular-nums flex-1`}
                  />
                  <button
                    onClick={handleHolderLookup}
                    disabled={holderChecking || !draftAccount}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[15px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
                  >
                    {holderChecking ? <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <Search size={13} />}
                    조회
                  </button>
                </div>
              </div>

              {/* 예금주명 */}
              <div>
                <label className="block text-[15px] font-medium text-gray-700 mb-1.5">예금주명</label>
                {holderVerified ? (
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-brand-green-bg border border-brand-green-border">
                    <CheckCircle size={15} className="text-brand-green shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand-green-text">예금주 확인됨</p>
                      <p className="text-[15px] font-semibold text-gray-900">{holderVerified}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[15px] text-gray-400 px-1">
                    {holderChecking ? '예금주 조회 중...' : '계좌번호 입력 후 조회하면 자동으로 확인돼요'}
                  </p>
                )}
              </div>

              {/* 세금계산서 이메일 */}
              <div>
                <label htmlFor="biz-email" className="block text-[15px] font-medium text-gray-700 mb-1.5">세금계산서 발행/수신 이메일 <span className="text-red-400" aria-label="필수">*</span></label>
                <input
                  id="biz-email"
                  type="email"
                  autoComplete="email"
                  value={draftBizEmail}
                  onChange={e => setDraftBizEmail(e.target.value)}
                  placeholder="example@company.com"
                  className={INPUT_BASE}
                />
              </div>

              {/* 주민등록번호 (optional) */}
              <div>
                <label htmlFor="biz-resident" className="block text-[15px] font-medium text-gray-700 mb-1.5">주민등록번호 <span className="text-gray-400 font-normal">(선택)</span></label>
                <input
                  id="biz-resident"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={draftBizResidentNo}
                  onChange={e => setDraftBizResidentNo(formatResidentNo(e.target.value))}
                  placeholder="000000-0000000"
                  maxLength={14}
                  className={`${INPUT_BASE} tabular-nums`}
                />
                <p className="text-xs text-gray-400 mt-1">원천징수 방식 확정 시 활성화됩니다</p>
              </div>
            </>
          )}

        </div>
        {/* 플로팅 버튼 — 스크롤과 무관하게 항상 하단 고정 */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 flex gap-2 pt-3 pb-4 -mx-4 px-4 @sm:-mx-6 @sm:px-6 rounded-b-2xl">
            <button
              onClick={() => { setBankModalOpen(false); resetBankModal() }}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-[15px] hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >취소</button>
            <button
              onClick={handleBankRegister}
              disabled={!holderVerified}
              className="flex-1 bg-brand-green text-white py-3 rounded-xl text-[15px] font-medium hover:bg-brand-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >등록하기</button>
          </div>
        </div>
      </ResponsiveSheet>
    </Layout>
  )
}
