/**
 * PageHeader — 광고주 앱 페이지 상단 공통 헤더
 *
 * 정책 (CLAUDE.md > "공통 페이지 헤더 정책"):
 * - 타이틀: text-2xl @md:text-3xl font-bold tracking-tight (모바일 H2 / PC H1)
 * - 설명: text-[15px] text-gray-500 (선택)
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
    /* @container — 자식의 @sm/@md 컨테이너 쿼리가 헤더 폭 기준으로 동작. */
    <header className={`@container flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3 @sm:gap-4 ${className}`.trim()}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900 break-keep min-w-0">
            {title}
          </h1>
          {meta}
        </div>
        {description && (
          <p className="text-[15px] text-gray-500 mt-1 break-keep">{description}</p>
        )}
      </div>
      {actions && (
        /* actions 그룹 — 모바일에서는 풀폭(다음 줄), @sm 이상에서 shrink-0 우측 정렬.
         * 기존 항상 shrink-0 + 모바일에서 다음 줄로 내려가지만 actions 자체 폭이 viewport 침범. */
        <div className="w-full @sm:w-auto @sm:shrink-0 flex items-center gap-2 flex-wrap">{actions}</div>
      )}
    </header>
  )
})

export default PageHeader
