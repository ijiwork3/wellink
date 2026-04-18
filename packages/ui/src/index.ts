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
export { default as Dropdown }       from './components/Dropdown'
export { default as SNSPanel }       from './components/SNSPanel'
export { ToastProvider, useToast }   from './components/Toast'
export { default as ErrorState }     from './components/ErrorState'

// 유틸 훅
export { useQAMode } from './utils/useQAMode'

// 포맷 유틸 — 데이터 정책 v1 §1-1, §1-2, §1-3
export { fmtNumber, fmtFollowers, fmtRate, fmtPrice } from './utils/format'
export { fmtDate } from './utils/fmtDate'
export { getDDay } from './utils/getDDay'

// DS 색상 토큰
export { BRAND } from './constants/colors'

// 상태값 상수 — 데이터 정책 v1 §3-1, §3-2
export {
  CAMPAIGN_STATUS, CAMPAIGN_STATUS_STYLE,
  PARTICIPATION_STATUS, PARTICIPATION_STATUS_STYLE,
} from './constants/status'
export type { CampaignStatus, ParticipationStatus } from './constants/status'
