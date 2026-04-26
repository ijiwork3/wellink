import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Heart, UserCircle, Link2 } from 'lucide-react'

const sections = [
  {
    title: '활동 관리',
    items: [
      { label: '나의 캠페인', path: '/campaigns/my', icon: LayoutDashboard },
      { label: '관심 캠페인', path: '/home', icon: Heart },
    ],
  },
  {
    title: '계정 관리',
    items: [
      { label: '내 정보 수정', path: '/profile', icon: UserCircle },
      { label: '미디어 연결', path: '/media', icon: Link2 },
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
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5 px-3">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <button
                    onClick={() => { navigate(item.path); onNavigate?.() }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 text-left ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-medium'
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
