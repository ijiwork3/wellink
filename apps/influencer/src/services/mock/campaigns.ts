// Mock data — replace with API calls when backend is ready

export interface CampaignQuestion {
  id: string
  question: string
  required: boolean
  type: 'text' | 'radio'
  options?: string[]
}

export interface Campaign {
  id: number
  brand: string
  name: string
  channel: string
  category: string
  status: string
  applyEnd: string
  postEnd: string
  image: string
  description?: string
  reward?: string
  rewardAmount?: number
  headcount: number
  applied: number
  conditions?: string[]
  type?: 'delivery' | 'visit'
  keywords?: string[]
  questions?: CampaignQuestion[]
}

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    brand: '그린푸드',
    name: '비건 단백질 쉐이크 체험단 모집',
    channel: '인스타그램',
    category: '피트니스·스포츠',
    status: '모집중',
    applyEnd: '2026-04-28',
    postEnd: '2026-05-08',
    image: '🥗',
    description: '그린푸드의 신제품 비건 단백질 쉐이크를 체험하고 솔직한 리뷰를 작성해 주세요.',
    reward: '제품 1개월분 + 활동비 5만원',
    rewardAmount: 50000,
    headcount: 15,
    applied: 8,
    conditions: ['인스타그램 팔로워 1,000명 이상', '피드 게시물 1개 필수', '스토리 2개 이상'],
    type: 'delivery',
    keywords: ['그린푸드', '비건프로틴', '식물성단백질', '웰니스'],
    questions: [
      { id: 'q1', question: '현재 운동 루틴을 간략히 알려주세요.', required: true, type: 'text' },
      { id: 'q2', question: '비건 식단을 실천하고 계신가요?', required: true, type: 'radio', options: ['네, 완전 비건입니다', '일부 실천 중입니다', '아니오'] },
    ],
  },
  {
    id: 2,
    brand: 'SMILEATO',
    name: '크로스핏 보충제 리뷰어 모집',
    channel: '인스타그램',
    category: '피트니스·스포츠',
    status: '마감임박',
    applyEnd: '2026-04-25',
    postEnd: '2026-05-10',
    image: '💪',
    description: 'SMILEATO 스포츠 보충제 라인업을 직접 체험하고 크리에이티브한 콘텐츠를 제작해 주세요.',
    reward: '보충제 풀패키지 + 활동비 10만원',
    rewardAmount: 100000,
    headcount: 10,
    applied: 9,
    conditions: ['운동 관련 콘텐츠 계정', '인스타그램 또는 유튜브 채널 보유', '피드 또는 릴스 1개 이상'],
    type: 'delivery',
    keywords: ['SMILEATO', '크로스핏', '보충제', '스포츠영양'],
    questions: [
      { id: 'q1', question: '주로 어떤 운동을 하시나요?', required: true, type: 'text' },
    ],
  },
  {
    id: 3,
    brand: 'ENUF',
    name: '프리미엄 요가매트 체험단',
    channel: '인스타그램',
    category: '피트니스·스포츠',
    status: '모집중',
    applyEnd: '2026-05-18',
    postEnd: '2026-05-28',
    image: '🧘',
    description: 'ENUF 프리미엄 요가매트의 편안한 그립감과 내구성을 직접 체험해 보세요.',
    reward: '요가매트 제공 (7만원 상당)',
    rewardAmount: 70000,
    headcount: 5,
    applied: 3,
    conditions: ['요가 또는 필라테스 관련 계정', '피드 게시물 1개 이상', '제품 태그 필수'],
    type: 'delivery',
    keywords: ['ENUF', '요가매트', '필라테스', '홈트'],
  },
  {
    id: 4,
    brand: '웰링크뷰티',
    name: '웰니스 스킨케어 리뷰어',
    channel: '인스타그램',
    category: '뷰티·패션',
    status: '모집중',
    applyEnd: '2026-05-07',
    postEnd: '2026-05-17',
    image: '✨',
    description: '웰링크뷰티의 신규 웰니스 스킨케어 라인을 체험하고 진솔한 리뷰를 남겨주세요.',
    reward: '스킨케어 세트 (10만원 상당)',
    rewardAmount: 100000,
    headcount: 20,
    applied: 7,
    conditions: ['뷰티/라이프스타일 계정', '피드 게시물 2개 이상', '브랜드 멘션 필수'],
  },
  {
    id: 5,
    brand: '프리코',
    name: '유기농 샐러드 키트 체험',
    channel: '네이버 블로그',
    category: '맛집·푸드',
    status: '모집중',
    applyEnd: '2026-04-22',
    postEnd: '2026-05-02',
    image: '🥬',
    description: '프리코의 신선한 유기농 샐러드 키트를 매일 즐기고 블로그에 체험기를 남겨주세요.',
    reward: '샐러드 키트 4주분 (8만원 상당)',
    rewardAmount: 80000,
    headcount: 8,
    applied: 4,
    conditions: ['네이버 블로그 이웃 500명 이상', '포스팅 1개 이상', '사진 5장 이상'],
  },
  {
    id: 6,
    brand: '필라핏',
    name: '홈트 스트레칭 밴드 리뷰',
    channel: '유튜브',
    category: '피트니스·스포츠',
    status: '모집중',
    applyEnd: '2026-04-30',
    postEnd: '2026-05-15',
    image: '🏋️',
    description: '필라핏 홈트 스트레칭 밴드 세트를 활용한 운동 영상을 제작해 주세요.',
    reward: '스트레칭 밴드 세트 + 활동비 5만원',
    rewardAmount: 50000,
    headcount: 6,
    applied: 2,
    conditions: ['유튜브 구독자 500명 이상', '운동 영상 3개 이상 보유', '영상 1개 이상 제작'],
  },
  {
    id: 7,
    brand: '모닝핏',
    name: '아침 루틴 라이프스타일 캠페인',
    channel: '인스타그램',
    category: '라이프스타일',
    status: '모집중',
    applyEnd: '2026-05-10',
    postEnd: '2026-05-25',
    image: '☀️',
    description: '모닝핏의 아침 루틴 제품군을 체험하고 건강한 아침 라이프를 공유해 주세요.',
    reward: '모닝 키트 + 활동비 6만원',
    rewardAmount: 60000,
    headcount: 12,
    applied: 5,
    conditions: ['라이프스타일 계정', '팔로워 2,000명 이상', '피드 1개 + 스토리 3개'],
  },
  {
    id: 8,
    brand: '베베핏',
    name: '유아 건강식 체험단',
    channel: '인스타그램',
    category: '육아·펫',
    status: '모집중',
    applyEnd: '2026-05-15',
    postEnd: '2026-05-30',
    image: '🍼',
    description: '베베핏 유아 건강 이유식 제품을 직접 사용해보고 솔직한 육아 리뷰를 남겨주세요.',
    reward: '이유식 1개월 패키지 (9만원 상당)',
    rewardAmount: 90000,
    headcount: 10,
    applied: 3,
    conditions: ['육아/맘 계정', '0~36개월 자녀 보유', '피드 1개 이상', '팔로워 1,000명 이상'],
  },
]

// MyCampaign 페이지용 인플루언서 참여 캠페인
export type MyCampaignStatus = '지원완료' | '검토중' | '콘텐츠대기' | '검수중' | '완료' | '미선정'

export interface MyCampaign {
  id: string
  name: string
  brand: string
  channel: string
  appliedAt: string
  deadline: string
  status: MyCampaignStatus
  progress: string
  reward: string
  rewardAmount: number
  contentDeadline?: string
  postUrl?: string
}

export const mockMyCampaigns: MyCampaign[] = [
  { id: '1', name: '프로틴 파워 챌린지', brand: '뉴트리션랩', channel: '인스타그램', appliedAt: '2026-03-15', deadline: '2026-04-26', status: '콘텐츠대기', progress: '콘텐츠를 제출해 주세요', reward: '80,000원', rewardAmount: 80000, contentDeadline: '2026-04-26' },
  { id: '2', name: '필라테스 스튜디오 체험', brand: '바디앤핏', channel: '인스타그램', appliedAt: '2026-03-10', deadline: '2026-04-30', status: '지원완료', progress: '브랜드 검토 중', reward: '50,000원', rewardAmount: 50000 },
  { id: '3', name: '아웃도어 장비 리뷰', brand: '아웃도어킹', channel: '네이버 블로그', appliedAt: '2026-02-28', deadline: '2026-04-10', status: '검수중', progress: '게시 콘텐츠 확인 중', reward: '120,000원', rewardAmount: 120000, postUrl: 'https://blog.naver.com/chanstyler/12345' },
  { id: '4', name: '헬스 보충제 캠페인', brand: 'SMILEATO', channel: '인스타그램', appliedAt: '2026-02-10', deadline: '2026-03-20', status: '완료', progress: '정산 가능', reward: '95,000원', rewardAmount: 95000 },
  { id: '5', name: '요가 스트레칭 밴드', brand: '필라핏', channel: '인스타그램', appliedAt: '2026-03-01', deadline: '2026-04-05', status: '미선정', progress: '미선정', reward: '60,000원', rewardAmount: 60000 },
]

// Home 페이지 북마크 캠페인
export interface BookmarkedCampaign {
  id: string
  name: string
  brand: string
  category: string
  channel: string
  deadline: string
  reward: string
  rewardAmount: number
  headcount: number
  applied: number
  status: '모집중' | '마감임박' | '종료'
  thumbnailBg: string
  thumbnailEmoji: string
}

export const mockBookmarkedCampaigns: BookmarkedCampaign[] = [
  { id: '1', name: '비건 단백질 쉐이크 체험단 모집', brand: '그린푸드', category: '피트니스·스포츠', channel: '인스타그램', deadline: '2026-04-28', reward: '제품 + 활동비 5만원', rewardAmount: 50000, headcount: 15, applied: 8, status: '모집중', thumbnailBg: '#ede9fe', thumbnailEmoji: '🥗' },
  { id: '2', name: '크로스핏 보충제 리뷰어 모집', brand: 'SMILEATO', category: '피트니스·스포츠', channel: '인스타그램', deadline: '2026-04-25', reward: '보충제 풀패키지 + 10만원', rewardAmount: 100000, headcount: 10, applied: 9, status: '마감임박', thumbnailBg: '#dcfce7', thumbnailEmoji: '💪' },
  { id: '3', name: '프리미엄 요가매트 체험단', brand: 'ENUF', category: '피트니스·스포츠', channel: '인스타그램', deadline: '2026-05-18', reward: '요가매트 (7만원 상당)', rewardAmount: 70000, headcount: 5, applied: 3, status: '모집중', thumbnailBg: '#dbeafe', thumbnailEmoji: '🧘' },
]

export const BROWSE_CATEGORIES = ['전체', '뷰티·패션', '피트니스·스포츠', '맛집·푸드', '라이프스타일', '육아·펫']
