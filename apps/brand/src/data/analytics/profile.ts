/**
 * 광고주 — 프로필 인사이트 (`/analytics/profile`) 데이터·타입 단일 출처
 *
 * 분할 이전: `apps/brand/src/pages/ProfileInsight.tsx` 내 인라인 1,640줄.
 * 분할 후 컴포넌트(charts·PostContentTable) + 데이터를 분리해 유지보수 비용 최소화.
 *
 * 실 API 연동 시 본 모듈의 const 자리를 fetch 결과로 대체.
 */

import type { DatePeriod } from '@wellink/ui'

// ── 배열 유틸 ────────────────────────────────────────────────────────────────
/** 앞뒤 null 항목 제거 — 데이터 없는 구간이 차트 너비를 잠식하지 않도록 */
export function trimEdgeNulls<T>(arr: T[], isNull: (item: T) => boolean): T[] {
  const first = arr.findIndex(item => !isNull(item))
  if (first === -1) return arr
  const last = arr.length - 1 - [...arr].reverse().findIndex(item => !isNull(item))
  return arr.slice(first, last + 1)
}

// ── 기간별 KPI ──────────────────────────────────────────────────────────────
/** trends는 KPI별 명명된 object (이전 tuple 인덱스 접근 → 가독성 ↑) */
export type ProfileKpiTrend = { followers: number; reach: number; engagement: number; impressions: number }
export const kpiByPeriod: Record<DatePeriod, { followers: number; reach: number; engagement: number; impressions: number; trends: ProfileKpiTrend }> = {
  일간: { followers: 24800, reach: 9.8,  engagement: 4.2, impressions: 31200,   trends: { followers: 0.1,  reach: 0.8, engagement:  0.5, impressions: 2.1  } },
  주간: { followers: 24650, reach: 11.2, engagement: 3.9, impressions: 198000,  trends: { followers: 1.2,  reach: 1.5, engagement: -0.1, impressions: 4.8  } },
  월간: { followers: 23900, reach: 12.4, engagement: 3.7, impressions: 820000,  trends: { followers: 5.2,  reach: 1.8, engagement: -0.3, impressions: 8.6  } },
  연간: { followers: 18200, reach: 13.1, engagement: 3.5, impressions: 9200000, trends: { followers: 22.8, reach: 3.1, engagement: -0.8, impressions: 18.4 } },
}

// ── 전환 KPI — 원본 buildProfileConversionMetrics 동등 ──────────────────────
export const conversionByPeriod: Record<DatePeriod, { profileViews: number; websiteClicks: number; profileViewsGrowth: number; websiteClicksGrowth: number; ctrGrowth: number }> = {
  일간: { profileViews: 480,    websiteClicks: 92,    profileViewsGrowth: 4.1, websiteClicksGrowth: 6.2,  ctrGrowth: 2.0 },
  주간: { profileViews: 3200,   websiteClicks: 612,   profileViewsGrowth: 8.5, websiteClicksGrowth: 9.8,  ctrGrowth: 1.2 },
  월간: { profileViews: 12400,  websiteClicks: 2380,  profileViewsGrowth: 14.6, websiteClicksGrowth: 18.2, ctrGrowth: 3.1 },
  연간: { profileViews: 142000, websiteClicks: 26800, profileViewsGrowth: 32.4, websiteClicksGrowth: 41.5, ctrGrowth: 6.9 },
}

// ── 팔로워 인구통계 — 원본 followersAudience 동등 ───────────────────────────
export const FOLLOWER_DEMOGRAPHIC = {
  gender: { malePercent: 38, femalePercent: 62 },
  age: [
    { range: '18-24', percent: 18 },
    { range: '25-34', percent: 42 },
    { range: '35-44', percent: 24 },
    { range: '45-54', percent: 12 },
    { range: '55+', percent: 4 },
  ],
}

// ── AI 프로필 분석 더미 — 원본 useGetProfileAI 동등 ─────────────────────────
export const PROFILE_AI_SUMMARY = `브랜드 프로필 핵심 인사이트

• 팔로워 25K 규모 대비 도달률(12.4%)과 참여율(3.7%)이 모두 업계 평균 이상이며, 콘텐츠 반응이 안정적입니다.
• 노출 대비 도달률이 4월 들어 +1.8%p 상승했고, 동일 기간 게시 빈도도 늘어 콘텐츠 리듬을 잘 유지하고 있습니다.
• 25-34세 여성 팔로워 비중이 가장 높아(약 26%), 라이프스타일·뷰티·웰니스 카테고리 광고 캠페인과의 적합도가 높습니다.`

// ── 팔로워 추이 — null = 데이터 없음(연결 전 기간) ──────────────────────────
export type BarDataItem = { label: string; value: number | null; showLabel?: boolean }

export const followerDataByPeriod: Record<DatePeriod, BarDataItem[]> = {
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

// ── 피드별 추세 — null = 데이터 없음 ────────────────────────────────────────
export type TrendItem = { label: string; likes: number | null; comments: number | null; reach: number | null; saves: number | null; showLabel?: boolean }

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

export const trendDataByPeriod: Record<DatePeriod, TrendItem[]> = {
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

// ── 노출·도달 시계열 — null = 데이터 없음 ───────────────────────────────────
export type ImpressReachItem = { label: string; impressions: number | null; reach: number | null; showLabel?: boolean }

export const impressReachByPeriod: Record<DatePeriod, ImpressReachItem[]> = {
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

// ── 콘텐츠 유형별 성과 ──────────────────────────────────────────────────────
export const contentTypeData = [
  { type: '릴스',     avgReach: 5200, avgLikes: 620, engagementRate: 4.8 },
  { type: '카드뉴스', avgReach: 3100, avgLikes: 380, engagementRate: 3.2 },
  { type: '일반 사진', avgReach: 2400, avgLikes: 290, engagementRate: 2.7 },
  { type: '스토리',   avgReach: 1800, avgLikes: 210, engagementRate: 3.2 },
]

// ── 게시물별 상세 ───────────────────────────────────────────────────────────
export type PostType = 'reels' | 'feed' | 'carousel' | 'story'
export type PostSortKey = 'date' | 'views' | 'reach' | 'likes' | 'comments' | 'saves' | 'engagement'
export type PostItem = {
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
export const POST_DATA: PostItem[] = (() => {
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

// ── 차트 메트릭 색상 ────────────────────────────────────────────────────────
export const metricColors = {
  likes:    'var(--color-brand-green)',
  reach:    'var(--color-chart-reach)',
  comments: 'var(--color-chart-comments)',
  saves:    'var(--color-chart-saves)',
}

export type MetricKey = keyof typeof metricColors
