/**
 * useTableScroll — 가로 스크롤 테이블의 좌/우 그라디언트 오버레이 표시 여부 추적
 *
 * ProfileInsight / ViralMetrics 두 곳에서 동일 패턴 반복됨.
 * - scroll·ResizeObserver 양쪽으로 추적 ({ passive: true })
 * - 반환된 scrollRef를 overflow-x-auto 컨테이너에 부착
 * - 좌측 스크롤 가능 → canScrollLeft / 우측 가능 → canScrollRight
 */

import { useEffect, useRef, useState } from 'react'

export default function useTableScroll<T extends HTMLElement = HTMLDivElement>() {
  const scrollRef = useRef<T>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  return { scrollRef, canScrollLeft, canScrollRight }
}
