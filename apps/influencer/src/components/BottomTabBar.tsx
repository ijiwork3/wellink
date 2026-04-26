import { useLocation, useNavigate } from 'react-router-dom'
import { Search, ClipboardList, Heart, User } from 'lucide-react'

const tabs = [
  { label: '탐색',    path: '/campaigns/browse', icon: Search },
  { label: '내 캠페인', path: '/campaigns/my',     icon: ClipboardList },
  { label: '관심',    path: '/campaigns/favorites', icon: Heart },
  { label: '마이페이지', path: '/profile',          icon: User },
]

export default function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center bg-white border-t border-gray-100"
      style={{ height: 'calc(3.5rem + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ label, path, icon: Icon }) => {
        const isActive = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              isActive ? 'text-brand-green' : 'text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
