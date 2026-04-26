import { useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { User, Activity, Pencil, Check, X, XCircle, RefreshCw, Phone, Lock } from 'lucide-react'
import Layout from '../components/Layout'
import { CustomCheckbox, INPUT_BASE as inputBase, TIMER_MS } from '@wellink/ui'
import { Toggle, Modal } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { ACTIVITY_FIELDS, INFLUENCER_TYPES, mockProfile } from '../services/mock/profile'

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

const inputClass = `${inputBase} w-full`

export default function Profile() {
  const qa = useQAMode()
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

  useEffect(() => {
    if (searchParams.get('modal') === 'password') setPwModalOpen(true)
  }, [searchParams, location.key])

  useEffect(() => {
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
    setIsSaving(true)
    await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
    setName(draftName)
    setSelectedFields(new Set(draftFields))
    setInfluencerType(draftType)
    setIsEditing(false)
    setIsSaving(false)
    showToast('저장되었어요!', 'success')
  }

  const handleCancel = () => {
    setDraftName(name)
    setDraftFields(new Set(selectedFields))
    setDraftType(influencerType)
    setIsEditing(false)
  }

  const handlePwChange = async () => {
    if (!currentPw || !newPw || !confirmPw) { showToast('모든 항목을 입력해 주세요', 'error'); return }
    if (newPw !== confirmPw) { showToast('새 비밀번호가 일치하지 않아요', 'error'); return }
    await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
    setPwModalOpen(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    showToast('비밀번호가 변경되었어요!', 'success')
  }

  const handlePhoneSendCode = () => {
    if (!newPhone || newPhone.replace(/\D/g, '').length < 10) {
      showToast('올바른 전화번호를 입력해 주세요', 'error'); return
    }
    setPhoneCodeSent(true)
    showToast('인증번호가 발송되었어요', 'success')
  }

  const handlePhoneVerify = async () => {
    if (!phoneCodeSent) { showToast('인증번호를 먼저 받아주세요', 'error'); return }
    if (phoneCode.length < 4) { showToast('인증번호를 입력해 주세요', 'error'); return }
    await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
    setPhone(newPhone)
    setPhoneModalOpen(false)
    setNewPhone(''); setPhoneCode(''); setPhoneCodeSent(false)
    showToast('전화번호가 변경되었어요!', 'success')
  }

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-gray-100 rounded-full" />
              <div className="h-4 bg-gray-100 rounded-xl w-20" />
            </div>
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="h-4 bg-gray-100 rounded-xl w-20 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({length: 10}).map((_, i) => <div key={i} className="h-9 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" />
          <p className="text-sm font-semibold text-gray-900">프로필을 불러오지 못했어요</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green">
            <RefreshCw size={14} />다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4 max-w-xl">

        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-brand-green" />
              <h2 className="text-base font-semibold text-gray-900">기본 정보</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={() => { setDraftName(name); setDraftFields(new Set(selectedFields)); setDraftType(influencerType); setIsEditing(true) }}
                className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Pencil size={12} />편집
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <X size={12} />취소
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1 text-xs text-white bg-brand-green px-2.5 py-1.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60">
                  <Check size={12} />{isSaving ? '저장 중' : '저장'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* 이름 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">이름</label>
              {isEditing
                ? <input type="text" value={draftName} onChange={e => setDraftName(e.target.value)} className={inputClass} />
                : <p className="text-sm text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl">{name}</p>
              }
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">이메일</label>
              <p className="text-sm text-gray-400 px-3 py-2.5 bg-gray-50 rounded-xl">{mockProfile.email}</p>
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">전화번호</label>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-sm text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl">{phone}</p>
                <button
                  onClick={() => setPhoneModalOpen(true)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Phone size={13} />변경
                </button>
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">비밀번호</label>
              <button
                onClick={() => setPwModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-brand-green/5 border-brand-green text-brand-green"
              >
                <Lock size={13} />비밀번호 변경
              </button>
            </div>

            {/* 인플루언서 타입 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">인플루언서 유형</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {INFLUENCER_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setDraftType(t.value)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border ${
                        draftType === t.value
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
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

        {/* 활동 분야 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-brand-green" />
            <h2 className="text-base font-semibold text-gray-900">활동 분야</h2>
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
          {!isEditing && (
            <p className="text-xs text-gray-400 mt-3">편집 버튼을 눌러 활동 분야를 변경할 수 있어요</p>
          )}
        </div>

        {/* 알림 설정 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">마케팅 수신 동의</p>
              <p className="text-xs text-gray-500 mt-0.5">캠페인 알림, 신규 혜택 등을 받아볼 수 있어요</p>
            </div>
            <Toggle checked={marketing} onChange={() => setMarketing(!marketing)} label="마케팅 수신 동의" />
          </div>
        </div>

        {/* 회원탈퇴 */}
        <div className="flex justify-center pt-1 pb-4">
          <button onClick={() => setWithdrawModalOpen(true)} className="text-xs text-gray-400 hover:text-red-400 underline underline-offset-2 transition-colors">
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Modal open={pwModalOpen} onClose={() => { setPwModalOpen(false); setCurrentPw(''); setNewPw(''); setConfirmPw('') }} title="비밀번호 변경" size="sm">
        <div className="space-y-3">
          {([
            { ph: '현재 비밀번호', val: currentPw, setter: setCurrentPw },
            { ph: '새 비밀번호', val: newPw, setter: setNewPw },
            { ph: '새 비밀번호 확인', val: confirmPw, setter: setConfirmPw },
          ] as const).map(({ ph, val, setter }) => (
            <input key={ph} type="password" placeholder={ph} value={val}
              onChange={e => setter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePwChange()}
              className={inputClass} />
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setPwModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">취소</button>
          <button onClick={handlePwChange} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity">변경하기</button>
        </div>
      </Modal>

      {/* 전화번호 변경 모달 */}
      <Modal open={phoneModalOpen} onClose={() => { setPhoneModalOpen(false); setNewPhone(''); setPhoneCode(''); setPhoneCodeSent(false) }} title="전화번호 변경" size="sm">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">새 전화번호</label>
            <div className="flex gap-2">
              <input
                type="tel" value={newPhone}
                onChange={e => setNewPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                className={`${inputClass} flex-1`}
              />
              <button
                onClick={handlePhoneSendCode}
                className="shrink-0 px-3 py-2.5 rounded-xl border text-sm font-medium border-brand-green text-brand-green hover:bg-brand-green/5 transition-colors whitespace-nowrap"
              >
                {phoneCodeSent ? '재발송' : '인증번호 받기'}
              </button>
            </div>
          </div>
          {phoneCodeSent && (
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">인증번호</label>
              <input
                type="text" value={phoneCode}
                onChange={e => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6자리 입력"
                className={inputClass}
                maxLength={6}
              />
            </div>
          )}
          {phoneCodeSent && (
            <p className="text-xs text-gray-400">인증번호가 발송되었어요. 3분 내에 입력해 주세요.</p>
          )}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setPhoneModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">취소</button>
          <button onClick={handlePhoneVerify} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity">인증 완료</button>
        </div>
      </Modal>

      {/* 회원탈퇴 모달 */}
      <Modal open={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} title="회원탈퇴" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">정말 탈퇴하시겠어요? 탈퇴 후 모든 데이터가 삭제되며 복구할 수 없어요.</p>
          <div className="p-3 rounded-xl text-sm bg-red-50 text-red-600">탈퇴 시 캠페인 내역, 프로필 정보 등이 모두 삭제됩니다.</div>
          <div className="flex gap-3">
            <button onClick={() => setWithdrawModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">취소</button>
            <button onClick={() => { setWithdrawModalOpen(false); showToast('탈퇴 기능은 준비 중이에요', 'info') }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">탈퇴하기</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
