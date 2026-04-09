import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from './ProfileHeader'
import SideNav from './SideNav'

interface LayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F7F5' }}>
      {/* GNB */}
      <header className="h-14 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100">
        <button
          onClick={() => navigate('/home')}
          aria-label="WELLINK AI 홈으로"
          className="text-xl font-black tracking-tight transition-opacity hover:opacity-80"
          style={{ color: '#8CC63F' }}
        >
          WELLINK AI
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            aria-label="마이페이지로 이동"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150 font-medium"
          >
            마이페이지
          </button>
          <button
            onClick={() => window.location.href = `${import.meta.env.VITE_BRAND_URL || 'http://localhost:3003'}/login`}
            className="text-sm px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-150"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 상단 여백 */}
      <div className="h-14" />

      {showSidebar && <ProfileHeader />}

      {/* 본문 */}
      {showSidebar ? (
        <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
          <div className="flex gap-6">
            <SideNav />
            <main className="flex-1 min-w-0" style={{ animation: 'fadeIn 0.15s ease-out' }}>
              {children}
            </main>
          </div>
        </div>
      ) : (
        <main className="flex-1" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          {children}
        </main>
      )}
    </div>
  )
}
