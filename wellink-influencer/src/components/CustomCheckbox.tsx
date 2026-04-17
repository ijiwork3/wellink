import { Check } from 'lucide-react'

interface CustomCheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
  className?: string
}

export default function CustomCheckbox({ checked, onChange, label, className = '' }: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
      className={`flex items-center gap-2.5 cursor-pointer group ${className}`}
    >
      <div
        className={`w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150 border ${
          checked
            ? 'bg-[#8CC63F] border-[#8CC63F] shadow-sm'
            : 'bg-white border-gray-300 group-hover:border-[#8CC63F]/50'
        }`}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>
      <span className={`text-sm transition-colors duration-150 ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
    </button>
  )
}
