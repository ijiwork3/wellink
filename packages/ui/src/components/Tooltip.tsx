/**
 * Tooltip — 공통 툴팁
 * - PC: hover/focus 시 노출
 * - 모바일/태블릿: 클릭(탭) 시 노출, 외부 탭으로 닫힘
 *
 * 사용:
 *   <Tooltip content="설명 텍스트"><Info size={12} /></Tooltip>
 *
 * children은 trigger element. content는 툴팁 본문.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useIsTouchDevice } from '../utils/useIsTouchDevice'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  /** 툴팁 위치 (default: top) */
  side?: 'top' | 'bottom'
  /** 본문 wrapping 허용 여부 (default: false = whitespace-nowrap) */
  multiline?: boolean
  className?: string
}

export default function Tooltip({ content, children, side = 'top', multiline = false, className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const isTouch = useIsTouchDevice()

  useEffect(() => {
    if (!open || !isTouch) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open, isTouch])

  const triggerProps = isTouch
    ? {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(o => !o)
        },
      }
    : {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
      }

  const positionCls =
    side === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-1.5'
      : 'top-full left-1/2 -translate-x-1/2 mt-1.5'

  const arrowCls =
    side === 'top'
      ? 'top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-800'
      : 'bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-gray-800'

  return (
    <span ref={wrapRef} className={`relative inline-flex ${className}`}>
      <span {...triggerProps} className="inline-flex cursor-pointer">
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          className={`absolute ${positionCls} px-2.5 py-1.5 bg-gray-800 text-white text-[11px] rounded-lg z-20 shadow-lg ${
            multiline ? 'max-w-[240px] whitespace-normal leading-relaxed' : 'whitespace-nowrap'
          }`}
        >
          {content}
          <span className={`absolute ${arrowCls}`} />
        </span>
      )}
    </span>
  )
}
