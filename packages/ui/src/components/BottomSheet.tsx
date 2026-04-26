/**
 * BottomSheet — 모바일/태블릿 전용 하단 시트
 * - open / onClose 제어
 * - 배경 클릭·Escape 키로 닫힘
 * - 드래그 핸들 표시
 * - body scroll lock
 */

import { X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

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
  children: ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const [visible, setVisible] = useState(false)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) { setVisible(false); return }
    lockScroll()
    const raf = requestAnimationFrame(() => setVisible(true))
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      unlockScroll()
      cancelAnimationFrame(raf)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col justify-end bg-black/40 backdrop-blur-sm"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
      onClick={e => { if (e.target === e.currentTarget) onCloseRef.current() }}
    >
      <div
        className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
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

        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <button
              onClick={() => onCloseRef.current()}
              aria-label="닫기"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="overflow-y-auto flex-1 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </div>
  )
}
