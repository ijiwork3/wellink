import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Mail } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    if (id !== 'test') {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-4">
      {/* 로고 */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold tracking-tight text-gray-900">WELLINK</span>
          <span className="text-[10px] font-medium bg-[#6366f1] text-white px-1.5 py-0.5 rounded-full leading-none">브랜드</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">광고주 로그인</h1>
          <p className="text-sm text-gray-500 mt-1">WELLINK 브랜드 포털에 오신 걸 환영해요</p>
        </div>

        <div className="space-y-4">
          {/* 아이디 */}
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="아이디 (이메일)"
              value={id}
              onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* 비밀번호 */}
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!id.trim() || !password.trim() || loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40"
            style={{ backgroundColor: '#6366f1' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          계정이 없으신가요?{' '}
          <a href="mailto:contact@wellink.co.kr" className="text-indigo-500 hover:underline">도입 문의</a>
        </p>
      </div>
    </div>
  )
}
