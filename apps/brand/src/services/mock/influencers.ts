// Mock data — replace with API calls when backend is ready

export interface Influencer {
  id: number
  name: string
  platform: string
  followers: number
  engagement: number
  posts: number
  authentic: number
  category: string[]
  lastActive: string
  fitScore: number
}

export const mockInfluencers: Influencer[] = [
  { id: 1, name: '이창민', platform: '인스타그램', followers: 8700, engagement: 4.1, posts: 234, authentic: 92.3, category: ['피트니스', '크로스핏'], lastActive: '2일 전', fitScore: 92 },
  { id: 2, name: '민경완', platform: '인스타그램', followers: 120000, engagement: 3.8, posts: 412, authentic: 78.5, category: ['운동'], lastActive: '1일 전', fitScore: 78 },
  { id: 3, name: '장영훈', platform: '인스타그램', followers: 960, engagement: 2.8, posts: 89, authentic: 95.1, category: ['필라테스'], lastActive: '5일 전', fitScore: 65 },
  { id: 4, name: '김가애', platform: '인스타그램', followers: 18900, engagement: 4.2, posts: 567, authentic: 88.7, category: ['요가'], lastActive: '오늘', fitScore: 88 },
  { id: 5, name: '박리나', platform: '인스타그램', followers: 7120, engagement: 2.23, posts: 178, authentic: 85.2, category: ['웰니스'], lastActive: '3일 전', fitScore: 71 },
]

export interface ManagedInfluencer {
  id: number
  name: string
  handle: string
  platform: string
  followers: string
  fitScore: number
  group: string
  bookmarked: boolean
  avatar: string
}

export const mockManagedInfluencers: ManagedInfluencer[] = [
  { id: 1, name: '이창민', handle: '@changmin_fit', platform: '인스타그램', followers: '8.7K', fitScore: 92, group: '우수 인플루언서', bookmarked: true, avatar: 'bg-pink-200' },
  { id: 2, name: '김가애', handle: '@gahee_yoga', platform: '인스타그램', followers: '18.9K', fitScore: 88, group: '우수 인플루언서', bookmarked: true, avatar: 'bg-yellow-200' },
  { id: 3, name: '박리나', handle: '@lina_wellness', platform: '인스타그램', followers: '7.1K', fitScore: 71, group: '미분류', bookmarked: false, avatar: 'bg-purple-200' },
]

// AI 추천 인플루언서 (AIListup 페이지용)
export interface AIRecommendedInfluencer {
  id: number
  name: string
  handle: string
  platform: string
  followers: string
  engagement: number
  fitScore: number
  categories: string[]
  avatar: string
  reason: string
}

export const mockAIRecommendedInfluencers: AIRecommendedInfluencer[] = [
  { id: 1, name: '이창민', handle: '@changmin_fit', platform: '인스타그램', followers: '8.7K', engagement: 4.1, fitScore: 92, categories: ['피트니스', '크로스핏'], avatar: 'bg-pink-200', reason: '웰니스 카테고리 진성 팔로워 비율 높음' },
  { id: 2, name: '김가애', handle: '@gahee_yoga', platform: '인스타그램', followers: '18.9K', engagement: 4.2, fitScore: 88, categories: ['요가', '웰니스'], avatar: 'bg-yellow-200', reason: '요가·필라테스 타겟 오버랩 85%' },
  { id: 3, name: '박리나', handle: '@lina_wellness', platform: '인스타그램', followers: '7.1K', engagement: 2.2, fitScore: 71, categories: ['웰니스'], avatar: 'bg-purple-200', reason: '니치 웰니스 콘텐츠, 구매전환율 우수' },
]

// 필터 옵션 상수 (데이터 정책 v1 기준)
export const CATEGORY_OPTIONS = [
  { label: '카테고리', value: '' },
  { label: '피트니스', value: '피트니스' },
  { label: '요가', value: '요가' },
  { label: '웰니스', value: '웰니스' },
  { label: '필라테스', value: '필라테스' },
  { label: '운동', value: '운동' },
  { label: '크로스핏', value: '크로스핏' },
]

// 핏스코어 구간: 85+ 우수(green) / 70~84 보통(amber) / 70미만 개선필요(gray)
export const FIT_SCORE_OPTIONS = [
  { label: '핏 스코어', value: '' },
  { label: '85점 이상 (우수)', value: '85+' },
  { label: '70점 이상 (보통)', value: '70+' },
  { label: '70점 미만 (개선필요)', value: 'under70' },
]

// 참여율 구간: 4%+ 높음 / 2~4% 보통 / 2% 미만 낮음
export const ENGAGEMENT_OPTIONS = [
  { label: '참여율', value: '' },
  { label: '높음 (4% 이상)', value: 'high' },
  { label: '보통 (2~4%)', value: 'mid' },
  { label: '낮음 (2% 미만)', value: 'low' },
]

// 팔로워 Tier: 나노 ~1만 / 마이크로 1만~10만 / 매크로 10만~100만 / 메가 100만+
export const FOLLOWER_TIER_OPTIONS = [
  { label: '팔로워급', value: '' },
  { label: '나노 (~1만)', value: 'nano' },
  { label: '마이크로 (1만~10만)', value: 'micro' },
  { label: '매크로 (10만~100만)', value: 'macro' },
  { label: '메가 (100만+)', value: 'mega' },
]
