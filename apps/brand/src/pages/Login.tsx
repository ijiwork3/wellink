import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, HelpCircle } from 'lucide-react'
import { useQAMode, auth, useToast, TIMER_MS } from '@wellink/ui'
import { CONTACT_EMAIL, HELP_EMAIL } from '../config/urls'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qa = useQAMode()
  const { showToast } = useToast()

  // qa 모드 → 초기값 단일 결정 (useEffect 동기화 불필요)
  const isError   = qa === 'error'
  const isFilled  = qa === 'filled'
  const isLoading = qa === 'loading'

  const [id, setId] = useState(isError ? 'wrong@test.com' : isFilled ? 'admin@wellink.co.kr' : '')
  const [password, setPassword] = useState(isError ? 'pass1234' : isFilled ? 'wellink2026' : '')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(isLoading)
  const [loginError, setLoginError] = useState(isError ? '아이디 또는 비밀번호가 올바르지 않습니다.' : '')

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (loading) return
    setLoading(true)
    setLoginError('')
    try {
      await new Promise(r => setTimeout(r, TIMER_MS.FORM_SUBMIT))
      showToast('로그인되었습니다.', 'success')
      auth.set('brand')
      // 보호 라우트에서 진입한 경우 원래 페이지로 복귀, 아니면 대시보드
      const redirect = searchParams.get('redirect')
      navigate(redirect && redirect.startsWith('/') ? redirect : '/dashboard')
    } catch {
      setLoginError('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.')
      setLoading(false)
    }
  }

  return (
    <div className="@container min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ background: 'var(--gradient-login-bg)' }}>
      {/* 배경 데코 */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20" aria-hidden="true" style={{ background: 'radial-gradient(circle, var(--color-brand-green), transparent)' }} />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-15" aria-hidden="true" style={{ background: 'radial-gradient(circle, var(--color-brand-green), transparent)' }} />

      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 px-4 @sm:px-8 py-5 flex items-center justify-between z-10">
        <button type="button"
          onClick={() => navigate('/')}
          aria-label="홈으로"
          className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
        >
          <span className="text-xl font-bold tracking-tight text-gray-900">WELLINK<span className="text-brand-green">.AI</span></span>
        </button>
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={() => window.open(`mailto:${HELP_EMAIL}`, '_blank')}
            aria-label="도움말 문의"
            className="hidden @sm:inline-flex items-center gap-1 text-[15px] text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <HelpCircle size={14} aria-hidden="true" /> 도움말
          </button>
          <button type="button"
            onClick={() => window.open(`mailto:${CONTACT_EMAIL}`, '_blank')}
            className="text-[15px] bg-brand-green text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
          >
            도입문의
          </button>
        </div>
      </div>

      {/* 로그인 카드 */}
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative z-10"
        aria-label="로그인 폼"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">환영합니다!</h1>
          <p className="text-[15px] text-gray-500 mt-1">
            서비스 이용을 위해 <span className="text-brand-green-text font-medium">로그인해 주세요</span>
          </p>
        </div>

        {/* 폼 */}
        <div className="space-y-3">
          <div>
            <label htmlFor="login-id" className="text-[15px] text-gray-500 mb-1.5 block">광고주 아이디</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-brand-green transition-colors">
              <User size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
              <input
                id="login-id"
                type="email"
                autoComplete="email"
                value={id}
                onChange={e => { setId(e.target.value); setLoginError('') }}
                placeholder="아이디를 입력해주세요"
                aria-describedby={loginError ? 'login-error' : undefined}
                aria-invalid={!!loginError}
                className="flex-1 text-[15px] outline-none rounded bg-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="text-[15px] text-gray-500 mb-1.5 block">비밀번호</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-brand-green transition-colors">
              <Lock size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError('') }}
                placeholder="••••••••"
                maxLength={100}
                aria-describedby={loginError ? 'login-error' : undefined}
                aria-invalid={!!loginError}
                className="flex-1 text-[15px] outline-none rounded bg-transparent text-gray-900 placeholder:text-gray-400"
              />
              <button type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={showPassword}
                className="text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded p-1 -m-1"
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
            {loginError && (
              <p id="login-error" className="mt-1.5 text-[15px] text-red-500" role="alert" aria-live="assertive">{loginError}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="mt-5 w-full py-3 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-150 bg-brand-green text-white hover:bg-brand-green-hover disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          ) : '로그인 →'}
        </button>

        <p className="text-center text-[15px] text-gray-500 mt-4">
          계정이 없으신가요?{' '}
          <button type="button"
            onClick={() => navigate('/signup')}
            className="text-brand-green-text font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
          >
            회원가입
          </button>
        </p>
      </form>

      {/* 모바일 도움말 — @sm 미만에서만 (헤더 도움말 hidden) */}
      <button type="button"
        onClick={() => window.open(`mailto:${HELP_EMAIL}`, '_blank')}
        className="@sm:hidden absolute bottom-6 right-6 w-10 h-10 bg-white text-gray-500 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors border border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        aria-label="도움말 문의"
      >
        <HelpCircle size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
