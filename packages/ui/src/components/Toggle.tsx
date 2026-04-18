/**
 * Toggle — 스위치 토글
 * 브랜드 컬러(#8CC63F) 적용
 */

interface ToggleProps {
  checked: boolean
  onChange: () => void
  className?: string
}

export default function Toggle({ checked, onChange, className = '' }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:ring-offset-2
        ${checked ? 'bg-[#8CC63F]' : 'bg-gray-200'} ${className}`}
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
}
