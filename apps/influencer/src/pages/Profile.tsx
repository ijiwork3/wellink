import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Activity, Pencil, Check, X, Phone, Lock, LogOut, Link2, ChevronRight, Eye, EyeOff } from 'lucide-react'
import Layout from '../components/Layout'
import { CustomCheckbox, INPUT_BASE as inputBase, TIMER_MS, auth, ErrorState, Skeleton } from '@wellink/ui'
import { Toggle, BottomSheet, AlertModal } from '@wellink/ui'
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
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(qa === 'modal-withdraw')
  const [currentPw, setCurrentPw] = useState('')
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

  const handlePwChange = async () => {
    if (isPwSubmitting) return
    if (!currentPw || !newPw || !confirmPw) { showToast('모든 항목을 입력해 주세요', 'error'); return }
    if (newPw.length < 8) { showToast('새 비밀번호는 8자 이상이어야 해요', 'error'); return }
    if (newPw === currentPw) { showToast('현재 비밀번호와 다른 비밀번호로 변경해 주세요', 'error'); return }
    if (newPw !== confirmPw) { showToast('새 비밀번호가 일치하지 않아요', 'error'); return }
    setIsPwSubmitting(true)
    await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
    if (!isMountedRef.current) return
    setIsPwSubmitting(false)
    setPwModalOpen(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
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
      <Layout showProfileHeader={false}>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton shape="circle" height={20} width={20} />
              <Skeleton shape="text" height={16} width="5rem" />
            </div>
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} shape="card" height={40} width="100%" />)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <Skeleton shape="text" height={16} width="5rem" className="mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({length: 10}).map((_, i) => <Skeleton key={i} shape="card" height={36} width="100%" />)}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout showProfileHeader={false}>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="프로필을 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showProfileHeader={false}>
      <div className="space-y-4 max-w-xl">
        <h1 className="sr-only">내 정보</h1>

        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-brand-green" />
              <h2 className="text-base font-semibold text-gray-900">기본 정보</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={() => { setDraftName(name); setDraftFields(new Set(selectedFields)); setDraftType(influencerType); setIsEditing(true) }}
                className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Pencil size={14} />편집
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1 text-sm text-gray-500 border border-gray-200 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                  <X size={14} />취소
                </button>
                <button onClick={handleSave} disabled={isSaving || !hasProfileChanges} aria-disabled={isSaving || !hasProfileChanges} aria-busy={isSaving} className="flex items-center gap-1 text-sm text-white bg-brand-green px-3 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                  <Check size={14} aria-hidden="true" />{isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
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

            {/* 전화번호 — 320px 단말까지 대비해서 좁으면 한 줄 띄움 */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">전화번호</label>
              <div className="flex flex-col @[400px]:flex-row @[400px]:items-center gap-2">
                <p className="flex-1 text-sm text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl tabular-nums">{phone}</p>
                <button
                  onClick={() => setPhoneModalOpen(true)}
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Phone size={14} />변경
                </button>
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">비밀번호</label>
              <button
                onClick={() => setPwModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-brand-green/5 border-brand-green text-brand-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Lock size={14} />비밀번호 변경
              </button>
            </div>

            {/* 인플루언서 타입 */}
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
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
        </div>

        {/* 활동 분야 카드 — 헤더에 독립 편집 버튼 (기본 정보 카드와 isEditing 상태 공유) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-brand-green" />
              <h2 className="text-base font-semibold text-gray-900">활동 분야</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={() => { setDraftName(name); setDraftFields(new Set(selectedFields)); setDraftType(influencerType); setIsEditing(true) }}
                className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Pencil size={14} />편집
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1 text-sm text-gray-500 border border-gray-200 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                  <X size={14} />취소
                </button>
                <button onClick={handleSave} disabled={isSaving || !hasProfileChanges} aria-disabled={isSaving || !hasProfileChanges} aria-busy={isSaving} className="flex items-center gap-1 text-sm text-white bg-brand-green px-3 py-2.5 rounded-xl hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                  <Check size={14} aria-hidden="true" />{isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 @[480px]:grid-cols-3 @[640px]:grid-cols-4 gap-2.5">
            {ACTIVITY_FIELDS.map(field => (
              <CustomCheckbox
                key={field}
                checked={isEditing ? draftFields.has(field) : selectedFields.has(field)}
                onChange={() => isEditing && toggleField(field)}
                label={field}
              />
            ))}
          </div>
        </div>

        {/* SNS 관리 바로가기 */}
        <button
          onClick={() => navigate('/media')}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-green-bg flex items-center justify-center shrink-0">
            <Link2 size={16} className="text-brand-green-text" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">SNS 관리</p>
            <p className="text-sm text-gray-500 mt-0.5">인스타그램, 유튜브 등 채널 연결</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
        </button>

        {/* 알림 설정 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p id="profile-marketing-label" className="text-sm font-medium text-gray-900">마케팅 수신 동의</p>
              <p className="text-sm text-gray-500 mt-0.5 break-keep">캠페인 알림, 신규 혜택 등을 받아볼 수 있어요</p>
            </div>
            <Toggle checked={marketing} onChange={() => setMarketing(!marketing)} ariaLabelledBy="profile-marketing-label" />
          </div>
        </div>

        {/* 로그아웃 + 회원탈퇴 */}
        <div className="flex flex-col items-center gap-3 pt-1 pb-4">
          <button
            onClick={() => { auth.clear(); navigate('/login') }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <LogOut size={14} />로그아웃
          </button>
          <button onClick={() => setWithdrawModalOpen(true)} className="text-sm text-gray-500 hover:text-red-500 underline underline-offset-2 px-3 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 바텀시트 */}
      <BottomSheet open={pwModalOpen} onClose={() => { setPwModalOpen(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowNewPw(false); setShowConfirmPw(false) }} title="비밀번호 변경">
        <div className="space-y-3">
          {/* 현재 비밀번호 — 원본에 없음, 추가 필드 */}
          <input type="password" placeholder="현재 비밀번호" value={currentPw}
            autoComplete="current-password"
            maxLength={50}
            onChange={e => setCurrentPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePwChange()}
            className={inputClass} />
          {/* 새 비밀번호 — 원본 mypage L1990-2007: Eye/EyeOff 토글 */}
          <div className="relative">
            <input type={showNewPw ? 'text' : 'password'} placeholder="새 비밀번호 (8자 이상)" value={newPw}
              autoComplete="new-password"
              maxLength={50}
              onChange={e => setNewPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePwChange()}
              className={inputClass} />
            <button type="button" onClick={() => setShowNewPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none"
              aria-label={showNewPw ? '비밀번호 숨기기' : '비밀번호 표시'}>
              {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* 새 비밀번호 확인 — 원본 mypage L2022-2036: Eye/EyeOff 토글 */}
          <div className="relative">
            <input type={showConfirmPw ? 'text' : 'password'} placeholder="새 비밀번호 확인" value={confirmPw}
              autoComplete="new-password"
              maxLength={50}
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
          <button onClick={() => setPwModalOpen(false)} disabled={isPwSubmitting} aria-disabled={isPwSubmitting} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
          <button onClick={handlePwChange} disabled={isPwSubmitting} aria-disabled={isPwSubmitting} aria-busy={isPwSubmitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">{isPwSubmitting ? '변경 중...' : '변경하기'}</button>
        </div>
      </BottomSheet>

      {/* 전화번호 변경 바텀시트 */}
      <BottomSheet open={phoneModalOpen} onClose={() => { setPhoneModalOpen(false); setNewPhone(''); setPhoneCode(''); setPhoneCodeSent(false) }} title="전화번호 변경">
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
          {phoneCodeSent && (
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
            </div>
          )}
          {phoneCodeSent && (
            <p className="text-sm text-gray-500">인증번호를 발송했어요 — 3분 내에 입력해 주세요</p>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setPhoneModalOpen(false)} disabled={isPhoneSubmitting} aria-disabled={isPhoneSubmitting} className="flex-1 py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
          <button onClick={handlePhoneVerify} disabled={isPhoneSubmitting} aria-disabled={isPhoneSubmitting} aria-busy={isPhoneSubmitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">{isPhoneSubmitting ? '확인 중...' : '인증 완료'}</button>
        </div>
      </BottomSheet>

      {/* 회원탈퇴 모달 — 광고주 패턴과 통일 (AlertModal variant="danger") */}
      <AlertModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="회원탈퇴"
        description="정말 탈퇴하시겠어요? 탈퇴 후 모든 데이터는 복구할 수 없어요"
        variant="danger"
        confirmLabel="탈퇴하기"
        cancelLabel="취소"
        onConfirm={() => { setWithdrawModalOpen(false); showToast('탈퇴 기능은 준비 중이에요', 'info') }}
      >
        <div className="p-3 rounded-xl text-sm bg-red-100 border border-red-200 text-red-700 break-keep">
          탈퇴 시 캠페인 내역, 프로필 정보 등이 모두 삭제돼요
        </div>
      </AlertModal>
    </Layout>
  )
}
