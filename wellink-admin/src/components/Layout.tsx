import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { MockupShell, type StatusItem } from '../qa-mockup-kit'

const ADMIN_TAB_MAP: Record<string, string> = {
  dashboard:            '/dashboard',
  'analytics/profile':  '/analytics/profile',
  'analytics/ads':      '/analytics/ads',
  'analytics/viral':    '/analytics/viral',
  'influencers/list':   '/influencers/list',
  'influencers/manage': '/influencers/manage',
  'influencers/dm':     '/influencers/dm',
  'influencers/ai':     '/influencers/ai',
  campaigns:            '/campaigns',
  'campaigns/new':      '/campaigns/new',
  library:              '/library',
  subscription:         '/subscription',
  mypage:               '/mypage',
}

function makeStateItems(navigate: (path: string) => void): StatusItem[] {
  return [
    {
      label: '로그인',
      children: [
        { label: '비로그인', onSelect: () => navigate('/login') },
        { label: '로그인' },
      ],
    },
  ]
}

const STATUS_ITEMS: StatusItem[] = [
  {
    label: '진입',
    children: [
      { label: '로그인 화면', path: '/login' },
    ],
  },
  {
    label: '분석',
    children: [
      { label: '홈 대시보드',     path: '/dashboard' },
      { label: '프로필 인사이트', path: '/analytics/profile' },
      { label: '광고 성과',       path: '/analytics/ads' },
      { label: '바이럴 지표',     path: '/analytics/viral' },
    ],
  },
  {
    label: '인플루언서',
    children: [
      { label: '인플루언서 리스트',                   path: '/influencers/list' },
      { label: '인플루언서 리스트 / 상세 모달',        path: '/influencers/list?modal=detail' },
      { label: '인플루언서 리스트 / 상세 / 제안 모달', path: '/influencers/list?modal=proposal' },
      { label: '인플루언서 관리',                     path: '/influencers/manage' },
      { label: '인플루언서 관리 / 새 그룹 모달',       path: '/influencers/manage?modal=newgroup' },
      { label: 'DM 관리',                             path: '/influencers/dm' },
      { label: 'AI 리스트업 / 입력',                  path: '/influencers/ai?phase=idle' },
      { label: 'AI 리스트업 / 분석 중',               path: '/influencers/ai?phase=loading' },
      { label: 'AI 리스트업 / 결과',                  path: '/influencers/ai?phase=done' },
    ],
  },
  {
    label: '캠페인',
    children: [
      { label: '캠페인 목록',                            path: '/campaigns' },
      { label: '캠페인 상세',                            path: '/campaigns/1' },
      { label: '캠페인 상세 / 콘텐츠 다운로드 모달',     path: '/campaigns/1?modal=download' },
      { label: '캠페인 상세 / 콘텐츠 반려 모달',         path: '/campaigns/1?modal=reject' },
      { label: '캠페인 만들기 / Step 1 기본정보',        path: '/campaigns/new?step=1' },
      { label: '캠페인 만들기 / Step 2 예산·조건',       path: '/campaigns/new?step=2' },
      { label: '캠페인 만들기 / Step 3 원고가이드',      path: '/campaigns/new?step=3' },
      { label: '캠페인 만들기 / Step 4 인플루언서',      path: '/campaigns/new?step=4' },
      { label: '캠페인 만들기 / Step 5 검토·발행',       path: '/campaigns/new?step=5' },
      { label: '캠페인 만들기 / Step 5 / 등록 완료 모달', path: '/campaigns/new?step=5&modal=completed' },
    ],
  },
  {
    label: '라이브러리',
    children: [
      { label: '라이브러리',                  path: '/library' },
      { label: '라이브러리 / 콘텐츠 상세 모달', path: '/library?modal=preview' },
    ],
  },
  {
    label: '설정',
    children: [
      { label: '구독 플랜',                        path: '/subscription' },
      { label: '구독 플랜 / 플랜 변경 모달',        path: '/subscription?modal=planchange' },
      { label: '마이페이지',                       path: '/mypage' },
      { label: '마이페이지 / 비밀번호 변경 모달',   path: '/mypage?modal=password' },
      { label: '마이페이지 / Instagram 연결 모달', path: '/mypage?modal=instagram' },
    ],
  },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <MockupShell
      appLabel="[광고주]"
      screenLabel={`[광고주] ${location.pathname}${location.search}`}
      validStates={[]}
      tabMap={ADMIN_TAB_MAP}
      stateItems={makeStateItems(navigate)}
      statusItems={STATUS_ITEMS}
      onNavigate={({ path }) => path && navigate(path, { state: { _ts: Date.now() } })}
      onReset={() => navigate('/dashboard')}
      accentColor="#6366f1"
      defaultDevice="desktop"
      containerClassName="bg-[#FAFAFA]"
    >
      <div className="flex w-full h-full">
        {/* 사이드바: 태블릿·PC에서만 표시 */}
        <div className="hidden sm:block">
          <Sidebar />
        </div>

        {/* 모바일 드로어 오버레이 */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* 모바일 드로어 */}
        <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 sm:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onClose={() => setDrawerOpen(false)} />
        </div>

        <div className="flex-1 overflow-y-auto min-w-0 flex flex-col">
          {/* 모바일 GNB */}
          <header className="sm:hidden h-14 flex-shrink-0 flex items-center justify-between px-4 bg-white border-b border-gray-100">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5"
              aria-label="메뉴 열기"
            >
              <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
              <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
              <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-gray-900">WELLINK</span>
              <span className="text-[9px] font-medium bg-[#8CC63F] text-white px-1.5 py-0.5 rounded-full leading-none">브랜드</span>
            </div>
            <button
              onClick={() => navigate('/mypage')}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
            >
              <span className="text-xs font-medium">T</span>
            </button>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-8 sm:py-7 max-w-[1080px]">
            <Outlet />
          </main>
        </div>
      </div>
    </MockupShell>
  )
}
