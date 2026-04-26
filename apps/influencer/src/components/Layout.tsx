import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from './ProfileHeader'
import SideNav from './SideNav'
import BottomTabBar from './BottomTabBar'
import { auth } from '@wellink/ui'
import { ArrowLeft, Menu, X } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  showProfileHeader?: boolean
  showBottomTab?: boolean
  pageTitle?: string
  onBack?: () => void
}

export default function Layout({ children, showSidebar = true, showProfileHeader, showBottomTab, pageTitle, onBack }: LayoutProps) {
  const profileHeader = showProfileHeader ?? showSidebar
  const bottomTab = showBottomTab ?? showSidebar
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="@container flex flex-col w-full h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-green focus:text-white focus:rounded-xl focus:shadow-lg focus:text-sm focus:font-medium"
      >
        메인 콘텐츠로 이동
      </a>

      {/* GNB */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 @sm:px-6 bg-white border-b border-gray-100 z-40">
        {onBack ? (
          /* 2뎁스: 뒤로가기 + 페이지 타이틀 */
          <>
            <button
              onClick={onBack}
              aria-label="이전으로"
              className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium truncate max-w-[200px]">{pageTitle}</span>
            </button>
            <div className="w-8" />
          </>
        ) : (
          /* 1뎁스: 로고 + 우측 메뉴 */
          <>
            <div className="flex items-center gap-2">
              {/* 햄버거: @sm 이상 @lg 미만 (태블릿) */}
              {showSidebar && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  aria-label="메뉴 열기"
                  className="hidden @sm:flex @lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu size={20} className="text-gray-700" />
                </button>
              )}
              <button
                onClick={() => navigate('/home')}
                aria-label="WELLINK AI 홈으로"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <span className="text-base font-bold tracking-tight text-gray-900">WELLINK</span>
                <span className="text-[10px] font-medium bg-brand-green text-white px-1.5 py-0.5 rounded-full leading-none">인플루언서</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/profile')}
                aria-label="마이페이지로 이동"
                className="hidden @sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150 font-medium"
              >
                마이페이지
              </button>
              <button
                onClick={() => { auth.clear(); navigate('/login') }}
                className="hidden @sm:block text-sm px-3 @sm:px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-150"
              >
                로그아웃
              </button>
            </div>
          </>
        )}
      </header>

      {/* 본문 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {profileHeader && <ProfileHeader />}
        {showSidebar ? (
          <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-4 @sm:px-6 @sm:py-6 pb-20 @sm:pb-6">
            <div className="flex gap-6">
              {/* SideNav: 컨테이너 lg 이상에서만 표시 */}
              <div className="hidden @sm:block">
                <SideNav />
              </div>
              <main id="main-content" className="flex-1 min-w-0" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                {children}
              </main>
            </div>
          </div>
        ) : (
          <main id="main-content" className={`flex-1 ${bottomTab ? 'pb-20 @sm:pb-0' : ''}`} style={{ animation: 'fadeIn 0.15s ease-out' }}>
            {children}
          </main>
        )}
      </div>

      {/* 태블릿 드로어 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-64 bg-white h-full flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-gray-900">WELLINK</span>
                <span className="text-[10px] font-medium bg-brand-green text-white px-1.5 py-0.5 rounded-full leading-none">인플루언서</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="메뉴 닫기" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SideNav onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="border-t border-gray-100 p-4">
              <button
                onClick={() => { auth.clear(); navigate('/login') }}
                className="w-full text-sm py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭바: 컨테이너 sm 미만에서만 표시 */}
      {bottomTab && (
        <div className="@sm:hidden">
          <BottomTabBar />
        </div>
      )}
    </div>
  )
}
