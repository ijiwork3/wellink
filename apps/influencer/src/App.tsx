import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import CampaignBrowse from './pages/CampaignBrowse'
import MyCampaign from './pages/MyCampaign'
import CampaignDetail from './pages/CampaignDetail'
import Profile from './pages/Profile'
import Media from './pages/Media'
import Settlement from './pages/Settlement'
import Signup from './pages/Signup'
import { MockupShell, type StatusItem } from './qa-mockup-kit'
import { ToastProvider, ProtectedRoute, ErrorBoundary } from '@wellink/ui'

const INF_TAB_MAP: Record<string, string> = {
  home: '/home',
  browse: '/campaigns/browse',
  my: '/campaigns/my',
  profile: '/profile',
  media: '/media',
}

const STATE_ITEMS: StatusItem[] = [
  {
    label: '로그인 상태',
    children: [
      { label: '로그인됨 (홈)', path: '/home' },
      { label: '비로그인 (로그인 화면)', path: '/login' },
    ],
  },
  {
    label: 'SNS 연결 상태',
    children: [
      { label: '인스타그램만 연결 (기본)', path: '/media' },
      { label: '전체 미연결', path: '/media?qa=all-disconnected' },
      { label: '전체 연결됨', path: '/media?qa=all-connected' },
    ],
  },
  {
    label: '글로벌 에러',
    children: [
      { label: '홈 에러', path: '/home?qa=error' },
      { label: '캠페인 탐색 에러', path: '/campaigns/browse?qa=error' },
      { label: '나의 캠페인 에러', path: '/campaigns/my?qa=error' },
      { label: '캠페인 상세 에러', path: '/campaigns/1?qa=error' },
      { label: '프로필 에러', path: '/profile?qa=error' },
      { label: 'SNS 관리 에러', path: '/media?qa=error' },
    ],
  },
  {
    label: '글로벌 로딩',
    children: [
      { label: '홈 로딩', path: '/home?qa=loading' },
      { label: '캠페인 탐색 로딩', path: '/campaigns/browse?qa=loading' },
      { label: '나의 캠페인 로딩', path: '/campaigns/my?qa=loading' },
      { label: '캠페인 상세 로딩', path: '/campaigns/1?qa=loading' },
      { label: '프로필 로딩', path: '/profile?qa=loading' },
      { label: 'SNS 관리 로딩', path: '/media?qa=loading' },
    ],
  },
]

const STATUS_ITEMS: StatusItem[] = [
  /* ────────────────── 정상 ────────────────── */
  {
    label: '정상',
    children: [
      { label: '홈 (관심 캠페인)', path: '/home' },
      { label: '캠페인 탐색', path: '/campaigns/browse' },
      { label: '나의 캠페인', path: '/campaigns/my' },
    ],
  },

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

  /* ────────────────── 홈 (관심 캠페인) ────────────────── */
  {
    label: '홈 (관심 캠페인)',
    children: [
      { label: '기본 (북마크 있음)', path: '/home' },
      { label: '로딩 스켈레톤', path: '/home?qa=loading' },
      { label: '빈 상태 — 북마크 없음', path: '/home?qa=empty' },
      { label: '에러', path: '/home?qa=error' },
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
      { label: '신청 모달 열림', path: '/campaigns/1?qa=modal-apply' },
      { label: '마감된 캠페인', path: '/campaigns/1?qa=closed' },
      { label: '에러', path: '/campaigns/1?qa=error' },
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

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const titles: Record<string, string> = {
      '/home':              '홈 — WELLINK AI',
      '/campaigns/browse':  '캠페인 탐색 — WELLINK AI',
      '/campaigns/my':      '나의 캠페인 — WELLINK AI',
      '/profile':           '프로필 — WELLINK AI',
      '/media':             'SNS 관리 — WELLINK AI',
      '/login':             '로그인 — WELLINK AI',
      '/signup':            '회원가입 — WELLINK AI',
    }
    const path = location.pathname
    const title = titles[path] ?? (path.startsWith('/campaigns/') ? '캠페인 상세 — WELLINK AI' : 'WELLINK AI')
    document.title = title
  }, [location.pathname])

  return (
    <MockupShell
      appLabel="[인플루언서 포털]"
      screenLabel={`[인플루언서 포털] ${location.pathname}${location.search}`}
      validStates={[]}
      tabMap={INF_TAB_MAP}
      stateItems={STATE_ITEMS}
      statusItems={STATUS_ITEMS}
      onNavigate={({ path }) => path && navigate(path)}
      onReset={() => navigate('/home')}
      accentColor="var(--color-brand-green)"
      defaultDevice="desktop"
      containerClassName="bg-white"
    >
      <div className="w-full h-full overflow-y-auto">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* 보호 경로 — 인증 필요 */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/campaigns/browse" element={<ProtectedRoute><CampaignBrowse /></ProtectedRoute>} />
            <Route path="/campaigns/my" element={<ProtectedRoute><MyCampaign /></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
            <Route path="/settlement" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </MockupShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}
