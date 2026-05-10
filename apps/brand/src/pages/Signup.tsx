import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useQAMode, useToast, INPUT_BASE as inputBase, TIMER_MS, CustomCheckbox } from '@wellink/ui'
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

const EMPTY_FORM = { name: '', email: '', password: '', passwordConfirm: '', companyName: '', businessNumber: '', phone: '' }
const ERROR_INITIAL = { email: '이미 가입된 이메일입니다.', password: '비밀번호는 8자 이상이어야 해요' }

type FormShape = typeof EMPTY_FORM
type FieldKey = keyof FormShape

export default function Signup() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()

  // qa 모드 → 초기값 (useEffect 동기화 불필요)
  const isFilled = qa === 'filled' || qa === 'verified'
  const isError  = qa === 'error'

  const [form, setForm] = useState<FormShape>(isFilled || isError ? { ...FILLED_FORM } : EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>(isError ? { ...ERROR_INITIAL } : {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)

  const setField = <K extends FieldKey>(key: K, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => { const { [key]: _omit, ...rest } = prev; return rest })
  }

  const validate = (): Partial<Record<FieldKey, string>> => {
    const e: Partial<Record<FieldKey, string>> = {}
    if (!form.name.trim()) e.name = '담당자 이름을 입력해 주세요'
    if (!form.email.trim()) e.email = '이메일을 입력해 주세요'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = '올바른 이메일 형식이 아니에요'
    if (!form.password) e.password = '비밀번호를 입력해 주세요'
    else if (form.password.length < 8 || !/\d/.test(form.password) || !/[a-zA-Z]/.test(form.password))
      e.password = '비밀번호는 8자 이상, 영문+숫자 조합이어야 해요'
    if (!form.passwordConfirm) e.passwordConfirm = '비밀번호 확인을 입력해 주세요'
    else if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않아요'
    if (!form.companyName.trim()) e.companyName = '회사명을 입력해 주세요'
    return e
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      showToast('입력 정보를 확인해 주세요', 'error')
      return
    }
    if (!agreedTerms || !agreedPrivacy) {
      showToast('필수 약관에 동의해 주세요', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await new Promise<void>(resolve => setTimeout(resolve, TIMER_MS.MOCK_SIGNUP))
      showToast('웰링크에 오신 것을 환영합니다 🎉', 'success')
      navigate('/dashboard')
    } catch {
      showToast('가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error')
      setIsSubmitting(false)
    }
  }

  const inputCls = (key: FieldKey) =>
    `${inputBase} ${errors[key] ? 'border-red-400' : 'border-gray-200'}`

  const errorId = (key: FieldKey) => `signup-${key}-error`

  const renderError = (key: FieldKey) => errors[key] && (
    <p id={errorId(key)} className="text-sm text-red-500 mt-1" role="alert">{errors[key]}</p>
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--gradient-auth-bg)' }}
    >
      {/* 도입문의 */}
      <div className="fixed top-4 right-4 z-10">
        <button
          type="button"
          onClick={() => window.open(`mailto:${CONTACT_EMAIL}`)}
          className="px-4 py-2 rounded-xl text-base font-medium bg-white shadow-sm hover:shadow-md transition-all duration-150 text-brand-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
        >
          도입문의
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        aria-label="회원가입 폼"
        noValidate
      >
        {/* 로고 */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-3xl font-black text-brand-green-text">WELLINK</h1>
            <span className="text-sm font-medium bg-brand-green text-white px-2 py-1 rounded-full leading-none">AI</span>
          </div>
          <p className="text-base text-gray-500">광고주 포털 회원가입</p>
        </div>

        <div className="space-y-3.5">
          {/* 담당자 이름 */}
          <div>
            <label htmlFor="signup-name" className="block text-base font-medium text-gray-700 mb-1.5">
              담당자 이름 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-name" type="text" autoComplete="name" placeholder="실명을 입력해 주세요"
              value={form.name} onChange={e => setField('name', e.target.value)}
              aria-describedby={errors.name ? errorId('name') : undefined}
              aria-invalid={!!errors.name}
              aria-required="true"
              className={inputCls('name')}
            />
            {renderError('name')}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="signup-email" className="block text-base font-medium text-gray-700 mb-1.5">
              이메일 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-email" type="email" autoComplete="email" placeholder="example@company.com"
              value={form.email} onChange={e => setField('email', e.target.value)}
              aria-describedby={errors.email ? errorId('email') : undefined}
              aria-invalid={!!errors.email}
              aria-required="true"
              className={inputCls('email')}
            />
            {renderError('email')}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="signup-password" className="block text-base font-medium text-gray-700 mb-1.5">
              비밀번호 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                placeholder="8자 이상, 영문+숫자 조합"
                value={form.password} onChange={e => setField('password', e.target.value)}
                aria-describedby={errors.password ? errorId('password') : 'signup-password-hint'}
                aria-invalid={!!errors.password}
                aria-required="true"
                className={`${inputCls('password')} pr-10`}
              />
              <button
                type="button" onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded p-1"
              >
                {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
            </div>
            {!errors.password && (
              <p id="signup-password-hint" className="text-sm text-gray-400 mt-1">8자 이상, 영문과 숫자를 모두 포함해 주세요</p>
            )}
            {renderError('password')}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="signup-password-confirm" className="block text-base font-medium text-gray-700 mb-1.5">
              비밀번호 확인 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="signup-password-confirm" type={showPasswordConfirm ? 'text' : 'password'} autoComplete="new-password"
                placeholder="비밀번호를 다시 입력해 주세요"
                value={form.passwordConfirm}
                onChange={e => {
                  const val = e.target.value
                  setForm(prev => ({ ...prev, passwordConfirm: val }))
                  // 즉시 일치 검증 — 입력 직후 피드백
                  if (val && form.password !== val) {
                    setErrors(prev => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않아요' }))
                  } else {
                    setErrors(prev => { const { passwordConfirm: _o, ...rest } = prev; return rest })
                  }
                }}
                aria-describedby={errors.passwordConfirm ? errorId('passwordConfirm') : undefined}
                aria-invalid={!!errors.passwordConfirm}
                aria-required="true"
                className={`${inputCls('passwordConfirm')} pr-10`}
              />
              <button
                type="button" onClick={() => setShowPasswordConfirm(v => !v)}
                aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={showPasswordConfirm}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded p-1"
              >
                {showPasswordConfirm ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
            </div>
            {renderError('passwordConfirm')}
          </div>

          {/* 회사명 */}
          <div>
            <label htmlFor="signup-company" className="block text-base font-medium text-gray-700 mb-1.5">
              회사명 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-company" type="text" placeholder="회사명을 입력해 주세요"
              value={form.companyName} onChange={e => setField('companyName', e.target.value)}
              aria-describedby={errors.companyName ? errorId('companyName') : undefined}
              aria-invalid={!!errors.companyName}
              aria-required="true"
              className={inputCls('companyName')}
            />
            {renderError('companyName')}
          </div>

          {/* 사업자 등록번호 */}
          <div>
            <label htmlFor="signup-biz" className="block text-base font-medium text-gray-700 mb-1.5">사업자 등록번호</label>
            <input
              id="signup-biz" type="text" placeholder="000-00-00000"
              value={form.businessNumber} onChange={e => setField('businessNumber', e.target.value)}
              maxLength={12}
              inputMode="numeric"
              className={`${inputBase} border-gray-200`}
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="signup-phone" className="block text-base font-medium text-gray-700 mb-1.5">전화번호</label>
            <input
              id="signup-phone" type="tel" autoComplete="tel" placeholder="010-0000-0000"
              value={form.phone} onChange={e => setField('phone', e.target.value)}
              className={`${inputBase} border-gray-200`}
            />
          </div>

          {/* 약관 동의 — 공통 CustomCheckbox */}
          <div className="space-y-2 pt-1">
            <CustomCheckbox
              checked={agreedTerms}
              onChange={() => setAgreedTerms(v => !v)}
              labelClassName="text-base"
              ariaLabel="서비스 이용약관 동의 (필수)"
              label={
                <span>
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={ev => { ev.stopPropagation(); showToast('서비스 준비 중입니다.', 'info') }}
                    onKeyDown={ev => { if (ev.key === 'Enter') { ev.stopPropagation(); showToast('서비스 준비 중입니다.', 'info') } }}
                    className="underline text-gray-700 hover:text-brand-green-text transition-colors cursor-pointer"
                  >서비스 이용약관</span>
                  {' 동의 '}
                  <span className="text-red-500 text-sm">(필수)</span>
                </span>
              }
            />
            <CustomCheckbox
              checked={agreedPrivacy}
              onChange={() => setAgreedPrivacy(v => !v)}
              labelClassName="text-base"
              ariaLabel="개인정보처리방침 동의 (필수)"
              label={
                <span>
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={ev => { ev.stopPropagation(); showToast('서비스 준비 중입니다.', 'info') }}
                    onKeyDown={ev => { if (ev.key === 'Enter') { ev.stopPropagation(); showToast('서비스 준비 중입니다.', 'info') } }}
                    className="underline text-gray-700 hover:text-brand-green-text transition-colors cursor-pointer"
                  >개인정보처리방침</span>
                  {' 동의 '}
                  <span className="text-red-500 text-sm">(필수)</span>
                </span>
              }
            />
          </div>

          {/* 가입 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || !agreedTerms || !agreedPrivacy}
            aria-busy={isSubmitting}
            className="w-full py-3 rounded-xl text-base font-semibold text-white transition-all duration-150 hover:bg-brand-green-hover mt-1 disabled:opacity-60 disabled:cursor-not-allowed bg-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            {isSubmitting ? '처리 중...' : '회원가입'}
          </button>

          {/* 로그인 링크 */}
          <p className="text-center text-base text-gray-500">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium hover:underline transition-colors duration-150 text-brand-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >
              로그인하기
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
