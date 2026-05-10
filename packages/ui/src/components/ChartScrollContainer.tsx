/**
 * ChartScrollContainer — SVG 가로 스크롤 차트 공통 래퍼
 *
 * ## 책임
 * - 가로 스크롤 컨테이너 (overflow-x-auto)
 * - 스크롤 상태 추적 (ResizeObserver + scroll 이벤트)
 * - 좌우 쉐브론 버튼 + 그라디언트 오버레이
 * - HTML 툴팁 오버레이 포지셔닝 (SVG 스케일과 독립적)
 * - 부모 imperativeHandle (scrollToStart / scrollToEnd)
 *
 * ## 사용법
 * ```tsx
 * const chartRef = useRef<ChartScrollContainerHandle>(null)
 *
 * // period/isTouch 변경 시 스크롤 리셋
 * useEffect(() => {
 *   if (isTouch) chartRef.current?.scrollToEnd()
 *   else         chartRef.current?.scrollToStart()
 * }, [period, isTouch])
 *
 * <ChartScrollContainer
 *   ref={chartRef}
 *   chartW={700} padL={50} padR={50}
 *   dataLength={data.length}
 *   activeIndex={activeIdx}
 *   tooltipContent={(i) => (
 *     <>
 *       <p className="text-xs text-gray-400 mb-1.5 whitespace-nowrap">{data[i].date}</p>
 *       <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
 *         {fmtNumber(data[i].value)}
 *       </span>
 *     </>
 *   )}
 * >
 *   <MySvgChart activeIndex={activeIdx} onActiveIndex={setActiveIdx} isTouch={isTouch} />
 * </ChartScrollContainer>
 * ```
 *
 * ## SVG 차트 컴포넌트 필수 핸들러
 * ```tsx
 * // 헬퍼 — SVG 이벤트에서 가장 가까운 인덱스 계산
 * const idxAt = (clientX: number, rect: DOMRect) => {
 *   const svgRelX = (clientX - rect.left) / rect.width * W - padL
 *   return Math.max(0, Math.min(data.length - 1, Math.round(svgRelX / stepX)))
 * }
 *
 * <svg
 *   onMouseMove={!isTouch ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
 *   onMouseLeave={!isTouch ? () => onActiveIndex(null) : undefined}
 *   onClick={!isTouch ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
 *   onTouchStart={isTouch ? (e) => onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) : undefined}
 *   onTouchMove={isTouch ? (e) => { e.preventDefault(); onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) } : undefined}
 * >
 * ```
 *
 * ## 툴팁 X 위치 계산
 * scrollLeft 상태가 변경될 때마다 re-render → 툴팁이 스크롤과 함께 자동 갱신.
 * visX = svgX - scrollLeft → containerW * 0.65 초과 시 오른쪽 배치(isRight).
 */

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ChartScrollContainerHandle {
  /** 스크롤 시작점으로 이동 (기본 instant) */
  scrollToStart(behavior?: ScrollBehavior): void
  /** 스크롤 끝점으로 이동 (기본 instant) */
  scrollToEnd(behavior?: ScrollBehavior): void
}

export interface ChartScrollContainerProps {
  /** SVG viewBox 너비 (좌표계 단위) */
  chartW: number
  /** SVG 좌 패딩 (SVG 단위) */
  padL: number
  /** SVG 우 패딩 (SVG 단위, 생략 시 padL 동일 적용) */
  padR?: number
  /** 데이터 포인트 수 */
  dataLength: number
  /** 현재 활성 인덱스 */
  activeIndex: number | null
  /**
   * 툴팁 내용 렌더 함수.
   * null/undefined 반환 시 해당 인덱스에서 툴팁 미표시.
   * 생략 시 툴팁 전체 비활성.
   */
  tooltipContent?: (index: number) => ReactNode
  children: ReactNode
  className?: string
}

const ChartScrollContainer = forwardRef<ChartScrollContainerHandle, ChartScrollContainerProps>(
  function ChartScrollContainer(
    { chartW, padL, padR, dataLength, activeIndex, tooltipContent, children, className = '' },
    ref,
  ) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)
    const [scrollLeft, setScrollLeft] = useState(0)

    const pR = padR ?? padL

    /* ── 스크롤 상태 추적 ─────────────────────────────────────── */
    useEffect(() => {
      const el = scrollRef.current
      if (!el) return
      const update = () => {
        const sl = el.scrollLeft
        setScrollLeft(sl)
        setCanScrollLeft(sl > 2)
        setCanScrollRight(sl + el.clientWidth < el.scrollWidth - 2)
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

    /* ── 부모 imperative handle ──────────────────────────────── */
    useImperativeHandle(ref, () => ({
      scrollToStart(behavior: ScrollBehavior = 'instant') {
        scrollRef.current?.scrollTo({ left: 0, behavior })
      },
      scrollToEnd(behavior: ScrollBehavior = 'instant') {
        const el = scrollRef.current
        if (el) el.scrollTo({ left: el.scrollWidth, behavior })
      },
    }))

    /* ── HTML 툴팁 오버레이 ──────────────────────────────────── */
    const tooltipNode = (() => {
      if (activeIndex == null || !tooltipContent) return null
      const content = tooltipContent(activeIndex)
      if (!content) return null

      const containerW = scrollRef.current?.clientWidth ?? chartW
      const stepX = (chartW - padL - pR) / Math.max(1, dataLength - 1)
      const svgX = padL + activeIndex * stepX
      const visX = svgX - scrollLeft
      const isRight = visX > containerW * 0.65
      const offset = Math.max(4, isRight ? containerW - visX + 8 : visX + 8)

      return (
        <div
          className="absolute top-2 z-20 pointer-events-none"
          style={{ [isRight ? 'right' : 'left']: offset }}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2">
            {content}
          </div>
        </div>
      )
    })()

    return (
      <div className={`relative ${className}`}>
        {/* 그라디언트 오버레이 */}
        {canScrollLeft && (
          <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[9]" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-[9]" />
        )}

        {/* 쉐브론 버튼 */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            aria-label="왼쪽으로 스크롤"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <ChevronLeft size={13} aria-hidden="true" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            aria-label="오른쪽으로 스크롤"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <ChevronRight size={13} aria-hidden="true" />
          </button>
        )}

        {/* 스크롤 컨테이너 */}
        <div ref={scrollRef} className="overflow-x-auto scrollbar-none">
          {children}
        </div>

        {/* HTML 툴팁 오버레이 */}
        {tooltipNode}
      </div>
    )
  },
)

export default ChartScrollContainer
