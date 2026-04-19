// Mock data — replace with API calls when backend is ready

export const ACTIVITY_FIELDS = [
  '헬스', '필라테스', '요가', '크로스핏', '수영', '스포츠', '기타', '아웃도어(배낭여행·트레킹)',
]

export interface InfluencerProfile {
  name: string
  instagram: string
  marketing: boolean
  selectedFields: string[]
}

export const mockProfile: InfluencerProfile = {
  name: '김찬기',
  instagram: 'chanstyler',
  marketing: true,
  selectedFields: ['헬스', '필라테스'],
}
