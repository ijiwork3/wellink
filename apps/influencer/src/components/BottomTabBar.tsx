import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, LayoutDashboard, Bookmark, UserCircle } from 'lucide-react'
import { useDeviceMode } from '../qa-mockup-kit'

const tabs = [
  { label: '탐색',      path: '/campaigns/browse',    icon: Compass },
  { label: '나의 캠페인', path: '/campaigns/my',        icon: LayoutDashboard },
  { label: '관심 캠페인', path: '/campaigns/bookmarks', icon: Bookmark },
  { label: '마이페이지',  path: '/profile',             icon: UserCircle },
]

export default function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const device = useDeviceMode()

  if (device !== 'phone') return null

  return (
    <nav
      className="flex-shrink-0 flex items-center border-t border-gray-100 bg-white px-1"
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
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors"
          >
            <Icon
              size={20}
              className={isActive ? 'text-brand-green' : 'text-gray-400'}
            />
            <span
              className={`text-[10px] font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
