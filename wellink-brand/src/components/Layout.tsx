import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { useDeviceMode } from '../qa-mockup-kit'

export default function Layout() {
  const [mobileNav, setMobileNav] = useState(false)
  const device = useDeviceMode()
  const isMobile = device === 'phone'

  return (
    <div className="flex h-full bg-[#FAFAFA]">
      {/* 모바일 GNB */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-100 flex items-center px-4 z-50">
          <button onClick={() => setMobileNav(true)} aria-label="메뉴 열기" className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-700" />
          </button>
          <span className="ml-2 text-sm font-bold text-gray-900">WELLINK <span className="text-[10px] font-medium bg-[#8CC63F] text-white px-1.5 py-0.5 rounded-full ml-1">브랜드</span></span>
        </div>
      )}

      {/* 모바일 오버레이 */}
      {isMobile && mobileNav && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[260px] bg-white shadow-xl flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">메뉴</span>
              <button onClick={() => setMobileNav(false)} aria-label="메뉴 닫기" className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileNav(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNav(false)} />
        </div>
      )}

      {/* 데스크탑/태블릿 사이드바 */}
      {!isMobile && <Sidebar />}

      <div className="flex-1 overflow-y-auto min-w-0">
        <main className={`max-w-[1080px] ${isMobile ? 'px-4 py-4 pt-16' : 'px-8 py-7'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
