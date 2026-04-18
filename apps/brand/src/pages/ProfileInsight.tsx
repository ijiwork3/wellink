import { useState } from 'react'
import { BarChart2, Users, TrendingUp, Eye, Heart, MessageCircle, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { KPICard } from '@wellink/ui'
import ErrorState from '../components/ErrorState'
import { useQAMode } from '../utils/useQAMode'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'

const periods = ['일간', '주간', '월간', '연간'] as const
type Period = (typeof periods)[number]

/** 기간별 KPI 데이터 */
const kpiByPeriod: Record<Period, { followers: string; reach: string; engagement: string; impressions: string; trends: [number, number, number, number] }> = {
  일간: { followers: '24,800', reach: '9.8%',  engagement: '4.2%', impressions: '31.2K', trends: [0.1, 0.8, 0.5, 2.1] },
  주간: { followers: '24,650', reach: '11.2%', engagement: '3.9%', impressions: '198K',  trends: [1.2, 1.5, -0.1, 4.8] },
  월간: { followers: '23,900', reach: '12.4%', engagement: '3.7%', impressions: '820K',  trends: [5.2, 1.8, -0.3, 8.6] },
  연간: { followers: '18,200', reach: '13.1%', engagement: '3.5%', impressions: '9.2M',  trends: [22.8, 3.1, -0.8, 18.4] },
}

/** 기간별 팔로워 추이 데이터 — null = 데이터 없음 */
type BarDataItem = { label: string; value: number | null; display: string; showLabel?: boolean }

const followerDataByPeriod: Record<Period, BarDataItem[]> = {
  // 일간: 최근 30일 — 라벨은 5일 간격만
  일간: Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    const base = 24100
    const v = i < 5 ? null : Math.round(base + (i - 5) * 28 + (Math.sin(i * 0.8) * 80))
    return {
      label: `${day}일`,
      value: v,
      display: v ? `${(v / 1000).toFixed(1)}K` : '--',
      showLabel: day === 1 || day % 5 === 0,
    }
  }),
  // 주간: 최근 12주
  주간: [
    { label: '1/2주', value: null,  display: '--',    showLabel: true },
    { label: '1/3주', value: null,  display: '--',    showLabel: true },
    { label: '1/4주', value: 20800, display: '20.8K', showLabel: true },
    { label: '2/1주', value: 21200, display: '21.2K', showLabel: true },
    { label: '2/2주', value: 21600, display: '21.6K', showLabel: true },
    { label: '2/3주', value: 22100, display: '22.1K', showLabel: true },
    { label: '2/4주', value: 22500, display: '22.5K', showLabel: true },
    { label: '3/1주', value: 22900, display: '22.9K', showLabel: true },
    { label: '3/2주', value: 23300, display: '23.3K', showLabel: true },
    { label: '3/3주', value: 23700, display: '23.7K', showLabel: true },
    { label: '3/4주', value: 24100, display: '24.1K', showLabel: true },
    { label: '이번주', value: 24800, display: '24.8K', showLabel: true },
  ],
  // 월간: 최근 12개월
  월간: [
    { label: '5월',  value: null,  display: '--' },
    { label: '6월',  value: null,  display: '--' },
    { label: '7월',  value: null,  display: '--' },
    { label: '8월',  value: null,  display: '--' },
    { label: '9월',  value: null,  display: '--' },
    { label: '10월', value: null,  display: '--' },
    { label: '11월', value: null,  display: '--' },
    { label: '12월', value: null,  display: '--' },
    { label: '1월',  value: 20200, display: '20.2K' },
    { label: '2월',  value: 21800, display: '21.8K' },
    { label: '3월',  value: 23100, display: '23.1K' },
    { label: '4월',  value: 24800, display: '24.8K' },
  ],
  // 연간: 2025년 서비스 시작
  연간: [
    { label: '2025', value: 12400, display: '12.4K' },
    { label: "'26*", value: 24800, display: '24.8K' },
  ],
}

/** 기간별 피드 추세 데이터 */
type TrendItem = { label: string; likes: number | null; comments: number | null; reach: number | null; saves: number | null; showLabel?: boolean }

// 일간 30일 트렌드 데이터 생성 헬퍼 — showLabel은 5일 간격
const dailyTrend: TrendItem[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const hasData = i >= 8 // 1~8일은 데이터 없음
  return {
    label: `${day}일`,
    likes:    hasData ? Math.round(300 + i * 12 + Math.sin(i * 0.9) * 60) : null,
    comments: hasData ? Math.round(24 + i * 1.4 + Math.sin(i * 1.1) * 8)  : null,
    reach:    hasData ? Math.round(2000 + i * 90 + Math.sin(i * 0.7) * 400) : null,
    saves:    hasData ? Math.round(40 + i * 3 + Math.sin(i * 1.3) * 15)   : null,
    showLabel: day === 1 || day % 5 === 0,
  }
})

const trendDataByPeriod: Record<Period, TrendItem[]> = {
  일간: dailyTrend,
  주간: [
    { label: '1/2주', likes: null,  comments: null, reach: null,   saves: null },
    { label: '1/3주', likes: null,  comments: null, reach: null,   saves: null },
    { label: '1/4주', likes: 1640,  comments: 138,  reach: 12800,  saves: 278 },
    { label: '2/1주', likes: 1840,  comments: 156,  reach: 14200,  saves: 310 },
    { label: '2/2주', likes: 2100,  comments: 182,  reach: 16800,  saves: 380 },
    { label: '2/3주', likes: 1960,  comments: 170,  reach: 15400,  saves: 342 },
    { label: '2/4주', likes: 2380,  comments: 204,  reach: 18200,  saves: 420 },
    { label: '3/1주', likes: 2640,  comments: 228,  reach: 20100,  saves: 475 },
    { label: '3/2주', likes: 2480,  comments: 215,  reach: 19200,  saves: 448 },
    { label: '3/3주', likes: 2720,  comments: 238,  reach: 20800,  saves: 492 },
    { label: '3/4주', likes: 2640,  comments: 228,  reach: 20100,  saves: 475 },
    { label: '이번주', likes: 2820,  comments: 246,  reach: 21500,  saves: 512 },
  ],
  월간: [
    { label: '5월',  likes: null,   comments: null,  reach: null,   saves: null },
    { label: '6월',  likes: null,   comments: null,  reach: null,   saves: null },
    { label: '7월',  likes: null,   comments: null,  reach: null,   saves: null },
    { label: '8월',  likes: null,   comments: null,  reach: null,   saves: null },
    { label: '9월',  likes: null,   comments: null,  reach: null,   saves: null },
    { label: '10월', likes: null,   comments: null,  reach: null,   saves: null },
    { label: '11월', likes: null,   comments: null,  reach: null,   saves: null },
    { label: '12월', likes: null,   comments: null,  reach: null,   saves: null },
    { label: '1월',  likes: 7200,   comments: 620,   reach: 58000,  saves: 1240 },
    { label: '2월',  likes: 8400,   comments: 720,   reach: 67000,  saves: 1480 },
    { label: '3월',  likes: 9100,   comments: 790,   reach: 74000,  saves: 1620 },
    { label: '4월',  likes: 10200,  comments: 880,   reach: 82000,  saves: 1840 },
  ],
  연간: [
    { label: '2025', likes: 118000, comments: 10200, reach: 920000, saves: 21600 },
    { label: "'26*", likes: 44000,  comments: 3800,  reach: 340000, saves: 8100 },
  ],
}

/** 콘텐츠 유형별 성과 */
const contentTypeData = [
  { type: '릴스',     avgReach: 5200, avgLikes: 620, engagementRate: 4.8 },
  { type: '카드뉴스', avgReach: 3100, avgLikes: 380, engagementRate: 3.2 },
  { type: '일반 사진', avgReach: 2400, avgLikes: 290, engagementRate: 2.7 },
  { type: '스토리',   avgReach: 1800, avgLikes: 210, engagementRate: 3.2 },
]

const metricColors = {
  likes:    '#8CC63F',
  reach:    '#3B82F6',
  comments: '#F59E0B',
  saves:    '#8B5CF6',
}

type MetricKey = keyof typeof metricColors

function getDateLabel(period: Period, offset: number): string {
  const now = new Date()
  if (period === '일간') {
    const d = new Date(now); d.setDate(d.getDate() + offset)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  if (period === '주간') {
    const start = new Date(now); start.setDate(start.getDate() + offset * 7 - start.getDay() + 1)
    const end = new Date(start); end.setDate(start.getDate() + 6)
    return `${start.getMonth() + 1}/${start.getDate()} – ${end.getMonth() + 1}/${end.getDate()}`
  }
  if (period === '연간') {
    const year = now.getFullYear() + offset
    return `${year}년`
  }
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
}

/** 팔로워 추이 바 차트 — null = 회색 점선 바, 30개 이상은 라벨 간소화 */
function FollowerBarChart({ data }: { data: BarDataItem[] }) {
  const maxVal = Math.max(...data.filter(m => m.value !== null).map(m => m.value as number), 1)
  const isDense = data.length > 14 // 30일 모드

  return (
    <div className="flex items-end h-28" style={{ gap: isDense ? '1px' : '8px' }}>
      {data.map(({ label, value, display, showLabel }) => {
        const isNull = value === null
        const heightPct = isNull ? 20 : Math.max(6, (value / maxVal) * 100)
        const doShowLabel = isDense ? (showLabel ?? false) : true
        return (
          <div key={label} className="flex-1 flex flex-col items-center min-w-0" style={{ gap: isDense ? '1px' : '4px' }}>
            {/* 값 레이블 — 밀집 모드에서는 숨김 */}
            {!isDense && (
              <span className={`text-[10px] ${isNull ? 'text-gray-300' : 'text-gray-500'}`}>{display}</span>
            )}
            <div
              title={`${label}: ${display}`}
              className={`w-full rounded-t-sm ${isNull ? 'bg-gray-100 border border-dashed border-gray-300' : 'bg-gray-800'} cursor-default`}
              style={{ height: `${heightPct}%`, minHeight: '3px', transition: 'height 0.3s' }}
            />
            {/* x축 라벨 — 밀집 모드는 showLabel인 것만 */}
            <span
              className={`text-[9px] ${isNull ? 'text-gray-300' : 'text-gray-400'} truncate w-full text-center`}
              style={{ visibility: doShowLabel ? 'visible' : 'hidden' }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** 멀티라인 추세 SVG 차트 — null 구간은 점선 처리 */
function MultiLineTrendChart({
  data,
  activeMetrics,
}: {
  data: TrendItem[]
  activeMetrics: MetricKey[]
}) {
  const width = 580
  const height = 200
  const padX = 48
  const padY = 24

  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const metricRanges: Record<MetricKey, { min: number; max: number }> = {} as Record<MetricKey, { min: number; max: number }>
  ;(Object.keys(metricColors) as MetricKey[]).forEach(metric => {
    const vals = data.map(d => d[metric]).filter((v): v is number => v !== null)
    metricRanges[metric] = { min: Math.min(...vals, 0), max: Math.max(...vals, 1) }
  })

  const getPoints = (metric: MetricKey) => {
    const { min, max } = metricRanges[metric]
    const range = max - min || 1
    return data.map((d, i) => ({
      x: padX + (chartW / Math.max(1, data.length - 1)) * i,
      y: d[metric] !== null
        ? padY + chartH - ((d[metric] as number - min) / range) * chartH
        : null,
      value: d[metric],
    }))
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '200px' }}>
      {/* 그리드 라인 */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padY + chartH - ratio * chartH
        return <line key={ratio} x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}

      {/* null 구간 배경 음영 */}
      {(() => {
        const nullIndices = data.map((d, i) =>
          Object.keys(metricColors).some(m => d[m as MetricKey] === null) ? i : -1
        ).filter(i => i >= 0)
        if (!nullIndices.length) return null
        // 연속 구간 그룹핑
        const groups: number[][] = []
        nullIndices.forEach(idx => {
          if (!groups.length || idx !== groups[groups.length - 1][groups[groups.length - 1].length - 1] + 1) {
            groups.push([idx])
          } else {
            groups[groups.length - 1].push(idx)
          }
        })
        return groups.map((group, gi) => {
          const xStart = padX + (chartW / Math.max(1, data.length - 1)) * group[0] - (group[0] === 0 ? 0 : chartW / (data.length - 1) / 2)
          const xEnd   = padX + (chartW / Math.max(1, data.length - 1)) * group[group.length - 1] + (group[group.length - 1] === data.length - 1 ? 0 : chartW / (data.length - 1) / 2)
          return (
            <rect
              key={gi}
              x={xStart}
              y={padY}
              width={Math.max(0, xEnd - xStart)}
              height={chartH}
              fill="#f9fafb"
              rx={4}
            />
          )
        })
      })()}

      {/* null 구간 텍스트 — 첫 번째 null 그룹에만 */}
      {(() => {
        const nullCount = data.filter(d => d.likes === null).length
        if (!nullCount) return null
        const firstNullEnd = data.findIndex(d => d.likes !== null) - 1
        if (firstNullEnd < 0) return null
        const cx = padX + (chartW / Math.max(1, data.length - 1)) * (firstNullEnd / 2)
        return (
          <text x={cx} y={padY + chartH / 2 + 4} textAnchor="middle" fill="#d1d5db" fontSize="10">
            데이터 없음
          </text>
        )
      })()}

      {/* 각 지표 라인 — null 구간 건너뜀 */}
      {activeMetrics.map(metric => {
        const points = getPoints(metric)
        const color = metricColors[metric]
        const isDense = data.length > 14
        const dotR = isDense ? 2 : 3.5
        const dotInner = isDense ? 0.8 : 1.5

        const segments: { x: number; y: number; idx: number }[][] = []
        let current: { x: number; y: number; idx: number }[] = []
        points.forEach((p, idx) => {
          if (p.y !== null) {
            current.push({ x: p.x, y: p.y, idx })
          } else {
            if (current.length) { segments.push(current); current = [] }
          }
        })
        if (current.length) segments.push(current)

        return (
          <g key={metric}>
            {segments.map((seg, si) => {
              const linePath = seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
              return (
                <g key={si}>
                  <path d={linePath} fill="none" stroke={color} strokeWidth={isDense ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
                  {seg.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={dotR} fill={color} />
                      <circle cx={p.x} cy={p.y} r={dotInner} fill="white" />
                    </g>
                  ))}
                </g>
              )
            })}
          </g>
        )
      })}

      {/* x축 라벨 — showLabel 조건 적용, null은 회색 */}
      {data.map((d, i) => {
        const x = padX + (chartW / Math.max(1, data.length - 1)) * i
        const isNull = d.likes === null
        const isDense = data.length > 14
        const doShow = isDense ? (d.showLabel ?? false) : true
        if (!doShow) return null
        return (
          <text key={i} x={x} y={height - 4} textAnchor="middle" fill={isNull ? '#d1d5db' : '#9ca3af'} fontSize="10">
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}

export default function ProfileInsight() {
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const [period, setPeriod] = useState<Period>('월간')
  const [dateOffset, setDateOffset] = useState(0)
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['likes', 'reach'])

  const toggleMetric = (metric: MetricKey) => {
    setActiveMetrics(prev =>
      prev.includes(metric)
        ? prev.length > 1 ? prev.filter(m => m !== metric) : prev
        : [...prev, metric]
    )
  }

  const metricLabels: Record<MetricKey, string> = {
    likes: '좋아요',
    reach: '도달',
    comments: '댓글',
    saves: '저장',
  }

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-100 rounded-xl" />
            <div className="h-4 w-56 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-9 w-36 bg-gray-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-32" />)}
        </div>
        <div className="bg-gray-100 rounded-xl h-64" />
        <div className="grid grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-5 gap-3 @sm:gap-5">
          <div className="col-span-3 bg-gray-100 rounded-xl h-48" />
          <div className="col-span-2 bg-gray-100 rounded-xl h-48" />
        </div>
      </div>
    )
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">프로필 인사이트</h1>
          <p className="text-sm text-gray-500 mt-0.5">브랜드 프로필의 콘텐츠 성과 및 팔로워 현황</p>
        </div>
        <InstagramConnectPrompt featureName="프로필 인사이트" />
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="프로필 인사이트를 불러올 수 없습니다" subMessage="네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." onRetry={() => window.location.reload()} />
  }

  /* ── QA: 빈 상태 ── */
  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center w-full max-w-sm">
          <BarChart2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400 mb-1">분석 데이터가 없습니다</p>
          <p className="text-xs text-gray-300 mb-4">인스타그램 계정을 연결하면 자동으로 수집됩니다</p>
        </div>
      </div>
    )
  }

  const kpi = kpiByPeriod[period]
  const followerData = followerDataByPeriod[period]
  const trendData = trendDataByPeriod[period]

  const nullCount = followerData.filter(d => d.value === null).length
  const ytdLabel = period === '연간' ? '+22.8% 전체' : period === '월간' ? '+22.8% YTD' : period === '주간' ? '+1.2% WoW' : '+0.3% DoD'

  return (
    <div className="space-y-6">
      {/* 헤더 + 기간 탭 + 날짜 네비게이션 */}
      <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">프로필 인사이트</h1>
          <p className="text-sm text-gray-500 mt-0.5">브랜드 프로필의 콘텐츠 성과 및 팔로워 현황</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 기간 탭 */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setDateOffset(0) }}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  period === p
                    ? 'bg-white shadow-sm font-semibold text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {/* 날짜 이동 */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
            <button
              onClick={() => setDateOffset(o => o - 1)}
              className="p-0.5 rounded hover:bg-gray-100 transition-colors"
              aria-label="이전 기간"
            >
              <ChevronLeft size={14} className="text-gray-500" />
            </button>
            <span className="text-xs font-medium text-gray-700 min-w-[90px] text-center">
              {getDateLabel(period, dateOffset)}
            </span>
            <button
              onClick={() => setDateOffset(o => Math.min(0, o + 1))}
              disabled={dateOffset >= 0}
              aria-label="다음 기간"
              className="p-0.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="팔로워 수"
          value={kpi.followers}
          sub="@wellink_brand"
          trend={kpi.trends[0]}
          trendLabel="전기간 대비"
          icon={<Users size={16} />}
          tooltip="현재 브랜드 계정을 팔로우하는 총 사용자 수"
        />
        <KPICard
          title="평균 도달률"
          value={kpi.reach}
          sub="게시물 기준"
          trend={kpi.trends[1]}
          trendLabel="전기간 대비"
          icon={<Eye size={16} />}
          tooltip="게시물 1개당 팔로워 대비 도달한 비율 평균"
        />
        <KPICard
          title="참여율"
          value={kpi.engagement}
          sub="좋아요+댓글 기준"
          trend={kpi.trends[2]}
          trendLabel="전기간 대비"
          icon={<TrendingUp size={16} />}
          tooltip="(좋아요+댓글) / 도달 수 x 100으로 산출"
        />
        <KPICard
          title="노출 수"
          value={kpi.impressions}
          sub={period === '일간' ? '당일 누적' : period === '주간' ? '주간 누적' : period === '월간' ? '월간 누적' : '연간 누적'}
          trend={kpi.trends[3]}
          trendLabel="전기간 대비"
          icon={<BarChart2 size={16} />}
          tooltip="콘텐츠가 화면에 노출된 총 횟수 (중복 포함)"
        />
      </div>

      {/* 피드별 추세선 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">피드별 성과 추세</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {period === '일간' ? '최근 7일 게시물의 지표별 추이' :
               period === '주간' ? '최근 7주 게시물의 지표별 추이' :
               period === '월간' ? '최근 7개월 게시물의 지표별 추이' :
               '연도별 지표 추이'}
              {nullCount > 0 && (
                <span className="ml-1.5 text-gray-300">· 회색 구간은 데이터 없음</span>
              )}
            </p>
          </div>
          {/* 지표 토글 */}
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(metricColors) as MetricKey[]).map(metric => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                  activeMetrics.includes(metric)
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-400 bg-white'
                }`}
                style={activeMetrics.includes(metric) ? { backgroundColor: metricColors[metric] } : {}}
              >
                {metric === 'likes'    && <Heart size={10} />}
                {metric === 'reach'    && <Eye size={10} />}
                {metric === 'comments' && <MessageCircle size={10} />}
                {metric === 'saves'    && <Bookmark size={10} />}
                {metricLabels[metric]}
              </button>
            ))}
          </div>
        </div>
        <MultiLineTrendChart data={trendData} activeMetrics={activeMetrics} />
      </div>

      {/* 콘텐츠 유형별 성과 + 팔로워 추이 */}
      <div className="grid grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-5 gap-3 @sm:gap-5">
        {/* 콘텐츠 유형별 성과 (3/5) */}
        <div className="col-span-2 @sm:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">콘텐츠 유형별 성과</h3>
          <div className="space-y-3">
            {contentTypeData.map(ct => (
              <div key={ct.type} className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16 shrink-0">{ct.type}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#8CC63F]"
                    style={{ width: `${(ct.avgReach / 5200) * 100}%` }}
                  />
                </div>
                <div className="flex gap-3 text-xs text-right">
                  <span className="text-gray-700 w-14">도달 <strong>{ct.avgReach.toLocaleString()}</strong></span>
                  <span className={`font-semibold w-10 ${ct.engagementRate >= 4 ? 'text-[#5a8228]' : ct.engagementRate >= 2.5 ? 'text-gray-700' : 'text-red-500'}`}>
                    {ct.engagementRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            <span className="text-[#8CC63F] font-medium">초록색</span>은 높은 참여율,{' '}
            <span className="text-red-500 font-medium">빨간색</span>은 개선 필요 지표
          </p>
        </div>

        {/* 팔로워 추이 (2/5) */}
        <div className="col-span-2 @sm:col-span-3 @lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">팔로워 추이</h3>
            <span className="text-xs text-[#8CC63F] font-medium">{ytdLabel}</span>
          </div>
          <FollowerBarChart data={followerData} />
          {nullCount > 0 && (
            <p className="text-[10px] text-gray-300 mt-2">
              회색 점선 바: 해당 기간 데이터 없음
            </p>
          )}
          {period === '연간' && (
            <p className="text-[10px] text-gray-400 mt-2">
              * 2026년은 1~4월 기준
            </p>
          )}
        </div>
      </div>

      {/* 최근 게시물 상세 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          {period === '일간' ? '일별' : period === '주간' ? '주별' : period === '월간' ? '월별' : '연도별'} 게시물 성과
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 pb-3 pr-4">기간</th>
                <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">도달</th>
                <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">좋아요</th>
                <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">댓글</th>
                <th className="text-right text-xs font-medium text-gray-400 pb-3 px-4">저장</th>
                <th className="text-right text-xs font-medium text-gray-400 pb-3">참여율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trendData.map((d, i) => {
                const isNull = d.reach === null
                return (
                  <tr key={i} className={`transition-colors ${isNull ? '' : 'hover:bg-gray-50'}`}>
                    <td className={`py-2.5 pr-4 text-xs ${isNull ? 'text-gray-300' : 'text-gray-500'}`}>{d.label}</td>
                    {isNull ? (
                      <td colSpan={5} className="py-2.5 text-center text-xs text-gray-300">데이터 없음</td>
                    ) : (
                      <>
                        <td className="py-2.5 px-4 text-right text-xs text-gray-700">{(d.reach as number).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-xs text-gray-700">{(d.likes as number).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-xs text-gray-700">{(d.comments as number).toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right text-xs text-gray-700">{(d.saves as number).toLocaleString()}</td>
                        <td className="py-2.5 text-right">
                          {(() => {
                            const engRate = (((d.likes as number) + (d.comments as number) + (d.saves as number)) / (d.reach as number) * 100).toFixed(1)
                            const isGood = parseFloat(engRate) >= 4
                            const isBad  = parseFloat(engRate) < 2.5
                            return (
                              <span className={`text-xs font-semibold ${isGood ? 'text-[#8CC63F]' : isBad ? 'text-red-500' : 'text-gray-700'}`}>
                                {engRate}%
                              </span>
                            )
                          })()}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
