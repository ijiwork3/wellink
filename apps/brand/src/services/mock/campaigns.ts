// Mock data — replace with API calls when backend is ready
// Usage: import { mockCampaigns, mockCampaignDetail, ... } from '@/services/mock/campaigns'

import { getDDay } from '@wellink/ui'

export interface Campaign {
  id: number
  name: string
  status: '모집중' | '대기중' | '종료'
  total: number
  current: number
  deadline: string
  budget: string
  category: string
  platform: string
  reach: number
  engRate: number
  thumbnail: null
}

export const mockCampaigns: Campaign[] = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8, deadline: '2026-04-28', budget: '2,000,000', category: '피트니스', platform: 'Instagram', reach: 48200, engRate: 4.2, thumbnail: null },
  { id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0, deadline: '2026-05-05', budget: '1,500,000', category: '뷰티/웰니스', platform: 'Instagram', reach: 0, engRate: 0, thumbnail: null },
  { id: 3, name: '여름 홈트 챌린지', status: '종료', total: 20, current: 20, deadline: '2026-04-01', budget: '3,200,000', category: '피트니스', platform: 'Instagram + YouTube', reach: 128000, engRate: 5.8, thumbnail: null },
  { id: 4, name: '프로틴 파우더 리뷰', status: '종료', total: 8, current: 8, deadline: '2026-03-20', budget: '800,000', category: '헬스/영양', platform: 'Instagram', reach: 62400, engRate: 3.9, thumbnail: null },
]

export interface CampaignInfluencer {
  id: number
  name: string
  status: string
  content: string
  deadline: string
  avatar: string
  dday: string
}

export interface CampaignDetail {
  name: string
  status: string
  category: string
  budget: string
  period: string
  headcount: number
  description: string
  influencers: CampaignInfluencer[]
}

export const mockCampaignDetail: Record<string, CampaignDetail> = {
  '1': {
    name: '봄 요가 프로모션',
    status: '모집중',
    category: '피트니스',
    budget: '2,000,000원',
    period: '2026-03-25 ~ 2026-04-25',
    headcount: 15,
    description: '봄 시즌을 맞아 요가·필라테스 인플루언서와 함께하는 브랜드 캠페인입니다. 제품 체험 후 솔직한 후기 콘텐츠를 제작합니다.',
    influencers: [
      { id: 1, name: '이창민', status: '진행중', content: '인스타그램 릴스 1건', deadline: '2026-04-20', avatar: 'bg-pink-200', dday: getDDay('2026-04-20').label },
      { id: 2, name: '김가애', status: '검수중', content: '인스타그램 릴스 1건', deadline: '2026-05-08', avatar: 'bg-yellow-200', dday: getDDay('2026-05-08').label },
      { id: 3, name: '박리나', status: '완료', content: '인스타그램 피드 2건', deadline: '2026-04-18', avatar: 'bg-purple-200', dday: getDDay('2026-04-18').label },
      { id: 4, name: '민경완', status: '콘텐츠대기', content: '인스타그램 스토리 3건', deadline: '2026-04-22', avatar: 'bg-blue-200', dday: getDDay('2026-04-22').label },
    ],
  },
  '2': {
    name: '비건 신제품 론칭',
    status: '대기중',
    category: '뷰티/웰니스',
    budget: '1,500,000원',
    period: '2026-04-10 ~ 2026-05-10',
    headcount: 10,
    description: '비건 스킨케어 신제품 론칭을 알리는 캠페인입니다. 뷰티/웰니스 카테고리 인플루언서 대상.',
    influencers: [
      { id: 5, name: '장영훈', status: '대기중', content: '미정', deadline: '2026-04-18', avatar: 'bg-green-200', dday: getDDay('2026-04-18').label },
    ],
  },
}

export interface Applicant {
  id: number
  name: string
  followers: string
  engagement: number
  fitScore: number
  appliedAt: string
  avatar: string
}

export const mockApplicants: Applicant[] = [
  { id: 101, name: '최은지', followers: '12.3K', engagement: 4.2, fitScore: 92, appliedAt: '2026-04-17', avatar: 'bg-rose-200' },
  { id: 102, name: '한준영', followers: '8.7K', engagement: 5.1, fitScore: 87, appliedAt: '2026-04-18', avatar: 'bg-sky-200' },
  { id: 103, name: '오다은', followers: '22.1K', engagement: 3.8, fitScore: 78, appliedAt: '2026-04-20', avatar: 'bg-amber-200' },
]

export interface SelectedInfluencer {
  id: number
  name: string
  followers: string
  engagement: number
  fitScore: number
  selectedAt: string
  avatar: string
}

export const mockSelectedInfluencers: SelectedInfluencer[] = [
  { id: 201, name: '이창민', followers: '8.7K', engagement: 4.1, fitScore: 92, selectedAt: '2026-04-21', avatar: 'bg-pink-200' },
  { id: 202, name: '김가애', followers: '18.9K', engagement: 4.2, fitScore: 88, selectedAt: '2026-04-22', avatar: 'bg-yellow-200' },
]

export interface RegisteredContent {
  id: number
  thumbnail: string
  influencer: string
  type: string
  reach: number
  likes: number
  comments: number
  saves: number
}

export const mockRegisteredContents: RegisteredContent[] = [
  { id: 1, thumbnail: 'bg-gradient-to-br from-pink-100 to-pink-200', influencer: '이창민', type: '릴스', reach: 12400, likes: 890, comments: 42, saves: 156 },
  { id: 2, thumbnail: 'bg-gradient-to-br from-yellow-100 to-yellow-200', influencer: '김가애', type: '피드', reach: 8100, likes: 540, comments: 28, saves: 89 },
  { id: 3, thumbnail: 'bg-gradient-to-br from-purple-100 to-purple-200', influencer: '박리나', type: '스토리', reach: 5200, likes: 380, comments: 15, saves: 62 },
  { id: 4, thumbnail: 'bg-gradient-to-br from-blue-100 to-blue-200', influencer: '민경완', type: '피드', reach: 6700, likes: 420, comments: 31, saves: 78 },
]
