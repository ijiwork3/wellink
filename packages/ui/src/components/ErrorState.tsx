import { memo } from 'react'
import { XCircle, RefreshCw } from 'lucide-react'
interface Props { message?: string; subMessage?: string; onRetry?: () => void }
const ErrorState = memo(function ErrorState({ message = '데이터를 불러올 수 없습니다', subMessage = '잠시 후 다시 시도해 주세요.', onRetry }: Props) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <XCircle size={48} className="text-red-300" aria-hidden="true" />
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{subMessage}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
          <RefreshCw size={14} aria-hidden="true" />다시 시도
        </button>
      )}
    </div>
  )
})

export default ErrorState
