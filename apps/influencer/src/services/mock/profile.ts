// Mock data — replace with API calls when backend is ready

export const ACTIVITY_FIELDS = [
  '헬스/웨이트', '러닝', '요가', '필라테스', '바레', '크로스핏', '하이록스', 'F45', '파워리프팅', '기타',
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
  email: 'chanki@wellink.co.kr',
  instagram: 'chanstyler',
  bio: '헬스·필라테스 전문 인플루언서 | 건강한 라이프스타일을 공유합니다',
  marketing: true,
  selectedFields: ['헬스/웨이트', '필라테스'],
  influencerType: 'individual',
  phone: '010-1234-5678',
  hasBusinessReg: true,
  hasBankAccount: false,
}

export const mockCampaignSummary: CampaignSummary = {
  applied: 2,
  ongoing: 2,
  completed: 1,
  eliminated: 1,
}

export interface InstaStats {
  followers: number
  posts: number
  avgLikes: number
  avgComments: number
  engagementRate: number
  lastActive: string
}

export const mockInstaStats: InstaStats = {
  followers: 8700,
  posts: 142,
  avgLikes: 312,
  avgComments: 18,
  engagementRate: 4.1,
  lastActive: '2시간 전',
}
