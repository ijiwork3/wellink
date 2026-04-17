import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextIdRef = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextIdRef.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const icons = {
    success: <CheckCircle size={16} className="text-green-500 shrink-0" />,
    error: <XCircle size={16} className="text-red-500 shrink-0" />,
    info: <Info size={16} className="text-blue-500 shrink-0" />,
  }

  const borderColor = {
    success: 'border-green-200',
    error: 'border-red-200',
    info: 'border-blue-200',
  }

  return (
    <div
      className={`flex items-center gap-3 bg-white border ${borderColor[toast.type]} rounded-xl px-4 py-3 shadow-lg
        animate-[slideInRight_0.2s_ease-out]`}
      style={{ minWidth: '260px', maxWidth: '360px' }}
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm text-gray-800">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="닫기"
        className="p-2 -mr-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
