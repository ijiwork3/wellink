/**
 * CustomSelect — 공통 셀렉트박스
 * - multiple: true 시 다중 선택 지원 (T = string[])
 * - multiple: false/undefined 시 단일 선택 (T = string, 기본값)
 */

import { useRef, useEffect, useState, type KeyboardEvent } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useIsTouchDevice } from '../utils/useIsTouchDevice'
import BottomSheet from './BottomSheet'

interface Option {
  label: string
  value: string
}

interface CustomSelectProps<T extends string | string[] = string> {
  value: T
  onChange: (val: T) => void
  options: Option[]
  placeholder?: string
  multiple?: boolean
  className?: string
}

export default function CustomSelect<T extends string | string[] = string>({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  multiple = false,
  className = '',
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouchDevice()

  useEffect(() => {
    if (isTouch) return // 모바일은 BottomSheet이 자체 backdrop-close 처리
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isTouch])

  useEffect(() => {
    if (!open) setActiveIdx(-1)
  }, [open])

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) { setOpen(true); setActiveIdx(0); return }
      setActiveIdx(i => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if ((e.key === 'Enter' || e.key === ' ') && open && activeIdx >= 0) {
      e.preventDefault()
      handleSelect(options[activeIdx].value)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const isSelected = (val: string) => {
    if (multiple) return (value as string[]).includes(val)
    return value === val
  }

  const handleSelect = (val: string) => {
    if (multiple) {
      const arr = value as string[]
      if (arr.includes(val)) {
        onChange(arr.filter(v => v !== val) as T)
      } else {
        onChange([...arr, val] as T)
      }
    } else {
      onChange(val as T)
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
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm bg-white transition-all duration-150 cursor-pointer
          ${open ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}
          focus-visible:ring-2 focus-visible:ring-brand-green/30 focus-visible:border-brand-green focus-visible:outline-none`}
      >
        <span className={hasValue ? 'text-gray-900' : 'text-gray-400'}>{displayLabel()}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`text-gray-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !isTouch && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-[280px] overflow-y-auto"
        >
          {options.map((opt, idx) => (
            <OptionRow
              key={opt.value}
              opt={opt}
              selected={isSelected(opt.value)}
              active={idx === activeIdx}
              onSelect={() => handleSelect(opt.value)}
            />
          ))}
        </div>
      )}

      {isTouch && (
        <BottomSheet open={open} onClose={() => setOpen(false)} title={placeholder}>
          <div role="listbox" className="px-2 pb-2">
            {options.map((opt) => (
              <OptionRow
                key={opt.value}
                opt={opt}
                selected={isSelected(opt.value)}
                active={false}
                onSelect={() => handleSelect(opt.value)}
                size="lg"
              />
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}

function OptionRow({
  opt,
  selected,
  active,
  onSelect,
  size = 'md',
}: {
  opt: Option
  selected: boolean
  active: boolean
  onSelect: () => void
  size?: 'md' | 'lg'
}) {
  const padding = size === 'lg' ? 'px-4 py-3.5' : 'px-4 py-2.5'
  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`flex items-center justify-between ${padding} text-sm cursor-pointer transition-colors duration-100 rounded-lg
        ${selected
          ? 'text-gray-900 font-medium hover:bg-gray-50'
          : active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-700 hover:bg-gray-50'
        }`}
    >
      <span>{opt.label}</span>
      {selected && <Check size={16} className="text-brand-green" aria-hidden="true" />}
    </div>
  )
}
