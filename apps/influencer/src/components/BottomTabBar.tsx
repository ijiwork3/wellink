import { useLocation, useNavigate } from 'react-router-dom'
import { Search, ClipboardList, Heart, Instagram, User } from 'lucide-react'

const tabs = [
  { label: '탐색',      path: '/campaigns/browse',   icon: Search },
  { label: '내 캠페인',  path: '/campaigns/my',        icon: ClipboardList },
  { label: '관심',      path: '/campaigns/favorites', icon: Heart },
  { label: '인스타',    path: '/media',               icon: Instagram },
  { label: '내 정보',   path: '/profile',             icon: User },
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
            type="button"
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset ${
              isActive ? 'text-brand-green-text' : 'text-gray-500'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
            <span className="text-xs font-medium leading-none whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
