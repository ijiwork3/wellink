import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

/** 결제 성공 페이지 — 토스페이먼츠 redirect target.
 *  ?orderId=...&amount=...&plan=... 쿼리로 진입.
 *  TODO(BE): 토스페이먼츠 API 키 확정 후 fetch('/api/payments/confirm') 검증 로직 연결.
 */
const PLAN_NAME_MAP: Record<string, string> = {
  focus:      'Focus',
  scale:      'Scale',
  enterprise: 'Enterprise',
}

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const orderId = params.get('orderId') ?? ''
  const amount  = params.get('amount')  ?? ''
  const planId  = params.get('plan')    ?? ''

  // 알려지지 않은 planId는 빈 문자열로 폴백 (PLAN_NAME_MAP에 없는 임의값이 화면에 노출되지 않도록)
  const planName     = PLAN_NAME_MAP[planId] ?? ''
  // amount 파싱 — 숫자가 아니거나 빈 문자열이면 표시 생략
  const amountNumber = amount.trim() && Number.isFinite(Number(amount)) ? Number(amount) : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main
        role="status"
        aria-live="polite"
        className="bg-white rounded-2xl shadow-2xl p-8 @sm:p-10 max-w-md w-full text-center space-y-6"
      >
        {/* 아이콘 */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 bg-brand-green-bg rounded-full flex items-center justify-center">
            {/* 아이콘은 vivid (brand-green) — 텍스트가 아닌 시각 점이므로 brand-green-text 대신 brand-green 사용 (PaymentFail의 text-red-500과 동일 정책) */}
            <CheckCircle size={44} className="text-brand-green" aria-hidden="true" />
          </div>
        </div>

        {/* 메인 메시지 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">구독이 시작되었습니다!</h1>
          {planName ? (
            <p className="text-base text-gray-600 break-keep">
              <span className="font-semibold text-gray-900">{planName} 플랜</span>이 활성화되었습니다.
            </p>
          ) : (
            <p className="text-base text-gray-500 break-keep">결제가 정상적으로 완료되었습니다.</p>
          )}
        </div>

        {/* 결제 정보 요약 — orderId 또는 유효한 amount 있을 때만 */}
        {(orderId || amountNumber !== null) && (
          <dl className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            {orderId && (
              <div className="flex justify-between items-center gap-3 text-base">
                <dt className="text-gray-500 whitespace-nowrap">주문 번호</dt>
                <dd className="text-gray-900 font-medium text-sm break-all">{orderId}</dd>
              </div>
            )}
            {amountNumber !== null && (
              <div className="flex justify-between items-center gap-3 text-base">
                <dt className="text-gray-500 whitespace-nowrap">결제 금액</dt>
                <dd className="text-gray-900 font-semibold whitespace-nowrap">
                  ₩{amountNumber.toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        )}

        {/* 안내 문구 */}
        <p className="text-sm text-gray-500">
          결제 내역은 <span className="font-medium text-gray-700">마이페이지 &gt; 구독 관리</span>에서 확인할 수 있습니다.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <button type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-brand-green text-white rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            대시보드로 이동
          </button>
          <button type="button"
            onClick={() => navigate('/subscription')}
            className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-base hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            구독 관리 보기
          </button>
        </div>
      </main>
    </div>
  )
}
