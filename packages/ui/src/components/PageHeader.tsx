/**
 * PageHeader — 광고주 앱 페이지 상단 공통 헤더
 *
 * 정책 (CLAUDE.md > "공통 페이지 헤더 정책"):
 * - 타이틀: text-2xl @md:text-3xl font-bold tracking-tight (모바일 H2 / PC H1)
 * - 설명: text-sm text-gray-500 (선택)
 * - actions: 우측 (DateRangePicker, 새 X 등록 버튼 등)
 * - 모바일에서는 actions가 다음 줄로 wrap (flex-col → flex-row at @sm)
 * - sticky 적용 시 상위에서 직접 sticky top-N + bg-white 처리
 */

import { memo, type ReactNode } from 'react'

export interface PageHeaderProps {
  title: ReactNode
  /** 보조 설명 — 타이틀 아래 */
  description?: ReactNode
  /** 우측 액션 영역 — DateRangePicker, CTA 버튼 등 */
  actions?: ReactNode
  /** 부가 메타 — 타이틀 우측 인라인 (배지·카운트 등) */
  meta?: ReactNode
  className?: string
}

const PageHeader = memo(function PageHeader({
  title,
  description,
  actions,
  meta,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3 @sm:gap-4 ${className}`.trim()}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {meta}
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="shrink-0 flex items-center gap-2 flex-wrap">{actions}</div>
      )}
    </header>
  )
})

export default PageHeader
