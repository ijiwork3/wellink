import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Megaphone, Users, Activity, Clock, Bell,
  TrendingUp, TrendingDown, ArrowRight, Zap, Search,
  Eye, Heart, MessageCircle, BarChart3, Sparkles, Lock
} from 'lucide-react'
import { StatusBadge } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { fmtNumber, fmtRate, getDDay, getDDayBadgeStyle, PROGRESS_THRESHOLD } from '@wellink/ui'
import { fmtDate } from '../utils/fmtDate'


/* ── KPI 데이터 ── */
const kpis = [
  {
    title: '활성 캠페인',
    value: 2,
    sub: '현재 진행 중',
    trend: 50,
    icon: <Megaphone size={16} aria-hidden="true" />,
  },
  {
    title: '진행중 인플루언서',
    value: 12,
    sub: '총 참여 인원',
    trend: 20,
    icon: <Users size={16} aria-hidden="true" />,
  },
  {
    title: '이번달 도달',
    value: fmtNumber(482000),
    sub: '누적 임프레션',
    trend: 8.3,
    icon: <Activity size={16} aria-hidden="true" />,
  },
  {
    title: '검수대기',
    value: 2,
    sub: '콘텐츠 대기 중',
    trend: -33.3,
    icon: <Clock size={16} aria-hidden="true" />,
  },
]

/* ── 캠페인 데이터 ── */
const campaigns = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8, deadline: '2026-04-28' },
  { id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0, deadline: '2026-05-05' },
]

/* ── 알림 초기 데이터 ── */
const INITIAL_NOTIFICATIONS: { id: number; text: string; time: string; dot: string; route: string; unread: boolean }[] = [
  { id: 1, text: '이창민님이 콘텐츠를 제출했습니다 — 검수가 필요합니다.', time: '5분 전', dot: 'bg-sky-400', route: '/campaigns/1', unread: true },
  { id: 2, text: '비건 신제품 론칭에 새 인플루언서가 지원했습니다.', time: '1시간 전', dot: 'bg-emerald-400', route: '/campaigns/2', unread: true },
  { id: 3, text: '인플루언서 관리에 새 그룹이 추가되었습니다.', time: '3시간 전', dot: 'bg-slate-400', route: '/influencers/manage', unread: true },
  { id: 4, text: '구독이 5일 후 만료됩니다. 갱신해 주세요.', time: '어제', dot: 'bg-amber-400', route: '/subscription', unread: false },
  { id: 5, text: '박리나님과의 협의가 수락되었습니다.', time: '2일 전', dot: 'bg-slate-400', route: '/influencers/manage', unread: false },
]

/* ── 콘텐츠 성과 — 기간별 ── */
type ContentPeriod = '일간' | '주간' | '월간'

const contentByPeriod: Record<ContentPeriod, { label: string; value: number; change: number; sparkline: number[] }[]> = {
  일간: [
    { label: '조회수', value: 3400,   change: 5.2,  sparkline: [28,30,27,32,29,31,35,30,33,32,36,31,34,38,33,36,34,38,35,40,36,38,37,40,38,35,37,39,36,34] },
    { label: '좋아요', value: 263,    change: 3.1,  sparkline: [22,24,21,26,23,25,28,24,27,25,29,24,27,30,26,28,27,30,28,32,29,30,29,31,30,28,29,31,28,26] },
    { label: '댓글',   value: 47,     change: -8.3, sparkline: [52,50,53,48,51,49,46,50,47,49,45,48,46,43,47,44,46,43,41,44,42,44,43,45,43,41,42,44,41,47] },
    { label: '공유',   value: 27,     change: 12.5, sparkline: [18,19,17,20,19,21,22,20,22,21,23,21,23,24,22,24,23,25,23,26,24,25,25,26,25,24,25,26,24,27] },
  ],
  주간: [
    { label: '조회수', value: 24300,  change: 12,   sparkline: [0,0,18,22,28,24,34,30,36,38,34,42] },
    { label: '좋아요', value: 1842,   change: 8.5,  sparkline: [0,0,14,18,22,19,26,24,28,30,27,32] },
    { label: '댓글',   value: 326,    change: -5.2, sparkline: [0,0,30,28,34,26,22,20,18,16,14,18] },
    { label: '공유',   value: 189,    change: 22,   sparkline: [0,0,8,10,14,11,17,16,19,21,18,24] },
  ],
  월간: [
    { label: '조회수', value: 104800, change: 18.4, sparkline: [0,0,0,0,0,0,0,0,62,74,90,112] },
    { label: '좋아요', value: 7940,   change: 11.2, sparkline: [0,0,0,0,0,0,0,0,55,62,74,90]  },
    { label: '댓글',   value: 1408,   change: -2.1, sparkline: [0,0,0,0,0,0,0,0,48,44,40,42]  },
    { label: '공유',   value: 814,    change: 31.6, sparkline: [0,0,0,0,0,0,0,0,32,46,58,72]  },
  ],
}


/* ── Sparkline SVG ── */
function Sparkline({ data, color, width = 80, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [contentPeriod, setContentPeriod] = useState<ContentPeriod>('주간')
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  /* ── QA: 신규 회원 온보딩 ── */
  if (qa === 'new-user') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">안녕하세요, 웰링크에 오신 것을 환영합니다 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">웰링크에서 첫 캠페인을 시작해 보세요.</p>
        </div>
        <div className="bg-gradient-to-br from-brand-green/10 to-brand-green-hover/5 border border-brand-green/20 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-green/15 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-brand-green" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">첫 캠페인을 만들어 보세요</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            캠페인을 등록하면 AI가 브랜드에 맞는 인플루언서를 추천해 드립니다.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/campaigns/new')}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-green-hover transition-colors"
            >
              <Megaphone size={14} className="inline mr-2" aria-hidden="true" />
              첫 캠페인 만들기
            </button>
            <button
              onClick={() => navigate('/influencers/list')}
              className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              인플루언서 탐색
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 @sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: '캠페인 등록', desc: '제품과 캠페인 정보를 입력하세요' },
            { step: '02', title: '인플루언서 매칭', desc: 'AI가 적합한 인플루언서를 추천합니다' },
            { step: '03', title: '성과 관리', desc: '실시간으로 캠페인 성과를 확인하세요' },
          ].map(s => (
            <div key={s.step} className="bg-white border border-gray-100 rounded-xl p-4">
              <span className="text-[11px] font-bold text-brand-green">Step {s.step}</span>
              <p className="text-sm font-semibold text-gray-900 mt-1">{s.title}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-100 rounded-xl" />
            <div className="h-4 w-32 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-9 w-28 bg-gray-100 rounded-xl" />
        </div>
        {/* 요약 배너 스켈레톤 */}
        <div className="h-16 bg-gray-100 rounded-xl" />
        {/* KPI 4개 스켈레톤 */}
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-32" />
          ))}
        </div>
        {/* 섹션 2개 스켈레톤 */}
        <div className="grid grid-cols-1 @sm:grid-cols-3 gap-4 @sm:gap-5">
          <div className="col-span-2 bg-gray-100 rounded-xl h-48" />
          <div className="bg-gray-100 rounded-xl h-48" />
        </div>
        {/* 콘텐츠 성과 스켈레톤 */}
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-24" />
          ))}
        </div>
      </div>
    )
  }

  /* ── QA: 빈 상태 (캠페인 없음) ── */
  if (qa === 'empty') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">안녕하세요, 웰링크 브랜드님</h1>
            <p className="text-sm text-gray-500 mt-0.5">아직 진행 중인 캠페인이 없습니다.</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
          >
            <Megaphone size={14} aria-hidden="true" />새 캠페인
          </button>
        </div>
        {/* 0값 KPI */}
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
          {[
            { title: '활성 캠페인', value: '0', sub: '진행 중인 캠페인 없음', icon: <Megaphone size={16} aria-hidden="true" /> },
            { title: '진행중 인플루언서', value: '0', sub: '참여 인원 없음', icon: <Users size={16} aria-hidden="true" /> },
            { title: '이번달 도달', value: '0', sub: '임프레션 없음', icon: <Activity size={16} aria-hidden="true" /> },
            { title: '검수대기', value: '0', sub: '콘텐츠 대기 없음', icon: <Clock size={16} aria-hidden="true" /> },
          ].map(k => (
            <div key={k.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">{k.title}</span>
                <span className="text-gray-300">{k.icon}</span>
              </div>
              <div className="text-[28px] font-bold text-gray-300">{k.value}</div>
              <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>
        {/* 빈 캠페인 영역 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Megaphone size={40} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-400 mb-1">진행 중인 캠페인이 없습니다</p>
          <p className="text-xs text-gray-400 mb-4">새 캠페인을 등록하고 인플루언서 마케팅을 시작해 보세요.</p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="text-sm bg-brand-green text-white px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors"
          >
            새 캠페인 만들기
          </button>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => n.unread).length
  const visibleNotifications = showAllNotifications ? notifications : notifications.slice(0, 4)

  const handleNotificationClick = (id: number, route: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    )
    navigate(route)
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  const isPlanLocked = qa === 'plan-locked'

  return (
    <div className="space-y-6">
      {/* ── QA: plan-locked 배너 ── */}
      {isPlanLocked && (
        <div className="flex items-center flex-wrap gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-5 py-3 text-sm">
          <Lock size={14} className="shrink-0" aria-hidden="true" />
          <span>현재 포커스 플랜입니다. Scale 이상에서 전체 분석이 가능합니다.</span>
          <button
            onClick={() => navigate('/subscription')}
            className="ml-auto text-xs font-semibold bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl transition-colors shrink-0"
          >
            플랜 업그레이드
          </button>
        </div>
      )}
      {/* ── 인사말 + 날짜 ── */}
      <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">안녕하세요, 웰링크 브랜드님</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
        >
          <Megaphone size={14} aria-hidden="true" />
          새 캠페인
        </button>
      </div>

      {/* ── 요약 배너 ── */}
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-start gap-4 shadow-sm">
        <div className="w-1 self-stretch rounded-full bg-brand-green shrink-0" />
        <div>
          <p className="text-xs font-medium text-gray-400 mb-1">이번 주 현황</p>
          <p className="text-sm leading-relaxed text-gray-700">
            봄 요가 프로모션 모집률이 <span className="font-semibold text-gray-900">53%</span>에 도달했습니다.
            마감까지 <span className="font-semibold text-rose-500">{getDDay('2026-04-28').label}</span>이므로 추가 인플루언서 초대를 권장합니다.
            이번 주 콘텐츠 조회수는 전주 대비 12% 증가 중입니다.
          </p>
        </div>
      </div>

      {/* ── KPI 카드 ── */}
      <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
        {kpis.map(kpi => {
          const isPositive = kpi.trend >= 0
          return (
            <div
              key={kpi.title}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-md cursor-default"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">{kpi.title}</span>
                <span className="text-gray-400">{kpi.icon}</span>
              </div>
              <div>
                <div className="text-[28px] font-bold text-gray-900 leading-tight">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-brand-green' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isPositive ? '+' : ''}{kpi.trend}%</span>
                <span className="text-gray-400 font-normal">전월 대비</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 활성 캠페인 현황 + 최근 알림 ── */}
      <div className="grid grid-cols-1 @sm:grid-cols-3 gap-4 @sm:gap-5">
        {/* 활성 캠페인 현황 */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">활성 캠페인 현황</h2>
            <button
              onClick={() => navigate('/campaigns')}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors duration-150 flex items-center gap-1"
            >
              전체보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['캠페인명', '상태', '진행률', '마감일', ''].map(h => (
                  <th key={h} scope="col" className="text-left text-xs font-medium text-gray-500 py-2.5 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const pct = c.total > 0 ? Math.round((c.current / c.total) * 100) : 0
                const { label: ddayLabel, pulse: ddayPulse, color: ddayTextColor } = getDDay(c.deadline)
                const ddayBadgeStyle = getDDayBadgeStyle(ddayTextColor, ddayPulse)
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${pct >= PROGRESS_THRESHOLD.warning ? 'bg-red-500' : 'bg-brand-green'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-600">{fmtDate(c.deadline)}</span>
                        <span className={`text-[11px] ${ddayBadgeStyle}`}>
                          {ddayLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => navigate(`/campaigns/${c.id}`)}
                        className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                      >
                        상세보기 <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>

        {/* 최근 알림 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gray-500" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-gray-900">최근 알림</h2>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none bg-brand-green"
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {visibleNotifications.map(n => (
              <button
                key={n.id}
                type="button"
                className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors duration-150 ${n.unread ? 'bg-brand-green/5' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/40`}
                onClick={() => handleNotificationClick(n.id, n.route)}
              >
                <div className="flex gap-2.5 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${n.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {n.text}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {notifications.length > 4 && (
            <div className="px-5 py-3 border-t border-gray-50">
              <button
                onClick={() => setShowAllNotifications(prev => !prev)}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors duration-150 flex items-center gap-1 w-full justify-center"
              >
                {showAllNotifications ? '접기' : '더보기'} <ArrowRight size={11} className={showAllNotifications ? 'rotate-90' : ''} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 콘텐츠 성과 ── */}
      <div className={isPlanLocked ? 'relative' : ''}>
        {isPlanLocked && (
          <div className="absolute inset-0 z-10 rounded-xl bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <Lock size={24} className="text-amber-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-700">Scale 플랜 이상에서 확인 가능합니다</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">콘텐츠 성과</h2>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['일간', '주간', '월간'] as ContentPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setContentPeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  contentPeriod === p ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
          {contentByPeriod[contentPeriod].map(item => {
            const isPositive = item.change >= 0
            const lineColor = isPositive ? 'var(--color-sparkline-success)' : 'var(--color-sparkline-alert)'
            return (
              <div
                key={item.label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">
                      {item.label === '조회수' ? <Eye size={14} /> : item.label === '좋아요' ? <Heart size={14} /> : item.label === '댓글' ? <MessageCircle size={14} /> : <BarChart3 size={14} />}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                  </div>
                  <span
                    className={`text-[11px] font-medium ${isPositive ? 'text-brand-green' : 'text-red-500'}`}
                  >
                    {fmtRate(item.change)}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-gray-900">{fmtNumber(item.value)}</span>
                  <Sparkline data={item.sparkline} color={lineColor} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 빠른 실행 ── */}
      <div className={isPlanLocked ? 'relative' : ''}>
        {isPlanLocked && (
          <div className="absolute inset-0 z-10 rounded-xl bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <Lock size={24} className="text-amber-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-700">Scale 플랜 이상에서 확인 가능합니다</p>
          </div>
        )}
        <h2 className="text-sm font-semibold text-gray-900 mb-3">빠른 실행</h2>
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3">
          {[
            { icon: <Megaphone size={18} aria-hidden="true" />, label: '새 캠페인',      sub: '캠페인 만들기',    route: '/campaigns/new',     primary: true },
            { icon: <Users size={18} aria-hidden="true" />,     label: '인플루언서 탐색', sub: '전체 리스트 보기', route: '/influencers/list',  primary: false },
            { icon: <Search size={18} aria-hidden="true" />,    label: '인플루언서 관리', sub: '그룹·북마크 관리', route: '/influencers/manage', primary: false },
            { icon: <Zap size={18} aria-hidden="true" />,       label: '콘텐츠 검수',    sub: qa === 'empty' ? '--건' : '대기 중 2건', route: '/campaigns', primary: false },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 text-left hover:shadow-md hover:border-gray-200 transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${item.primary ? 'bg-brand-green/10' : 'bg-gray-100'}`}>
                <span className={item.primary ? 'text-brand-green' : 'text-gray-500'}>{item.icon}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
