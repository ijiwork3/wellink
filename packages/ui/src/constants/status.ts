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
  '대기중': 'bg-amber-50 text-amber-700',
  '모집중': 'bg-[#8CC63F]/10 text-[#5a8228]',
  '진행중': 'bg-amber-50 text-amber-700',
  '완료':   'bg-[#8CC63F]/10 text-[#5a8228]',
  '종료':   'bg-gray-100 text-gray-500',
}

/** 인플루언서 참여 상태 배지 스타일 */
export const PARTICIPATION_STATUS_STYLE: Record<ParticipationStatus, string> = {
  '지원완료':   'bg-gray-100 text-gray-600',
  '검토중':     'bg-amber-50 text-amber-700',
  '선정':       'bg-[#8CC63F]/10 text-[#5a8228]',
  '미선정':     'bg-red-50 text-red-600',
  '콘텐츠대기': 'bg-gray-100 text-gray-600',
  '검수중':     'bg-sky-50 text-sky-700',
  '완료':       'bg-[#8CC63F]/10 text-[#5a8228]',
  '반려':       'bg-red-50 text-red-600',
}
