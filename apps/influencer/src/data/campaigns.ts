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
  conditions?: string[]
}

export const campaigns: Campaign[] = [
  {
    id: 1,
    brand: '그린푸드',
    name: '비건 단백질 쉐이크 체험단 모집',
    channel: '인스타그램',
    category: '맛집/푸드',
    status: '모집중',
    applyEnd: '2026-04-20',
    postEnd: '2026-04-30',
    image: '🥗',
    description: '그린푸드의 신제품 비건 단백질 쉐이크를 체험하고 솔직한 리뷰를 작성해 주세요.',
    reward: '제품 1개월분 무료 제공',
    conditions: ['인스타그램 팔로워 1000명 이상', '피드 게시물 1개 필수', '스토리 2개 이상'],
  },
  {
    id: 2,
    brand: 'SMILEATO',
    name: '크로스핏 보충제 리뷰어 모집',
    channel: '인스타그램/유튜브',
    category: '어필/스포츠',
    status: '모집중',
    applyEnd: '2026-04-25',
    postEnd: '2026-05-10',
    image: '💪',
    description: 'SMILEATO 스포츠 보충제 라인업을 직접 체험하고 크리에이티브한 콘텐츠를 제작해 주세요.',
    reward: '보충제 풀패키지 제공 + 활동비 10만원',
    conditions: ['운동 관련 콘텐츠 계정', '인스타그램 또는 유튜브 채널 보유', '영상 또는 피드 1개 이상'],
  },
  {
    id: 3,
    brand: 'ENUF',
    name: '프리미엄 요가매트 체험단',
    channel: '인스타그램',
    category: '어필/스포츠',
    status: '모집중',
    applyEnd: '2026-04-18',
    postEnd: '2026-04-28',
    image: '🧘',
    description: 'ENUF 프리미엄 요가매트의 편안한 그립감과 내구성을 직접 체험해 보세요.',
    reward: '요가매트 1개 제공',
    conditions: ['요가 또는 필라테스 관련 계정', '피드 게시물 1개 이상', '제품 태그 필수'],
  },
  {
    id: 4,
    brand: '웰링크뷰티',
    name: '웰니스 스킨케어 리뷰어',
    channel: '인스타그램',
    category: '뷰티/패션',
    status: '마감임박',
    applyEnd: '2026-04-07',
    postEnd: '2026-04-17',
    image: '✨',
    description: '웰링크뷰티의 신규 웰니스 스킨케어 라인을 체험하고 진솔한 리뷰를 남겨주세요.',
    reward: '스킨케어 세트 제공',
    conditions: ['뷰티/라이프스타일 계정', '피드 게시물 2개 이상', '브랜드 멘션 필수'],
  },
  {
    id: 5,
    brand: '프리코',
    name: '유기농 샐러드 키트 체험',
    channel: '블로그',
    category: '맛집/푸드',
    status: '모집중',
    applyEnd: '2026-04-22',
    postEnd: '2026-05-02',
    image: '🥬',
    description: '프리코의 신선한 유기농 샐러드 키트를 매일 즐기고 블로그에 체험기를 남겨주세요.',
    reward: '샐러드 키트 4주분 제공',
    conditions: ['네이버 블로그 이웃 500명 이상', '포스팅 1개 이상', '사진 5장 이상'],
  },
  {
    id: 6,
    brand: '필라핏',
    name: '홈트 스트레칭 밴드 리뷰',
    channel: '유튜브',
    category: '어필/스포츠',
    status: '모집중',
    applyEnd: '2026-04-30',
    postEnd: '2026-05-15',
    image: '🏋️',
    description: '필라핏 홈트 스트레칭 밴드 세트를 활용한 운동 영상을 제작해 주세요.',
    reward: '스트레칭 밴드 세트 제공 + 활동비 5만원',
    conditions: ['유튜브 구독자 500명 이상', '운동 영상 3개 이상 보유', '영상 1개 이상 제작'],
  },
]
