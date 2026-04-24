/**
 * @wellink/ui — 전사 공통 컴포넌트 패키지
 *
 * 사용법:
 *   import { StatusBadge, KPICard, Modal } from '@wellink/ui'
 *   import { useToast, ToastProvider } from '@wellink/ui'
 *   import { useQAMode } from '@wellink/ui'
 */

// 배지
export { default as StatusBadge }    from './components/StatusBadge'
export { default as PlatformBadge }  from './components/PlatformBadge'

// 카드
export { default as KPICard }        from './components/KPICard'
export { default as InfluencerCard } from './components/InfluencerCard'

// 입력
export { default as CustomSelect }   from './components/CustomSelect'
export { default as TagInput }       from './components/TagInput'
export { default as FileUpload }     from './components/FileUpload'
export { default as Toggle }         from './components/Toggle'
export { default as CustomCheckbox } from './components/CustomCheckbox'

// 피드백·레이어
export { default as Modal }          from './components/Modal'
export { default as BottomSheet }    from './components/BottomSheet'
export { default as Dropdown }       from './components/Dropdown'
export { default as SNSPanel }       from './components/SNSPanel'
export { ToastProvider, useToast }   from './components/Toast'
export { default as ErrorState }     from './components/ErrorState'
export { ErrorBoundary } from './components/ErrorBoundary'

// 인증
export { ProtectedRoute } from './components/ProtectedRoute'
export { auth } from './utils/auth'

// 유틸 훅
export { useQAMode } from './utils/useQAMode'

// 인플루언서 공통 정렬 정책
export {
  INFLUENCER_SORT_OPTIONS,
  DEFAULT_INFLUENCER_SORT,
  sortInfluencers,
} from './utils/sortInfluencers'
export type { InfluencerSortKey, SortOption } from './utils/sortInfluencers'

// 포맷 유틸 — 데이터 정책 v1 §1-1, §1-2, §1-3
export { fmtNumber, fmtFollowers, fmtRate, fmtPrice, formatFollowers } from './utils/format'
export { fmtDate } from './utils/fmtDate'
export { getDDay, getDDayBadgeStyle } from './utils/getDDay'
export type { DayResult } from './utils/getDDay'
export { getDateLabel } from './utils/getDateLabel'
export type { DatePeriod } from './utils/getDateLabel'

// DS 색상 토큰
export { BRAND, AVATAR_COLORS, PLATFORM_COLORS, CHART_COLORS, SEMANTIC_COLORS, QA_ACCENT_COLOR } from './constants/colors'
// 공용 스타일 상수
export { INPUT_BASE } from './constants/styles'
// 타이머 상수
export { TIMER_MS } from './constants/timers'

// 비즈니스 로직 임계값 상수 — 데이터 정책 v1
export {
  FITSCORE_THRESHOLD,
  ENGAGEMENT_THRESHOLD,
  ROAS_THRESHOLD,
  CTR_THRESHOLD,
  AUTHENTIC_THRESHOLD,
  DDAY_THRESHOLD,
  RECRUITMENT_THRESHOLD,
  PROGRESS_THRESHOLD,
} from './constants/thresholds'

// 상태값 상수 — 데이터 정책 v1 §3-1, §3-2
export {
  CAMPAIGN_STATUS, CAMPAIGN_STATUS_STYLE,
  PARTICIPATION_STATUS, PARTICIPATION_STATUS_STYLE,
  FOLLOWER_TIER,
  AD_CAMPAIGN_STATUS,
  CONTENT_TYPE_STYLE,
} from './constants/status'
export type { CampaignStatus, ParticipationStatus, FollowerTier, AdCampaignStatus, ContentType } from './constants/status'
export type { KnownStatus } from './components/StatusBadge'

// 지표 색상 유틸 — 데이터 정책 v1 §1-3
export {
  getEngagementColor,
  getFitScoreColor,
  getRoasColor,
  getRecruitmentColor,
  getDDayColor,
  getAuthenticColor,
  getFitScoreBadge,
  getFitScoreLabel,
  getRecommendedCampaignType,
  getCtrColor,
} from './utils/getScoreColor'
