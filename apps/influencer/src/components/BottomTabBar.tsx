import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, LayoutDashboard, Heart, UserCircle, Link2 } from 'lucide-react'
import { useDeviceMode } from '../qa-mockup-kit'

const tabs = [
  { label: '탐색',     path: '/campaigns/browse', icon: Compass },
  { label: '내 캠페인', path: '/campaigns/my',     icon: LayoutDashboard },
  { label: '관심',     path: '/home',              icon: Heart },
  { label: '프로필',   path: '/profile',           icon: UserCircle },
  { label: '미디어',   path: '/media',             icon: Link2 },
]

export default function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const device = useDeviceMode()

  if (device !== 'phone') return null

  return (
    <nav className="flex-shrink-0 flex items-center border-t border-gray-100 bg-white h-14 px-1">
      {tabs.map(({ label, path, icon: Icon }) => {
        const isActive = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors"
          >
            <Icon
              size={20}
              className={isActive ? '' : 'text-gray-400'}
              style={isActive ? { color: BRAND.green } : undefined}
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
