import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Heart, UserCircle, Link2, Search } from 'lucide-react'

const browseItem = { label: '캠페인 탐색', path: '/campaigns/browse', icon: Search }

const sections = [
  {
    title: '활동 관리',
    items: [
      { label: '내 캠페인', path: '/campaigns/my', icon: LayoutDashboard },
      { label: '관심 캠페인', path: '/campaigns/favorites', icon: Heart },
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

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
      isActive ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <nav className="w-52 flex-shrink-0 space-y-6 sticky top-0 self-start">
      {/* 캠페인 탐색 — 섹션 밖 단독 배치 */}
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
