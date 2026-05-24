import { memo } from 'react'
import { XCircle, RefreshCw } from 'lucide-react'
interface Props {
  message?: string
  subMessage?: string
  onRetry?: () => void
  /** 재시도 버튼 라벨. 기본 "다시 시도". 다른 동작(예: 다른 페이지로 이동)일 때 명확한 라벨 지정. */
  retryLabel?: string
  /** 재시도 버튼 아이콘 표시 여부. 라벨이 "다시 시도"가 아니면 false 권장. */
  showRetryIcon?: boolean
}
const ErrorState = memo(function ErrorState({
  message = '데이터를 불러올 수 없습니다',
  subMessage = '잠시 후 다시 시도해 주세요',
  onRetry,
  retryLabel = '다시 시도',
  showRetryIcon = true,
}: Props) {
  return (
    /* 모바일에서 min-h-[400px]은 좁은 화면 비율을 압박 → @sm 이상에서만 적용.
     * 텍스트 메시지는 break-keep으로 한글 단어 보존하면서 줄바꿈 허용. */
    <div role="alert" className="@container w-full flex flex-col items-center justify-center h-full min-h-[260px] @sm:min-h-[400px] gap-4 px-4">
      <XCircle size={48} className="text-red-300 shrink-0" aria-hidden="true" />
      <div className="text-center max-w-md">
        <p className="text-base font-semibold text-gray-900 break-keep">{message}</p>
        <p className="text-sm text-gray-500 mt-1 break-keep">{subMessage}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 text-base bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap">
          {showRetryIcon && <RefreshCw size={14} aria-hidden="true" />}{retryLabel}
        </button>
      )}
    </div>
  )
})

export default ErrorState
