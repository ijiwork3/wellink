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
  useLayoutEffect,
  useImperativeHandle,
  useContext,
  createContext,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * 컨테이너 측정 width를 자식 차트에 전달하는 Context.
 * 자식 SVG 차트는 useChartScrollContext()로 measuredW를 받아 viewBox 동기화.
 * → 큰 화면에서 좌우 여백 없이 fluid 반응형.
 */
const ChartScrollContext = createContext<{ measuredW: number } | null>(null)

/** 자식 차트에서 컨테이너 측정 width 받기. context 없으면 null. */
export function useChartScrollContext(): { measuredW: number } | null {
  return useContext(ChartScrollContext)
}

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
    // scrollLeft 값 자체는 더이상 사용하지 않음 (getScreenCTM이 정확한 변환 자동 처리).
    // setter는 re-render 트리거용 — 스크롤 시 툴팁 위치가 갱신되도록.
    const [, setScrollLeft] = useState(0)
    // 측정 width — 자식 차트에 Context로 전달. 초기값은 prop chartW (fallback).
    // 컨테이너 너비가 chartW 이상이면 자식 차트가 그 크기로 펼쳐짐 (fluid 반응형).
    const [measuredW, setMeasuredW] = useState(chartW)

    const pR = padR ?? padL

    /* ── 스크롤 상태 + 측정 width 추적 ──────────────────────────── */
    // useLayoutEffect: 초기 측정을 페인트 전에 동기 실행 → measuredW가 첫 툴팁 렌더 전에 확정됨
    // (useEffect로 하면 rAF activeIndex=0 시점에 measuredW가 아직 chartW일 수 있어 툴팁 위치 오프셋 발생)
    useLayoutEffect(() => {
      const el = scrollRef.current
      if (!el) return
      const update = () => {
        const sl = el.scrollLeft
        setScrollLeft(sl)
        setCanScrollLeft(sl > 2)
        setCanScrollRight(sl + el.clientWidth < el.scrollWidth - 2)
        // 측정 width — 컨테이너 client width 기준 (자식 차트 viewBox 동기용)
        // chartW(initial)보다 작으면 가로 스크롤 발생, 크면 자식 차트가 펼쳐짐
        const cw = el.clientWidth
        if (cw > 0) setMeasuredW(Math.max(chartW, cw))
      }
      update()
      el.addEventListener('scroll', update, { passive: true })
      const ro = new ResizeObserver(update)
      ro.observe(el)
      return () => {
        el.removeEventListener('scroll', update)
        ro.disconnect()
      }
    }, [chartW])

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

    /* ── HTML 툴팁 오버레이 — getScreenCTM으로 viewBox → 화면 좌표 정확 변환 ─── */
    /*
     * preserveAspectRatio="xMidYMid meet"의 경우 SVG content가 element 안에서 가운데 정렬되어
     * 좌우 여백 발생. (svgX/chartW) * scrollContentW 단순 비례식은 큰 화면에서 어긋남.
     * → SVG의 getScreenCTM() 활용해 viewBox 좌표를 정확한 화면 좌표로 변환.
     * scrollLeft 의존 — 스크롤 시 자동 갱신.
     */
    const tooltipNode = (() => {
      if (activeIndex == null || !tooltipContent) return null
      const content = tooltipContent(activeIndex)
      if (!content) return null

      const scrollEl = scrollRef.current
      if (!scrollEl) return null
      const svgEl = scrollEl.querySelector('svg') as SVGSVGElement | null
      if (!svgEl) return null

      // 측정 width 기반 stepX — 자식 차트가 measuredW로 viewBox 렌더하므로 동일하게 사용
      const stepX = (measuredW - padL - pR) / Math.max(1, dataLength - 1)
      const svgX = padL + activeIndex * stepX

      // viewBox → 화면 좌표 변환 (preserveAspectRatio 자동 처리)
      const ctm = svgEl.getScreenCTM()
      if (!ctm) return null
      const scrollRect = scrollEl.getBoundingClientRect()
      const containerW = scrollEl.clientWidth

      const toContainerX = (vbX: number) => {
        const p = svgEl.createSVGPoint()
        p.x = vbX
        p.y = 0
        return p.matrixTransform(ctm).x - scrollRect.left
      }

      const actualX = toContainerX(svgX)
      const padLActual = toContainerX(padL)
      const padRActual = toContainerX(measuredW - pR)

      // 툴팁 위치 분기 — 박스 좌·우 끝이 padL/padR 영역을 침범하는지 체크
      // (단순 화면 좌·우 끝 기준이 아닌 *차트 plot 영역* 기준 — Y축 라벨 가림 방지)
      const tooltipHalfW = 80
      const SAFE_MARGIN = 4

      let leftPos: number
      let transformX: string

      if (actualX - tooltipHalfW < padLActual + SAFE_MARGIN) {
        // 박스 왼쪽이 plot 좌측(padL) 침범 → 데이터 포인트 우측에 툴팁 (왼쪽 정렬)
        leftPos = actualX + 8
        transformX = 'translateX(0)'
      } else if (actualX + tooltipHalfW > padRActual - SAFE_MARGIN) {
        // 박스 오른쪽이 plot 우측(padR) 침범 → 데이터 포인트 좌측에 툴팁 (오른쪽 정렬)
        leftPos = actualX - 8
        transformX = 'translateX(-100%)'
      } else {
        // 중간 — 중앙 정렬
        leftPos = actualX
        transformX = 'translateX(-50%)'
      }

      // 최종 컨테이너 경계 clamp (예외 케이스 safety)
      if (transformX === 'translateX(0)') {
        leftPos = Math.min(leftPos, containerW - 8)
      } else if (transformX === 'translateX(-100%)') {
        leftPos = Math.max(leftPos, 8)
      }

      return (
        <div
          className="absolute top-2 z-20 pointer-events-none"
          style={{ left: leftPos, transform: transformX }}
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

        {/* 스크롤 컨테이너 — 자식 차트에 measuredW 전달 (fluid 반응형) */}
        <div ref={scrollRef} className="overflow-x-auto scrollbar-none">
          <ChartScrollContext.Provider value={{ measuredW }}>
            {children}
          </ChartScrollContext.Provider>
        </div>

        {/* HTML 툴팁 오버레이 */}
        {tooltipNode}
      </div>
    )
  },
)

export default ChartScrollContainer
