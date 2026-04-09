import { useNavigate } from 'react-router-dom'
import {
  Megaphone, Users, Activity, Clock, Bell,
  TrendingUp, TrendingDown, ArrowRight, Zap, Search,
  Eye, Heart, MessageCircle, BarChart3
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

/* ── Brand tokens ── */
const BRAND_GREEN = '#8CC63F'

/* ── KPI 데이터 ── */
const kpis = [
  {
    title: '활성 캠페인',
    value: 3,
    sub: '현재 진행 중',
    trend: 50,
    icon: <Megaphone size={16} />,
  },
  {
    title: '진행중 인플루언서',
    value: 12,
    sub: '총 참여 인원',
    trend: 20,
    icon: <Users size={16} />,
  },
  {
    title: '이번달 도달',
    value: '482,000',
    sub: '누적 임프레션',
    trend: 8.3,
    icon: <Activity size={16} />,
  },
  {
    title: '검수대기',
    value: 2,
    sub: '콘텐츠 대기 중',
    trend: -33.3,
    icon: <Clock size={16} />,
  },
]

/* ── 캠페인 데이터 ── */
const campaigns = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8, deadline: '2026-04-11', dday: 2 },
  { id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0, deadline: '2026-04-18', dday: 9 },
]

/* ── 알림 데이터 ── */
const notifications = [
  { id: 1, text: '이창민님이 콘텐츠를 제출했습니다 — 검수가 필요합니다.', time: '5분 전', dot: 'bg-sky-400', route: '/campaigns/1', unread: true },
  { id: 2, text: '비건 신제품 론칭에 새 인플루언서가 지원했습니다.', time: '1시간 전', dot: 'bg-emerald-400', route: '/campaigns/2', unread: true },
  { id: 3, text: 'AI 리스트업이 완료되었습니다. 결과를 확인하세요.', time: '3시간 전', dot: 'bg-slate-400', route: '/influencers/ai', unread: true },
  { id: 4, text: '구독이 5일 후 만료됩니다. 갱신해 주세요.', time: '어제', dot: 'bg-amber-400', route: '/subscription', unread: false },
  { id: 5, text: '박리나님과의 협의가 수락되었습니다.', time: '2일 전', dot: 'bg-slate-400', route: '/influencers/manage', unread: false },
]

/* ── 콘텐츠 성과 (이번 주) ── */
const weeklyContent = [
  { label: '조회수', value: '24.3K', change: 12, icon: <Eye size={14} />, sparkline: [30, 45, 38, 52, 60, 55, 72] },
  { label: '좋아요', value: '1,842', change: 8.5, icon: <Heart size={14} />, sparkline: [20, 28, 25, 35, 32, 40, 45] },
  { label: '댓글', value: '326', change: -5.2, icon: <MessageCircle size={14} />, sparkline: [40, 35, 42, 30, 28, 25, 22] },
  { label: '공유', value: '189', change: 22, icon: <BarChart3 size={14} />, sparkline: [10, 15, 12, 20, 25, 28, 35] },
]


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

  const unreadCount = notifications.filter(n => n.unread).length
  const visibleNotifications = notifications.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* ── 인사말 + 날짜 ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">안녕하세요, test님</h1>
        <p className="text-sm text-gray-500 mt-0.5">2026년 4월 9일 수요일</p>
      </div>

      {/* ── 요약 배너 ── */}
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-start gap-4 shadow-sm">
        <div className="w-1 self-stretch rounded-full bg-[#8CC63F] shrink-0" />
        <div>
          <p className="text-xs font-medium text-gray-400 mb-1">이번 주 현황</p>
          <p className="text-sm leading-relaxed text-gray-700">
            봄 요가 프로모션 모집률이 <span className="font-semibold text-gray-900">53%</span>에 도달했습니다.
            마감까지 <span className="font-semibold text-rose-500">D-2</span>이므로 추가 인플루언서 초대를 권장합니다.
            이번 주 콘텐츠 조회수는 전주 대비 12% 증가 중입니다.
          </p>
        </div>
      </div>

      {/* ── KPI 카드 ── */}
      <div className="grid grid-cols-4 gap-4">
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
              <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? '' : 'text-red-500'}`} style={isPositive ? { color: BRAND_GREEN } : undefined}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isPositive ? '+' : ''}{kpi.trend}%</span>
                <span className="text-gray-400 font-normal">전월 대비</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 활성 캠페인 현황 + 최근 알림 ── */}
      <div className="grid grid-cols-3 gap-5">
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['캠페인명', '상태', '진행률', '마감일', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 py-2.5 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const pct = c.total > 0 ? Math.round((c.current / c.total) * 100) : 0
                const isUrgent = c.dday <= 3
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
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: BRAND_GREEN }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-600">{c.deadline}</span>
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                            isUrgent
                              ? 'bg-red-100 text-red-600 animate-pulse'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          D-{c.dday}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                        상세보기 <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 최근 알림 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">최근 알림</h2>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none"
                  style={{ backgroundColor: BRAND_GREEN }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {visibleNotifications.map(n => (
              <div
                key={n.id}
                className={`px-5 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${n.unread ? 'bg-blue-50/30' : ''}`}
                onClick={() => navigate(n.route)}
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
              </div>
            ))}
          </div>
          {notifications.length > 4 && (
            <div className="px-5 py-3 border-t border-gray-50">
              <button
                onClick={() => navigate('/notifications')}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors duration-150 flex items-center gap-1 w-full justify-center"
              >
                더보기 <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 이번 주 콘텐츠 성과 ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">이번 주 콘텐츠 성과</h2>
        <div className="grid grid-cols-4 gap-4">
          {weeklyContent.map(item => {
            const isPositive = item.change >= 0
            const lineColor = isPositive ? BRAND_GREEN : '#EF4444'
            return (
              <div
                key={item.label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">{item.icon}</span>
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                  </div>
                  <span
                    className={`text-[11px] font-medium ${isPositive ? '' : 'text-red-500'}`}
                    style={isPositive ? { color: BRAND_GREEN } : undefined}
                  >
                    {isPositive ? '+' : ''}{item.change}%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  <Sparkline data={item.sparkline} color={lineColor} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 빠른 실행 ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">빠른 실행</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              icon: <Megaphone size={18} />,
              label: '새 캠페인',
              sub: '캠페인 만들기',
              route: '/campaigns/new',
              gradient: 'from-[#8CC63F]/10 to-[#8CC63F]/5',
              iconColor: 'text-[#8CC63F]',
            },
            {
              icon: <Users size={18} />,
              label: 'AI 리스트업',
              sub: '인플루언서 추천',
              route: '/influencers/ai',
              gradient: 'from-violet-50 to-violet-50/30',
              iconColor: 'text-violet-500',
            },
            {
              icon: <Search size={18} />,
              label: '인플루언서 탐색',
              sub: '전체 리스트 보기',
              route: '/influencers/list',
              gradient: 'from-blue-100/80 to-blue-50/40',
              iconColor: 'text-blue-600',
            },
            {
              icon: <Zap size={18} />,
              label: '콘텐츠 검수',
              sub: '대기 중 2건',
              route: '/campaigns/1',
              gradient: 'from-orange-100/80 to-orange-50/40',
              iconColor: 'text-orange-500',
            },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 text-left hover:shadow-md hover:border-gray-200 transition-all duration-200 group"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3`}>
                <span className={item.iconColor}>{item.icon}</span>
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
