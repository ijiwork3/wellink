/** 데이터 정책 v1 기준 임계값 상수 */

export const FITSCORE_THRESHOLD = {
  excellent: 85,
  average: 70,
} as const

export const ENGAGEMENT_THRESHOLD = {
  high: 4,
  low: 2,
} as const

export const ROAS_THRESHOLD = {
  good: 3.0,
  average: 1.5,
} as const

export const CTR_THRESHOLD = {
  good: 3,
  average: 1.5,
} as const

export const AUTHENTIC_THRESHOLD = {
  high: 80,
  average: 60,
} as const

export const DDAY_THRESHOLD = {
  urgent: 3,
  warning: 7,
} as const

export const RECRUITMENT_THRESHOLD = {
  closing: 80,
} as const

/** 데이터 정책 v1 §3-5: 모집 진행률 경고(80%+) / 위험(90%+) */
export const PROGRESS_THRESHOLD = {
  warning: 80,
  critical: 90,
} as const
