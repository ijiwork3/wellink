/**
 * Card / Section — 광고주 앱 전수 사용 공통 컨테이너
 *
 * Card     : 카드 표면(흰 배경 + border + radius). 가장 단순.
 * Section  : Card + 헤더(아이콘 + 타이틀). 상세/분석 페이지 표준.
 *
 * 정책 (CLAUDE.md > "공통 카드/섹션 정책"):
 * - radius: 카드 = rounded-xl (12px), 큰 영웅(hero) = rounded-2xl (16px)
 * - border: border border-gray-100 (기본) / border-gray-200 (강조)
 * - shadow: 기본 없음 / hover:shadow-md (인터랙티브) / shadow-sm (부유 강조)
 * - padding: p-4 @md:p-5 (기본). p-3·p-6은 콘텐츠 길이에 따라 직접.
 */

import { memo, type ReactNode, type HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** rounded-xl(기본) / rounded-2xl(영웅) */
  size?: 'md' | 'lg'
  /** 호버 시 그림자 + border 강조 */
  interactive?: boolean
  /** 패딩 — md(기본 p-4 @md:p-5) | sm(p-3) | lg(p-5 @md:p-6) | none */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children?: ReactNode
}

const SIZE: Record<NonNullable<CardProps['size']>, string> = {
  md: 'rounded-xl',
  lg: 'rounded-2xl',
}

const PAD: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 @md:p-5',
  lg: 'p-5 @md:p-6',
}

const Card = memo(function Card({
  size = 'md',
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  const base = `bg-white border border-gray-100 ${SIZE[size]} ${PAD[padding]}`
  const hover = interactive
    ? 'hover:border-gray-200 hover:shadow-md transition-all duration-150'
    : ''
  return (
    <div className={`${base} ${hover} ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
})

export default Card

/* ────────────────────────────────────────────────────────────────── */

export interface SectionProps {
  /** 섹션 타이틀 */
  title: ReactNode
  /** 좌측 아이콘 (선택) */
  icon?: ReactNode
  /** 헤더 우측 액션 — 버튼·드롭다운·필터 등 */
  action?: ReactNode
  /** 부가 설명 — 타이틀 아래 보조 문구 */
  description?: ReactNode
  /** 카드 외형 props (size·padding·interactive·className) */
  size?: CardProps['size']
  padding?: CardProps['padding']
  className?: string
  children: ReactNode
}

export const Section = memo(function Section({
  title,
  icon,
  action,
  description,
  size = 'md',
  padding = 'md',
  className = '',
  children,
}: SectionProps) {
  return (
    <Card size={size} padding={padding} className={className}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
            {icon && <span className="text-gray-500 shrink-0">{icon}</span>}
            <span className="min-w-0">{title}</span>
          </h2>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </Card>
  )
})
