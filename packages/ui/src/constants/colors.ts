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
  A:          '#8FD232',  // BRAND.green
  B:          '#F59E0B',  // CHART_COLORS.warn (amber)
  C:          '#9CA3AF',  // gray-400
  D:          '#D1D5DB',  // gray-300
  E:          '#E5E7EB',  // gray-200
  processing: '#B6E07B',  // BRAND.greenBorder
} as const

/** QA 목업킷 전용 강조색 */
export const QA_ACCENT_COLOR = '#8736E3' as const

/** 채도 정책 v4.5 (2026-05-24) — v4.4에서 H+2°, S+2% 미세 조정 (고채도·살짝 파란끼)
 *  H 83→85°, S 62→64%. 명도 유지. 대비 4.87:1 (AA 유지).
 *  packages/ui/src/theme.css 의 --color-brand-* 와 1:1 동기화
 */
export const BRAND = {
  /** 메인 그린 — HSL(85,64%,51%) */
  green:      '#8FD232',
  /** 텍스트 그린 — HSL(88,70%,29%), 대비 4.87:1 */
  greenText:  '#4D7E16',
  /** hover 그린 — HSL(85,64%,44%) */
  greenHover: '#7CB828',
  /** 연한 그린 배경 — HSL(81,74%,92%) */
  greenBg:    '#EFFADB',
  /** 연한 그린 보더 — HSL(85,62%,68%) */
  greenBorder:'#B6E07B',
} as const

