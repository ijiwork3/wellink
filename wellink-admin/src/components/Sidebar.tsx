import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, TrendingUp, Users, UserCheck,
  MessageCircle, Sparkles, Megaphone, BookOpen, CreditCard,
  BookMarked, Lightbulb, User, Share2, Search
} from 'lucide-react'

const sections = [
  {
    label: '분석',
    items: [
      { to: '/dashboard', icon: <LayoutDashboard size={14} />, label: '홈 대시보드' },
      { to: '/analytics/profile', icon: <BarChart2 size={14} />, label: '프로필 인사이트' },
      { to: '/analytics/ads', icon: <TrendingUp size={14} />, label: '광고 성과' },
      { to: '/analytics/viral', icon: <Share2 size={14} />, label: '바이럴 지표' },
    ],
  },
  {
    label: '인플루언서',
    items: [
      { to: '/influencers/list', icon: <Users size={14} />, label: '인플루언서 리스트' },
      { to: '/influencers/manage', icon: <UserCheck size={14} />, label: '인플루언서 관리' },
      { to: '/influencers/dm', icon: <MessageCircle size={14} />, label: 'DM 관리' },
      { to: '/influencers/ai', icon: <Sparkles size={14} />, label: 'AI 리스트업' },
    ],
  },
  {
    label: '캠페인',
    items: [
      { to: '/campaigns', icon: <Megaphone size={14} />, label: '캠페인 관리' },
      { to: '/library', icon: <BookOpen size={14} />, label: '콘텐츠 라이브러리' },
    ],
  },
  {
    label: '구독',
    items: [
      { to: '/subscription', icon: <CreditCard size={14} />, label: '구독 관리' },
    ],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  return (
    <aside className="w-[180px] shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* 로고 */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-bold tracking-tight text-gray-900">WELLINK</span>
          <span className="text-[9px] font-semibold bg-[#8CC63F] text-white px-1.5 py-0.5 rounded-full leading-none">어드민</span>
        </div>
        {/* 메뉴 검색 */}
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
          <Search size={11} className="text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-400">메뉴 검색</span>
        </div>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {sections.map(section => (
          <div key={section.label} className="mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 px-2.5">
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/campaigns'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 mb-0.5 ${
                    isActive
                      ? 'bg-[#8CC63F]/10 text-[#5a8a1f] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="shrink-0 opacity-70">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* 하단 링크 + 계정 */}
      <div className="px-2 pb-4 border-t border-gray-100 pt-2">
        <button
          onClick={() => window.open('https://wellink.co.kr', '_blank')}
          className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 w-full transition-colors duration-150"
        >
          <BookMarked size={14} className="shrink-0 opacity-70" />
          서비스 가이드
        </button>
        <button
          onClick={() => window.open('https://wellink.co.kr/blog', '_blank')}
          className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 w-full transition-colors duration-150 mb-1"
        >
          <Lightbulb size={14} className="shrink-0 opacity-70" />
          인사이트/블로그
        </button>

        <div className="border-t border-gray-100 pt-2 mt-1">
          <button
            onClick={() => navigate('/mypage')}
            className="flex items-center gap-2 px-2.5 py-1.5 w-full rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="w-6 h-6 rounded-full bg-[#8CC63F]/15 flex items-center justify-center shrink-0">
              <User size={12} className="text-[#5a8a1f]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-medium text-gray-900 truncate leading-tight">wellink.ai</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}
