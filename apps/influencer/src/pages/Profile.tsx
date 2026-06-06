import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Pencil, Phone, Lock, LogOut, Eye, EyeOff, Camera, Trash2, BadgeCheck, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import { CustomCheckbox, INPUT_BASE as inputBase, TIMER_MS, auth, ErrorState, Skeleton, AlertModal, Modal } from '@wellink/ui'
import { Toggle, ResponsiveSheet } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { ACTIVITY_FIELDS, INFLUENCER_TYPES, mockProfile } from '../services/mock/profile'
import { useInstagramState } from '../services/userState'
import { formatPhone } from '../utils/format'


const inputClass = `${inputBase} w-full`

export default function Profile() {
  const qa = useQAMode()
  const navigate = useNavigate()
  // 비동기 작업(setTimeout) 완료 후 unmount된 경우 setState 호출 방지
  const isMountedRef = useRef(true)
  useEffect(() => () => { isMountedRef.current = false }, [])
  const [isEditing, setIsEditing] = useState(qa === 'edit')
  const [name, setName] = useState(mockProfile.name)
  const [draftName, setDraftName] = useState(mockProfile.name)
  const [marketing, setMarketing] = useState(mockProfile.marketing)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(mockProfile.selectedFields))
  const [draftFields, setDraftFields] = useState<Set<string>>(new Set(mockProfile.selectedFields))
  const [influencerType, setInfluencerType] = useState(mockProfile.influencerType)
  const [draftType, setDraftType] = useState(mockProfile.influencerType)
  const { showToast } = useToast()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [pwModalOpen, setPwModalOpen] = useState(qa === 'modal-password')
  const [phoneModalOpen, setPhoneModalOpen] = useState(qa === 'modal-phone')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [phone, setPhone] = useState(mockProfile.phone)
  const [newPhone, setNewPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneCodeSent, setPhoneCodeSent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPwSubmitting, setIsPwSubmitting] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false)
  // 인스타그램 연결 상태 — Media·CampaignApply와 localStorage 공유
  const ig = useInstagramState()
  const [isProfessionalConnecting, setIsProfessionalConnecting] = useState(false)
  const professionalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (professionalTimerRef.current) clearTimeout(professionalTimerRef.current) }, [])

  // 프로필 이미지
  const avatarFileRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDraftAvatarUrl(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // 비밀번호 변경 2단계: 1=OTP 인증, 2=새 비밀번호 입력
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState(qa === 'modal-withdraw')
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('')
  const [pwStep, setPwStep] = useState<1 | 2>(1)
  const [pwPhone, setPwPhone] = useState('')
  const [pwCode, setPwCode] = useState('')
  const [pwCodeSent, setPwCodeSent] = useState(false)

  // URL search param 외부 동기화 (정책 §외부동기화)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (searchParams.get('modal') === 'password') setPwModalOpen(true)
  }, [searchParams, location.key])

  // QA 파라미터 외부 동기화 (정책 §외부동기화)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (qa === 'edit') setIsEditing(true)
  }, [qa])

  const toggleField = (f: string) => {
    setDraftFields(prev => {
      const next = new Set(prev)
      if (next.has(f)) { next.delete(f) } else { next.add(f) }
      return next
    })
  }

  const handleSave = async () => {
    if (!draftName.trim()) { showToast('이름을 입력해 주세요', 'error'); return }
    if (draftName.trim().length < 2) { showToast('이름은 2자 이상이어야 해요', 'error'); return }
    setIsSaving(true)
    await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
    if (!isMountedRef.current) return
    setName(draftName)
    setSelectedFields(new Set(draftFields))
    setInfluencerType(draftType)
    if (draftAvatarUrl !== null) setAvatarUrl(draftAvatarUrl)
    setIsEditing(false)
    setIsSaving(false)
    showToast('저장했어요!', 'success')
  }

  const handleCancel = () => {
    setDraftName(name)
    setDraftFields(new Set(selectedFields))
    setDraftType(influencerType)
    setDraftAvatarUrl(null)
    setIsEditing(false)
  }

  // A-1: 원본 mypage/page.tsx ProfileSettings L1711-1731 — hasProfileChanges
  // 저장 버튼은 실제로 변경된 항목이 있을 때만 활성화
  const hasProfileChanges = useMemo(() => {
    if (!isEditing) return false
    if (draftName.trim() !== name.trim()) return true
    if (draftType !== influencerType) return true
    const a = [...draftFields].sort()
    const b = [...selectedFields].sort()
    if (a.length !== b.length) return true
    return a.some((v, i) => v !== b[i])
  }, [isEditing, draftName, name, draftType, influencerType, draftFields, selectedFields])

  const closePwModal = () => {
    setPwModalOpen(false)
    setPwStep(1); setPwPhone(''); setPwCode(''); setPwCodeSent(false)
    setNewPw(''); setConfirmPw(''); setShowNewPw(false); setShowConfirmPw(false)
  }

  const handlePwSendCode = () => {
    if (!pwPhone || pwPhone.replace(/\D/g, '').length < 10) {
      showToast('올바른 전화번호를 입력해 주세요', 'error'); return
    }
    setPwCodeSent(true)
    showToast('인증번호가 발송됐어요', 'success')
  }

  const handlePwVerify = () => {
    if (!pwCodeSent) { showToast('인증번호를 먼저 받아주세요', 'error'); return }
    if (pwCode.length !== 6) { showToast('인증번호 6자리를 입력해 주세요', 'error'); return }
    setPwStep(2)
  }

  const handlePwChange = async () => {
    if (isPwSubmitting) return
    if (!newPw || !confirmPw) { showToast('새 비밀번호를 입력해 주세요', 'error'); return }
    if (newPw.length < 8) { showToast('새 비밀번호는 8자 이상이어야 해요', 'error'); return }
    if (newPw !== confirmPw) { showToast('새 비밀번호가 일치하지 않아요', 'error'); return }
    setIsPwSubmitting(true)
    await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
    if (!isMountedRef.current) return
    setIsPwSubmitting(false)
    closePwModal()
    showToast('비밀번호를 변경했어요!', 'success')
  }

  const handlePhoneSendCode = () => {
    if (!newPhone || newPhone.replace(/\D/g, '').length < 10) {
      showToast('올바른 전화번호를 입력해 주세요', 'error'); return
    }
    if (newPhone === phone) {
      showToast('현재 번호와 다른 번호로 변경해 주세요', 'error'); return
    }
    setPhoneCodeSent(true)
    showToast('인증번호가 발송됐어요', 'success')
  }

  const handlePhoneVerify = async () => {
    if (isPhoneSubmitting) return
    if (!phoneCodeSent) { showToast('인증번호를 먼저 받아주세요', 'error'); return }
    if (phoneCode.length !== 6) { showToast('인증번호 6자리를 입력해 주세요', 'error'); return }
    setIsPhoneSubmitting(true)
    await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
    if (!isMountedRef.current) return
    setIsPhoneSubmitting(false)
    setPhone(newPhone)
    setPhoneModalOpen(false)
    setNewPhone(''); setPhoneCode(''); setPhoneCodeSent(false)
    showToast('전화번호를 변경했어요!', 'success')
  }

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 max-w-xl mx-auto">
          {/* 내 정보 카드 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {/* 헤더: User 아이콘 + 제목 + 편집 버튼 */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Skeleton shape="circle" height={16} width={16} />
                <Skeleton shape="text" height={16} width="4rem" />
              </div>
              <Skeleton shape="card" height={36} width="4.5rem" />
            </div>
            {/* 이름·이메일·전화번호 read-only 필드 */}
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i}>
                  <Skeleton shape="text" height={12} width="3rem" className="mb-1.5" />
                  <Skeleton shape="card" height={38} width="100%" />
                </div>
              ))}
              {/* 인플루언서 유형 */}
              <div>
                <Skeleton shape="text" height={12} width="5.5rem" className="mb-2" />
                <Skeleton shape="card" height={38} width="100%" />
              </div>
            </div>
            {/* 활동 분야 — 태그 형태 */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <Skeleton shape="text" height={14} width="4rem" className="mb-3" />
              <div className="flex flex-wrap gap-2">
                {[60, 52, 68, 44, 56].map((w, i) => (
                  <Skeleton key={i} shape="card" height={26} width={`${w}px`} className="rounded-full" />
                ))}
              </div>
            </div>
          </div>
          {/* 마케팅 수신 동의 카드 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton shape="text" height={14} width="7rem" />
                <Skeleton shape="text" height={12} width="12rem" />
              </div>
              <Skeleton shape="card" height={24} width="2.75rem" className="rounded-full" />
            </div>
          </div>
          {/* 로그아웃 버튼 */}
          <div className="flex justify-center pt-1 pb-4">
            <Skeleton shape="card" height={40} width="7rem" className="rounded-xl" />
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="프로필을 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showBottomTab={!isEditing}>
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="sr-only">내 정보</h1>

        {/* 모바일 탭 — 사이드바 없는 환경(< 640px)에서만 표시, sticky */}
        {!isEditing && (
          <div className="@[640px]:hidden sticky top-0 z-10 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur-sm">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1 flex">
              <button
                aria-current="page"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[15px] font-semibold bg-brand-green-bg text-brand-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <User size={14} />내 정보
              </button>
              <button
                onClick={() => navigate('/media')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[15px] font-medium text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none"
              >
                <Camera size={14} />인스타 관리
              </button>
            </div>
          </div>
        )}

        {/* 내 정보 통합 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <User size={16} className="text-brand-green" />
              <h2 className="text-[15px] font-semibold text-gray-900">내 정보</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => { setDraftName(name); setDraftFields(new Set(selectedFields)); setDraftType(influencerType); setIsEditing(true) }}
                className="flex items-center gap-1.5 text-[15px] text-gray-500 border border-gray-200 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Pencil size={14} />편집
              </button>
            )}
          </div>

          {/* 프로필 이미지 */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-green-bg border-2 border-brand-green-border flex items-center justify-center">
                {(isEditing ? draftAvatarUrl : avatarUrl) ? (
                  <img
                    src={(isEditing ? draftAvatarUrl : avatarUrl)!}
                    alt="프로필 이미지"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-brand-green-text select-none">
                    {name.slice(0, 1)}
                  </span>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  aria-label="프로필 사진 변경"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-green flex items-center justify-center shadow-md hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Camera size={13} className="text-white" />
                </button>
              )}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            {/* 이름 */}
            <div>
              <label htmlFor="profile-name" className="block text-[15px] font-medium text-gray-500 mb-1.5">이름</label>
              {isEditing
                ? <input id="profile-name" type="text" value={draftName} onChange={e => setDraftName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !isSaving) { e.preventDefault(); handleSave() } }} maxLength={20} autoComplete="name" className={inputClass} />
                : <p className="text-[15px] text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl break-keep">{name}</p>
              }
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-[15px] font-medium text-gray-500 mb-1.5">이메일</label>
              <p className="text-[15px] text-gray-500 px-3 py-2.5 bg-gray-50 rounded-xl break-all">{mockProfile.email}</p>
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-[15px] font-medium text-gray-500 mb-1.5">전화번호</label>
              <div className="flex flex-col @[400px]:flex-row @[400px]:items-center gap-2">
                <p className="flex-1 text-[15px] text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl tabular-nums">{phone}</p>
                {isEditing && (
                  <button
                    onClick={() => setPhoneModalOpen(true)}
                    className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-[15px] font-medium border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    <Phone size={14} />변경
                  </button>
                )}
              </div>
            </div>

            {/* 비밀번호 — 편집 모드에서만 표시 */}
            {isEditing && (
              <div>
                <label className="block text-[15px] font-medium text-gray-500 mb-1.5">비밀번호</label>
                <button
                  onClick={() => setPwModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[15px] font-medium transition-all bg-brand-green-bg hover:bg-brand-green/5 border-brand-green-border text-brand-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Lock size={14} />비밀번호 변경
                </button>
              </div>
            )}

            {/* 인플루언서 유형 */}
            <div>
              <label className="block text-[15px] font-medium text-gray-500 mb-2">인플루언서 유형</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {INFLUENCER_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setDraftType(t.value)}
                      className={`px-3 py-2.5 rounded-xl text-[15px] font-medium text-left break-keep leading-tight transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                        draftType === t.value
                          ? 'border-brand-green bg-brand-green-bg text-brand-green-text'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[15px] text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl">
                  {INFLUENCER_TYPES.find(t => t.value === influencerType)?.label ?? '미설정'}
                </p>
              )}
            </div>
          </div>

          {/* 활동 분야 */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-[15px] font-medium text-gray-700 mb-3">활동 분야</p>
            {isEditing ? (
              <div className="grid grid-cols-2 @[480px]:grid-cols-3 @[640px]:grid-cols-4 gap-2.5">
                {ACTIVITY_FIELDS.map(field => (
                  <CustomCheckbox
                    key={field}
                    checked={draftFields.has(field)}
                    onChange={() => toggleField(field)}
                    label={field}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedFields.size === 0 ? (
                  <p className="text-[15px] text-gray-400">미설정</p>
                ) : (
                  [...selectedFields].map(f => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-brand-green-bg text-brand-green-text border border-brand-green-border whitespace-nowrap">
                      {f}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 마케팅 수신 동의 — 편집 모드와 별도 */}
        {!isEditing && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p id="profile-marketing-label" className="text-[15px] font-medium text-gray-900">마케팅 수신 동의</p>
              <p className="text-[15px] text-gray-500 mt-0.5 break-keep">캠페인 알림, 신규 혜택 등을 받아볼 수 있어요</p>
            </div>
            <Toggle checked={marketing} onChange={() => setMarketing(!marketing)} ariaLabelledBy="profile-marketing-label" />
          </div>
        </div>
        )}

        {/* 프로페셔널 계정 연동 — 인스타 연결된 경우에만 표시 */}
        {!isEditing && ig.connected && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[15px] font-medium text-gray-900">인스타그램 프로페셔널 계정</p>
                {ig.professional && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-brand-green-text bg-brand-green-bg px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    <BadgeCheck size={11} aria-hidden="true" />연동됨
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 break-keep leading-relaxed">
                {ig.professional
                  ? '비즈니스·크리에이터 계정이 연동되었습니다. 활동비 지급 캠페인에 지원할 수 있어요.'
                  : '비즈니스·크리에이터 계정을 연동하면 활동비 지급 캠페인에 지원할 수 있어요.'}
              </p>
              {!ig.professional && (
                <a
                  href="https://help.instagram.com/502981923235522"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
                >
                  프로페셔널 계정 전환 방법 <ExternalLink size={10} aria-hidden="true" />
                </a>
              )}
            </div>
            {ig.professional ? (
              <button
                type="button"
                onClick={() => { ig.downgradeToPersonal(); showToast('연동이 해제되었어요', 'info') }}
                className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 rounded px-2 py-1"
              >
                연동 해제
              </button>
            ) : (
              <button
                type="button"
                disabled={isProfessionalConnecting}
                aria-disabled={isProfessionalConnecting}
                aria-busy={isProfessionalConnecting}
                onClick={() => {
                  setIsProfessionalConnecting(true)
                  professionalTimerRef.current = setTimeout(() => {
                    setIsProfessionalConnecting(false)
                    ig.upgradeToProfessional()
                    showToast('프로페셔널 계정이 연동되었어요!', 'success')
                  }, 1400)
                }}
                className="shrink-0 text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
              >
                {isProfessionalConnecting ? '연동 중...' : '계정 연동'}
              </button>
            )}
          </div>
        </div>
        )}

        {/* 편집 모드 하단 CTA */}
        {isEditing && (
          <div className="flex gap-3 pb-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 rounded-xl text-[15px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasProfileChanges}
              aria-disabled={isSaving || !hasProfileChanges}
              aria-busy={isSaving}
              className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        )}

        {/* 로그아웃 + 회원탈퇴 */}
        {!isEditing && (
          <div className="flex flex-col items-center gap-3 pt-1 pb-4">
            <button
              onClick={() => setLogoutConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-[15px] font-medium text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <LogOut size={14} />로그아웃
            </button>
            <button
              onClick={() => { setWithdrawConfirmText(''); setWithdrawModal(true) }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 rounded"
            >
              <Trash2 size={12} />탈퇴신청
            </button>
          </div>
        )}
      </div>

      {/* 비밀번호 변경 — 2단계: 1=전화 OTP 인증, 2=새 비밀번호 */}
      <ResponsiveSheet open={pwModalOpen} onClose={closePwModal} title="비밀번호 변경" size="sm">
        {pwStep === 1 ? (
          <>
            <p className="text-[15px] text-gray-500 mb-4">본인 확인을 위해 전화번호 인증이 필요해요</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="pw-phone" className="text-[15px] text-gray-500 block mb-1.5">전화번호</label>
                <div className="flex gap-2">
                  <input
                    id="pw-phone"
                    type="tel" value={pwPhone}
                    autoComplete="tel" inputMode="tel" maxLength={13}
                    onChange={e => setPwPhone(formatPhone(e.target.value))}
                    placeholder="010-0000-0000"
                    className={`${inputBase} flex-1 tabular-nums`}
                  />
                  <button
                    onClick={handlePwSendCode}
                    className="shrink-0 px-3 py-2.5 rounded-xl border text-[15px] font-medium border-brand-green text-brand-green-text bg-brand-green-bg hover:bg-brand-green/5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    {pwCodeSent ? '재발송' : '인증요청'}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="pw-code" className="text-[15px] text-gray-500 block mb-1.5">인증번호</label>
                <input
                  id="pw-code"
                  type="text" value={pwCode}
                  autoComplete="one-time-code" inputMode="numeric"
                  onChange={e => setPwCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handlePwVerify()}
                  placeholder="6자리 입력"
                  className={inputClass}
                  maxLength={6}
                />
                {pwCodeSent && (
                  <p className="text-xs text-gray-400 mt-1.5">인증번호를 발송했어요. 3분 내에 입력해 주세요.</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closePwModal} className="flex-1 py-3 rounded-xl text-[15px] border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
              <button onClick={handlePwVerify} disabled={!pwCodeSent || pwCode.length !== 6} className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">인증 완료</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[15px] text-gray-500 mb-4">새로 사용할 비밀번호를 입력해 주세요</p>
            <div className="space-y-3">
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} placeholder="새 비밀번호 (8자 이상)" value={newPw}
                  autoComplete="new-password" maxLength={50}
                  onChange={e => setNewPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePwChange()}
                  className={inputClass} />
                <button type="button" onClick={() => setShowNewPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none"
                  aria-label={showNewPw ? '비밀번호 숨기기' : '비밀번호 표시'}>
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPw ? 'text' : 'password'} placeholder="새 비밀번호 확인" value={confirmPw}
                  autoComplete="new-password" maxLength={50}
                  onChange={e => setConfirmPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePwChange()}
                  className={inputClass} />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none"
                  aria-label={showConfirmPw ? '비밀번호 숨기기' : '비밀번호 표시'}>
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closePwModal} disabled={isPwSubmitting} className="flex-1 py-3 rounded-xl text-[15px] border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
              <button onClick={handlePwChange} disabled={isPwSubmitting} aria-busy={isPwSubmitting} className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">{isPwSubmitting ? '변경 중...' : '변경하기'}</button>
            </div>
          </>
        )}
      </ResponsiveSheet>

      {/* 전화번호 변경 */}
      <ResponsiveSheet open={phoneModalOpen} onClose={() => { setPhoneModalOpen(false); setNewPhone(''); setPhoneCode(''); setPhoneCodeSent(false) }} title="전화번호 변경" size="sm">
        <div className="space-y-3">
          <div>
            <label htmlFor="profile-new-phone" className="text-[15px] text-gray-500 block mb-1.5">새 전화번호</label>
            <div className="flex flex-col @[400px]:flex-row gap-2">
              <input
                id="profile-new-phone"
                type="tel" value={newPhone}
                autoComplete="tel"
                inputMode="tel"
                maxLength={13}
                onChange={e => setNewPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                className={`${inputClass} flex-1 tabular-nums`}
              />
              <button
                onClick={handlePhoneSendCode}
                className="shrink-0 px-3 py-2.5 rounded-xl border text-[15px] font-medium border-brand-green text-brand-green-text hover:bg-brand-green/5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                {phoneCodeSent ? '재발송' : '인증번호 받기'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="profile-phone-code" className="text-[15px] text-gray-500 block mb-1.5">인증번호</label>
            <input
              id="profile-phone-code"
              type="text" value={phoneCode}
              autoComplete="one-time-code"
              inputMode="numeric"
              onChange={e => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6자리 입력"
              className={inputClass}
              maxLength={6}
            />
            {phoneCodeSent && (
              <p className="text-[15px] text-gray-500 mt-1.5">인증번호를 발송했어요. 3분 내에 입력해 주세요.</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setPhoneModalOpen(false)} disabled={isPhoneSubmitting} aria-disabled={isPhoneSubmitting} className="flex-1 py-3 rounded-xl text-[15px] border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
          <button onClick={handlePhoneVerify} disabled={isPhoneSubmitting} aria-disabled={isPhoneSubmitting} aria-busy={isPhoneSubmitting} className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">{isPhoneSubmitting ? '확인 중...' : '인증 완료'}</button>
        </div>
      </ResponsiveSheet>

      <AlertModal
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="로그아웃"
        description="로그아웃 하시겠어요?"
        confirmLabel="로그아웃"
        onConfirm={() => { setLogoutConfirm(false); showToast('로그아웃되었습니다. 메인으로 이동할게요.', 'info'); setTimeout(() => { window.location.href = /^(localhost|127\.0\.0\.1)/.test(window.location.hostname) ? 'http://localhost:5199/' : 'https://wellink.ai/' }, TIMER_MS.LOGOUT_REDIRECT) }}
        variant="default"
      />

      {/* 회원 탈퇴 모달 */}
      <Modal
        open={withdrawModal}
        onClose={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
        title="탈퇴신청"
        footer={
          <>
            <button type="button"
              onClick={() => { setWithdrawModal(false); setWithdrawConfirmText('') }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-[15px] hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              취소
            </button>
            <button type="button"
              disabled={withdrawConfirmText !== '탈퇴'}
              onClick={() => {
                setWithdrawModal(false)
                setWithdrawConfirmText('')
                showToast('탈퇴 신청이 완료됐어요.', 'info')
                setTimeout(() => { auth.clear(); window.location.href = /^(localhost|127\.0\.0\.1)/.test(window.location.hostname) ? 'http://localhost:5199/' : 'https://wellink.ai/' }, TIMER_MS.NAV_DELAY)
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-[15px] font-medium hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50"
            >
              탈퇴하기
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-[15px] font-semibold text-red-700 mb-1">탈퇴 전 꼭 확인해주세요</p>
            <ul className="text-xs text-red-600 space-y-1 mt-2">
              {['참여 중인 캠페인 이력과 정산 정보가 삭제돼요.', '연결된 인스타그램 계정 정보도 함께 삭제돼요.', '삭제된 데이터는 복구할 수 없어요.'].map(text => (
                <li key={text} className="flex items-start gap-1.5">
                  <span className="mt-px flex-shrink-0">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="text-[15px] text-gray-500 mb-1.5 block">
              아래 입력란에 <span className="font-semibold text-red-600">탈퇴</span>를 입력하면 버튼이 활성화돼요.
            </label>
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
    </Layout>
  )
}
