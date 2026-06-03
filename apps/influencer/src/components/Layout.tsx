import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEscToClose } from '../utils/useEscToClose'
import ProfileHeader from './ProfileHeader'
import SideNav from './SideNav'
import BottomTabBar from './BottomTabBar'
import { AlertModal, useToast } from '@wellink/ui'

/* 데모: 실제 로그아웃 없이 토스트 후 랜딩(마케팅)으로 이동. 배포 시 도메인만 교체. */
const MARKETING_URL = /^(localhost|127\.0\.0\.1)/.test(typeof window !== 'undefined' ? window.location.hostname : '')
  ? 'http://localhost:5199/'
  : 'https://wellink.ai/'
import { ArrowLeft, Menu, X, Bell } from 'lucide-react'
import { useUnreadCount } from '../services/notifications'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  showBottomTab?: boolean
  pageTitle?: string
  onBack?: () => void
  mobileFull?: boolean
  pageWidth?: string
}

export default function Layout({ children, showSidebar = true, showBottomTab, pageTitle, onBack, mobileFull = false, pageWidth }: LayoutProps) {
  const bottomTab = showBottomTab ?? showSidebar
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const unreadCount = useUnreadCount()
  useEscToClose(drawerOpen, () => setDrawerOpen(false))

  const confirmLogout = () => setLogoutConfirm(true)
  // 데모: 실제 로그아웃은 하지 않고, 토스트 노출 후 랜딩으로 이동
  const doLogout = () => {
    setLogoutConfirm(false)
    showToast('로그아웃되었습니다. 메인으로 이동할게요.', 'info')
    setTimeout(() => { window.location.href = MARKETING_URL }, 700)
  }

  return (
    <div className="@container flex flex-col w-full h-full">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[9999] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-brand-green focus-visible:text-white focus-visible:rounded-xl focus-visible:shadow-lg focus-visible:text-[15px] focus-visible:font-medium"
      >
        메인 콘텐츠로 이동
      </a>

      {/* GNB */}
      <header className="h-14 flex-shrink-0 flex items-center px-4 @[640px]:px-6 bg-white border-b border-gray-100 z-40">
        {onBack ? (
          /* 2뎁스: 뒤로가기 + 페이지 타이틀 */
          <div className={`flex items-center justify-between w-full ${pageWidth ? `${pageWidth} mx-auto` : ''}`}>
            <button
              type="button"
              onClick={onBack}
              aria-label="이전으로"
              className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <ArrowLeft size={20} />
              <span className="text-[15px] font-medium truncate max-w-[200px]">{pageTitle}</span>
            </button>
            <div className="w-8" />
          </div>
        ) : (
          /* 1뎁스: 로고 + 우측 메뉴 */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {/* 햄버거: @sm 이상 @lg 미만 (태블릿) */}
              {showSidebar && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="메뉴 열기"
                  className="hidden @[640px]:flex @[1024px]:hidden w-10 h-10 items-center justify-center -ml-1 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Menu size={20} className="text-gray-700" />
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/campaigns/browse')}
                aria-label="WELLINK AI 홈으로"
                className="text-[15px] font-bold tracking-tight text-gray-900 transition-opacity hover:opacity-80 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                WELLINK<span className="text-brand-green">.AI</span>
              </button>
              <button
                type="button"
                onClick={() => document.dispatchEvent(new Event('qa-toggle'))}
                aria-label="QA 패널 열기"
                style={{ background: 'var(--gradient-brand)' }} className="text-xs font-medium text-white px-2 py-0.5 rounded-full leading-tight whitespace-nowrap transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                인플루언서
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* 알림 벨 */}
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                aria-label={unreadCount > 0 ? `알림 ${unreadCount}건 미읽음` : '알림'}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-green rounded-full flex items-center justify-center text-white font-bold leading-none"
                    style={{ fontSize: '9px' }}
                    aria-hidden="true"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="hidden @[640px]:block text-[15px] px-3 @[640px]:px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 본문 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50">
        {showSidebar && (
          <div className="hidden @[640px]:block"><ProfileHeader /></div>
        )}
        {showSidebar ? (
          <div className={`flex-1 max-w-screen-xl mx-auto w-full ${mobileFull ? 'px-0 py-0' : 'px-4 py-4'} @[640px]:px-6 @[640px]:py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] @[640px]:pb-6`}>
            <div className="flex gap-6">
              {/* SideNav: 컨테이너 lg 이상에서만 표시 */}
              <div className="hidden @[1024px]:block">
                <SideNav />
              </div>
              <main id="main-content" className="flex-1 min-w-0" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                {children}
              </main>
            </div>
          </div>
        ) : (
          <main
            id="main-content"
            className={`flex-1 ${bottomTab ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] @[640px]:pb-0' : ''}`}
            style={{ animation: 'fadeIn 0.15s ease-out' }}
          >
            {children}
          </main>
        )}
      </div>

      {/* 태블릿 드로어 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="메뉴"
            className="relative w-64 bg-white h-full flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-gray-900">WELLINK<span className="text-brand-green">.AI</span></span>
                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); document.dispatchEvent(new Event('qa-toggle')) }}
                  aria-label="QA 패널 열기"
                  style={{ background: 'var(--gradient-brand)' }} className="text-xs font-medium text-white px-2 py-0.5 rounded-full leading-tight whitespace-nowrap transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  인플루언서
                </button>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="메뉴 닫기" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SideNav onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="border-t border-gray-100 p-4">
              <button
                onClick={confirmLogout}
                className="w-full text-[15px] py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭바: 컨테이너 sm 미만에서만 표시 */}
      {bottomTab && (
        <div className="@[640px]:hidden">
          <BottomTabBar />
        </div>
      )}

      <AlertModal
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="로그아웃"
        description="로그아웃 하시겠어요?"
        confirmLabel="로그아웃"
        onConfirm={doLogout}
        variant="default"
      />
    </div>
  )
}
