import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const iconMap = {
    success: <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />,
    error: <XCircle size={16} className="text-red-500 flex-shrink-0" />,
    info: <Info size={16} className="text-blue-500 flex-shrink-0" />,
  }

  const borderMap = {
    success: 'border-green-200',
    error: 'border-red-200',
    info: 'border-blue-200',
  }

  return (
    <div
      className={`flex items-center gap-3 bg-white border ${borderMap[toast.type]} rounded-xl px-4 py-3 shadow-lg pointer-events-auto min-w-[260px] max-w-xs`}
      style={{ animation: 'slideInRight 0.2s ease-out' }}
    >
      {iconMap[toast.type]}
      <span className="text-sm font-medium text-gray-900 flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150 flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// Hook for easy usage
import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
