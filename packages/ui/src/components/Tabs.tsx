/**
 * Tabs — 광고주 앱 전수 통일 탭 컴포넌트
 *
 * 정책 (CLAUDE.md > "공통 탭 정책"):
 * - variant 'underline' : 페이지 메인 탭 — 캠페인 상태, 분석 페이지, 마이페이지 등 heavy nav
 * - variant 'pill'      : 강조 토글 — 컴팩트 박스 안 페이지 분기 (예: 그리드/리스트 뷰)
 * - variant 'soft'      : 보조 필터 탭 — 카드 내부 필터 (알림 카테고리 등)
 *
 * 모든 variant 공통:
 * - 항목 4개 이상 또는 모바일 360px 초과 가능 → `scrollable` prop으로 좌우 쉐브론 활성
 * - whitespace-nowrap 자동 부여 (탭 라벨 줄바꿈 방지)
 * - focus-visible:ring-2 ring-brand-green/50 표준
 * - selected에는 자동 scrollIntoView (가로 스크롤 시 활성 탭 가시성 보장)
 */

import { memo, useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react'
/* memo 적용 시 generic 시그니처가 소실되므로 함수 선언 후 wrapper로 export */
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type TabVariant = 'underline' | 'pill' | 'soft'

export interface TabItem<V extends string = string> {
  value: V
  label: ReactNode
  icon?: ReactNode
  /** 우측 카운트 배지 등 부가 영역 */
  trailing?: ReactNode
  disabled?: boolean
  ariaLabel?: string
}

export interface TabsProps<V extends string = string> {
  items: readonly TabItem<V>[]
  value: V
  onChange: (value: V) => void
  variant?: TabVariant
  /** 가로 스크롤 + 쉐브론 (기본 true) */
  scrollable?: boolean
  /** 컨테이너 클래스 (외부 레이아웃과 통합용) */
  className?: string
  /** 항목 사이 간격 — gap-N */
  gap?: 1 | 2 | 3
  /** aria-label for tablist */
  ariaLabel?: string
}

const ACTIVE_BY_VARIANT: Record<TabVariant, string> = {
  underline: 'border-b-2 border-gray-900 font-semibold text-gray-900',
  pill:      'bg-brand-green text-white',
  soft:      'bg-brand-green-bg text-brand-green-text font-medium border border-brand-green-border',
}

const INACTIVE_BY_VARIANT: Record<TabVariant, string> = {
  underline: 'border-b-2 border-transparent text-gray-500 hover:text-gray-700',
  pill:      'bg-gray-100 text-gray-600 hover:bg-gray-200',
  soft:      'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent',
}

const BASE_BY_VARIANT: Record<TabVariant, string> = {
  underline: 'px-3 py-3 text-base whitespace-nowrap transition-colors',
  pill:      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-medium whitespace-nowrap transition-colors',
  soft:      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-1'

function TabsInner<V extends string = string>({
  items,
  value,
  onChange,
  variant = 'underline',
  scrollable = true,
  className = '',
  gap = 1,
  ariaLabel,
}: TabsProps<V>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  // 스크롤 가능 여부 추적
  useEffect(() => {
    if (!scrollable) return
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setCanLeft(el.scrollLeft > 0)
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [scrollable, items.length])

  // 활성 탭 자동 가시화
  useEffect(() => {
    if (!scrollable) return
    const root = scrollRef.current
    const target = root?.querySelector<HTMLButtonElement>(`[data-tab-value="${value}"]`)
    if (target && root) {
      const r = target.getBoundingClientRect()
      const rr = root.getBoundingClientRect()
      if (r.left < rr.left || r.right > rr.right) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [value, scrollable])

  const onScrollBtn = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const idx = items.findIndex(it => it.value === value)
    if (idx < 0) return
    const dir = e.key === 'ArrowLeft' ? -1 : 1
    let next = idx
    for (let step = 0; step < items.length; step++) {
      next = (next + dir + items.length) % items.length
      if (!items[next].disabled) break
    }
    if (next !== idx) {
      e.preventDefault()
      onChange(items[next].value)
    }
  }

  const gapClass = gap === 1 ? 'gap-1' : gap === 2 ? 'gap-2' : 'gap-3'
  const list = (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKey}
      className={`flex items-center ${gapClass} ${scrollable ? 'overflow-x-auto scrollbar-none flex-1' : 'flex-wrap'}`}
    >
      {items.map(item => {
        const active = item.value === value
        const cls = `${BASE_BY_VARIANT[variant]} ${active ? ACTIVE_BY_VARIANT[variant] : INACTIVE_BY_VARIANT[variant]} ${FOCUS} ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`
        return (
          <button
            type="button"
            key={item.value}
            data-tab-value={item.value}
            role="tab"
            aria-selected={active}
            aria-label={item.ariaLabel}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.value)}
            className={cls.trim()}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.trailing}
          </button>
        )
      })}
    </div>
  )

  if (!scrollable) {
    return <div className={className}>{list}</div>
  }

  return (
    <div className={`relative flex items-center ${className}`.trim()}>
      {canLeft && (
        <button
          type="button"
          onClick={() => onScrollBtn('left')}
          aria-label="탭 왼쪽으로 스크롤"
          className={`shrink-0 px-1.5 py-3 text-gray-400 hover:text-gray-700 transition-colors ${FOCUS}`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      )}
      {list}
      {canRight && (
        <button
          type="button"
          onClick={() => onScrollBtn('right')}
          aria-label="탭 오른쪽으로 스크롤"
          className={`shrink-0 px-1.5 py-3 text-gray-400 hover:text-gray-700 transition-colors ${FOCUS}`}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/** memo wrapper — generic 시그니처 보존 */
const Tabs = memo(TabsInner) as typeof TabsInner

export default Tabs
