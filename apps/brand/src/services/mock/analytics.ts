// Mock data — replace with API calls when backend is ready
// 데이터 품질 기준:
//   - Meta 광고 CTR: 실제 평균 1.0~2.0% (인스타그램 피드/릴스 기준)
//   - 노출 >> 도달 >> 클릭 >> 전환 퍼널 유지
//   - 팔로워 대비 참여율: 2~6% 수준 (업계 평균)
//   - 릴스 조회수 > 피드 도달 > 스토리 도달

export type Period = '일간' | '주간' | '월간' | '연간'

// AdPerformance 페이지 KPI
// data-policy-v1: ROAS ≥3.0 정상 / ≥1.5 주의 / <1.5 위험
// CTR: 1.0~2.0% 현실적 수치 (6%대는 서치광고 수준 — 인스타 피드/릴스에 부적합)
export interface AdKPI {
  label: string
  value: string | number
  sub: string
  trend: number
  positive: boolean
}

export const mockAdKPIByPeriod: Record<Period, AdKPI[]> = {
  일간: [
    { label: '광고 지출', value: '₩72,000', sub: '오늘', trend: 5.2, positive: true },
    { label: 'ROAS', value: '3.6x', sub: '광고비 대비 매출', trend: 2.1, positive: true },
    { label: '총 도달', value: '13,800', sub: '고유 사용자', trend: 3.8, positive: true },
    { label: '평균 CTR', value: '1.4%', sub: '클릭률', trend: 1.6, positive: true },
  ],
  주간: [
    { label: '광고 지출', value: '₩486,000', sub: '이번 주', trend: 9.3, positive: true },
    { label: 'ROAS', value: '3.8x', sub: '광고비 대비 매출', trend: 3.4, positive: true },
    { label: '총 도달', value: '96,000', sub: '고유 사용자', trend: 6.2, positive: true },
    { label: '평균 CTR', value: '1.5%', sub: '클릭률', trend: 2.2, positive: true },
  ],
  월간: [
    { label: '광고 지출', value: '₩1,950,000', sub: '이번 달', trend: 14.8, positive: true },
    { label: 'ROAS', value: '4.1x', sub: '광고비 대비 매출', trend: 7.6, positive: true },
    { label: '총 도달', value: '386,000', sub: '고유 사용자', trend: 11.2, positive: true },
    { label: '평균 CTR', value: '1.5%', sub: '클릭률', trend: 3.1, positive: true },
  ],
  연간: [
    { label: '광고 지출', value: '₩23,400,000', sub: '올해 누적', trend: 32.1, positive: true },
    { label: 'ROAS', value: '4.3x', sub: '광고비 대비 매출', trend: 18.9, positive: true },
    { label: '총 도달', value: '4,600,000', sub: '고유 사용자', trend: 28.4, positive: true },
    { label: '평균 CTR', value: '1.6%', sub: '클릭률', trend: 5.8, positive: true },
  ],
}

export interface MetaCampaign {
  id: number
  name: string
  status: '게재중' | '일시중지' | '종료'
  budget: string
  reach: number
  clicks: number
  ctr: number    // 1.0~2.0% 현실적 수치
  cpc: string
  roas: number
}

// 노출(impressions) >> 도달(reach) >> 클릭(clicks) >> 전환(results) 퍼널 유지
// CTR = 클릭/도달 × 100 — 1.2~1.8% 범위 (인스타그램 유료 광고 실제 평균)
export const mockMetaCampaigns: MetaCampaign[] = [
  {
    id: 1,
    name: '브랜드 인지도 — 릴스 부스팅',
    status: '게재중',
    budget: '₩80,000/일',
    reach: 18600,
    clicks: 280,
    ctr: 1.50,   // 릴스: CTR 비교적 높음
    cpc: '₩286',
    roas: 3.8,
  },
  {
    id: 2,
    name: '신제품 론칭 — 전환 캠페인',
    status: '게재중',
    budget: '₩60,000/일',
    reach: 12400,
    clicks: 174,
    ctr: 1.40,
    cpc: '₩345',
    roas: 4.2,
  },
  {
    id: 3,
    name: '리타겟팅 — 웹사이트 방문자',
    status: '게재중',
    budget: '₩40,000/일',
    reach: 5800,
    clicks: 104,
    ctr: 1.80,   // 리타겟팅: 관심도 높아 CTR 상승
    cpc: '₩385',
    roas: 5.1,
  },
  {
    id: 4,
    name: '팔로워 확보 — 프로필 방문 유도',
    status: '일시중지',
    budget: '₩50,000/일',
    reach: 22000,
    clicks: 242,
    ctr: 1.10,   // 인지도 목적: CTR 낮음
    cpc: '₩207',
    roas: 2.4,
  },
  {
    id: 5,
    name: '시즌 세일 — 한정 쿠폰',
    status: '종료',
    budget: '₩120,000/일',
    reach: 34000,
    clicks: 476,
    ctr: 1.40,
    cpc: '₩252',
    roas: 4.8,
  },
]

// ProfileInsight 페이지 KPI
// 팔로워 24~25K 브랜드 계정 기준
// 도달률 = 게시물 도달 / 팔로워 × 100 — 보통 10~15%
// 참여율 = (좋아요+댓글+저장) / 도달 × 100 — 업계 평균 2~5%
export const mockProfileKPIByPeriod: Record<Period, { label: string; value: string; change: number }[]> = {
  일간: [
    { label: '팔로워', value: '24,800', change: 0.1 },
    { label: '평균 도달률', value: '9.8%', change: 0.8 },
    { label: '참여율', value: '4.2%', change: 0.5 },
    { label: '노출 수', value: '31,200', change: 2.1 },
  ],
  주간: [
    { label: '팔로워', value: '24,650', change: 1.2 },
    { label: '평균 도달률', value: '11.2%', change: 1.5 },
    { label: '참여율', value: '3.9%', change: -0.1 },
    { label: '노출 수', value: '198,000', change: 4.8 },
  ],
  월간: [
    { label: '팔로워', value: '23,900', change: 5.2 },
    { label: '평균 도달률', value: '12.4%', change: 1.8 },
    { label: '참여율', value: '3.7%', change: -0.3 },
    { label: '노출 수', value: '820,000', change: 8.6 },
  ],
  연간: [
    { label: '팔로워', value: '18,200', change: 22.8 },
    { label: '평균 도달률', value: '13.1%', change: 3.1 },
    { label: '참여율', value: '3.5%', change: -0.8 },
    { label: '노출 수', value: '9,200,000', change: 18.4 },
  ],
}

// 게시물 유형별 참여율 현실 비율
// 릴스 > 카루셀 > 피드 > 스토리 순으로 참여율 높음
// 팔로워 25K 기준: 릴스 도달 4,000~7,000 / 피드 도달 2,000~4,000
export const mockContentTypePerf = [
  { type: '릴스',      avgReach: 5200, avgLikes: 260, engagementRate: 4.8, engagedFollowerPct: '21%' },
  { type: '카드뉴스',  avgReach: 3100, avgLikes: 148, engagementRate: 3.2, engagedFollowerPct: '13%' },
  { type: '일반 사진', avgReach: 2400, avgLikes: 108, engagementRate: 2.7, engagedFollowerPct: '10%' },
  { type: '스토리',    avgReach: 1800, avgLikes: 70,  engagementRate: 3.2, engagedFollowerPct: '7%' },
]

// ViralMetrics 페이지 KPI
// 바이럴 도달: 캠페인 콘텐츠 총 도달
// 바이럴 계수: 공유·저장 기반 확산 지수 (1.0~4.0x 범위)
export type ViewMode = '캠페인별' | '인플루언서별'

export interface ViralContent {
  id: number
  creator: string
  campaign: string
  type: string
  platform: string
  reach: number
  likes: number
  comments: number
  saves: number
  shares: number
  engRate: number   // (likes+comments+saves) / reach × 100
  thumbnailClass: string
}

// 참여율: reach 대비 (likes+comments+saves) × 100
// 릴스: 4~8%, 피드: 2.5~4%, 스토리: 1.5~3.5%
export const mockViralContents: ViralContent[] = [
  {
    id: 1,
    creator: '이창민',
    campaign: '봄 요가 프로모션',
    type: '릴스',
    platform: '인스타그램',
    reach: 42000,
    likes: 2100,
    comments: 186,
    saves: 840,
    shares: 410,
    engRate: 7.4,   // (2100+186+840)/42000 × 100
    thumbnailClass: 'bg-pink-300',
  },
  {
    id: 2,
    creator: '김가애',
    campaign: '봄 요가 프로모션',
    type: '피드',
    platform: '인스타그램',
    reach: 31000,
    likes: 930,
    comments: 124,
    saves: 527,
    shares: 210,
    engRate: 5.1,   // (930+124+527)/31000 × 100
    thumbnailClass: 'bg-blue-300',
  },
  {
    id: 3,
    creator: '한서연',
    campaign: '비건 신제품 론칭',
    type: '쇼츠',
    platform: '유튜브',
    reach: 58000,
    likes: 2900,
    comments: 348,
    saves: 870,
    shares: 620,
    engRate: 7.1,   // (2900+348+870)/58000 × 100
    thumbnailClass: 'bg-emerald-300',
  },
  {
    id: 4,
    creator: '정예린',
    campaign: '여름 홈트 챌린지',
    type: '릴스',
    platform: '인스타그램',
    reach: 27000,
    likes: 1188,
    comments: 94,
    saves: 513,
    shares: 162,
    engRate: 6.6,   // (1188+94+513)/27000 × 100
    thumbnailClass: 'bg-indigo-300',
  },
  {
    id: 5,
    creator: '김태우',
    campaign: '여름 홈트 챌린지',
    type: '쇼츠',
    platform: '유튜브',
    reach: 44000,
    likes: 1980,
    comments: 280,
    saves: 660,
    shares: 520,
    engRate: 6.6,   // (1980+280+660)/44000 × 100
    thumbnailClass: 'bg-green-300',
  },
]
