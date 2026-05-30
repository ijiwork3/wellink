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
  /** 비활성/비교 데이터 막대 (Recharts fill prop) — gray-300 */
  inactive: '#D1D5DB',
  /** 격자선 (CartesianGrid stroke prop) — gray-100 */
  grid: '#f3f4f6',
  /** 축 레이블 텍스트 (tick fill prop) — gray-500 */
  axisLabel: '#6b7280',
  /** 축 보조선·크로스헤어 라인 색상 — gray-400 */
  axisLine: '#9ca3af',
  /** 다크 툴팁 배경 — gray-900 */
  tooltipBg: '#111827',
  /** 다크 툴팁 위 텍스트 — gray-200 */
  tooltipText: '#e5e7eb',
  /** 피드 콘텐츠 지표 라인/범례 — orange-500 */
  feed: '#f97316',
  /** 도달(reach) 라인 — 파랑 S+3% */
  reach: '#3983F9',
  /** 저장(saves) 라인 — 보라 S+3% */
  saves: '#8858F9',
  /** 경고/주의 점수 — amber S+3% */
  warn: '#F9A006',
  /** 차트 null 구간 배경 — gray-50 */
  nullBg: '#f9fafb',
  /** 차트 null 텍스트/라벨 — gray-300 */
  nullText: '#d1d5db',
  /** 공유(shares) 라인 — 에메랄드 그린 */
  shares: '#10b981',
} as const

/** SVG stroke/fill prop에서 Tailwind 클래스 불가한 경우에만 사용 */
export const SEMANTIC_COLORS = {
  /** 좋아요/하트 활성 */
  heart: '#F04242',
  /** 좋아요/하트 비활성 */
  heartInactive: '#9CA3AF',
  /** 에러 아이콘 (SVG stroke) */
  error: '#F04242',
  /** 성공/완료 아이콘 (SVG stroke) */
  success: '#22c55e',
} as const

/** 바이럴 콘텐츠 등급 도넛 전용 색상
 *  GradeDonut 등 SVG prop에서 BRAND·CHART_COLORS 대신 이 상수 사용 */
export const GRADE_COLORS = {
  A:          '#85D435',  // BRAND.green
  B:          '#F9A006',  // CHART_COLORS.warn (amber S+3%)
  C:          '#9CA3AF',  // gray-400
  D:          '#D1D5DB',  // gray-300
  E:          '#E5E7EB',  // gray-200
  processing: '#B0E27E',  // BRAND.greenBorder
} as const

/** QA 목업킷 전용 강조색 */
export const QA_ACCENT_COLOR = '#8736E3' as const

/** 채도 정책 v4.7 (2026-05-24) — v4.6에서 H+3° (파란끼 소폭 강화) + 보조색 S+3%
 *  brand-green: H 87→90°. 파랑·빨강·앰버·바이올렛 모두 채도 3% 상향.
 *  brand-green-text 대비 4.64:1 (AA 4.5 기준 유지).
 *  packages/ui/src/theme.css 의 --color-brand-* 와 1:1 동기화
 */
export const BRAND = {
  /** 메인 그린 — HSL(90,65%,52%) */
  green:      '#85D435',
  /** 텍스트 그린 — HSL(93,71%,30%), 대비 4.64:1 */
  greenText:  '#478316',
  /** hover 그린 — HSL(90,65%,45%) */
  greenHover: '#73BD28',
  /** 연한 그린 배경 — HSL(86,75%,93%) */
  greenBg:    '#EFFBE0',
  /** 연한 그린 보더 — HSL(90,63%,69%) */
  greenBorder:'#B0E27E',
} as const

