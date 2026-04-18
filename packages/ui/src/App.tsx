import { useState } from 'react'
import { Menu, X, ExternalLink } from 'lucide-react'

// Stories
import StatusBadgeStory   from './gallery/stories/StatusBadgeStory'
import PlatformBadgeStory from './gallery/stories/PlatformBadgeStory'
import KPICardStory       from './gallery/stories/KPICardStory'
import InfluencerCardStory from './gallery/stories/InfluencerCardStory'
import ModalStory         from './gallery/stories/ModalStory'
import ToastStory         from './gallery/stories/ToastStory'
import FormStory          from './gallery/stories/FormStory'
import SNSPanelStory      from './gallery/stories/SNSPanelStory'

/* ─── 네비 구조 ─── */
const sections = [
  {
    label: 'Foundations',
    items: [
      { id: 'overview', label: 'Overview' },
    ],
  },
  {
    label: 'Badges',
    items: [
      { id: 'status-badge', label: 'StatusBadge' },
      { id: 'platform-badge', label: 'PlatformBadge' },
    ],
  },
  {
    label: 'Cards',
    items: [
      { id: 'kpi-card', label: 'KPICard' },
      { id: 'influencer-card', label: 'InfluencerCard' },
    ],
  },
  {
    label: 'Feedback',
    items: [
      { id: 'modal', label: 'Modal' },
      { id: 'toast', label: 'Toast' },
    ],
  },
  {
    label: 'Form',
    items: [
      { id: 'form', label: 'Form Components' },
    ],
  },
  {
    label: 'Data Display',
    items: [
      { id: 'sns-panel', label: 'SNSPanel' },
    ],
  },
]

const storyMap: Record<string, React.ReactNode> = {
  'status-badge':    <StatusBadgeStory />,
  'platform-badge':  <PlatformBadgeStory />,
  'kpi-card':        <KPICardStory />,
  'influencer-card': <InfluencerCardStory />,
  'modal':           <ModalStory />,
  'toast':           <ToastStory />,
  'form':            <FormStory />,
  'sns-panel':       <SNSPanelStory />,
}

/* ─── Overview 페이지 ─── */
function Overview() {
  const allComponents = [
    { name: 'StatusBadge', desc: '상태 배지 — 5그룹 컬러 정책', group: 'Badges' },
    { name: 'PlatformBadge', desc: 'SNS 플랫폼 배지', group: 'Badges' },
    { name: 'KPICard', desc: '지표 요약 카드', group: 'Cards' },
    { name: 'InfluencerCard', desc: '인플루언서 카드', group: 'Cards' },
    { name: 'Modal', desc: '공통 모달', group: 'Feedback' },
    { name: 'Toast / useToast', desc: '토스트 알림 (Context)', group: 'Feedback' },
    { name: 'CustomSelect', desc: '셀렉트박스 (단일/다중)', group: 'Form' },
    { name: 'TagInput', desc: '태그 입력', group: 'Form' },
    { name: 'FileUpload', desc: '파일 업로드 (드래그앤드롭)', group: 'Form' },
    { name: 'Toggle', desc: '스위치 토글', group: 'Form' },
    { name: 'CustomCheckbox', desc: '커스텀 체크박스', group: 'Form' },
    { name: 'Dropdown', desc: '드롭다운 메뉴', group: 'Form' },
    { name: 'SNSPanel', desc: 'SNS 연결 상태 패널', group: 'Data Display' },
  ]

  const colorPolicy = [
    { group: 'active', color: 'bg-emerald-100 text-emerald-700', states: '모집중, 진행중' },
    { group: 'pending', color: 'bg-amber-100 text-amber-700', states: '대기중, 신청완료, 콘텐츠대기' },
    { group: 'review', color: 'bg-sky-100 text-sky-700', states: '검수중' },
    { group: 'done', color: 'bg-slate-100 text-slate-500', states: '완료, 종료, 마감, 게시완료, 포인트지급' },
    { group: 'alert', color: 'bg-rose-100 text-rose-600', states: '반려, 마감임박' },
  ]

  return (
    <div>
      <div className="mb-10 pb-8 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold tracking-tight text-gray-900">WELLINK</span>
          <span className="text-xs font-semibold bg-[#8CC63F] text-white px-2.5 py-1 rounded-full">UI</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
          Wellink 전사 공통 UI 컴포넌트 라이브러리.<br />
          Admin / Brand / Influencer 3개 앱에서 공유하는 컴포넌트를 관리합니다.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-mono">React 19</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-mono">TypeScript</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-mono">Tailwind CSS v4</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-mono">Lucide React</span>
        </div>
      </div>

      {/* 컴포넌트 목록 */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-4">Components <span className="text-gray-400 font-normal text-sm ml-1">{allComponents.length}개</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allComponents.map(c => (
            <div key={c.name} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#8CC63F]/40 hover:shadow-sm transition-all">
              <p className="text-sm font-semibold text-gray-900 font-mono">{c.name}</p>
              <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
              <span className="inline-block mt-2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{c.group}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 컬러 정책 */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-1">Status Color Policy</h2>
        <p className="text-xs text-gray-500 mb-4">원색 사용 금지 — bg-*-100 / text-*-600~700 톤 유지</p>
        <div className="space-y-2">
          {colorPolicy.map(c => (
            <div key={c.group} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.color} w-20 text-center shrink-0`}>{c.group}</span>
              <span className="text-xs text-gray-600">{c.states}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 브랜드 컬러 */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Brand Colors</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#8CC63F' }} />
            <div>
              <p className="text-xs font-semibold text-gray-900">Primary</p>
              <p className="text-xs font-mono text-gray-500">#8CC63F</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#7AB535' }} />
            <div>
              <p className="text-xs font-semibold text-gray-900">Hover</p>
              <p className="text-xs font-mono text-gray-500">#7AB535</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900" />
            <div>
              <p className="text-xs font-semibold text-gray-900">Text Primary</p>
              <p className="text-xs font-mono text-gray-500">#111827</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#FAFAFA' }} />
            <div>
              <p className="text-xs font-semibold text-gray-900">BG</p>
              <p className="text-xs font-mono text-gray-500">#FAFAFA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Sidebar ─── */
function Sidebar({ active, onChange, onClose }: {
  active: string
  onChange: (id: string) => void
  onClose?: () => void
}) {
  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 tracking-tight">WELLINK</span>
          <span className="text-[10px] font-semibold bg-[#8CC63F] text-white px-1.5 py-0.5 rounded-full">UI</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* 버전 뱃지 */}
      <div className="px-5 mb-4">
        <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">v1.0.0</span>
      </div>

      {/* 네비 */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map(sec => (
          <div key={sec.label} className="mb-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">{sec.label}</div>
            {sec.items.map(item => (
              <button
                key={item.id}
                onClick={() => { onChange(item.id); onClose?.() }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-150 ${
                  active === item.id
                    ? 'bg-[#8CC63F]/10 text-[#7AB535] font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* 하단 링크 */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-1">
        <a
          href="https://github.com/ijiwork3/wellink"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ExternalLink size={12} />
          GitHub
        </a>
      </div>
    </aside>
  )
}

/* ─── App ─── */
export default function App() {
  const [active, setActive] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)

  const content = active === 'overview' ? <Overview /> : (storyMap[active] ?? <Overview />)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">

      {/* 사이드바 — 데스크탑: 항상 표시 */}
      <div className="hidden lg:flex lg:flex-col w-[220px] shrink-0 h-full">
        <Sidebar active={active} onChange={setActive} />
      </div>

      {/* 사이드바 — 모바일: 오버레이 */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[240px] z-10">
            <Sidebar active={active} onChange={setActive} onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* 모바일 헤더 */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-1"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-gray-900">WELLINK UI</span>
        </header>

        {/* 스크롤 영역 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {content}
          </div>
        </main>
      </div>
    </div>
  )
}
