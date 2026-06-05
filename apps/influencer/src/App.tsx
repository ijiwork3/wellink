import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import CampaignBrowse from './pages/CampaignBrowse'
import MyCampaign from './pages/MyCampaign'
import CampaignDetail from './pages/CampaignDetail'
import CampaignApply from './pages/CampaignApply'
import Profile from './pages/Profile'
import Media from './pages/Media'
import Settlement from './pages/Settlement'
import Favorites from './pages/Favorites'
import Notifications from './pages/Notifications'
import { GlobalQAHeader, type StatusItem } from './qa-mockup-kit'
import { ToastProvider, ProtectedRoute, ErrorBoundary } from '@wellink/ui'
import PhoneVerificationGate from './components/PhoneVerificationGate'

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

  /* ────────────────── 관심 캠페인 ────────────────── */
  {
    label: '관심 캠페인',
    children: [
      { label: '기본 (찜 있음)', path: '/campaigns/favorites' },
      { label: '로딩 스켈레톤', path: '/campaigns/favorites?qa=loading' },
      { label: '빈 상태 — 찜 없음', path: '/campaigns/favorites?qa=empty' },
      { label: '에러', path: '/campaigns/favorites?qa=error' },
    ],
  },

  /* ────────────────── 캠페인 탐색 ────────────────── */
  {
    label: '캠페인 탐색',
    children: [
      { label: '기본 (캠페인 있음)', path: '/campaigns/browse' },
      { label: '상태 — 모집중', path: '/campaigns/browse?qa=status-모집중' },
      { label: '상태 — 마감임박 (D-2)', path: '/campaigns/browse?qa=status-마감임박' },
      { label: '로딩 스켈레톤', path: '/campaigns/browse?qa=loading' },
      { label: '검색 결과 없음', path: '/campaigns/browse?qa=empty-search' },
      { label: '전체 빈 상태', path: '/campaigns/browse?qa=empty' },
      { label: '상세 바텀시트 열림', path: '/campaigns/browse?qa=modal-detail' },
      { label: '에러', path: '/campaigns/browse?qa=error' },
    ],
  },

  /* ────────────────── 내 캠페인 ────────────────── */
  {
    label: '내 캠페인',
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
      { label: '로딩 스켈레톤', path: '/campaigns/1/apply?qa=loading' },
      { label: '에러', path: '/campaigns/1/apply?qa=error' },
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
      { label: '모달 — 전화번호 변경', path: '/profile?qa=modal-phone' },
      { label: '모달 — 회원 탈퇴', path: '/profile?qa=modal-withdraw' },
      { label: '에러', path: '/profile?qa=error' },
    ],
  },

  /* ────────────────── 정산 ────────────────── */
  {
    label: '정산',
    children: [
      { label: '기본 (계좌 있음)', path: '/settlement?qa=has-account' },
      { label: '계좌 없음', path: '/settlement?qa=no-account' },
      { label: '로딩 스켈레톤', path: '/settlement?qa=loading' },
      { label: '빈 상태 — 정산 없음', path: '/settlement?qa=empty' },
      { label: '모달 — 정산 요청', path: '/settlement?qa=modal-request' },
      { label: '에러', path: '/settlement?qa=error' },
    ],
  },

  /* ────────────────── 인스타 관리 ────────────────── */
  {
    label: '인스타 관리',
    children: [
      { label: '인스타 연결됨 (기본)', path: '/media' },
      { label: '인스타 미연결', path: '/media?qa=all-disconnected' },
      { label: '로딩 스켈레톤', path: '/media?qa=loading' },
      { label: '모달 — 연결', path: '/media?qa=modal-connect' },
      { label: '모달 — 연결 해제', path: '/media?qa=modal-disconnect' },
      { label: '데이터 수집 중', path: '/media?qa=updating' },
      { label: '데이터 오류', path: '/media?qa=update-failed' },
      { label: '게시물 0개 경고', path: '/media?qa=no-posts' },
      { label: '에러', path: '/media?qa=error' },
    ],
  },

  /* ────────────────── 알림 ────────────────── */
  {
    label: '알림',
    children: [
      { label: '기본 (전체)', path: '/notifications' },
      { label: '읽지않음만', path: '/notifications?qa=unread-only' },
      { label: '빈 상태', path: '/notifications?qa=empty' },
      { label: '로딩 스켈레톤', path: '/notifications?qa=loading' },
      { label: '에러', path: '/notifications?qa=error' },
      { label: '탭 — 캠페인', path: '/notifications?qa=tab-campaign' },
      { label: '탭 — 콘텐츠', path: '/notifications?qa=tab-content' },
      { label: '탭 — 메시지', path: '/notifications?qa=tab-message' },
      { label: '탭 — 정산', path: '/notifications?qa=tab-settlement' },
      { label: '탭 — 시스템', path: '/notifications?qa=tab-system' },
    ],
  },

]

function getQuickItems(pathname: string): StatusItem[] {
  const err = (base: string) => ({ label: '네트워크 오류', path: `${base}?qa=error` })

  if (pathname === '/login') return [
    { label: '기본',    path: '/login' },
    { label: '입력완료', path: '/login?qa=filled' },
    { label: '로딩',    path: '/login?qa=loading' },
    err('/login'),
  ]
  if (pathname === '/signup') return [
    { label: '기본',    path: '/signup' },
    { label: '입력완료', path: '/signup?qa=filled' },
    { label: '인증완료', path: '/signup?qa=verified' },
    err('/signup'),
  ]
  if (pathname === '/campaigns/browse') return [
    { label: '기본',    path: '/campaigns/browse' },
    { label: '로딩',    path: '/campaigns/browse?qa=loading' },
    { label: '검색없음', path: '/campaigns/browse?qa=empty-search' },
    { label: '빈목록',  path: '/campaigns/browse?qa=empty' },
    err('/campaigns/browse'),
  ]
  if (pathname === '/campaigns/favorites') return [
    { label: '기본',   path: '/campaigns/favorites' },
    { label: '로딩',   path: '/campaigns/favorites?qa=loading' },
    { label: '빈목록', path: '/campaigns/favorites?qa=empty' },
    err('/campaigns/favorites'),
  ]
  if (pathname === '/campaigns/my') return [
    { label: '기본',        path: '/campaigns/my' },
    { label: '로딩',        path: '/campaigns/my?qa=loading' },
    { label: '빈목록',      path: '/campaigns/my?qa=empty' },
    { label: '콘텐츠제출',  path: '/campaigns/my?qa=modal-submit' },
    { label: '취소확인',    path: '/campaigns/my?qa=modal-cancel' },
    err('/campaigns/my'),
  ]
  if (pathname === '/profile') return [
    { label: '기본',    path: '/profile' },
    { label: '로딩',    path: '/profile?qa=loading' },
    { label: '수정모드', path: '/profile?qa=edit' },
    { label: '비번변경', path: '/profile?qa=modal-password' },
    err('/profile'),
  ]
  if (pathname === '/media') return [
    { label: '기본',      path: '/media' },
    { label: '미연결',    path: '/media?qa=all-disconnected' },
    { label: '로딩',      path: '/media?qa=loading' },
    { label: '수집중',    path: '/media?qa=updating' },
    { label: '게시물 0', path: '/media?qa=no-posts' },
    err('/media'),
  ]
  if (pathname === '/notifications') return [
    { label: '기본 (전체)', path: '/notifications' },
    { label: '읽지않음만', path: '/notifications?qa=unread-only' },
    { label: '빈 상태',    path: '/notifications?qa=empty' },
    { label: '로딩',       path: '/notifications?qa=loading' },
    err('/notifications'),
  ]
  // 캠페인 신청 (/campaigns/:id/apply)
  if (pathname.endsWith('/apply')) {
    const base = pathname.replace('/apply', '')
    return [
      { label: '신청폼',   path: pathname },
      { label: 'view모드', path: `${pathname}?mode=view` },
      { label: '수정모드', path: `${pathname}?mode=edit` },
      err(base),
    ]
  }
  // 캠페인 상세 (/campaigns/:id)
  if (pathname.startsWith('/campaigns/')) {
    return [
      { label: '기본',   path: pathname },
      { label: '로딩',   path: `${pathname}?qa=loading` },
      { label: '신청완료', path: `${pathname}?qa=applied` },
      { label: '마감',   path: `${pathname}?qa=closed` },
      err(pathname),
    ]
  }
  return []
}

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const [qaOpen, setQaOpen] = useState(false)

  const handleNavigate = ({ path }: { path?: string }) => {
    if (path) { navigate(path); setQaOpen(false) }
  }

  useEffect(() => {
    const handler = () => setQaOpen(o => !o)
    document.addEventListener('qa-toggle', handler)
    return () => document.removeEventListener('qa-toggle', handler)
  }, [])

  useEffect(() => {
    const titles: Record<string, string> = {
      '/campaigns/browse':    '캠페인 탐색 — WELLINK AI',
      '/campaigns/favorites': '관심 캠페인 — WELLINK AI',
      '/campaigns/my':        '내 캠페인 — WELLINK AI',
      '/profile':             '프로필 — WELLINK AI',
      '/media':               '인스타 관리 — WELLINK AI',
      '/settlement':          '정산 — WELLINK AI',
      '/notifications':       '알림 — WELLINK AI',
      '/login':               '로그인 — WELLINK AI',
      '/signup':              '회원가입 — WELLINK AI',
    }
    const path = location.pathname
    // /campaigns/:id/apply 는 신청 페이지, /campaigns/:id 는 상세 페이지 (cold-review 7차 L10)
    const fallback = path.match(/^\/campaigns\/[^/]+\/apply$/)
      ? '캠페인 신청 — WELLINK AI'
      : path.startsWith('/campaigns/')
        ? '캠페인 상세 — WELLINK AI'
        : 'WELLINK AI'
    const title = titles[path] ?? fallback
    document.title = title
  }, [location.pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/campaigns/browse" replace />} />
        {/* 데모: 앱에는 로그인/회원가입 없음 — 진입 시 메인으로 (로그인은 랜딩에서만) */}
        <Route path="/login" element={<Navigate to="/campaigns/browse" replace />} />
        <Route path="/signup" element={<Navigate to="/campaigns/browse" replace />} />
        <Route path="/campaigns/browse" element={<ProtectedRoute><CampaignBrowse /></ProtectedRoute>} />
        <Route path="/campaigns/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/campaigns/my" element={<ProtectedRoute><MyCampaign /></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
        <Route path="/campaigns/:id/apply" element={<ProtectedRoute><CampaignApply /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
        <Route path="/settlement" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/campaigns/browse" replace />} />
      </Routes>

      {qaOpen && (
        <GlobalQAHeader
          title="웰링크 인플루언서 POC"
          pathItems={STATUS_ITEMS}
          quickItems={getQuickItems(location.pathname)}
          onNavigate={handleNavigate}
          accentColor="var(--color-brand-green)"
        />
      )}
    </>
  )
}

function AppShell() {
  return (
    <PhoneVerificationGate>
      <AppRoutes />
    </PhoneVerificationGate>
  )
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
