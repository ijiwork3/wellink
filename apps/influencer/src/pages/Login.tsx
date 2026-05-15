import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Mail } from 'lucide-react'
import { useQAMode, auth, TIMER_MS } from '@wellink/ui'

export default function Login() {
  const navigate = useNavigate()
  const qa = useQAMode()
  // 초기값은 useEffect에서 qa에 따라 동기화한다. lazy init과 useEffect의 분기 중복을 막기 위해 빈 값으로 시작.
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // unmount 후 setState 호출 방지 (await new Promise 패턴)
  const isMountedRef = useRef(true)
  useEffect(() => () => { isMountedRef.current = false }, [])

  // QA 파라미터 외부 동기화 (정책 §외부동기화)
  useEffect(() => {
    if (qa === 'error') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setId('wrong@test.com')
      setPassword('pass1234')
      setError('아이디 또는 비밀번호를 다시 확인해 주세요')
      setLoading(false)
    } else if (qa === 'filled') {
      setId('test@wellink.co.kr')
      setPassword('pass1234')
      setError('')
      setLoading(false)
    } else if (qa === 'loading') {
      setId('')
      setPassword('')
      setError('')
      setLoading(true)
    } else {
      setId('')
      setPassword('')
      setError('')
      setLoading(false)
    }
  }, [qa])

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, TIMER_MS.MOCK_LOGIN))
    if (!isMountedRef.current) return
    setLoading(false)
    if (id !== 'test@wellink.co.kr') {
      setError('아이디 또는 비밀번호를 다시 확인해 주세요')
      return
    }
    auth.set('influencer')
    navigate('/home')
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-brand-green-bg to-white p-4">
      {/* 로고 */}
      <div className="fixed top-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-10">
        <span className="text-base font-bold tracking-tight text-brand-green-text">WELLINK AI</span>
        <button
          onClick={() => navigate('/signup')}
          className="text-sm px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          회원가입
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">로그인</h1>
          <p className="text-sm text-gray-500 mt-1">인플루언서 포털에 오신 걸 환영해요</p>
        </div>

        <div className="space-y-4">
          {/* 아이디 */}
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="이메일"
              aria-label="이메일"
              value={id}
              onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green transition-all"
            />
          </div>

          {/* 비밀번호 */}
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="비밀번호"
              aria-label="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green transition-all"
            />
            <button
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-500" role="alert" aria-live="polite">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!id.trim() || !password.trim() || loading}
            aria-disabled={!id.trim() || !password.trim() || loading}
            aria-busy={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-green transition-all duration-150 disabled:opacity-40 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          계정이 없으신가요?{' '}
          <button onClick={() => navigate('/signup')} className="text-brand-green-text rounded-md transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">회원가입</button>
        </p>
      </div>
    </div>
  )
}
