import { useEffect, useState } from 'react'

/**
 * 태블릿/모바일 환경 감지 훅
 * - viewport < breakpoint (default 768px) OR `(pointer: coarse)` 매칭
 * - PC에서는 false, 모바일/태블릿에서는 true
 *
 * 사용처:
 *   - DateRangePicker, CustomSelect, Modal, Tooltip 등에서
 *     hover/popover ↔ click/BottomSheet/fullscreen 분기에 사용
 */
export function useIsTouchDevice(breakpoint = 768): boolean {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint || window.matchMedia?.('(pointer: coarse)').matches
  })

  useEffect(() => {
    const handler = () => {
      setIsTouch(window.innerWidth < breakpoint || window.matchMedia?.('(pointer: coarse)').matches)
    }
    window.addEventListener('resize', handler)
    const mq = window.matchMedia?.('(pointer: coarse)')
    mq?.addEventListener?.('change', handler)
    return () => {
      window.removeEventListener('resize', handler)
      mq?.removeEventListener?.('change', handler)
    }
  }, [breakpoint])

  return isTouch
}
