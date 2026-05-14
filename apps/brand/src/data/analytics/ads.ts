/**
 * 광고주 — 광고 성과 (`/analytics/ads`) 데이터·타입·상수 단일 출처
 *
 * 분할 이전: `apps/brand/src/pages/AdPerformance.tsx` 내 인라인.
 * Instagram Graph API + Meta Marketing API 실연동 시 본 모듈의 const를 fetch 결과로 대체.
 */

import type { DatePeriod } from '@wellink/ui'

// ── 캠페인 계층 3단계 타입 (정책 § 1-2: 캠페인 → 광고세트 → 소재) ────────────
export type Ad = {
  id: string; adId: string; adName: string; message: string; thumbnailUrl?: string; status: string
  spend: number; roas: number; results: number; costPerResult: number
  reach: number; clicks: number; ctr: number; cpc: number
}
export type AdSet = {
  id: string; name: string; status: string
  spend: number; roas: number; results: number; costPerResult: number
  reach: number; clicks: number; ctr: number; cpc: number; ads: Ad[]
}
export type CampaignHierarchy = {
  campaignId: string; campaignName: string; objective: string
  status: '게재중' | '일시중지' | '종료'
  totalSpend: number; roas: number; totalResults: number; costPerResult: number
  totalReach: number; totalClicks: number; ctr: number; cpc: number
  adSets: AdSet[]
}

// ── 기간별 KPI 데이터 — Meta 유료 광고 KPI 8개 (정책 § 1-1) ─────────────────
export type KpiBundle = {
  spend: number; roas: number; results: number; costPerResult: number
  reach: number; clicks: number; ctr: number; cpc: number
  trends: { spend: number; roas: number; results: number; costPerResult: number; reach: number; clicks: number; ctr: number; cpc: number }
}
export const kpiByPeriod: Record<DatePeriod, KpiBundle> = {
  일간: { spend: 72000,    roas: 3.6, results: 18,    costPerResult: 4000, reach: 13800,   clicks: 350,    ctr: 1.4, cpc: 206,
    trends: { spend: 5.2, roas: 2.1, results: 8.4, costPerResult: -3.1, reach: 3.8, clicks: 12.0, ctr: 1.6, cpc: -2.5 } },
  주간: { spend: 486000,   roas: 3.8, results: 124,   costPerResult: 3920, reach: 96000,   clicks: 2410,   ctr: 1.5, cpc: 202,
    trends: { spend: 9.3, roas: 3.4, results: 11.2, costPerResult: -4.5, reach: 6.2, clicks: 18.5, ctr: 2.2, cpc: -3.8 } },
  월간: { spend: 1950000,  roas: 4.1, results: 512,   costPerResult: 3810, reach: 386000,  clicks: 9820,   ctr: 1.5, cpc: 199,
    trends: { spend: 14.8, roas: 7.6, results: 14.3, costPerResult: -5.2, reach: 11.2, clicks: 22.3, ctr: 3.1, cpc: -4.6 } },
  연간: { spend: 23400000, roas: 4.3, results: 6240,  costPerResult: 3750, reach: 4600000, clicks: 117840, ctr: 1.6, cpc: 198,
    trends: { spend: 32.1, roas: 18.9, results: 24.5, costPerResult: -7.4, reach: 28.4, clicks: 41.2, ctr: 5.8, cpc: -6.2 } },
}

// ── AI 광고 성과 분석 더미 — 분석/가이드 그룹 분리 패턴 (광고주 결정 v3)
export const AD_AI_DATA = {
  analysis: [
    '광고 지출이 직전 대비 +14.8% 증가했으나 ROAS는 4.1로 정체 — 신규 소재 효율 격차가 큽니다.',
    '결과당 비용이 -5.2%로 내려가며 캠페인 효율이 개선되는 흐름입니다.',
    '릴스 부스팅 소재 CTR 1.5%로 가장 높음. 피드 이미지·스토리는 평균 이하 수준.',
    'CTR이 1.4~1.6% 구간에서 일관되게 유지 — 외연 확장 여력이 있습니다.',
    '광고세트별 ROAS 격차가 큼 — 일부 고효율, 일부 저효율로 양극화되어 있습니다.',
  ],
  guides: [
    '고효율 광고세트(릴스 부스팅·신제품 인지도) 예산 비중을 늘리고 저효율 광고세트는 일시 중지합니다.',
    '피드 이미지 소재 리뉴얼 + 스토리 광고 타게팅 재검토로 평균 이하 채널 효율을 끌어올립니다.',
    '신규 타겟 세그먼트(연령·관심사) 추가로 도달 외연을 확장합니다.',
  ],
} as const

// 하위 호환 — 단일 summary string 참조 시 사용
export const AD_AI_SUMMARY = AD_AI_DATA.analysis.join('\n')

// ── 섹션별 도움말 — 원본 AD_SECTION_HINTS ────────────────────────────────────
export const AD_SECTION_HINTS_KO = {
  dailyPerformance: '매일의 광고 지출과 클릭 수를 함께 추적하는 지표입니다. 지출이 늘어날 때 클릭도 함께 증가하면 광고 효율이 안정적이라는 뜻입니다.',
  ctrTrend: 'CTR은 클릭 수 ÷ 노출 수 × 100으로 계산하는 클릭률입니다. 광고를 본 사람 중 얼마나 관심을 보였는지 나타내며, 일반적으로 높을수록 광고 소재와 타게팅 반응이 좋다고 볼 수 있습니다.',
  dailyClicks: '클릭 수는 광고를 눌러 실제로 반응한 횟수입니다. 단순 노출보다 한 단계 더 적극적인 관심을 의미합니다.',
  reachSource: '광고 도달이 어느 채널(피드/스토리/릴스)에서 발생했는지를 보여주는 지표입니다.',
  engagementSource: '광고 참여(클릭/좋아요/댓글)가 어느 채널에서 발생했는지를 보여주는 지표입니다.',
}

// ── 캠페인 더미 빌더 (100개) ─────────────────────────────────────────────────
const OBJECTIVES = ['인지도', '전환', '트래픽'] as const
const CAMPAIGN_NAMES = [
  '브랜드 인지도 — 릴스 부스팅', '신제품 론칭 — 전환 캠페인', '리타겟팅 — 웹사이트 방문자', '팔로워 확보 — 프로필 방문 유도',
  '시즌 세일 — 한정 쿠폰', '프리미엄 라인 — 영상 광고', '여름 한정 — 스토리 광고', '겨울 한정 — 릴스 광고',
  '신규 회원 — 가입 유도', '리스타팅 — 휴면 고객 부활',
]
const AD_FORMATS = ['릴스 광고', '피드 이미지', '스토리 광고', '카루셀 광고']

const buildCampaignHierarchy = (count: number): CampaignHierarchy[] =>
  Array.from({ length: count }, (_, i) => {
    // 더미 비율: paused 약 14% (i%7===6), closed 약 9% (i%11===10) — 시연 데이터 다양화 목적
    const isPaused = i % 7 === 6
    const isClosed = i % 11 === 10
    const status: '게재중' | '일시중지' | '종료' = isClosed ? '종료' : isPaused ? '일시중지' : '게재중'
    const baseSpend = 200000 + (i * 33000) % 800000
    const roas = +(2.5 + (i % 7) * 0.5).toFixed(1)
    const totalReach = baseSpend / 6 + (i * 1700) % 50000
    const totalClicks = Math.floor(totalReach * (0.012 + (i % 5) * 0.003))
    const ctr = +((totalClicks / Math.max(totalReach, 1)) * 100).toFixed(2)
    const totalResults = Math.floor(totalClicks * (0.05 + (i % 4) * 0.015))
    const costPerResult = totalResults > 0 ? Math.floor(baseSpend / totalResults) : 0
    const cpc = totalClicks > 0 ? Math.floor(baseSpend / totalClicks) : 0
    // 광고세트 1~3개
    const adSetCount = 1 + (i % 3)
    const adSets: AdSet[] = Array.from({ length: adSetCount }, (_, j) => {
      const setSpend = Math.floor(baseSpend / adSetCount)
      const setReach = Math.floor(totalReach / adSetCount)
      const setClicks = Math.floor(totalClicks / adSetCount)
      const adCount = 1 + ((i + j) % 3)
      const setResults = Math.floor(totalResults / adSetCount)
      const ads: Ad[] = Array.from({ length: adCount }, (_, k) => ({
        id: `ad-${i}-${j}-${k}`,
        adId: `ad-${i}-${j}-${k}`,
        adName: `${AD_FORMATS[(i + j + k) % AD_FORMATS.length]} #${k + 1}`,
        message: `광고 메시지 ${i + 1}-${j + 1}-${k + 1} — 신제품 출시 소식과 한정 혜택을 만나보세요.`,
        status: isClosed ? 'completed' : isPaused ? 'paused' : 'active',
        spend: Math.floor(setSpend / adCount),
        roas,
        results: Math.floor(setResults / adCount),
        costPerResult,
        reach: Math.floor(setReach / adCount),
        clicks: Math.floor(setClicks / adCount),
        ctr,
        cpc,
      }))
      return {
        id: `set-${i}-${j}`,
        name: `광고세트 ${j + 1}`,
        status: isClosed ? 'completed' : isPaused ? 'paused' : 'active',
        spend: setSpend, roas,
        results: Math.floor(totalResults / adSetCount),
        costPerResult,
        reach: setReach, clicks: setClicks, ctr, cpc,
        ads,
      }
    })
    return {
      campaignId: `camp-${i + 1}`,
      campaignName: i < CAMPAIGN_NAMES.length ? CAMPAIGN_NAMES[i] : `${CAMPAIGN_NAMES[i % CAMPAIGN_NAMES.length]} #${Math.floor(i / CAMPAIGN_NAMES.length) + 1}`,
      objective: OBJECTIVES[i % OBJECTIVES.length],
      status,
      totalSpend: baseSpend,
      roas,
      totalResults,
      costPerResult,
      totalReach,
      totalClicks,
      ctr,
      cpc,
      adSets,
    }
  })

export const ALL_CAMPAIGNS: CampaignHierarchy[] = buildCampaignHierarchy(100)
// 상태별 분할은 모듈 로드 시점 1회만 — 매 렌더 filter 호출 방지
export const ALL_ACTIVE_CAMPAIGNS = ALL_CAMPAIGNS.filter(c => c.status !== '종료')
export const ALL_CLOSED_CAMPAIGNS = ALL_CAMPAIGNS.filter(c => c.status === '종료')

// ── 기간별 시계열 차트 데이터 (지출/클릭/CTR) ────────────────────────────────
const buildChartDataByPeriod = (): Record<DatePeriod, { date: string; spend: number; clicks: number; ctr: number }[]> => {
  const today = new Date()
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (29 - i))
    const spend = 50000 + (i * 1200) + ((i * 31) % 25000)
    const clicks = Math.floor(spend / (200 + (i % 5) * 10))
    const reach = Math.floor(spend / 8 + (i * 850) % 8000)
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const spend = 350000 + (i * 15000) + ((i * 43) % 90000)
    const clicks = Math.floor(spend / (205 + (i % 5) * 8))
    const reach = Math.floor(spend / 8 + (i * 5500) % 40000)
    return { date: `${Math.floor(i / 4) + 1}월${(i % 4) + 1}주`, spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const spend = 1200000 + (i * 80000) + ((i * 170) % 600000)
    const clicks = Math.floor(spend / (195 + (i % 5) * 6))
    const reach = Math.floor(spend / 8 + (i * 25000) % 200000)
    return { date: MONTHS[i], spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  const yearly = Array.from({ length: 5 }, (_, i) => {
    const spend = 12000000 + i * 3000000
    const clicks = Math.floor(spend / 200)
    const reach = Math.floor(spend / 8)
    return { date: `${2021 + i}년`, spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  return { 일간: daily, 주간: weekly, 월간: monthly, 연간: yearly }
}
export const CHART_DATA_BY_PERIOD = buildChartDataByPeriod()

export const CHART_PERIOD_LABEL: Record<DatePeriod, string> = { 일간: '일별', 주간: '주별', 월간: '월별', 연간: '연도별' }

// ── 광고 소재 유형별 성과 — CPM은 업계 평균 기준 (₩5K~₩18K) ──────────────────
export const adFormatPerf = [
  { format: '릴스 광고', impressions: 218000, clicks: 3270, ctr: 1.50, cpm: 8400 },
  { format: '피드 이미지', impressions: 124000, clicks: 1610, ctr: 1.30, cpm: 11200 },
  { format: '스토리 광고', impressions: 88000,  clicks: 1230, ctr: 1.40, cpm: 6800 },
]

// ── 상태·목표 배지 — 채도 v2: bg-X-100 + text-X-700/800 일관 ─────────────────
export function getAdStatusBadge(status: string): { label: string; cls: string } {
  if (status === 'active')    return { label: '게재중',   cls: 'bg-emerald-100 text-emerald-700' }
  if (status === 'paused')    return { label: '일시중지', cls: 'bg-amber-100 text-amber-800' }
  return                             { label: '종료',     cls: 'bg-red-100 text-red-500' }
}

export function getObjectiveBadge(obj: string) {
  switch (obj) {
    case '인지도': return 'bg-blue-100 text-blue-700'
    case '전환':   return 'bg-purple-100 text-purple-700'
    case '트래픽': return 'bg-sky-100 text-sky-700'
    default:      return 'bg-gray-100 text-gray-600'
  }
}
