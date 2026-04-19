/**
 * Toast — 공통 알림 토스트
 * Context + Provider 패턴
 *
 * 사용법:
 *   // App.tsx 최상단에 ToastProvider 래핑
 *   <ToastProvider><App /></ToastProvider>
 *
 *   // 컴포넌트 내부에서
 *   const { showToast } = useToast()
 *   showToast('저장되었습니다', 'success')
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { TIMER_MS } from '../constants/timers'

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
  const nextId = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, TIMER_MS.TOAST_AUTO_CLOSE)
  }, [])

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2"
      >
        {toasts.map(toast => (
          <ToastBubble key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastBubble({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const icons = {
    success: <CheckCircle size={16} className="text-green-500 shrink-0" />,
    error:   <XCircle    size={16} className="text-red-500 shrink-0"   />,
    info:    <Info       size={16} className="text-blue-500 shrink-0"  />,
  }
  const borderColor = {
    success: 'border-green-200',
    error:   'border-red-200',
    info:    'border-blue-200',
  }

  return (
    <div
      className={`flex items-center gap-3 bg-white border ${borderColor[toast.type]} rounded-xl px-4 py-3 shadow-lg`}
      style={{ minWidth: '260px', maxWidth: '360px', animation: 'slideInRight 0.2s ease-out' }}
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm text-gray-800">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="알림 닫기"
        className="text-gray-400 hover:text-gray-600 transition-colors p-2.5 -m-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
