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
  /** KPI bad 지표 스트로크 — rose-500 */
  badStroke: '#f43f5e',
  /** KPI bad 지표 뮤트 배경 — rose-300 */
  badMuted: '#fda4af',
  /** 콘텐츠 상세 — 조회수 메인 (green-600) */
  contentViews: '#16a34a',
  /** 콘텐츠 상세 — 조회수 평균 dashed (green-400) */
  contentViewsAvg: '#4ade80',
  /** 콘텐츠 상세 — 증가 조회수 메인 (orange-500) */
  contentViewsInc: '#f97316',
  /** 콘텐츠 상세 — 증가 조회수 평균 dashed (amber-400) */
  contentViewsIncAvg: '#fbbf24',
  /** 콘텐츠 상세 — 좋아요 메인 (pink-500) */
  contentLikes: '#ec4899',
  /** 콘텐츠 상세 — 좋아요 평균 dashed (pink-300) */
  contentLikesAvg: '#f9a8d4',
  /** 콘텐츠 상세 — 댓글 메인 (violet-700) */
  contentComments: '#7c3aed',
  /** 콘텐츠 상세 — 댓글 평균 dashed (violet-400) */
  contentCommentsAvg: '#a78bfa',
  /** 콘텐츠 상세 — 참여율 메인 (cyan-700) */
  contentEngage: '#0891b2',
  /** 콘텐츠 상세 — 참여율 평균 dashed (cyan-300) */
  contentEngageAvg: '#67e8f9',
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
  /** 인라인 style prop 전용 — primary 텍스트 (gray-900) */
  textPrimary: '#111827',
  /** 인라인 style prop 전용 — secondary 텍스트 (gray-700) */
  textSecondary: '#374151',
  /** SVG dot/icon 흰색 (stroke·fill — 배경 대비 구분선) */
  white: '#ffffff',
} as const

/** 바이럴 콘텐츠 등급 도넛 전용 색상
 *  GradeDonut 등 SVG prop에서 BRAND·CHART_COLORS 대신 이 상수 사용 */
export const GRADE_COLORS = {
  A:          '#2563EB',  // BRAND.green (cobalt blue)
  B:          '#F9A006',  // CHART_COLORS.warn (amber S+3%)
  C:          '#9CA3AF',  // gray-400
  D:          '#D1D5DB',  // gray-300
  E:          '#E5E7EB',  // gray-200
  processing: '#BFDBFE',  // BRAND.greenBorder (light blue)
} as const

/** 시맨틱 성공·긍정 지표 — 브랜드 컬러(바이올렛)와 분리. KPI 상승·차트 good severity 전용
 *  컬러 정책 v5.0 (2026-05-31): 블루그린 HSL(158,100%,39%) — 바이올렛과 트라이어드 배색
 *  옐로우그린(HSL<145) 계열 금지. 텍스트 대비 7.1:1 */
export const SUCCESS = {
  /** 블루그린 — HSL(158,100%,39%) — 차트 스트로크·스파크라인 상승 */
  green:       '#00C896',
  /** 텍스트 — HSL(158,100%,21%), 대비 7.1:1 */
  greenText:   '#006B4A',
  /** 연한 배경 */
  greenBg:     '#E5FFF9',
  /** 보더 */
  greenBorder: '#7AE8C8',
} as const

/** QA 목업킷 전용 강조색 */
export const QA_ACCENT_COLOR = '#8736E3' as const

/** 썸네일 placeholder SVG 그라디언트 팔레트 — thumbnailPlaceholder.ts 전용 */
export const THUMBNAIL_PALETTES: { from: string; to: string }[] = [
  { from: '#e8f5e9', to: '#66bb6a' },  // 그린
  { from: '#e3f2fd', to: '#42a5f5' },  // 블루
  { from: '#f3e5f5', to: '#ab47bc' },  // 퍼플
  { from: '#fff3e0', to: '#ffa726' },  // 오렌지
  { from: '#fce4ec', to: '#ec407a' },  // 핑크
  { from: '#e8eaf6', to: '#5c6bc0' },  // 인디고
  { from: '#e0f7fa', to: '#26c6da' },  // 시안
  { from: '#f1f8e9', to: '#9ccc65' },  // 라임
]

/** 컬러 정책 v6.0 (2026-05-31) — 코발트 블루 × 에메랄드.
 *  brand-green-text(blue-800) 대비 8.9:1 (AAA).
 *  packages/ui/src/theme.css 의 --color-brand-* 와 1:1 동기화
 */
export const BRAND = {
  /** 메인 코발트 블루 — blue-600 (#2563EB) */
  green:      '#2563EB',
  /** 텍스트 블루 — blue-800, 대비 8.9:1 */
  greenText:  '#1E40AF',
  /** hover 블루 — blue-700 */
  greenHover: '#1D4ED8',
  /** 연한 블루 배경 — blue-50 */
  greenBg:    '#EFF6FF',
  /** 연한 블루 보더 — blue-200 */
  greenBorder:'#BFDBFE',
  /** 에메랄드 — emerald-500 — 그라디언트·액센트 전용 */
  fuchsia:      '#10B981',
  /** 에메랄드 텍스트 — emerald-800, 대비 7.5:1 */
  fuchsiaText:  '#065F46',
  /** 연한 에메랄드 배경 — emerald-50 */
  fuchsiaBg:    '#ECFDF5',
  /** 연한 에메랄드 보더 — emerald-200 */
  fuchsiaBorder:'#A7F3D0',
} as const

