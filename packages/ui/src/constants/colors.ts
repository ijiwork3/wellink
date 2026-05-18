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
  /** 격자선 (CartesianGrid stroke prop) */
  grid: '#f1f5f9',
  /** 축 레이블 (tick fill prop) */
  axisLabel: '#94A3B8',
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

/** QA 목업킷 전용 강조색 */
export const QA_ACCENT_COLOR = '#8736E3' as const

/** 채도 정책 v4.4 (2026-05-16) — v4.3에서 S 64→62 미세 조정
 *  H 83° (파란 끼) 유지, S만 64→62
 *  packages/ui/src/theme.css 의 --color-brand-* 와 1:1 동기화
 */
export const BRAND = {
  /** 메인 그린 — HSL(83,62%,51%) (S 64→62) */
  green:      '#95D135',
  /** 텍스트 그린 — HSL(79,68%,29%), 대비 4.85:1 */
  greenText:  '#527E18',
  /** hover 그린 — HSL(83,62%,44%) */
  greenHover: '#82B62B',
  /** 연한 그린 배경 — HSL(79,72%,92%) */
  greenBg:    '#EFF9D8',
  /** 연한 그린 보더 — HSL(83,60%,68%) */
  greenBorder:'#BADE7E',
} as const

