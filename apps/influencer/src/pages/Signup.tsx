import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { CustomCheckbox } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'

const activityFields = ['피트니스', '요가', '영양·식단', '뷰티', '라이프스타일', '스포츠', '아웃도어', '멘탈헬스']

const inputBase =
  'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150'

const FILLED_FORM = {
  name: '김인플루', email: 'influencer@wellink.co.kr', password: 'pass1234!',
  passwordConfirm: 'pass1234!', phone: '010-1234-5678', instagram: '@wellink_official',
}

export default function Signup() {
  const navigate = useNavigate()
  const qa = useQAMode()

  const initForm = () => {
    if (qa === 'filled' || qa === 'verified') return { ...FILLED_FORM }
    if (qa === 'error') return { ...FILLED_FORM }
    return { name: '', email: '', password: '', passwordConfirm: '', phone: '', instagram: '' }
  }

  const [form, setForm] = useState(initForm)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>(
    qa === 'error' ? { email: '이미 가입된 이메일입니다.', password: '비밀번호는 8자 이상이어야 해요' } : {}
  )
  const [phoneVerified, setPhoneVerified] = useState(qa === 'verified')
  const [instaVerified, setInstaVerified] = useState(qa === 'verified')
  const [toast, setToast] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (qa === 'filled') {
      setForm({ ...FILLED_FORM })
      setErrors({})
      setPhoneVerified(false)
      setInstaVerified(false)
    } else if (qa === 'verified') {
      setForm({ ...FILLED_FORM })
      setErrors({})
      setPhoneVerified(true)
      setInstaVerified(true)
    } else if (qa === 'error') {
      setForm({ ...FILLED_FORM })
      setErrors({ email: '이미 가입된 이메일입니다.', password: '비밀번호는 8자 이상이어야 해요' })
      setPhoneVerified(false)
      setInstaVerified(false)
    } else {
      setForm({ name: '', email: '', password: '', passwordConfirm: '', phone: '', instagram: '' })
      setErrors({})
      setPhoneVerified(false)
      setInstaVerified(false)
    }
  }, [qa])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = '이름을 입력해 주세요'
    if (!form.email.trim()) e.email = '이메일을 입력해 주세요'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = '올바른 이메일 형식이 아니에요'
    if (!form.password) e.password = '비밀번호를 입력해 주세요'
    else if (form.password.length < 8) e.password = '비밀번호는 8자 이상이어야 해요'
    if (!form.passwordConfirm) e.passwordConfirm = '비밀번호 확인을 입력해 주세요'
    else if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않아요'
    return e
  }

  const handleSubmit = () => {
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) { showToast('입력 정보를 확인해 주세요'); return }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/home')
    }, 800)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, rgba(140,198,63,0.15) 0%, #ffffff 70%)' }}
    >
      {/* 도입문의 버튼 */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={() => window.open('mailto:contact@wellink.co.kr')}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-white shadow-sm hover:shadow-md transition-all duration-150"
          style={{ color: '#8CC63F' }}
        >
          도입문의
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* 로고 */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-black" style={{ color: '#8CC63F' }}>WELLINK AI</h1>
          <p className="text-sm text-gray-500 mt-1">인플루언서 포털 회원가입</p>
        </div>

        <div className="space-y-3.5">
          {/* 이름 */}
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1.5">이름 <span className="text-red-400">*</span></label>
            <input
              id="signup-name"
              type="text"
              placeholder="실명을 입력해 주세요"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`${inputBase} ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">이메일 <span className="text-red-400">*</span></label>
            <input
              id="signup-email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`${inputBase} ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 <span className="text-red-400">*</span></label>
            <input
              id="signup-password"
              type="password"
              placeholder="8자 이상 입력해 주세요"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${inputBase} ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="signup-password-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 확인 <span className="text-red-400">*</span></label>
            <input
              id="signup-password-confirm"
              type="password"
              placeholder="비밀번호를 다시 입력해 주세요"
              value={form.passwordConfirm}
              onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
              className={`${inputBase} ${errors.passwordConfirm ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.passwordConfirm && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm}</p>}
          </div>

          {/* 전화번호 — 인증하기 인라인 */}
          <div>
            <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-1.5">전화번호</label>
            <div className="flex gap-2">
              <input
                id="signup-phone"
                type="tel"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`${inputBase} flex-1 border-gray-200`}
              />
              <button
                onClick={() => {
                  if (!form.phone) { showToast('전화번호를 입력해 주세요'); return }
                  if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(form.phone)) { showToast('전화번호 형식을 확인해 주세요 (예: 010-1234-5678)'); return }
                  setPhoneVerified(true)
                  showToast('인증번호가 발송됐어요')
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  phoneVerified ? 'bg-[#8CC63F]/10 text-[#5a8228]' : 'text-white hover:opacity-90'
                }`}
                style={!phoneVerified ? { backgroundColor: '#8CC63F' } : {}}
              >
                {phoneVerified && <CheckCircle2 size={13} />}
                {phoneVerified ? '인증완료' : '인증하기'}
              </button>
            </div>
          </div>

          {/* 인스타그램 — 인증하기 인라인 */}
          <div>
            <label htmlFor="signup-instagram" className="block text-sm font-medium text-gray-700 mb-1.5">인스타그램 아이디</label>
            <div className="flex gap-2">
              <input
                id="signup-instagram"
                type="text"
                placeholder="@아이디"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className={`${inputBase} flex-1 border-gray-200`}
              />
              <button
                onClick={() => {
                  if (!form.instagram) { showToast('인스타그램 아이디를 입력해 주세요'); return }
                  const handle = form.instagram.replace(/^@/, '')
                  if (!/^[a-zA-Z0-9_.]{1,30}$/.test(handle)) { showToast('올바른 인스타그램 아이디를 입력해 주세요'); return }
                  setInstaVerified(true)
                  showToast('인스타그램 연동이 완료됐어요')
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  instaVerified ? 'bg-[#8CC63F]/10 text-[#5a8228]' : 'text-white hover:opacity-90'
                }`}
                style={!instaVerified ? { backgroundColor: '#8CC63F' } : {}}
              >
                {instaVerified && <CheckCircle2 size={13} />}
                {instaVerified ? '인증완료' : '인증하기'}
              </button>
            </div>
          </div>

          {/* 활동 분야 — CustomCheckbox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2.5">활동 분야</label>
            <div className="grid grid-cols-2 @sm:grid-cols-4 gap-2.5">
              {activityFields.map((field) => (
                <CustomCheckbox
                  key={field}
                  checked={selectedFields.has(field)}
                  onChange={() => toggleField(field)}
                  label={field}
                />
              ))}
            </div>
          </div>

          {/* 가입 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#8CC63F' }}
          >
            {isSubmitting ? '처리 중...' : '회원 인증 후 가입하기'}
          </button>

          {/* 로그인 링크 */}
          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => window.location.href = `${import.meta.env.VITE_BRAND_URL || 'http://localhost:3003'}/login`}
              className="font-medium hover:underline transition-colors duration-150"
              style={{ color: '#8CC63F' }}
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>

      {/* 토스트 */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 bg-white border border-[#8CC63F]/30 rounded-xl px-4 py-3 shadow-lg min-w-[260px]"
          style={{ animation: 'slideInRight 0.2s ease-out' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900">{toast}</span>
        </div>
      )}
    </div>
  )
}
