import { useState, useRef, useEffect, useCallback } from 'react'
import { BarChart2, Users, TrendingUp, Eye, Heart, MessageCircle, Bookmark, Loader2, Sparkles, ChevronLeft, ChevronRight, Layers, Play, Image as ImageIcon } from 'lucide-react'
import { KPICard, ErrorState, EmptyState, DateRangePicker, Modal, fmtNumber, ENGAGEMENT_THRESHOLD, CHART_COLORS, getEngagementColor, Pagination, useIsTouchDevice, SkeletonCard, ChartScrollContainer, type ChartScrollContainerHandle } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import { useDeviceMode } from '../qa-mockup-kit'

type Period = '일간' | '주간' | '월간' | '연간'

/** 배열 앞뒤 null 항목 제거 — 컴포넌트 외부 모듈 수준 유틸 */
function trimEdgeNulls<T>(arr: T[], isNull: (item: T) => boolean): T[] {
  const first = arr.findIndex(item => !isNull(item))
  if (first === -1) return arr
  const last = arr.length - 1 - [...arr].reverse().findIndex(item => !isNull(item))
  return arr.slice(first, last + 1)
}

/** 기간별 KPI 데이터 */
const kpiByPeriod: Record<Period, { followers: number; reach: number; engagement: number; impressions: number; trends: [number, number, number, number] }> = {
  일간: { followers: 24800, reach: 9.8,  engagement: 4.2, impressions: 31200,   trends: [0.1, 0.8, 0.5, 2.1] },
  주간: { followers: 24650, reach: 11.2, engagement: 3.9, impressions: 198000,  trends: [1.2, 1.5, -0.1, 4.8] },
  월간: { followers: 23900, reach: 12.4, engagement: 3.7, impressions: 820000,  trends: [5.2, 1.8, -0.3, 8.6] },
  연간: { followers: 18200, reach: 13.1, engagement: 3.5, impressions: 9200000, trends: [22.8, 3.1, -0.8, 18.4] },
}

/** 전환 KPI 데이터 — 원본 buildProfileConversionMetrics 동등 (프로필 방문/웹사이트 클릭/클릭률) */
const conversionByPeriod: Record<Period, { profileViews: number; websiteClicks: number; profileViewsGrowth: number; websiteClicksGrowth: number; ctrGrowth: number }> = {
  일간: { profileViews: 480,    websiteClicks: 92,    profileViewsGrowth: 4.1, websiteClicksGrowth: 6.2,  ctrGrowth: 2.0 },
  주간: { profileViews: 3200,   websiteClicks: 612,   profileViewsGrowth: 8.5, websiteClicksGrowth: 9.8,  ctrGrowth: 1.2 },
  월간: { profileViews: 12400,  websiteClicks: 2380,  profileViewsGrowth: 14.6, websiteClicksGrowth: 18.2, ctrGrowth: 3.1 },
  연간: { profileViews: 142000, websiteClicks: 26800, profileViewsGrowth: 32.4, websiteClicksGrowth: 41.5, ctrGrowth: 6.9 },
}

/** 팔로워 인구통계 더미 — 원본 followersAudience 동등 */
const FOLLOWER_DEMOGRAPHIC = {
  gender: { malePercent: 38, femalePercent: 62 },
  age: [
    { range: '18-24', percent: 18 },
    { range: '25-34', percent: 42 },
    { range: '35-44', percent: 24 },
    { range: '45-54', percent: 12 },
    { range: '55+', percent: 4 },
  ],
}

/** AI 프로필 분석 더미 — 원본 useGetProfileAI 동등 */
const PROFILE_AI_SUMMARY = `브랜드 프로필 핵심 인사이트

• 팔로워 25K 규모 대비 도달률(12.4%)과 참여율(3.7%)이 모두 업계 평균 이상이며, 콘텐츠 반응이 안정적입니다.
• 노출 대비 도달률이 4월 들어 +1.8%p 상승했고, 동일 기간 게시 빈도도 늘어 콘텐츠 리듬을 잘 유지하고 있습니다.
• 25-34세 여성 팔로워 비중이 가장 높아(약 26%), 라이프스타일·뷰티·웰니스 카테고리 광고 캠페인과의 적합도가 높습니다.`

/** 기간별 팔로워 추이 데이터 — null = 데이터 없음(연결 전 기간) */
type BarDataItem = { label: string; value: number | null; showLabel?: boolean }

const followerDataByPeriod: Record<Period, BarDataItem[]> = {
  일간: Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    const base = 24100
    const v = i < 5 ? null : Math.round(base + (i - 5) * 28 + (Math.sin(i * 0.8) * 80))
    return { label: `${day}일`, value: v, showLabel: day === 1 || day % 5 === 0 }
  }),
  주간: [
    { label: '1/2주', value: null,  showLabel: true },
    { label: '1/3주', value: null,  showLabel: true },
    { label: '1/4주', value: 20800, showLabel: true },
    { label: '2/1주', value: 21200, showLabel: true },
    { label: '2/2주', value: 21600, showLabel: true },
    { label: '2/3주', value: 22100, showLabel: true },
    { label: '2/4주', value: 22500, showLabel: true },
    { label: '3/1주', value: 22900, showLabel: true },
    { label: '3/2주', value: 23300, showLabel: true },
    { label: '3/3주', value: 23700, showLabel: true },
    { label: '3/4주', value: 24100, showLabel: true },
    { label: '이번주', value: 24800, showLabel: true },
  ],
  월간: [
    { label: '5월' , value: null  },
    { label: '6월' , value: null  },
    { label: '7월' , value: null  },
    { label: '8월' , value: null  },
    { label: '9월' , value: null  },
    { label: '10월', value: null  },
    { label: '11월', value: null  },
    { label: '12월', value: null  },
    { label: '1월' , value: 20200 },
    { label: '2월' , value: 21800 },
    { label: '3월' , value: 23100 },
    { label: '4월' , value: 24800 },
  ],
  연간: [
    { label: '2025',  value: 12400 },
    { label: "'26*",  value: 24800 },
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

/** 기간별 노출·도달 시계열 더미 데이터 */
type ImpressReachItem = { label: string; impressions: number | null; reach: number | null; showLabel?: boolean }

const impressReachByPeriod: Record<Period, ImpressReachItem[]> = {
  일간: Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    const hasData = i >= 5
    return {
      label: `${day}일`,
      impressions: hasData ? Math.round(800 + i * 45 + Math.sin(i * 0.8) * 200) : null,
      reach:       hasData ? Math.round(620 + i * 32 + Math.sin(i * 0.9) * 140) : null,
      showLabel: day === 1 || day % 5 === 0,
    }
  }),
  주간: [
    { label: '1/2주', impressions: null,   reach: null   },
    { label: '1/3주', impressions: null,   reach: null   },
    { label: '1/4주', impressions: 38200,  reach: 28400, showLabel: true },
    { label: '2/1주', impressions: 42800,  reach: 31200, showLabel: true },
    { label: '2/2주', impressions: 51600,  reach: 38800, showLabel: true },
    { label: '2/3주', impressions: 48200,  reach: 36200, showLabel: true },
    { label: '2/4주', impressions: 58400,  reach: 44200, showLabel: true },
    { label: '3/1주', impressions: 64200,  reach: 48800, showLabel: true },
    { label: '3/2주', impressions: 60400,  reach: 46200, showLabel: true },
    { label: '3/3주', impressions: 68800,  reach: 52400, showLabel: true },
    { label: '3/4주', impressions: 64200,  reach: 48800, showLabel: true },
    { label: '이번주', impressions: 72400, reach: 55600, showLabel: true },
  ],
  월간: [
    { label: '5월',  impressions: null,    reach: null   },
    { label: '6월',  impressions: null,    reach: null   },
    { label: '7월',  impressions: null,    reach: null   },
    { label: '8월',  impressions: null,    reach: null   },
    { label: '9월',  impressions: null,    reach: null   },
    { label: '10월', impressions: null,    reach: null   },
    { label: '11월', impressions: null,    reach: null   },
    { label: '12월', impressions: null,    reach: null   },
    { label: '1월',  impressions: 162000,  reach: 124000 },
    { label: '2월',  impressions: 198000,  reach: 152000 },
    { label: '3월',  impressions: 224000,  reach: 172000 },
    { label: '4월',  impressions: 256000,  reach: 198000 },
  ],
  연간: [
    { label: '2025', impressions: 1840000, reach: 1420000, showLabel: true },
    { label: "'26*", impressions: 820000,  reach: 634000,  showLabel: true },
  ],
}

/** 콘텐츠 유형별 성과 */
const contentTypeData = [
  { type: '릴스',     avgReach: 5200, avgLikes: 620, engagementRate: 4.8 },
  { type: '카드뉴스', avgReach: 3100, avgLikes: 380, engagementRate: 3.2 },
  { type: '일반 사진', avgReach: 2400, avgLikes: 290, engagementRate: 2.7 },
  { type: '스토리',   avgReach: 1800, avgLikes: 210, engagementRate: 3.2 },
]

// ── 개별 게시물 더미 데이터 ────────────────────────────────────────────────
type PostType = 'reels' | 'feed' | 'carousel' | 'story'
type PostSortKey = 'date' | 'views' | 'reach' | 'likes' | 'comments' | 'saves' | 'engagement'
type PostItem = {
  id: string; type: PostType; uploadDate: string
  views: number; reach: number; impressions: number
  likes: number; comments: number; saves: number
  engagementRate: number
  // reels 전용
  avgWatchTimeSec?: number; replays?: number
  // feed/carousel 전용
  profileVisits?: number; follows?: number
}
const POST_TYPES: PostType[] = [
  'reels','reels','reels','reels','reels','reels','reels','reels',
  'feed','feed','feed','feed','feed','feed','feed',
  'carousel','carousel','carousel','carousel','carousel',
  'story','story','story','story',
  'reels','feed','carousel','reels','story','feed',
]
const POST_DATA: PostItem[] = (() => {
  const today = new Date()
  return POST_TYPES.map((type, i) => {
    const d = new Date(today); d.setDate(today.getDate() - i * 3)
    const base = type === 'reels' ? 5200 + (i * 170) % 3000
      : type === 'carousel'       ? 3100 + (i * 120) % 1600
      : type === 'feed'           ? 2200 + (i * 90)  % 1200
      :                             900  + (i * 55)  % 500
    const reach      = Math.max(400, Math.floor(base + Math.sin(i * 0.9) * 350))
    const impressions = Math.floor(reach * (1.35 + (i % 5) * 0.07))
    const views      = type === 'reels' ? Math.floor(reach * (1.2 + (i % 4) * 0.12)) : 0
    const likes      = Math.floor(reach * (0.07 + (i % 6) * 0.004))
    const comments   = Math.floor(likes * (0.09 + (i % 5) * 0.011))
    const saves      = type === 'carousel'
      ? Math.floor(likes * 0.48)
      : Math.floor(likes * (0.22 + (i % 4) * 0.04))
    const engagementRate = +((likes + comments + saves) / Math.max(reach, 1) * 100).toFixed(1)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return {
      id: `post-${i + 1}`, type,
      uploadDate: `2026-${mm}-${dd}`,
      views, reach, impressions, likes, comments, saves, engagementRate,
      ...(type === 'reels' && {
        avgWatchTimeSec: 8 + (i % 6) * 3,
        replays: Math.floor(likes * 0.09),
      }),
      ...((type === 'feed' || type === 'carousel') && {
        profileVisits: Math.floor(reach * 0.042),
        follows: Math.floor(reach * 0.007),
      }),
    }
  })
})()

const metricColors = {
  likes:    'var(--color-brand-green)',
  reach:    'var(--color-chart-reach)',
  comments: 'var(--color-chart-comments)',
  saves:    'var(--color-chart-saves)',
}

type MetricKey = keyof typeof metricColors


/** 팔로워 추이 바 차트 — null = 회색 점선 바, 30개 이상은 라벨 간소화 */
function FollowerBarChart({
  data,
  activeIndex,
  onActiveIndex,
  isTouch,
}: {
  data: BarDataItem[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}) {
  const nonNullVals = data.filter(m => m.value !== null).map(m => m.value as number)
  const maxVal = Math.max(...nonNullVals, 1)
  const isDense = data.length > 14
  const BAR_AREA_PX = 112

  // 가로 스크롤 발생 최소 너비: 바당 최소 20px (일간 30개 = 600px → 모바일에서 스크롤)
  const barMinW = Math.max(240, data.length * 20)

  return (
    <div className="space-y-1" style={{ minWidth: barMinW }} role="img" aria-label="팔로워 추이 차트">
      {/* 선택된 막대 값 표시 */}
      <div className="h-5 mb-1">
        {activeIndex != null && data[activeIndex]?.value != null && (
          <span className="text-sm font-semibold text-brand-green-text">
            {fmtNumber(data[activeIndex].value as number)}
          </span>
        )}
      </div>
      <div className="flex items-end" style={{ height: BAR_AREA_PX, gap: isDense ? '2px' : '8px' }}>
        {data.map(({ label, value }, idx) => {
          const isNull = value === null
          const barH = isNull ? 8 : Math.max(4, Math.round((value / maxVal) * BAR_AREA_PX))
          const isActive = activeIndex === idx
          return (
            <div
              key={label}
              className="flex-1 flex flex-col items-center min-w-0 justify-end cursor-pointer"
              style={{ height: BAR_AREA_PX }}
              onMouseEnter={!isTouch && !isNull ? () => onActiveIndex?.(idx) : undefined}
              onMouseLeave={!isTouch ? () => onActiveIndex?.(null) : undefined}
              onClick={isTouch && !isNull ? () => onActiveIndex?.(idx) : undefined}
            >
              {!isDense && !isNull && !isActive && (
                <span className="text-sm mb-1 leading-none text-gray-500 font-medium">
                  {fmtNumber(value)}
                </span>
              )}
              <div
                className={`w-full rounded-t-sm transition-[height] duration-300 ${isNull ? 'bg-gray-100 border border-dashed border-gray-300' : isActive ? 'bg-brand-green' : 'bg-brand-green-border'}`}
                style={{ height: barH }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex" style={{ gap: isDense ? '2px' : '8px' }}>
        {data.map(({ label, value, showLabel }, idx) => {
          const isNull = value === null
          const doShow = isDense ? (showLabel ?? false) : true
          const isActive = activeIndex === idx
          return (
            <div key={label} className="flex-1 min-w-0 text-center" style={{ visibility: doShow ? 'visible' : 'hidden' }}>
              <span className={`text-xs truncate block ${isNull ? 'text-gray-300' : isActive ? 'text-brand-green-text font-medium' : 'text-gray-400'}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** 멀티라인 추세 SVG 차트 — null 구간은 점선 처리 */
function MultiLineTrendChart({
  data,
  activeMetrics,
  activeIndex,
  onActiveIndex,
  isTouch,
}: {
  data: TrendItem[]
  activeMetrics: MetricKey[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
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

  const handlePointerAt = (clientX: number, rect: DOMRect) => {
    const ratio = (clientX - rect.left) / rect.width
    const svgX = ratio * width
    const relX = svgX - padX
    const stepX = chartW / Math.max(1, data.length - 1)
    const idx = Math.round(relX / stepX)
    onActiveIndex?.(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const metricLabelMap: Record<MetricKey, string> = {
    likes: '좋아요',
    reach: '도달',
    comments: '댓글',
    saves: '저장',
  }

  const fmtVal = (v: number | null) => {
    if (v === null) return '—'
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    return String(v)
  }

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: Math.max(580, data.length * 44) }}
      role="img"
      aria-label="기간별 지표 추이 차트"
      onMouseMove={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onMouseLeave={!isTouch ? () => onActiveIndex?.(null) : undefined}
      onClick={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchStart={isTouch ? (e) => handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) } : undefined}
    >
      {/* 그리드 라인 */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padY + chartH - ratio * chartH
        return <line key={ratio} x1={padX} y1={y} x2={width - padX} y2={y} stroke={CHART_COLORS.grid} strokeWidth={1} />
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
              fill={CHART_COLORS.nullBg}
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
          <text x={cx} y={padY + chartH / 2 + 4} textAnchor="middle" fill={CHART_COLORS.nullText} fontSize="10">
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
        const doShow = data.length > 20
          ? i % 7 === 0
          : isDense
            ? (d.showLabel ?? false)
            : true
        if (!doShow) return null
        return (
          <text key={i} x={x} y={height - 4} textAnchor="middle" fill={isNull ? CHART_COLORS.nullText : CHART_COLORS.axisLabel} fontSize="10">
            {d.label}
          </text>
        )
      })}

      {/* 인터랙티브 crosshair — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const stepX = chartW / Math.max(1, data.length - 1)
        const x = padX + activeIndex * stepX
        return (
          <g key="active">
            <line x1={x} y1={padY} x2={x} y2={padY + chartH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
          </g>
        )
      })()}
    </svg>
  )
}

export default function ProfileInsight() {
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const isDesktop = useDeviceMode() === 'desktop'
  const isTouch = useIsTouchDevice()
  const [period, setPeriod] = useState<Period>('월간')
  const [dateOffset, setDateOffset] = useState(0)
  const [activeMetric, setActiveMetric] = useState<MetricKey>('likes')
  const [aiRefreshing, setAiRefreshing] = useState(false)
  const aiRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 차트 인터랙티브 인덱스 — 모바일/태블릿은 호버 불가능하므로 마지막 포인트를 기본 노출 (정책)
  const [followerChartIdx, setFollowerChartIdx] = useState<number | null>(null)
  const [trendChartIdx, setTrendChartIdx] = useState<number | null>(null)
  const [impReachChartIdx, setImpReachChartIdx] = useState<number | null>(null)

  // 차트 가로 스크롤 refs
  const followerChartScrollRef = useRef<ChartScrollContainerHandle>(null)
  const trendChartScrollRef    = useRef<ChartScrollContainerHandle>(null)
  const impReachChartScrollRef = useRef<ChartScrollContainerHandle>(null)

  // AI 분석 새로고침 — setTimeout cleanup
  const handleAiRefresh = useCallback(() => {
    if (aiRefreshing) return
    setAiRefreshing(true)
    aiRefreshTimerRef.current = setTimeout(() => setAiRefreshing(false), 1800)
  }, [aiRefreshing])

  useEffect(() => {
    return () => {
      if (aiRefreshTimerRef.current !== null) clearTimeout(aiRefreshTimerRef.current)
    }
  }, [])

  // period/isTouch 변경 시 인덱스·스크롤 초기화
  // 정책: PC = activeIndex=null + scrollToStart / 모바일·태블릿 = 마지막 포인트 기본 노출 + scrollToEnd
  useEffect(() => {
    if (isTouch) {
      // 데이터는 이 effect 내부에서 직접 계산 (period 변경 시 재계산)
      const followerLen  = followerDataByPeriod[period].length
      const trendLen     = trendDataByPeriod[period].length
      const impReachLen  = impressReachByPeriod[period].length
      setFollowerChartIdx(followerLen > 0 ? followerLen - 1 : null)
      setTrendChartIdx(trendLen > 0 ? trendLen - 1 : null)
      setImpReachChartIdx(impReachLen > 0 ? impReachLen - 1 : null)
      requestAnimationFrame(() => {
        followerChartScrollRef.current?.scrollToEnd()
        trendChartScrollRef.current?.scrollToEnd()
        impReachChartScrollRef.current?.scrollToEnd()
      })
    } else {
      setFollowerChartIdx(null)
      setTrendChartIdx(null)
      setImpReachChartIdx(null)
      requestAnimationFrame(() => {
        followerChartScrollRef.current?.scrollToStart()
        trendChartScrollRef.current?.scrollToStart()
        impReachChartScrollRef.current?.scrollToStart()
      })
    }
  }, [period, isTouch])

  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [canTableScrollLeft, setCanTableScrollLeft] = useState(false)
  const [canTableScrollRight, setCanTableScrollRight] = useState(false)
  const [tableBtnTop, setTableBtnTop] = useState<number | null>(null)

  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const update = () => {
      setCanTableScrollLeft(el.scrollLeft > 0)
      setCanTableScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const update = () => {
      const el = tableRef.current ?? tableWrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const visTop = Math.max(rect.top, 0)
      const visBottom = Math.min(rect.bottom, window.innerHeight)
      setTableBtnTop(visBottom > visTop + 40 ? (visTop + visBottom) / 2 : null)
    }
    const debouncedUpdate = () => {
      if (debounceTimer !== null) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(update, 150)
    }
    update()
    // Layout의 overflow-y-auto div이 실제 스크롤 컨테이너 — window.scroll은 발생하지 않음
    const scrollTarget: EventTarget = ((): EventTarget => {
      let p = tableRef.current?.parentElement
      while (p) {
        const ov = getComputedStyle(p).overflowY
        if (ov === 'auto' || ov === 'scroll') return p
        p = p.parentElement
      }
      return window
    })()
    scrollTarget.addEventListener('scroll', update, { passive: true } as AddEventListenerOptions)
    window.addEventListener('resize', debouncedUpdate)
    const ro = new ResizeObserver(debouncedUpdate)
    if (tableRef.current) ro.observe(tableRef.current)
    return () => {
      scrollTarget.removeEventListener('scroll', update)
      window.removeEventListener('resize', debouncedUpdate)
      ro.disconnect()
      if (debounceTimer !== null) clearTimeout(debounceTimer)
    }
  }, [])

  const headerRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const metricLabels: Record<MetricKey, string> = {
    likes: '좋아요',
    reach: '도달',
    comments: '댓글',
    saves: '저장',
  }

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-4 w-56 bg-gray-100 animate-pulse rounded-xl" />
          </div>
          <div className="h-9 w-36 bg-gray-100 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} height={128} />)}
        </div>
        <SkeletonCard height={256} />
        <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-3 @sm:gap-5">
          <SkeletonCard height={192} />
          <SkeletonCard height={192} />
        </div>
      </div>
    )
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900">프로필 인사이트</h1>
          <p className="text-base text-gray-500 mt-0.5">브랜드 프로필의 콘텐츠 성과 및 팔로워 현황</p>
        </div>
        <InstagramConnectPrompt featureName="프로필 인사이트" />
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="프로필 인사이트를 불러올 수 없습니다" subMessage="네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." onRetry={() => window.location.reload()} />
  }

  /* ── QA: 빈 상태 — 공통 EmptyState ── */
  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full max-w-sm">
          <EmptyState
            size="lg"
            icon={<BarChart2 size={40} />}
            title="분석 데이터가 없습니다"
            description="인스타그램 계정을 연결하면 자동으로 수집됩니다"
          />
        </div>
      </div>
    )
  }

  const kpi = kpiByPeriod[period]

  // 앞뒤 null 항목 제거 — 데이터 없는 구간이 차트 너비를 잠식하지 않도록
  const followerData  = trimEdgeNulls(followerDataByPeriod[period],  d => d.value === null)
  const trendData     = trimEdgeNulls(trendDataByPeriod[period],     d => d.likes === null)
  const impressReachData = trimEdgeNulls(impressReachByPeriod[period], d => d.impressions === null)

  const nullCount = followerData.filter(d => d.value === null).length
  const growthLabel = { 일간: '+0.3% 전일 대비', 주간: '+1.2% 전주 대비', 월간: '+22.8% 연초 대비', 연간: '+22.8% 전년 대비' }[period]

  const periodLabel = (() => {
    const today = new Date()
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
    if (period === '일간') return fmt(today)
    if (period === '주간') { const s = new Date(today); s.setDate(today.getDate() - 6); return `${fmt(s)}~${fmt(today)}` }
    if (period === '월간') { const s = new Date(today); s.setDate(today.getDate() - 29); return `${fmt(s)}~${fmt(today)}` }
    return `${today.getFullYear() - 1}~${today.getFullYear()}`
  })()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div ref={headerRef}>
        <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900">프로필 인사이트</h1>
        <p className="text-base text-gray-500 mt-0.5">브랜드 프로필의 콘텐츠 성과 및 팔로워 현황</p>
      </div>

      {/* 기간 선택기 — sticky: 데스크톱은 상단 GNB 없으므로 top-0, 모바일/태블릿은 h-12 GNB 아래 top-12 */}
      <div className={`sticky z-20 !mt-2 -mx-4 px-4 @sm:-mx-6 @sm:px-6 @lg:-mx-8 @lg:px-8 py-2.5 transition-colors ${isStuck ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' : 'border-b border-transparent'} ${isDesktop ? 'top-0' : 'top-12'}`}>
        <DateRangePicker
          period={period}
          dateOffset={dateOffset}
          onPeriodChange={setPeriod}
          onDateOffsetChange={setDateOffset}
          compact={!isDesktop}
        />
      </div>

      {/* AI 프로필 분석 카드 — 원본 AIAnalysisCard 보강 (상단) */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-gray-900">AI 프로필 분석</h2>
          </div>
          <button type="button"
            onClick={handleAiRefresh}
            disabled={aiRefreshing}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/50"
          >
            {aiRefreshing ? (
              <>
                <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                분석 중…
              </>
            ) : (
              <>
                <Sparkles size={12} aria-hidden="true" />
                다시 분석
              </>
            )}
          </button>
        </div>
        {aiRefreshing ? (
          <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="AI 분석 진행 중">
            <div className="h-3 w-3/4 bg-purple-200/50 rounded-xl" />
            <div className="h-3 w-full bg-purple-200/50 rounded-xl" />
            <div className="h-3 w-5/6 bg-purple-200/50 rounded-xl" />
            <div className="h-3 w-2/3 bg-purple-200/50 rounded-xl" />
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{PROFILE_AI_SUMMARY}</p>
        )}
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="팔로워 수"
          value={fmtNumber(kpi.followers)}
          sub="@wellink_brand"
          trend={kpi.trends[0]}
          trendLabel="전기간 대비"
          icon={<Users size={16} aria-hidden="true" />}
          tooltip="현재 브랜드 계정을 팔로우하는 총 사용자 수"
        />
        <KPICard
          title="평균 도달률"
          value={`${kpi.reach}%`}
          sub="게시물 기준"
          trend={kpi.trends[1]}
          trendLabel="전기간 대비"
          icon={<Eye size={16} aria-hidden="true" />}
          tooltip="게시물 1개당 팔로워 대비 도달한 비율 평균"
        />
        <KPICard
          title="참여율"
          value={`${kpi.engagement}%`}
          sub="좋아요+댓글 기준"
          trend={kpi.trends[2]}
          trendLabel="전기간 대비"
          valueColor={getEngagementColor(kpi.engagement)}
          icon={<TrendingUp size={16} aria-hidden="true" />}
          tooltip="(좋아요+댓글) / 도달 수 x 100으로 산출"
        />
        <KPICard
          title="노출 수"
          value={fmtNumber(kpi.impressions)}
          sub={period === '일간' ? '당일 누적' : period === '주간' ? '주간 누적' : period === '월간' ? '월간 누적' : '연간 누적'}
          trend={kpi.trends[3]}
          trendLabel="전기간 대비"
          icon={<BarChart2 size={16} aria-hidden="true" />}
          tooltip="콘텐츠가 화면에 노출된 총 횟수 (중복 포함)"
        />
      </div>

      {/* 전환 KPI 3개 — 원본 buildProfileConversionMetrics 보강 */}
      {(() => {
        const conv = conversionByPeriod[period]
        const ctr = conv.profileViews > 0 ? +((conv.websiteClicks / conv.profileViews) * 100).toFixed(1) : 0
        return (
          <div className="grid grid-cols-1 @lg:grid-cols-3 gap-3 @sm:gap-4">
            <KPICard
              title="프로필 방문"
              value={fmtNumber(conv.profileViews)}
              sub="계정 관심도"
              trend={conv.profileViewsGrowth}
              trendLabel="전기간 대비"
              icon={<Users size={16} aria-hidden="true" />}
              tooltip="콘텐츠/계정을 본 사용자가 프로필 페이지로 이동한 횟수"
            />
            <KPICard
              title="웹사이트 클릭"
              value={fmtNumber(conv.websiteClicks)}
              sub="외부 유입"
              trend={conv.websiteClicksGrowth}
              trendLabel="전기간 대비"
              icon={<TrendingUp size={16} aria-hidden="true" />}
              tooltip="프로필에 연결된 웹사이트 링크를 누른 횟수"
            />
            <KPICard
              title="클릭률"
              value={`${ctr}%`}
              sub="전환율"
              trend={conv.ctrGrowth}
              trendLabel="전기간 대비"
              icon={<BarChart2 size={16} aria-hidden="true" />}
              tooltip="웹사이트 클릭 ÷ 프로필 방문 × 100 — 전환 유도 효율"
            />
          </div>
        )
      })()}

      {/* 피드별 성과 추세 + 노출&도달 — 960px+ 부터 1:1 2열 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        {/* 피드별 추세선 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">피드별 성과 추세</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {period === '일간' ? '최근 30일' : period === '주간' ? '최근 12주' : period === '월간' ? '최근 12개월' : '연도별'} · 위 기간 선택기로 변경
                {nullCount > 0 && <span className="ml-1.5 text-gray-300">· 회색 구간은 데이터 없음</span>}
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(metricColors) as MetricKey[]).map(metric => (
                <button type="button"
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                    activeMetric === metric
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'
                  }`}
                  style={activeMetric === metric ? { backgroundColor: metricColors[metric] } : {}}
                >
                  {metric === 'likes'    && <Heart size={10} aria-hidden="true" />}
                  {metric === 'reach'    && <Eye size={10} aria-hidden="true" />}
                  {metric === 'comments' && <MessageCircle size={10} aria-hidden="true" />}
                  {metric === 'saves'    && <Bookmark size={10} aria-hidden="true" />}
                  {metricLabels[metric]}
                </button>
              ))}
            </div>
          </div>
          <ChartScrollContainer
            ref={trendChartScrollRef}
            chartW={580} padL={48} padR={48}
            dataLength={trendData.length}
            activeIndex={trendChartIdx}
            tooltipContent={(i) => {
              const d = trendData[i]
              if (!d) return null
              const fmtV = (v: number | null) => v === null ? '—' : v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)
              return (
                <>
                  <p className="text-xs text-gray-400 mb-1.5 whitespace-nowrap">{d.label}</p>
                  {activeMetric !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: metricColors[activeMetric] }} />
                      <span className="text-xs text-gray-700 whitespace-nowrap font-medium">
                        {metricLabels[activeMetric]}: {fmtV(d[activeMetric])}
                      </span>
                    </div>
                  )}
                </>
              )
            }}
          >
            <MultiLineTrendChart
              data={trendData}
              activeMetrics={[activeMetric]}
              activeIndex={trendChartIdx}
              onActiveIndex={setTrendChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
        </div>

        {/* 노출 & 도달 라인 차트 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">노출 & 도달</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                노출(총 표시 횟수) vs 도달(순 사용자 수) · {period === '일간' ? '최근 30일' : period === '주간' ? '최근 12주' : period === '월간' ? '최근 12개월' : '연도별'}
                {impressReachByPeriod[period].some(d => d.impressions === null) && (
                  <span className="ml-1.5 text-gray-300">· 일부 구간 데이터 없음</span>
                )}
              </p>
            </div>
            <div className="flex gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded" />노출</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-green inline-block rounded" />도달</span>
            </div>
          </div>
          <ChartScrollContainer
            ref={impReachChartScrollRef}
            chartW={580} padL={52} padR={12}
            dataLength={impressReachData.length}
            activeIndex={impReachChartIdx}
            tooltipContent={(i) => {
              const d = impressReachData[i]
              if (!d) return null
              const fmtV = (v: number | null) => v === null ? '—' : v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)
              return (
                <>
                  <p className="text-xs text-gray-400 mb-1.5 whitespace-nowrap">{d.label}</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-violet-500" />
                    <span className="text-xs text-gray-700 whitespace-nowrap font-medium">노출: {fmtV(d.impressions)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
                    <span className="text-xs text-gray-700 whitespace-nowrap font-medium">도달: {fmtV(d.reach)}</span>
                  </div>
                </>
              )
            }}
          >
            <ImpressReachChart
              data={impressReachData}
              activeIndex={impReachChartIdx}
              onActiveIndex={setImpReachChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
        </div>
      </div>

      {/* 콘텐츠 유형별 성과 + 팔로워 추이 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-3 @sm:gap-5">
        {/* 콘텐츠 유형별 성과 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">콘텐츠 유형별 성과</h2>
          {/* 헤더 행 */}
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xs text-gray-400 w-16 shrink-0">유형</span>
            <div className="flex-1" />
            <span className="text-xs text-gray-400 w-14 text-right">평균 도달</span>
            <span className="text-xs text-gray-400 w-10 text-right">참여율</span>
          </div>
          <div className="space-y-3">
            {contentTypeData.map(ct => (
              <div key={ct.type} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 font-medium w-16 shrink-0">{ct.type}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${(ct.avgReach / 5200) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-14 text-right tabular-nums">{fmtNumber(ct.avgReach)}</span>
                <span className={`text-sm font-semibold w-10 text-right ${ct.engagementRate >= ENGAGEMENT_THRESHOLD.high ? 'text-brand-green-text' : ct.engagementRate >= 2.5 ? 'text-gray-700' : 'text-red-500'}`}>
                  {ct.engagementRate}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            <span className="text-brand-green-text font-medium">초록색</span>은 높은 참여율,{' '}
            <span className="text-red-500 font-medium">빨간색</span>은 개선 필요 지표
          </p>
        </div>

        {/* 팔로워 추이 (2/5) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">팔로워 추이</h2>
            <p className="text-sm text-brand-green-text font-medium mt-0.5">{growthLabel}</p>
          </div>
          <ChartScrollContainer
            ref={followerChartScrollRef}
            chartW={400} padL={0} padR={0}
            dataLength={followerData.length}
            activeIndex={followerChartIdx}
          >
            <FollowerBarChart
              data={followerData}
              activeIndex={followerChartIdx}
              onActiveIndex={setFollowerChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
          {nullCount > 0 && (
            <p className="text-sm text-gray-300 mt-2">
              회색 점선 바: 해당 기간 데이터 없음
            </p>
          )}
          {period === '연간' && (
            <p className="text-sm text-gray-400 mt-2">
              * 2026년은 1~4월 기준
            </p>
          )}
        </div>
      </div>

      {/* 최근 게시물 상세 */}
      {tableBtnTop !== null && canTableScrollLeft && (
        <button type="button" onClick={() => tableScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })} aria-label="왼쪽으로 스크롤"
          style={{ top: tableBtnTop }}
          className="fixed left-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
          <ChevronLeft size={15} aria-hidden="true" />
        </button>
      )}
      {tableBtnTop !== null && canTableScrollRight && (
        <button type="button" onClick={() => tableScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })} aria-label="오른쪽으로 스크롤"
          style={{ top: tableBtnTop }}
          className="fixed right-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      )}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {period === '일간' ? '일별' : period === '주간' ? '주별' : period === '월간' ? '월별' : '연도별'} 게시물 성과
        </h2>
        <div className="relative" ref={tableWrapperRef}>
          {canTableScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
          {canTableScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
          <div className="overflow-x-auto scrollbar-none" ref={tableScrollRef}>
            <table className="w-full text-base" ref={tableRef}>
              <thead>
                <tr className="border-b border-gray-100">
                  <th scope="col" className="text-left text-sm font-medium text-gray-400 pb-3 pr-4 whitespace-nowrap">기간</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">도달</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">좋아요</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">댓글</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">저장</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 whitespace-nowrap">참여율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...trendData].reverse().map((d, i) => {
                  const isNull = d.reach === null
                  return (
                    <tr key={i} className={`transition-colors ${isNull ? '' : 'hover:bg-gray-50'}`}>
                      <td className={`py-2.5 pr-4 text-sm whitespace-nowrap ${isNull ? 'text-gray-300' : 'text-gray-500'}`}>{d.label}</td>
                      {isNull ? (
                        <td colSpan={5} className="py-2.5 text-center text-sm text-gray-300 whitespace-nowrap">데이터 없음</td>
                      ) : (
                        <>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.reach as number)}</td>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.likes as number)}</td>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.comments as number)}</td>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.saves as number)}</td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            {(() => {
                              const engRate = (((d.likes as number) + (d.comments as number) + (d.saves as number)) / (d.reach as number) * 100).toFixed(1)
                              const isGood = parseFloat(engRate) >= ENGAGEMENT_THRESHOLD.high
                              const isBad  = parseFloat(engRate) < 2.5
                              return (
                                <span className={`text-sm font-semibold ${isGood ? 'text-brand-green-text' : isBad ? 'text-red-500' : 'text-gray-700'}`}>
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

      {/* 팔로워 인구통계 분석 — 원본 followersAudience 보강 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-900">팔로워 분석</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{periodLabel}</span>
            <span className="text-sm text-gray-400">비공개 계정 제외</span>
          </div>
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-6">
          {/* 성별 */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">성별</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">남성</span>
                  <span className="text-gray-900 font-bold">{FOLLOWER_DEMOGRAPHIC.gender.malePercent}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-700 rounded-full" style={{ width: `${FOLLOWER_DEMOGRAPHIC.gender.malePercent}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">여성</span>
                  <span className="text-gray-900 font-bold">{FOLLOWER_DEMOGRAPHIC.gender.femalePercent}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-green rounded-full" style={{ width: `${FOLLOWER_DEMOGRAPHIC.gender.femalePercent}%` }} />
                </div>
              </div>
            </div>
          </div>
          {/* 연령대 */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">연령대</p>
            <div className="space-y-2.5">
              {FOLLOWER_DEMOGRAPHIC.age.map((a, i) => (
                <div key={a.range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{a.range}세</span>
                    <span className="text-gray-900 font-bold">{a.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        i === 1 ? 'bg-gray-900' : i === 2 ? 'bg-gray-700' : i === 0 ? 'bg-gray-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${a.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 게시물별 상세 성과 — 기존 서비스 ContentPerformance 동등 */}
      <PostContentTable />
    </div>
  )
}

/** 노출 & 도달 듀얼 라인 차트 — null 구간 점선 배경 처리 */
function ImpressReachChart({
  data,
  activeIndex,
  onActiveIndex,
  isTouch,
}: {
  data: ImpressReachItem[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}) {
  const W = 580, H = 200, padL = 52, padR = 12, padT = 12, padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const allImpress = data.map(d => d.impressions).filter((v): v is number => v !== null)
  const allReach   = data.map(d => d.reach).filter((v): v is number => v !== null)
  const maxVal = Math.max(1, ...allImpress, ...allReach)

  const stepX = plotW / Math.max(data.length - 1, 1)
  const isDense = data.length > 14

  const toY = (v: number) => padT + plotH - (v / maxVal) * plotH

  const handlePointerAt = (clientX: number, rect: DOMRect) => {
    const ratio = (clientX - rect.left) / rect.width
    const svgX = ratio * W - padL
    const idx = Math.round(svgX / stepX)
    onActiveIndex?.(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const fmtAxis = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)

  const buildSegments = (key: 'impressions' | 'reach') => {
    const segs: { x: number; y: number }[][] = []
    let cur: { x: number; y: number }[] = []
    data.forEach((d, i) => {
      const v = d[key]
      if (v !== null) {
        cur.push({ x: padL + i * stepX, y: toY(v) })
      } else {
        if (cur.length) { segs.push(cur); cur = [] }
      }
    })
    if (cur.length) segs.push(cur)
    return segs
  }

  const impressSegs = buildSegments('impressions')
  const reachSegs   = buildSegments('reach')

  const nullGroups: number[][] = []
  data.forEach((d, i) => {
    if (d.impressions === null) {
      if (!nullGroups.length || i !== nullGroups[nullGroups.length - 1][nullGroups[nullGroups.length - 1].length - 1] + 1) {
        nullGroups.push([i])
      } else {
        nullGroups[nullGroups.length - 1].push(i)
      }
    }
  })

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="overflow-visible"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: Math.max(W, data.length * 44) }}
      role="img"
      aria-label="노출 및 도달 추이 차트"
      onMouseMove={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onMouseLeave={!isTouch ? () => onActiveIndex?.(null) : undefined}
      onClick={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchStart={isTouch ? (e) => handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) } : undefined}
    >
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}
      {[0, 0.5, 1].map(r => (
        <text key={r} x={padL - 6} y={padT + plotH - r * plotH + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
          {fmtAxis(Math.round(r * maxVal))}
        </text>
      ))}
      {nullGroups.map((group, gi) => {
        const xS = padL + group[0] * stepX - (group[0] === 0 ? 0 : stepX / 2)
        const xE = padL + group[group.length - 1] * stepX + (group[group.length - 1] === data.length - 1 ? 0 : stepX / 2)
        return <rect key={gi} x={xS} y={padT} width={Math.max(0, xE - xS)} height={plotH} fill="#f9fafb" rx={3} />
      })}
      {nullGroups.length > 0 && (() => {
        const firstEnd = data.findIndex(d => d.impressions !== null) - 1
        if (firstEnd < 0) return null
        const cx = padL + (firstEnd / 2) * stepX
        return <text x={cx} y={padT + plotH / 2 + 4} textAnchor="middle" fill="#d1d5db" fontSize={10}>데이터 없음</text>
      })()}
      {impressSegs.map((seg, si) => (
        <g key={`i-${si}`}>
          <path d={seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            fill="none" stroke="#8b5cf6" strokeWidth={isDense ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
          {seg.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={isDense ? 2 : 3} fill="#8b5cf6" />
              <circle cx={p.x} cy={p.y} r={isDense ? 0.8 : 1.2} fill="white" />
            </g>
          ))}
        </g>
      ))}
      {reachSegs.map((seg, si) => (
        <g key={`r-${si}`}>
          <path d={seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            fill="none" stroke="#10b981" strokeWidth={isDense ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
          {seg.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={isDense ? 2 : 3} fill="#10b981" />
              <circle cx={p.x} cy={p.y} r={isDense ? 0.8 : 1.2} fill="white" />
            </g>
          ))}
        </g>
      ))}
      {data.map((d, i) => {
        const x = padL + i * stepX
        const show = isDense ? (d.showLabel ?? false) : true
        if (!show) return null
        return (
          <text key={i} x={x} y={H - 4} textAnchor="middle" fill={d.impressions === null ? '#d1d5db' : '#6b7280'} fontSize={9}>
            {d.label}
          </text>
        )
      })}

      {/* 인터랙티브 crosshair + 활성 도트 — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const x = padL + activeIndex * stepX
        const impY = d.impressions !== null ? toY(d.impressions) : null
        const reachY = d.reach !== null ? toY(d.reach) : null
        return (
          <g key="active">
            <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            {impY !== null && <circle cx={x} cy={impY} r={3.5} fill="#8b5cf6" stroke="white" strokeWidth={1.5} />}
            {reachY !== null && <circle cx={x} cy={reachY} r={3.5} fill="#10b981" stroke="white" strokeWidth={1.5} />}
          </g>
        )
      })()}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 게시물 상세 모달 — @wellink/ui Modal 사용
// 유형별(릴스/피드·카루셀/스토리)로 다른 인사이트 섹션 제공
// ─────────────────────────────────────────────────────────────────────────────
function MetricCell({ label, value, color = 'bg-gray-50' }: { label: string; value: string; color?: string }) {
  return (
    <div className={`${color} rounded-xl p-3`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  )
}

function PostDetailModal({ post, onClose }: { post: PostItem | null; onClose: () => void }) {
  const TYPE_LABEL: Record<PostType, string> = { reels: 'Reels', feed: 'Feed', carousel: 'Carousel', story: 'Story' }
  const TYPE_COLOR: Record<PostType, string> = {
    reels:    'bg-rose-50 text-rose-600',
    carousel: 'bg-blue-50 text-blue-600',
    story:    'bg-amber-50 text-amber-600',
    feed:     'bg-gray-100 text-gray-600',
  }
  const fmtSec = (s: number) => s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`
  const fmtTotalWatch = (avgSec: number, plays: number) => {
    const totalMin = Math.floor(avgSec * plays / 60)
    if (totalMin >= 60) return `${Math.floor(totalMin / 60)}시간 ${totalMin % 60}분`
    return `${totalMin}분`
  }

  return (
    <Modal
      open={post !== null}
      onClose={onClose}
      size="md"
      label="게시물 상세 성과"
      title={post ? `${TYPE_LABEL[post.type]} · ${post.uploadDate}` : undefined}
    >
      {post && (
        <div className="space-y-5">
          {/* 타입 배지 */}
          <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLOR[post.type]}`}>
            {TYPE_LABEL[post.type]}
          </span>
          {/* 참여율 하이라이트 */}
          <div className="bg-brand-green-bg rounded-xl p-4 flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-0.5">참여율</p>
              <p className="text-3xl font-bold text-brand-green-text">{post.engagementRate}%</p>
            </div>
            <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full"
                style={{ width: `${Math.min(100, post.engagementRate * 10)}%` }} />
            </div>
          </div>
          {/* 핵심 지표 */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">핵심 지표</h2>
            <div className="grid grid-cols-3 gap-2">
              <MetricCell label="좋아요"  value={fmtNumber(post.likes)} />
              <MetricCell label="댓글"    value={fmtNumber(post.comments)} />
              <MetricCell label="저장"    value={fmtNumber(post.saves)} />
              <MetricCell label="도달"    value={fmtNumber(post.reach)} />
              <MetricCell label="노출"    value={fmtNumber(post.impressions)} />
              <MetricCell label="총 참여" value={fmtNumber(post.likes + post.comments + post.saves)} />
            </div>
          </div>
          {/* 릴스 전용 */}
          {post.type === 'reels' && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">릴스 인사이트</h2>
              <div className="grid grid-cols-2 gap-2">
                <MetricCell label="조회수"       value={fmtNumber(post.views)}                                                                          color="bg-rose-50" />
                <MetricCell label="다시 보기"    value={fmtNumber(post.replays ?? 0)}                                                                   color="bg-rose-50" />
                <MetricCell label="평균 시청"    value={post.avgWatchTimeSec ? fmtSec(post.avgWatchTimeSec) : '—'}                                      color="bg-rose-50" />
                <MetricCell label="총 시청 시간" value={post.avgWatchTimeSec && post.views > 0 ? fmtTotalWatch(post.avgWatchTimeSec, post.views) : '—'} color="bg-rose-50" />
              </div>
            </div>
          )}
          {/* 피드·카루셀 전용 */}
          {(post.type === 'feed' || post.type === 'carousel') && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">피드 인사이트</h2>
              <div className="grid grid-cols-2 gap-2">
                <MetricCell label="프로필 방문" value={fmtNumber(post.profileVisits ?? 0)} color="bg-blue-50" />
                <MetricCell label="팔로우"       value={fmtNumber(post.follows ?? 0)}       color="bg-blue-50" />
              </div>
            </div>
          )}
          {/* 스토리 전용 */}
          {post.type === 'story' && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">스토리 인사이트</h2>
              <div className="grid grid-cols-2 gap-2">
                <MetricCell label="도달" value={fmtNumber(post.reach)}       color="bg-amber-50" />
                <MetricCell label="노출" value={fmtNumber(post.impressions)} color="bg-amber-50" />
              </div>
              <p className="text-xs text-gray-400 mt-3">* 내비게이션·이탈·답장은 Instagram API 연동 후 제공됩니다.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function SortBtn({ k, label, sortKey, sortDir, onSort }: {
  k: PostSortKey; label: string
  sortKey: PostSortKey; sortDir: 'asc' | 'desc'
  onSort: (k: PostSortKey) => void
}) {
  const ariaSortValue = sortKey === k ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'
  return (
    <th scope="col"
      tabIndex={0}
      aria-sort={ariaSortValue}
      className="text-left text-sm font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/50"
      onClick={() => onSort(k)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(k) } }}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={sortKey === k ? 'text-gray-700' : 'text-gray-300'} aria-hidden="true">
          {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
        </span>
      </span>
    </th>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 게시물별 성과 테이블 — 기존 서비스 ContentPerformance 동등
// 유형 탭 필터 + 컬럼 정렬 + 페이지네이션 + 클릭→상세 모달
// ─────────────────────────────────────────────────────────────────────────────
function PostContentTable() {
  const [activeType, setActiveType] = useState<'all' | PostType>('all')
  const [sortKey, setSortKey]       = useState<PostSortKey>('date')
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc')
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState<PostItem | null>(null)
  const PAGE_SIZE = 10

  const postScrollRef = useRef<HTMLDivElement>(null)
  const [postCanScrollLeft,  setPostCanScrollLeft]  = useState(false)
  const [postCanScrollRight, setPostCanScrollRight] = useState(false)
  useEffect(() => {
    const el = postScrollRef.current
    if (!el) return
    const update = () => {
      setPostCanScrollLeft(el.scrollLeft > 0)
      setPostCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  const filtered = activeType === 'all' ? POST_DATA : POST_DATA.filter(p => p.type === activeType)
  const sorted = [...filtered].sort((a, b) => {
    const val = (item: PostItem): number => {
      switch (sortKey) {
        case 'date':       return new Date(item.uploadDate).getTime()
        case 'views':      return item.views
        case 'reach':      return item.reach
        case 'likes':      return item.likes
        case 'comments':   return item.comments
        case 'saves':      return item.saves
        case 'engagement': return item.engagementRate
        default:           return 0
      }
    }
    return sortDir === 'desc' ? val(b) - val(a) : val(a) - val(b)
  })

  const safePage = Math.min(page, Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)))
  const paged    = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSort = (key: PostSortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const TYPE_TABS: { value: 'all' | PostType; label: string }[] = [
    { value: 'all',      label: '전체' },
    { value: 'reels',    label: 'Reels' },
    { value: 'feed',     label: 'Feed' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'story',    label: 'Story' },
  ]
  const TYPE_COLOR: Record<PostType, string> = {
    reels:    'bg-rose-50 text-rose-600',
    carousel: 'bg-blue-50 text-blue-600',
    story:    'bg-amber-50 text-amber-600',
    feed:     'bg-gray-100 text-gray-600',
  }
  const TYPE_ICON: Record<PostType, React.ReactNode> = {
    reels:    <Play      size={10} className="inline mr-0.5" />,
    carousel: <Layers    size={10} className="inline mr-0.5" />,
    story:    <ImageIcon size={10} className="inline mr-0.5" />,
    feed:     <ImageIcon size={10} className="inline mr-0.5" />,
  }

  return (
    <>
      <PostDetailModal post={selected} onClose={() => setSelected(null)} />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">게시물별 상세 성과</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              최근 {POST_DATA.length}개 게시물 · 행을 클릭하면 유형별 상세 분석 확인
            </p>
          </div>
        </div>
        {/* 유형 탭 필터 */}
        <div className="flex gap-1.5 px-5 py-3 border-b border-gray-50 flex-wrap">
          {TYPE_TABS.map(tab => (
            <button type="button" key={tab.value}
              onClick={() => { setActiveType(tab.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                activeType === tab.value
                  ? 'bg-brand-green-bg text-brand-green-text'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1 text-xs opacity-60">
                  {POST_DATA.filter(p => p.type === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* 테이블 */}
        <div className="relative">
          {postCanScrollLeft  && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
          {postCanScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
          {postCanScrollLeft && (
            <button type="button" onClick={() => postScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
              aria-label="왼쪽으로 스크롤"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronLeft size={13} aria-hidden="true" />
            </button>
          )}
          {postCanScrollRight && (
            <button type="button" onClick={() => postScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
              aria-label="오른쪽으로 스크롤"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronRight size={13} aria-hidden="true" />
            </button>
          )}
          <div className="overflow-x-auto scrollbar-none" ref={postScrollRef}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th scope="col" className="text-left text-sm font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap">유형</th>
                <SortBtn k="date"       label="날짜"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="views"      label="조회수"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="reach"      label="도달"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="likes"      label="좋아요"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="comments"   label="댓글"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="saves"      label="저장"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="engagement" label="참여율"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(p)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(p) } }}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLOR[p.type]}`}>
                      {TYPE_ICON[p.type]}
                      {p.type.charAt(0).toUpperCase() + p.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap tabular-nums">{p.uploadDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap tabular-nums">
                    {p.views > 0 ? fmtNumber(p.views) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.reach)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.likes)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.comments)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.saves)}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`text-sm font-bold tabular-nums ${
                      p.engagementRate >= ENGAGEMENT_THRESHOLD.high ? 'text-brand-green-text'
                      : p.engagementRate < 2.5 ? 'text-red-500'
                      : 'text-gray-700'
                    }`}>
                      {p.engagementRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">게시물이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        <Pagination total={sorted.length} page={safePage} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </>
  )
}
