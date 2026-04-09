import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import CustomCheckbox from '../components/CustomCheckbox'

const activityFields = ['헬스', '필라테스', '요가', '크로스핏', '수영', '스포츠', '기타', '아웃도어']

const inputBase =
  'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', passwordConfirm: '', phone: '', instagram: '',
  })
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [instaVerified, setInstaVerified] = useState(false)
  const [toast, setToast] = useState('')

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
    navigate('/home')
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
                  setPhoneVerified(true)
                  showToast('인증번호가 발송되었습니다')
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  phoneVerified ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'
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
                  setInstaVerified(true)
                  showToast('인스타그램 연동이 완료되었습니다')
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  instaVerified ? 'bg-green-50 text-green-700' : 'text-white hover:opacity-90'
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
            <div className="grid grid-cols-2 gap-2.5">
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
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 mt-1"
            style={{ backgroundColor: '#8CC63F' }}
          >
            회원 인증 후 가입하기
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
          className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 bg-white border border-green-200 rounded-xl px-4 py-3 shadow-lg min-w-[260px]"
          style={{ animation: 'slideInRight 0.2s ease-out' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900">{toast}</span>
        </div>
      )}
    </div>
  )
}
