import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import InstagramGlobalBanner from './InstagramGlobalBanner'
import { useDeviceMode } from '../qa-mockup-kit'
import { usePlanAccess } from '../hooks/usePlanAccess'

export default function Layout() {
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)
  const device = useDeviceMode()
  const isDesktop = device === 'desktop'
  const { isGated, hasActivePlan } = usePlanAccess()

  // ESC 닫기
  useEffect(() => {
    if (!mobileNav) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNav(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileNav])

  return (
    <div className="relative flex h-full bg-gray-50 overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-green focus:text-white focus:rounded-xl focus:shadow-lg focus:text-base focus:font-medium"
      >
        메인 콘텐츠로 이동
      </a>

      {/* 태블릿·스마트폰 오버레이 — GNB 포함 풀 인셋 (z-[60]으로 GNB(z-50)보다 위) */}
      {!isDesktop && (
        <>
          {/* 백드롭 (페이드인) */}
          <div
            onClick={() => setMobileNav(false)}
            aria-hidden="true"
            className={`absolute inset-0 z-[55] bg-black/40 transition-opacity duration-200 ${
              mobileNav ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
          {/* 패널 (슬라이드 인) */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="네비게이션 메뉴"
            className={`absolute top-0 left-0 bottom-0 z-[60] w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
              mobileNav ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              {/* 클라 #5: drawer 패널 로고도 클릭 시 홈 이동 + drawer 닫기 */}
              <button
                type="button"
                onClick={() => { navigate('/dashboard'); setMobileNav(false) }}
                className="text-base font-bold text-gray-900 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
                aria-label="홈으로 이동"
              >
                WELLINK <span className="text-sm font-medium bg-brand-green text-white px-2 py-1 rounded-full ml-1">광고주</span>
              </button>
              <button type="button" onClick={() => setMobileNav(false)} aria-label="메뉴 닫기" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                <X size={18} className="text-gray-500" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pt-2">
              <Sidebar onNavigate={() => setMobileNav(false)} hideLogo fullWidth />
            </div>
          </aside>
        </>
      )}

      {/* 데스크톱 사이드바 */}
      {isDesktop && <Sidebar />}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 flex flex-col relative">
        {/* 태블릿·스마트폰 GNB — sticky로 목업 박스 내부에 고정 */}
        {!isDesktop && (
          <div className="sticky top-0 h-12 bg-white border-b border-gray-100 flex items-center px-4 z-50 shrink-0">
            <button type="button" onClick={() => setMobileNav(true)} aria-label="메뉴 열기" className="w-10 h-10 flex items-center justify-center -ml-1 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <Menu size={20} className="text-gray-700" aria-hidden="true" />
            </button>
            {/* 클라 #5: 모바일 헤더 로고도 클릭 시 홈(/dashboard) 이동 — 사이드바 홈 탭 삭제 보완 */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="ml-2 text-base font-bold text-gray-900 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
              aria-label="홈으로 이동"
            >
              WELLINK <span className="text-sm font-medium bg-brand-green text-white px-2 py-1 rounded-full ml-1">광고주</span>
            </button>
          </div>
        )}
        <InstagramGlobalBanner />
        {/* 구독 상태 배너 — 채도 v2: bg-amber-50 → bg-amber-100, bg-blue-50 → bg-blue-100 */}
        {isGated && (
          <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 flex items-center justify-between">
            <span>구독이 만료되었습니다. 서비스 이용을 위해 플랜을 갱신해 주세요.</span>
            <Link to="/subscription" className="font-medium underline shrink-0 ml-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded">구독 관리 →</Link>
          </div>
        )}
        {!hasActivePlan && !isGated && (
          <div className="bg-blue-100 border-b border-blue-200 px-4 py-2 text-sm text-blue-800 flex items-center justify-between">
            <span>웰링크 플랜을 시작하면 모든 기능을 이용할 수 있습니다.</span>
            <Link to="/subscription" className="font-medium underline shrink-0 ml-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded">플랜 보기 →</Link>
          </div>
        )}
        <main id="main-content" className={`@container w-full max-w-screen-2xl mx-auto ${device === 'phone' ? 'px-4 py-4' : device === 'tablet' ? 'px-6 py-5' : 'px-8 py-7'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
