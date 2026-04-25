/**
 * 캠페인·인플루언서 참여 상태값 — 데이터 정책 v1 §3-1, §3-2
 */

/** 캠페인 상태 (브랜드 관점) */
export const CAMPAIGN_STATUS = {
  PENDING:    '대기중',   // 모집 시작 전
  RECRUITING: '모집중',   // 지원 접수 중
  IN_PROGRESS:'진행중',   // 콘텐츠 제작 중
  DONE:       '완료',     // 콘텐츠 승인 완료
  CLOSED:     '종료',     // 조기 종료
  RUSHING:    '마감임박', // 마감 3일 이하 자동 전환
} as const

export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS]

/** 인플루언서 참여 상태 */
export const PARTICIPATION_STATUS = {
  APPLIED:         '지원완료',
  REVIEWING:       '검토중',
  SELECTED:        '선정',
  REJECTED:        '미선정',
  CONTENT_PENDING: '콘텐츠대기',
  REVIEWING_CONTENT: '검수중',
  DONE:            '완료',
  RETURNED:        '반려',
} as const

export type ParticipationStatus = typeof PARTICIPATION_STATUS[keyof typeof PARTICIPATION_STATUS]

/** 캠페인 상태 배지 스타일 */
export const CAMPAIGN_STATUS_STYLE: Record<CampaignStatus, string> = {
  '대기중':   'bg-amber-50 text-amber-700',
  '모집중':   'bg-brand-green/10 text-brand-green-text',
  '진행중':   'bg-emerald-100 text-emerald-700',
  '완료':     'bg-brand-green/10 text-brand-green-text',
  '종료':     'bg-gray-100 text-gray-500',
  '마감임박': 'bg-orange-100 text-orange-700',
}

/** 인플루언서 참여 상태 배지 스타일 */
export const PARTICIPATION_STATUS_STYLE: Record<ParticipationStatus, string> = {
  '지원완료':   'bg-gray-100 text-gray-600',
  '검토중':     'bg-amber-50 text-amber-700',
  '선정':       'bg-brand-green/10 text-brand-green-text',
  '미선정':     'bg-red-50 text-red-600',
  '콘텐츠대기': 'bg-gray-100 text-gray-600',
  '검수중':     'bg-sky-50 text-sky-700',
  '완료':       'bg-brand-green/10 text-brand-green-text',
  '반려':       'bg-red-50 text-red-600',
}

// FollowerTier 정의 (정책 §2-6)
export const FOLLOWER_TIER = {
  NANO:  '나노',    // ~1만
  MICRO: '마이크로', // 1만~10만
  MACRO: '매크로',  // 10만~100만
  MEGA:  '메가',   // 100만+
} as const
export type FollowerTier = (typeof FOLLOWER_TIER)[keyof typeof FOLLOWER_TIER]

// AdCampaignStatus 정의 (정책 §2-10)
export const AD_CAMPAIGN_STATUS = {
  ACTIVE: '게재중',
  CLOSED: '종료',
  PAUSED: '일시중지',
} as const
export type AdCampaignStatus = (typeof AD_CAMPAIGN_STATUS)[keyof typeof AD_CAMPAIGN_STATUS]

// 정책 §8.3 — 플랫폼별 게시 유형
// 인스타그램: 피드/릴스/스토리, 유튜브: 영상/쇼츠, 네이버 블로그·틱톡: 서브타입 없음
export type ContentType = '피드' | '릴스' | '스토리' | '영상' | '쇼츠'

export const CONTENT_TYPE_STYLE: Record<ContentType, string> = {
  '피드':  'bg-blue-100 text-blue-700',
  '릴스':  'bg-pink-100 text-pink-700',
  '스토리': 'bg-purple-100 text-purple-700',
  '영상':  'bg-orange-100 text-orange-700',
  '쇼츠':  'bg-emerald-100 text-emerald-700',
}
