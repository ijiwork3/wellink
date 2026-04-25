import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProfileInsight from './pages/ProfileInsight'
import AdPerformance from './pages/AdPerformance'
import ViralMetrics from './pages/ViralMetrics'
import InfluencerList from './pages/InfluencerList'
import InfluencerManage from './pages/InfluencerManage'
import Campaigns from './pages/Campaigns'
import CampaignNew from './pages/CampaignNew'
import CampaignDetail from './pages/CampaignDetail'
import Library from './pages/Library'
import Subscription from './pages/Subscription'
import MyPage from './pages/MyPage'
import Moodboard from './pages/Moodboard'
import { GlobalQAHeader, GLOBAL_QA_HEADER_HEIGHT, type StatusItem } from './qa-mockup-kit'
import { ToastProvider, ProtectedRoute, ErrorBoundary } from '@wellink/ui'

const BRAND_TAB_MAP: Record<string, string> = {
  login: '/login',
  dashboard: '/dashboard',
}

const STATUS_ITEMS: StatusItem[] = [
  /* ────────────────── 정상 ────────────────── */
  {
    label: '정상',
    children: [
      { label: '대시보드', path: '/dashboard' },
      { label: '로그인 — 기본', path: '/login' },
    ],
  },

  /* ────────────────── 온보딩 ────────────────── */
  {
    label: '온보딩',
    children: [
      { label: '로그인 — 기본', path: '/login' },
      { label: '로그인 — 오류 상태', path: '/login?qa=error' },
      { label: '로그인 — 입력 완료', path: '/login?qa=filled' },
      { label: '로그인 — 로딩 중', path: '/login?qa=loading' },
      { label: '회원가입 — 기본 (빈 폼)', path: '/signup' },
      { label: '회원가입 — 입력 완료', path: '/signup?qa=filled' },
      { label: '회원가입 — 유효성 에러', path: '/signup?qa=error' },
    ],
  },

  /* ────────────────── 대시보드 ────────────────── */
  {
    label: '대시보드',
    children: [
      { label: '기본 (데이터 있음)', path: '/dashboard' },
      { label: '로딩 스켈레톤', path: '/dashboard?qa=loading' },
      { label: '빈 상태 — 캠페인 없음', path: '/dashboard?qa=empty' },
      { label: '신규 회원 온보딩', path: '/dashboard?qa=new-user' },
      { label: 'Focus 플랜 — 기능 잠금', path: '/dashboard?qa=plan-locked' },
      { label: '에러', path: '/dashboard?qa=error' },
    ],
  },

  /* ────────────────── 프로필 인사이트 ────────────────── */
  {
    label: '프로필 인사이트',
    children: [
      { label: '기본 (데이터 있음)', path: '/analytics/profile' },
      { label: '로딩 스켈레톤', path: '/analytics/profile?qa=loading' },
      { label: '빈 상태 — 데이터 없음', path: '/analytics/profile?qa=empty' },
      { label: '에러', path: '/analytics/profile?qa=error' },
    ],
  },

  /* ────────────────── 광고 성과 ────────────────── */
  {
    label: '광고 성과',
    children: [
      { label: '기본 (Meta 광고 연결됨)', path: '/analytics/ads' },
      { label: '로딩 스켈레톤', path: '/analytics/ads?qa=loading' },
      { label: '지표 전부 0 (광고 시작 직후)', path: '/analytics/ads?qa=zero' },
      { label: '빈 상태 — 집행 광고 없음', path: '/analytics/ads?qa=empty' },
      { label: 'Instagram 미연결', path: '/analytics/ads?qa=disconnected' },
      { label: '에러', path: '/analytics/ads?qa=error' },
    ],
  },

  /* ────────────────── 바이럴 지표 ────────────────── */
  {
    label: '바이럴 지표',
    children: [
      { label: '기본 (인스타 연결됨)', path: '/analytics/viral' },
      { label: '로딩 스켈레톤', path: '/analytics/viral?qa=loading' },
      { label: '지표 전부 0 (엣지케이스)', path: '/analytics/viral?qa=zero' },
      { label: '빈 상태 — 바이럴 콘텐츠 없음', path: '/analytics/viral?qa=empty' },
      { label: '에러', path: '/analytics/viral?qa=error' },
    ],
  },

  /* ────────────────── 인플루언서 리스트 ────────────────── */
  {
    label: '인플루언서 리스트',
    children: [
      { label: '기본 (데이터 있음)', path: '/influencers/list' },
      { label: '로딩 스켈레톤', path: '/influencers/list?qa=loading' },
      { label: '검색 결과 없음', path: '/influencers/list?qa=empty-search' },
      { label: '필터 결과 없음', path: '/influencers/list?qa=filter-empty' },
      { label: '전체 빈 상태', path: '/influencers/list?qa=empty' },
      { label: '상세 모달 열림', path: '/influencers/list?qa=modal-detail' },
      { label: '제안 모달 열림', path: '/influencers/list?qa=modal-proposal' },
      { label: '에러', path: '/influencers/list?qa=error' },
    ],
  },

  /* ────────────────── 인플루언서 관리 ────────────────── */
  {
    label: '인플루언서 관리',
    children: [
      { label: '기본 (찜 목록 있음)', path: '/influencers/manage' },
      { label: '로딩 스켈레톤', path: '/influencers/manage?qa=loading' },
      { label: '새 그룹 모달 열림', path: '/influencers/manage?qa=modal-new-group' },
      { label: '빈 상태 — 찜 없음', path: '/influencers/manage?qa=empty' },
      { label: '에러', path: '/influencers/manage?qa=error' },
    ],
  },

  /* ────────────────── 캠페인 목록 ────────────────── */
  {
    label: '캠페인 목록',
    children: [
      { label: '기본 (리스트뷰)', path: '/campaigns' },
      { label: '로딩 스켈레톤', path: '/campaigns?qa=loading' },
      { label: '그리드뷰', path: '/campaigns?qa=grid' },
      { label: '필터 결과 없음', path: '/campaigns?qa=filter-empty' },
      { label: '빈 상태 — 캠페인 없음', path: '/campaigns?qa=empty' },
      { label: '에러', path: '/campaigns?qa=error' },
    ],
  },

  /* ────────────────── 새 캠페인 ────────────────── */
  {
    label: '새 캠페인 등록',
    children: [
      { label: 'Step 1 — 기본정보 (빈 폼)', path: '/campaigns/new' },
      { label: 'Step 2 — 예산·조건', path: '/campaigns/new?qa=step-2' },
      { label: 'Step 3 — 원고가이드', path: '/campaigns/new?qa=step-3' },
      { label: 'Step 4 — 인플루언서 선택', path: '/campaigns/new?qa=step-4' },
      { label: 'Step 5 — 검토·발행 (입력 완료)', path: '/campaigns/new?qa=filled' },
      { label: '발행 완료 모달', path: '/campaigns/new?qa=modal-complete' },
      { label: '에러', path: '/campaigns/new?qa=error' },
    ],
  },

  /* ────────────────── 캠페인 상세 ────────────────── */
  {
    label: '캠페인 상세',
    children: [
      { label: '기본 (캠페인 정보 탭)', path: '/campaigns/1' },
      { label: '로딩 스켈레톤', path: '/campaigns/1?qa=loading' },
      { label: '종료된 캠페인', path: '/campaigns/1?qa=campaign-closed' },
      { label: '탭 — 지원자 관리', path: '/campaigns/1?qa=tab-applicants' },
      { label: '탭 — 지원자 빈 상태', path: '/campaigns/1?qa=tab-applicants-empty' },
      { label: '탭 — 선정된 지원자', path: '/campaigns/1?qa=tab-selected' },
      { label: '탭 — 선정 없음 (빈 상태)', path: '/campaigns/1?qa=tab-selected-empty' },
      { label: '탭 — 등록 콘텐츠', path: '/campaigns/1?qa=tab-content' },
      { label: '탭 — 콘텐츠 빈 상태', path: '/campaigns/1?qa=tab-content-empty' },
      { label: '탭 — 성과 리포트', path: '/campaigns/1?qa=tab-report' },
      { label: '탭 — 리포트 데이터 없음', path: '/campaigns/1?qa=tab-report-empty' },
      { label: '모달 — 지원자 승인', path: '/campaigns/1?qa=modal-approve' },
      { label: '모달 — 지원자 반려', path: '/campaigns/1?qa=modal-reject' },
      { label: '에러', path: '/campaigns/1?qa=error' },
    ],
  },

  /* ────────────────── 콘텐츠 라이브러리 ────────────────── */
  {
    label: '콘텐츠 라이브러리',
    children: [
      { label: '기본 (그리드뷰)', path: '/library' },
      { label: '로딩 스켈레톤', path: '/library?qa=loading' },
      { label: '리스트뷰', path: '/library?qa=view-list' },
      { label: '빈 상태', path: '/library?qa=empty' },
      { label: '에러', path: '/library?qa=error' },
    ],
  },

  /* ────────────────── 구독 관리 ★ 요금제별 ────────────────── */
  {
    label: '구독 관리 ★',
    children: [
      { label: '로딩 스켈레톤', path: '/subscription?qa=loading' },
      { label: 'Scale 플랜 활성 (기본)', path: '/subscription' },
      { label: 'Focus 플랜 활성', path: '/subscription?qa=plan-focus' },
      { label: 'Infinite 플랜 활성', path: '/subscription?qa=plan-infinite' },
      { label: '무료 체험 중 (Trial D-7)', path: '/subscription?qa=trial' },
      { label: '미구독 (무료 상태)', path: '/subscription?qa=plan-free' },
      { label: '결제 수단 없음', path: '/subscription?qa=no-payment' },
      { label: '모달 — 업그레이드', path: '/subscription?qa=modal-upgrade' },
      { label: '모달 — 다운그레이드', path: '/subscription?qa=modal-downgrade' },
      { label: '구독 만료 배너', path: '/subscription?qa=expired' },
      { label: '결제 실패 배너', path: '/subscription?qa=payment-failed' },
      { label: '에러', path: '/subscription?qa=error' },
    ],
  },

  /* ────────────────── 마이페이지 ────────────────── */
  {
    label: '마이페이지',
    children: [
      { label: '기본 (광고주 정보 탭)', path: '/mypage' },
      { label: '로딩 스켈레톤', path: '/mypage?qa=loading' },
      { label: '편집 모드 강조', path: '/mypage?qa=edit' },
      { label: '탭 — 팀 멤버', path: '/mypage?qa=tab-team' },
      { label: '탭 — 구독 관리', path: '/mypage?qa=tab-settings' },
      { label: '모달 — 비밀번호 변경', path: '/mypage?qa=modal-password' },
      { label: '모달 — 회원 탈퇴', path: '/mypage?qa=modal-withdraw' },
      { label: '에러', path: '/mypage?qa=error' },
    ],
  },
]

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const titles: Record<string, string> = {
      '/dashboard':          '대시보드 — WELLINK AI',
      '/analytics/profile':  '프로필 인사이트 — WELLINK AI',
      '/analytics/ads':      '광고 성과 — WELLINK AI',
      '/analytics/viral':    '바이럴 지표 — WELLINK AI',
      '/influencers/list':   '인플루언서 리스트 — WELLINK AI',
      '/influencers/manage': '인플루언서 관리 — WELLINK AI',
      '/campaigns':          '캠페인 관리 — WELLINK AI',
      '/campaigns/new':      '새 캠페인 등록 — WELLINK AI',
      '/library':            '콘텐츠 라이브러리 — WELLINK AI',
      '/subscription':       '구독 관리 — WELLINK AI',
      '/mypage':             '마이페이지 — WELLINK AI',
      '/login':              '로그인 — WELLINK AI',
      '/signup':             '회원가입 — WELLINK AI',
    }
    const path = location.pathname
    const title = titles[path] ?? (path.startsWith('/campaigns/') ? '캠페인 상세 — WELLINK AI' : 'WELLINK AI')
    document.title = title
  }, [location.pathname])

  const handleNavigate = ({ path }: { path?: string }) => {
    if (path) navigate(path)
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/moodboard" element={<Moodboard />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics/profile" element={<ProfileInsight />} />
          <Route path="/analytics/ads" element={<AdPerformance />} />
          <Route path="/analytics/viral" element={<ViralMetrics />} />
          <Route path="/influencers/list" element={<InfluencerList />} />
          <Route path="/influencers/manage" element={<InfluencerManage />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<CampaignNew />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/library" element={<Library />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {location.pathname !== '/moodboard' && (
        <GlobalQAHeader
          pathItems={STATUS_ITEMS}
          onNavigate={handleNavigate}
          accentColor="var(--color-brand-green)"
        />
      )}
    </>
  )
}

// 미사용 변수 제거를 위한 ref (TAB_MAP은 더 이상 사용 안 함)
void BRAND_TAB_MAP

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <div style={{ paddingTop: GLOBAL_QA_HEADER_HEIGHT }}>
            <AppRoutes />
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  )
}
