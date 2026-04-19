import { useNavigate } from 'react-router-dom'
import ProfileHeader from './ProfileHeader'
import SideNav from './SideNav'
import BottomTabBar from './BottomTabBar'
import { auth } from '@wellink/ui'
import { useDeviceMode } from '../qa-mockup-kit'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const navigate = useNavigate()
  const device = useDeviceMode()
  const isMobile = device === 'phone'

  return (
    <div className="flex flex-col w-full h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-green focus:text-white focus:rounded-xl focus:shadow-lg focus:text-sm focus:font-medium"
      >
        메인 콘텐츠로 이동
      </a>
      {/* GNB */}
      <header className={`h-14 flex-shrink-0 flex items-center justify-between ${isMobile ? 'px-4' : 'px-6'} bg-white border-b border-gray-100 z-40`}>
        <button
          onClick={() => navigate('/home')}
          aria-label="WELLINK AI 홈으로"
          className="text-xl font-black tracking-tight text-brand-green transition-opacity hover:opacity-80"
        >
          WELLINK AI
        </button>
        <div className="flex items-center gap-3">
          {!isMobile && (
            <button
              onClick={() => navigate('/profile')}
              aria-label="마이페이지로 이동"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150 font-medium"
            >
              마이페이지
            </button>
          )}
          <button
            onClick={() => { auth.clear(); navigate('/login') }}
            className={`text-sm ${isMobile ? 'px-3' : 'px-3.5'} py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-150`}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 본문 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {showSidebar && <ProfileHeader />}
        {showSidebar ? (
          <div className={`flex-1 max-w-screen-xl mx-auto w-full ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
            <div className="flex gap-6">
              {/* SideNav: 태블릿·PC에서만 표시 */}
              {!isMobile && <SideNav />}
              <main id="main-content" className="flex-1 min-w-0" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                {children}
              </main>
            </div>
          </div>
        ) : (
          <main id="main-content" className="flex-1" style={{ animation: 'fadeIn 0.15s ease-out' }}>
            {children}
          </main>
        )}
      </div>

      {/* 하단 탭바: 스마트폰에서만 표시 */}
      {showSidebar && <BottomTabBar />}
    </div>
  )
}
