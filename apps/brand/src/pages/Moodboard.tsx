import { useState } from 'react'
import {
  Megaphone, Users, Activity, Bell, Heart, Eye,
  LayoutDashboard, BarChart3, TrendingUp, TrendingDown,
  ArrowRight, Download, Search, Image,
} from 'lucide-react'

// ─── 프라이머리 10단계 (버튼 bg·진행바·차트A·알림뱃지) ──────────
const PRIMARY = [
  { n:  1, green:'#8CC63F', greenLight:'#f0f9e8' },
  { n:  2, green:'#88C43A', greenLight:'#edf8de' },
  { n:  3, green:'#82C132', greenLight:'#e8f5d4' },
  { n:  4, green:'#7BBD28', greenLight:'#e0f0c4' },
  { n:  5, green:'#74B81E', greenLight:'#d8ebb8' },
  { n:  6, green:'#6DB214', greenLight:'#d0e6b0' },
  { n:  7, green:'#78C212', greenLight:'#ecfccb' },
  { n:  8, green:'#84CC16', greenLight:'#f7fee7' },
  { n:  9, green:'#95D81A', greenLight:'#f7fee7' },
  { n: 10, green:'#A3E635', greenLight:'#f7fee7' },
]

// ─── 딥 10단계 (텍스트 전용 — 모두 WCAG AA ≥4.5:1) ──────────────
// 1단계: warm lime-dark(#4d7c0f) → 5단계: pure green-dark → 10단계: deep cool emerald(#022c22)
// 허: 황-초록(80°) → 순수초록(145°) → 쿨에메랄드(160°) / 명도도 점점 어두워짐
const SECONDARY = [
  { n:  1, color:'#4d7c0f' },  // lime-700     warm yellow-green (가장 밝은 AA 통과)
  { n:  2, color:'#3b7a18' },  // lime↔green
  { n:  3, color:'#267822' },  // shifting to pure green
  { n:  4, color:'#15802c' },
  { n:  5, color:'#15803d' },  // green-700    순수 그린 (pivot)
  { n:  6, color:'#108050' },  // green→emerald
  { n:  7, color:'#047857' },  // emerald-700
  { n:  8, color:'#065f46' },  // emerald-800
  { n:  9, color:'#064e3b' },  // emerald-900
  { n: 10, color:'#022c22' },  // emerald-950  deepest cool
]

// ─── 나머지 10단계 ─────────────────────────────────────────────────
// 1→5: 연한 파스텔 → 찐하게(deep dark vivid)
// 6→10: 반전 → 밝으면서 원색에 가깝게 (bright saturated 원색)
const ACCENT = [
  // 1: 소프트 파스텔
  { n: 1,
    badgeActiveBg:'#d1fae5', badgeActiveText:'#065f46',
    badgePendingBg:'#fef3c7', badgePendingText:'#92400e',
    barB:'#bae6fd', barC:'#fed7aa', trendDown:'#fca5a5',
    dotA:'#7dd3fc', dotB:'#86efac', dotC:'#fde68a',
    av1:'#4ade80', av2:'#60a5fa', av3:'#c084fc', av4:'#fb7185', av5:'#fb923c',
  },
  // 2: 미디엄 파스텔
  { n: 2,
    badgeActiveBg:'#a7f3d0', badgeActiveText:'#065f46',
    badgePendingBg:'#fde68a', badgePendingText:'#92400e',
    barB:'#93c5fd', barC:'#fcd34d', trendDown:'#fca5a5',
    dotA:'#38bdf8', dotB:'#34d399', dotC:'#fbbf24',
    av1:'#22c55e', av2:'#3b82f6', av3:'#a855f7', av4:'#f43f5e', av5:'#f97316',
  },
  // 3: 비비드 진입
  { n: 3,
    badgeActiveBg:'#6ee7b7', badgeActiveText:'#14532d',
    badgePendingBg:'#fcd34d', badgePendingText:'#78350f',
    barB:'#60a5fa', barC:'#fbbf24', trendDown:'#f87171',
    dotA:'#0ea5e9', dotB:'#10b981', dotC:'#f59e0b',
    av1:'#16a34a', av2:'#2563eb', av3:'#7c3aed', av4:'#e11d48', av5:'#ea580c',
  },
  // 4: 비비드 딥
  { n: 4,
    badgeActiveBg:'#34d399', badgeActiveText:'#064e3b',
    badgePendingBg:'#fb923c', badgePendingText:'#7c2d12',
    barB:'#2563eb', barC:'#ef4444', trendDown:'#dc2626',
    dotA:'#0284c7', dotB:'#059669', dotC:'#d97706',
    av1:'#059669', av2:'#1d4ed8', av3:'#6d28d9', av4:'#be123c', av5:'#c2410c',
  },
  // 5: 찐하게 MAX — 가장 어둡고 포화된 단계
  { n: 5,
    badgeActiveBg:'#10b981', badgeActiveText:'#022c22',
    badgePendingBg:'#f97316', badgePendingText:'#431407',
    barB:'#1e40af', barC:'#b91c1c', trendDown:'#991b1b',
    dotA:'#075985', dotB:'#064e3b', dotC:'#78350f',
    av1:'#047857', av2:'#1e3a8a', av3:'#4c1d95', av4:'#9f1239', av5:'#9a3412',
  },
  // 6: 원색 반전 시작 — 밝아지기 시작
  { n: 6,
    badgeActiveBg:'#34d399', badgeActiveText:'#064e3b',
    badgePendingBg:'#fb923c', badgePendingText:'#7c2d12',
    barB:'#3b82f6', barC:'#ef4444', trendDown:'#ef4444',
    dotA:'#0ea5e9', dotB:'#10b981', dotC:'#f59e0b',
    av1:'#16a34a', av2:'#2563eb', av3:'#7c3aed', av4:'#e11d48', av5:'#ea580c',
  },
  // 7: 원색 방향 — 점점 밝고 선명
  { n: 7,
    badgeActiveBg:'#4ade80', badgeActiveText:'#14532d',
    badgePendingBg:'#fbbf24', badgePendingText:'#78350f',
    barB:'#60a5fa', barC:'#fb923c', trendDown:'#f87171',
    dotA:'#38bdf8', dotB:'#34d399', dotC:'#fbbf24',
    av1:'#22c55e', av2:'#3b82f6', av3:'#a855f7', av4:'#f43f5e', av5:'#f97316',
  },
  // 8: 원색 비비드
  { n: 8,
    badgeActiveBg:'#86efac', badgeActiveText:'#14532d',
    badgePendingBg:'#fde68a', badgePendingText:'#78350f',
    barB:'#93c5fd', barC:'#fcd34d', trendDown:'#fca5a5',
    dotA:'#7dd3fc', dotB:'#6ee7b7', dotC:'#fde68a',
    av1:'#4ade80', av2:'#60a5fa', av3:'#c084fc', av4:'#fb7185', av5:'#fb923c',
  },
  // 9: 원색 브라이트
  { n: 9,
    badgeActiveBg:'#4ade80', badgeActiveText:'#14532d',
    badgePendingBg:'#fb923c', badgePendingText:'#7c2d12',
    barB:'#60a5fa', barC:'#fb923c', trendDown:'#f87171',
    dotA:'#38bdf8', dotB:'#34d399', dotC:'#fbbf24',
    av1:'#22c55e', av2:'#3b82f6', av3:'#a855f7', av4:'#f43f5e', av5:'#f97316',
  },
  // 10: 원색 MAX — pure vivid 원색 팔레트
  { n: 10,
    badgeActiveBg:'#4ade80', badgeActiveText:'#14532d',
    badgePendingBg:'#fbbf24', badgePendingText:'#78350f',
    barB:'#3b82f6', barC:'#ef4444', trendDown:'#ef4444',
    dotA:'#0ea5e9', dotB:'#22c55e', dotC:'#eab308',
    av1:'#22c55e', av2:'#2563eb', av3:'#8b5cf6', av4:'#f43f5e', av5:'#f97316',
  },
]

type P = typeof PRIMARY[0]
type S = typeof SECONDARY[0]
type A = typeof ACCENT[0]

// ─── 배지 공통 ────────────────────────────────────────────────────
function Badge({ bg, text, children }: { bg: string; text: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bg, color: text }}
    >
      {children}
    </span>
  )
}

// ─── 공통 사이드바 ────────────────────────────────────────────────
function Sidebar({ p, active }: { p: P; active: string }) {
  const navItems = [
    { key: 'dashboard', icon: <LayoutDashboard size={15} />, label: '대시보드', section: null },
    { key: 'profile',   icon: <BarChart3 size={15} />,       label: '프로필 인사이트', section: '분석' },
    { key: 'ads',       icon: <TrendingUp size={15} />,       label: '광고 성과', section: '분석' },
    { key: 'list',      icon: <Users size={15} />,            label: '인플루언서 리스트', section: '인플루언서' },
    { key: 'manage',    icon: <Users size={15} />,            label: '인플루언서 관리', section: '인플루언서' },
    { key: 'campaign',  icon: <Megaphone size={15} />,        label: '캠페인 목록', section: '캠페인' },
  ]
  let lastSection = ''
  return (
    <div className="w-[220px] shrink-0 flex flex-col h-full bg-white border-r border-gray-100">
      <div className="px-5 pt-5 pb-4 flex items-center gap-1.5">
        <span className="text-base font-bold tracking-tight text-gray-900">WELLINK</span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none text-white" style={{ backgroundColor: p.green }}>
          광고주
        </span>
      </div>
      <nav className="flex-1 px-3 overflow-y-auto">
        {navItems.map(item => {
          const showSection = item.section && item.section !== lastSection
          if (item.section) lastSection = item.section
          const isActive = item.key === active
          return (
            <div key={item.key}>
              {showSection && (
                <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-3 mt-4 mb-1">{item.section}</div>
              )}
              <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 cursor-pointer ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:opacity-80'}`}>
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </div>
            </div>
          )
        })}
      </nav>
      <div className="px-3 pb-5 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">W</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">웰링크 브랜드</p>
            <p className="text-[11px] text-gray-400 truncate">brand@wellink.ai</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 1. 대시보드 ──────────────────────────────────────────────────
function DashboardScreen({ p, s, a }: { p: P; s: S; a: A }) {
  const kpis = [
    { label: '활성 캠페인',      value: '2',     trend: '+50%', up: true,  icon: <Megaphone size={16}/> },
    { label: '진행중 인플루언서', value: '12',    trend: '+20%', up: true,  icon: <Users size={16}/> },
    { label: '이번달 도달',       value: '48.2K', trend: '+8.3%', up: true, icon: <Activity size={16}/> },
    { label: '검수대기',          value: '2',     trend: '-33%', up: false, icon: <Bell size={16}/> },
  ]
  const notifications = [
    { text: '이창민님이 콘텐츠를 제출했습니다', time: '5분 전',   dot: a.dotA, unread: true },
    { text: '비건 신제품 론칭에 새 인플루언서 지원', time: '1시간 전', dot: a.dotB, unread: true },
    { text: '구독이 5일 후 만료됩니다.',     time: '어제',   dot: a.dotC, unread: false },
  ]
  return (
    <div className="flex h-full bg-[#fafafa]">
      <Sidebar p={p} active="dashboard" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">안녕하세요, 웰링크 브랜드님</h1>
            <p className="text-sm text-gray-500 mt-0.5">2026년 4월 25일 금요일</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: p.green }}>
            <Megaphone size={14} /> 새 캠페인
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* KPI */}
          <div className="grid grid-cols-4 gap-3">
            {kpis.map((k, i) => (
              <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">{k.label}</span>
                  <span className="text-gray-400">{k.icon}</span>
                </div>
                <div className="text-[28px] font-bold text-gray-900 leading-tight">{k.value}</div>
                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: k.up ? s.color : a.trendDown }}>
                  {k.up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                  {k.trend} <span className="font-normal text-gray-400">전월</span>
                </div>
              </div>
            ))}
          </div>

          {/* 캠페인 테이블 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">활성 캠페인 현황</h2>
                <button className="text-xs flex items-center gap-1" style={{ color: s.color }}>
                  전체보기 <ArrowRight size={11}/>
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    {['캠페인명','상태','진행률','마감일',''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 py-2.5 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '봄 요가 프로모션', status: '진행중', pct: 53, dday: 'D-3',  active: true },
                    { name: '비건 신제품 론칭', status: '대기중', pct: 0,  dday: 'D-17', active: false },
                  ].map((c, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 text-sm font-medium text-gray-900">{c.name}</td>
                      <td className="py-3.5 px-4">
                        <Badge bg={c.active ? a.badgeActiveBg : a.badgePendingBg} text={c.active ? a.badgeActiveText : a.badgePendingText}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-gray-100">
                            <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: p.green }} />
                          </div>
                          <span className="text-xs text-gray-500">{c.pct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">{c.dday}</td>
                      <td className="py-3.5 px-4">
                        <button className="text-xs flex items-center gap-1" style={{ color: s.color }}>
                          상세 <ArrowRight size={11}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 알림 */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                <Bell size={14} className="text-gray-500"/>
                <h2 className="text-sm font-semibold text-gray-900">최근 알림</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none text-white" style={{ backgroundColor: p.green }}>3</span>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="px-5 py-3 border-b border-gray-50 last:border-0" style={{ backgroundColor: n.unread ? p.greenLight : undefined }}>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: n.dot }}/>
                    <div>
                      <p className={`text-xs leading-relaxed ${n.unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 빠른 실행 */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">빠른 실행</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <Megaphone size={18}/>, label: '새 캠페인',     sub: '캠페인 만들기',  primary: true },
                { icon: <Users size={18}/>,    label: '인플루언서 탐색', sub: '전체 리스트 보기', primary: false },
                { icon: <Search size={18}/>,   label: '인플루언서 관리', sub: '그룹·북마크 관리', primary: false },
                { icon: <Activity size={18}/>, label: '콘텐츠 검수',    sub: '대기 중 2건',   primary: false },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 cursor-pointer">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: item.primary ? p.greenLight : '#f3f4f6' }}>
                    <span style={{ color: item.primary ? s.color : '#6b7280' }}>{item.icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 2. 인플루언서 리스트 ─────────────────────────────────────────
function InfluencerScreen({ p, s, a }: { p: P; s: S; a: A }) {
  const summary = [
    { label: '전체 인플루언서', value: '5명' },
    { label: '즐겨찾기',       value: '2명' },
    { label: '평균 Fit Score', value: '79점' },
    { label: '평균 참여율',    value: '3.4%' },
  ]
  const rows = [
    { name: '이창민', cats: ['피트니스','크로스핏'], followers: '8,700',  eng: '4.1%', engHigh: true,  fit: 92, fitHigh: true,  authentic: '92.3%', avColor: a.av1, bookmarked: true  },
    { name: '민경완', cats: ['운동'],               followers: '120K',    eng: '3.8%', engHigh: false, fit: 78, fitHigh: false, authentic: '78.5%', avColor: a.av2, bookmarked: false },
    { name: '장영훈', cats: ['필라테스'],            followers: '960',     eng: '2.8%', engHigh: false, fit: 65, fitHigh: false, authentic: '95.1%', avColor: a.av3, bookmarked: false },
    { name: '김가애', cats: ['요가'],               followers: '18,900',  eng: '4.2%', engHigh: true,  fit: 88, fitHigh: true,  authentic: '88.7%', avColor: a.av4, bookmarked: true  },
    { name: '박리나', cats: ['웰니스'],              followers: '7,120',   eng: '2.2%', engHigh: false, fit: 71, fitHigh: false, authentic: '85.2%', avColor: a.av5, bookmarked: false },
  ]
  return (
    <div className="flex h-full bg-[#fafafa]">
      <Sidebar p={p} active="list" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">인플루언서 리스트</h1>
            <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
          </div>
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: p.green }}>
            + 캠페인 제안
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {summary.map((stat, i) => (
              <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl text-sm bg-white border border-gray-100 shadow-sm">
              <Search size={14} className="text-gray-400 shrink-0"/>
              <span className="text-gray-400 text-xs">이름으로 검색...</span>
            </div>
            {['카테고리','핏 스코어','참여율','팔로워급'].map(f => (
              <div key={f} className="px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border border-gray-200 text-gray-700 bg-white shrink-0">{f} ▾</div>
            ))}
          </div>
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['인플루언서','카테고리','팔로워','참여율','Fit Score','진성비율','최근 콘텐츠',''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0" style={{ backgroundColor: r.avColor }}>
                          {r.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{r.name}</span>
                        <Heart size={13} className={r.bookmarked ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {r.cats.map(c => <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{r.followers}</td>
                    <td className="py-3 px-4 text-sm font-semibold" style={{ color: r.engHigh ? s.color : '#6b7280' }}>{r.eng}</td>
                    <td className="py-3 px-4">
                      <Badge bg={r.fitHigh ? a.badgeActiveBg : a.badgePendingBg} text={r.fitHigh ? a.badgeActiveText : a.badgePendingText}>
                        {r.fit}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: s.color }}>{r.authentic}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {[0,1,2].map(j => <div key={j} className="w-8 h-8 rounded-md bg-gray-100" />)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: p.green }}>제안</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 3. 성과 분석 ─────────────────────────────────────────────────
function AnalyticsScreen({ p, s, a }: { p: P; s: S; a: A }) {
  const metrics = [
    { label: '총 도달',       value: '284K',  change: '+18.3%', up: true,  icon: <Eye size={15}/> },
    { label: '총 참여',       value: '23.4K', change: '+24.1%', up: true,  icon: <Activity size={15}/> },
    { label: '업로드 콘텐츠', value: '47건',  change: '+8건',   up: true,  icon: <Image size={15}/> },
    { label: '평균 ROAS',    value: '3.2x',  change: '-0.3x',  up: false, icon: <TrendingUp size={15}/> },
  ]
  const chartData = [
    { label: '3/1', a: 62, b: 44 }, { label: '3/8', a: 51, b: 35 },
    { label: '3/15', a: 78, b: 58 }, { label: '3/22', a: 67, b: 49 },
    { label: '3/29', a: 100, b: 76 }, { label: '4/5', a: 84, b: 62 },
    { label: '4/12', a: 91, b: 70 }, { label: '4/19', a: 88, b: 66 },
  ]
  const campaigns = [
    { name: '봄 요가 프로모션', reach: '124K', eng: '8.8%', contents: 18, roas: '3.4x', active: true  },
    { name: '비건 신제품 론칭', reach: '96K',  eng: '6.2%', contents: 12, roas: '2.8x', active: null  },
    { name: '서머 피트니스',   reach: '64K',  eng: '7.1%', contents: 17, roas: '4.1x', active: false },
  ]
  return (
    <div className="flex h-full bg-[#fafafa]">
      <Sidebar p={p} active="ads" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400">리포트</p>
            <h1 className="text-xl font-bold text-gray-900">성과 분석</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {['최근 7일','최근 30일','이번 달'].map((label, i) => (
                <span key={label} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer font-medium ${i === 1 ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}>{label}</span>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 bg-white">
              <Download size={14}/>내보내기
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {metrics.map((m, i) => (
              <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">{m.label}</span>
                  <span className="text-gray-400">{m.icon}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">{m.value}</p>
                <span className="text-[11px] font-medium inline-flex items-center gap-1" style={{ color: m.up ? s.color : a.trendDown }}>
                  {m.up ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}{m.change}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-900">주간 도달 & 참여 추이</h2>
              <div className="flex items-center gap-5 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded inline-block" style={{ backgroundColor: p.green }}/>도달
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded inline-block" style={{ backgroundColor: a.barB, opacity: 0.7 }}/>참여
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2" style={{ height: 120 }}>
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 w-full" style={{ height: 100 }}>
                    <div className="flex-1 rounded-t-sm" style={{ height: `${d.a}%`, backgroundColor: p.green, opacity: 0.85 }}/>
                    <div className="flex-1 rounded-t-sm" style={{ height: `${d.b}%`, backgroundColor: a.barB, opacity: 0.65 }}/>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">캠페인별 성과 비교</h2>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white">전체 보기</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {['캠페인','총 도달','평균 참여율','콘텐츠 수','ROAS','상태'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-4 text-gray-700">{c.reach}</td>
                    <td className="px-5 py-4 font-semibold" style={{ color: s.color }}>{c.eng}</td>
                    <td className="px-5 py-4 text-gray-600">{c.contents}개</td>
                    <td className="px-5 py-4 font-semibold text-gray-500">{c.roas}</td>
                    <td className="px-5 py-4">
                      {c.active === null
                        ? <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">완료</span>
                        : <Badge bg={c.active ? a.badgeActiveBg : a.badgePendingBg} text={c.active ? a.badgeActiveText : a.badgePendingText}>
                            {c.active ? '진행중' : '대기중'}
                          </Badge>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const SCREENS = [
  { key: 'dashboard', node: (p: P, s: S, a: A) => <DashboardScreen p={p} s={s} a={a} /> },
  { key: 'influencer', node: (p: P, s: S, a: A) => <InfluencerScreen p={p} s={s} a={a} /> },
  { key: 'analytics',  node: (p: P, s: S, a: A) => <AnalyticsScreen p={p} s={s} a={a} /> },
]

export default function Moodboard() {
  const [pi, setPi] = useState(0)
  const [si, setSi] = useState(0)
  const [ai, setAi] = useState(0)
  const p = PRIMARY[pi]
  const s = SECONDARY[si]
  const a = ACCENT[ai]

  return (
    <div className="min-h-screen bg-zinc-800">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-6">
        {/* 프라이머리 */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-700 shrink-0">프라이머리</span>
          <input type="range" min={0} max={9} value={pi} onChange={e => setPi(Number(e.target.value))} className="w-28 cursor-pointer" style={{ accentColor: p.green }}/>
          <span className="text-xs font-bold text-gray-900 w-4 shrink-0">{pi + 1}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: p.green }}/>
            <span className="text-xs text-gray-400 font-mono">{p.green}</span>
          </div>
        </div>
        <div className="w-px h-5 bg-gray-200 shrink-0"/>
        {/* 딥 */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-700 shrink-0">딥</span>
          <input type="range" min={0} max={9} value={si} onChange={e => setSi(Number(e.target.value))} className="w-28 cursor-pointer" style={{ accentColor: s.color }}/>
          <span className="text-xs font-bold text-gray-900 w-4 shrink-0">{si + 1}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: s.color }}/>
            <span className="text-xs text-gray-400 font-mono">{s.color}</span>
          </div>
        </div>
        <div className="w-px h-5 bg-gray-200 shrink-0"/>
        {/* 나머지 */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-700 shrink-0">나머지</span>
          <input type="range" min={0} max={9} value={ai} onChange={e => setAi(Number(e.target.value))} className="w-28 cursor-pointer" style={{ accentColor: a.badgeActiveBg }}/>
          <span className="text-xs font-bold text-gray-900 w-4 shrink-0">{ai + 1}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: a.badgeActiveBg }}/>
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: a.badgePendingBg }}/>
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: a.trendDown }}/>
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: a.dotA }}/>
            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: a.av1 }}/>
          </div>
        </div>
      </div>
      <div className="py-8 px-8 space-y-8">
        {SCREENS.map(({ key, node }) => (
          <div key={key} className="rounded-2xl overflow-hidden border border-gray-200" style={{ height: 720 }}>
            {node(p, s, a)}
          </div>
        ))}
      </div>
    </div>
  )
}
