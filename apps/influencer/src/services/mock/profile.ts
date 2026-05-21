// Mock data — replace with API calls when backend is ready
import { mockMyCampaigns } from './campaigns'

export const ACTIVITY_FIELDS = [
  '헬스/웨이트', '러닝', '요가', '필라테스', '바레', '크로스핏', '하이록스(하이브리드 트레이닝)', 'F45', '파워리프팅', '기타',
]

export const INFLUENCER_TYPES = [
  { value: 'individual', label: '개인 인플루언서' },
  { value: 'sports_crew', label: '스포츠크루·커뮤니티' },
  { value: 'wellness_center', label: '웰니스·피트니스 센터' },
  { value: 'event', label: '대회·이벤트' },
]

export interface InfluencerProfile {
  name: string
  email: string
  instagram: string
  /** 인스타그램 연결 여부. true면 mockInstaStats 노출 가능, false면 SNS 연결 유도 */
  instagramConnected: boolean
  bio: string
  marketing: boolean
  selectedFields: string[]
  influencerType: string
  phone: string
  hasBusinessReg: boolean
  hasBankAccount: boolean
}

export interface CampaignSummary {
  applied: number     // 지원완료 (검토 대기)
  ongoing: number     // 참여중 (콘텐츠대기·검수중)
  completed: number   // 참여완료
  eliminated: number  // 탈락(미선정)
}

export const mockProfile: InfluencerProfile = {
  name: '김찬기',
  email: 'chanki@example.com',
  instagram: 'chanstyler',
  instagramConnected: true,
  bio: '헬스·필라테스 전문 인플루언서 | 건강한 라이프스타일을 공유합니다',
  marketing: true,
  selectedFields: ['헬스/웨이트', '필라테스'],
  influencerType: 'individual',
  phone: '010-1234-5678',
  hasBusinessReg: true,
  hasBankAccount: false,
}

/**
 * Home 카드 노출용 카운트.
 * **반드시 `mockMyCampaigns`에서 derive** — 정적 객체로 두면 Home 카드와 MyCampaign
 * 실제 카운트가 어긋난다(이전 버전의 거짓말 카운트 사례).
 */
export const mockCampaignSummary: CampaignSummary = {
  applied:    mockMyCampaigns.filter(c => c.status === '지원완료').length,
  ongoing:    mockMyCampaigns.filter(c => ['검토중', '콘텐츠대기', '검수중'].includes(c.status)).length,
  completed:  mockMyCampaigns.filter(c => c.status === '완료').length,
  eliminated: mockMyCampaigns.filter(c => c.status === '미선정').length,
}

export interface InstaStats {
  followers: number
  posts: number
  avgLikes: number
  avgComments: number
  engagementRate: number
  lastActive: string
  /** 마지막 데이터 업데이트 시각 — 원본 mypage L1326-1330 lastUpdatedTime */
  lastUpdated: string
}

// 시연 시점 기준 2시간 전 — fmtRelativeDate로 동적 표기
const TWO_HOURS_AGO_ISO = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
const FIFTEEN_MIN_AGO_ISO = new Date(Date.now() - 15 * 60 * 1000).toISOString()

export const mockInstaStats: InstaStats = {
  followers: 8700,
  posts: 142,
  avgLikes: 312,
  avgComments: 18,
  engagementRate: 4.1,
  lastActive: TWO_HOURS_AGO_ISO,
  lastUpdated: FIFTEEN_MIN_AGO_ISO,
}
