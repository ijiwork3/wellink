import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, User, Building2, Phone, Hash, LogOut, Save, Link, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'

function InstagramIcon({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
import {
  Modal, TIMER_MS, useToast,
  Tabs, ErrorState, SkeletonCard, SkeletonRow, PageHeader,
  SEMANTIC_COLORS,
  type TabItem,
} from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { usePlanAccess } from '../hooks/usePlanAccess'

// 탭 라벨 = TabItem.value (한국어 식별자, 단일 출처)
type TabName = '광고주 정보' | '구독 관리'
const TAB_ITEMS: readonly TabItem<TabName>[] = [
  { value: '광고주 정보', label: '광고주 정보', icon: <Building2 size={14} aria-hidden="true" /> },
  { value: '구독 관리',   label: '구독 관리',   icon: <Hash size={14} aria-hidden="true" />, trailing: <ExternalLink size={12} className="ml-0.5 opacity-70" aria-hidden="true" /> },
]

export default function MyPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()
  const { planLabel, isSubscribed } = usePlanAccess()

  const [activeTab, setActiveTab] = useState<TabName>('광고주 정보')

  // 계정 정보
  const [name, setName] = useState('이지훈')
  const [email] = useState('brand@wellink.ai')

  // 회사 정보
  const [companyName, setCompanyName] = useState('웰링크 브랜드')
  const [bizNumber, setBizNumber] = useState('123-45-67890')
  const [managerName, setManagerName] = useState('이지훈')
  const [phone, setPhone] = useState('010-1234-5678')

  // 편집 모드 — 디폴트 뷰. '수정' 버튼 클릭 시에만 편집 가능.
  const [editing, setEditing] = useState(false)
  // 편집 시작 시 원본 백업 (취소 시 복원용) — marketingConsent 포함 (A-9)
  const [editBackup, setEditBackup] = useState<{
    name: string; companyName: string; bizNumber: string; managerName: string
    phone: string; marketingConsent: string | null
  } | null>(null)
  // 저장 중 스피너 (A-8)
  const [isSaving, setIsSaving] = useState(false)

  // 마케팅 수신 — ISO 타임스탬프 (null = 미동의, string = 동의 시점)
  const [marketingConsent, setMarketingConsent] = useState<string | null>(null)
  const [campaignAlert, setCampaignAlert] = useState(true)
  const [paymentAlert, setPaymentAlert] = useState(true)

  // SNS 연동
  const [snsConnected, setSnsConnected] = useState(true)
  const [snsModal, setSnsModal] = useState(false)
  const [snsHandle, setSnsHandle] = useState('wellink_brand')
  // C-4: Meta OAuth 로딩 시뮬레이션
  // 실제 구현: startCompanyMetaConnect(me?.id) → Meta 앱 ID + OAuth redirect URI 필요
  const [isConnecting, setIsConnecting] = useState(false)

  // 비밀번호 변경 인라인 3단계: 0=닫힘, 1=현재비번 확인, 2=새비번 입력
  const [passwordStep, setPasswordStep] = useState<0 | 1 | 2>(qa === 'modal-password' ? 1 : 0)
  const [withdrawModal, setWithdrawModal] = useState(qa === 'modal-withdraw')
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('')

  // 비밀번호 변경 폼
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // QA: 로딩 상태 — 공통 SkeletonCard / SkeletonRow 사용
  if (qa === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-full" />
            <div className="h-3 w-48 bg-gray-100 animate-pulse rounded-full" />
          </div>
          <div className="h-4 w-16 bg-gray-100 animate-pulse rounded-full" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {[1, 2].map(i => <div key={i} className="h-9 w-28 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
        <SkeletonCard height={180} />
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[1, 2, 3].map(i => <div key={i} className="px-6"><SkeletonRow cols={4} /></div>)}
        </div>
      </div>
    )
  }

  if (qa === 'error') {
    return <ErrorState message="계정 정보를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  const handleStartEdit = () => {
    setEditBackup({ name, companyName, bizNumber, managerName, phone, marketingConsent })
    setEditing(true)
  }

  const handleCancelEdit = () => {
    if (editBackup) {
      setName(editBackup.name)
      setCompanyName(editBackup.companyName)
      setBizNumber(editBackup.bizNumber)
      setManagerName(editBackup.managerName)
      setPhone(editBackup.phone)
      setMarketingConsent(editBackup.marketingConsent)
    }
    setEditBackup(null)
    setEditing(false)
  }

  // A-9: hasChanges — 백업 대비 변경 여부 (변경 없으면 저장 버튼 비활성화)
  // 원본 ProfileSettings.tsx L87-100: name/corpName/corpBusinessNo/phone/managerName/marketingAgreeTime 비교
  const hasChanges = editBackup !== null && (
    name !== editBackup.name ||
    companyName !== editBackup.companyName ||
    bizNumber !== editBackup.bizNumber ||
    managerName !== editBackup.managerName ||
    phone !== editBackup.phone ||
    marketingConsent !== editBackup.marketingConsent
  )

  // A-10: isFormValid — 필수 필드 비어있으면 저장 버튼 비활성화
  // 원본 ProfileSettings.tsx L77-85: name/corpName/phone/managerName 필수
  const isFormValid = companyName.trim().length > 0 && name.trim().length > 0 &&
    managerName.trim().length > 0 && phone.trim().length > 0

  // A-8/C-5: isSaving 스피너 + mock 저장 시뮬레이션
  // 실제 구현: useUpdateProfile.mutateAsync({ companyName, name, bizNumber, managerName, phone }) 호출 필요
  const handleSave = () => {
    if (!isFormValid) { showToast('필수 항목을 입력하세요.', 'error'); return }
    if (bizNumber.trim() && !/^\d{3}-\d{2}-\d{5}$/.test(bizNumber.trim())) {
      showToast('사업자 등록번호 형식을 확인해 주세요. (예: 123-45-67890)', 'error'); return
    }
    setIsSaving(true)
    // TODO: 실제 API 연동 시 → await useUpdateProfile.mutateAsync({ companyName, name, bizNumber, managerName, phone })
    setTimeout(() => {
      setIsSaving(false)
      showToast('변경사항이 저장되었습니다.', 'success')
      setEditBackup(null)
      setEditing(false)
    }, 1000)
  }

  const resetPasswordStep = () => {
    setPasswordStep(0); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPasswordError('')
  }

  const handlePasswordChange = () => {
    setPasswordError('')
    if (!newPw || !confirmPw) { setPasswordError('모든 항목을 입력하세요.'); return }
    if (newPw.length < 8) { setPasswordError('비밀번호는 8자 이상이어야 합니다.'); return }
    if (newPw !== confirmPw) { setPasswordError('새 비밀번호가 일치하지 않습니다.'); return }
    resetPasswordStep()
    showToast('비밀번호가 변경되었습니다.', 'success')
  }

  // C-4: Meta/Instagram OAuth 연동 시뮬레이션
  // 실제 구현: startCompanyMetaConnect(me?.id) 호출 → Meta OAuth 팝업 → redirect callback 처리
  const handleSnsConnect = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
      setSnsConnected(true)
      setSnsModal(false)
      showToast('Instagram 계정이 연결되었습니다.', 'success')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <PageHeader
        title="마이페이지"
        description="계정 설정 및 구독 정보를 한눈에 확인하세요."
        actions={
          <button type="button"
            onClick={() => { showToast('로그아웃되었습니다. 메인으로 이동할게요.', 'info'); setTimeout(() => { window.location.href = /^(localhost|127\.0\.0\.1)/.test(window.location.hostname) ? 'http://localhost:5199/' : 'https://wellink.ai/' }, TIMER_MS.LOGOUT_REDIRECT) }}
            className="shrink-0 flex items-center gap-1.5 text-[15px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut size={16} aria-hidden="true" />
            로그아웃
          </button>
        }
      />

      {/* 탭 — 공통 Tabs (variant='pill', scrollable=false → wrap) */}
      {/* 구독 관리 클릭 시 즉시 /subscription 이동 (원본 mypage: Link href=ROUTE.COMPANY.DASHBOARD.SUBSCRIPTIONS) */}
      <Tabs<TabName>
        variant="pill"
        scrollable={false}
        gap={1}
        items={TAB_ITEMS}
        value={activeTab}
        onChange={(v) => { if (v === '구독 관리') { navigate('/subscription') } else { setActiveTab(v) } }}
        ariaLabel="마이페이지 섹션"
      />

      {/* ── 구독 관리 탭 ── */}
      {activeTab === '구독 관리' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">구독 관리</h2>
              <p className="text-[15px] text-gray-500 mt-0.5">현재 플랜과 결제 정보를 확인합니다.</p>
            </div>
            {isSubscribed ? (
              <span className="shrink-0 text-[15px] font-semibold bg-brand-green-bg text-brand-green-text px-3 py-1.5 rounded-full border border-brand-green-border">
                현재: {planLabel} 플랜
              </span>
            ) : (
              <span className="shrink-0 text-[15px] font-semibold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200">
                {planLabel}
              </span>
            )}
          </div>
          <button type="button"
            onClick={() => navigate('/subscription')}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            구독 관리 페이지로 이동
          </button>
        </div>
      )}

      {/* ── 광고주 정보 탭 ── */}
      {activeTab === '광고주 정보' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900">광고주 정보 설정</h2>
              <p className="text-[15px] text-gray-500 mt-0.5">서비스 이용에 필요한 기본 정보를 관리합니다.</p>
            </div>
            {editing ? (
              <div className="flex items-center gap-2 shrink-0">
                <button type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl text-[15px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  취소
                </button>
                <button type="button"
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges || !isFormValid}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[15px] font-medium bg-brand-green text-white hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green"
                >
                  {isSaving
                    ? <><Loader2 size={14} className="animate-spin" aria-hidden="true" />저장 중...</>
                    : <><Save size={14} aria-hidden="true" />저장</>
                  }
                </button>
              </div>
            ) : (
              <button type="button"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[15px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                수정
              </button>
            )}
          </div>

          <div className="p-6 space-y-8">
            {/* 기본 정보 */}
            <section>
              <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                기본 정보
              </h3>
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mypage-company" className="text-[15px] text-gray-500 mb-1.5 block">브랜드명 (회사명)</label>
                  <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-colors ${editing ? 'border-gray-200 focus-within:border-gray-400' : 'border-gray-100 bg-gray-50'}`}>
                    <Building2 size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-company"
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      readOnly={!editing}
                      aria-label="브랜드명"
                      className={`flex-1 text-[15px] outline-none bg-transparent ${editing ? 'text-gray-900' : 'text-gray-600 cursor-default'}`}
                      placeholder="브랜드명을 입력하세요"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-biz-number" className="text-[15px] text-gray-500 mb-1.5 block">사업자 등록번호</label>
                  <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-colors ${editing ? 'border-gray-200 focus-within:border-gray-400' : 'border-gray-100 bg-gray-50'}`}>
                    <Hash size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-biz-number"
                      type="text"
                      value={bizNumber}
                      onChange={e => setBizNumber(e.target.value)}
                      readOnly={!editing}
                      aria-label="사업자 등록번호"
                      pattern="[0-9]{3}-[0-9]{2}-[0-9]{5}"
                      className={`flex-1 text-[15px] outline-none bg-transparent ${editing ? 'text-gray-900' : 'text-gray-600 cursor-default'}`}
                      placeholder="예: 123-45-67890"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 계정 정보 */}
            <section>
              <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                계정 정보
              </h3>
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mypage-email" className="text-[15px] text-gray-500 mb-1.5 block">이메일 주소</label>
                  <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Mail size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <span id="mypage-email" className="text-[15px] text-gray-500">{email}</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-name" className="text-[15px] text-gray-500 mb-1.5 block">담당자 이름</label>
                  <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-colors ${editing ? 'border-gray-200 focus-within:border-gray-400' : 'border-gray-100 bg-gray-50'}`}>
                    <User size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      readOnly={!editing}
                      aria-label="담당자 이름"
                      className={`flex-1 text-[15px] outline-none bg-transparent ${editing ? 'text-gray-900' : 'text-gray-600 cursor-default'}`}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-manager" className="text-[15px] text-gray-500 mb-1.5 block">담당자명 (계약)</label>
                  <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-colors ${editing ? 'border-gray-200 focus-within:border-gray-400' : 'border-gray-100 bg-gray-50'}`}>
                    <User size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-manager"
                      type="text"
                      value={managerName}
                      onChange={e => setManagerName(e.target.value)}
                      readOnly={!editing}
                      aria-label="담당자명"
                      className={`flex-1 text-[15px] outline-none bg-transparent ${editing ? 'text-gray-900' : 'text-gray-600 cursor-default'}`}
                      placeholder="담당자명"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mypage-phone" className="text-[15px] text-gray-500 mb-1.5 block">연락처</label>
                  <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-colors ${editing ? 'border-gray-200 focus-within:border-gray-400' : 'border-gray-100 bg-gray-50'}`}>
                    <Phone size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="mypage-phone"
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      readOnly={!editing}
                      aria-label="연락처"
                      inputMode="tel"
                      className={`flex-1 text-[15px] outline-none bg-transparent ${editing ? 'text-gray-900' : 'text-gray-600 cursor-default'}`}
                      placeholder="연락처"
                    />
                  </div>
                </div>
              </div>
              {/* 비밀번호 변경 인라인 3단계 — 원본 ProfileSettings 동등 */}
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  {passwordStep === 0 ? (
                    <button type="button"
                      onClick={() => setPasswordStep(1)}
                      className="text-[15px] text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      비밀번호 변경하기
                    </button>
                  ) : (
                    <button type="button"
                      onClick={resetPasswordStep}
                      className="text-[15px] text-red-500 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      변경 취소
                    </button>
                  )}
                  <button type="button"
                    onClick={() => setWithdrawModal(true)}
                    className="text-[15px] text-red-500 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    회원 탈퇴
                  </button>
                </div>

                {/* Step 1: 현재 비밀번호 확인 */}
                {passwordStep === 1 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="pw-current" className="text-[15px] font-medium text-gray-700 block">현재 비밀번호 확인</label>
                    <div className="flex gap-2">
                      <input
                        id="pw-current"
                        type="password"
                        value={currentPw}
                        onChange={e => { setCurrentPw(e.target.value); setPasswordError('') }}
                        aria-label="현재 비밀번호"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors bg-gray-50"
                        placeholder="현재 비밀번호를 입력해주세요"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (currentPw.trim()) setPasswordStep(2) } }}
                      />
                      <button type="button"
                        onClick={() => {
                          if (!currentPw.trim()) { setPasswordError('현재 비밀번호를 입력해주세요.'); return }
                          setPasswordError(''); setPasswordStep(2)
                        }}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[15px] font-medium hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                      >
                        확인
                      </button>
                    </div>
                    {passwordError && <p className="text-[15px] text-red-500">{passwordError}</p>}
                  </div>
                )}

                {/* Step 2: 새 비밀번호 입력 */}
                {passwordStep === 2 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div>
                      <label htmlFor="pw-new" className="text-[15px] font-medium text-gray-700 block mb-1.5">새 비밀번호</label>
                      <input
                        id="pw-new"
                        type="password"
                        value={newPw}
                        onChange={e => { setNewPw(e.target.value); setPasswordError('') }}
                        aria-label="새 비밀번호"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors bg-gray-50"
                        placeholder="새 비밀번호 (8자 이상)"
                      />
                    </div>
                    <div>
                      <label htmlFor="pw-confirm" className="text-[15px] font-medium text-gray-700 block mb-1.5">새 비밀번호 확인</label>
                      <input
                        id="pw-confirm"
                        type="password"
                        value={confirmPw}
                        onChange={e => { setConfirmPw(e.target.value); setPasswordError('') }}
                        aria-label="새 비밀번호 확인"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors bg-gray-50"
                        placeholder="비밀번호를 다시 입력해주세요"
                      />
                    </div>
                    {passwordError && <p className="text-[15px] text-red-500">{passwordError}</p>}
                    <button type="button"
                      onClick={handlePasswordChange}
                      className="w-full bg-brand-green text-white py-2.5 rounded-xl text-[15px] font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      비밀번호 변경하기
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 알림 설정 */}
            <section>
              <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-green rounded-full" />
                알림 설정
              </h3>
              <div className="space-y-3">
                {/* 이메일 마케팅 수신 — 동의 시점 ISO 타임스탬프 저장. 전체 영역 클릭 가능 */}
                <button type="button"
                  onClick={() => setMarketingConsent(marketingConsent ? null : new Date().toISOString())}
                  role="checkbox"
                  aria-checked={!!marketingConsent}
                  aria-label="이메일 마케팅 수신 동의"
                  className="flex items-start gap-3 w-full text-left rounded-lg -mx-1 px-1 py-1 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      marketingConsent ? 'bg-brand-green border-brand-green' : 'border-gray-300'
                    }`}
                  >
                    {marketingConsent && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke={SEMANTIC_COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium text-gray-900">이메일 마케팅 수신</span>
                    <span className="block text-[15px] text-gray-500 mt-0.5">
                      이벤트, 프로모션 등 다양한 혜택 안내
                      {marketingConsent && (
                        <span className="ml-2 text-[15px] text-gray-500">
                          (동의: {new Date(marketingConsent).toLocaleDateString('ko-KR')})
                        </span>
                      )}
                    </span>
                  </span>
                </button>
                {/* 캠페인·정산 알림 */}
                {[
                  { id: 'alert-campaign', label: '캠페인 알림', desc: '지원자·콘텐츠 제출·발표일 알림 (이메일 + 서비스 내)', value: campaignAlert, setter: setCampaignAlert },
                  { id: 'alert-payment',  label: '정산 알림',   desc: '결제 예정일·실패 알림',                               value: paymentAlert,  setter: setPaymentAlert },
                ].map(item => (
                  <button key={item.id} type="button"
                    onClick={() => item.setter(!item.value)}
                    role="checkbox"
                    aria-checked={item.value}
                    aria-label={item.label}
                    className="flex items-start gap-3 w-full text-left rounded-lg -mx-1 px-1 py-1 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.value ? 'bg-brand-green border-brand-green' : 'border-gray-300'
                      }`}
                    >
                      {item.value && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke={SEMANTIC_COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="block text-[15px] font-medium text-gray-900">{item.label}</span>
                      <span className="block text-[15px] text-gray-500 mt-0.5">{item.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* SNS 연동 설정 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-4 bg-brand-green rounded-full" />
                  SNS 연동 설정
                </h3>
                {snsConnected && (
                  <span className="flex items-center gap-1 text-[15px] text-brand-green-text font-medium">
                    <CheckCircle2 size={14} className="text-brand-green" aria-hidden="true" />
                    연결됨
                  </span>
                )}
              </div>
              <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #FCAF45 100%)' }}>
                    <InstagramIcon size={22} className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-gray-900">Instagram 비즈니스</p>
                    <p className="text-[15px] text-gray-500 mt-0.5">인스타그램 통계 및 광고 데이터를 연동합니다.</p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => setSnsModal(true)}
                  className={`px-5 py-2.5 rounded-xl text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                    snsConnected
                      ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      : 'bg-brand-green text-white hover:bg-brand-green-hover'
                  }`}
                >
                  {snsConnected ? '연동 관리' : 'Instagram 연결하기'}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* SNS 연결 모달 */}
      <Modal
        open={snsModal}
        onClose={() => { setSnsModal(false); setSnsHandle('wellink_brand') }}
        title="Instagram 연결"
        footer={
          <>
            <button type="button"
              onClick={() => { setSnsModal(false); setSnsHandle('wellink_brand') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-[15px] hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button type="button"
              onClick={handleSnsConnect}
              disabled={snsHandle.trim() === '' || isConnecting}
              className="flex-1 flex items-center justify-center gap-1.5 bg-brand-green text-white py-2.5 rounded-xl text-[15px] font-medium hover:bg-brand-green-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isConnecting
                ? <><Loader2 size={14} className="animate-spin" aria-hidden="true" />연결 중...</>
                : '연결'
              }
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Link size={24} className="text-gray-400" aria-hidden="true" />
            </div>
          </div>
          <div>
            <label htmlFor="sns-handle" className="text-[15px] text-gray-500 mb-1.5 block">Instagram 비즈니스 계정</label>
            <input
              id="sns-handle"
              type="text"
              value={snsHandle}
              onChange={e => setSnsHandle(e.target.value)}
              aria-label="Instagram 비즈니스 계정"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              placeholder="Instagram 아이디를 입력하세요"
            />
            {snsHandle.trim() === '' && (
              <p className="text-[15px] text-red-500 mt-1">아이디를 입력해야 연결할 수 있습니다.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* 회원 탈퇴 모달 */}
      <Modal
        open={withdrawModal}
        onClose={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
        title="회원 탈퇴"
        footer={
          <>
            <button type="button"
              onClick={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-[15px] hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button type="button"
              disabled={withdrawConfirmText !== '탈퇴'}
              onClick={() => {
                setWithdrawModal(false)
                setWithdrawConfirmText('')
                showToast('탈퇴 처리가 완료되었습니다.', 'info')
                setTimeout(() => navigate('/'), TIMER_MS.NAV_DELAY)
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-[15px] font-medium hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              탈퇴하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-100 border border-red-200 rounded-xl p-4">
            <p className="text-[15px] font-semibold text-red-700 mb-1">탈퇴 전 꼭 확인해주세요</p>
            <ul className="text-[15px] text-red-600 space-y-1 list-disc list-inside">
              <li>모든 캠페인 데이터 및 인플루언서 이력이 삭제됩니다.</li>
              <li>구독 중인 플랜은 즉시 해지됩니다.</li>
              <li>삭제된 데이터는 복구가 불가능합니다.</li>
            </ul>
          </div>
          <div>
            <label className="text-[15px] text-gray-500 mb-1.5 block">아래 입력란에 <span className="font-semibold text-red-600">탈퇴</span>를 입력하면 버튼이 활성화됩니다.</label>
            <input
              type="text"
              value={withdrawConfirmText}
              onChange={e => setWithdrawConfirmText(e.target.value)}
              placeholder="'탈퇴'를 입력해 주세요"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 transition-colors"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
