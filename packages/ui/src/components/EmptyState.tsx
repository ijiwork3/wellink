/**
 * EmptyState — 데이터 없음 / 검색·필터 결과 없음 공통 표시
 *
 * 정책 (CLAUDE.md > "공통 빈/에러/로딩 상태 정책"):
 * - 아이콘: 32~48px, text-gray-300 (눈에 거슬리지 않게)
 * - 타이틀: text-[15px] font-semibold text-gray-500 (가시성↑, 강조 ❌)
 * - 보조: text-[15px] text-gray-400
 * - CTA: 선택. 있으면 outline 스타일(과한 강조 회피)
 *
 * variant:
 *  - 'default' : 일반 빈 상태 (등록된 데이터가 없음)
 *  - 'search'  : 검색 결과 없음
 *  - 'filter'  : 필터 결과 없음
 *  - 'error'   : 에러는 ErrorState 사용 (별도 컴포넌트)
 */

import { memo, type ReactNode } from 'react'
import { Inbox, Search, Filter } from 'lucide-react'

export type EmptyVariant = 'default' | 'search' | 'filter'

export interface EmptyStateProps {
  /** 메인 메시지 */
  title: ReactNode
  /** 보조 메시지 */
  description?: ReactNode
  /** 아이콘 — 미지정 시 variant에 따라 자동 */
  icon?: ReactNode
  variant?: EmptyVariant
  /** 액션 버튼 영역 — outline CTA 권장 */
  action?: ReactNode
  /** 컨테이너 패딩 — 카드 내부 vs 페이지 전체에 따라 조정 */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ICON_BY_VARIANT: Record<EmptyVariant, React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>> = {
  default: Inbox,
  search: Search,
  filter: Filter,
}

const SIZE_MAP: Record<NonNullable<EmptyStateProps['size']>, { wrap: string; icon: number }> = {
  sm: { wrap: 'py-8 gap-2',  icon: 32 },
  md: { wrap: 'py-12 gap-3', icon: 40 },
  lg: { wrap: 'py-16 gap-4', icon: 48 },
}

const EmptyState = memo(function EmptyState({
  title,
  description,
  icon,
  variant = 'default',
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const { wrap, icon: iconSize } = SIZE_MAP[size]
  const Icon = ICON_BY_VARIANT[variant]
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center text-center px-4 ${wrap} ${className}`.trim()}
    >
      <div className="text-gray-300 shrink-0" aria-hidden="true">
        {icon ?? <Icon size={iconSize} />}
      </div>
      <p className="text-[15px] font-semibold text-gray-500 break-keep max-w-md">{title}</p>
      {description && (
        <p className="text-[15px] text-gray-400 max-w-md whitespace-pre-line break-keep">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
})

export default EmptyState
