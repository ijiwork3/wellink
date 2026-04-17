import { useRef, useEffect, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  label: string
  value: string
}

interface CustomSelectProps {
  value: string | string[]
  onChange: (val: string | string[]) => void
  options: Option[]
  placeholder?: string
  multiple?: boolean
  className?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  multiple = false,
  className = '',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isSelected = (val: string) => {
    if (multiple) return (value as string[]).includes(val)
    return value === val
  }

  const handleSelect = (val: string) => {
    if (multiple) {
      const arr = value as string[]
      if (arr.includes(val)) {
        onChange(arr.filter(v => v !== val))
      } else {
        onChange([...arr, val])
      }
    } else {
      onChange(val)
      setOpen(false)
    }
  }

  const displayLabel = () => {
    if (multiple) {
      const arr = value as string[]
      if (arr.length === 0) return placeholder
      if (arr.length === 1) return options.find(o => o.value === arr[0])?.label ?? arr[0]
      return `${arr.length}개 선택됨`
    }
    return options.find(o => o.value === value)?.label ?? placeholder
  }

  const hasValue = multiple ? (value as string[]).length > 0 : !!value

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-3 py-2 text-sm bg-white transition-all duration-150 cursor-pointer
          ${open ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}
          focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none`}
      >
        <span className={hasValue ? 'text-gray-900' : 'text-gray-400'}>{displayLabel()}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable={multiple}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto"
        >
          {options.map(opt => (
            <div
              key={opt.value}
              role="option"
              aria-selected={isSelected(opt.value)}
              tabIndex={0}
              onClick={() => handleSelect(opt.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(opt.value)
                }
              }}
              className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8CC63F]
                ${isSelected(opt.value)
                  ? 'bg-[#8CC63F]/10 text-[#5a8228] font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span>{opt.label}</span>
              {isSelected(opt.value) && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
