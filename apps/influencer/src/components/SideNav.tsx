import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Heart, UserCircle, Link2, Search, ClipboardList, Wallet } from 'lucide-react'

const sections = [
  {
    title: '활동 관리',
    items: [
      { label: '홈', path: '/home', icon: LayoutDashboard },
      { label: '캠페인 탐색', path: '/campaigns/browse', icon: Search },
      { label: '내 캠페인', path: '/campaigns/my', icon: ClipboardList },
      { label: '관심 캠페인', path: '/campaigns/favorites', icon: Heart },
    ],
  },
  {
    title: '계정 관리',
    items: [
      { label: '내 정보', path: '/profile', icon: UserCircle },
      { label: '인스타 관리', path: '/media', icon: Link2 },
      { label: '정산', path: '/settlement', icon: Wallet },
    ],
  },
]

export default function SideNav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="w-52 flex-shrink-0 space-y-6 sticky top-0 self-start">
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                      isActive
                        ? 'bg-brand-green-bg text-brand-green-text font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
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
