// Mock data — replace with API calls when backend is ready

export interface CampaignQuestion {
  id: string
  question: string
  /** 질문 서브 설명 — 원본 CampaignApplyForm.tsx L551-552: q.description?.trim() && <p> */
  description?: string
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
  /** 인플루언서 선정 발표일 — 원본 CampaignSidebar resultAnnounceDate 대응 */
  announceDate?: string
  postEnd: string
  image: string
  description?: string
  reward?: string
  rewardAmount?: number
  headcount: number
  applied: number
  conditions?: string[]
  type?: 'delivery' | 'visit'
  /** 게시 유형 — 원본 CampaignDetail postType 대응 (예: '인스타그램 피드', '릴스', '블로그 포스팅') */
  postType?: string
  /** 우대사항 — 원본 CampaignDetail priorityType 대응 (예: '운동 관련 계정 우대', '체험단 경험자 우대') */
  priorityType?: string
  /** 제공 내역 — 원본 CampaignDetail productDetail 대응 (제품 설명·혜택 상세) */
  productDetail?: string
  /** 필수 가이드 — 원본 CampaignDetail detailMissionDescription 대응 (콘텐츠 작성 상세 가이드) */
  detailMissionDescription?: string
  keywords?: string[]
  questions?: CampaignQuestion[]
  /** 바로가기 링크 — 원본 CampaignApplyForm.tsx L417-437: campaign.link 존재 시 신청폼에 노출 */
  link?: string
  /** 매장명 — 원본 CampaignList.tsx L102 storeName 검색 필드 대응 */
  storeName?: string
  /** 지역 — 원본 CampaignList.tsx L103 region 검색 필드 대응 */
  region?: string
  /** 태그 — 원본 CampaignList.tsx L104 tags 검색 필드 대응 */
  tags?: string[]
}

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    brand: '그린푸드',
    name: '비건 단백질 쉐이크 체험단 모집',
    channel: '인스타그램',
    category: '피트니스·스포츠',
    status: '모집중',
    applyEnd: '2026-05-28',
    announceDate: '2026-06-01',
    postEnd: '2026-06-10',
    image: '🥗',
    description: '그린푸드의 신제품 비건 단백질 쉐이크를 체험하고 솔직한 리뷰를 작성해 주세요',
    reward: '제품 1개월분 + 활동비 5만원',
    rewardAmount: 50000,
    headcount: 15,
    applied: 8,
    conditions: ['인스타그램 팔로워 1,000명 이상', '피드 게시물 1개 필수', '스토리 2개 이상'],
    type: 'delivery',
    postType: '인스타그램 피드 + 스토리',
    priorityType: '비건·채식 라이프스타일 계정 우대',
    productDetail: '비건 단백질 쉐이크 1개월분 (30포 × 25g) + 쉐이커 컵 + 활동비 50,000원\n\n· 제품은 냉암소에 보관해 주세요.\n· 개봉 후 1개월 이내 섭취를 권장합니다.\n· 상세 영양 정보는 제품 라벨을 확인해 주세요.',
    detailMissionDescription: '1. 제품 수령 후 7일 이내 첫 섭취 사진 스토리 업로드\n2. 2주 사용 후 솔직한 후기 피드 게시물 작성\n3. 캡션에 #그린푸드 #비건프로틴 필수 포함\n4. 협찬 표기 (AD 또는 유료광고) 반드시 기재\n5. 게시 후 24시간 이내 URL을 마이페이지에서 제출',
    keywords: ['그린푸드', '비건프로틴', '식물성단백질', '웰니스'],
    questions: [
      { id: 'q1', question: '현재 운동 루틴을 간략히 알려주세요', required: true, type: 'text' },
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
    applyEnd: '2026-05-24',
    announceDate: '2026-05-28',
    postEnd: '2026-06-08',
    image: '💪',
    description: 'SMILEATO 스포츠 보충제 라인업을 직접 체험하고 크리에이티브한 콘텐츠를 제작해 주세요',
    reward: '보충제 풀패키지 + 활동비 10만원',
    rewardAmount: 100000,
    headcount: 10,
    applied: 9,
    conditions: ['운동 관련 콘텐츠 계정', '인스타그램 또는 유튜브 채널 보유', '피드 또는 릴스 1개 이상'],
    type: 'delivery',
    postType: '인스타그램 릴스 또는 피드',
    priorityType: '크로스핏·헬스 관련 계정 우대, 팔로워 3,000명 이상 우대',
    productDetail: 'SMILEATO 스포츠 보충제 풀패키지 (단백질 파우더 1kg + 프리워크아웃 300g + 아미노산 250g) + 활동비 100,000원\n\n· 각 제품의 권장 복용법은 동봉된 설명서를 참고해 주세요.\n· 냉암소 또는 냉장 보관을 권장합니다.',
    detailMissionDescription: '1. 제품 수령 후 언박싱 스토리 업로드 (필수)\n2. 실제 운동 중 또는 운동 후 섭취 장면 포함\n3. 릴스 최소 30초, 피드 최소 3장 이상\n4. #SMILEATO #크로스핏 태그 필수\n5. 유료 광고 표기 필수 (광고, AD, 유료광고 중 택 1)',
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
    applyEnd: '2026-05-29',
    announceDate: '2026-06-02',
    postEnd: '2026-06-12',
    image: '🧘',
    description: 'ENUF 프리미엄 요가매트의 편안한 그립감과 내구성을 직접 체험해 보세요',
    reward: '요가매트 제공 (7만원 상당)',
    rewardAmount: 70000,
    headcount: 5,
    applied: 3,
    conditions: ['요가 또는 필라테스 관련 계정', '피드 게시물 1개 이상', '제품 태그 필수'],
    type: 'delivery',
    postType: '인스타그램 피드',
    priorityType: '요가·필라테스 강사 또는 전문 수련생 우대',
    productDetail: 'ENUF 프리미엄 요가매트 1개 (7만원 상당, 컬러 랜덤 제공)\n\n· 6mm 두께의 천연 고무 소재로 미끄럼 방지 기능이 탁월합니다.\n· 세탁은 미온수 + 중성세제로 손세탁해 주세요.\n· 보관 시 그늘진 곳에 말아서 보관해 주세요.',
    detailMissionDescription: '1. 매트 위에서 요가 또는 필라테스 동작 수행 장면 포함\n2. 매트 질감·그립감에 대한 솔직한 후기 캡션 작성\n3. 제품 태그 (@enuf.official) 필수\n4. #ENUF #요가매트 해시태그 포함\n5. 게시 후 72시간 이내 URL 제출',
    keywords: ['ENUF', '요가매트', '필라테스', '홈트'],
  },
  {
    id: 4,
    brand: '웰링크뷰티',
    name: '웰니스 스킨케어 리뷰어',
    channel: '인스타그램',
    category: '뷰티·패션',
    status: '모집중',
    applyEnd: '2026-05-22',
    announceDate: '2026-05-26',
    postEnd: '2026-06-05',
    image: '✨',
    description: '웰링크뷰티의 신규 웰니스 스킨케어 라인을 체험하고 진솔한 리뷰를 남겨주세요',
    reward: '스킨케어 세트 (10만원 상당)',
    rewardAmount: 100000,
    headcount: 20,
    applied: 7,
    conditions: ['뷰티/라이프스타일 계정', '피드 게시물 2개 이상', '브랜드 멘션 필수'],
    type: 'delivery',
  },
  {
    id: 5,
    brand: '프리코',
    name: '유기농 샐러드 키트 체험',
    channel: '네이버 블로그',
    category: '맛집·푸드',
    status: '모집중',
    applyEnd: '2026-05-25',
    announceDate: '2026-05-29',
    postEnd: '2026-06-08',
    image: '🥬',
    description: '프리코의 신선한 유기농 샐러드 키트를 매일 즐기고 블로그에 체험기를 남겨주세요',
    reward: '샐러드 키트 4주분 (8만원 상당)',
    rewardAmount: 80000,
    headcount: 8,
    applied: 4,
    conditions: ['네이버 블로그 이웃 500명 이상', '포스팅 1개 이상', '사진 5장 이상'],
    type: 'delivery',
  },
  {
    id: 6,
    brand: '필라핏',
    name: '홈트 스트레칭 밴드 리뷰',
    channel: '유튜브',
    category: '피트니스·스포츠',
    status: '모집중',
    applyEnd: '2026-05-27',
    announceDate: '2026-06-01',
    postEnd: '2026-06-12',
    image: '🏋️',
    description: '필라핏 홈트 스트레칭 밴드 세트를 활용한 운동 영상을 제작해 주세요',
    reward: '스트레칭 밴드 세트 + 활동비 5만원',
    rewardAmount: 50000,
    headcount: 6,
    applied: 2,
    conditions: ['유튜브 구독자 500명 이상', '운동 영상 3개 이상 보유', '영상 1개 이상 제작'],
    type: 'delivery',
  },
  {
    id: 7,
    brand: '모닝핏',
    name: '아침 루틴 라이프스타일 캠페인',
    channel: '인스타그램',
    category: '라이프스타일',
    status: '모집중',
    applyEnd: '2026-05-30',
    announceDate: '2026-06-04',
    postEnd: '2026-06-15',
    image: '☀️',
    description: '모닝핏의 아침 루틴 제품군을 체험하고 건강한 아침 라이프를 공유해 주세요',
    reward: '모닝 키트 + 활동비 6만원',
    rewardAmount: 60000,
    headcount: 12,
    applied: 5,
    conditions: ['라이프스타일 계정', '팔로워 2,000명 이상', '피드 1개 + 스토리 3개'],
    type: 'visit',
  },
  {
    id: 8,
    brand: '베베핏',
    name: '유아 건강식 체험단',
    channel: '인스타그램',
    category: '육아·펫',
    status: '모집중',
    applyEnd: '2026-05-26',
    announceDate: '2026-05-30',
    postEnd: '2026-06-08',
    image: '🍼',
    description: '베베핏 유아 건강 이유식 제품을 직접 사용해보고 솔직한 육아 리뷰를 남겨주세요',
    reward: '이유식 1개월 패키지 (9만원 상당)',
    rewardAmount: 90000,
    headcount: 10,
    applied: 3,
    conditions: ['육아/맘 계정', '0~36개월 자녀 보유', '피드 1개 이상', '팔로워 1,000명 이상'],
    type: 'delivery',
  },
]

// ────────────────────────────────────────────────────────────────────────────
// MyCampaign — 인플루언서가 신청·진행 중인 캠페인 (별도 세션 컨텍스트 데이터)
// mockCampaigns(탐색 가능한 모집 중 캠페인)와 ID 공간 분리 — `mc-` prefix 사용.
// 같은 id가 다른 캠페인을 가리키지 않도록 명확히 구분.
// ────────────────────────────────────────────────────────────────────────────
export type MyCampaignStatus = '지원완료' | '검토중' | '콘텐츠대기' | '검수중' | '완료' | '미선정'

export interface MyCampaign {
  /** 인플 사용자 참여 캠페인 식별자 — `mc-N` 형식. mockCampaigns(1~8)와 충돌 회피. */
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
  /** 미션 가이드 — 콘텐츠대기 상태에서 인플루언서에게 보여주는 작성 지침 (광고주 피드백) */
  missionGuide?: string
  /** 필수 키워드 — 콘텐츠 캡션에 반드시 포함해야 하는 해시태그 (광고주 피드백) */
  requiredKeywords?: string[]
  /**
   * mockCampaigns(1~8) 중 이 참여 캠페인에 대응하는 ID.
   * '지원완료' 상태에서 "수정하기" 버튼이 해당 신청 폼으로 이동할 때 사용.
   * 원본: mypage/page.tsx L860 → /campaigns/:dashCampaignId/apply?mode=edit
   */
  campaignRef?: number
}

export const mockMyCampaigns: MyCampaign[] = [
  {
    id: 'mc-1', name: '프로틴 파워 챌린지', brand: '뉴트리션랩', channel: '인스타그램',
    appliedAt: '2026-04-28', deadline: '2026-05-23',
    status: '콘텐츠대기', progress: '콘텐츠를 제출해 주세요',
    reward: '80,000원', rewardAmount: 80000, contentDeadline: '2026-05-23',
    campaignRef: 2,
    missionGuide: '제품을 사용한 운동 루틴 영상 또는 일상 콘텐츠 1개 + 솔직 후기 캡션. 협찬 표기 필수(@광고). 운동 전·후 변화 사진 포함 시 가산점.',
    requiredKeywords: ['뉴트리션랩', '프로틴', '단백질챌린지', '오운완'],
  },
  {
    id: 'mc-2', name: '필라테스 스튜디오 체험', brand: '바디앤핏', channel: '인스타그램',
    appliedAt: '2026-05-05', deadline: '2026-06-05',
    status: '검토중', progress: '브랜드에서 신청서를 검토하고 있어요',
    reward: '50,000원', rewardAmount: 50000, campaignRef: 3,
  },
  {
    id: 'mc-3', name: '아웃도어 장비 리뷰', brand: '아웃도어킹', channel: '네이버 블로그',
    appliedAt: '2026-04-10', deadline: '2026-05-29',
    status: '검수중', progress: '게시 콘텐츠 확인 중',
    reward: '120,000원', rewardAmount: 120000, postUrl: 'https://blog.naver.com/chanstyler/12345', campaignRef: 5,
  },
  {
    id: 'mc-4', name: '헬스 보충제 캠페인', brand: 'SMILEATO', channel: '인스타그램',
    appliedAt: '2026-03-10', deadline: '2026-04-20',
    status: '완료', progress: '정산 가능',
    reward: '95,000원', rewardAmount: 95000, campaignRef: 2,
    postUrl: 'https://www.instagram.com/p/smileato_review_chanstyler',
  },
  {
    id: 'mc-5', name: '요가 스트레칭 밴드', brand: '필라핏', channel: '인스타그램',
    appliedAt: '2026-04-01', deadline: '2026-05-05',
    status: '미선정', progress: '미선정',
    reward: '60,000원', rewardAmount: 60000, campaignRef: 6,
  },
  {
    id: 'mc-6', name: '하이록스 챌린지 시즌 2', brand: 'enuf.sports', channel: '인스타그램',
    appliedAt: '2026-05-08', deadline: '2026-05-25',
    status: '콘텐츠대기', progress: '콘텐츠를 제출해 주세요',
    reward: '120,000원', rewardAmount: 120000, contentDeadline: '2026-05-25',
    campaignRef: 3,
    missionGuide: '하이록스 종목 도전 영상 + 운동복/장비에 brand tag. 릴스 60초 이상, 본문에 운동 기록(시간·반복수) 포함.',
    requiredKeywords: ['enuf', '하이록스', 'hyrox', 'crossfit', '운동스타그램'],
  },
  {
    id: 'mc-7', name: '비건 단백질 신제품 체험', brand: '그린푸드', channel: '인스타그램',
    appliedAt: '2026-05-15', deadline: '2026-06-10',
    status: '지원완료', progress: '신청서가 접수됐어요',
    reward: '50,000원', rewardAmount: 50000,
    campaignRef: 1,
  },
]

// ────────────────────────────────────────────────────────────────────────────
// Home / Favorites — 북마크는 더 이상 별도 mock 객체로 두지 않는다.
// 사용자별 북마크 ID Set은 `services/userState.ts`의 useBookmarks()가 관리하고,
// 표시할 캠페인 정보는 mockCampaigns에서 join 한다 (단일 마스터, A2 해결).
// ────────────────────────────────────────────────────────────────────────────

export const BROWSE_CATEGORIES = ['전체', '뷰티·패션', '피트니스·스포츠', '맛집·푸드', '라이프스타일', '육아·펫']

export interface AppliedData {
  phone: string
  deliveryName?: string
  deliveryPhone?: string
  deliveryZip?: string
  deliveryAddr?: string
  deliveryAddrDetail?: string
  answers: Record<string, string>
  /** 원본 CampaignApplyForm L800-814: view 모드에서 선정 상태 배지 — 'selected'|'reviewing'|undefined */
  selectionStatus?: 'selected' | 'reviewing'
}

/**
 * 신청 데이터 매핑.
 * - Number key ('1','2','3') → mockCampaigns 마스터 id에 대한 신청 데이터 (CampaignApply view 모드)
 * - 'mc-N' key → mockMyCampaigns 항목에 대한 사용자 신청서 (MyCampaign '신청 정보 보기')
 */
export const mockAppliedData: Record<string, AppliedData> = {
  '1': {
    phone: '010-1234-5678',
    deliveryName: '김찬기',
    deliveryPhone: '010-1234-5678',
    deliveryZip: '06234',
    deliveryAddr: '서울 강남구 테헤란로 123',
    deliveryAddrDetail: '101동 202호',
    selectionStatus: 'reviewing',
    answers: {
      q1: '매일 아침 6시 헬스장, 주 5회 웨이트 트레이닝 및 주 2회 러닝',
      q2: '일부 실천 중입니다',
    },
  },
  '2': {
    phone: '010-1234-5678',
    deliveryName: '김찬기',
    deliveryPhone: '010-1234-5678',
    deliveryZip: '06234',
    deliveryAddr: '서울 강남구 테헤란로 123',
    deliveryAddrDetail: '101동 202호',
    selectionStatus: 'selected',
    answers: {
      q1: '매일 아침 6시 헬스장, 주 5회 웨이트 트레이닝 및 주 2회 러닝',
      q2: '일부 실천 중입니다',
    },
  },
  '3': {
    phone: '010-1234-5678',
    answers: {},
  },
  // mockMyCampaigns 항목 신청 정보 (mc-1 = 지원완료/콘텐츠대기, mc-2 = 검토중)
  'mc-1': {
    phone: '010-1234-5678',
    deliveryName: '김찬기',
    deliveryPhone: '010-1234-5678',
    deliveryZip: '06234',
    deliveryAddr: '서울 강남구 테헤란로 123',
    deliveryAddrDetail: '101동 202호',
    answers: {
      q1: '주 5회 웨이트 + 주 2회 러닝. 프로틴 섭취 일과화 중',
    },
  },
  'mc-2': {
    phone: '010-1234-5678',
    answers: {
      q1: '주 3회 필라테스 + 주 2회 요가',
    },
  },
}
