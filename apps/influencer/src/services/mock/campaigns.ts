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
  /** 모집 시작일 — 원본 CampaignSidebar participateStartDate 대응 */
  applyStart?: string
  applyEnd: string
  /** 인플루언서 선정 발표일 — 원본 CampaignSidebar resultAnnounceDate 대응 */
  announceDate?: string
  /** 업로드 시작일 — 원본 CampaignSidebar startDate 대응 */
  postStart?: string
  postEnd: string
  image: string
  description?: string
  reward?: string
  rewardAmount?: number
  /** 활동비(원고료) — 0 또는 미입력이면 제품 협찬만, 양수면 활동비 배지 노출 */
  activityFee?: number
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
  /** 콘텐츠 다운로드 단가 — 광고주가 인플루언서 콘텐츠를 2차 활용 시 건당 지급 금액. 0이면 다운로드 비활성. */
  downloadPrice?: number
  /**
   * 콘텐츠 2차 활용 조건.
   * enabled: true면 광고주가 인플루언서 콘텐츠를 SNS 광고·웹사이트 등에 재활용 가능.
   * 인플루언서는 지원 전 이 조건을 확인하고 동의해야 함.
   */
  secondaryUse?: {
    enabled: boolean
    /** 활용 채널 — 예: ['인스타그램 광고', '자사몰', '이메일 마케팅'] */
    channels?: string[]
    /** 활용 기간 (개월) */
    durationMonths?: number
  }
}

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    brand: '사계단백연구소',
    name: '[사계단백연구소] 단백질 도시락 서포터즈 1기',
    channel: '인스타그램',
    category: '맛집·푸드',
    status: '종료',
    applyStart: '2026-07-10',
    applyEnd: '2026-07-19',
    announceDate: '2026-07-22',
    postStart: '2026-07-01',
    postEnd: '2026-07-31',
    image: '🍱',
    description: `**브랜드 소개**

**사계단백연구소**는 운동하는 사람들의 실제 식단 루틴을 연구하는 고단백 식단 브랜드입니다.

바쁜 일상 속에서도 간편하고 꾸준하게 건강한 식단을 이어갈 수 있도록, 다양한 단백질 도시락과 식단 솔루션을 제공합니다.

**캠페인 소개**

사계단백연구소와 함께 건강한 식단 루틴을 만들어갈 서포터즈를 모집합니다.

운동과 식단을 꾸준히 이어가고 있는 분이라면 종목과 관계없이 누구나 지원 가능합니다.

하이록스(HYROX), 크로스핏, 러닝, 웨이트, 필라테스 등 자신만의 방식으로 목표를 향해 나아가는 분들과 함께하고 싶습니다.`,
    reward: '사계단백 식단 도시락 총 2개월 지원 (약 40만원 상당)',
    rewardAmount: 400000,
    headcount: 10,
    applied: 7,
    conditions: [
      '종목 무관',
      '운동 및 식단 루틴을 꾸준히 기록하는 분',
      '하이록스(HYROX), 크로스핏, 러닝, 웨이트, 필라테스 등 운동을 즐기는 분',
      '바디프로필, 대회 준비 등 명확한 목표를 가지고 운동 중인 분',
      'SNS 콘텐츠 제작에 자신 있는 분',
    ],
    type: 'delivery',
    postType: '피드, 릴스',
    priorityType: '릴스 제작 우대',
    productDetail: `사계단백 식단 도시락 총 2개월 지원
주 1회 정기 배송
총 제공가 약 40만원 상당
우수 콘텐츠 제작자 추가 상금 지급
판매 전환 우수자 추가 인센티브 지급

※ 제품은 받자마자 보관방법을 확인하여 설명서대로 보관해주세요.
※ 제품의 자세한 정보는 반드시 상세페이지에서 꼼꼼히 숙지 부탁드립니다.`,
    detailMissionDescription: `**콘텐츠 방향**

단순 제품 소개보다는 운동 루틴 속 실제 식단 루틴이 자연스럽게 드러나는 콘텐츠를 권장합니다.

> '왜 사계단백을 먹게 되었는지', '운동하는 사람에게 어떤 점이 편했는지'

여러분의 경험을 콘텐츠에 녹여주세요!

**필수 포함 사항**

- 사계단백 도시락 실제 취식 장면 포함
- 운동 루틴 또는 운동 전/후 식단 흐름 포함
- 제품 패키지 및 식단 구성 노출
- 개인 후기 및 느낀 점 작성
- 필수 태그: 사진/영상 및 게시글 본문 두곳 모두 계정 태그 @allseasons_protein_lab

**권장 콘텐츠 예시**

- 운동 전후 식단 루틴 브이로그
- 직장인 식단 관리 브이로그
- 벌크업/다이어트 식단 기록
- 하이록스/크로스핏/러닝 식단 루틴
- 도시락 언박싱 및 실제 취식 후기
- 식단 준비 시간을 줄이는 루틴 소개

**우대 콘텐츠**

- 릴스 기반 숏폼 콘텐츠
- 자연스러운 운동 루틴 연계 콘텐츠
- 높은 저장/공유 반응을 유도할 수 있는 콘텐츠
- 구매 전환이 발생한 콘텐츠

**업로드 유의사항**

- 게시물 업로드 후 최소 2개월 유지 필수
- 과도한 보정/허위 리뷰 지양
- 타 브랜드 비교 비방성 표현 금지`,
    keywords: ['사계단백연구소', '사계단백', '단백질도시락', '식단관리', '식단도시락'],
    tags: ['단백질', '도시락', '식단', '서포터즈', '헬스'],
    downloadPrice: 5000,
    secondaryUse: {
      enabled: true,
      channels: ['인스타그램 광고', '자사몰 배너', '이메일 마케팅'],
      durationMonths: 12,
    },
    questions: [
      { id: 'q1', question: '주로 어떤 운동을 하시나요? (예: 크로스핏, 러닝, 웨이트 등)', required: true, type: 'text' },
      { id: 'q2', question: '현재 운동 및 식단 루틴을 기록하는 SNS 채널을 알려주세요', required: true, type: 'text' },
      { id: 'q3', question: '사계단백연구소 서포터즈에 지원하는 이유를 알려주세요', required: true, type: 'text' },
    ],
  },
  {
    id: 2,
    brand: 'SMILEATO',
    name: '크로스핏 보충제 리뷰어 모집',
    channel: '인스타그램',
    category: '피트니스·스포츠',
    status: '마감임박',
    applyStart: '2026-05-01',
    applyEnd: '2026-06-02',
    announceDate: '2026-07-28',
    postStart: '2026-07-29',
    postEnd: '2026-07-08',
    image: '💪',
    description: 'SMILEATO 스포츠 보충제 라인업을 직접 체험하고 크리에이티브한 콘텐츠를 제작해 주세요',
    reward: '보충제 풀패키지 + 활동비 10만원',
    rewardAmount: 100000,
    activityFee: 100000,
    headcount: 10,
    applied: 9,
    conditions: ['운동 관련 콘텐츠 계정', '인스타그램 또는 유튜브 채널 보유', '피드 또는 릴스 1개 이상'],
    type: 'delivery',
    postType: '인스타그램 릴스 또는 피드',
    priorityType: '크로스핏·헬스 관련 계정 우대, 팔로워 3,000명 이상 우대',
    productDetail: 'SMILEATO 스포츠 보충제 풀패키지 (단백질 파우더 1kg + 프리워크아웃 300g + 아미노산 250g) + 활동비 100,000원\n\n· 각 제품의 권장 복용법은 동봉된 설명서를 참고해 주세요.\n· 냉암소 또는 냉장 보관을 권장합니다.',
    detailMissionDescription: '1. 제품 수령 후 언박싱 스토리 업로드 (필수)\n2. 실제 운동 중 또는 운동 후 섭취 장면 포함\n3. 릴스 최소 30초, 피드 최소 3장 이상\n4. #SMILEATO #크로스핏 태그 필수\n5. 유료 광고 표기 필수 (광고, AD, 유료광고 중 택 1)',
    keywords: ['SMILEATO', '크로스핏', '보충제', '스포츠영양'],
    downloadPrice: 3000,
    secondaryUse: {
      enabled: true,
      channels: ['인스타그램 광고', '유튜브 광고'],
      durationMonths: 6,
    },
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
    applyStart: '2026-07-20',
    applyEnd: '2026-07-26',
    announceDate: '2026-07-29',
    postStart: '2026-07-03',
    postEnd: '2026-08-12',
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
    applyStart: '2026-07-19',
    applyEnd: '2026-07-27',
    announceDate: '2026-07-30',
    postStart: '2026-07-27',
    postEnd: '2026-07-05',
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
    applyStart: '2026-07-20',
    applyEnd: '2026-07-28',
    announceDate: '2026-07-01',
    postStart: '2026-07-30',
    postEnd: '2026-07-08',
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
    applyStart: '2026-07-20',
    applyEnd: '2026-07-29',
    announceDate: '2026-07-02',
    postStart: '2026-07-02',
    postEnd: '2026-08-12',
    image: '🏋️',
    description: '필라핏 홈트 스트레칭 밴드 세트를 활용한 운동 영상을 제작해 주세요',
    reward: '스트레칭 밴드 세트 + 활동비 5만원',
    rewardAmount: 50000,
    activityFee: 50000,
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
    applyStart: '2026-07-20',
    applyEnd: '2026-07-01',
    announceDate: '2026-07-05',
    postStart: '2026-07-05',
    postEnd: '2026-08-15',
    image: '☀️',
    description: '모닝핏의 아침 루틴 제품군을 체험하고 건강한 아침 라이프를 공유해 주세요',
    reward: '모닝 키트 + 활동비 6만원',
    rewardAmount: 60000,
    activityFee: 60000,
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
    applyStart: '2026-07-15',
    applyEnd: '2026-07-09',
    announceDate: '2026-08-12',
    postStart: '2026-07-31',
    postEnd: '2026-07-08',
    image: '🍼',
    description: '베베핏 유아 건강 이유식 제품을 직접 사용해보고 솔직한 육아 리뷰를 남겨주세요',
    reward: '이유식 1개월 패키지 (9만원 상당)',
    rewardAmount: 90000,
    headcount: 10,
    applied: 3,
    conditions: ['육아/맘 계정', '0~36개월 자녀 보유', '피드 1개 이상', '팔로워 1,000명 이상'],
    type: 'delivery',
  },

  // ── 9~100 (캠페인 탐색 볼륨 확장) ──────────────────────────────────────────

  // 뷰티·패션 ──────────────────────────────────────────────────────────────────
  { id: 9, brand: '라운드랩', name: '자작나무 수분 토너 체험단', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-20', applyEnd: '2026-07-30', announceDate: '2026-08-03', postStart: '2026-07-05', postEnd: '2026-08-25', image: '💧', description: '라운드랩 자작나무 수분 토너를 4주 체험하고 피부 변화를 기록해 주세요', reward: '토너 풀세트 (12만원 상당)', rewardAmount: 120000, headcount: 15, applied: 6, type: 'delivery', postType: '인스타그램 피드', conditions: ['뷰티 관련 계정', '팔로워 1,000명 이상', '피드 2개 이상'] },
  { id: 10, brand: '이니스프리', name: '그린티 세럼 체험 리뷰어', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-21', applyEnd: '2026-07-31', announceDate: '2026-08-04', postStart: '2026-07-06', postEnd: '2026-08-30', image: '🍵', description: '이니스프리 그린티 씨드 세럼의 보습 효과를 직접 체험해 보세요', reward: '세럼 + 크림 세트 (9만원 상당)', rewardAmount: 90000, headcount: 20, applied: 11, type: 'delivery', postType: '피드, 스토리' },
  { id: 11, brand: '닥터지', name: '레드 블레미쉬 라인 리뷰', channel: '인스타그램', category: '뷰티·패션', status: '마감임박', applyStart: '2026-07-17', applyEnd: '2026-07-25', announceDate: '2026-07-29', postStart: '2026-07-01', postEnd: '2026-08-20', image: '🔴', description: '피부 트러블에 특화된 닥터지 레드 블레미쉬 라인을 체험해 주세요', reward: '레드 블레미쉬 세트 (8만원 상당)', rewardAmount: 80000, headcount: 10, applied: 9, type: 'delivery' },
  { id: 12, brand: '에스트라', name: '아토베리어 크림 체험단', channel: '네이버 블로그', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-22', applyEnd: '2026-08-01', announceDate: '2026-08-05', postStart: '2026-07-08', postEnd: '2026-07-08', image: '🌿', description: '민감성 피부를 위한 에스트라 아토베리어 크림을 블로그에 상세 리뷰해 주세요', reward: '아토베리어 세트 (15만원 상당)', rewardAmount: 150000, headcount: 8, applied: 3, type: 'delivery', postType: '네이버 블로그 포스팅' },
  { id: 13, brand: '메디힐', name: '마스크팩 위클리 챌린지', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-23', applyEnd: '2026-08-02', announceDate: '2026-08-06', postStart: '2026-07-09', postEnd: '2026-08-30', image: '🎭', description: '메디힐 마스크팩 7종을 일주일간 매일 체험하고 일상 스토리를 올려주세요', reward: '마스크팩 30매 세트 (6만원 상당)', rewardAmount: 60000, headcount: 30, applied: 14, type: 'delivery' },
  { id: 14, brand: '아모레퍼시픽', name: '타임 레스폰스 안티에이징 체험', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-20', applyEnd: '2026-07-29', announceDate: '2026-08-02', postStart: '2026-07-05', postEnd: '2026-07-05', image: '⏳', description: '프리미엄 안티에이징 라인 타임 레스폰스를 한 달간 집중 체험해 주세요', reward: '타임 레스폰스 미니어처 세트 (20만원 상당)', rewardAmount: 200000, headcount: 5, applied: 4, type: 'delivery', priorityType: '30~50대 뷰티 크리에이터 우대' },
  { id: 15, brand: '토리든', name: '다이브인 히알루론산 앰플 리뷰', channel: '유튜브', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-24', applyEnd: '2026-08-03', announceDate: '2026-08-07', postStart: '2026-08-10', postEnd: '2026-09-10', image: '💎', description: '토리든 다이브인 히알루론산 앰플을 3주 집중 케어 후 유튜브 리뷰를 올려주세요', reward: '앰플 세트 + 활동비 10만원', rewardAmount: 100000, headcount: 5, applied: 2, type: 'delivery', postType: '유튜브 영상 (10분 이상)' },
  { id: 16, brand: '헉슬리', name: '선크림 데일리 UV 체험단', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-08-30', image: '☀️', description: '헉슬리 데일리 UV 선크림을 여름 내내 사용하고 솔직한 사용기를 남겨주세요', reward: '선크림 + 미스트 세트 (7만원 상당)', rewardAmount: 70000, headcount: 25, applied: 9, type: 'delivery' },
  { id: 17, brand: '바닐라코', name: '클린잇 제로 클렌징 체험', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-22', applyEnd: '2026-08-01', announceDate: '2026-08-04', postStart: '2026-07-07', postEnd: '2026-08-27', image: '🫧', description: '바닐라코 클린잇 제로 클렌징 라인으로 피부 장벽을 지키는 클렌징 루틴을 공유해 주세요', reward: '클렌징 풀라인 세트 (8만원 상당)', rewardAmount: 80000, headcount: 12, applied: 5, type: 'delivery' },
  { id: 18, brand: '젝시믹스', name: '에어리 레깅스 착용 리뷰', channel: '인스타그램', category: '뷰티·패션', status: '마감임박', applyStart: '2026-07-18', applyEnd: '2026-07-26', announceDate: '2026-07-28', postStart: '2026-07-01', postEnd: '2026-08-20', image: '🩱', description: '젝시믹스 에어리 레깅스를 운동 중 착용하고 핏·착용감을 콘텐츠로 제작해 주세요', reward: '레깅스 1장 + 활동비 5만원', rewardAmount: 50000, headcount: 20, applied: 18, type: 'delivery', postType: '릴스 또는 피드' },
  { id: 19, brand: '안다르', name: '쉐이프업 요가복 체험단', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-23', applyEnd: '2026-08-02', announceDate: '2026-08-06', postStart: '2026-07-09', postEnd: '2026-08-29', image: '🧘', description: '안다르 쉐이프업 라인 요가복을 착용하고 운동 콘텐츠를 제작해 주세요', reward: '요가복 세트 (13만원 상당)', rewardAmount: 130000, headcount: 15, applied: 7, type: 'delivery', conditions: ['요가·필라테스 계정', '팔로워 2,000명 이상'] },
  { id: 20, brand: '룰루레몬', name: '스피드업 쇼츠 체험 리뷰', channel: '유튜브', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-12', image: '🏃', description: '룰루레몬 스피드업 쇼츠를 실제 러닝·운동 중 착용하고 유튜브 리뷰를 제작해 주세요', reward: '쇼츠 + 활동비 15만원', rewardAmount: 150000, headcount: 3, applied: 1, type: 'delivery', postType: '유튜브 브이로그' },
  { id: 21, brand: '스킨1004', name: '마다가스카르 알로에 진정 세럼', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-21', applyEnd: '2026-07-31', announceDate: '2026-08-04', postStart: '2026-07-07', postEnd: '2026-08-27', image: '🌱', description: '스킨1004 알로에 세럼으로 여름철 진정 스킨케어 루틴을 완성해 주세요', reward: '세럼 + 토너 세트 (6만원 상당)', rewardAmount: 60000, headcount: 20, applied: 8, type: 'delivery' },
  { id: 22, brand: '구달', name: '비타C 트리플C 세럼 체험단', channel: '네이버 블로그', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-24', applyEnd: '2026-08-03', announceDate: '2026-08-07', postStart: '2026-08-10', postEnd: '2026-09-10', image: '🍊', description: '구달 비타C 세럼으로 화사한 피부 만들기 4주 체험기를 블로그에 작성해 주세요', reward: '비타C 세럼 세트 (9만원 상당)', rewardAmount: 90000, headcount: 10, applied: 4, type: 'delivery' },
  { id: 23, brand: '이퀄보태니카', name: '비건 퍼퓸 체험 리뷰어', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-13', image: '🌸', description: '비건 원료로 만든 이퀄보태니카 퍼퓸을 일상에서 사용하고 향기 리뷰를 남겨주세요', reward: '퍼퓸 2종 (11만원 상당)', rewardAmount: 110000, headcount: 8, applied: 2, type: 'delivery' },
  { id: 24, brand: '넘버즈인', name: '넘버즈인 알파-아르부틴 패드 체험', channel: '인스타그램', category: '뷰티·패션', status: '종료', applyStart: '2026-07-01', applyEnd: '2026-07-15', announceDate: '2026-07-20', postStart: '2026-07-22', postEnd: '2026-08-22', image: '✨', description: '넘버즈인 미백 패드를 2주 사용하고 피부 톤 변화를 기록해 주세요', reward: '패드 2개월 분 (7만원 상당)', rewardAmount: 70000, headcount: 15, applied: 15, type: 'delivery' },
  { id: 25, brand: '클리오', name: '킬 커버 파운데이션 커버력 도전', channel: '유튜브', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-01', image: '💄', description: '클리오 킬 커버 파운데이션 커버력을 직접 테스트하고 메이크업 튜토리얼을 제작해 주세요', reward: '파운데이션 + 쿠션 세트 (8만원 상당)', rewardAmount: 80000, headcount: 10, applied: 3, type: 'delivery', postType: '유튜브 메이크업 튜토리얼' },
  { id: 26, brand: '미샤', name: 'M 퍼펙트 커버 리뷰 챌린지', channel: '인스타그램', category: '뷰티·패션', status: '종료', applyStart: '2026-07-05', applyEnd: '2026-07-18', announceDate: '2026-07-22', postStart: '2026-07-25', postEnd: '2026-08-15', image: '🪞', description: '미샤 퍼펙트 커버 BB 크림의 자연스러운 커버력을 피부 타입별로 테스트해 주세요', reward: 'BB크림 3종 + 활동비 3만원', rewardAmount: 30000, headcount: 20, applied: 20, type: 'delivery' },
  { id: 27, brand: '나우코스', name: '어성초 약산성 클렌저 체험', channel: '네이버 블로그', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-12', image: '🌿', description: '나우코스 어성초 약산성 클렌저로 피부 장벽 케어 루틴을 블로그에 공유해 주세요', reward: '클렌저 세트 (6만원 상당)', rewardAmount: 60000, headcount: 12, applied: 4, type: 'delivery' },
  { id: 28, brand: '시드물', name: '수분 앰플 마스크 체험단', channel: '인스타그램', category: '뷰티·패션', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-04', image: '💦', description: '시드물 수분 앰플 마스크를 일주일 사용하고 피부 수분도 변화를 측정해 공유해 주세요', reward: '앰플 마스크 30매 (8만원 상당)', rewardAmount: 80000, headcount: 15, applied: 5, type: 'delivery' },

  // 피트니스·스포츠 ──────────────────────────────────────────────────────────
  { id: 29, brand: '나이키', name: '에어맥스 270 러닝 챌린지', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-20', applyEnd: '2026-07-30', announceDate: '2026-08-03', postStart: '2026-07-06', postEnd: '2026-08-26', image: '👟', description: '나이키 에어맥스 270으로 5km 러닝 챌린지에 도전하고 기록을 공유해 주세요', reward: '에어맥스 270 1켤레 (18만원 상당)', rewardAmount: 180000, headcount: 5, applied: 4, type: 'delivery', postType: '릴스 또는 피드', conditions: ['러닝 관련 계정', '팔로워 3,000명 이상'] },
  { id: 30, brand: '뉴발란스', name: '프레시폼 X 크루 런 체험', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-22', applyEnd: '2026-08-01', announceDate: '2026-08-05', postStart: '2026-07-08', postEnd: '2026-08-28', image: '🏃', description: '뉴발란스 프레시폼 X 크루를 신고 러닝 루틴을 기록하고 공유해 주세요', reward: '운동화 1켤레 (16만원 상당)', rewardAmount: 160000, headcount: 5, applied: 3, type: 'delivery' },
  { id: 31, brand: '호카', name: '클리프턴 9 쿠셔닝 체험단', channel: '유튜브', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-11', image: '🌄', description: '호카 클리프턴 9 쿠셔닝 운동화를 트레일 러닝에서 직접 테스트하고 유튜브 리뷰를 남겨주세요', reward: '클리프턴 9 + 활동비 10만원', rewardAmount: 100000, headcount: 3, applied: 1, type: 'delivery', postType: '유튜브 리뷰 (15분 이상)' },
  { id: 32, brand: '가민', name: '포러너 265 스마트워치 체험', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-23', applyEnd: '2026-08-02', announceDate: '2026-08-06', postStart: '2026-07-09', postEnd: '2026-07-09', image: '⌚', description: '가민 포러너 265로 한 달간 운동 데이터를 트래킹하고 실사용 리뷰를 공유해 주세요', reward: '포러너 265 (60만원 상당) 대여 체험', rewardAmount: 600000, headcount: 3, applied: 2, type: 'delivery', priorityType: '러닝·트라이애슬론 관련 계정 우대' },
  { id: 33, brand: '오클리', name: '오클리 스포츠 선글라스 체험', channel: '인스타그램', category: '피트니스·스포츠', status: '마감임박', applyStart: '2026-07-19', applyEnd: '2026-07-25', announceDate: '2026-07-29', postStart: '2026-07-01', postEnd: '2026-08-21', image: '🕶️', description: '오클리 스포츠 선글라스를 야외 운동 중 착용하고 활동 사진·영상을 제작해 주세요', reward: '선글라스 1개 (20만원 상당)', rewardAmount: 200000, headcount: 8, applied: 7, type: 'delivery' },
  { id: 34, brand: '블랙다이아몬드', name: '클라이밍 장갑 체험단', channel: '유튜브', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-12', image: '🧗', description: '블랙다이아몬드 클라이밍 장갑을 실내 클라이밍에서 착용하고 퍼포먼스 리뷰를 제작해 주세요', reward: '클라이밍 장갑 + 초크백 세트 (8만원 상당)', rewardAmount: 80000, headcount: 5, applied: 2, type: 'delivery' },
  { id: 35, brand: '테라스포츠', name: '수영 오픈워터 체험단', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-14', image: '🏊', description: '테라스포츠 오픈워터 수영복을 착용하고 야외 수영 또는 수영장 콘텐츠를 제작해 주세요', reward: '수영복 세트 (12만원 상당)', rewardAmount: 120000, headcount: 10, applied: 3, type: 'delivery' },
  { id: 36, brand: '마이프로틴', name: '임팩트 웨이 프로틴 체험 리뷰', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-21', applyEnd: '2026-07-31', announceDate: '2026-08-04', postStart: '2026-07-07', postEnd: '2026-08-27', image: '💪', description: '마이프로틴 임팩트 웨이 프로틴 다양한 맛을 체험하고 솔직 리뷰를 남겨주세요', reward: '프로틴 3kg + 활동비 5만원', rewardAmount: 50000, headcount: 15, applied: 8, type: 'delivery', postType: '피드 또는 릴스' },
  { id: 37, brand: '옵티멈뉴트리션', name: '골드 스탠다드 웨이 체험단', channel: '유튜브', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-24', applyEnd: '2026-08-03', announceDate: '2026-08-07', postStart: '2026-08-10', postEnd: '2026-09-10', image: '🥛', description: '옵티멈뉴트리션 골드스탠다드 웨이를 한 달간 복용하고 운동 퍼포먼스 변화를 유튜브에 기록해 주세요', reward: '웨이 프로틴 2kg + 활동비 8만원', rewardAmount: 80000, headcount: 5, applied: 2, type: 'delivery' },
  { id: 38, brand: '스컬피그', name: '스트렝스 저항 밴드 체험', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-03', image: '🏋️', description: '스컬피그 저항 밴드 세트를 활용한 홈트 루틴 영상을 제작해 주세요', reward: '밴드 세트 + 활동비 5만원', rewardAmount: 50000, headcount: 12, applied: 4, type: 'delivery' },
  { id: 39, brand: '짐샤크', name: '레전드 레깅스 운동 영상 챌린지', channel: '인스타그램', category: '피트니스·스포츠', status: '마감임박', applyStart: '2026-07-18', applyEnd: '2026-07-27', announceDate: '2026-07-28', postStart: '2026-07-01', postEnd: '2026-08-21', image: '💥', description: '짐샤크 레전드 레깅스를 착용하고 헬스장 운동 영상 또는 릴스를 제작해 주세요', reward: '레깅스 + 스포츠브라 세트 (16만원 상당)', rewardAmount: 160000, headcount: 10, applied: 9, type: 'delivery' },
  { id: 40, brand: '데카트론', name: '홈트 덤벨 세트 체험단', channel: '유튜브', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-29', applyEnd: '2026-08-08', announceDate: '2026-08-12', postStart: '2026-08-15', postEnd: '2026-09-15', image: '🏋️', description: '데카트론 조절형 덤벨 세트로 홈트 루틴을 구성하고 4주 챌린지 영상을 제작해 주세요', reward: '덤벨 세트 (10만원 상당)', rewardAmount: 100000, headcount: 5, applied: 1, type: 'delivery' },
  { id: 41, brand: '트리거포인트', name: '폼롤러 근막이완 체험 리뷰', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-02', image: '🔵', description: '트리거포인트 폼롤러를 활용한 운동 후 근막이완 루틴을 공유해 주세요', reward: '폼롤러 + 마사지볼 세트 (9만원 상당)', rewardAmount: 90000, headcount: 10, applied: 3, type: 'delivery' },
  { id: 42, brand: '휴로', name: '마그네슘 스포츠 드링크 체험', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-23', applyEnd: '2026-08-02', announceDate: '2026-08-06', postStart: '2026-07-09', postEnd: '2026-08-29', image: '⚡', description: '휴로 마그네슘 스포츠 드링크를 운동 전후 섭취하고 회복 효과를 공유해 주세요', reward: '스포츠 드링크 1박스 + 활동비 3만원', rewardAmount: 30000, headcount: 25, applied: 10, type: 'delivery' },
  { id: 43, brand: '언더아머', name: '러쉬 티셔츠 운동 착용 리뷰', channel: '인스타그램', category: '피트니스·스포츠', status: '종료', applyStart: '2026-07-05', applyEnd: '2026-07-17', announceDate: '2026-07-21', postStart: '2026-07-24', postEnd: '2026-08-14', image: '👕', description: '언더아머 히트기어 러쉬 티셔츠를 운동 중 착용하고 기능성 리뷰를 작성해 주세요', reward: '티셔츠 2장 + 활동비 3만원', rewardAmount: 30000, headcount: 20, applied: 20, type: 'delivery' },
  { id: 44, brand: '배럴', name: '수영복 오픈워터 체험단', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-14', image: '🏖️', description: '배럴 오픈워터 수영복을 착용하고 해변 또는 수영장 인증 콘텐츠를 제작해 주세요', reward: '수영복 + 수영 모자 세트 (13만원 상당)', rewardAmount: 130000, headcount: 8, applied: 2, type: 'delivery' },
  { id: 45, brand: '네파', name: '트레킹 부츠 산행 체험', channel: '네이버 블로그', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-11', image: '⛰️', description: '네파 트레킹 부츠를 신고 실제 산행 후 블로그에 착용감·내구성 리뷰를 남겨주세요', reward: '트레킹 부츠 1켤레 (15만원 상당)', rewardAmount: 150000, headcount: 5, applied: 2, type: 'delivery' },
  { id: 46, brand: '크레이지핏', name: '벽걸이 철봉 홈짐 체험', channel: '유튜브', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-13', image: '🏠', description: '크레이지핏 벽걸이 철봉을 홈짐에 설치하고 4주 홈트 챌린지 영상을 유튜브에 올려주세요', reward: '벽걸이 철봉 + 활동비 10만원', rewardAmount: 100000, headcount: 3, applied: 1, type: 'delivery' },
  { id: 47, brand: '휠라', name: '코트 럭스 테니스화 착용 리뷰', channel: '인스타그램', category: '피트니스·스포츠', status: '마감임박', applyStart: '2026-07-19', applyEnd: '2026-07-25', announceDate: '2026-07-29', postStart: '2026-07-02', postEnd: '2026-08-22', image: '🎾', description: '휠라 코트 럭스 테니스화를 착용하고 테니스 또는 파크라이프 콘텐츠를 제작해 주세요', reward: '테니스화 1켤레 (12만원 상당)', rewardAmount: 120000, headcount: 8, applied: 7, type: 'delivery' },
  { id: 48, brand: '살로몬', name: '트레일 러닝화 체험단', channel: '인스타그램', category: '피트니스·스포츠', status: '모집중', applyStart: '2026-07-29', applyEnd: '2026-08-08', announceDate: '2026-08-12', postStart: '2026-08-15', postEnd: '2026-09-15', image: '🌲', description: '살로몬 트레일 러닝화를 신고 산 트레일 코스를 달리고 퍼포먼스 리뷰를 남겨주세요', reward: '트레일화 1켤레 (20만원 상당)', rewardAmount: 200000, headcount: 5, applied: 1, type: 'delivery' },

  // 맛집·푸드 ────────────────────────────────────────────────────────────────
  { id: 49, brand: '마켓컬리', name: '컬리 밀키트 주간 체험단', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-21', applyEnd: '2026-07-31', announceDate: '2026-08-04', postStart: '2026-07-07', postEnd: '2026-08-27', image: '🥗', description: '마켓컬리 신규 밀키트를 일주일간 다양하게 체험하고 요리 콘텐츠를 올려주세요', reward: '밀키트 7종 + 무료배송권 (12만원 상당)', rewardAmount: 120000, headcount: 20, applied: 11, type: 'delivery', postType: '피드 또는 릴스' },
  { id: 50, brand: '쿠캣', name: '간편식 신제품 체험 리뷰어', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-23', applyEnd: '2026-08-02', announceDate: '2026-08-06', postStart: '2026-07-09', postEnd: '2026-08-29', image: '🍱', description: '쿠캣 신규 간편식 라인업을 체험하고 솔직한 맛 리뷰와 레시피 활용법을 공유해 주세요', reward: '간편식 세트 (8만원 상당)', rewardAmount: 80000, headcount: 15, applied: 7, type: 'delivery' },
  { id: 51, brand: '오설록', name: '제주 그린티 라이프 체험단', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-22', applyEnd: '2026-08-01', announceDate: '2026-08-05', postStart: '2026-07-08', postEnd: '2026-08-28', image: '🍵', description: '오설록 제주 그린티 라인을 일상에서 즐기고 티 라이프 콘텐츠를 제작해 주세요', reward: '그린티 라인 세트 (7만원 상당)', rewardAmount: 70000, headcount: 20, applied: 9, type: 'delivery' },
  { id: 52, brand: '빙그레', name: '바나나맛우유 레시피 챌린지', channel: '인스타그램', category: '맛집·푸드', status: '마감임박', applyStart: '2026-07-17', applyEnd: '2026-07-28', announceDate: '2026-07-28', postStart: '2026-07-01', postEnd: '2026-08-21', image: '🍌', description: '바나나맛우유를 활용한 창의적인 레시피를 개발하고 릴스로 제작해 주세요', reward: '바나나맛우유 박스 + 활동비 5만원', rewardAmount: 50000, headcount: 30, applied: 27, type: 'delivery', postType: '릴스 (30초 이상)' },
  { id: 53, brand: '노브랜드버거', name: '신메뉴 시식단 모집', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-24', applyEnd: '2026-08-03', announceDate: '2026-08-07', postStart: '2026-08-10', postEnd: '2026-08-30', image: '🍔', description: '노브랜드버거 신메뉴를 시식하고 솔직한 맛 리뷰를 인스타그램에 올려주세요', reward: '식사권 5만원 상당 + 활동비 3만원', rewardAmount: 30000, headcount: 20, applied: 8, type: 'visit', storeName: '노브랜드버거 홍대점', region: '서울 마포구' },
  { id: 54, brand: '할리스커피', name: '시즌 신메뉴 카페 체험단', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-01', image: '☕', description: '할리스커피 여름 시즌 신메뉴를 체험하고 카페 분위기 콘텐츠를 제작해 주세요', reward: '음료 쿠폰 4만원 상당 + 활동비 3만원', rewardAmount: 30000, headcount: 25, applied: 12, type: 'visit', storeName: '할리스커피 강남점', region: '서울 강남구' },
  { id: 55, brand: '아워홈', name: '냉동 건강식 체험 리뷰어', channel: '네이버 블로그', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-12', image: '🍲', description: '아워홈 냉동 건강식 라인을 가정에서 체험하고 블로그에 요리 후기를 남겨주세요', reward: '냉동식품 세트 (10만원 상당)', rewardAmount: 100000, headcount: 10, applied: 4, type: 'delivery' },
  { id: 56, brand: '동원홈푸드', name: '건강 샐러드 도시락 체험단', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-03', image: '🥙', description: '동원 건강 샐러드 도시락을 직장인 점심으로 체험하고 다이어트 식단 콘텐츠를 공유해 주세요', reward: '샐러드 도시락 1개월 (12만원 상당)', rewardAmount: 120000, headcount: 15, applied: 6, type: 'delivery' },
  { id: 57, brand: '정관장', name: '홍삼 에브리타임 체험단', channel: '네이버 블로그', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-22', applyEnd: '2026-08-01', announceDate: '2026-08-05', postStart: '2026-07-08', postEnd: '2026-07-08', image: '🌿', description: '정관장 홍삼 에브리타임을 한 달간 꾸준히 복용하고 활력 변화를 블로그에 기록해 주세요', reward: '홍삼 에브리타임 1개월분 (15만원 상당)', rewardAmount: 150000, headcount: 8, applied: 3, type: 'delivery' },
  { id: 58, brand: '배달의민족', name: '맛집 탐방 리뷰어 모집', channel: '인스타그램', category: '맛집·푸드', status: '마감임박', applyStart: '2026-07-18', applyEnd: '2026-07-27', announceDate: '2026-07-28', postStart: '2026-07-01', postEnd: '2026-08-21', image: '🛵', description: '배달의민족 추천 맛집을 방문하고 음식 사진·리뷰를 인스타그램에 올려주세요', reward: '배달비 쿠폰 10만원 + 활동비 5만원', rewardAmount: 50000, headcount: 30, applied: 26, type: 'visit' },
  { id: 59, brand: '에이트나인', name: '비건 단백질 스낵 체험단', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-04', image: '🌱', description: '에이트나인 비건 단백질 스낵 신제품을 체험하고 건강 간식 콘텐츠를 공유해 주세요', reward: '스낵 3개월분 (8만원 상당)', rewardAmount: 80000, headcount: 15, applied: 5, type: 'delivery' },
  { id: 60, brand: '스파클링제주', name: '제주 스파클링 워터 체험', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-29', applyEnd: '2026-08-08', announceDate: '2026-08-12', postStart: '2026-08-15', postEnd: '2026-09-05', image: '💧', description: '스파클링제주 천연 탄산수를 일상에서 즐기고 음료 라이프 콘텐츠를 제작해 주세요', reward: '탄산수 3박스 + 활동비 3만원', rewardAmount: 30000, headcount: 30, applied: 11, type: 'delivery' },
  { id: 61, brand: '맥심', name: '맥심 더블샷 신제품 체험', channel: '유튜브', category: '맛집·푸드', status: '종료', applyStart: '2026-07-03', applyEnd: '2026-07-16', announceDate: '2026-07-20', postStart: '2026-07-23', postEnd: '2026-08-13', image: '☕', description: '맥심 더블샷 신제품을 커피 전문가·유튜버가 직접 시음하고 리뷰 영상을 올려주세요', reward: '더블샷 박스 + 활동비 8만원', rewardAmount: 80000, headcount: 5, applied: 5, type: 'delivery' },
  { id: 62, brand: '풀무원', name: '두부 면 건강 요리 챌린지', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-02', image: '🍜', description: '풀무원 두부 면으로 건강 레시피를 개발하고 요리 영상 또는 피드를 올려주세요', reward: '두부면 세트 (6만원 상당) + 활동비 3만원', rewardAmount: 30000, headcount: 20, applied: 7, type: 'delivery' },
  { id: 63, brand: '씨제이제일제당', name: '비비고 만두 활용 레시피 챌린지', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-03', image: '🥟', description: '비비고 만두를 활용한 창의적인 요리를 만들고 릴스 레시피 영상을 제작해 주세요', reward: '비비고 만두 세트 (5만원 상당) + 활동비 3만원', rewardAmount: 30000, headcount: 25, applied: 9, type: 'delivery', postType: '릴스 (1분 이내 레시피)' },
  { id: 64, brand: '이마트24', name: '편의점 신상 음식 리뷰어', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-24', applyEnd: '2026-08-03', announceDate: '2026-08-07', postStart: '2026-08-10', postEnd: '2026-08-30', image: '🏪', description: '이마트24 신상 편의점 음식을 매주 방문 체험하고 솔직 리뷰를 인스타그램에 올려주세요', reward: '이마트24 상품권 6만원 + 활동비 2만원', rewardAmount: 20000, headcount: 20, applied: 8, type: 'visit', storeName: '이마트24 신촌점', region: '서울 서대문구' },
  { id: 65, brand: '허닭', name: '닭가슴살 다이어트 식단 체험', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-11', image: '🍗', description: '허닭 닭가슴살 제품으로 한 달 다이어트 식단 도전 콘텐츠를 제작해 주세요', reward: '닭가슴살 1개월분 (8만원 상당)', rewardAmount: 80000, headcount: 20, applied: 9, type: 'delivery' },
  { id: 66, brand: '샘표', name: '연두 요리에센스 활용 챌린지', channel: '유튜브', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-14', image: '🟢', description: '샘표 연두 요리에센스로 건강하고 맛있는 요리를 만들고 유튜브 레시피 영상을 올려주세요', reward: '연두 제품 세트 + 활동비 8만원', rewardAmount: 80000, headcount: 5, applied: 2, type: 'delivery' },
  { id: 67, brand: '오뚜기', name: '컵밥 신제품 체험단', channel: '인스타그램', category: '맛집·푸드', status: '모집중', applyStart: '2026-07-22', applyEnd: '2026-08-01', announceDate: '2026-08-05', postStart: '2026-07-08', postEnd: '2026-08-28', image: '🍚', description: '오뚜기 컵밥 신제품을 간편하게 즐기고 솔직한 맛 리뷰를 올려주세요', reward: '컵밥 세트 (4만원 상당) + 활동비 2만원', rewardAmount: 20000, headcount: 30, applied: 13, type: 'delivery' },
  { id: 68, brand: '더반찬', name: '프리미엄 반찬 구독 체험단', channel: '네이버 블로그', category: '맛집·푸드', status: '종료', applyStart: '2026-07-06', applyEnd: '2026-07-19', announceDate: '2026-07-23', postStart: '2026-07-26', postEnd: '2026-08-16', image: '🥘', description: '더반찬 프리미엄 반찬 구독 서비스를 2주 체험하고 블로그에 상세 후기를 작성해 주세요', reward: '반찬 구독 2주 무료 (15만원 상당)', rewardAmount: 150000, headcount: 10, applied: 10, type: 'delivery' },

  // 라이프스타일 ──────────────────────────────────────────────────────────────
  { id: 69, brand: '에이스침대', name: '숙면 매트리스 체험단', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-20', applyEnd: '2026-07-30', announceDate: '2026-08-03', postStart: '2026-07-06', postEnd: '2026-07-06', image: '🛏️', description: '에이스침대 숙면 매트리스를 한 달간 사용하고 수면 질 변화를 콘텐츠로 기록해 주세요', reward: '매트리스 1개월 체험 (대여)', rewardAmount: 500000, headcount: 5, applied: 4, type: 'delivery', priorityType: '홈 인테리어·라이프스타일 계정 우대' },
  { id: 70, brand: '다이슨', name: '에어랩 헤어 스타일링 체험', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-23', applyEnd: '2026-08-02', announceDate: '2026-08-06', postStart: '2026-07-09', postEnd: '2026-07-09', image: '💇', description: '다이슨 에어랩으로 다양한 헤어스타일을 연출하고 비포·애프터 콘텐츠를 제작해 주세요', reward: '에어랩 체험 (대여 1개월)', rewardAmount: 700000, headcount: 3, applied: 2, type: 'delivery' },
  { id: 71, brand: '필립스', name: '에어프라이어 레시피 챌린지', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-11', image: '🍳', description: '필립스 에어프라이어로 건강한 요리 레시피를 개발하고 콘텐츠를 제작해 주세요', reward: '에어프라이어 제공 (20만원 상당)', rewardAmount: 200000, headcount: 5, applied: 3, type: 'delivery', postType: '릴스 레시피' },
  { id: 72, brand: '이케아', name: '홈 오피스 인테리어 체험단', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-22', applyEnd: '2026-08-01', announceDate: '2026-08-05', postStart: '2026-07-08', postEnd: '2026-07-08', image: '🪑', description: '이케아 홈 오피스 가구로 나만의 작업 공간을 꾸미고 인테리어 콘텐츠를 제작해 주세요', reward: '이케아 상품권 15만원', rewardAmount: 150000, headcount: 8, applied: 4, type: 'delivery' },
  { id: 73, brand: '제주항공', name: '제주 여행 브이로그 제작', channel: '유튜브', category: '라이프스타일', status: '마감임박', applyStart: '2026-07-19', applyEnd: '2026-07-25', announceDate: '2026-07-29', postStart: '2026-07-01', postEnd: '2026-08-30', image: '✈️', description: '제주항공으로 제주도 여행을 다녀오고 여행 브이로그를 유튜브에 업로드해 주세요', reward: '왕복 항공권 + 숙박 3박 (80만원 상당)', rewardAmount: 800000, headcount: 2, applied: 2, type: 'visit', region: '제주도', conditions: ['구독자 5,000명 이상', '여행·라이프 유튜브 채널 보유'] },
  { id: 74, brand: '캐논', name: '미러리스 카메라 체험단', channel: '유튜브', category: '라이프스타일', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-12', image: '📷', description: '캐논 EOS R10 미러리스 카메라를 한 달간 체험하고 포토·영상 리뷰를 제작해 주세요', reward: 'EOS R10 1개월 체험 (대여, 100만원 상당)', rewardAmount: 1000000, headcount: 3, applied: 2, type: 'delivery' },
  { id: 75, brand: '삼성전자', name: '갤럭시 S25 일상 체험기', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-24', applyEnd: '2026-08-03', announceDate: '2026-08-07', postStart: '2026-08-10', postEnd: '2026-09-10', image: '📱', description: '갤럭시 S25로 일상을 기록하고 카메라 성능·AI 기능 활용 콘텐츠를 제작해 주세요', reward: 'S25 1개월 체험 (대여)', rewardAmount: 1200000, headcount: 5, applied: 3, type: 'delivery' },
  { id: 76, brand: '에이블리', name: '봄·여름 패션 코디 챌린지', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-03', image: '👗', description: '에이블리 봄여름 신상 코디를 구성하고 데일리룩 콘텐츠를 3회 이상 올려주세요', reward: '에이블리 쇼핑 크레딧 10만원', rewardAmount: 100000, headcount: 20, applied: 9, type: 'delivery' },
  { id: 77, brand: '무신사', name: '스트리트 패션 스타일링 챌린지', channel: '인스타그램', category: '라이프스타일', status: '마감임박', applyStart: '2026-07-20', applyEnd: '2026-07-25', announceDate: '2026-07-29', postStart: '2026-07-01', postEnd: '2026-08-21', image: '🧥', description: '무신사 스트리트 패션 아이템으로 스타일링을 완성하고 룩북 콘텐츠를 제작해 주세요', reward: '무신사 스토어 상품권 12만원', rewardAmount: 120000, headcount: 15, applied: 14, type: 'delivery' },
  { id: 78, brand: '오늘의집', name: '홈 인테리어 리모델링 체험', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-29', applyEnd: '2026-08-08', announceDate: '2026-08-12', postStart: '2026-08-15', postEnd: '2026-09-15', image: '🏠', description: '오늘의집 인테리어 소품으로 방 하나를 새롭게 꾸미고 변화 전후 콘텐츠를 올려주세요', reward: '인테리어 소품 구매 지원금 15만원', rewardAmount: 150000, headcount: 10, applied: 4, type: 'delivery' },
  { id: 79, brand: '카카오', name: '카카오페이 리워드 생활금융 체험', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-21', applyEnd: '2026-07-31', announceDate: '2026-08-04', postStart: '2026-07-07', postEnd: '2026-08-27', image: '💛', description: '카카오페이 리워드 서비스를 일상에서 사용하고 혜택·편리함을 콘텐츠로 공유해 주세요', reward: '카카오페이 포인트 5만원 + 활동비 3만원', rewardAmount: 30000, headcount: 30, applied: 16, type: 'delivery' },
  { id: 80, brand: '배달의민족', name: '배민오더 카페 체험단', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-04', image: '☕', description: '배민오더 제휴 카페를 방문하고 매장 분위기·음료 콘텐츠를 제작해 주세요', reward: '음료 쿠폰 4만원 + 활동비 3만원', rewardAmount: 30000, headcount: 25, applied: 12, type: 'visit', storeName: '배민오더 성수 제휴 카페', region: '서울 성동구' },
  { id: 81, brand: '파타고니아', name: '지속가능 패션 캠페인', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-11', image: '♻️', description: '파타고니아 리사이클 제품을 착용하고 지속가능한 라이프스타일 콘텐츠를 제작해 주세요', reward: '파타고니아 아이템 (20만원 상당)', rewardAmount: 200000, headcount: 5, applied: 3, type: 'delivery', conditions: ['환경·지속가능성 관심 계정', '팔로워 3,000명 이상'] },
  { id: 82, brand: '아디다스', name: '라이프스타일 스니커즈 착용 챌린지', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-02', image: '👟', description: '아디다스 오리지널스 스니커즈로 일상 코디를 완성하고 스트리트 패션 콘텐츠를 제작해 주세요', reward: '스니커즈 1켤레 (15만원 상당)', rewardAmount: 150000, headcount: 8, applied: 4, type: 'delivery' },
  { id: 83, brand: '쏘카', name: '카셰어링 주말 여행 콘텐츠', channel: '유튜브', category: '라이프스타일', status: '마감임박', applyStart: '2026-07-19', applyEnd: '2026-07-25', announceDate: '2026-07-29', postStart: '2026-07-01', postEnd: '2026-08-21', image: '🚗', description: '쏘카 카셰어링으로 주말 드라이브 또는 근교 여행을 다녀오고 브이로그를 제작해 주세요', reward: '쏘카 크레딧 10만원 + 활동비 5만원', rewardAmount: 50000, headcount: 5, applied: 5, type: 'delivery' },
  { id: 84, brand: '교보문고', name: '독서 라이프 콘텐츠 챌린지', channel: '인스타그램', category: '라이프스타일', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-13', image: '📚', description: '교보문고에서 선정한 추천 도서를 읽고 북스타그램 및 독서 브이로그를 제작해 주세요', reward: '도서 3권 (6만원 상당) + 교보 포인트 3만원', rewardAmount: 30000, headcount: 15, applied: 6, type: 'delivery' },
  { id: 85, brand: '넷플릭스', name: '홈 시네마 환경 꾸미기 체험', channel: '인스타그램', category: '라이프스타일', status: '종료', applyStart: '2026-07-07', applyEnd: '2026-07-19', announceDate: '2026-07-23', postStart: '2026-07-26', postEnd: '2026-08-16', image: '🎬', description: '넷플릭스 오리지널 신작을 홈 시네마 환경에서 감상하고 인테리어 + 감상 콘텐츠를 올려주세요', reward: '넷플릭스 3개월 무료권 + 활동비 3만원', rewardAmount: 30000, headcount: 20, applied: 20, type: 'delivery' },

  // 육아·펫 ──────────────────────────────────────────────────────────────────
  { id: 86, brand: '맘앤베이비', name: '유기농 이유식 체험단', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-21', applyEnd: '2026-07-31', announceDate: '2026-08-04', postStart: '2026-07-07', postEnd: '2026-07-07', image: '🍼', description: '맘앤베이비 유기농 이유식으로 아이의 첫 이유식을 시작하고 체험 후기를 공유해 주세요', reward: '이유식 1개월 세트 (12만원 상당)', rewardAmount: 120000, headcount: 15, applied: 6, type: 'delivery', conditions: ['육아·맘 계정', '6~12개월 아이 보유'] },
  { id: 87, brand: '하기스', name: '기저귀 30일 사용 리뷰', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-24', applyEnd: '2026-08-03', announceDate: '2026-08-07', postStart: '2026-08-10', postEnd: '2026-09-10', image: '👶', description: '하기스 신제품 기저귀를 30일 동안 실사용하고 흡수력·피부 자극도 솔직 리뷰를 남겨주세요', reward: '기저귀 1개월분 (8만원 상당)', rewardAmount: 80000, headcount: 20, applied: 8, type: 'delivery' },
  { id: 88, brand: '앱솔루트', name: '분유 한 달 체험단', channel: '네이버 블로그', category: '육아·펫', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-12', image: '🥛', description: '앱솔루트 프리미엄 분유를 한 달간 사용하고 아이 성장 변화를 블로그에 기록해 주세요', reward: '분유 1개월분 (15만원 상당)', rewardAmount: 150000, headcount: 10, applied: 4, type: 'delivery' },
  { id: 89, brand: '리틀팜', name: '유아 장난감 발달 체험단', channel: '인스타그램', category: '육아·펫', status: '마감임박', applyStart: '2026-07-18', applyEnd: '2026-07-27', announceDate: '2026-07-28', postStart: '2026-07-01', postEnd: '2026-08-21', image: '🎠', description: '리틀팜 발달 장난감 세트로 아이와 함께 놀고 놀이 교육 콘텐츠를 제작해 주세요', reward: '장난감 세트 (10만원 상당)', rewardAmount: 100000, headcount: 15, applied: 14, type: 'delivery' },
  { id: 90, brand: '닥터브로너스', name: '천연 아기 목욕용품 체험', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-13', image: '🛁', description: '닥터브로너스 천연 아기 전용 목욕용품을 사용하고 아이 피부 반응 리뷰를 공유해 주세요', reward: '아기 목욕 세트 (8만원 상당)', rewardAmount: 80000, headcount: 12, applied: 5, type: 'delivery' },
  { id: 91, brand: '롯데리아펫', name: '강아지 간식 체험 리뷰어', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-29', applyEnd: '2026-08-08', announceDate: '2026-08-12', postStart: '2026-08-15', postEnd: '2026-09-05', image: '🐶', description: '롯데리아펫 강아지 전용 간식을 체험하고 반려견 반응과 영양 성분을 리뷰해 주세요', reward: '간식 3개월분 (7만원 상당)', rewardAmount: 70000, headcount: 20, applied: 8, type: 'delivery', conditions: ['반려견 1마리 이상 보유', '펫 계정', '팔로워 1,000명 이상'] },
  { id: 92, brand: '퍼피아', name: '강아지 관절 보조제 4주 체험', channel: '네이버 블로그', category: '육아·펫', status: '모집중', applyStart: '2026-07-25', applyEnd: '2026-08-04', announceDate: '2026-08-08', postStart: '2026-08-11', postEnd: '2026-09-11', image: '💊', description: '퍼피아 강아지 관절 보조제를 4주 급여하고 관절 개선 변화를 블로그에 상세 기록해 주세요', reward: '관절 보조제 3개월분 (12만원 상당)', rewardAmount: 120000, headcount: 8, applied: 3, type: 'delivery' },
  { id: 93, brand: '캣닙', name: '고양이 프리미엄 사료 체험단', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-26', applyEnd: '2026-08-05', announceDate: '2026-08-09', postStart: '2026-08-12', postEnd: '2026-09-02', image: '🐱', description: '캣닙 그레인프리 프리미엄 사료를 4주 급여하고 고양이 털, 체중, 활동량 변화를 공유해 주세요', reward: '사료 3개월분 (10만원 상당)', rewardAmount: 100000, headcount: 15, applied: 6, type: 'delivery' },
  { id: 94, brand: '네이처스레시피', name: '대형견 전용 영양식 체험', channel: '유튜브', category: '육아·펫', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-14', image: '🦮', description: '네이처스레시피 대형견 전용 영양식을 4주 급여하고 유튜브 펫 리뷰 영상을 제작해 주세요', reward: '사료 2개월분 + 활동비 5만원', rewardAmount: 50000, headcount: 5, applied: 2, type: 'delivery' },
  { id: 95, brand: '닥터펫', name: '반려동물 종합 영양제 체험', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-23', applyEnd: '2026-08-02', announceDate: '2026-08-06', postStart: '2026-07-09', postEnd: '2026-08-29', image: '🐾', description: '닥터펫 반려동물 종합 영양제를 한 달간 급여하고 건강 변화 콘텐츠를 공유해 주세요', reward: '영양제 3개월분 (9만원 상당)', rewardAmount: 90000, headcount: 15, applied: 7, type: 'delivery' },
  { id: 96, brand: '맘스케어', name: '임산부 영양제 체험단', channel: '네이버 블로그', category: '육아·펫', status: '마감임박', applyStart: '2026-07-19', applyEnd: '2026-07-25', announceDate: '2026-07-29', postStart: '2026-07-01', postEnd: '2026-07-01', image: '🤰', description: '맘스케어 임산부 전용 영양제를 한 달 복용하고 임신 중 건강관리 체험기를 블로그에 작성해 주세요', reward: '영양제 2개월분 (18만원 상당)', rewardAmount: 180000, headcount: 8, applied: 7, type: 'delivery', conditions: ['임산부 또는 출산 후 12개월 이내', '육아 블로그 운영'] },
  { id: 97, brand: '스마트베어', name: '아이방 스마트 LED 체험', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-27', applyEnd: '2026-08-06', announceDate: '2026-08-10', postStart: '2026-08-13', postEnd: '2026-09-13', image: '💡', description: '스마트베어 아이방 LED 조명을 설치하고 아이 수면 환경 개선 콘텐츠를 제작해 주세요', reward: 'LED 조명 세트 (8만원 상당)', rewardAmount: 80000, headcount: 12, applied: 4, type: 'delivery' },
  { id: 98, brand: '터치미', name: '아이 천연 버블바스 체험단', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-28', applyEnd: '2026-08-07', announceDate: '2026-08-11', postStart: '2026-08-14', postEnd: '2026-09-04', image: '🫧', description: '터치미 천연 아이 버블바스 제품으로 목욕 시간을 즐겁게 만들고 아이 반응 콘텐츠를 올려주세요', reward: '버블바스 세트 (6만원 상당)', rewardAmount: 60000, headcount: 15, applied: 5, type: 'delivery' },
  { id: 99, brand: '짱구이유식', name: '짱구 이유식 월령별 체험', channel: '인스타그램', category: '육아·펫', status: '모집중', applyStart: '2026-07-29', applyEnd: '2026-08-08', announceDate: '2026-08-12', postStart: '2026-08-15', postEnd: '2026-09-15', image: '🥣', description: '짱구이유식 월령별 맞춤 이유식을 체험하고 아이 영양 성장 콘텐츠를 인스타그램에 공유해 주세요', reward: '이유식 1개월 구독 (10만원 상당)', rewardAmount: 100000, headcount: 20, applied: 9, type: 'delivery' },
  { id: 100, brand: '펫팸', name: '강아지 유모차 라이프 체험', channel: '유튜브', category: '육아·펫', status: '모집중', applyStart: '2026-07-30', applyEnd: '2026-08-09', announceDate: '2026-08-13', postStart: '2026-08-16', postEnd: '2026-09-16', image: '🛺', description: '펫팸 강아지 유모차로 반려견과 산책하는 라이프스타일 브이로그를 유튜브에 제작해 주세요', reward: '유모차 1개월 체험 (대여, 30만원 상당)', rewardAmount: 300000, headcount: 3, applied: 1, type: 'delivery', conditions: ['소형견 1마리 이상 보유', '유튜브 구독자 1,000명 이상'] },
]

// ────────────────────────────────────────────────────────────────────────────
// MyCampaign — 인플루언서가 신청·진행 중인 캠페인 (별도 세션 컨텍스트 데이터)
// mockCampaigns(탐색 가능한 모집 중 캠페인)와 ID 공간 분리 — `mc-` prefix 사용.
// 같은 id가 다른 캠페인을 가리키지 않도록 명확히 구분.
// ────────────────────────────────────────────────────────────────────────────
export type MyCampaignStatus = '지원완료' | '검토중' | '콘텐츠대기' | '검수중' | '승인' | '반려' | '완료' | '미선정'

export interface MyCampaign {
  /** 인플 사용자 참여 캠페인 식별자 — `mc-N` 형식. mockCampaigns(1~8)와 충돌 회피. */
  id: string
  name: string
  brand: string
  channel: string
  appliedAt: string
  deadline: string
  /** 캠페인 모집 마감일 — 원본 mypage L772-789: participateEndDate 기반 모집중/종료됨 계산 */
  applyEnd?: string
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
  /** 반려 사유 — 광고주가 콘텐츠를 반려할 때 입력한 피드백 */
  rejectReason?: string
  /** 활동비(원고료·포인트) — 0 초과 시 활동비 배지 */
  activityFee?: number
}

export const mockMyCampaigns: MyCampaign[] = [
  {
    id: 'mc-1', name: '프로틴 파워 챌린지', brand: '뉴트리션랩', channel: '인스타그램',
    appliedAt: '2026-04-28', deadline: '2026-07-28', applyEnd: '2026-07-08',
    status: '콘텐츠대기', progress: '콘텐츠를 제출해 주세요',
    reward: '80,000원', rewardAmount: 80000, activityFee: 150000, contentDeadline: '2026-07-28',
    campaignRef: 2,
    missionGuide: '제품을 사용한 운동 루틴 영상 또는 일상 콘텐츠 1개 + 솔직 후기 캡션. 협찬 표기 필수(@광고). 운동 전·후 변화 사진 포함 시 가산점.',
    requiredKeywords: ['뉴트리션랩', '프로틴', '단백질챌린지', '오운완'],
  },
  {
    id: 'mc-2', name: '필라테스 스튜디오 체험', brand: '바디앤핏', channel: '인스타그램',
    appliedAt: '2026-07-05', deadline: '2026-07-05', applyEnd: '2026-07-05',
    status: '검토중', progress: '브랜드에서 신청서를 검토하고 있어요',
    reward: '50,000원', rewardAmount: 50000, campaignRef: 3,
  },
  {
    id: 'mc-3', name: '아웃도어 장비 리뷰', brand: '아웃도어킹', channel: '네이버 블로그',
    appliedAt: '2026-04-10', deadline: '2026-07-29', applyEnd: '2026-04-20',
    status: '검수중', progress: '게시 콘텐츠 확인 중',
    reward: '120,000원', rewardAmount: 120000, activityFee: 200000, postUrl: 'https://blog.naver.com/chanstyler/12345', campaignRef: 5,
  },
  {
    id: 'mc-4', name: '헬스 보충제 캠페인', brand: 'SMILEATO', channel: '인스타그램',
    appliedAt: '2026-03-10', deadline: '2026-04-20', applyEnd: '2026-03-20',
    status: '완료', progress: '정산 가능',
    reward: '95,000원', rewardAmount: 95000, campaignRef: 2,
    postUrl: 'https://www.instagram.com/p/smileato_review_chanstyler',
  },
  {
    id: 'mc-5', name: '요가 스트레칭 밴드', brand: '필라핏', channel: '인스타그램',
    appliedAt: '2026-04-01', deadline: '2026-07-05', applyEnd: '2026-04-10',
    status: '미선정', progress: '미선정',
    reward: '60,000원', rewardAmount: 60000, campaignRef: 6,
  },
  {
    id: 'mc-6', name: '하이록스 챌린지 시즌 2', brand: 'enuf.sports', channel: '인스타그램',
    appliedAt: '2026-07-08', deadline: '2026-07-29', applyEnd: '2026-07-15',
    status: '콘텐츠대기', progress: '콘텐츠를 제출해 주세요',
    reward: '120,000원', rewardAmount: 120000, activityFee: 80000, contentDeadline: '2026-07-29',
    campaignRef: 3,
    missionGuide: '하이록스 종목 도전 영상 + 운동복/장비에 brand tag. 릴스 60초 이상, 본문에 운동 기록(시간·반복수) 포함.',
    requiredKeywords: ['enuf', '하이록스', 'hyrox', 'crossfit', '운동스타그램'],
  },
  {
    id: 'mc-7', name: '비건 단백질 신제품 체험', brand: '그린푸드', channel: '인스타그램',
    appliedAt: '2026-07-15', deadline: '2026-08-10', applyEnd: '2026-08-10',
    status: '지원완료', progress: '신청서가 접수됐어요',
    reward: '50,000원', rewardAmount: 50000,
    campaignRef: 1,
  },
  {
    id: 'mc-8', name: '크로스핏 장비 언박싱', brand: '아이언핏', channel: '인스타그램',
    appliedAt: '2026-07-01', deadline: '2026-07-01', applyEnd: '2026-07-10',
    status: '반려', progress: '콘텐츠가 반려되었습니다',
    reward: '90,000원', rewardAmount: 90000,
    postUrl: 'https://www.instagram.com/p/ironfit_unboxing_chanstyler',
    rejectReason: '필수 해시태그(#아이언핏, #크로스핏장비)가 캡션에 누락되었습니다. 해당 태그를 포함하여 재제출해 주세요.',
    campaignRef: 4,
    requiredKeywords: ['아이언핏', '크로스핏장비', 'crossfit', '홈트'],
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
