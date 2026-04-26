import { useEffect, useState } from 'react'

function checkIsTouch(breakpoint: number): boolean {
  if (typeof window === 'undefined') return false
  const mockupDevice = document.documentElement.dataset.mockupDevice
  if (mockupDevice) return mockupDevice !== 'desktop'
  return window.innerWidth < breakpoint || window.matchMedia?.('(pointer: coarse)').matches
}

/**
 * 태블릿/모바일 환경 감지 훅
 * - viewport < breakpoint (default 768px) OR `(pointer: coarse)` 매칭
 * - QA 목업 환경: document.documentElement.dataset.mockupDevice 우선 참조
 * - PC에서는 false, 모바일/태블릿에서는 true
 */
export function useIsTouchDevice(breakpoint = 768): boolean {
  const [isTouch, setIsTouch] = useState(() => checkIsTouch(breakpoint))

  useEffect(() => {
    const handler = () => setIsTouch(checkIsTouch(breakpoint))
    window.addEventListener('resize', handler)
    const mq = window.matchMedia?.('(pointer: coarse)')
    mq?.addEventListener?.('change', handler)

    // mockup-device attribute 변경 감지
    const observer = new MutationObserver(handler)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mockup-device'] })

    return () => {
      window.removeEventListener('resize', handler)
      mq?.removeEventListener?.('change', handler)
      observer.disconnect()
    }
  }, [breakpoint])

  return isTouch
}
