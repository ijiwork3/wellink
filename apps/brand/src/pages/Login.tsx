import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { useQAMode } from '@wellink/ui'
import { useToast } from '@wellink/ui'

type UserType = '인플루언서' | '광고주'

export default function Login() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { showToast } = useToast()
  const [userType, setUserType] = useState<UserType>('인플루언서')
  const [id, setId] = useState(qa === 'error' ? 'wrong@test.com' : qa === 'filled' ? 'admin@wellink.co.kr' : '')
  const [password, setPassword] = useState(qa === 'error' ? 'pass1234' : qa === 'filled' ? 'wellink2026' : '')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(qa === 'loading')
  const [loginError, setLoginError] = useState(qa === 'error' ? '아이디 또는 비밀번호가 올바르지 않습니다.' : '')

  useEffect(() => {
    if (qa === 'error') {
      setId('wrong@test.com')
      setPassword('pass1234')
      setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
    } else if (qa === 'filled') {
      setId('admin@wellink.co.kr')
      setPassword('wellink2026')
      setLoginError('')
      setLoading(false)
    } else if (qa === 'loading') {
      setLoading(true)
    }
  }, [qa])

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) return
    setLoading(true)
    setLoginError('')
    // Simulate login
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    if (!['test', 'admin@wellink.co.kr'].includes(id)) {
      setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    showToast('로그인되었습니다.', 'success')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background: 'linear-gradient(135deg, #f0f9e8 0%, #e8f5d8 30%, #d4edba 60%, #c8e8a8 100%)'}}>
      {/* Subtle green blobs */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20" style={{background: 'radial-gradient(circle, #8CC63F, transparent)'}} />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-15" style={{background: 'radial-gradient(circle, #8CC63F, transparent)'}} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-8 py-5 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5">
          <span className="text-lg font-bold tracking-tight text-gray-900">WELLINK</span>
          <span className="text-[10px] font-bold bg-[#8CC63F] text-white px-1.5 py-0.5 rounded-full">AI</span>
        </button>
        <button
          onClick={() => window.open('mailto:contact@wellink.co.kr', '_blank')}
          className="text-sm bg-[#8CC63F] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#7AB535] transition-colors"
        >
          도입문의
        </button>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">환영합니다!</h1>
          <p className="text-sm text-gray-500 mt-1">
            서비스 이용을 위해 <span className="text-[#8CC63F] font-medium">로그인해 주세요</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl border border-gray-200 p-1 mb-6 gap-1">
          {(['인플루언서', '광고주'] as UserType[]).map(type => (
            <button
              key={type}
              onClick={() => { setUserType(type); setLoginError('') }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                userType === type
                  ? 'bg-[#8CC63F] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={13} />
              {type}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label htmlFor="login-id" className="text-xs text-gray-500 mb-1.5 block">{userType} 아이디</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#8CC63F] transition-colors">
              <User size={15} className="text-gray-400 shrink-0" />
              <input
                id="login-id"
                type="email"
                value={id}
                onChange={e => { setId(e.target.value); setLoginError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="아이디를 입력해주세요"
                className="flex-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#8CC63F] rounded bg-transparent text-gray-900 placeholder:text-gray-300"
              />
            </div>
          </div>
          <div>
            <label htmlFor="login-password" className="text-xs text-gray-500 mb-1.5 block">비밀번호</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#8CC63F] transition-colors">
              <Lock size={15} className="text-gray-400 shrink-0" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                maxLength={100}
                className="flex-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#8CC63F] rounded bg-transparent text-gray-900 placeholder:text-gray-300"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {loginError && (
              <p className="mt-1.5 text-xs text-red-500">{loginError}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!id.trim() || !password.trim() || loading}
          className={`mt-5 w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 ${
            id && password && !loading
              ? 'bg-[#8CC63F] text-white hover:bg-[#7AB535]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>로그인 →</>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          계정이 없으신가요?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[#8CC63F] font-medium hover:underline"
          >
            회원가입
          </button>
        </p>
      </div>

      {/* Help button */}
      <button
        onClick={() => window.open('mailto:help@wellink.co.kr', '_blank')}
        className="absolute bottom-6 right-6 w-10 h-10 bg-[#8CC63F] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#7AB535] transition-colors text-sm font-bold"
        aria-label="도움말 문의"
      >
        ?
      </button>
    </div>
  )
}
