import { useSearchParams, useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

/** 결제 실패 페이지 — 토스페이먼츠 redirect target.
 *  ?code=...&message=... 쿼리로 진입.
 *  결과 화면 (로딩/빈 상태 무관 — 결제 결과는 즉시 표시).
 */
export default function PaymentFail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const code    = params.get('code') ?? ''
  const message = params.get('message')?.trim() || '알 수 없는 오류가 발생했습니다.'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main
        role="alert"
        aria-live="assertive"
        className="bg-white rounded-2xl shadow-2xl p-8 @sm:p-10 max-w-md w-full text-center space-y-6"
      >
        {/* 아이콘 — 채도 v2: bg-red-50 → bg-red-100 가시성 확보 */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle size={44} className="text-red-500" aria-hidden="true" />
          </div>
        </div>

        {/* 메인 메시지 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">결제에 실패했습니다</h1>
          <p className="text-base text-gray-600 break-keep">{message}</p>
        </div>

        {/* 에러 코드 — code 있을 때만 */}
        {code && (
          <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-left">
            <div className="flex justify-between items-center gap-3 text-base">
              <span className="text-gray-500 whitespace-nowrap">에러 코드</span>
              <span className="text-red-700 font-medium text-sm break-all">{code}</span>
            </div>
          </div>
        )}

        {/* 안내 문구 */}
        <p className="text-sm text-gray-500 break-keep">
          결제 수단을 확인한 뒤 다시 시도해 주세요. 문제가 지속되면 고객센터로 문의해 주세요.
        </p>

        {/* CTA — '다시 시도' = 이전 결제 화면으로 / '구독 페이지로' = /subscription */}
        <div className="flex flex-col gap-3">
          <button type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1)
              else navigate('/subscription')
            }}
            className="w-full py-3 bg-brand-green text-white rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            다시 시도하기
          </button>
          <button type="button"
            onClick={() => navigate('/subscription')}
            className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-base hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            구독 페이지로
          </button>
        </div>
      </main>
    </div>
  )
}
