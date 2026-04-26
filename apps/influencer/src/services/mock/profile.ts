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
  marketing: boolean
  selectedFields: string[]
  influencerType: string
  phone: string
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
  marketing: true,
  selectedFields: ['헬스/웨이트', '필라테스'],
  influencerType: 'individual',
  phone: '010-1234-5678',
}

export const mockCampaignSummary: CampaignSummary = {
  applied: 2,
  ongoing: 2,
  completed: 1,
  eliminated: 1,
}
