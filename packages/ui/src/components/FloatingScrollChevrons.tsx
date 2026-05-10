import { useEffect, useState, type RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * FloatingScrollChevrons — 가로 스크롤 컨테이너 위에 떠다니는 좌/우 쉐브론 버튼.
 *
 * 정책 §모바일 UI 3대 원칙: `overflow-x-auto` 컨테이너에 좌우 쉐브론(40px) + 그라디언트 오버레이.
 *
 * - `position: fixed` + `getBoundingClientRect`로 좌우 위치 동적 계산
 *   → 데스크톱 사이드바 영역과 겹치지 않음
 * - 가로 스크롤 상태(`canScrollLeft`/`canScrollRight`) + 세로 visible 영역 추적
 * - 터치 타깃 40px (w-10 h-10) — WCAG 2.5.5
 *
 * 사용 예:
 * ```tsx
 * const scrollRef = useRef<HTMLDivElement>(null)
 * const tableRef = useRef<HTMLTableElement>(null)
 *
 * <div className="relative">
 *   <div ref={scrollRef} className="overflow-x-auto">
 *     <table ref={tableRef}>...</table>
 *   </div>
 * </div>
 * <FloatingScrollChevrons scrollRef={scrollRef} contentRef={tableRef} />
 * ```
 */
export interface FloatingScrollChevronsProps {
  /** 가로 스크롤 컨테이너 (overflow-x-auto). scrollLeft/scrollWidth 추적 대상. */
  scrollRef: RefObject<HTMLElement | null>
  /** 세로 visible 영역 계산용 콘텐츠 ref (테이블·그리드). 미지정 시 scrollRef 사용. */
  contentRef?: RefObject<HTMLElement | null>
  /** 한 번 클릭 시 스크롤 양 (px). 기본 240. */
  scrollAmount?: number
  /** 버튼 z-index. 기본 30. */
  zIndex?: number
}

export default function FloatingScrollChevrons({
  scrollRef,
  contentRef,
  scrollAmount = 240,
  zIndex = 30,
}: FloatingScrollChevronsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [btnTop, setBtnTop] = useState<number | null>(null)
  const [btnLeft, setBtnLeft] = useState<number>(8)
  const [btnRight, setBtnRight] = useState<number>(8)

  // 1) 가로 스크롤 상태 추적
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
  }, [scrollRef])

  // 2) 세로 visible 영역 + 좌우 위치 계산 (사이드바 회피)
  useEffect(() => {
    const update = () => {
      const el = contentRef?.current ?? scrollRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const visTop = Math.max(rect.top, 0)
      const visBottom = Math.min(rect.bottom, window.innerHeight)
      setBtnTop(visBottom > visTop + 40 ? (visTop + visBottom) / 2 : null)
      // 사이드바와 겹치지 않도록 콘텐츠 영역 안에 정확히 배치
      setBtnLeft(rect.left + 8)
      setBtnRight(window.innerWidth - rect.right + 8)
    }
    update()
    // 부모 스크롤 컨테이너 (Layout의 overflow-y-auto) 추적
    const scrollTarget: EventTarget = ((): EventTarget => {
      let p = (contentRef?.current ?? scrollRef.current)?.parentElement
      while (p) {
        const ov = getComputedStyle(p).overflowY
        if (ov === 'auto' || ov === 'scroll') return p
        p = p.parentElement
      }
      return window
    })()
    scrollTarget.addEventListener('scroll', update, { passive: true } as AddEventListenerOptions)
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    if (contentRef?.current) ro.observe(contentRef.current)
    else if (scrollRef.current) ro.observe(scrollRef.current)
    return () => {
      scrollTarget.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [contentRef, scrollRef])

  const scrollBy = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  if (btnTop === null) return null

  return (
    <>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy('left')}
          aria-label="왼쪽으로 스크롤"
          style={{ top: btnTop, left: btnLeft, zIndex }}
          className="fixed -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 hover:shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy('right')}
          aria-label="오른쪽으로 스크롤"
          style={{ top: btnTop, right: btnRight, zIndex }}
          className="fixed -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 hover:shadow-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </>
  )
}
