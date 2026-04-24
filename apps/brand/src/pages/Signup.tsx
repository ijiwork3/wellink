import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQAMode, useToast, INPUT_BASE as inputBase, TIMER_MS } from '@wellink/ui'
import { CONTACT_EMAIL } from '../config/urls'

const FILLED_FORM = {
  name: '김광고',
  email: 'brand@wellink.co.kr',
  password: 'pass1234!',
  passwordConfirm: 'pass1234!',
  companyName: '주식회사 웰링크',
  businessNumber: '123-45-67890',
  phone: '010-1234-5678',
}

export default function Signup() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()

  const initForm = () => {
    if (qa === 'filled' || qa === 'verified') return { ...FILLED_FORM }
    if (qa === 'error') return { ...FILLED_FORM }
    return { name: '', email: '', password: '', passwordConfirm: '', companyName: '', businessNumber: '', phone: '' }
  }

  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState<Record<string, string>>(
    qa === 'error' ? { email: '이미 가입된 이메일입니다.', password: '비밀번호는 8자 이상이어야 해요' } : {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)

  useEffect(() => {
    if (qa === 'filled' || qa === 'verified') {
      setForm({ ...FILLED_FORM })
      setErrors({})
    } else if (qa === 'error') {
      setForm({ ...FILLED_FORM })
      setErrors({ email: '이미 가입된 이메일입니다.', password: '비밀번호는 8자 이상이어야 해요' })
    } else {
      setForm({ name: '', email: '', password: '', passwordConfirm: '', companyName: '', businessNumber: '', phone: '' })
      setErrors({})
    }
  }, [qa])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = '담당자 이름을 입력해 주세요'
    if (!form.email.trim()) e.email = '이메일을 입력해 주세요'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = '올바른 이메일 형식이 아니에요'
    if (!form.password) e.password = '비밀번호를 입력해 주세요'
    else if (form.password.length < 8 || !/\d/.test(form.password) || !/[a-zA-Z]/.test(form.password)) e.password = '비밀번호는 8자 이상, 영문+숫자 조합이어야 해요.'
    if (!form.passwordConfirm) e.passwordConfirm = '비밀번호 확인을 입력해 주세요'
    else if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않아요'
    if (!form.companyName.trim()) e.companyName = '회사명을 입력해 주세요'
    return e
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) { showToast('입력 정보를 확인해 주세요', 'error'); return }
    setIsSubmitting(true)
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, TIMER_MS.MOCK_SIGNUP))
      showToast('웰링크에 오신 것을 환영합니다 🎉', 'success')
      navigate('/dashboard')
    } catch {
      showToast('가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--gradient-auth-bg)' }}
    >
      {/* 도입문의 버튼 */}
      <div className="fixed top-4 right-4 z-10">
        <button
          type="button"
          onClick={() => window.open(`mailto:${CONTACT_EMAIL}`)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-white shadow-sm hover:shadow-md transition-all duration-150 text-brand-green"
        >
          도입문의
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* 로고 */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-black text-brand-green">WELLINK</h1>
            <span className="text-xs font-medium bg-brand-green text-white px-1.5 py-0.5 rounded-full leading-none">AI</span>
          </div>
          <p className="text-sm text-gray-500">광고주 포털 회원가입</p>
        </div>

        <div className="space-y-3.5">
          {/* 담당자 이름 */}
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1.5">담당자 이름 <span className="text-red-400">*</span></label>
            <input
              id="signup-name" type="text" autoComplete="name" placeholder="실명을 입력해 주세요"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-describedby={errors.name ? 'signup-name-error' : undefined}
              aria-invalid={!!errors.name}
              className={`${inputBase} ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.name && <p id="signup-name-error" className="text-xs text-red-500 mt-1" role="alert">{errors.name}</p>}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">이메일 <span className="text-red-400">*</span></label>
            <input
              id="signup-email" type="email" autoComplete="email" placeholder="example@company.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
              aria-invalid={!!errors.email}
              className={`${inputBase} ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.email && <p id="signup-email-error" className="text-xs text-red-500 mt-1" role="alert">{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 <span className="text-red-400">*</span></label>
            <input
              id="signup-password" type="password" autoComplete="new-password" placeholder="8자 이상 입력해 주세요"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
              aria-invalid={!!errors.password}
              className={`${inputBase} ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.password && <p id="signup-password-error" className="text-xs text-red-500 mt-1" role="alert">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="signup-password-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 확인 <span className="text-red-400">*</span></label>
            <input
              id="signup-password-confirm" type="password" autoComplete="new-password" placeholder="비밀번호를 다시 입력해 주세요"
              value={form.passwordConfirm}
              onChange={(e) => {
                const val = e.target.value
                setForm({ ...form, passwordConfirm: val })
                if (val && form.password !== val) {
                  setErrors(prev => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않아요' }))
                } else {
                  setErrors(prev => { const { passwordConfirm: _, ...rest } = prev; return rest })
                }
              }}
              aria-describedby={errors.passwordConfirm ? 'signup-password-confirm-error' : undefined}
              aria-invalid={!!errors.passwordConfirm}
              className={`${inputBase} ${errors.passwordConfirm ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.passwordConfirm && <p id="signup-password-confirm-error" className="text-xs text-red-500 mt-1" role="alert">{errors.passwordConfirm}</p>}
          </div>

          {/* 회사명 */}
          <div>
            <label htmlFor="signup-company" className="block text-sm font-medium text-gray-700 mb-1.5">회사명 <span className="text-red-400">*</span></label>
            <input
              id="signup-company" type="text" placeholder="회사명을 입력해 주세요"
              value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              aria-describedby={errors.companyName ? 'signup-company-error' : undefined}
              aria-invalid={!!errors.companyName}
              className={`${inputBase} ${errors.companyName ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.companyName && <p id="signup-company-error" className="text-xs text-red-500 mt-1" role="alert">{errors.companyName}</p>}
          </div>

          {/* 사업자 등록번호 */}
          <div>
            <label htmlFor="signup-biz" className="block text-sm font-medium text-gray-700 mb-1.5">사업자 등록번호</label>
            <input
              id="signup-biz" type="text" placeholder="000-00-00000"
              value={form.businessNumber} onChange={(e) => setForm({ ...form, businessNumber: e.target.value })}
              maxLength={12}
              inputMode="numeric"
              className={`${inputBase} border-gray-200`}
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-1.5">전화번호</label>
            <input
              id="signup-phone" type="tel" autoComplete="tel" placeholder="010-0000-0000"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`${inputBase} border-gray-200`}
            />
          </div>

          {/* 약관 동의 */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-brand-green cursor-pointer"
              />
              <span className="text-sm text-gray-600">
                <button type="button" onClick={() => showToast('서비스 준비 중입니다.', 'info')} className="underline text-gray-700 hover:text-brand-green transition-colors">서비스 이용약관</button>
                {' '}동의{' '}
                <span className="text-red-400 text-xs">(필수)</span>
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={e => setAgreedPrivacy(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-brand-green cursor-pointer"
              />
              <span className="text-sm text-gray-600">
                <button type="button" onClick={() => showToast('서비스 준비 중입니다.', 'info')} className="underline text-gray-700 hover:text-brand-green transition-colors">개인정보처리방침</button>
                {' '}동의{' '}
                <span className="text-red-400 text-xs">(필수)</span>
              </span>
            </label>
          </div>

          {/* 가입 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !agreedTerms || !agreedPrivacy}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 mt-1 disabled:opacity-60 disabled:cursor-not-allowed bg-brand-green"
          >
            {isSubmitting ? '처리 중...' : '회원가입'}
          </button>

          {/* 로그인 링크 */}
          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium hover:underline transition-colors duration-150 text-brand-green"
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}
