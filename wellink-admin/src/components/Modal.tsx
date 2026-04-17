import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }[size]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClass} mx-4 overflow-hidden`}
        style={{ animation: 'slideUp 0.2s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title ? (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
