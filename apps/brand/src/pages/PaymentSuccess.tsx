import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

// TODO: 토스페이먼츠 API 키 미확정 — 결제 검증 API 연동 대기 중
// 현재는 파라미터 표시 + 성공 UI만 구현

const PLAN_NAME_MAP: Record<string, string> = {
  focus:      'Focus',
  scale:      'Scale',
  enterprise: 'Enterprise',
}

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const orderId    = params.get('orderId')    ?? ''
  const _paymentKey = params.get('paymentKey') ?? ''  // Toss 연동 시 결제 검증 API에 사용 예정
  const amount     = params.get('amount')     ?? ''
  const planId     = params.get('plan')       ?? ''

  const planName = PLAN_NAME_MAP[planId] ?? planId

  // TODO: 토스페이먼츠 API 키 확정 후 아래 로직 해제
  // useEffect(() => {
  //   if (!orderId || !paymentKey || !amount) return
  //   fetch('/api/payments/confirm', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ orderId, paymentKey, amount: Number(amount) }),
  //   })
  //     .then(res => res.json())
  //     .then(data => { /* plan 상태 갱신 */ })
  //     .catch(() => navigate('/payment/fail?code=SERVER_ERROR&message=결제 검증 실패'))
  // }, [orderId, paymentKey, amount, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center space-y-6">
        {/* 아이콘 */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center">
            <CheckCircle size={44} className="text-brand-green" aria-hidden="true" />
          </div>
        </div>

        {/* 메인 메시지 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">구독이 시작되었습니다!</h1>
          {planName && (
            <p className="text-base text-gray-600">
              <span className="font-semibold text-gray-900">{planName} 플랜</span>이 활성화되었습니다.
            </p>
          )}
          {!planName && (
            <p className="text-base text-gray-500">결제가 정상적으로 완료되었습니다.</p>
          )}
        </div>

        {/* 결제 정보 요약 */}
        {(orderId || amount) && (
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            {orderId && (
              <div className="flex justify-between text-base">
                <span className="text-gray-500">주문 번호</span>
                <span className="text-gray-900 font-medium text-sm break-all">{orderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between text-base">
                <span className="text-gray-500">결제 금액</span>
                <span className="text-gray-900 font-semibold">
                  ₩{Number(amount).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 안내 문구 */}
        <p className="text-sm text-gray-400">
          결제 내역은 마이페이지 &gt; 구독 관리에서 확인할 수 있습니다.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 bg-brand-green text-white rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          대시보드로 이동
        </button>
      </div>
    </div>
  )
}
