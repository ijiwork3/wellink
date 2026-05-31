/**
 * PhoneVerificationGate — 전화번호 인증 게이트
 *
 * 원본 대응: RequiredPhoneVerificationProvider (wellink-front-main/apps/influencer)
 * - localStorage `wl_inf_phone_verified_v1` = '1' 이면 통과
 * - /login, /signup 경로는 게이트 스킵 (public path)
 * - 미인증 시 바텀시트 모달 강제 표시 (dismiss 불가)
 * - Mock: 올바른 형식 전화번호 입력 후 6자리 아무 숫자나 입력하면 인증 완료
 */
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Phone } from 'lucide-react'

const STORAGE_KEY = 'wl_inf_phone_verified_v1'
const PUBLIC_PATHS = ['/login', '/signup']

export default function PhoneVerificationGate({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [verified, setVerified] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')

  // public path면 게이트 스킵
  const isPublic = PUBLIC_PATHS.some(p => location.pathname.startsWith(p))
  if (verified || isPublic) return <>{children}</>

  return (
    <>
      {/* 뒤에 콘텐츠 렌더 (원본과 동일: children 항상 표시 + 위에 오버레이) */}
      {children}
      <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
        <PhoneVerifyModal onVerified={() => {
          localStorage.setItem(STORAGE_KEY, '1')
          setVerified(true)
        }} />
      </div>
    </>
  )
}

function PhoneVerifyModal({ onVerified }: { onVerified: () => void }) {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [code, setCode] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [sending, setSending] = useState(false)

  const isValidPhone = (v: string) => /^010[-\s]?\d{4}[-\s]?\d{4}$/.test(v.trim())

  const handleSendCode = () => {
    if (!isValidPhone(phone)) {
      setPhoneError('올바른 휴대폰 번호를 입력해 주세요 (010-0000-0000)')
      return
    }
    setPhoneError('')
    setSending(true)
    setTimeout(() => { setSending(false); setStep('code') }, 800)
  }

  const handleVerify = () => {
    if (code.length !== 6) {
      setCodeError('6자리 인증번호를 입력해 주세요')
      return
    }
    setCodeError('')
    onVerified()
  }

  return (
    <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl px-6 py-8 shadow-2xl">
      {/* 헤더 */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-brand-green-bg flex items-center justify-center mb-4">
          <Phone size={26} className="text-brand-green-text" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">전화번호 인증이 필요해요</h2>
        <p className="text-[15px] text-gray-500 break-keep">캠페인 신청을 위해 휴대폰 번호를 인증해 주세요</p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-3">
          <div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="010-0000-0000"
              value={phone}
              onChange={e => { setPhone(e.target.value); setPhoneError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleSendCode() }}
              className={`w-full px-4 py-3 rounded-xl border text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                phoneError ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {phoneError && <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>}
          </div>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending}
            className="w-full py-3.5 rounded-xl bg-brand-green text-white text-[15px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            {sending ? '발송 중...' : '인증번호 발송'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[15px] text-gray-600 text-center break-keep">
            <span className="font-semibold text-gray-900">{phone}</span>으로 인증번호를 발송했어요
          </p>
          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="인증번호 6자리"
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setCodeError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleVerify() }}
              className={`w-full px-4 py-3 rounded-xl border text-[15px] text-center tracking-[0.25em] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                codeError ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {codeError && <p className="text-xs text-red-500 mt-1.5">{codeError}</p>}
          </div>
          <button
            type="button"
            onClick={handleVerify}
            className="w-full py-3.5 rounded-xl bg-brand-green text-white text-[15px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            인증 완료
          </button>
          <button
            type="button"
            onClick={() => { setStep('phone'); setCode(''); setCodeError('') }}
            className="w-full py-2 text-[15px] text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none"
          >
            번호 다시 입력
          </button>
        </div>
      )}
    </div>
  )
}
