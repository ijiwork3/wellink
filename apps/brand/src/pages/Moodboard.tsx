import { useState, type ReactNode } from 'react'
import {
  Megaphone, Users, Activity, Bell, Heart,
  TrendingUp, Eye, BarChart3, Zap, Search,
  Lock, Image, Check, Star
} from 'lucide-react'

// ─── 5단계 컬러 팔레트 ───────────────────────────────────────────
// 0: 현재(파스텔·무채색) → 5: 풀 비비드 유채색
const LEVELS = [
  {
    label: '0단계 (현재)',
    // 배경
    pageBg:       'bg-gray-50',
    sidebarBg:    'bg-white border-r border-gray-100',
    sidebarText:  'text-gray-700',
    sidebarActive:'bg-gray-100 text-gray-900 font-semibold',
    sidebarIcon:  'text-gray-400',
    // KPI 카드
    kpiCard:      'bg-white border border-gray-100 shadow-sm',
    kpiIcon:      'bg-gray-100 text-gray-500',
    kpiValue:     'text-gray-900',
    kpiLabel:     'text-gray-500',
    kpiTrend:     'text-green-600 bg-green-50',
    // 섹션 헤더
    sectionTitle: 'text-gray-900',
    // 카드
    card:         'bg-white border border-gray-100 shadow-sm',
    // 배지
    badgeNew:     'bg-green-100 text-green-700',
    badgeCat:     'bg-gray-100 text-gray-500',
    badgeStatus:  'bg-amber-100 text-amber-700',
    // 버튼
    btnPrimary:   'bg-[#8CC63F] text-white',
    btnSecondary: 'border border-gray-200 text-gray-700 bg-white',
    // 썸네일 placeholder
    thumb:        'bg-gradient-to-br from-gray-100 to-gray-200',
    thumbEmpty:   'bg-gray-50 border border-dashed border-gray-200',
    // 지표 강조색
    metricHigh:   'text-[#8CC63F]',
    metricMid:    'text-amber-600',
    metricLow:    'text-gray-400',
    // 차트 바
    barA: '#8CC63F', barB: '#3B82F6', barC: '#F59E0B',
    // 알림 dot
    dotA: 'bg-sky-400', dotB: 'bg-emerald-400', dotC: 'bg-amber-400',
    // 진행바
    progressBar:  'bg-[#8CC63F]',
    progressBg:   'bg-gray-100',
    // 아이콘 색상
    iconGreen:    'text-[#8CC63F]',
  },
  {
    label: '1단계',
    pageBg:       'bg-gray-50',
    sidebarBg:    'bg-white border-r border-gray-100',
    sidebarText:  'text-gray-700',
    sidebarActive:'bg-green-50 text-green-800 font-semibold',
    sidebarIcon:  'text-green-500',
    kpiCard:      'bg-white border border-gray-100 shadow-sm',
    kpiIcon:      'bg-green-100 text-green-600',
    kpiValue:     'text-gray-900',
    kpiLabel:     'text-gray-500',
    kpiTrend:     'text-green-700 bg-green-100',
    sectionTitle: 'text-gray-900',
    card:         'bg-white border border-gray-100 shadow-sm',
    badgeNew:     'bg-green-500 text-white',
    badgeCat:     'bg-emerald-50 text-emerald-700',
    badgeStatus:  'bg-amber-400 text-white',
    btnPrimary:   'bg-[#7AB535] text-white',
    btnSecondary: 'border border-gray-200 text-gray-700 bg-white',
    thumb:        'bg-gradient-to-br from-green-100 to-emerald-200',
    thumbEmpty:   'bg-green-50 border border-dashed border-green-200',
    metricHigh:   'text-green-600',
    metricMid:    'text-amber-500',
    metricLow:    'text-gray-400',
    barA: '#7AB535', barB: '#2563EB', barC: '#F59E0B',
    dotA: '#38BDF8', dotB: '#34D399', dotC: '#FBBF24',
    progressBar:  'bg-green-500',
    progressBg:   'bg-green-100',
    iconGreen:    'text-green-600',
  },
  {
    label: '2단계',
    pageBg:       'bg-gray-50',
    sidebarBg:    'bg-white border-r border-green-100',
    sidebarText:  'text-gray-700',
    sidebarActive:'bg-green-100 text-green-900 font-semibold',
    sidebarIcon:  'text-green-600',
    kpiCard:      'bg-white border border-green-100 shadow-sm',
    kpiIcon:      'bg-green-200 text-green-700',
    kpiValue:     'text-gray-900',
    kpiLabel:     'text-gray-500',
    kpiTrend:     'text-white bg-green-500',
    sectionTitle: 'text-green-900',
    card:         'bg-white border border-gray-100 shadow-sm',
    badgeNew:     'bg-green-500 text-white',
    badgeCat:     'bg-sky-100 text-sky-700',
    badgeStatus:  'bg-orange-400 text-white',
    btnPrimary:   'bg-green-600 text-white',
    btnSecondary: 'border border-green-300 text-green-700 bg-green-50',
    thumb:        'bg-gradient-to-br from-green-200 to-sky-200',
    thumbEmpty:   'bg-sky-50 border border-dashed border-sky-200',
    metricHigh:   'text-green-600',
    metricMid:    'text-orange-500',
    metricLow:    'text-gray-400',
    barA: '#16A34A', barB: '#0EA5E9', barC: '#F97316',
    dotA: '#0EA5E9', dotB: '#22C55E', dotC: '#F97316',
    progressBar:  'bg-green-600',
    progressBg:   'bg-green-100',
    iconGreen:    'text-green-600',
  },
  {
    label: '3단계',
    pageBg:       'bg-slate-50',
    sidebarBg:    'bg-green-700',
    sidebarText:  'text-green-100',
    sidebarActive:'bg-green-500 text-white font-semibold',
    sidebarIcon:  'text-green-300',
    kpiCard:      'bg-white border-0 shadow-md',
    kpiIcon:      'bg-green-500 text-white',
    kpiValue:     'text-gray-900',
    kpiLabel:     'text-gray-500',
    kpiTrend:     'text-white bg-green-500',
    sectionTitle: 'text-gray-900',
    card:         'bg-white border-0 shadow-md',
    badgeNew:     'bg-green-500 text-white',
    badgeCat:     'bg-violet-100 text-violet-700',
    badgeStatus:  'bg-orange-500 text-white',
    btnPrimary:   'bg-green-600 text-white shadow-md',
    btnSecondary: 'border-0 text-green-700 bg-green-100',
    thumb:        'bg-gradient-to-br from-green-300 to-teal-300',
    thumbEmpty:   'bg-violet-50 border border-dashed border-violet-300',
    metricHigh:   'text-green-600',
    metricMid:    'text-orange-500',
    metricLow:    'text-gray-400',
    barA: '#16A34A', barB: '#7C3AED', barC: '#F97316',
    dotA: '#7C3AED', dotB: '#22C55E', dotC: '#F97316',
    progressBar:  'bg-green-600',
    progressBg:   'bg-green-100',
    iconGreen:    'text-green-600',
  },
  {
    label: '4단계',
    pageBg:       'bg-green-50',
    sidebarBg:    'bg-green-800',
    sidebarText:  'text-green-100',
    sidebarActive:'bg-green-400 text-white font-semibold',
    sidebarIcon:  'text-green-200',
    kpiCard:      'bg-gradient-to-br from-white to-green-50 border border-green-100 shadow-md',
    kpiIcon:      'bg-green-500 text-white',
    kpiValue:     'text-green-900',
    kpiLabel:     'text-green-700',
    kpiTrend:     'text-white bg-green-500',
    sectionTitle: 'text-green-900',
    card:         'bg-white border border-green-100 shadow-md',
    badgeNew:     'bg-green-500 text-white',
    badgeCat:     'bg-cyan-400 text-white',
    badgeStatus:  'bg-orange-500 text-white',
    btnPrimary:   'bg-green-600 text-white shadow-lg',
    btnSecondary: 'border-0 text-white bg-green-500',
    thumb:        'bg-gradient-to-br from-green-300 to-cyan-400',
    thumbEmpty:   'bg-cyan-50 border border-dashed border-cyan-300',
    metricHigh:   'text-green-600',
    metricMid:    'text-orange-500',
    metricLow:    'text-gray-400',
    barA: '#16A34A', barB: '#0891B2', barC: '#EA580C',
    dotA: '#0891B2', dotB: '#22C55E', dotC: '#EA580C',
    progressBar:  'bg-green-600',
    progressBg:   'bg-green-200',
    iconGreen:    'text-green-600',
  },
  {
    label: '5단계',
    pageBg:       'bg-green-100',
    sidebarBg:    'bg-green-900',
    sidebarText:  'text-green-200',
    sidebarActive:'bg-lime-400 text-green-900 font-bold',
    sidebarIcon:  'text-lime-300',
    kpiCard:      'bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl',
    kpiIcon:      'bg-white/20 text-white',
    kpiValue:     'text-white',
    kpiLabel:     'text-green-100',
    kpiTrend:     'text-green-700 bg-lime-300',
    sectionTitle: 'text-green-900',
    card:         'bg-white border border-green-200 shadow-lg',
    badgeNew:     'bg-lime-400 text-green-900',
    badgeCat:     'bg-cyan-500 text-white',
    badgeStatus:  'bg-orange-600 text-white',
    btnPrimary:   'bg-lime-400 text-green-900 font-bold shadow-lg',
    btnSecondary: 'border-0 text-white bg-green-600',
    thumb:        'bg-gradient-to-br from-lime-300 to-emerald-500',
    thumbEmpty:   'bg-cyan-100 border border-dashed border-cyan-400',
    metricHigh:   'text-green-700',
    metricMid:    'text-orange-600',
    metricLow:    'text-gray-400',
    barA: '#4ADE80', barB: '#22D3EE', barC: '#FB923C',
    dotA: '#22D3EE', dotB: '#4ADE80', dotC: '#FB923C',
    progressBar:  'bg-lime-400',
    progressBg:   'bg-green-200',
    iconGreen:    'text-green-700',
  },
]

// ─── 미니 차트 ───────────────────────────────────────────────────
function MiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-0.5 h-6">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: max > 0 ? `${(v / max) * 100}%` : '4px', backgroundColor: color, opacity: i === values.length - 1 ? 1 : 0.4 }} />
      ))}
    </div>
  )
}

// ─── 대시보드 화면 ───────────────────────────────────────────────
function DashboardScreen({ t }: { t: typeof LEVELS[0] }) {
  const kpis = [
    { label: '활성 캠페인', value: '2', icon: <Megaphone size={14} />, trend: '+50%', bar: [2, 3, 2, 4, 3, 5, 3, 2, 4, 3] },
    { label: '참여 인플루언서', value: '12', icon: <Users size={14} />, trend: '+20%', bar: [8, 9, 10, 11, 10, 12, 11, 12, 12, 12] },
    { label: '총 도달', value: '48.2K', icon: <Eye size={14} />, trend: '+15%', bar: [30, 34, 36, 38, 40, 42, 41, 44, 46, 48] },
    { label: '평균 참여율', value: '8.4%', icon: <Activity size={14} />, trend: '+3%', bar: [6, 6.5, 7, 7.5, 7.8, 8, 7.9, 8.2, 8.3, 8.4] },
  ]
  const campaigns = [
    { name: '봄 요가 프로모션', status: '진행중', progress: 68, dday: 4 },
    { name: '비건 신제품 론칭', status: '대기중', progress: 12, dday: 22 },
  ]
  return (
    <div className={`h-full flex flex-col ${t.pageBg} text-sm`}>
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs ${t.kpiLabel}`}>안녕하세요, 웰링크 브랜드</p>
            <h1 className={`text-base font-bold ${t.sectionTitle}`}>대시보드</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.kpiIcon}`}><Bell size={15} /></button>
            <button className={`px-3 py-1.5 rounded-xl text-xs font-medium ${t.btnPrimary}`}>+ 캠페인</button>
          </div>
        </div>
      </div>
      {/* KPI 4개 */}
      <div className="px-5 grid grid-cols-2 gap-2.5 mb-3">
        {kpis.map((k, i) => (
          <div key={i} className={`rounded-xl p-3 ${t.kpiCard}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] ${t.kpiLabel}`}>{k.label}</span>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${t.kpiIcon}`}>{k.icon}</div>
            </div>
            <p className={`text-lg font-bold leading-none mb-1.5 ${t.kpiValue}`}>{k.value}</p>
            <MiniBar values={k.bar} color={t.barA} />
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1.5 inline-block ${t.kpiTrend}`}>{k.trend}</span>
          </div>
        ))}
      </div>
      {/* 캠페인 목록 */}
      <div className="px-5">
        <h2 className={`text-xs font-semibold mb-2 ${t.sectionTitle}`}>진행중 캠페인</h2>
        <div className={`rounded-xl overflow-hidden ${t.card}`}>
          {campaigns.map((c, i) => (
            <div key={i} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-800">{c.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.badgeStatus}`}>{c.status}</span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${t.progressBg}`}>
                <div className={`h-full rounded-full ${t.progressBar}`} style={{ width: `${c.progress}%` }} />
              </div>
              <p className={`text-[10px] mt-1 ${t.kpiLabel}`}>D-{c.dday} · {c.progress}%</p>
            </div>
          ))}
        </div>
      </div>
      {/* 빠른실행 */}
      <div className="px-5 mt-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Megaphone size={14} />, label: '새 캠페인' },
            { icon: <Search size={14} />, label: '인플루언서' },
            { icon: <Zap size={14} />, label: '콘텐츠 검수' },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-3 flex flex-col items-center gap-1.5 ${t.card}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.kpiIcon}`}>{item.icon}</div>
              <span className={`text-[10px] font-medium ${t.kpiLabel}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 인플루언서 관리 화면 ─────────────────────────────────────────
function InfluencerScreen({ t }: { t: typeof LEVELS[0] }) {
  const influencers = [
    { name: '이창민', id: '@changmin_fit', cats: ['요가', '헬스'], followers: '24.8K', eng: '8.2%', fit: 92, isNew: true, isPrivate: false, hasThumbs: true },
    { name: '김가애', id: '@gaga_daily',   cats: ['비건', '라이프'], followers: '18.2K', eng: '6.7%', fit: 78, isNew: false, isPrivate: false, hasThumbs: false },
    { name: '박리나', id: '@rina_life',    cats: ['뷰티', '일상'], followers: '31.5K', eng: '5.4%', fit: 65, isNew: false, isPrivate: true, hasThumbs: false },
  ]
  const groups = ['전체', '즐겨찾기', '우수 인플루언서']
  return (
    <div className={`h-full flex flex-col ${t.pageBg} text-sm`}>
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <h1 className={`text-base font-bold ${t.sectionTitle}`}>인플루언서 관리</h1>
        <button className={`px-3 py-1.5 rounded-xl text-xs font-medium ${t.btnPrimary}`}>+ 그룹 생성</button>
      </div>
      {/* 그룹 탭 */}
      <div className="px-5 flex gap-1.5 mb-3 flex-wrap">
        {groups.map((g, i) => (
          <span key={g} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${i === 0 ? t.btnPrimary : t.btnSecondary}`}>{g}</span>
        ))}
      </div>
      {/* 카드 */}
      <div className="px-5 space-y-3">
        {influencers.map((inf, i) => (
          <div key={i} className={`rounded-xl overflow-hidden ${t.card}`}>
            {/* 프로필 */}
            <div className="p-4 pb-3">
              <div className="flex items-start gap-2.5 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${['bg-green-400','bg-sky-400','bg-violet-400'][i]}`}>
                  {inf.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{inf.name}</span>
                    {inf.isNew && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${t.badgeNew}`}>NEW</span>}
                  </div>
                  <p className="text-[11px] text-gray-400">{inf.id}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {inf.cats.map(c => <span key={c} className={`text-[10px] px-1.5 py-0.5 rounded-full ${t.badgeCat}`}>{c}</span>)}
                  </div>
                </div>
                <Heart size={15} className="text-red-500 fill-red-500 shrink-0 mt-0.5" />
              </div>
              {/* 지표 */}
              <div className="flex gap-3 mb-3">
                <div><p className="text-[10px] text-gray-400">팔로워</p><p className="text-xs font-bold text-gray-800">{inf.followers}</p></div>
                <div><p className="text-[10px] text-gray-400">참여율</p><p className={`text-xs font-bold ${t.metricHigh}`}>{inf.eng}</p></div>
                <div><p className="text-[10px] text-gray-400">핏 스코어</p><p className={`text-xs font-bold ${t.metricHigh}`}>{inf.fit}</p></div>
              </div>
              {/* 썸네일 / 비공개 */}
              {inf.isPrivate ? (
                <div className={`rounded-lg aspect-[3/1] flex flex-col items-center justify-center gap-1 border ${t.thumbEmpty}`}>
                  <Lock size={14} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium">비공개 계정</span>
                </div>
              ) : inf.hasThumbs ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {[0,1,2].map(j => (
                    <div key={j} className={`aspect-square rounded-lg flex items-center justify-center ${t.thumb}`}>
                      <Image size={14} className="text-white/60" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-lg aspect-[3/1] flex flex-col items-center justify-center gap-1 border ${t.thumbEmpty}`}>
                  <Image size={14} className="text-amber-400" />
                  <span className="text-[10px] text-amber-600 font-medium">최근 콘텐츠 없음</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 캠페인 상세 화면 ─────────────────────────────────────────────
function CampaignScreen({ t }: { t: typeof LEVELS[0] }) {
  const contents = [
    { name: '이창민', id: '@changmin_fit', type: '릴스', reach: '12.4K', likes: '890', eng: '8.8%', score: 88, status: '검수중' },
    { name: '김가애', id: '@gaga_daily', type: '피드', reach: '8.1K', likes: '540', eng: '7.2%', score: 72, status: '승인' },
    { name: '박리나', id: '@rina_life', type: '스토리', reach: '5.2K', likes: '380', eng: '5.4%', score: 54, status: '반려' },
  ]
  const statusStyle: Record<string, string> = {
    '검수중': t.badgeStatus,
    '승인': t.badgeNew,
    '반려': 'bg-red-100 text-red-600',
  }
  const filters = ['전체', '검수중', '승인', '반려']
  return (
    <div className={`h-full flex flex-col ${t.pageBg} text-sm`}>
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className={`text-[10px] ${t.kpiLabel}`}>캠페인 상세</p>
          <h1 className={`text-base font-bold ${t.sectionTitle}`}>봄 요가 프로모션</h1>
        </div>
        <button className={`px-3 py-1.5 rounded-xl text-xs font-medium ${t.btnPrimary}`}>다운로드</button>
      </div>
      {/* 탭 */}
      <div className="px-5 flex gap-1 mb-3 border-b border-gray-100 pb-0">
        {['캠페인 정보', '등록 콘텐츠', '성과 리포트'].map((tab, i) => (
          <span key={tab} className={`text-xs px-3 py-2 font-medium border-b-2 transition-colors ${i === 1 ? `border-current ${t.iconGreen}` : 'border-transparent text-gray-400'}`}>{tab}</span>
        ))}
      </div>
      {/* 필터 */}
      <div className="px-5 flex gap-1.5 mb-3 flex-wrap">
        {filters.map((f, i) => (
          <span key={f} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${i === 0 ? 'bg-gray-900 text-white' : t.btnSecondary}`}>{f}</span>
        ))}
      </div>
      {/* 배너 */}
      <div className="px-5 mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
          <Zap size={12} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700">콘텐츠 다운로드는 건당 5,000원이 부과됩니다.</p>
        </div>
      </div>
      {/* 콘텐츠 카드 */}
      <div className="px-5 space-y-3">
        {contents.map((c, i) => (
          <div key={i} className={`rounded-xl overflow-hidden ${t.card}`}>
            <div className={`aspect-[3/1.2] ${t.thumb} flex items-center justify-center relative`}>
              <Image size={24} className="text-white/50" />
              <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700`}>{c.type}</span>
              <span className={`absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm ${c.score >= 80 ? 'bg-green-500/90 text-white' : c.score >= 50 ? 'bg-amber-400/90 text-white' : 'bg-white/80 text-gray-500'}`}>{c.score}점</span>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${['bg-green-400','bg-sky-400','bg-violet-400'][i]}`}>{c.name[0]}</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.id}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle[c.status]}`}>{c.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center border-t border-gray-50 pt-2">
                {[{l:'도달',v:c.reach},{l:'좋아요',v:c.likes},{l:'참여율',v:c.eng,hi:true}].map(m => (
                  <div key={m.l}>
                    <p className="text-[9px] text-gray-400">{m.l}</p>
                    <p className={`text-[11px] font-bold ${m.hi ? t.metricHigh : 'text-gray-800'}`}>{m.v}</p>
                  </div>
                ))}
              </div>
              {c.status === '검수중' && (
                <div className="flex gap-1.5 mt-2">
                  <button className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium ${t.btnPrimary}`}><Check size={10} /> 승인</button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium border border-red-200 text-red-500 bg-white">반려</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 메인 무드보드 ───────────────────────────────────────────────
type ScreenKey = 'dashboard' | 'influencer' | 'campaign'

export default function Moodboard() {
  const [active, setActive] = useState(0)
  const [fullscreen, setFullscreen] = useState<ScreenKey | null>(null)
  const t = LEVELS[active]

  const screens: { key: ScreenKey; label: string; path: string; node: ReactNode }[] = [
    { key: 'dashboard',   label: '1 — 대시보드',                  path: '/dashboard',                       node: <DashboardScreen t={t} /> },
    { key: 'influencer',  label: '2 — 인플루언서 관리',            path: '/influencers/manage',              node: <InfluencerScreen t={t} /> },
    { key: 'campaign',    label: '3 — 캠페인 상세 · 등록 콘텐츠',  path: '/campaigns/1?qa=tab-content',     node: <CampaignScreen t={t} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 상단 컨트롤 바 */}
      <div className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-base font-bold">웰링크 컬러 무드보드</h1>
            <p className="text-xs text-gray-400 mt-0.5">0단계(현재) → 5단계(풀 비비드) · 유채색 면적과 채도를 단계별로 확장</p>
          </div>
          <div className="flex gap-2">
            {LEVELS.map((lv, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active === i
                    ? 'bg-white text-gray-900 shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {i === 0 ? '현재' : `${i}단계`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 레벨 라벨 */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{t.label}</span>
          <span className="text-sm text-gray-400">
            {active === 0 && '현재 상태 — 무채색·파스텔 위주'}
            {active === 1 && '배지·아이콘·트렌드 강조색에만 채도 +'}
            {active === 2 && '카드 보더·섹션 타이틀·버튼에 유채색 확장'}
            {active === 3 && '사이드바 유채색 + 카드 그림자 강화'}
            {active === 4 && '카드 배경 그라디언트 + 사이드바 풀 컬러'}
            {active === 5 && '전체 배경·KPI카드까지 유채색 — 최대 쨍함'}
          </span>
        </div>
      </div>

      {/* 3개 화면 스크롤 */}
      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-10 pt-4">
        {screens.map(({ key, label, path, node }) => (
          <section key={key}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">
              {label} <span className="normal-case text-gray-600">({path})</span>
            </p>
            <div className="bg-gray-800 rounded-2xl p-3 relative">
              <div className="rounded-xl overflow-hidden" style={{ maxWidth: 390, maxHeight: 680, overflowY: 'auto' }}>
                {node}
              </div>
              {/* 전체보기 버튼 */}
              <button
                onClick={() => setFullscreen(key)}
                className="absolute bottom-5 right-5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors shadow-lg"
              >
                전체보기
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* 전체보기 오버레이 */}
      {fullscreen && (() => {
        const screen = screens.find(s => s.key === fullscreen)!
        return (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6" onClick={() => setFullscreen(null)}>
            <div className="relative" onClick={e => e.stopPropagation()}>
              {/* 닫기 버튼 */}
              <button
                onClick={() => setFullscreen(null)}
                className="absolute -top-10 right-0 text-xs text-gray-400 hover:text-white font-semibold transition-colors"
              >
                ✕ 닫기
              </button>
              {/* 화면 레이블 */}
              <p className="absolute -top-10 left-0 text-xs text-gray-400 font-semibold uppercase tracking-widest">{screen.label}</p>
              {/* 목업 — 화면 높이에 맞게 확장 */}
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ width: 390, height: 'min(780px, calc(100vh - 120px))', overflowY: 'auto' }}
              >
                {screen.node}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
