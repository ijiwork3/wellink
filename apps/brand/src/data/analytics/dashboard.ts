/**
 * 대시보드 v2 mock 데이터 — 워드클라우드 / 멘션 콘텐츠 / 캠페인 미리보기 / 멘션 구성
 *
 * 실제 데이터 소스: Meta 광고 인사이트 + IG Graph API (콘텐츠) + 백엔드 캠페인.
 * 현재는 영상에서 본 *사계인단백연구소* 콘텐츠 시드로 모킹.
 */

import type { WordCloudEntry, DatePeriod } from '@wellink/ui'
import type { ViralContentMiniCardProps } from '../../components/dashboard/ViralContentMiniCard'
import type { CampaignPreviewRowProps } from '../../components/dashboard/CampaignPreviewRow'

/* ── 캡션 워드클라우드 — 영상 매칭 (@enuf.sports 크로스핏 도메인, 36개) ── */
export const DASHBOARD_VIRAL_KEYWORDS: WordCloudEntry[] = [
  { word: 'crossfit', count: 38, sentiment: 'positive' },
  { word: 'enuf', count: 32, sentiment: 'positive' },
  { word: 'sports', count: 28 },
  { word: '크로스핏', count: 24 },
  { word: '하이록스', count: 18 },
  { word: 'hyrox', count: 16 },
  { word: '운동', count: 14 },
  { word: 'fareastthrowdown', count: 12 },
  { word: '이너프', count: 10 },
  { word: '감사합니다', count: 9, sentiment: 'positive' },
  { word: '라인벨라', count: 8 },
  { word: 'anonkorea', count: 7 },
  { word: 'epic', count: 6 },
  { word: 'official', count: 6 },
  { word: '크로스밴타', count: 5 },
  { word: 'team', count: 5 },
  { word: '열심히', count: 5, sentiment: 'positive' },
  { word: '함께', count: 4, sentiment: 'positive' },
  { word: 'siksa', count: 4 },
  { word: 'sonogong', count: 4 },
  { word: '2min', count: 4 },
  { word: 'outdo', count: 3 },
  { word: 'gym', count: 3 },
  { word: '헬스', count: 3 },
  { word: '오버헤드', count: 3 },
  { word: 'snatch', count: 3 },
  { word: 'fit', count: 3 },
  { word: 'running', count: 2 },
  { word: 'training', count: 2 },
  { word: 'tsf', count: 2 },
  { word: '경기', count: 2 },
  { word: 'protein', count: 2 },
  { word: '뉴트', count: 2 },
  { word: 'wod', count: 2 },
  { word: 'open', count: 2 },
  { word: '챌린지', count: 2 },
]

/* ── 멘션 구성 — 피드 vs 릴스 (영상 매칭: 143건, 41/59%) ─────────── */
export const DASHBOARD_VIRAL_MIX = {
  feed:  { count: 59, percent: 41 },
  reels: { count: 84, percent: 59 },
  total: 143,
  feedTrend: 1.7,
  reelsTrend: 1.2,
  totalTrend: 1.4,
} as const

/* ── 멘션 콘텐츠 카드 — 영상 매칭 (@enuf.sports 도메인, 8개)
 *  thumbnail: Unsplash 운동/피트니스 사진 큐레이션 (9:16 비율 crop)
 *  외부 fetch 실패 시 ViralContentMiniCard onError → SVG placeholder fallback
 */
type ViralContent = ViralContentMiniCardProps & { id: string; postedAt: string }

export const DASHBOARD_VIRAL_CONTENTS: ViralContent[] = [
  {
    id: 'sandfox_1',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=360&h=640&fit=crop&q=70',
    contentType: 'reels',
    caption: 'crossfit open 14.2 진행! 오버헤드 스내치 80kg 도전 — 다음 라운드 hyrox 준비 중',
    influencer: { username: 'sandfox', platform: 'instagram' },
    metrics: { likes: 5485, reach: 12300, comments: 88, viralScore: 92 },
    grade: 'A',
    postedAt: '2026-05-13',
  },
  {
    id: 'njang_workout',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=70',
    contentType: 'feed',
    caption: '아침 wod — 박스점프 100회 + 머슬업 + 데드리프트. enuf 팀 함께 운동했어요',
    influencer: { username: 'njang_workout', platform: 'instagram' },
    metrics: { likes: 3812, reach: 8940, comments: 124, viralScore: 86 },
    grade: 'A',
    postedAt: '2026-05-12',
  },
  {
    id: 'zzangha_0707',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=360&h=640&fit=crop&q=70',
    contentType: 'reels',
    caption: '하이록스 시즌 5 준비 — 스키 + 썰드 백 + 런 3km. 라인벨라 챌린지 참여',
    influencer: { username: 'zzangha_0707', platform: 'instagram' },
    metrics: { likes: 2940, reach: 6820, comments: 67, viralScore: 78 },
    grade: 'B',
    postedAt: '2026-05-11',
  },
  {
    id: 'b_wisdom_fit',
    thumbnail: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=400&fit=crop&q=70',
    contentType: 'feed',
    caption: 'crossfit 입문 6개월. 처음엔 못했던 키핑풀업 5개 성공 — 감사합니다',
    influencer: { username: 'b_wisdom_fit', platform: 'instagram' },
    metrics: { likes: 4120, reach: 9450, comments: 92, viralScore: 84 },
    grade: 'A',
    postedAt: '2026-05-10',
  },
  {
    id: 'rosh_youngdyun',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=360&h=640&fit=crop&q=70',
    contentType: 'reels',
    caption: 'fareastthrowdown 2026 출전 확정! 팀 enuf 응원해주세요 🙏 #sports',
    influencer: { username: 'rosh_youngdyun', platform: 'instagram' },
    metrics: { likes: 6280, reach: 14800, comments: 156, viralScore: 91 },
    grade: 'A',
    postedAt: '2026-05-09',
  },
  {
    id: 'lemo_fit',
    thumbnail: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=360&h=640&fit=crop&q=70',
    contentType: 'reels',
    caption: '주말 wod 끝 — 2min sprint × 8세트. 다리 풀려요... outdo myself',
    influencer: { username: 'lemo_fit', platform: 'instagram' },
    metrics: { likes: 1840, reach: 4320, comments: 38, viralScore: 64 },
    grade: 'C',
    postedAt: '2026-05-08',
  },
  {
    id: 'ionim_fit',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&q=70',
    contentType: 'feed',
    caption: 'enuf 영양제 한 달 후기 — 회복 빠르고 컨디션 좋음. running 페이스 올랐어요',
    influencer: { username: 'ionim_fit', platform: 'instagram' },
    metrics: { likes: 2150, reach: 5680, comments: 45, viralScore: 71 },
    grade: 'B',
    postedAt: '2026-05-07',
  },
  {
    id: 'ut_hyou',
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=360&h=640&fit=crop&q=70',
    contentType: 'reels',
    caption: '오늘의 gym 인증 — 데드리프트 PR 갱신 (140kg) 🔥 enuf protein 도움 큼',
    influencer: { username: 'ut_hyou', platform: 'instagram' },
    metrics: { likes: 3580, reach: 7920, comments: 71, viralScore: 79 },
    grade: 'B',
    postedAt: '2026-05-06',
  },
]

/* ── 캠페인 미리보기 — 5개 (진행중 3 / 검토 1 / 종료 임박 1) ── */
export const DASHBOARD_CAMPAIGN_PREVIEWS: (CampaignPreviewRowProps & { id: string })[] = [
  {
    id: 'cmp_001',
    name: '봄 신상 단백질 도식락 출시 캠페인',
    status: 'active',
    goal: { current: 54, target: 100, unit: '결과' },
    influencers: { matched: 6, reviewing: 2 },
    startDate: '2026-04-01',
    endDate: '2026-05-17',  // D-3
    metrics: { reach: 32400, results: 54, roas: 4.2 },
  },
  {
    id: 'cmp_002',
    name: '5월 헬스 챌린지 — 인플루언서 매칭',
    status: 'active',
    goal: { current: 28, target: 50, unit: '결과' },
    influencers: { matched: 4, reviewing: 0 },
    startDate: '2026-05-01',
    endDate: '2026-05-26',  // D-12
    metrics: { reach: 18900, results: 28, roas: 3.1 },
  },
  {
    id: 'cmp_003',
    name: '바디프로필 시즌 — 다이어트 콘텐츠',
    status: 'active',
    goal: { current: 72, target: 80, unit: '결과' },
    influencers: { matched: 5, reviewing: 1 },
    startDate: '2026-04-15',
    endDate: '2026-06-01',  // D-18
    metrics: { reach: 41200, results: 72, roas: 4.8 },
  },
  {
    id: 'cmp_004',
    name: '6월 신규 — 단백질 쉐이크 런칭 (검토 대기)',
    status: 'review',
    goal: { current: 0, target: 60, unit: '결과' },
    influencers: { matched: 0, reviewing: 5 },
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    metrics: { reach: 0, results: 0, roas: 0 },
  },
]

/* ── 캠페인 상태 카운트 (서브타이틀용) ─────────────────────── */
export const DASHBOARD_CAMPAIGN_COUNTS = (() => {
  const list = DASHBOARD_CAMPAIGN_PREVIEWS
  const active   = list.filter(c => c.status === 'active').length
  const review   = list.filter(c => c.status === 'review').length
  const closing  = list.filter(c => {
    if (c.status !== 'active') return false
    const diff = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000)
    return diff >= 0 && diff <= 7
  }).length
  return { active, review, closing }
})()

/* ── 스파크라인 KPI 키 셋 (타입) ─────────────────────────── */
export interface SparklineSet {
  followers: number[]
  reachRate: number[]
  engagement: number[]
  adSpend: number[]
  roas: number[]
  adResults: number[]
  costPerResult: number[]
  viralReach: number[]
  shares: number[]
  saves: number[]
  viralFactor: number[]
}

/* ── 스파크라인 mock — 각 KPI별 7 포인트 (최근 7일, 일간 디폴트) ── */
export const DASHBOARD_SPARKLINES: SparklineSet = {
  // 프로필
  followers:    [23800, 23980, 24120, 24210, 24340, 24420, 24512],
  reachRate:    [16.8, 17.2, 17.5, 17.9, 18.0, 18.1, 18.2],
  engagement:   [3.1, 3.2, 3.3, 3.5, 3.4, 3.5, 3.6],
  // 광고
  adSpend:      [220000, 235000, 248000, 256000, 268000, 275000, 285000],
  roas:         [2.9, 3.0, 3.05, 3.1, 3.15, 3.18, 3.2],
  adResults:    [98, 105, 112, 118, 125, 134, 142],
  costPerResult:[2410, 2350, 2280, 2210, 2160, 2120, 2070],
  // 바이럴 요약 (인라인)
  viralReach:   [310000, 325000, 340000, 352000, 365000, 378000, 386000],
  shares:       [980, 1020, 1080, 1110, 1140, 1180, 1245],
  saves:        [820, 830, 845, 850, 853, 855, 856],
  viralFactor:  [1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7],
}

/* ── 팔로워 추이 — 기간별 (FollowerBarChart 데이터, 마지막이 max) ── */
export const DASHBOARD_FOLLOWER_TREND_BY_PERIOD: Record<DatePeriod, { label: string; value: number; showLabel?: boolean }[]> = {
  일간: [
    // 최근 14일 (5/1~5/14) — showLabel은 X축 라벨 간격용 (3개마다)
    { label: '5/1',  value: 24050, showLabel: true },
    { label: '5/2',  value: 24080 },
    { label: '5/3',  value: 24110 },
    { label: '5/4',  value: 24145, showLabel: true },
    { label: '5/5',  value: 24190 },
    { label: '5/6',  value: 24230 },
    { label: '5/7',  value: 24275, showLabel: true },
    { label: '5/8',  value: 24320 },
    { label: '5/9',  value: 24360 },
    { label: '5/10', value: 24400, showLabel: true },
    { label: '5/11', value: 24435 },
    { label: '5/12', value: 24470 },
    { label: '5/13', value: 24495, showLabel: true },
    { label: '5/14', value: 24512, showLabel: true },
  ],
  주간: [
    { label: '12주 전', value: 22100 },
    { label: '11주 전', value: 22380 },
    { label: '10주 전', value: 22640 },
    { label: '9주 전',  value: 22920 },
    { label: '8주 전',  value: 23200 },
    { label: '7주 전',  value: 23420 },
    { label: '6주 전',  value: 23640 },
    { label: '5주 전',  value: 23830 },
    { label: '4주 전',  value: 24020 },
    { label: '3주 전',  value: 24180 },
    { label: '2주 전',  value: 24320 },
    { label: '1주 전',  value: 24420 },
    { label: '이번 주', value: 24512 },
  ],
  월간: [
    { label: '6월', value: 19800 },
    { label: '7월', value: 20300 },
    { label: '8월', value: 20900 },
    { label: '9월', value: 21400 },
    { label: '10월', value: 21800 },
    { label: '11월', value: 22150 },
    { label: '12월', value: 22500 },
    { label: '1월',  value: 22800 },
    { label: '2월',  value: 23200 },
    { label: '3월',  value: 23700 },
    { label: '4월',  value: 24100 },
    { label: '5월',  value: 24512 },
  ],
  연간: [
    { label: '2022', value: 8400 },
    { label: '2023', value: 13200 },
    { label: '2024', value: 17800 },
    { label: '2025', value: 22100 },
    { label: '2026', value: 24512 },
  ],
}

/* ── 광고 지출 + ROAS — 기간별 (MixedChart 데이터, clicks 필드 = ROAS) ──
   데이터 포인트 수: 일간(14) > 주간(8) < 월간(12) — 일간이 가장 세밀한 단위 */
type SpendRoas = { date: string; spend: number; clicks: number }
export const DASHBOARD_SPEND_ROAS_BY_PERIOD: Record<DatePeriod, SpendRoas[]> = {
  일간: [
    // 최근 14일 (5/1~5/14)
    { date: '5/1',  spend: 78000,  clicks: 2.6 },
    { date: '5/2',  spend: 82000,  clicks: 2.65 },
    { date: '5/3',  spend: 87000,  clicks: 2.7 },
    { date: '5/4',  spend: 91000,  clicks: 2.72 },
    { date: '5/5',  spend: 88000,  clicks: 2.68 },
    { date: '5/6',  spend: 93000,  clicks: 2.75 },
    { date: '5/7',  spend: 95000,  clicks: 2.8 },
    { date: '5/8',  spend: 98000,  clicks: 2.82 },
    { date: '5/9',  spend: 102000, clicks: 2.85 },
    { date: '5/10', spend: 110000, clicks: 2.9 },
    { date: '5/11', spend: 118000, clicks: 3.0 },
    { date: '5/12', spend: 124000, clicks: 3.1 },
    { date: '5/13', spend: 131000, clicks: 3.15 },
    { date: '5/14', spend: 138000, clicks: 3.2 },
  ],
  주간: [
    // 최근 8주
    { date: '8주 전', spend: 510000, clicks: 2.6 },
    { date: '7주 전', spend: 545000, clicks: 2.68 },
    { date: '6주 전', spend: 580000, clicks: 2.75 },
    { date: '5주 전', spend: 618000, clicks: 2.82 },
    { date: '4주 전', spend: 652000, clicks: 2.9 },
    { date: '3주 전', spend: 700000, clicks: 3.0 },
    { date: '2주 전', spend: 756000, clicks: 3.1 },
    { date: '이번 주', spend: 813000, clicks: 3.2 },
  ],
  월간: [
    // 최근 12개월
    { date: '6월',  spend: 1850000, clicks: 2.4 },
    { date: '7월',  spend: 1980000, clicks: 2.5 },
    { date: '8월',  spend: 2120000, clicks: 2.6 },
    { date: '9월',  spend: 2280000, clicks: 2.7 },
    { date: '10월', spend: 2390000, clicks: 2.8 },
    { date: '11월', spend: 2510000, clicks: 2.9 },
    { date: '12월', spend: 2630000, clicks: 3.0 },
    { date: '1월',  spend: 2710000, clicks: 3.05 },
    { date: '2월',  spend: 2780000, clicks: 3.1 },
    { date: '3월',  spend: 2820000, clicks: 3.15 },
    { date: '4월',  spend: 2840000, clicks: 3.18 },
    { date: '5월',  spend: 2850000, clicks: 3.2 },
  ],
  연간: [
    { date: '2022', spend: 14200000, clicks: 1.8 },
    { date: '2023', spend: 18900000, clicks: 2.2 },
    { date: '2024', spend: 23400000, clicks: 2.6 },
    { date: '2025', spend: 28100000, clicks: 2.9 },
    { date: '2026', spend: 31200000, clicks: 3.2 },
  ],
}

/* ── KPI 스파크라인 — 기간별 (trend 음수 케이스는 후반 하락 패턴으로 시각 정합) ── */
export const DASHBOARD_SPARKLINES_BY_PERIOD: Record<DatePeriod, SparklineSet> = {
  // 일간 — 일부 KPI 후반 하락 (도달률/ROAS/공유) — trend 음수와 시각 동기
  일간: {
    followers:    [24410, 24430, 24445, 24465, 24485, 24500, 24512],   // 상승 (trend +0.5)
    reachRate:    [18.5, 18.7, 18.6, 18.4, 18.3, 18.25, 18.2],         // 후반 하락 (trend -1.2)
    engagement:   [3.55, 3.56, 3.58, 3.59, 3.60, 3.60, 3.6],            // 상승 (trend +0.1)
    adSpend:      [125000, 128000, 131000, 133000, 135000, 137000, 138000],  // 상승 (trend +5.3)
    roas:         [3.30, 3.32, 3.30, 3.28, 3.25, 3.22, 3.2],            // 후반 하락 (trend -0.4)
    adResults:    [20, 21, 22, 22, 23, 23, 24],                          // 상승 (trend +9.1)
    costPerResult:[6000, 5950, 5900, 5850, 5820, 5780, 5750],            // 하락 (positive=false, trend -2.4 → good)
    viralReach:   [375000, 378000, 380000, 382000, 384000, 385000, 386000],
    shares:       [1265, 1260, 1255, 1250, 1240, 1225, 1200],            // 후반 하락 (trend -1.5)
    saves:        [850, 851, 852, 853, 854, 855, 856],
    viralFactor:  [1.62, 1.64, 1.66, 1.67, 1.68, 1.69, 1.7],
  },
  주간: {
    followers:    [23200, 23380, 23540, 23720, 23900, 24100, 24512],
    reachRate:    [16.0, 16.4, 16.8, 17.2, 17.5, 17.9, 18.2],
    engagement:   [2.9, 3.0, 3.1, 3.2, 3.3, 3.5, 3.6],
    adSpend:      [1950000, 2080000, 2210000, 2380000, 2520000, 2680000, 2850000],
    roas:         [2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2],
    adResults:    [89, 102, 115, 124, 131, 137, 142],
    costPerResult:[2580, 2480, 2390, 2280, 2210, 2140, 2070],
    viralReach:   [280000, 305000, 325000, 340000, 358000, 372000, 386000],
    shares:       [840, 920, 980, 1050, 1120, 1185, 1245],
    saves:        [780, 800, 820, 835, 845, 852, 856],
    viralFactor:  [1.2, 1.3, 1.4, 1.5, 1.6, 1.65, 1.7],
  },
  월간: {
    followers:    [19800, 20800, 21600, 22400, 23100, 23800, 24512],
    reachRate:    [13.4, 14.6, 15.4, 16.2, 16.9, 17.6, 18.2],
    engagement:   [2.4, 2.7, 2.9, 3.1, 3.3, 3.5, 3.6],
    adSpend:      [1850000, 2080000, 2280000, 2510000, 2710000, 2780000, 2850000],
    roas:         [2.4, 2.6, 2.7, 2.9, 3.05, 3.15, 3.2],
    adResults:    [62, 78, 92, 108, 124, 132, 142],
    costPerResult:[3210, 2980, 2740, 2510, 2280, 2150, 2070],
    viralReach:   [218000, 245000, 278000, 312000, 340000, 365000, 386000],
    shares:       [580, 690, 810, 940, 1070, 1170, 1245],
    saves:        [680, 720, 760, 800, 830, 850, 856],
    viralFactor:  [0.9, 1.1, 1.3, 1.45, 1.55, 1.65, 1.7],
  },
  연간: {
    followers:    [8400, 13200, 17800, 22100, 24512, 24512, 24512],  // 5년치 (마지막 3년 동일은 padding)
    reachRate:    [9.4, 11.8, 14.2, 16.8, 18.2, 18.2, 18.2],
    engagement:   [1.8, 2.3, 2.8, 3.3, 3.6, 3.6, 3.6],
    adSpend:      [14200000, 18900000, 23400000, 28100000, 31200000, 31200000, 31200000],
    roas:         [1.8, 2.2, 2.6, 2.9, 3.2, 3.2, 3.2],
    adResults:    [58, 92, 115, 128, 142, 142, 142],
    costPerResult:[5800, 4200, 3100, 2480, 2070, 2070, 2070],
    viralReach:   [128000, 198000, 268000, 332000, 386000, 386000, 386000],
    shares:       [340, 580, 820, 1080, 1245, 1245, 1245],
    saves:        [420, 580, 720, 820, 856, 856, 856],
    viralFactor:  [0.6, 0.9, 1.2, 1.5, 1.7, 1.7, 1.7],
  },
}

/* ── KPI 값 — 기간별 (표시용) ────────────────────────────── */
export const DASHBOARD_KPI_VALUES_BY_PERIOD: Record<DatePeriod, {
  profile: { followers: string; reachRate: string; engagement: string; trends: { followers: number; reachRate: number; engagement: number } }
  ad: { spend: string; roas: string; results: string; costPerResult: string; trends: { spend: number; roas: number; results: number; costPerResult: number } }
  viral: { reach: string; shares: string; saves: string; factor: string; trends: { reach: number; shares: number; saves: number; factor: number } }
}> = {
  일간: {
    profile: {
      followers: '24,512', reachRate: '18.2%', engagement: '3.6%',
      // 도달률 음수 케이스 — amber 노란 카드 (사용자 데모용)
      trends: { followers: 0.5, reachRate: -1.2, engagement: 0.1 },
    },
    ad: {
      spend: '138,000원', roas: '3.2x', results: '24', costPerResult: '5,750원',
      // ROAS 음수 (bad=amber), 결과당 비용 음수 (positive=false → good=초록)
      trends: { spend: 5.3, roas: -0.4, results: 9.1, costPerResult: -2.4 },
    },
    viral: {
      reach: '38.6만', shares: '1.2k', saves: '856', factor: '1.7',
      // 공유 음수 케이스 — amber (사용자 데모용)
      trends: { reach: 2.1, shares: -1.5, saves: 0.4, factor: 4.0 },
    },
  },
  주간: {
    profile: {
      followers: '24,512', reachRate: '18.2%', engagement: '3.6%',
      trends: { followers: 1.7, reachRate: 0.8, engagement: 0.2 },
    },
    ad: {
      spend: '813,000원', roas: '3.2x', results: '88', costPerResult: '9,240원',
      trends: { spend: 13.7, roas: 1.6, results: 10.2, costPerResult: -3.2 },
    },
    viral: {
      reach: '38.6만', shares: '1.2k', saves: '856', factor: '1.7',
      trends: { reach: 5.5, shares: 5.5, saves: 0.5, factor: 6.0 },
    },
  },
  월간: {
    profile: {
      followers: '24,512', reachRate: '18.2%', engagement: '3.6%',
      trends: { followers: 2.4, reachRate: 1.1, engagement: 0.3 },
    },
    ad: {
      spend: '285만원', roas: '3.2x', results: '142', costPerResult: '20,070원',
      trends: { spend: 11.5, roas: 0.3, results: 12.7, costPerResult: -5.8 },
    },
    viral: {
      reach: '38.6만', shares: '1.2k', saves: '856', factor: '1.7',
      trends: { reach: 4.2, shares: 6.4, saves: -1.1, factor: 8.0 },
    },
  },
  연간: {
    profile: {
      followers: '24,512', reachRate: '18.2%', engagement: '3.6%',
      trends: { followers: 22.8, reachRate: 12.4, engagement: 0.8 },
    },
    ad: {
      spend: '3,120만원', roas: '3.2x', results: '1,520', costPerResult: '20,500원',
      trends: { spend: 32.0, roas: 1.2, results: 36.0, costPerResult: -14.0 },
    },
    viral: {
      reach: '430만', shares: '14.2k', saves: '8.6k', factor: '1.7',
      trends: { reach: 28.0, shares: 35.0, saves: 12.0, factor: 18.0 },
    },
  },
}
