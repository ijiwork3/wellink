import React, { useEffect, useId } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', handleEsc)
      return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = '' }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start @sm:items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto pt-12 @sm:pt-0"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClass} mx-4 max-h-[90vh] flex flex-col`}
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 id={titleId} className="text-base font-semibold text-gray-900 truncate">{title}</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
