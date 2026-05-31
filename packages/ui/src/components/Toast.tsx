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
        /* 모바일 — 좌우 풀폭(env safe-area 고려), 데스크탑 — 우측 하단 고정.
         * 기존 right-5만 적용 시 모바일에서 toast가 viewport 좌측을 침범하거나 토스트 자체가 잘림. */
        className="fixed z-[100] flex flex-col gap-2 left-3 right-3 bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-5 sm:bottom-5 pointer-events-none"
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
      /* pointer-events-auto — 부모 컨테이너의 pointer-events-none(모바일 viewport pass-through) 복구.
       * width: w-full @sm:w-auto + min/max 제한 — 모바일에서는 부모 좌우 마진(left-3 right-3)으로 폭 결정.
       * 작은 화면에서 maxWidth:360px 고정 시 토스트가 우측 정렬되며 좌측 여백 깨짐 → 풀폭 처리. */
      className={`flex items-center gap-3 bg-white border ${borderColor[toast.type]} rounded-xl px-4 py-3 shadow-lg w-full sm:w-auto sm:min-w-[260px] sm:max-w-[360px] pointer-events-auto`}
      style={{ animation: 'slideInRight 0.2s ease-out' }}
    >
      {icons[toast.type]}
      <span className="flex-1 text-[15px] text-gray-800 break-keep min-w-0">{toast.message}</span>
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
