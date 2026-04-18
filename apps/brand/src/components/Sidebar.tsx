import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, TrendingUp, Users, UserCheck,
  Megaphone, BookOpen, CreditCard,
  BookMarked, Lightbulb, User, Share2, MessageCircle, Sparkles, ExternalLink, Home
} from 'lucide-react'
import { useToast } from '@wellink/ui'

const sections = [
  {
    label: '분석',
    items: [
      { to: '/analytics/profile', icon: <BarChart2 size={15} />, label: '프로필 인사이트' },
      { to: '/analytics/ads', icon: <TrendingUp size={15} />, label: '광고 성과' },
      { to: '/analytics/viral', icon: <Share2 size={15} />, label: '바이럴 지표' },
    ],
  },
  {
    label: '인플루언서',
    items: [
      { to: '/influencers/list', icon: <Users size={15} />, label: '인플루언서 리스트' },
      { to: '/influencers/manage', icon: <UserCheck size={15} />, label: '인플루언서 관리' },
      { to: '/influencers/dm', icon: <MessageCircle size={15} />, label: 'DM 관리' },
      { to: '/influencers/ai', icon: <Sparkles size={15} />, label: 'AI 리스트업' },
    ],
  },
  {
    label: '캠페인',
    items: [
      { to: '/campaigns', icon: <Megaphone size={15} />, label: '캠페인 목록' },
      { to: '/library', icon: <BookOpen size={15} />, label: '콘텐츠 라이브러리' },
    ],
  },
  {
    label: '구독',
    items: [
      { to: '/subscription', icon: <CreditCard size={15} />, label: '구독 관리' },
    ],
  },
]

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const isMyPageActive = location.pathname === '/mypage'
  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-gray-100 flex flex-col h-full sticky top-0">
      {/* 로고 */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold tracking-tight text-gray-900">WELLINK</span>
          <span className="text-[10px] font-medium bg-[#8CC63F] text-white px-1.5 py-0.5 rounded-full leading-none">브랜드</span>
        </div>
      </div>

      {/* 홈 버튼 */}
      <div className="px-3 pb-2">
        <button
          onClick={() => { showToast('홈으로 이동'); onNavigate?.() }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-all duration-150 mb-0.5"
        >
          <Home size={15} />
          홈
        </button>
      </div>

      {/* 대시보드 — 섹션 없이 단독 항목 */}
      <div className="px-3 pb-2">
        <NavLink
          to="/dashboard"
          end
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
              isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <LayoutDashboard size={15} />
          대시보드
        </NavLink>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {sections.map(section => (
          <div key={section.label} className="mb-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 px-3">
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => onNavigate?.()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* 하단 링크 + 계정 */}
      <div className="px-3 pb-5 border-t border-gray-100 pt-3">
        <button
          onClick={() => window.open('https://wellink.co.kr', '_blank', 'noopener,noreferrer')}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full transition-colors duration-150 mb-0.5"
        >
          <BookMarked size={15} />
          <span className="flex-1 text-left">서비스 가이드</span>
          <ExternalLink size={12} className="shrink-0 opacity-60" />
        </button>
        <button
          onClick={() => window.open('https://wellink.co.kr/blog', '_blank', 'noopener,noreferrer')}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full transition-colors duration-150 mb-2"
        >
          <Lightbulb size={15} />
          <span className="flex-1 text-left">인사이트/블로그</span>
          <ExternalLink size={12} className="shrink-0 opacity-60" />
        </button>

        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => navigate('/mypage')}
            className={`flex items-center gap-2.5 px-3 py-2 w-full rounded-lg hover:bg-gray-100 transition-colors duration-150 ${isMyPageActive ? 'bg-gray-100' : ''}`}
          >
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
              <User size={13} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              {/* TODO: 로그인 컨텍스트에서 사용자 정보 주입 */}
              <p className="text-xs font-medium text-gray-900 truncate">웰링크 브랜드</p>
              <p className="text-[11px] text-gray-400 truncate">brand@wellink.ai</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}
