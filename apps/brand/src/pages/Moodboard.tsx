import { useState } from 'react'
import { Megaphone, Users, Activity, Bell, Heart, Eye, Zap, Search, Image,
  LayoutDashboard, BarChart3, Settings, ChevronRight, TrendingUp,
  TrendingDown, ArrowRight, Download } from 'lucide-react'

// ─── 디자인 토큰 ──────────────────────────────────────────────────
// 브랜드 컬러 (#8CC63F 계열) → 실제 어드민 theme.css 기준
const BRAND   = '#8CC63F'
const BRAND_H = '#7AB535'
const BRAND_BG = '#f0f9e8'
const BRAND_T  = '#5a8228'

// ─── 5단계 팔레트 ────────────────────────────────────────────────
// 규칙: 배경·테두리·그림자·카드 구조는 Stage 1 고정
//       1단계에서 이미 유채색인 토큰만 단계별로 더 쨍하게
const LIME  = '#A3E635'   // lime-400
const LIME2 = '#84CC16'   // lime-500

// 모든 단계에서 고정되는 구조 토큰
const FIXED = {
  pageBg:       'bg-[#fafafa]',
  sidebarBg:    'bg-white border-r border-gray-100',
  sidebarText:  'text-gray-600',
  sidebarActive:'bg-gray-100 text-gray-900 font-medium',
  sidebarIcon:  'text-gray-400',
  headerBg:     'bg-white border-b border-gray-100',
  kpiCard:      'bg-white border border-gray-100 shadow-sm',
  kpiValue:     'text-gray-900',
  kpiLabel:     'text-gray-500',
  sectionTitle: 'text-gray-900',
  card:         'bg-white border border-gray-100 shadow-sm',
  badgeCat:     'bg-gray-100 text-gray-500',
  badgeNew:     'bg-gray-100 text-gray-500',
  btnSecondary: 'border border-gray-200 text-gray-700 bg-white',
  thumb:        'bg-gray-100',
  metricMid:    'text-gray-500',
  progressBg:   'bg-gray-100',
  kpiIcon:      'text-gray-400',
}

const LEVELS = [
  // ① 현재 어드민 그대로
  {
    label: '1', ...FIXED,
    kpiTrend:     `text-[${BRAND}]`,
    kpiTrendNeg:  'text-red-500',
    badgeActive:  'bg-emerald-100 text-emerald-700',
    badgePending: 'bg-amber-100 text-amber-700',
    btnPrimary:   `bg-[${BRAND}] text-white`,
    metricHigh:   `text-[${BRAND}]`,
    barA: BRAND,   barB: '#3B82F6', barC: '#F59E0B',
    progressBar:  `bg-[${BRAND}]`,
    iconAccent:   `text-[${BRAND}]`,
  },
  // ② 유채색 요소 채도 살짝 상승 — 트렌드 소프트 배지화
  {
    label: '2', ...FIXED,
    kpiTrend:     `text-[${BRAND_T}] bg-[${BRAND_BG}]`,
    kpiTrendNeg:  'text-red-600 bg-red-50',
    badgeActive:  'bg-emerald-200 text-emerald-800',
    badgePending: 'bg-amber-200 text-amber-800',
    btnPrimary:   `bg-[${BRAND_H}] text-white`,
    metricHigh:   `text-[${BRAND_T}]`,
    barA: BRAND_H, barB: '#2563EB', barC: '#D97706',
    progressBar:  `bg-[${BRAND_H}]`,
    iconAccent:   `text-[${BRAND_T}]`,
  },
  // ③ 라임 그린 채도 점프 — 배지 solid, 버튼 lime-500
  {
    label: '3', ...FIXED,
    kpiTrend:     'text-gray-900 bg-lime-300',
    kpiTrendNeg:  'text-white bg-red-400',
    badgeActive:  'bg-emerald-400 text-white',
    badgePending: 'bg-amber-400 text-white',
    btnPrimary:   `bg-[${LIME2}] text-white`,
    metricHigh:   `text-[${LIME2}]`,
    barA: LIME2,   barB: '#3B82F6', barC: '#F97316',
    progressBar:  `bg-[${LIME2}]`,
    iconAccent:   `text-[${LIME2}]`,
  },
  // ④ 라임-400 진입 — 트렌드 배지 쨍하게, 배지 emerald-500
  {
    label: '4', ...FIXED,
    kpiTrend:     `text-gray-900 bg-[${LIME}] font-semibold`,
    kpiTrendNeg:  'text-white bg-red-500',
    badgeActive:  'bg-emerald-500 text-white',
    badgePending: 'bg-orange-400 text-white',
    btnPrimary:   `bg-[${LIME}] text-gray-900 font-semibold`,
    metricHigh:   `text-[${LIME2}]`,
    barA: LIME,    barB: '#2563EB', barC: '#EA580C',
    progressBar:  `bg-[${LIME}]`,
    iconAccent:   `text-[${LIME2}]`,
  },
  // ⑤ MAX — 유채색 요소 최고 채도, 구조는 여전히 Stage 1 그대로
  {
    label: '5', ...FIXED,
    kpiTrend:     `text-gray-900 bg-[${LIME}] font-bold`,
    kpiTrendNeg:  'text-white bg-red-600',
    badgeActive:  'bg-emerald-600 text-white',
    badgePending: 'bg-orange-500 text-white',
    btnPrimary:   `bg-[${LIME}] text-gray-900 font-bold`,
    metricHigh:   `text-[${LIME2}]`,
    barA: LIME,    barB: '#1D4ED8', barC: '#EA580C',
    progressBar:  `bg-[${LIME}]`,
    iconAccent:   `text-[${LIME2}]`,
  },
]

type T = typeof LEVELS[0]

function MiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-0.5 h-5">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: max > 0 ? `${(v / max) * 100}%` : '3px', backgroundColor: color, opacity: i === values.length - 1 ? 1 : 0.3 }} />
      ))}
    </div>
  )
}

// ─── 공통 사이드바 ————————————————————————————————————————————————
// 실제 어드민 Sidebar.tsx 구조와 동일하게 맞춤
function Sidebar({ t, active }: { t: T; active: string }) {
  const isDark = t.sidebarBg.includes('green-7') || t.sidebarBg.includes('green-8') || t.sidebarBg.includes('green-9')
  const logoColor = isDark ? 'text-white' : 'text-gray-900'
  const sections = [
    { label: '분석', items: [
      { icon: <BarChart3 size={15} />, label: '프로필 인사이트', key: 'profile' },
      { icon: <TrendingUp size={15} />, label: '광고 성과', key: 'ads' },
    ]},
    { label: '인플루언서', items: [
      { icon: <Users size={15} />, label: '인플루언서 리스트', key: 'list' },
      { icon: <Users size={15} />, label: '인플루언서 관리', key: 'influencer' },
    ]},
    { label: '캠페인', items: [
      { icon: <Megaphone size={15} />, label: '캠페인 목록', key: 'campaign' },
    ]},
  ]
  const sectionLabelColor = isDark ? 'text-green-400' : 'text-gray-400'
  const dividerColor = isDark ? 'border-white/10' : 'border-gray-100'

  return (
    <div className={`w-[220px] shrink-0 flex flex-col h-full ${t.sidebarBg}`}>
      {/* 로고 */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-1.5">
          <span className={`text-base font-bold tracking-tight ${logoColor}`}>WELLINK</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none bg-[${BRAND}] text-white`}>광고주</span>
        </div>
      </div>
      {/* 대시보드 */}
      <div className="px-3 pb-1">
        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 ${'dashboard' === active ? t.sidebarActive : `${t.sidebarText} hover:opacity-80`}`}>
          <span className={'dashboard' === active ? '' : t.sidebarIcon}><LayoutDashboard size={15} /></span>
          대시보드
        </div>
      </div>
      {/* 섹션 */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.label} className="mb-4">
            <div className={`text-[11px] font-semibold uppercase tracking-widest mb-1 px-3 ${sectionLabelColor}`}>{sec.label}</div>
            {sec.items.map(item => (
              <div key={item.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 cursor-pointer ${item.key === active ? t.sidebarActive : `${t.sidebarText} hover:opacity-80`}`}>
                <span className={item.key === active ? '' : t.sidebarIcon}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>
      {/* 하단 프로필 */}
      <div className={`px-3 pb-5 pt-3 border-t ${dividerColor}`}>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">W</div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium truncate ${isDark ? 'text-green-100' : 'text-gray-900'}`}>웰링크 브랜드</p>
            <p className={`text-[11px] truncate ${isDark ? 'text-green-400' : 'text-gray-400'}`}>brand@wellink.ai</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 1. 대시보드 ─────────────────────────────────────────────────
function DashboardScreen({ t }: { t: T }) {
  // kpiIcon이 배경 없는 텍스트만인지 (Stage 1~2) 판단
  const hasIconBg = t.kpiIcon.includes('bg-')
  const kpis = [
    { label: '활성 캠페인',      value: '2',     sub: '현재 진행 중',   trend: '+50%', up: true,  bar: [2,3,2,4,3,5,3,2,4,3] },
    { label: '진행중 인플루언서', value: '12',    sub: '총 참여 인원',   trend: '+20%', up: true,  bar: [8,9,10,11,10,12,11,12,12,12] },
    { label: '이번달 도달',       value: '48.2K', sub: '누적 임프레션',  trend: '+8.3%', up: true, bar: [30,34,36,38,40,42,41,44,46,48] },
    { label: '검수대기',          value: '2',     sub: '콘텐츠 대기 중', trend: '-33%', up: false, bar: [5,4,6,5,4,3,4,3,3,2] },
  ]
  const campaigns = [
    { name: '봄 요가 프로모션', status: '모집중', pct: 53, dday: 'D-3',  badge: t.badgeActive },
    { name: '비건 신제품 론칭', status: '대기중', pct: 0,  dday: 'D-17', badge: t.badgePending },
  ]
  return (
    <div className={`flex h-full ${t.pageBg}`}>
      <Sidebar t={t} active="dashboard" />
      <div className="flex-1 flex flex-col min-w-0">
        {/* 헤더 */}
        <div className={`px-6 py-4 flex items-center justify-between ${t.headerBg}`}>
          <div>
            <h1 className={`text-xl font-bold ${t.sectionTitle}`}>안녕하세요, 웰링크 브랜드님</h1>
            <p className="text-sm text-gray-500 mt-0.5">2026년 4월 25일 금요일</p>
          </div>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${t.btnPrimary}`}>
            <Megaphone size={14} /> 새 캠페인
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 요약 배너 */}
          <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-start gap-4 shadow-sm">
            <div className={`w-1 self-stretch rounded-full shrink-0 bg-[${BRAND}]`} />
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">이번 주 현황</p>
              <p className="text-sm leading-relaxed text-gray-700">
                봄 요가 프로모션 모집률이 <span className="font-semibold text-gray-900">53%</span>에 도달했습니다.
                마감까지 <span className="font-semibold text-rose-500">D-3</span>이므로 추가 인플루언서 초대를 권장합니다.
              </p>
            </div>
          </div>
          {/* KPI 4개 */}
          <div className="grid grid-cols-4 gap-3">
            {kpis.map((k, i) => (
              <div key={i} className={`rounded-xl p-5 flex flex-col gap-3 ${t.kpiCard}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${t.kpiLabel}`}>{k.label}</span>
                  {hasIconBg
                    ? <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.kpiIcon}`}>{[<Megaphone size={16}/>,<Users size={16}/>,<Activity size={16}/>,<Bell size={16}/>][i]}</div>
                    : <span className={t.kpiIcon}>{[<Megaphone size={16}/>,<Users size={16}/>,<Activity size={16}/>,<Bell size={16}/>][i]}</span>
                  }
                </div>
                <div>
                  <div className={`text-[28px] font-bold leading-tight ${t.kpiValue}`}>{k.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{k.sub}</div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${k.up ? t.kpiTrend : t.kpiTrendNeg} ${(t.kpiTrend.includes('bg-') || !k.up && t.kpiTrendNeg.includes('bg-')) ? 'px-2 py-0.5 rounded-full w-fit' : ''}`}>
                  {k.up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                  {k.trend} <span className={`font-normal ${t.kpiTrend.includes('text-white') ? 'opacity-70' : 'text-gray-400'}`}>전월</span>
                </div>
              </div>
            ))}
          </div>
          {/* 캠페인 + 알림 */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`col-span-2 rounded-xl overflow-hidden ${t.card}`}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className={`text-sm font-semibold ${t.sectionTitle}`}>활성 캠페인 현황</h2>
                <button className={`text-xs flex items-center gap-1 ${t.iconAccent}`}>전체보기 <ArrowRight size={11}/></button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-50 bg-gray-50/50">
                  {['캠페인명','상태','진행률','마감일',''].map(h=><th key={h} className="text-left text-xs font-medium text-gray-500 py-2.5 px-4">{h}</th>)}
                </tr></thead>
                <tbody>{campaigns.map((c,i)=>(
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="py-3.5 px-4"><span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{c.status}</span></td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-20 h-1.5 rounded-full ${t.progressBg}`}>
                          <div className={`h-full rounded-full ${t.progressBar}`} style={{width:`${c.pct}%`}}/>
                        </div>
                        <span className="text-xs text-gray-500">{c.pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">{c.dday}</td>
                    <td className="py-3.5 px-4"><button className={`text-xs flex items-center gap-1 ${t.iconAccent}`}>상세 <ArrowRight size={11}/></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {/* 알림 */}
            <div className={`rounded-xl overflow-hidden flex flex-col ${t.card}`}>
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                <Bell size={14} className="text-gray-500"/>
                <h2 className={`text-sm font-semibold ${t.sectionTitle}`}>최근 알림</h2>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-[${BRAND}] text-white`}>3</span>
              </div>
              {[
                { text: '이창민님이 콘텐츠를 제출했습니다', time: '5분 전', dot: 'bg-sky-400', unread: true },
                { text: '비건 신제품 론칭에 새 인플루언서 지원', time: '1시간 전', dot: 'bg-emerald-400', unread: true },
                { text: '구독이 5일 후 만료됩니다.', time: '어제', dot: 'bg-amber-400', unread: false },
              ].map((n,i)=>(
                <div key={i} className={`px-5 py-3 border-b border-gray-50 last:border-0 ${n.unread ? `bg-[${BRAND_BG}]` : ''}`}>
                  <div className="flex gap-2.5 items-start">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`}/>
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
            <h2 className={`text-sm font-semibold mb-3 ${t.sectionTitle}`}>빠른 실행</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <Megaphone size={18}/>, label: '새 캠페인', sub: '캠페인 만들기', primary: true },
                { icon: <Users size={18}/>, label: '인플루언서 탐색', sub: '전체 리스트 보기', primary: false },
                { icon: <Search size={18}/>, label: '인플루언서 관리', sub: '그룹·북마크 관리', primary: false },
                { icon: <Zap size={18}/>, label: '콘텐츠 검수', sub: '대기 중 2건', primary: false },
              ].map((item,i)=>(
                <div key={i} className={`rounded-xl p-4 text-left cursor-pointer ${t.card}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${item.primary ? `bg-[${BRAND_BG}]` : 'bg-gray-100'}`}>
                    <span className={item.primary ? `text-[${BRAND}]` : 'text-gray-500'}>{item.icon}</span>
                  </div>
                  <p className={`text-sm font-semibold ${t.sectionTitle}`}>{item.label}</p>
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

// ─── 2. 인플루언서 리스트 (실제 InfluencerList.tsx 레이아웃 기준) ──
function InfluencerScreen({ t }: { t: T }) {
  const hasIconBg = t.kpiIcon.includes('bg-')
  const summary = [
    { label: '전체 인플루언서', value: '5명' },
    { label: '즐겨찾기', value: '2명' },
    { label: '평균 Fit Score', value: '79점' },
    { label: '평균 참여율', value: '3.4%' },
  ]
  const rows = [
    { name: '이창민', cats: ['피트니스','크로스핏'], followers: '8,700',  eng: '4.1%', engHigh: true,  fit: 92, fitHigh: true,  authentic: '92.3%', color: 'bg-green-400',  bookmarked: true  },
    { name: '민경완', cats: ['운동'],               followers: '120K',    eng: '3.8%', engHigh: false, fit: 78, fitHigh: false, authentic: '78.5%', color: 'bg-sky-400',   bookmarked: false },
    { name: '장영훈', cats: ['필라테스'],            followers: '960',     eng: '2.8%', engHigh: false, fit: 65, fitHigh: false, authentic: '95.1%', color: 'bg-violet-400',bookmarked: false },
    { name: '김가애', cats: ['요가'],               followers: '18,900',  eng: '4.2%', engHigh: true,  fit: 88, fitHigh: true,  authentic: '88.7%', color: 'bg-orange-400',bookmarked: true  },
    { name: '박리나', cats: ['웰니스'],              followers: '7,120',   eng: '2.2%', engHigh: false, fit: 71, fitHigh: false, authentic: '85.2%', color: 'bg-pink-400',  bookmarked: false },
  ]
  return (
    <div className={`flex h-full ${t.pageBg}`}>
      <Sidebar t={t} active="list" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 헤더 */}
        <div className={`px-6 py-4 flex items-center justify-between shrink-0 ${t.headerBg}`}>
          <div>
            <h1 className={`text-xl font-bold ${t.sectionTitle}`}>인플루언서 리스트</h1>
            <p className="text-sm text-gray-500 mt-0.5">브랜드에 적합한 인플루언서를 탐색하세요.</p>
          </div>
          <button className={`px-4 py-2.5 rounded-xl text-sm font-medium ${t.btnPrimary}`}>+ 캠페인 제안</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* 요약 KPI */}
          <div className="grid grid-cols-4 gap-3">
            {summary.map((s, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 flex flex-col gap-1 ${t.kpiCard}`}>
                <p className={`text-xs ${t.kpiLabel}`}>{s.label}</p>
                <div className="flex items-center justify-between">
                  <p className={`text-lg font-bold ${t.kpiValue}`}>{s.value}</p>
                  {hasIconBg
                    ? <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.kpiIcon}`}>{[<Users size={13}/>,<Heart size={13}/>,<Activity size={13}/>,<TrendingUp size={13}/>][i]}</div>
                    : <span className={t.kpiIcon}>{[<Users size={13}/>,<Heart size={13}/>,<Activity size={13}/>,<TrendingUp size={13}/>][i]}</span>
                  }
                </div>
              </div>
            ))}
          </div>
          {/* 검색·필터 바 */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl text-sm ${t.card}`}>
              <Search size={14} className="text-gray-400 shrink-0"/><span className="text-gray-400 text-xs">이름으로 검색...</span>
            </div>
            {['카테고리','핏 스코어','참여율','팔로워급','정렬'].map(f => (
              <div key={f} className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer shrink-0 ${t.btnSecondary}`}>{f} ▾</div>
            ))}
          </div>
          {/* 테이블 */}
          <div className={`rounded-xl overflow-hidden ${t.card}`}>
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
                    {/* 인플루언서 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${r.color}`}>{r.name[0]}</div>
                        <span className="text-sm font-medium text-gray-900">{r.name}</span>
                        <Heart size={13} className={r.bookmarked ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                      </div>
                    </td>
                    {/* 카테고리 */}
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {r.cats.map(c => <span key={c} className={`text-xs px-2 py-0.5 rounded-full ${t.badgeCat}`}>{c}</span>)}
                      </div>
                    </td>
                    {/* 팔로워 */}
                    <td className="py-3 px-4 text-sm text-gray-700">{r.followers}</td>
                    {/* 참여율 */}
                    <td className={`py-3 px-4 text-sm font-semibold ${r.engHigh ? t.metricHigh : 'text-gray-500'}`}>{r.eng}</td>
                    {/* Fit Score */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${r.fitHigh ? t.badgeActive : t.badgePending}`}>{r.fit}</span>
                    </td>
                    {/* 진성비율 */}
                    <td className={`py-3 px-4 text-sm font-medium ${t.metricHigh}`}>{r.authentic}</td>
                    {/* 최근 콘텐츠 썸네일 */}
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {[0,1,2].map(j => <div key={j} className={`w-8 h-8 rounded-md ${t.thumb}`} />)}
                      </div>
                    </td>
                    {/* 액션 */}
                    <td className="py-3 px-4">
                      <button className={`text-xs px-3 py-1.5 rounded-lg font-medium ${t.btnPrimary}`}>제안</button>
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
function AnalyticsScreen({ t }: { t: T }) {
  const hasIconBg = t.kpiIcon.includes('bg-')
  const metrics = [
    { label: '총 도달',    value: '284K',  change: '+18.3%', up: true,  icon: <Eye size={15}/> },
    { label: '총 참여',    value: '23.4K', change: '+24.1%', up: true,  icon: <Activity size={15}/> },
    { label: '업로드 콘텐츠', value: '47건', change: '+8건', up: true,  icon: <Image size={15}/> },
    { label: '평균 ROAS',  value: '3.2x',  change: '-0.3x',  up: false, icon: <TrendingUp size={15}/> },
  ]
  const chartData = [
    { label: '3/1', a: 62, b: 44 }, { label: '3/8', a: 51, b: 35 },
    { label: '3/15', a: 78, b: 58 }, { label: '3/22', a: 67, b: 49 },
    { label: '3/29', a: 100, b: 76 }, { label: '4/5', a: 84, b: 62 },
    { label: '4/12', a: 91, b: 70 }, { label: '4/19', a: 88, b: 66 },
  ]
  const campaigns = [
    { name: '봄 요가 프로모션', reach: '124K', eng: '8.8%', contents: 18, conv: '3.4x', status: '진행중', badge: t.badgeActive },
    { name: '비건 신제품 론칭', reach: '96K',  eng: '6.2%', contents: 12, conv: '2.8x', status: '완료',   badge: 'bg-slate-100 text-slate-500' },
    { name: '서머 피트니스',   reach: '64K',  eng: '7.1%', contents: 17, conv: '4.1x', status: '대기중', badge: t.badgePending },
  ]
  return (
    <div className={`flex h-full ${t.pageBg}`}>
      <Sidebar t={t} active="ads" />
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`px-6 py-4 flex items-center justify-between ${t.headerBg}`}>
          <div>
            <p className="text-xs text-gray-400">리포트</p>
            <h1 className={`text-xl font-bold ${t.sectionTitle}`}>성과 분석</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {['최근 7일','최근 30일','이번 달'].map((p,i)=>(
                <span key={p} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer font-medium ${i===1 ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}>{p}</span>
              ))}
            </div>
            <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium ${t.btnSecondary}`}><Download size={14}/>내보내기</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* KPI 4개 */}
          <div className="grid grid-cols-4 gap-3">
            {metrics.map((m,i)=>(
              <div key={i} className={`rounded-xl p-5 ${t.kpiCard}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium ${t.kpiLabel}`}>{m.label}</span>
                  {hasIconBg
                    ? <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.kpiIcon}`}>{m.icon}</div>
                    : <span className={t.kpiIcon}>{m.icon}</span>
                  }
                </div>
                <p className={`text-2xl font-bold mb-2 ${t.kpiValue}`}>{m.value}</p>
                <span className={`text-[11px] font-medium inline-flex items-center gap-1 ${m.up ? t.kpiTrend : t.kpiTrendNeg} ${(t.kpiTrend.includes('bg-') || !m.up && t.kpiTrendNeg.includes('bg-')) ? 'px-2 py-0.5 rounded-full' : ''}`}>
                  {m.up ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}{m.change}
                </span>
              </div>
            ))}
          </div>
          {/* 바 차트 */}
          <div className={`rounded-xl p-6 ${t.card}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-sm font-semibold ${t.sectionTitle}`}>주간 도달 & 참여 추이</h2>
              <div className="flex items-center gap-5 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{backgroundColor:t.barA}}/>도달</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{backgroundColor:t.barB, opacity:0.7}}/>참여</span>
              </div>
            </div>
            <div className="flex items-end gap-2" style={{height:120}}>
              {chartData.map((d,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 w-full" style={{height:100}}>
                    <div className="flex-1 rounded-t-sm" style={{height:`${d.a}%`, backgroundColor:t.barA, opacity:0.85}}/>
                    <div className="flex-1 rounded-t-sm" style={{height:`${d.b}%`, backgroundColor:t.barB, opacity:0.65}}/>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 캠페인 테이블 */}
          <div className={`rounded-xl overflow-hidden ${t.card}`}>
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
              <h2 className={`text-sm font-semibold ${t.sectionTitle}`}>캠페인별 성과 비교</h2>
              <button className={`text-xs px-3 py-1.5 rounded-lg ${t.btnSecondary}`}>전체 보기</button>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-50 bg-gray-50/50">
                {['캠페인','총 도달','평균 참여율','콘텐츠 수','ROAS','상태'].map(h=>(
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr></thead>
              <tbody>{campaigns.map((c,i)=>(
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-4 text-gray-700">{c.reach}</td>
                  <td className={`px-5 py-4 font-semibold ${t.metricHigh}`}>{c.eng}</td>
                  <td className="px-5 py-4 text-gray-600">{c.contents}개</td>
                  <td className={`px-5 py-4 font-semibold ${t.metricMid}`}>{c.conv}</td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{c.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const SCREENS = [
  { key: 'dashboard', node: (t: T) => <DashboardScreen t={t} /> },
  { key: 'influencer', node: (t: T) => <InfluencerScreen t={t} /> },
  { key: 'analytics',  node: (t: T) => <AnalyticsScreen t={t} /> },
]

export default function Moodboard() {
  const [active, setActive] = useState(0)
  const t = LEVELS[active]

  return (
    <div className="min-h-screen bg-zinc-800">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-4">
        <span className="text-xs text-gray-400 font-medium shrink-0">단계</span>
        <input
          type="range" min={0} max={4} value={active}
          onChange={e => setActive(Number(e.target.value))}
          className="flex-1 max-w-xs accent-gray-900 cursor-pointer"
        />
        <span className="text-sm font-bold text-gray-900 w-4 shrink-0">{active + 1}</span>
        <span className="text-xs text-gray-400 shrink-0">/ 5</span>
      </div>
      <div className="py-8 px-8 space-y-8">
        {SCREENS.map(({ key, node }) => (
          <div key={key} className="rounded-2xl overflow-hidden border border-gray-200" style={{ height: 720 }}>
            {node(t)}
          </div>
        ))}
      </div>
    </div>
  )
}
