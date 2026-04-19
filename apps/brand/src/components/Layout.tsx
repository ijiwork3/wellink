import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import InstagramGlobalBanner from './InstagramGlobalBanner'
import { useDeviceMode } from '../qa-mockup-kit'

export default function Layout() {
  const [mobileNav, setMobileNav] = useState(false)
  const device = useDeviceMode()
  const isDesktop = device === 'desktop'

  return (
    <div className="relative flex h-full bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-green focus:text-white focus:rounded-xl focus:shadow-lg focus:text-sm focus:font-medium"
      >
        메인 콘텐츠로 이동
      </a>

      {/* 태블릿·스마트폰 오버레이 */}
      {!isDesktop && mobileNav && (
        <div className="absolute inset-0 z-50 flex">
          <div className="w-[260px] bg-white shadow-xl flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">메뉴</span>
              <button onClick={() => setMobileNav(false)} aria-label="메뉴 닫기" className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileNav(false)} hideLogo />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNav(false)} />
        </div>
      )}

      {/* 데스크톱 사이드바 */}
      {isDesktop && <Sidebar />}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto min-w-0 flex flex-col relative">
        {/* 태블릿·스마트폰 GNB — sticky로 목업 박스 내부에 고정 */}
        {!isDesktop && (
          <div className="sticky top-0 h-12 bg-white border-b border-gray-100 flex items-center px-4 z-50 shrink-0">
            <button onClick={() => setMobileNav(true)} aria-label="메뉴 열기" className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100">
              <Menu size={20} className="text-gray-700" />
            </button>
            <span className="ml-2 text-sm font-bold text-gray-900">WELLINK <span className="text-[10px] font-medium bg-brand-green text-white px-1.5 py-0.5 rounded-full ml-1">광고주</span></span>
          </div>
        )}
        <InstagramGlobalBanner />
        <main id="main-content" className={`max-w-[1080px] ${device === 'phone' ? 'px-4 py-4' : device === 'tablet' ? 'px-6 py-5' : 'px-8 py-7'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
