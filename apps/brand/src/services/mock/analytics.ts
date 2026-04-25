// Mock data — replace with API calls when backend is ready

export type Period = '일간' | '주간' | '월간' | '연간'

// AdPerformance 페이지 KPI
export interface AdKPI {
  label: string
  value: string | number
  sub: string
  trend: number
  positive: boolean
}

export const mockAdKPIByPeriod: Record<Period, AdKPI[]> = {
  일간: [
    { label: '총 노출', value: '12,400', sub: '어제 대비', trend: 5.2, positive: true },
    { label: '클릭수', value: '847', sub: '어제 대비', trend: 3.1, positive: true },
    { label: 'CTR', value: '6.83%', sub: '어제 대비', trend: -0.4, positive: false },
    { label: '광고비', value: '48,000원', sub: '일 예산 5만원', trend: -4, positive: true },
  ],
  주간: [
    { label: '총 노출', value: '86,200', sub: '지난주 대비', trend: 12.4, positive: true },
    { label: '클릭수', value: '5,920', sub: '지난주 대비', trend: 8.5, positive: true },
    { label: 'CTR', value: '6.87%', sub: '지난주 대비', trend: 0.2, positive: true },
    { label: '광고비', value: '336,000원', sub: '주 예산 35만원', trend: -4, positive: true },
  ],
  월간: [
    { label: '총 노출', value: '372,000', sub: '지난달 대비', trend: 18.4, positive: true },
    { label: '클릭수', value: '25,600', sub: '지난달 대비', trend: 11.2, positive: true },
    { label: 'CTR', value: '6.88%', sub: '지난달 대비', trend: -0.1, positive: false },
    { label: '광고비', value: '1,450,000원', sub: '월 예산 150만원', trend: -3.3, positive: true },
  ],
  연간: [
    { label: '총 노출', value: '4,464,000', sub: '전년 대비', trend: 41.2, positive: true },
    { label: '클릭수', value: '307,200', sub: '전년 대비', trend: 32.1, positive: true },
    { label: 'CTR', value: '6.88%', sub: '전년 대비', trend: 1.2, positive: true },
    { label: '광고비', value: '17,400,000원', sub: '연 예산 1800만원', trend: -3.3, positive: true },
  ],
}

export interface MetaCampaign {
  id: number
  name: string
  status: '게재중' | '일시중지' | '종료'
  budget: string
  reach: number
  clicks: number
  ctr: number
  cpc: string
}

export const mockMetaCampaigns: MetaCampaign[] = [
  { id: 1, name: '봄 시즌 인스타그램 피드', status: '게재중', budget: '50,000원/일', reach: 12400, clicks: 847, ctr: 6.83, cpc: '57원' },
  { id: 2, name: '신규 고객 리타겟팅', status: '게재중', budget: '30,000원/일', reach: 8200, clicks: 612, ctr: 7.46, cpc: '49원' },
  { id: 3, name: '브랜드 인지도 캠페인', status: '일시중지', budget: '100,000원/일', reach: 42000, clicks: 1840, ctr: 4.38, cpc: '54원' },
  { id: 4, name: '여름 사전예약 광고', status: '종료', budget: '80,000원/일', reach: 31600, clicks: 2480, ctr: 7.85, cpc: '32원' },
]

// ProfileInsight 페이지 KPI
export const mockProfileKPIByPeriod: Record<Period, { label: string; value: string; change: number }[]> = {
  일간: [
    { label: '팔로워', value: '12,847', change: 0.3 },
    { label: '도달', value: '3,402', change: 5.2 },
    { label: '참여율', value: '4.12%', change: 0.8 },
    { label: '인상', value: '8,940', change: 2.1 },
  ],
  주간: [
    { label: '팔로워', value: '12,847', change: 2.1 },
    { label: '도달', value: '23,814', change: 12.4 },
    { label: '참여율', value: '4.12%', change: 0.3 },
    { label: '인상', value: '62,580', change: 8.7 },
  ],
  월간: [
    { label: '팔로워', value: '12,847', change: 8.2 },
    { label: '도달', value: '102,060', change: 18.4 },
    { label: '참여율', value: '4.12%', change: -0.5 },
    { label: '인상', value: '267,960', change: 15.2 },
  ],
  연간: [
    { label: '팔로워', value: '12,847', change: 41.2 },
    { label: '도달', value: '1,224,720', change: 62.1 },
    { label: '참여율', value: '4.12%', change: 1.2 },
    { label: '인상', value: '3,215,520', change: 55.8 },
  ],
}

// ViralMetrics 페이지
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
  engRate: number
  thumbnailClass: string
}

export const mockViralContents: ViralContent[] = [
  { id: 1, creator: '이창민', campaign: '봄 요가 프로모션', type: '릴스', platform: '인스타그램', reach: 42000, likes: 3200, comments: 248, saves: 892, shares: 412, engRate: 11.3, thumbnailClass: 'bg-pink-300' },
  { id: 2, creator: '김가애', campaign: '봄 요가 프로모션', type: '피드', platform: '인스타그램', reach: 31000, likes: 2400, comments: 180, saves: 640, shares: 280, engRate: 10.6, thumbnailClass: 'bg-blue-300' },
  { id: 3, creator: '한서연', campaign: '비건 신제품 론칭', type: '쇼츠', platform: '유튜브', reach: 58000, likes: 4200, comments: 620, saves: 1120, shares: 780, engRate: 11.6, thumbnailClass: 'bg-emerald-300' },
  { id: 4, creator: '정예린', campaign: '여름 홈트 챌린지', type: '릴스', platform: '인스타그램', reach: 27000, likes: 1980, comments: 142, saves: 520, shares: 198, engRate: 10.5, thumbnailClass: 'bg-indigo-300' },
  { id: 5, creator: '김태우', campaign: '여름 홈트 챌린지', type: '쇼츠', platform: '유튜브', reach: 44000, likes: 3600, comments: 480, saves: 980, shares: 620, engRate: 12.0, thumbnailClass: 'bg-green-300' },
]
