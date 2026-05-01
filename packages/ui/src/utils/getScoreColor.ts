/**
 * 지표별 색상 유틸 — 데이터 정책 v1 §1-3
 * 모든 함수는 Tailwind 클래스 문자열을 반환합니다.
 */

import {
  ENGAGEMENT_THRESHOLD,
  FITSCORE_THRESHOLD,
  ROAS_THRESHOLD,
  RECRUITMENT_THRESHOLD,
  DDAY_THRESHOLD,
  AUTHENTIC_THRESHOLD,
  CTR_THRESHOLD,
} from '../constants/thresholds'

/** 참여율 색상: 4%+ 초록, 2~4% 앰버, 2% 미만 빨강 */
export function getEngagementColor(rate: number): string {
  if (rate >= ENGAGEMENT_THRESHOLD.high) return 'text-green-600'
  if (rate >= ENGAGEMENT_THRESHOLD.low) return 'text-amber-600'
  return 'text-red-500'
}

/** FitScore 색상: 85+ 초록, 70~84 주황, 70 미만 회색 */
export function getFitScoreColor(score: number): string {
  if (score >= FITSCORE_THRESHOLD.excellent) return 'text-green-600'
  if (score >= FITSCORE_THRESHOLD.average) return 'text-orange-500'
  return 'text-gray-400'
}

/** ROAS 색상: 3.0+ 초록, 1.5~3.0 주황, 1.5 미만 빨강 */
export function getRoasColor(roas: number): string {
  if (roas >= ROAS_THRESHOLD.good) return 'text-green-600'
  if (roas >= ROAS_THRESHOLD.average) return 'text-orange-500'
  return 'text-red-500'
}

/** 모집 진행률 색상: 80%+ 빨강(마감 임박), 80% 미만 초록 */
export function getRecruitmentColor(pct: number): string {
  if (pct >= RECRUITMENT_THRESHOLD.closing) return 'text-red-500'
  return 'text-green-600'
}

/** D-day 색상: 3일 이하 빨강, 7일 이하 주황, 그 외 회색 */
export function getDDayColor(dday: number): string {
  if (dday <= DDAY_THRESHOLD.urgent) return 'text-red-500'
  if (dday <= DDAY_THRESHOLD.warning) return 'text-orange-500'
  return 'text-gray-400'
}

/** 진성 비율 색상: 80%+ 브랜드그린, 60~79% 앰버, 60% 미만 빨강 */
export function getAuthenticColor(rate: number): string {
  if (rate >= AUTHENTIC_THRESHOLD.high) return 'text-green-600'
  if (rate >= AUTHENTIC_THRESHOLD.average) return 'text-amber-600'
  return 'text-red-500'
}

/** FitScore 뱃지 클래스: 85+ 초록, 70~84 앰버, 70 미만 회색 */
export function getFitScoreBadge(score: number): string {
  if (score >= FITSCORE_THRESHOLD.excellent) return 'bg-brand-green/10 text-brand-green-text'
  if (score >= FITSCORE_THRESHOLD.average) return 'bg-amber-50 text-amber-700'
  return 'bg-gray-100 text-gray-500'
}

/** FitScore 레이블: 85+ 우수, 70~84 보통, 70 미만 개선필요 */
export function getFitScoreLabel(score: number): string {
  if (score >= FITSCORE_THRESHOLD.excellent) return '우수'
  if (score >= FITSCORE_THRESHOLD.average) return '보통'
  return '개선필요'
}

/** fitScore 기반 추천 캠페인 타입: 85+ 릴스 리뷰형, 70~84 피드 협찬형, 70 미만 스토리 언급형 */
export function getRecommendedCampaignType(fitScore: number): string {
  if (fitScore >= FITSCORE_THRESHOLD.excellent) return '릴스 리뷰형'
  if (fitScore >= FITSCORE_THRESHOLD.average) return '피드 협찬형'
  return '스토리 언급형'
}

/** CTR 색상: 3%+ 초록, 1.5~3% 주황, 1.5% 미만 빨강 */
export function getCtrColor(rate: number): string {
  if (rate >= CTR_THRESHOLD.good) return 'text-green-600'
  if (rate >= CTR_THRESHOLD.average) return 'text-orange-500'
  return 'text-red-500'
}
