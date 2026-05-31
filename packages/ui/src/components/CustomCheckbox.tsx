/**
 * CustomCheckbox — 커스텀 체크박스
 *
 * label 은 string 또는 ReactNode (약관 동의처럼 인라인 링크 포함 가능).
 * label 클릭은 토글 — 단, ReactNode label 안의 button/link 클릭은 stopPropagation 으로 분리해야 함.
 */

import { memo, type ReactNode } from 'react'
import { Check } from 'lucide-react'

interface CustomCheckboxProps {
  checked: boolean
  onChange: () => void
  label: ReactNode
  /** 라벨 폰트 사이즈 (기본 sm) */
  labelClassName?: string
  /** 비활성 상태 */
  disabled?: boolean
  className?: string
  /** 접근성 — 시각 라벨 외 추가 라벨이 필요한 경우 */
  ariaLabel?: string
}

const CustomCheckbox = memo(function CustomCheckbox({
  checked,
  onChange,
  label,
  labelClassName = 'text-[15px]',
  disabled = false,
  className = '',
  ariaLabel,
}: CustomCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={`flex items-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-left ${className}`.trim()}
    >
      <div
        className={`w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 transition-all duration-150 border ${
          checked
            ? 'bg-brand-green border-brand-green shadow-sm'
            : 'bg-white border-gray-300 group-hover:border-brand-green/50'
        }`}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} aria-hidden="true" />}
      </div>
      <span className={`${labelClassName} transition-colors duration-150 ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
    </button>
  )
})

export default CustomCheckbox
