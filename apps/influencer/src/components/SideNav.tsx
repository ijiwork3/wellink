import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Heart, UserCircle, Link2, Search, Wallet, Bell } from 'lucide-react'
import { useUnreadCount } from '../services/notifications'

const browseItem = { label: '캠페인 탐색', path: '/campaigns/browse', icon: Search }

const sections = [
  {
    title: '활동 관리',
    items: [
      { label: '내 캠페인', path: '/campaigns/my', icon: LayoutDashboard },
      { label: '관심 캠페인', path: '/campaigns/favorites', icon: Heart },
      { label: '정산', path: '/settlement', icon: Wallet },
      { label: '알림', path: '/notifications', icon: Bell },
    ],
  },
  {
    title: '계정 관리',
    items: [
      { label: '내 정보', path: '/profile', icon: UserCircle },
      { label: '인스타 관리', path: '/media', icon: Link2 },
    ],
  },
]

export default function SideNav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = useUnreadCount()

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] transition-all duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
      isActive ? 'bg-brand-green-bg text-brand-green-text font-semibold' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <nav className="w-52 flex-shrink-0 space-y-6 sticky top-0 self-start">
      {/* 탐색 섹션 */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5 px-3">
          탐색
        </p>
        <ul>
        <li>
          <button
            type="button"
            onClick={() => { navigate(browseItem.path); onNavigate?.() }}
            aria-current={location.pathname === browseItem.path ? 'page' : undefined}
            className={navItemClass(location.pathname === browseItem.path)}
          >
            <browseItem.icon size={15} className="flex-shrink-0" />
            {browseItem.label}
          </button>
        </li>
        </ul>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5 px-3">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => { navigate(item.path); onNavigate?.() }}
                    aria-current={isActive ? 'page' : undefined}
                    className={navItemClass(isActive)}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    {item.label}
                    {item.path === '/notifications' && unreadCount > 0 && (
                      <span className="ml-auto w-4 h-4 bg-brand-green rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ fontSize: '9px' }} aria-hidden="true">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
