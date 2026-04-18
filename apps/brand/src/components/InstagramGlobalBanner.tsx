import { useNavigate } from 'react-router-dom'
import { useInstagramConnected } from '../utils/useInstagramState'

export default function InstagramGlobalBanner() {
  const connected = useInstagramConnected()
  const navigate = useNavigate()

  if (connected) return null

  return (
    <div className="bg-gradient-to-r from-amber-50 to-pink-50 border-b border-amber-200">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none" />
          </svg>
        </div>
        <p className="text-sm text-gray-800 flex-1 min-w-0">
          <span className="font-semibold">Instagram 비즈니스 계정이 연결되지 않았습니다.</span>
          <span className="text-gray-600 ml-1.5 hidden sm:inline">분석·성과 기능을 사용하려면 연결이 필요해요.</span>
        </p>
        <button
          onClick={() => navigate('/profile-insight')}
          className="text-xs sm:text-sm font-semibold text-white px-3 sm:px-4 py-1.5 rounded-lg transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
        >
          연결하기
        </button>
      </div>
    </div>
  )
}
