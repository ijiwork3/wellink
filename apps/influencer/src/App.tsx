import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Settings, X } from 'lucide-react'
import Login from './pages/Login'
import Home from './pages/Home'
import CampaignBrowse from './pages/CampaignBrowse'
import MyCampaign from './pages/MyCampaign'
import CampaignDetail from './pages/CampaignDetail'
import CampaignApply from './pages/CampaignApply'
import Profile from './pages/Profile'
import Media from './pages/Media'
import Settlement from './pages/Settlement'
import Signup from './pages/Signup'
import Favorites from './pages/Favorites'
import { GlobalQAHeader, GLOBAL_QA_HEADER_HEIGHT, type StatusItem } from './qa-mockup-kit'
import { ToastProvider, ProtectedRoute, ErrorBoundary } from '@wellink/ui'

const STATUS_ITEMS: StatusItem[] = [
  /* ────────────────── 온보딩 ────────────────── */
  {
    label: '온보딩',
    children: [
      { label: '로그인 — 기본', path: '/login' },
      { label: '로그인 — 자격증명 오류', path: '/login?qa=error' },
      { label: '로그인 — 입력 완료', path: '/login?qa=filled' },
      { label: '로그인 — 로딩 중', path: '/login?qa=loading' },
      { label: '회원가입 — 기본 (빈 폼)', path: '/signup' },
      { label: '회원가입 — 입력 완료', path: '/signup?qa=filled' },
      { label: '회원가입 — 인증 완료', path: '/signup?qa=verified' },
      { label: '회원가입 — 유효성 에러', path: '/signup?qa=error' },
    ],
  },

  /* ────────────────── 홈 ────────────────── */
  {
    label: '홈 (대시보드)',
    children: [
      { label: '기본', path: '/home' },
      { label: '로딩 스켈레톤', path: '/home?qa=loading' },
    ],
  },

  /* ────────────────── 관심 캠페인 ────────────────── */
  {
    label: '관심 캠페인',
    children: [
      { label: '기본 (북마크 있음)', path: '/campaigns/favorites' },
      { label: '로딩 스켈레톤', path: '/campaigns/favorites?qa=loading' },
      { label: '빈 상태 — 북마크 없음', path: '/campaigns/favorites?qa=empty' },
      { label: '에러', path: '/campaigns/favorites?qa=error' },
    ],
  },

  /* ────────────────── 캠페인 탐색 ────────────────── */
  {
    label: '캠페인 탐색',
    children: [
      { label: '기본 (캠페인 있음)', path: '/campaigns/browse' },
      { label: '로딩 스켈레톤', path: '/campaigns/browse?qa=loading' },
      { label: '검색 결과 없음', path: '/campaigns/browse?qa=empty-search' },
      { label: '전체 빈 상태', path: '/campaigns/browse?qa=empty' },
      { label: '상세 바텀시트 열림', path: '/campaigns/browse?qa=modal-detail' },
      { label: '에러', path: '/campaigns/browse?qa=error' },
    ],
  },

  /* ────────────────── 나의 캠페인 ────────────────── */
  {
    label: '나의 캠페인',
    children: [
      { label: '기본 (전체 탭)', path: '/campaigns/my' },
      { label: '로딩 스켈레톤', path: '/campaigns/my?qa=loading' },
      { label: '탭 — 신청완료', path: '/campaigns/my?qa=tab-신청완료' },
      { label: '탭 — 신청완료 빈 상태', path: '/campaigns/my?qa=tab-신청완료-empty' },
      { label: '탭 — 진행중', path: '/campaigns/my?qa=tab-진행중' },
      { label: '탭 — 진행중 빈 상태', path: '/campaigns/my?qa=tab-진행중-empty' },
      { label: '탭 — 게시완료', path: '/campaigns/my?qa=tab-게시완료' },
      { label: '탭 — 게시완료 빈 상태', path: '/campaigns/my?qa=tab-게시완료-empty' },
      { label: '탭 — 포인트지급', path: '/campaigns/my?qa=tab-포인트지급' },
      { label: '전체 빈 상태 — 참여 없음', path: '/campaigns/my?qa=empty' },
      { label: '모달 — 취소 확인', path: '/campaigns/my?qa=modal-cancel' },
      { label: '모달 — 콘텐츠 제출', path: '/campaigns/my?qa=modal-submit' },
      { label: '에러', path: '/campaigns/my?qa=error' },
    ],
  },

  /* ────────────────── 캠페인 상세 ────────────────── */
  {
    label: '캠페인 상세',
    children: [
      { label: '기본 (미신청)', path: '/campaigns/1' },
      { label: '로딩 스켈레톤', path: '/campaigns/1?qa=loading' },
      { label: '신청 완료 상태', path: '/campaigns/1?qa=applied' },
      { label: '마감된 캠페인', path: '/campaigns/1?qa=closed' },
      { label: '에러', path: '/campaigns/1?qa=error' },
    ],
  },

  /* ────────────────── 캠페인 신청 폼 ────────────────── */
  {
    label: '캠페인 신청 폼',
    children: [
      { label: '배송형 + 커스텀 질문 (캠페인 1)', path: '/campaigns/1/apply' },
      { label: '배송형 (캠페인 2)', path: '/campaigns/2/apply' },
      { label: '타입 미지정 (캠페인 3)', path: '/campaigns/3/apply' },
      { label: '신청 정보 보기 (view 모드)', path: '/campaigns/2/apply?mode=view' },
    ],
  },

  /* ────────────────── 프로필 ────────────────── */
  {
    label: '프로필',
    children: [
      { label: '기본 (내 정보)', path: '/profile' },
      { label: '로딩 스켈레톤', path: '/profile?qa=loading' },
      { label: '수정 모드', path: '/profile?qa=edit' },
      { label: '모달 — 비밀번호 변경', path: '/profile?qa=modal-password' },
      { label: '모달 — 회원 탈퇴', path: '/profile?qa=modal-withdraw' },
      { label: '에러', path: '/profile?qa=error' },
    ],
  },

  /* ────────────────── 정산 ────────────────── */
  {
    label: '정산',
    children: [
      { label: '기본 (정산 내역)', path: '/settlement' },
      { label: '로딩', path: '/settlement?qa=loading' },
      { label: '빈 상태', path: '/settlement?qa=empty' },
      { label: '모달 — 정산 요청', path: '/settlement?qa=modal-request' },
      { label: '에러', path: '/settlement?qa=error' },
    ],
  },

  /* ────────────────── SNS 관리 ────────────────── */
  {
    label: 'SNS 관리',
    children: [
      { label: '인스타그램만 연결 (기본)', path: '/media' },
      { label: '로딩 스켈레톤', path: '/media?qa=loading' },
      { label: '전체 미연결', path: '/media?qa=all-disconnected' },
      { label: '전체 연결됨', path: '/media?qa=all-connected' },
      { label: '모달 — 연결', path: '/media?qa=modal-connect' },
      { label: '모달 — 연결 해제', path: '/media?qa=modal-disconnect' },
      { label: '에러', path: '/media?qa=error' },
    ],
  },
]

void GLOBAL_QA_HEADER_HEIGHT

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const [qaOpen, setQaOpen] = useState(false)

  const handleNavigate = ({ path }: { path?: string }) => {
    if (path) { navigate(path); setQaOpen(false) }
  }

  useEffect(() => {
    const titles: Record<string, string> = {
      '/home':             '홈 — WELLINK AI',
      '/campaigns/browse':    '캠페인 탐색 — WELLINK AI',
      '/campaigns/favorites': '관심 캠페인 — WELLINK AI',
      '/campaigns/my':        '나의 캠페인 — WELLINK AI',
      '/profile':          '프로필 — WELLINK AI',
      '/media':            'SNS 관리 — WELLINK AI',
      '/settlement':       '정산 — WELLINK AI',
      '/login':            '로그인 — WELLINK AI',
      '/signup':           '회원가입 — WELLINK AI',
    }
    const path = location.pathname
    const title = titles[path] ?? (path.startsWith('/campaigns/') ? '캠페인 상세 — WELLINK AI' : 'WELLINK AI')
    document.title = title
  }, [location.pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/campaigns/browse" element={<ProtectedRoute><CampaignBrowse /></ProtectedRoute>} />
        <Route path="/campaigns/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/campaigns/my" element={<ProtectedRoute><MyCampaign /></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
        <Route path="/campaigns/:id/apply" element={<ProtectedRoute><CampaignApply /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
        <Route path="/settlement" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <button
        onClick={() => setQaOpen(o => !o)}
        aria-label="QA 패널 열기"
        className="fixed bottom-4 right-4 z-[1100] h-11 px-4 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700 flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        {qaOpen ? <X size={16} /> : <Settings size={16} />}
        <span>QA</span>
      </button>

      {qaOpen && (
        <GlobalQAHeader
          title="웰링크 인플루언서 POC"
          pathItems={STATUS_ITEMS}
          onNavigate={handleNavigate}
          accentColor="var(--color-brand-green)"
        />
      )}
    </>
  )
}

function AppShell() {
  return <AppRoutes />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <AppShell />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  )
}
