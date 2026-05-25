import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Pencil, Phone, Lock, LogOut, Eye, EyeOff } from 'lucide-react'
import Layout from '../components/Layout'
import { CustomCheckbox, INPUT_BASE as inputBase, TIMER_MS, auth, ErrorState, Skeleton, AlertModal } from '@wellink/ui'
import { Toggle, ResponsiveSheet } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { ACTIVITY_FIELDS, INFLUENCER_TYPES, mockProfile } from '../services/mock/profile'
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
  // 비밀번호 변경 2단계: 1=OTP 인증, 2=새 비밀번호 입력
  const [logoutConfirm, setLogoutConfirm] = useState(false)
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
    setIsEditing(false)
    setIsSaving(false)
    showToast('저장했어요!', 'success')
  }

  const handleCancel = () => {
    setDraftName(name)
    setDraftFields(new Set(selectedFields))
    setDraftType(influencerType)
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

        {/* 내 정보 통합 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <User size={16} className="text-brand-green" />
              <h2 className="text-base font-semibold text-gray-900">내 정보</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => { setDraftName(name); setDraftFields(new Set(selectedFields)); setDraftType(influencerType); setIsEditing(true) }}
                className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Pencil size={14} />편집
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* 이름 */}
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-500 mb-1.5">이름</label>
              {isEditing
                ? <input id="profile-name" type="text" value={draftName} onChange={e => setDraftName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !isSaving) { e.preventDefault(); handleSave() } }} maxLength={20} autoComplete="name" className={inputClass} />
                : <p className="text-sm text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl break-keep">{name}</p>
              }
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">이메일</label>
              <p className="text-sm text-gray-500 px-3 py-2.5 bg-gray-50 rounded-xl break-all">{mockProfile.email}</p>
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">전화번호</label>
              <div className="flex flex-col @[400px]:flex-row @[400px]:items-center gap-2">
                <p className="flex-1 text-sm text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl tabular-nums">{phone}</p>
                {isEditing && (
                  <button
                    onClick={() => setPhoneModalOpen(true)}
                    className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    <Phone size={14} />변경
                  </button>
                )}
              </div>
            </div>

            {/* 비밀번호 — 편집 모드에서만 표시 */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">비밀번호</label>
                <button
                  onClick={() => setPwModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-brand-green-bg hover:bg-brand-green/10 border-brand-green-border text-brand-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Lock size={14} />비밀번호 변경
                </button>
              </div>
            )}

            {/* 인플루언서 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">인플루언서 유형</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {INFLUENCER_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setDraftType(t.value)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left break-keep leading-tight transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
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
                <p className="text-sm text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl">
                  {INFLUENCER_TYPES.find(t => t.value === influencerType)?.label ?? '미설정'}
                </p>
              )}
            </div>
          </div>

          {/* 활동 분야 */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">활동 분야</p>
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
                  <p className="text-sm text-gray-400">미설정</p>
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
              <p id="profile-marketing-label" className="text-sm font-medium text-gray-900">마케팅 수신 동의</p>
              <p className="text-sm text-gray-500 mt-0.5 break-keep">캠페인 알림, 신규 혜택 등을 받아볼 수 있어요</p>
            </div>
            <Toggle checked={marketing} onChange={() => setMarketing(!marketing)} ariaLabelledBy="profile-marketing-label" />
          </div>
        </div>
        )}

        {/* 편집 모드 하단 CTA */}
        {isEditing && (
          <div className="flex gap-3 pb-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasProfileChanges}
              aria-disabled={isSaving || !hasProfileChanges}
              aria-busy={isSaving}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        )}

        {/* 로그아웃 + 회원탈퇴 */}
        {!isEditing && (
          <div className="flex justify-center pt-1 pb-4">
            <button
              onClick={() => setLogoutConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <LogOut size={14} />로그아웃
            </button>
          </div>
        )}
      </div>

      {/* 비밀번호 변경 — 2단계: 1=전화 OTP 인증, 2=새 비밀번호 */}
      <ResponsiveSheet open={pwModalOpen} onClose={closePwModal} title="비밀번호 변경" size="sm">
        {pwStep === 1 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">본인 확인을 위해 전화번호 인증이 필요해요</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="pw-phone" className="text-sm text-gray-500 block mb-1.5">전화번호</label>
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
                    className="shrink-0 px-3 py-2.5 rounded-xl border text-sm font-medium border-brand-green text-brand-green-text bg-brand-green-bg hover:bg-brand-green/10 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    {pwCodeSent ? '재발송' : '인증요청'}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="pw-code" className="text-sm text-gray-500 block mb-1.5">인증번호</label>
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
              <button onClick={closePwModal} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
              <button onClick={handlePwVerify} disabled={!pwCodeSent || pwCode.length !== 6} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">인증 완료</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">새로 사용할 비밀번호를 입력해 주세요</p>
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
              <button onClick={closePwModal} disabled={isPwSubmitting} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
              <button onClick={handlePwChange} disabled={isPwSubmitting} aria-busy={isPwSubmitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">{isPwSubmitting ? '변경 중...' : '변경하기'}</button>
            </div>
          </>
        )}
      </ResponsiveSheet>

      {/* 전화번호 변경 */}
      <ResponsiveSheet open={phoneModalOpen} onClose={() => { setPhoneModalOpen(false); setNewPhone(''); setPhoneCode(''); setPhoneCodeSent(false) }} title="전화번호 변경" size="sm">
        <div className="space-y-3">
          <div>
            <label htmlFor="profile-new-phone" className="text-sm text-gray-500 block mb-1.5">새 전화번호</label>
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
                className="shrink-0 px-3 py-2.5 rounded-xl border text-sm font-medium border-brand-green text-brand-green-text hover:bg-brand-green/5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                {phoneCodeSent ? '재발송' : '인증번호 받기'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="profile-phone-code" className="text-sm text-gray-500 block mb-1.5">인증번호</label>
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
              <p className="text-sm text-gray-500 mt-1.5">인증번호를 발송했어요. 3분 내에 입력해 주세요.</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setPhoneModalOpen(false)} disabled={isPhoneSubmitting} aria-disabled={isPhoneSubmitting} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
          <button onClick={handlePhoneVerify} disabled={isPhoneSubmitting} aria-disabled={isPhoneSubmitting} aria-busy={isPhoneSubmitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">{isPhoneSubmitting ? '확인 중...' : '인증 완료'}</button>
        </div>
      </ResponsiveSheet>

      <AlertModal
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="로그아웃"
        description="로그아웃 하시겠어요?"
        confirmLabel="로그아웃"
        onConfirm={() => { auth.clear(); navigate('/login') }}
        variant="default"
      />
    </Layout>
  )
}
