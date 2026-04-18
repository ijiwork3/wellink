/**
 * Modal — 공통 모달
 * - open / onClose 제어
 * - 배경 클릭·Escape 키로 닫힘 (closeOnBackdrop 기본 true)
 * - size: sm(384px) / md(512px) / lg(672px)
 * - body scroll lock + 최대 높이 90vh 내 내부 스크롤
 */

import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnBackdrop?: boolean
}

export default function Modal({ open, onClose, title, children, size = 'md', closeOnBackdrop = true }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', handleEsc)
      return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = '' }
    } else {
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start @sm:items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto pt-12 @sm:pt-0"
      onClick={closeOnBackdrop ? (e) => { if (e.target === e.currentTarget) onClose() } : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClass} mx-4 overflow-hidden max-h-[90vh] flex flex-col`}
        style={{ animation: 'slideUp 0.2s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
