/**
 * Toggle — 스위치 토글
 * 브랜드 컬러(brand-green) 적용
 */

import { memo } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: () => void
  className?: string
  label?: string
  /** 외부에 이미 가시 라벨 텍스트가 있을 때 그 id를 참조한다. 지정 시 label(aria-label) 보다 우선. */
  ariaLabelledBy?: string
}

const Toggle = memo(function Toggle({ checked, onChange, className = '', label, ariaLabelledBy }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabelledBy ? undefined : label}
      aria-labelledby={ariaLabelledBy}
      onClick={onChange}
      className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2
        ${checked ? 'bg-brand-green' : 'bg-gray-200'} ${className}`}
    >
      <span
        className="inline-block bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: '18px',
          height: '18px',
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
})

export default Toggle
