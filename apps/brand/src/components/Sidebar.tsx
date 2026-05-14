import { useState, useMemo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, TrendingUp, Users, UserCheck,
  Megaphone, BookOpen, CreditCard,
  BookMarked, Lightbulb, User, Share2, ExternalLink, Search, Bell, Lock,
} from 'lucide-react'
import { Modal } from '@wellink/ui'
import { usePlanAccess } from '../hooks/usePlanAccess'
import { useUnreadCount } from '../services/notifications'

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
    label: '계정',
    items: [
      { to: '/notifications', icon: <Bell size={15} />, label: '알림 센터' },
      { to: '/subscription', icon: <CreditCard size={15} />, label: '구독 관리' },
    ],
  },
]

// isGated 상태에서도 항상 접근 가능한 경로
const ALWAYS_ACCESSIBLE = new Set(['/campaigns', '/subscription'])

export default function Sidebar({ onNavigate, hideLogo = false, fullWidth = false }: { onNavigate?: () => void; hideLogo?: boolean; fullWidth?: boolean } = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isGated, planLabel, isSubscribed } = usePlanAccess()
  const unreadNotifs = useUnreadCount(isSubscribed)
  const isMyPageActive = location.pathname === '/mypage'
  const [menuSearch, setMenuSearch] = useState('')
  const [gatedModalOpen, setGatedModalOpen] = useState(false)
  const q = menuSearch.trim().toLowerCase()
  // 클라 #5: 사이드바 *홈* 탭 삭제. 좌상단 WELLINK 로고 클릭으로 대시보드 이동
  const showDashboard = !q || '대시보드'.includes(q)
  const showDashboardV2 = !q || '대시보드 v2'.includes(q) || 'v2'.includes(q)
  const filteredSections = useMemo(
    () =>
      sections
        .map(s => ({ ...s, items: s.items.filter(i => !q || i.label.toLowerCase().includes(q)) }))
        .filter(s => s.items.length > 0),
    [q]
  )

  const openGatedModal = () => setGatedModalOpen(true)

  return (
    <aside className={`${fullWidth ? 'w-full h-full' : 'w-[220px] shrink-0 sticky top-0'} bg-white border-r border-gray-100 flex flex-col min-h-0`}>
      {/* 로고 — 클라 #5: 로고 클릭 시 홈(대시보드)으로 이동 */}
      {!hideLogo && (
        <button
          type="button"
          onClick={() => { navigate('/dashboard'); onNavigate?.() }}
          className="px-5 pt-5 pb-4 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-lg"
          aria-label="홈으로 이동"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-gray-900">WELLINK</span>
            <span className="text-sm font-medium bg-brand-green text-white px-2 py-1 rounded-full leading-none">광고주</span>
          </div>
        </button>
      )}

      {/* 구독 만료 배너 */}
      {isGated && (
        <div className="mx-3 mb-2 px-3 py-2 bg-amber-100 border border-amber-200 rounded-lg">
          <p className="text-base text-amber-800 font-medium leading-snug">{planLabel}</p>
          <button
            type="button"
            onClick={() => navigate('/subscription')}
            className="text-base text-amber-700 hover:text-amber-900 underline mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
          >
            구독 갱신하기 →
          </button>
        </div>
      )}

      {/* 메뉴 검색 */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={menuSearch}
            onChange={e => setMenuSearch(e.target.value)}
            placeholder="메뉴 검색"
            className="w-full pl-7 pr-2.5 py-1.5 text-base bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:bg-white focus:border-gray-300 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 내비게이션 — 클라 #5: 홈 탭 제거 (WELLINK 로고로 대체) */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {showDashboard && (
          isGated ? (
            <button
              type="button"
              onClick={openGatedModal}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-base text-gray-300 w-full transition-all duration-150 mb-0.5 cursor-not-allowed"
            >
              <LayoutDashboard size={15} />
              <span className="flex-1 text-left">대시보드</span>
              <Lock size={11} className="shrink-0 opacity-50" aria-hidden="true" />
            </button>
          ) : (
            <NavLink
              to="/dashboard"
              end
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-base transition-all duration-150 mb-0.5 ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <LayoutDashboard size={15} />
              대시보드
            </NavLink>
          )
        )}
        {/* 대시보드 v2 — 재설계 (피드백 반영 후) */}
        {showDashboardV2 && (
          <NavLink
            to="/dashboard-v2"
            end
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-base transition-all duration-150 mb-2 ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard size={15} />
            <span className="flex-1">대시보드 v2</span>
            <span className="text-xs font-semibold text-brand-green-text bg-brand-green-bg px-1.5 py-0.5 rounded">NEW</span>
          </NavLink>
        )}
        {filteredSections.map(section => (
          <div key={section.label} className="mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 px-3">
              {section.label}
            </div>
            {section.items.map(item => {
              const itemGated = isGated && !ALWAYS_ACCESSIBLE.has(item.to)
              if (itemGated) {
                return (
                  <button
                    key={item.to}
                    onClick={openGatedModal}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-base text-gray-300 w-full transition-all duration-150 mb-0.5 cursor-not-allowed"
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    <Lock size={11} className="shrink-0 opacity-50" aria-hidden="true" />
                  </button>
                )
              }
              const showNotifDot = item.to === '/notifications' && unreadNotifs > 0
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-base transition-all duration-150 mb-0.5 ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="relative inline-flex">
                    {item.icon}
                    {showNotifDot && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-green ring-2 ring-white"
                        aria-label={`읽지 않은 알림 ${unreadNotifs}건`}
                      />
                    )}
                  </span>
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* 하단 링크 + 계정 */}
      <div className="px-3 pb-5 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => window.open('https://wellink.co.kr', '_blank', 'noopener,noreferrer')}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-base text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full transition-colors duration-150 mb-0.5"
        >
          <BookMarked size={15} />
          <span className="flex-1 text-left">서비스 가이드</span>
          <ExternalLink size={12} className="shrink-0 opacity-60" />
        </button>
        <button
          type="button"
          onClick={() => window.open('https://pnutbtr.inblog.io/', '_blank', 'noopener,noreferrer')}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-base text-gray-500 hover:bg-gray-100 hover:text-gray-700 w-full transition-colors duration-150 mb-2"
        >
          <Lightbulb size={15} />
          <span className="flex-1 text-left">인사이트/블로그</span>
          <ExternalLink size={12} className="shrink-0 opacity-60" />
        </button>

        <div className="border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className={`flex items-center gap-2.5 px-3 py-2 w-full rounded-lg hover:bg-gray-100 transition-colors duration-150 ${isMyPageActive ? 'bg-gray-100' : ''}`}
          >
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
              <User size={13} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              {/* auth 연동 시 실제 사용자 정보로 교체 예정 */}
              <p className="text-base font-medium text-gray-900 truncate">웰링크 브랜드</p>
              <p className="text-base text-gray-400 truncate">brand@wellink.ai</p>
            </div>
          </button>
        </div>
      </div>

      {/* 구독 만료 게이팅 모달 */}
      <Modal
        open={gatedModalOpen}
        onClose={() => setGatedModalOpen(false)}
        title="구독 갱신이 필요합니다"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGatedModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => { setGatedModalOpen(false); navigate('/subscription') }}
              className="flex-1 py-2.5 rounded-xl bg-brand-green text-white text-base font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              구독 관리로 이동
            </button>
          </div>
        }
      >
        <p className="text-base text-gray-600 leading-relaxed">
          현재 구독이 만료되어 이 기능을 사용할 수 없습니다.<br />
          구독을 갱신하면 모든 기능을 다시 이용할 수 있습니다.
        </p>
      </Modal>
    </aside>
  )
}
