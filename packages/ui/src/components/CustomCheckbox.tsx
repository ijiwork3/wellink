/**
 * CustomCheckbox — 커스텀 체크박스
 */

import { memo } from 'react'
import { Check } from 'lucide-react'

interface CustomCheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
  className?: string
}

const CustomCheckbox = memo(function CustomCheckbox({ checked, onChange, label, className = '' }: CustomCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex items-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-lg ${className}`}
    >
      <div
        className={`w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150 border ${
          checked
            ? 'bg-brand-green border-brand-green shadow-sm'
            : 'bg-white border-gray-300 group-hover:border-brand-green/50'
        }`}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} aria-hidden="true" />}
      </div>
      <span className={`text-sm transition-colors duration-150 ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
    </button>
  )
})

export default CustomCheckbox
