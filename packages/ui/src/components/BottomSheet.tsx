/**
 * BottomSheet — 모바일/태블릿 전용 하단 시트
 * - open / onClose 제어
 * - 배경 클릭·Escape 키로 닫힘
 * - 드래그 핸들 표시
 * - body scroll lock
 * - ARIA: role="dialog" aria-modal aria-label, 포커스 트랩·복구
 */

import { X } from 'lucide-react'
import { useEffect, useRef, useState, useId, type ReactNode } from 'react'

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

let scrollLockCount = 0
function lockScroll() {
  scrollLockCount++
  if (scrollLockCount === 1) document.body.style.overflow = 'hidden'
}
function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) document.body.style.overflow = ''
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  /** dialog aria-label. title이 없을 때 사용. 기본값 "선택" */
  label?: string
  children: ReactNode
}

export default function BottomSheet({ open, onClose, title, label = '선택', children }: BottomSheetProps) {
  const [visible, setVisible] = useState(false)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  const containerRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      setVisible(false)
      // 닫힐 때 이전 포커스 복구
      prevFocusRef.current?.focus()
      prevFocusRef.current = null
      return
    }

    // 열리기 전 포커스 저장
    const active = document.activeElement
    prevFocusRef.current = (active && active !== document.body) ? active as HTMLElement : null

    lockScroll()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current() }
    }
    document.addEventListener('keydown', onKey)

    // visible 전환 후 첫 focusable 요소로 포커스 이동
    rafRef.current = requestAnimationFrame(() => {
      setVisible(true)
      rafRef.current = requestAnimationFrame(() => {
        const firstFocusable = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        if (firstFocusable) firstFocusable.focus()
        else containerRef.current?.focus()
      })
    })

    return () => {
      document.removeEventListener('keydown', onKey)
      unlockScroll()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/40 backdrop-blur-sm"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
      onClick={e => { if (e.target === e.currentTarget) onCloseRef.current() }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? label : undefined}
        tabIndex={-1}
        className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col focus-visible:outline-none"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 250ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* 헤더 — 긴 타이틀 truncate, 닫기 버튼 shrink-0 */}
        {title && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <h3 id={titleId} className="text-sm font-semibold text-gray-900 min-w-0 truncate">{title}</h3>
            <button
              onClick={() => onCloseRef.current()}
              aria-label="닫기"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* 콘텐츠 — @container로 내부 컨테이너 쿼리 활성 */}
        <div className="@container overflow-y-auto flex-1 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </div>
  )
}
