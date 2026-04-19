# 웰링크 개발자 핸드오프 스펙

> 이 문서는 FE 프로토타입 → 실서비스 BE 연동 시 개발자가 참조하는 단일 진실 공급원입니다.
> 마지막 업데이트: 2026-04-18 (§7 @wellink/ui 패키지 섹션 추가, 정책-코드 불일치 해소 사항 반영)

---

## 목차
1. [전역 규칙](#1-전역-규칙)
2. [공통 타입 & Enum](#2-공통-타입--enum)
3. [API 엔드포인트 목록](#3-api-엔드포인트-목록)
4. [Brand 앱 — 페이지별 스펙](#4-brand-앱--페이지별-스펙)
5. [Influencer 앱 — 페이지별 스펙](#5-influencer-앱--페이지별-스펙)
6. [기획 갭 & 미결 이슈](#6-기획-갭--미결-이슈)
7. [@wellink/ui 패키지 익스포트 현황](#7-wellink-ui-패키지-익스포트-현황)

---

## 1. 전역 규칙

### 1-1. 숫자 표기
| 종류 | 규칙 | 예시 |
|------|------|------|
| 팔로워/도달 | 만 단위 이상 K/M 축약 | 12,500 → 12.5K |
| 금액 | 천 단위 쉼표 + ₩ 접두사 | ₩5,000,000 |
| 비율/퍼센트 | 소수점 1자리 | 4.1% |
| ROAS | 소수점 1자리 + x 접미사 | 3.2x |
| 진행률 | 정수 % | 80% |

### 1-2. 날짜 표기
| 종류 | 규칙 | 예시 |
|------|------|------|
| 일반 날짜 | YYYY.MM.DD | 2026.04.18 |
| D-day | D-숫자 (당일: D-day, 초과: 마감) | D-3 |
| D-day 색상 | 3일 이하 빨강, 7일 이하 주황, 그 외 회색 | — |
| 상대 시간 | 방금, N분 전, N시간 전, N일 전 | 3분 전 |

### 1-3. 상태 색상 기준
| 지표 | 기준 | 색상 |
|------|------|------|
| 참여율 | 4%+ | 초록 |
| 참여율 | 2~4% | 회색 |
| 참여율 | 2% 미만 | 빨강 |
| FitScore | 85+ | 초록 |
| FitScore | 70~84 | 주황 |
| FitScore | 70 미만 | 회색 |
| ROAS | 3.0+ | 초록 |
| ROAS | 1.5~3.0 | 주황 |
| ROAS | 1.5 미만 & >0 | 빨강 |
| CTR | 2.0%+ | 초록 |
| CTR | 1.0~2.0% | 회색 |
| CTR | 1.0% 미만 | 빨강 |
| 바이럴 스코어 | 80+ | 초록 |
| 바이럴 스코어 | 50~79 | 주황 |
| 바이럴 스코어 | 50 미만 | 회색 |
| 모집 진행률 | 80%+ | 빨강 |
| 모집 진행률 | 80% 미만 | 초록 |

### 1-4. 빈 상태 처리 원칙
모든 리스트/차트 영역은 아래 3가지 상태를 반드시 처리:
- **loading**: 스켈레톤 UI
- **error**: 에러 아이콘 + 메시지 + 재시도 버튼
- **empty**: 빈 상태 일러스트 + 안내 문구 + CTA

---

## 2. 공통 타입 & Enum

### 2-1. 캠페인 상태 (CampaignStatus)
```typescript
type CampaignStatus =
  | '대기중'      // 캠페인 등록됨, 모집 시작 전
  | '모집중'      // 인플루언서 신청 받는 중
  | '마감임박'    // 마감 3일 이하 (자동 전환) — CAMPAIGN_STATUS.RUSHING
  | '진행중'      // 모집 마감, 콘텐츠 제작 단계
  | '종료'        // 캠페인 완전 종료
```

**상태 전환 흐름**: 대기중 → 모집중 → (마감임박) → 진행중 → 종료

> ✅ 코드 반영 완료 (2026-04-18): `CAMPAIGN_STATUS.RUSHING = '마감임박'` — `packages/ui/src/constants/status.ts`

### 2-2. 인플루언서 참여 상태 (ParticipationStatus)
```typescript
type ParticipationStatus =
  | '지원완료'    // 인플루언서가 신청함 (브랜드 미검토)
  | '검토중'      // 브랜드가 검토 중
  | '콘텐츠대기'  // 선정됨, 콘텐츠 제작 대기
  | '검수중'      // 콘텐츠 제출됨, 브랜드 검수 중
  | '완료'        // 검수 통과, 포인트 지급 완료
  | '미선정'      // 브랜드가 반려
```

**상태 전환 흐름**: 지원완료 → 검토중 → 콘텐츠대기 → 검수중 → 완료 (또는 미선정)

### 2-3. 콘텐츠 타입 (ContentType)
```typescript
type ContentType = '피드' | '릴스' | '스토리' | '숏폼' | '영상'
```

| 타입 | 배지 색상 |
|------|----------|
| 릴스 | 핑크 |
| 피드 | 파랑 |
| 스토리 | 보라 |
| 숏폼 | 에메랄드 |
| 영상 | 빨강 |

> ✅ 코드 반영 완료 (2026-04-18): `CONTENT_TYPE_STYLE` 상수로 타입→색상 매핑 구현 — `packages/ui/src/constants/status.ts`

### 2-4. 콘텐츠 승인 상태 (ContentApprovalStatus)
```typescript
type ContentApprovalStatus = '승인' | '검수중' | '대기중' | '반려'
```

### 2-5. 플랫폼 (Platform)
```typescript
type Platform = '인스타그램' | '유튜브' | '틱톡' | '네이버 블로그' | '블로그'
```

### 2-6. 팔로워 등급 (FollowerTier)
```typescript
type FollowerTier = '나노' | '마이크로' | '매크로' | '메가'
```

| 등급 | 범위 |
|------|------|
| 나노 | ~1만 |
| 마이크로 | 1만~10만 |
| 매크로 | 10만~100만 |
| 메가 | 100만+ |

> ✅ 코드 반영 완료 (2026-04-18): `FOLLOWER_TIER` 상수 + `FollowerTier` 타입 — `packages/ui/src/constants/status.ts`

### 2-7. 캠페인 카테고리 (CampaignCategory)
```typescript
type CampaignCategory =
  | '피트니스' | '요가' | '웰니스' | '필라테스'
  | '운동' | '크로스핏' | '뷰티/패션' | '맛집/푸드'
  | '어필/스포츠' | '라이프스타일' | '기타'
```

### 2-8. 구독 플랜 (SubscriptionPlan)
```typescript
type SubscriptionPlan = 'free' | 'focus' | 'scale' | 'infinite'
```

| 플랜 | 가격 | 팔로워 도달 |
|------|------|------------|
| free | 0 | 제한 |
| focus | ₩99,000/월 | ~5,000명 |
| scale | ₩299,000/월 | 50,000명+ |
| infinite | 커스텀 | 무제한 |

### 2-9. 광고 목표 (AdObjective)
```typescript
type AdObjective = '인지도' | '전환' | '트래픽'
```

### 2-10. 광고 캠페인 상태 (AdCampaignStatus)
```typescript
type AdCampaignStatus = '게재중' | '종료' | '일시중지'
```

> ✅ 코드 반영 완료 (2026-04-18): `AD_CAMPAIGN_STATUS` 상수 + `AdCampaignStatus` 타입 — `packages/ui/src/constants/status.ts`

### 2-11. 조회 기간 (ViewPeriod)
```typescript
type ViewPeriod = '일간' | '주간' | '월간' | '연간'
```

---

## 3. API 엔드포인트 목록

> 아래는 FE 프로토타입에서 더미 데이터로 처리된 영역을 기반으로 도출한 API 목록입니다.
> 실제 구현 시 경로명은 팀 컨벤션에 따라 조정 가능합니다.

### 3-1. 인증 (Auth)
| Method | Path | 설명 |
|--------|------|------|
| POST | /auth/login | 로그인 (brand/influencer 공통, userType 파라미터) |
| POST | /auth/logout | 로그아웃 |
| POST | /auth/signup/brand | 브랜드 회원가입 |
| POST | /auth/signup/influencer | 인플루언서 회원가입 |
| POST | /auth/phone/send | 전화번호 인증번호 발송 |
| POST | /auth/phone/verify | 전화번호 인증번호 확인 |
| PATCH | /auth/password | 비밀번호 변경 |
| DELETE | /auth/withdraw | 회원탈퇴 |

### 3-2. 브랜드 (Brand)
| Method | Path | 설명 |
|--------|------|------|
| GET | /brand/me | 브랜드 마이페이지 정보 |
| PATCH | /brand/me | 브랜드 정보 수정 |
| POST | /brand/sns/connect | SNS 계정 연결 |
| DELETE | /brand/sns/disconnect | SNS 계정 연결 해제 |

### 3-3. 캠페인 (Campaign)
| Method | Path | 설명 |
|--------|------|------|
| GET | /campaigns | 캠페인 목록 (브랜드용) |
| GET | /campaigns/:id | 캠페인 상세 |
| POST | /campaigns | 캠페인 등록 |
| PATCH | /campaigns/:id | 캠페인 수정 |
| DELETE | /campaigns/:id | 캠페인 삭제 |
| GET | /campaigns/browse | 인플루언서용 캠페인 탐색 목록 |

**GET /campaigns 쿼리 파라미터**
```
status?: CampaignStatus
search?: string
page?: number
limit?: number
```

### 3-4. 인플루언서 신청 (Application)
| Method | Path | 설명 |
|--------|------|------|
| POST | /campaigns/:id/apply | 캠페인 신청 |
| DELETE | /campaigns/:id/apply | 신청 취소 |
| GET | /campaigns/:id/applicants | 지원자 목록 (브랜드용) |
| PATCH | /campaigns/:id/applicants/:userId/select | 인플루언서 선정 |
| PATCH | /campaigns/:id/applicants/:userId/reject | 인플루언서 반려 |
| GET | /campaigns/my | 내 신청 캠페인 목록 (인플루언서용) |

**PATCH reject body**
```json
{ "reason": "반려 사유 (max 300자)" }
```

### 3-5. 콘텐츠 (Content)
| Method | Path | 설명 |
|--------|------|------|
| POST | /campaigns/:id/contents | 콘텐츠 제출 (인플루언서) |
| GET | /campaigns/:id/contents | 등록 콘텐츠 목록 (브랜드) |
| PATCH | /contents/:id/approve | 콘텐츠 승인 |
| PATCH | /contents/:id/reject | 콘텐츠 반려 |
| GET | /contents | 콘텐츠 라이브러리 전체 |
| GET | /contents/:id/download | 콘텐츠 다운로드 (유료, ₩5,000) |

**POST /contents body**
```json
{ "url": "https://...", "type": "ContentType" }
```

### 3-6. 인플루언서 (Influencer)
| Method | Path | 설명 |
|--------|------|------|
| GET | /influencers | 인플루언서 목록 |
| GET | /influencers/:id | 인플루언서 상세 |
| POST | /influencers/:id/bookmark | 북마크 |
| DELETE | /influencers/:id/bookmark | 북마크 해제 |
| POST | /influencers/:id/propose | 캠페인 제안 |
| GET | /influencers/me | 인플루언서 내 정보 |
| PATCH | /influencers/me | 인플루언서 정보 수정 |

**GET /influencers 쿼리 파라미터**
```
category?: CampaignCategory
followerTier?: FollowerTier
fitScoreMin?: number
engagementMin?: number
search?: string
page?: number
limit?: number
```

### 3-7. 인플루언서 그룹 (Group)
| Method | Path | 설명 |
|--------|------|------|
| GET | /groups | 그룹 목록 |
| POST | /groups | 그룹 생성 |
| DELETE | /groups/:id | 그룹 삭제 |
| POST | /groups/:id/influencers | 그룹에 인플루언서 추가 |
| DELETE | /groups/:id/influencers/:influencerId | 그룹에서 인플루언서 제거 |

### 3-8. 분석 (Analytics)
| Method | Path | 설명 |
|--------|------|------|
| GET | /analytics/profile | 프로필 인사이트 |
| GET | /analytics/ad-performance | 광고 성과 |
| GET | /analytics/viral-metrics | 바이럴 지표 |

**공통 쿼리 파라미터**
```
period: ViewPeriod
dateFrom?: string (YYYY-MM-DD)
dateTo?: string (YYYY-MM-DD)
```

### 3-9. DM (Direct Message)
| Method | Path | 설명 |
|--------|------|------|
| GET | /dm/conversations | 대화 목록 |
| GET | /dm/conversations/:id/messages | 메시지 목록 |
| POST | /dm/conversations/:id/messages | 메시지 전송 |

### 3-10. SNS 미디어 연결 (Media)
| Method | Path | 설명 |
|--------|------|------|
| POST | /media/connect | SNS 채널 연결 |
| DELETE | /media/:platformId/disconnect | SNS 채널 연결 해제 |
| GET | /media | 연결된 SNS 채널 목록 |

### 3-11. 구독/결제 (Subscription)
| Method | Path | 설명 |
|--------|------|------|
| GET | /subscription | 현재 구독 정보 |
| POST | /subscription/change | 플랜 변경 |
| GET | /subscription/payments | 결제 내역 |
| POST | /subscription/payment-method | 결제 수단 등록 |
| GET | /subscription/invoice/:id | 청구서 다운로드 |

### 3-12. AI 인플루언서 추천 (AI)
| Method | Path | 설명 |
|--------|------|------|
| POST | /ai/recommend | AI 인플루언서 추천 요청 |
| GET | /ai/recommend/:jobId | 추천 결과 조회 (비동기) |

**POST /ai/recommend body**
```json
{
  "keywords": ["string"],
  "budget": number,
  "category": "CampaignCategory",
  "followerTier": "FollowerTier"
}
```

### 3-13. 알림 (Notification)
| Method | Path | 설명 |
|--------|------|------|
| GET | /notifications | 알림 목록 |
| PATCH | /notifications/:id/read | 읽음 처리 |
| PATCH | /notifications/read-all | 전체 읽음 처리 |

---

## 4. Brand 앱 — 페이지별 스펙

### 4-1. Dashboard

**필요 데이터**
```typescript
interface DashboardData {
  kpis: {
    activeCampaigns: number         // 활성 캠페인 수
    activeCampaignsDelta: number    // 전기간 대비 증감
    activeInfluencers: number       // 진행중 인플루언서 수
    activeInfluencersDelta: number
    monthlyReach: number            // 이번달 도달
    monthlyReachDeltaPct: number    // 전기간 대비 %
    pendingReview: number           // 검수대기 수
    pendingReviewDelta: number
  }
  campaigns: Array<{
    id: string
    name: string
    status: CampaignStatus
    headcount: number               // 목표 인원
    current: number                 // 현재 신청 인원
    progress: number                // 진행률 (0-100)
    deadline: string                // YYYY-MM-DD
  }>
  contentChart: {                   // 콘텐츠 등록 추이
    period: ViewPeriod
    labels: string[]
    values: number[]
  }
  notifications: Array<{
    id: string
    type: 'campaign' | 'influencer' | 'content' | 'system'
    text: string
    time: string                    // ISO datetime
    unread: boolean
    route?: string                  // 클릭 시 이동 경로
  }>
  isNewUser: boolean                // 온보딩 가이드 표시 여부
}
```

**엣지 케이스**
- `campaigns` 빈 배열 → 온보딩 UI 표시 (신규 사용자 동일)
- `isNewUser: true` → 온보딩 가이드 오버레이
- 구독 플랜 free → `isPlanLocked: true`, 일부 KPI 잠금 처리

---

### 4-2. Campaigns (캠페인 목록)

**필요 데이터**
```typescript
interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  category: CampaignCategory
  headcount: number
  current: number
  progress: number                // 0-100
  budget: number                  // 원 단위
  platform: Platform[]
  reach: number
  engagementRate: number          // 0-100 (%)
  thumbnail?: string              // 이미지 URL
  deadline: string                // YYYY-MM-DD
  createdAt: string
}
```

**필터/정렬 파라미터**
```
status: 전체 | 대기중 | 모집중 | 종료
search: string (name, category 대상)
sortBy: createdAt | deadline | progress
```

---

### 4-3. CampaignDetail (캠페인 상세)

**필요 데이터**
```typescript
interface CampaignDetailData {
  campaign: Campaign & {
    description: string
    goal: string
    channels: Platform[]
    startDate: string
    endDate: string
    applyDeadline: string
    supplyMethod: '배송' | '직접 방문' | '제공 없음'
    brandHashtags: string[]
    requiredGuide: string
    prohibitedGuide: string
    snsExternalUse: '사용 가능' | '사용 불가'
  }
  applicants: Array<{
    id: string
    name: string
    followers: number
    engagementRate: number
    fitScore: number
    appliedAt: string
    avatar?: string
    platform: Platform
  }>
  selectedApplicants: Array<{      // 선정된 인플루언서
    id: string
    name: string
    followers: number
    engagementRate: number
    fitScore: number
    status: ParticipationStatus
    avatar?: string
  }>
  registeredContents: Array<{
    id: string
    thumbnail?: string
    influencer: string
    type: ContentType
    reach: number
    likes: number
    comments: number
    saves: number
    approvalStatus: ContentApprovalStatus
    submittedAt: string
    url: string
  }>
  reportKPIs: {
    totalReach: number
    totalLikes: number
    totalComments: number
    avgEngagementRate: number
    dailyReachChart: Array<{ date: string; value: number }>
  }
}
```

**액션별 API**
- "선정" → `PATCH /campaigns/:id/applicants/:userId/select`
- "반려" → `PATCH /campaigns/:id/applicants/:userId/reject` + body: `{ reason }`
- "콘텐츠 승인" → `PATCH /contents/:id/approve`
- "콘텐츠 반려" → `PATCH /contents/:id/reject` + body: `{ reason }`
- "콘텐츠 다운로드" → `GET /contents/:id/download` (₩5,000 결제 선행)

---

### 4-4. CampaignNew (캠페인 등록)

**5단계 폼 구조**

**Step 1 — 기본정보**
```typescript
{
  name: string                    // 필수
  goal: '인지도' | '전환' | '팔로워' | '콘텐츠' | '기타'  // 필수
  channels: Platform[]            // 필수, 1개 이상
  campaignType: '기본캠페인' | '공동구매'
  startDate: string               // YYYY-MM-DD, 필수
  endDate: string                 // YYYY-MM-DD, 필수, startDate+7일 이상
  applyDeadline: string           // YYYY-MM-DD, 필수, startDate 이전
  brandHashtags: string[]
}
```

**Step 2 — 예산·조건**
```typescript
{
  budget: number                  // 전체 예산 (원), 필수
  minUnit: number                 // 최소 단가 (원)
  maxUnit: number                 // 최대 단가 (원)
  headcount: number               // 모집 인원, 필수
  supplyMethod: '배송' | '직접 방문' | '제공 없음'
}
```

**유효성 검사**: `budget >= maxUnit * headcount`

**Step 3 — 원고 가이드**
```typescript
{
  requiredGuide: string           // 필수 사항
  prohibitedGuide: string         // 금지 사항
  hashtags: string[]              // 필수 해시태그
  contentRef?: string             // 참고 콘텐츠 링크
  snsExternalUse: '사용 가능' | '사용 불가'
}
```

**Step 4 — 인플루언서 선택**
```typescript
{
  selectedInfluencerIds: string[] // AI 추천 또는 직접 선택
}
```

**Step 5 — 검토 발행** (read-only 확인)

**API**: `POST /campaigns` (전체 5단계 합산)

---

### 4-5. AIListup (AI 인플루언서 추천)

**입력값**
```typescript
{
  keywords: string                // 자유 입력
  budget?: number
  category?: CampaignCategory
  followerTier?: FollowerTier
  platformFilter?: Platform | '전체'
}
```

**결과 데이터**
```typescript
interface AIRecommendResult {
  influencers: Array<{
    id: string
    name: string
    platform: Platform
    followers: number
    engagementRate: number        // 0-100
    authenticRate: number         // 진성 팔로워 비율 0-100
    categories: CampaignCategory[]
    fitScore: number              // 0-100
    rank: number                  // 1, 2, 3...
  }>
  analysisSteps: string[]         // 분석 단계 로그 (UI용)
}
```

**비동기 처리**: `POST /ai/recommend` → jobId 반환 → 폴링 `GET /ai/recommend/:jobId`

---

### 4-6. AdPerformance (광고 성과)

**필요 데이터**
```typescript
interface AdPerformanceData {
  kpis: {
    spend: number
    reach: number
    clicks: number
    roas: number
    spendTrend: number[]          // 기간별 배열
  }
  campaigns: Array<{
    name: string
    objective: AdObjective
    spend: number
    reach: number
    clicks: number
    ctr: number                   // 0-100 (%)
    conversions: number
    roas: number
    status: AdCampaignStatus
  }>
  adFormats: Array<{
    format: string                // '피드', '릴스', '스토리' 등
    impressions: number
    clicks: number
    ctr: number
    cpm: number
  }>
  isConnected: boolean            // Instagram/Meta 연결 여부
}
```

**쿼리 파라미터**: `period: ViewPeriod`, `dateFrom`, `dateTo`

---

### 4-7. ViralMetrics (바이럴 지표)

**필요 데이터**
```typescript
interface ViralMetricsData {
  kpis: {
    reach: number
    shares: number
    saves: number
    viralCoefficient: number      // 배수 (예: 2.3x)
    trends: {
      reach: number               // 전기간 대비 %
      shares: number
      saves: number
      viral: number
    }
  }
  contents: Array<{
    id: string
    title: string
    influencer: string
    type: ContentType
    reach: number
    likes: number
    comments: number
    saves: number
    shares: number
    viralScore: number            // 0-100
  }>
  trendChart: {
    labels: string[]
    reach: number[]
    saves: number[]
    shares: number[]
  }
  isConnected: boolean
}
```

---

### 4-8. InfluencerList (인플루언서 목록)

**필요 데이터**
```typescript
interface Influencer {
  id: string
  name: string
  platform: Platform
  followers: number
  engagementRate: number          // 0-100
  posts: number
  authenticRate: number           // 진성 팔로워 비율
  categories: CampaignCategory[]
  lastActive: string              // YYYY-MM-DD
  fitScore: number                // 0-100
  isBookmarked: boolean
  avatar?: string
}
```

**필터 옵션**
```
category: CampaignCategory | '전체'
followerTier: FollowerTier | '전체'
fitScore: '85점 이상' | '70점 이상' | '70점 미만' | '전체'
engagement: '높음 (4%+)' | '보통 (2~4%)' | '낮음 (<2%)' | '전체'
search: string
page: number (5명 per page)
```

**제안 모달 body**
```typescript
{ campaignId: string }
// POST /influencers/:id/propose
```

---

### 4-9. InfluencerManage (인플루언서 관리)

**필요 데이터**
```typescript
interface ManagedInfluencer {
  id: string
  name: string
  categories: CampaignCategory[]
  followers: number
  engagementRate: number
  fitScore: number
  groups: string[]                // 그룹 이름 배열
}

interface Group {
  id: string
  name: string
  count: number
}
```

**액션**
- 그룹 생성: `POST /groups` + body: `{ name }`
- 그룹 삭제: `DELETE /groups/:id`
- 인플루언서 그룹 추가: `POST /groups/:id/influencers` + body: `{ influencerId }`
- 인플루언서 그룹 제거: `DELETE /groups/:id/influencers/:influencerId`

---

### 4-10. ProfileInsight (프로필 인사이트)

**필요 데이터**
```typescript
interface ProfileInsightData {
  kpis: {
    followers: number
    followersDelta: number
    reach: number
    reachDeltaPct: number
    engagementRate: number
    impressions: number
    impressionsDeltaPct: number
  }
  followerChart: Array<{
    label: string
    value: number | null           // null = 데이터 없는 날
  }>
  trendChart: {
    labels: string[]
    likes: (number | null)[]
    comments: (number | null)[]
    reach: (number | null)[]
    saves: (number | null)[]
  }
  contentTypes: Array<{
    type: ContentType
    avgReach: number
    avgLikes: number
    engagementRate: number
  }>
  isConnected: boolean
}
```

**null 처리**: 데이터 없는 날짜는 null → 차트에서 해당 포인트 표시 안 함 (라인 끊김)

---

### 4-11. Library (콘텐츠 라이브러리)

**필요 데이터**
```typescript
interface LibraryContent {
  id: string
  creator: string                 // 인플루언서 이름
  campaign: string                // 캠페인 이름
  type: ContentType
  platform: Platform
  date: string                    // 게시 또는 제출일
  reach: number
  likes: number
  comments: number
  saves: number
  shareRate: number               // 0-100 (%)
  engagementRate: number          // 0-100
  approvalStatus: ContentApprovalStatus
  thumbnail?: string
  url: string
}
```

**필터/정렬**
```
campaign: string | '전체'
type: ContentType | '전체'
platform: Platform | '전체'
approvalStatus: ContentApprovalStatus | '전체'
sortBy: 'date' | 'reach' | 'likes'
```

---

### 4-12. DMManage (DM 관리)

**필요 데이터**
```typescript
interface Conversation {
  id: string
  name: string                    // 상대방 이름
  avatar?: string
  lastMessage: string
  lastMessageTime: string         // ISO datetime
  unreadCount: number
}

interface Message {
  id: string
  from: 'me' | 'them'
  text: string
  sentAt: string                  // ISO datetime
}
```

**실시간**: WebSocket 또는 Server-Sent Events 권장 (현재 폴링으로도 구현 가능)

---

### 4-13. MyPage (브랜드 마이페이지)

**필요 데이터**
```typescript
interface BrandProfile {
  name: string
  email: string                   // 변경 불가
  companyName: string
  businessNumber: string          // XXX-XX-XXXXX 형식
  managerName: string
  phone: string
  snsHandle?: string              // Instagram 비즈니스 계정
  currentPlan: SubscriptionPlan
  isInstagramConnected: boolean
}
```

**유효성 검사**
- 사업자번호: `/^\d{3}-\d{2}-\d{5}$/`
- 비밀번호 변경: 8자 이상, 영문+숫자 조합
- 회원탈퇴: "탈퇴" 정확 입력 필요

---

### 4-14. Subscription (구독)

**필요 데이터**
```typescript
interface SubscriptionData {
  currentPlan: SubscriptionPlan
  status: 'active' | 'trial' | 'expired' | 'payment-failed' | 'free'
  trialEndsAt?: string            // ISO datetime (trial 중일 때)
  nextBillingDate?: string
  paymentMethod?: {
    brand: string                 // 'Visa', 'Mastercard' 등
    last4: string
    expiryMonth: number
    expiryYear: number
  }
  paymentHistory: Array<{
    id: string
    date: string
    description: string
    amount: number
    status: 'completed' | 'pending' | 'failed'
  }>
}
```

**플랜 변경 body**
```typescript
{ planId: 'focus' | 'scale' | 'infinite' }
// POST /subscription/change
```

**다운그레이드 경고 조건**: scale → focus 변경 시 경고 모달 표시

---

## 5. Influencer 앱 — 페이지별 스펙

### 5-1. Home (인플루언서 홈)

**필요 데이터**
```typescript
interface InfluencerHomeData {
  bookmarkedCampaigns: Array<{
    id: string
    name: string
    brand: string
    category: CampaignCategory
    channels: Platform[]
    deadline: string              // YYYY-MM-DD
    reward: string                // 자유 텍스트 (예: "제품 제공 + 활동비 10만원")
    headcount: number
    applied: number
    status: CampaignStatus
    thumbnailColor?: string       // 없으면 기본색
    isBookmarked: boolean
  }>
}
```

**주의**: 진행률 = `Math.min(100, Math.round((applied / headcount) * 100))`

---

### 5-2. CampaignBrowse (캠페인 탐색)

**필요 데이터**
```typescript
interface BrowseCampaign {
  id: string
  name: string
  brand: string
  category: CampaignCategory
  channels: Platform[]
  deadline: string
  reward: string
  headcount: number
  applied: number
  status: CampaignStatus
  tags: string[]                  // 예: ['체험단', '릴스', '무료제공']
  thumbnailColor?: string
  isBookmarked: boolean
  applyEnd: string                // 신청 마감일
}
```

**필터**
```
category: CampaignCategory | '전체'
search: string (name, brand 대상)
```

---

### 5-3. CampaignDetail (인플루언서용 캠페인 상세)

**필요 데이터**
```typescript
interface CampaignDetailForInfluencer {
  id: string
  name: string
  brand: string
  category: CampaignCategory
  channels: Platform[]
  status: CampaignStatus
  applyEnd: string                // 신청 마감
  postEnd: string                 // 게시 마감
  reward: string
  conditions: string[]            // 참여 조건 배열
  description: string
  requiredGuide: string
  prohibitedGuide: string
  hashtags: string[]
  headcount: number
  applied: number
  isBookmarked: boolean
  hasApplied: boolean             // 이미 신청했는지
}
```

**신청 API**: `POST /campaigns/:id/apply`

**상태 표시**
- `status === '마감임박'`: 주황색 띠 + animate-pulse
- `hasApplied`: 버튼 "신청완료" (비활성)
- `status === '종료'`: 버튼 비활성

---

### 5-4. MyCampaign (내 캠페인)

**필요 데이터**
```typescript
interface MyCampaignItem {
  id: string
  name: string
  channel: Platform
  appliedAt: string               // YYYY-MM-DD
  deadline: string                // YYYY-MM-DD
  status: ParticipationStatus
  progress: string                // 현재 단계 설명 텍스트
  reward: number                  // 원 단위 (fmtPrice로 표시)
}
```

**상태별 가능 액션**
| 상태 | 액션 | API |
|------|------|-----|
| 지원완료 | 수정, 취소 | navigate + DELETE /campaigns/:id/apply |
| 검토중 | 취소 | DELETE /campaigns/:id/apply |
| 콘텐츠대기 | 콘텐츠 제출 | POST /campaigns/:id/contents |
| 검수중 | 상세보기 | — |
| 완료 | 상세보기 | — |
| 미선정 | 상세보기 | — |

**콘텐츠 제출 유효성**: URL 형식 검사 (`^https?://`)

---

### 5-5. Profile (인플루언서 프로필)

**필요 데이터**
```typescript
interface InfluencerProfile {
  name: string                    // 필수
  email: string                   // 읽기 전용
  instagram?: string              // @ 제외
  activityFields: CampaignCategory[]
  marketing: boolean              // 마케팅 동의
  stats: {
    followers: number
    avgEngagementRate: number
    completedCampaigns: number
  }
}
```

**저장 유효성**
- name: 필수
- activityFields: 1개 이상 선택

---

### 5-6. Media (SNS 미디어 연결)

**필요 데이터**
```typescript
interface MediaPlatform {
  id: 'naver' | 'instagram' | 'youtube'
  name: string
  connected: boolean
  url?: string                    // 연결된 채널 URL/핸들
  followers?: number
  engagementRate?: number
}
```

**연결 모달 입력 형식**
| 플랫폼 | 입력 형식 | Placeholder |
|--------|----------|------------|
| 네이버 블로그 | URL | https://blog.naver.com/아이디 |
| 인스타그램 | @핸들 | @인스타그램 아이디 |
| 유튜브 | URL | https://www.youtube.com/@채널명 |

**참여율 색상**: ≥4% 초록, ≥2.5% 회색, 그 외 빨강

---

## 6. 기획 갭 & 미결 이슈

> 아래 항목은 FE 코드에 더미 데이터 또는 미구현으로 처리되어 있으며, **기획 확정이 필요**합니다.

### 🔴 High — 개발 블로킹 이슈

| # | 위치 | 이슈 | 현재 상태 |
|---|------|------|----------|
| 1 | 전체 | 인증 방식 미정 | JWT vs 세션, 소셜 로그인 여부 |
| 2 | Login | 로그인 검증 로직 | test@wellink.co.kr 하드코딩, 실 서버 연동 필요 |
| 3 | Subscription | 결제 시스템 미정 | 아임포트/토스페이먼츠 등 PG사 미결정 |
| 4 | Content | 콘텐츠 다운로드 결제 | ₩5,000 로직 있으나 PG 연동 없음 |
| 5 | AIListup | AI 추천 백엔드 | 3초 setTimeout → 실 AI API 연동 필요 |
| 6 | AdPerformance / ProfileInsight | SNS 연동 | Instagram/Meta API 연동 미구현 |

### 🟡 Medium — 기획 확인 필요

| # | 위치 | 이슈 | 내용 |
|---|------|------|------|
| 7 | Signup (Influencer) | 인스타그램 인증 | 현재 입력값 형식만 검증, 실제 계정 존재 여부 검증 필요한지? |
| 8 | Signup (Brand) | 사업자번호 검증 | 형식 검증만 있음, 국세청 API 연동 여부? |
| 9 | CampaignDetail | 반려 사유 노출 범위 | 브랜드→인플루언서 반려 사유가 인플루언서 앱에 표시되는지? |
| 10 | DMManage | DM 수신자 범위 | 브랜드↔인플루언서만? 브랜드↔브랜드 가능? |
| 11 | InfluencerList | FitScore 계산 기준 | 현재 더미 숫자, 실제 계산 알고리즘 정의 필요 |
| 12 | MyCampaign | 리워드 표기 | 원고료는 숫자, 제품 제공은 텍스트 — 혼용 처리 방식? |
| 13 | Library | 다운로드 정책 | 어떤 플랜부터 다운로드 가능? 횟수 제한? |
| 14 | Campaigns | 캠페인 수정 | 모집중 상태에서 수정 가능 범위? |

### 🟢 Low — 추후 결정 가능

| # | 위치 | 이슈 | 내용 |
|---|------|------|------|
| 15 | DMManage | 실시간 메시지 | WebSocket 도입 시점 |
| 16 | Profile (Influencer) | 프로필 사진 | "준비 중이에요" toast — 업로드 기능 추가 시점 |
| 17 | Profile (Influencer) | 회원탈퇴 | "준비 중이에요" toast — 탈퇴 로직 구현 시점 |
| 18 | Notification | 실시간 알림 | 푸시 알림 vs 인앱 알림 방식 |
| 19 | CampaignNew | 임시저장 | "자동 저장됨" UI 있음 — 서버 임시저장 구현 여부 |
| 20 | AIListup | FitScore 기준 설명 | 사용자에게 계산 기준 노출 여부 |

---

## 7. @wellink/ui 패키지 익스포트 현황

> `packages/ui/src/index.ts` 기준 — 마지막 동기화: 2026-04-18

### 7-1. 컴포넌트

| 카테고리 | 익스포트 이름 | 비고 |
|---------|-------------|------|
| 배지 | `StatusBadge` | `KnownStatus` 타입 함께 익스포트 |
| 배지 | `PlatformBadge` | |
| 카드 | `KPICard` | |
| 카드 | `InfluencerCard` | |
| 입력 | `CustomSelect` | |
| 입력 | `TagInput` | |
| 입력 | `FileUpload` | |
| 입력 | `Toggle` | |
| 입력 | `CustomCheckbox` | |
| 피드백·레이어 | `Modal` | |
| 피드백·레이어 | `Dropdown` | |
| 피드백·레이어 | `SNSPanel` | |
| 피드백·레이어 | `ToastProvider`, `useToast` | |
| 피드백·레이어 | `ErrorState` | |
| 인증 | `ProtectedRoute` | sessionStorage 기반 더미 인증 가드 |

### 7-2. 유틸 & 훅

| 이름 | 종류 | 설명 |
|------|------|------|
| `auth` | 유틸 | sessionStorage 기반 더미 인증 (`login`, `logout`, `isAuthenticated`, `getUser`) |
| `useQAMode` | 훅 | QA 모드 토글 |
| `fmtNumber` | 포맷 유틸 | 천 단위 쉼표 (§1-1) |
| `fmtFollowers` | 포맷 유틸 | K/M 축약 (§1-1) |
| `fmtRate` | 포맷 유틸 | 소수점 1자리 % (§1-1) |
| `fmtPrice` | 포맷 유틸 | ₩ + 천 단위 쉼표 (§1-1) |
| `formatFollowers` | 포맷 유틸 | `fmtFollowers` 별칭 |
| `fmtDate` | 포맷 유틸 | YYYY.MM.DD 형식 (§1-2) |
| `getDDay` | 포맷 유틸 | D-숫자 / D-day / 마감 (§1-2) |

### 7-3. 상수

| 이름 | 관련 타입 | 설명 |
|------|---------|------|
| `BRAND` | — | DS 색상 토큰 |
| `INPUT_BASE` | — | 공통 input Tailwind 클래스 문자열 |
| `CAMPAIGN_STATUS` | `CampaignStatus` | `RUSHING = '마감임박'` 포함 (§2-1) |
| `CAMPAIGN_STATUS_STYLE` | `CampaignStatus` | 상태별 배지 색상 매핑 |
| `PARTICIPATION_STATUS` | `ParticipationStatus` | (§2-2) |
| `PARTICIPATION_STATUS_STYLE` | `ParticipationStatus` | 상태별 배지 색상 매핑 |
| `FOLLOWER_TIER` | `FollowerTier` | 나노/마이크로/매크로/메가 (§2-6) |
| `AD_CAMPAIGN_STATUS` | `AdCampaignStatus` | 게재중/종료/일시중지 (§2-10) |
| `CONTENT_TYPE_STYLE` | `ContentType` | 콘텐츠 타입별 배지 색상 매핑 (§2-3) |

### 7-4. 지표 색상 유틸

| 함수 | 기준 섹션 | 반환 |
|------|---------|------|
| `getEngagementColor(rate)` | §1-3 참여율 | `'text-green-*'` \| `'text-gray-*'` \| `'text-red-*'` |
| `getFitScoreColor(score)` | §1-3 FitScore | `'text-green-*'` \| `'text-orange-*'` \| `'text-gray-*'` |
| `getRoasColor(roas)` | §1-3 ROAS | `'text-green-*'` \| `'text-orange-*'` \| `'text-red-*'` |
| `getRecruitmentColor(pct)` | §1-3 모집 진행률 | `'text-red-*'` \| `'text-green-*'` |
| `getDDayColor(dday)` | §1-2 D-day 색상 | Tailwind 색상 클래스 |

### 7-5. 실서비스 전환 시 교체 대상

| 항목 | 현재 구현 | 교체 방향 |
|------|---------|---------|
| `auth` 유틸 | sessionStorage 더미 | JWT / 세션 쿠키 기반 실 인증 (§6 이슈 #1, #2) |
| `ProtectedRoute` | `auth.isAuthenticated()` 로컬 체크 | 서버 토큰 검증으로 교체 |
