import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Mail } from 'lucide-react'
import { useQAMode } from '@wellink/ui'

export default function Login() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const [id, setId] = useState(
    qa === 'error' ? 'wrong@test.com' : qa === 'filled' ? 'test@wellink.co.kr' : ''
  )
  const [password, setPassword] = useState(
    qa === 'error' || qa === 'filled' ? 'pass1234' : ''
  )
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(qa === 'loading')
  const [error, setError] = useState(
    qa === 'error' ? '아이디 또는 비밀번호가 올바르지 않습니다.' : ''
  )

  useEffect(() => {
    if (qa === 'error') {
      setId('wrong@test.com')
      setPassword('pass1234')
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
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
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    if (id !== 'test@wellink.co.kr') {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    navigate('/campaigns/browse')
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-[#f0f9e8] to-white p-4">
      {/* 로고 */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/campaigns/browse')} className="flex items-center gap-1.5">
          <span className="text-base font-bold tracking-tight" style={{ color: '#8CC63F' }}>WELLINK AI</span>
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="text-sm px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-150"
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
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이메일"
              aria-label="이메일"
              value={id}
              onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/20 focus:border-[#8CC63F] transition-all"
            />
          </div>

          {/* 비밀번호 */}
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              aria-label="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/20 focus:border-[#8CC63F] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!id.trim() || !password.trim() || loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 hover:opacity-90"
            style={{ backgroundColor: '#8CC63F' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          계정이 없으신가요?{' '}
          <button onClick={() => navigate('/signup')} className="text-[#8CC63F] hover:underline">회원가입</button>
        </p>
      </div>
    </div>
  )
}
