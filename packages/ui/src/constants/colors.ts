/**
 * 웰링크 DS 색상 토큰
 * Tailwind arbitrary value 대신 이 상수를 사용할 것
 */

export const PLATFORM_COLORS = {
  naver:     '#03C75A',
  instagram: '#E1306C',
  youtube:   '#FF0000',
} as const

export const AVATAR_COLORS = [
  'bg-purple-100', 'bg-blue-100', 'bg-green-100',
  'bg-yellow-100', 'bg-pink-100', 'bg-indigo-100',
] as const

/** Recharts/SVG에서 Tailwind 클래스 불가한 경우에만 사용 */
export const CHART_COLORS = {
  /** 비활성/비교 데이터 막대 (Recharts fill prop) */
  inactive: '#D1D5DB',
  /** 격자선 (CartesianGrid stroke prop) — gray-100 */
  grid: '#f3f4f6',
  /** 축 레이블 (tick fill prop) — gray-500 */
  axisLabel: '#6b7280',
  /** 도달(reach) 라인 — 파랑 */
  reach: '#3B82F6',
  /** 저장(saves) 라인 — 보라 */
  saves: '#8B5CF6',
  /** 경고/주의 점수 — amber */
  warn: '#F59E0B',
  /** 차트 null 구간 배경 */
  nullBg: '#f9fafb',
  /** 차트 null 텍스트/라벨 */
  nullText: '#d1d5db',
  /** 공유(shares) 라인 — 에메랄드 그린 */
  shares: '#10b981',
} as const

/** SVG stroke/fill prop에서 Tailwind 클래스 불가한 경우에만 사용 */
export const SEMANTIC_COLORS = {
  /** 좋아요/하트 활성 */
  heart: '#EF4444',
  /** 좋아요/하트 비활성 */
  heartInactive: '#9CA3AF',
  /** 에러 아이콘 (SVG stroke) */
  error: '#EF4444',
  /** 성공/완료 아이콘 (SVG stroke) */
  success: '#22c55e',
} as const

/** 바이럴 콘텐츠 등급 도넛 전용 색상
 *  GradeDonut 등 SVG prop에서 BRAND·CHART_COLORS 대신 이 상수 사용 */
export const GRADE_COLORS = {
  A:          '#8DD435',  // BRAND.green
  B:          '#F59E0B',  // CHART_COLORS.warn (amber)
  C:          '#9CA3AF',  // gray-400
  D:          '#D1D5DB',  // gray-300
  E:          '#E5E7EB',  // gray-200
  processing: '#B5E27E',  // BRAND.greenBorder
} as const

/** QA 목업킷 전용 강조색 */
export const QA_ACCENT_COLOR = '#8736E3' as const

/** 채도 정책 v4.6 (2026-05-24) — v4.5에서 H+2°, S+1%, L+1% 미세 조정
 *  H 85→87°, S 64→65%, L +1%. 파란끼·고채도·명도 동시 소폭 상향.
 *  brand-green-text 대비 4.59:1 (AA 4.5 기준 유지).
 *  packages/ui/src/theme.css 의 --color-brand-* 와 1:1 동기화
 */
export const BRAND = {
  /** 메인 그린 — HSL(87,65%,52%) */
  green:      '#8DD435',
  /** 텍스트 그린 — HSL(90,71%,30%), 대비 4.59:1 */
  greenText:  '#4D8316',
  /** hover 그린 — HSL(87,65%,45%) */
  greenHover: '#7ABD28',
  /** 연한 그린 배경 — HSL(83,75%,93%) */
  greenBg:    '#F0FBE0',
  /** 연한 그린 보더 — HSL(87,63%,69%) */
  greenBorder:'#B5E27E',
} as const

