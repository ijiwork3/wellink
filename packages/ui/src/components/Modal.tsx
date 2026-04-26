/**
 * Modal — 공통 모달
 * - open / onClose 제어
 * - 배경 클릭·Escape 키로 닫힘 (closeOnBackdrop 기본 true)
 * - size 정책 (2026-04-26 재정의):
 *   xs (320px)  — 컨펌 한 줄, 짧은 안내
 *   sm (448px)  — 단순 입력 1~2개 (DEFAULT)
 *   md (672px)  — 정보 카드형, 폼 다중 필드
 *   lg (768px)  — 정보가 풍부한 상세 패널
 *   xl (1024px) — 풀 정보 마스터-디테일
 * - body scroll lock + 최대 높이 85vh (콘텐츠 짧으면 자동 축소)
 * - 중첩 모달 안전: lock counter로 scroll lock 관리
 */

import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useIsTouchDevice } from '../utils/useIsTouchDevice'

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
const getFocusableElements = (container: HTMLElement | null): HTMLElement[] =>
  Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])
    .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true')

// 중첩 모달에서 scroll lock이 풀리지 않도록 ref count로 관리
let scrollLockCount = 0
function lockScroll() {
  scrollLockCount++
  if (scrollLockCount === 1) document.body.style.overflow = 'hidden'
}
function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) document.body.style.overflow = ''
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  label?: string
  children: ReactNode
  /** 하단 고정 푸터 — 버튼 영역. 스크롤에서 분리되어 항상 노출 */
  footer?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  showClose?: boolean
  fullscreen?: boolean
}

export default function Modal({ open, onClose, title, label, children, footer, size = 'sm', closeOnBackdrop = true, showClose = true, fullscreen = false }: ModalProps) {
  const [visible, setVisible] = useState(false)
  const isTouch = useIsTouchDevice()
  // 모바일/태블릿에서 lg/xl은 자동 풀스크린 — 좁은 화면에서 가로 잘림·세로 스크롤 폭주 방지
  const effectiveFullscreen = fullscreen || (isTouch && (size === 'lg' || size === 'xl'))
  const rafRef = useRef<number | null>(null)
  const focusRafRef = useRef<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }

    const active = document.activeElement
    prevFocusRef.current = (active && active !== document.body) ? active as HTMLElement : null

    lockScroll()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); return }
      if (e.key !== 'Tab') return

      const els = getFocusableElements(modalRef.current)
      if (!els.length) { e.preventDefault(); return }

      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }

    // visible=true RAF 완료 후 포커스 이동 (중첩 RAF로 순서 보장)
    rafRef.current = requestAnimationFrame(() => {
      setVisible(true)
      focusRafRef.current = requestAnimationFrame(() => {
        const first = getFocusableElements(modalRef.current)[0]
        if (first) first.focus()
        else modalRef.current?.focus()
      })
    })

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      unlockScroll()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (focusRafRef.current !== null) cancelAnimationFrame(focusRafRef.current)
      prevFocusRef.current?.focus()
      prevFocusRef.current = null
    }
  }, [open])

  if (!open) return null

  // 사이즈 정책 — 좌우 최소 16px 여백(mx-4)은 공통 적용
  const sizeClass: Record<NonNullable<ModalProps['size']>, string> = {
    xs: 'max-w-xs',   // 320px — 짧은 컨펌
    sm: 'max-w-md',   // 448px — 입력 1~2개
    md: 'max-w-2xl',  // 672px — 정보 카드형
    lg: 'max-w-3xl',  // 768px — 풍부한 상세
    xl: 'max-w-5xl',  // 1024px — 풀 정보 패널
  }
  const sizeCls = sizeClass[size] ?? sizeClass.sm

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm ${effectiveFullscreen ? 'items-stretch' : 'items-center justify-center overflow-y-auto p-4'}`}
      onClick={closeOnBackdrop ? (e) => { if (e.target === e.currentTarget) onCloseRef.current() } : undefined}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? (label ?? '대화상자') : undefined}
        tabIndex={-1}
        className={`bg-white shadow-2xl flex flex-col transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
          effectiveFullscreen
            ? 'w-full rounded-none h-full overflow-hidden'
            : `rounded-2xl ${sizeCls} w-full max-h-[85vh]`
        }`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            {title
              ? <h3 id={titleId} className="text-base font-semibold text-gray-900">{title}</h3>
              : <span />
            }
            {showClose && (
              <button
                onClick={() => onCloseRef.current()}
                aria-label="닫기"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 -m-1 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="@container p-6 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
