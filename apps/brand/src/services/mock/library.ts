// Mock data — replace with API calls when backend is ready

export type LibraryPlatform = '인스타그램' | '유튜브' | '네이버 블로그' | '틱톡'
export type LibraryPostType = '피드' | '릴스' | '스토리' | '영상' | '쇼츠'

export interface LibraryContent {
  id: number
  creator: string
  campaign: string
  type?: LibraryPostType
  platform: LibraryPlatform
  date: string
  reach: number
  likes: number
  comments: number
  saves: number
  shareRate: number
  engagementRate: number
  status: '승인' | '검수중' | '대기중' | '반려'
  thumbnailClass: string
}

export const mockLibraryContents: LibraryContent[] = [
  { id: 1, creator: '이창민', campaign: '봄 요가 프로모션', type: '릴스', platform: '인스타그램', date: '2026-04-05', reach: 4200, likes: 312, comments: 48, saves: 67, shareRate: 3.2, engagementRate: 10.2, status: '승인', thumbnailClass: 'bg-pink-300' },
  { id: 2, creator: '김가애', campaign: '봄 요가 프로모션', type: '피드', platform: '인스타그램', date: '2026-04-03', reach: 8100, likes: 540, comments: 92, saves: 134, shareRate: 4.1, engagementRate: 9.5, status: '승인', thumbnailClass: 'bg-blue-300' },
  { id: 3, creator: '박리나', campaign: '봄 요가 프로모션', type: '스토리', platform: '인스타그램', date: '2026-04-01', reach: 2900, likes: 180, comments: 23, saves: 18, shareRate: 1.8, engagementRate: 7.6, status: '승인', thumbnailClass: 'bg-violet-300' },
  { id: 4, creator: '민경완', campaign: '봄 요가 프로모션', type: '피드', platform: '인스타그램', date: '2026-03-28', reach: 6700, likes: 420, comments: 67, saves: 89, shareRate: 2.9, engagementRate: 8.6, status: '검수중', thumbnailClass: 'bg-red-300' },
  { id: 5, creator: '장영훈', campaign: '비건 신제품 론칭', type: '릴스', platform: '인스타그램', date: '2026-03-25', reach: 1200, likes: 88, comments: 12, saves: 9, shareRate: 1.2, engagementRate: 9.1, status: '대기중', thumbnailClass: 'bg-yellow-200' },
  { id: 6, creator: '한서연', campaign: '비건 신제품 론칭', type: '쇼츠', platform: '유튜브', date: '2026-04-06', reach: 15200, likes: 1240, comments: 189, saves: 312, shareRate: 5.8, engagementRate: 11.4, status: '승인', thumbnailClass: 'bg-emerald-300' },
  { id: 7, creator: '오진석', campaign: '여름 캠페인', platform: '네이버 블로그', date: '2026-04-07', reach: 3400, likes: 210, comments: 34, saves: 45, shareRate: 2.1, engagementRate: 8.5, status: '검수중', thumbnailClass: 'bg-orange-300' },
  { id: 8, creator: '정예린', campaign: '여름 캠페인', type: '릴스', platform: '인스타그램', date: '2026-04-08', reach: 9800, likes: 870, comments: 142, saves: 198, shareRate: 4.7, engagementRate: 12.3, status: '승인', thumbnailClass: 'bg-indigo-300' },
  { id: 9, creator: '최다은', campaign: '비건 신제품 론칭', type: '스토리', platform: '인스타그램', date: '2026-03-30', reach: 1800, likes: 95, comments: 11, saves: 14, shareRate: 1.0, engagementRate: 6.7, status: '대기중', thumbnailClass: 'bg-rose-300' },
  { id: 10, creator: '김태우', campaign: '여름 캠페인', type: '쇼츠', platform: '유튜브', date: '2026-04-02', reach: 11400, likes: 920, comments: 156, saves: 230, shareRate: 5.2, engagementRate: 11.5, status: '승인', thumbnailClass: 'bg-green-300' },
]

export const CONTENT_TYPE_COLORS: Record<string, string> = {
  '피드': 'bg-blue-100 text-blue-700',
  '릴스': 'bg-pink-100 text-pink-700',
  '스토리': 'bg-purple-100 text-purple-700',
  '영상': 'bg-orange-100 text-orange-700',
  '쇼츠': 'bg-emerald-100 text-emerald-700',
}

export const PLATFORM_ICONS: Record<LibraryPlatform, string> = {
  '인스타그램': '📷',
  '유튜브': '▶',
  '네이버 블로그': '📝',
  '틱톡': '🎵',
}

export const LIBRARY_CAMPAIGN_OPTIONS = [
  { label: '전체 캠페인', value: '' },
  { label: '봄 요가 프로모션', value: '봄 요가 프로모션' },
  { label: '비건 신제품 론칭', value: '비건 신제품 론칭' },
  { label: '여름 홈트 챌린지', value: '여름 홈트 챌린지' },
  { label: '프로틴 파우더 리뷰', value: '프로틴 파우더 리뷰' },
]
