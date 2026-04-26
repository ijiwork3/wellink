import { useEffect, useRef, useState } from 'react'
import { Check, CreditCard, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { Modal, AlertModal, useToast, TIMER_MS } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { fmtDate } from '../utils/fmtDate'
import { ENTERPRISE_EMAIL } from '../config/urls'
import { usePlanAccess } from '../hooks/usePlanAccess'
import { setQAState } from '../qa-state'
import type { QAPlan } from '../qa-state'

const plans = [
  {
    id: 'focus',
    name: 'Focus',
    price: '99,000',
    unit: '원/월',
    tag: null,
    desc: '인플루언서 매칭 기본 지원',
    features: [
      '기본 인플루언서 DB 접근 (5,000명)',
      '월별 프로모션 참여',
      '기본 분석 리포트 제공',
    ],
    cta: '이 플랜으로 변경',
    style: 'white' as const,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '299,000',
    unit: '원/월',
    tag: '추천',
    desc: 'AI 기반 성과 분석 + 우선 매칭',
    features: [
      '50,000명+ 인플루언서 DB 접근',
      'AI 기반 성과 예측·분석',
      '우선 인플루언서 매칭',
      '커스텀 대시보드',
      '우선 지원',
    ],
    cta: '이 플랜으로 변경',
    style: 'green' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '커스텀',
    unit: '',
    tag: null,
    desc: '글로벌 엔터프라이즈 맞춤형',
    features: [
      '무제한 인플루언서 DB',
      '전담 전문가 배정',
      '실시간 전략 컨설팅',
      '글로벌 솔루션',
      '우선 기술 지원',
    ],
    cta: '도입 문의하기',
    style: 'dark' as const,
  },
]

const paymentHistory = [
  { id: 1, date: '2026-04-01', desc: 'Scale Plan 정기결제', amount: '299,000원', status: '완료' },
  { id: 2, date: '2026-03-01', desc: 'Scale Plan 정기결제', amount: '299,000원', status: '완료' },
  { id: 3, date: '2026-02-15', desc: 'Focus → Scale 업그레이드', amount: '200,000원', status: '완료' },
]

/** QA: 요금제 코드 → currentPlan 매핑 */
function planFromQA(qa: string): string {
  if (qa === 'plan-focus')    return 'focus'
  if (qa === 'plan-enterprise') return 'enterprise'
  if (qa === 'plan-free')     return ''   // 미구독
  if (qa === 'trial')         return 'scale'  // 무료 체험 중 → Scale 활성
  return 'scale'                          // 기본 / plan-scale
}

export default function Subscription() {
  const qa = useQAMode()
  const { plan: globalPlan, qaPlan } = usePlanAccess()
  // 전역 plan 우선, ?qa=plan-X 도 호환 (페이지 단축경로)
  const [currentPlan, setCurrentPlan] = useState<string>(() =>
    qa.startsWith('plan-') || qa === 'trial' ? planFromQA(qa) : globalPlan,
  )
  const [confirmModal, setConfirmModal] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [enterpriseModal, setEnterpriseModal] = useState(false)
  const { showToast } = useToast()
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 신규 — 해지·환불·해지 예약 (원본 보강)
  const [cancelStatus, setCancelStatus] = useState<'active' | 'cancel_scheduled'>('active')
  const [cancelModal, setCancelModal] = useState(false)
  const [refundModal, setRefundModal] = useState(false)

  // QA 파라미터 변경 시 상태 동기화
  useEffect(() => {
    if (qa === 'modal-upgrade')   { setConfirmModal('scale'); return }
    if (qa === 'modal-downgrade') { setConfirmModal('focus'); return }
    setConfirmModal(null)
    setCurrentPlan(qa.startsWith('plan-') || qa === 'trial' ? planFromQA(qa) : globalPlan)
  }, [qa, globalPlan])

  // 배너: URL ?qa= 또는 전역 qaPlan 중 하나라도 해당하면 표시
  const showExpired       = qa === 'expired'       || qaPlan === 'expired'
  const showPaymentFailed = qa === 'payment-failed' || qaPlan === 'payment-failed'
  const showTrial         = qa === 'trial'          || qaPlan === 'trial'
  // 만료/결제실패 시 카드 하이라이트는 마지막 유효 플랜(scale 기본)으로 표시
  const displayPlan = (showExpired || showPaymentFailed) && !currentPlan ? 'scale' : currentPlan

  const selectedPlan = plans.find(p => p.id === confirmModal)

  const handleConfirm = () => {
    setConfirmed(true)
    confirmTimerRef.current = setTimeout(() => {
      if (confirmModal) {
        setCurrentPlan(confirmModal)
        setQAState({ plan: confirmModal as QAPlan })
      }
      setConfirmModal(null)
      setConfirmed(false)
      showToast(`${selectedPlan?.name} 플랜으로 변경되었습니다.`, 'success')
      confirmTimerRef.current = null
    }, TIMER_MS.MOCK_PLAN_CHANGE)
  }

  const handleCloseConfirmModal = () => {
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = null
    }
    setConfirmed(false)
    setConfirmModal(null)
  }

  /* ── QA: 로딩 상태 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-28 bg-gray-200 rounded-full" />
            <div className="h-3 w-48 bg-gray-100 rounded-full" />
          </div>
          <div className="h-7 w-24 bg-gray-100 rounded-full" />
        </div>
        {/* 플랜 카드 3개 스켈레톤 */}
        <div className="grid grid-cols-1 @sm:grid-cols-3 gap-4 @sm:gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
                <div className="h-3 w-32 bg-gray-100 rounded-full" />
                <div className="h-8 w-24 bg-gray-200 rounded-full mt-3" />
              </div>
              <div className="space-y-2.5">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-3 w-full bg-gray-100 rounded-full" />
                ))}
              </div>
              <div className="h-10 w-full bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
        {/* 결제 정보 섹션 스켈레톤 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="h-4 w-20 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-7 bg-gray-200 rounded-md" />
            <div className="space-y-1.5">
              <div className="h-3 w-36 bg-gray-200 rounded-full" />
              <div className="h-3 w-24 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">구독 관리</h1>
          <p className="text-sm text-gray-500 mt-1">가장 합리적인 가격으로 캠페인 기능을 이용하세요</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-12 text-center">
          <XCircle size={40} className="text-red-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-900 mb-1">구독 정보를 불러올 수 없습니다</p>
          <p className="text-xs text-gray-500 mb-4">잠시 후 다시 시도해 주세요.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={14} aria-hidden="true" />다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 타이틀 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">구독 관리</h1>
          <p className="text-sm text-gray-500 mt-1">가장 합리적인 가격으로 캠페인 기능을 이용하세요</p>
        </div>
        {/* 현재 플랜 뱃지 */}
        {displayPlan ? (
          <span className="text-xs font-semibold bg-brand-green/10 text-brand-green-text px-3 py-1.5 rounded-full border border-brand-green/20">
            현재: {plans.find(p => p.id === displayPlan)?.name ?? displayPlan} 플랜
            {(showExpired || showPaymentFailed) && ' (만료)'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-300">
            <AlertTriangle size={12} aria-hidden="true" />
            미구독 · 무료 플랜
          </span>
        )}
      </div>

      {/* QA: 구독 만료 배너 */}
      {showExpired && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-red-700">구독이 만료되었습니다</p>
            <p className="text-xs text-red-500 mt-0.5">지금 플랜을 선택하고 서비스를 계속 이용하세요.</p>
          </div>
        </div>
      )}

      {/* QA: 결제 실패 배너 */}
      {showPaymentFailed && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-800">결제에 실패했습니다</p>
            <p className="text-xs text-amber-600 mt-0.5">결제 수단을 확인하고 다시 시도해 주세요.</p>
          </div>
          <button
            onClick={() => showToast('결제 수단 변경 페이지로 이동합니다.', 'info')}
            className="ml-auto text-xs border border-amber-300 text-amber-700 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors shrink-0"
          >
            결제 수단 수정
          </button>
        </div>
      )}

      {/* QA: 무료 체험 중 배너 */}
      {showTrial && (
        <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-brand-green-text">현재 Scale 플랜 14일 무료 체험 중입니다.</p>
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">D-7</span>
            </div>
            <span className="text-xs font-medium text-brand-green-text bg-brand-green/20 px-2.5 py-1 rounded-full">
              체험 중
            </span>
          </div>
          {/* 체험 진행 바 */}
          <div>
            <div className="flex justify-between text-xs text-brand-green-text/70 mb-1.5">
              <span>시작일</span>
              <span>7일 경과 / 14일</span>
            </div>
            <div className="h-2 bg-brand-green/20 rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: '50%' }} />
            </div>
          </div>
        </div>
      )}

      {/* 미구독 안내 배너 — 무료 플랜 / QA plan-free */}
      {(qa === 'plan-free' || (!displayPlan && !showExpired && !showPaymentFailed)) && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">현재 무료 플랜을 이용 중입니다</p>
            <p className="text-xs text-amber-700 mt-0.5">유료 플랜 구독 시 인플루언서 매칭, AI 분석 등 모든 기능을 사용할 수 있어요.</p>
          </div>
        </div>
      )}

      {/* 현재 구독 정보 + 사용량 + 액션 — 신규, 원본 보강 (구독 중일 때만) */}
      {displayPlan && !showExpired && !showPaymentFailed && qa !== 'plan-free' && (() => {
        const cur = plans.find(p => p.id === displayPlan)
        // 다음 결제일 — 오늘 + 30일
        const next = new Date()
        next.setDate(next.getDate() + 14)
        const nextBillingDate = next.toISOString().slice(0, 10)
        // 사용량 데이터 — 플랜별 (원본 getDefaultFeatures 동등)
        const usage = displayPlan === 'focus' ? [
          { name: '인플루언서 DB 접근', used: 1200, limit: 5000, unit: '명' },
          { name: 'AI 시뮬레이션', used: 3, limit: 10, unit: '회' },
          { name: '캠페인 관리', used: 2, limit: 5, unit: '개' },
        ] : displayPlan === 'scale' ? [
          { name: '인플루언서 DB 접근', used: 12500, limit: 50000, unit: '명' },
          { name: 'AI 시뮬레이션', used: 45, limit: 100, unit: '회' },
          { name: '캠페인 관리', used: 8, limit: 20, unit: '개' },
        ] : [
          { name: '인플루언서 DB 접근', used: 28000, limit: 999999, unit: '명' },
          { name: 'AI 시뮬레이션', used: 92, limit: 999, unit: '회' },
          { name: '캠페인 관리', used: 24, limit: 999, unit: '개' },
        ]
        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 @md:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 text-brand-green-text px-2.5 py-1 text-xs font-bold">
                    <Check size={12} aria-hidden="true" /> 현재 이용중
                  </span>
                  {cancelStatus === 'cancel_scheduled' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-xs font-bold">
                      해지 예정
                    </span>
                  )}
                </div>
                <h2 className="text-xl @md:text-2xl font-bold text-gray-900">{cur?.name} 플랜</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base @md:text-lg font-bold text-gray-900">{cur?.price}</span>
                  <span className="text-xs text-gray-500">{cur?.unit}</span>
                </div>
                {cancelStatus === 'active' ? (
                  <p className="text-xs text-gray-500 mt-1.5">
                    다음 결제일은 <span className="font-medium text-gray-900">{fmtDate(nextBillingDate)}</span> 입니다.
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 mt-1.5">
                    해지 예정일 <span className="font-bold">{fmtDate(nextBillingDate)}</span> 까지 이용 가능합니다.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {cancelStatus === 'cancel_scheduled' ? (
                  <button
                    onClick={() => { setCancelStatus('active'); showToast('해지 예약이 취소되었습니다.', 'success') }}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >해지 예약 취소</button>
                ) : (
                  <>
                    <button
                      onClick={() => setCancelModal(true)}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                    >해지</button>
                    <button
                      onClick={() => setRefundModal(true)}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                    >환불 요청</button>
                  </>
                )}
              </div>
            </div>

            {/* 이번 달 사용량 — 원본 getDefaultFeatures 동등 */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                이번 달 사용량 현황
                <span className="text-[10px] font-normal text-gray-400">(매월 결제일 초기화)</span>
              </h3>
              <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3">
                {usage.map(f => {
                  const pct = Math.min(100, Math.max(0, (f.used / f.limit) * 100))
                  const isOver = f.used >= f.limit
                  const isWarning = pct > 90 && !isOver
                  return (
                    <div key={f.name} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">{f.name}</span>
                        <span className="text-[11px] font-bold text-gray-900">
                          {f.used.toLocaleString()} / {f.limit >= 999999 ? '∞' : f.limit.toLocaleString()}{f.unit}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver || isWarning ? 'bg-red-500' : 'bg-brand-green'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {isOver && (
                        <p className="mt-1.5 text-[10px] text-red-500 flex items-center gap-1">
                          <AlertTriangle size={10} aria-hidden="true" />
                          한도 초과! 플랜 업그레이드를 검토해 주세요.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* 플랜 카드 3개 */}
      <div className="grid grid-cols-1 @sm:grid-cols-3 gap-4 @sm:gap-5">
        {/* Focus — 흰색 배경 */}
        {plans.filter(p => p.style === 'white').map(plan => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 flex flex-col relative transition-all duration-200 ${
              currentPlan === plan.id
                ? 'border-2 border-brand-green shadow-md'
                : 'border border-gray-200'
            }`}
          >
            {currentPlan === plan.id && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand-green text-white text-xs px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                  현재 플랜
                </span>
              </div>
            )}
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.unit}</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check size={15} className="shrink-0 mt-0.5 text-brand-green" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => plan.id !== currentPlan && setConfirmModal(plan.id)}
              disabled={plan.id === currentPlan}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                plan.id === currentPlan
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-green text-white hover:bg-brand-green-hover'
              }`}
            >
              {plan.id === currentPlan ? '현재 플랜' : plan.cta}
            </button>
          </div>
        ))}

        {/* Scale — 브랜드 그린 배경 */}
        {plans.filter(p => p.style === 'green').map(plan => (
          <div
            key={plan.id}
            className={`bg-brand-green rounded-2xl p-6 flex flex-col relative ${
              currentPlan === plan.id ? 'ring-2 ring-offset-2 ring-brand-green' : ''
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-brand-green text-xs px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                {currentPlan === plan.id ? '현재 플랜' : plan.tag}
              </span>
            </div>
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-white/80 mt-1">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                <span className="text-sm text-white/80">{plan.unit}</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/90">
                  <Check size={15} className="shrink-0 mt-0.5 text-white" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => plan.id !== currentPlan && setConfirmModal(plan.id)}
              disabled={plan.id === currentPlan}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                plan.id === currentPlan
                  ? 'bg-white/30 text-white/60 cursor-not-allowed'
                  : 'bg-white text-brand-green hover:bg-white/90'
              }`}
            >
              {plan.id === currentPlan ? '현재 플랜' : plan.cta}
            </button>
          </div>
        ))}

        {/* Enterprise — 검정 배경 */}
        {plans.filter(p => p.style === 'dark').map(plan => (
          <div
            key={plan.id}
            className={`bg-gray-900 rounded-2xl p-6 flex flex-col relative ${
              currentPlan === plan.id ? 'ring-2 ring-offset-2 ring-gray-700' : ''
            }`}
          >
            {currentPlan === plan.id && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gray-600 text-white text-xs px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                  현재 플랜
                </span>
              </div>
            )}
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500">
                  <Check size={15} className="shrink-0 mt-0.5 text-brand-green" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                if (plan.id !== currentPlan) {
                  setEnterpriseModal(true)
                }
              }}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                currentPlan === plan.id
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-2 border-white text-white hover:bg-white/10'
              }`}
            >
              {currentPlan === plan.id ? '현재 플랜' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* 결제 수단 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard size={15} className="text-gray-500" aria-hidden="true" />
            결제 수단
          </h3>
          <button
            onClick={() => showToast('결제 수단 변경 페이지로 이동합니다.', 'info')}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
          >
            변경
          </button>
        </div>

        {/* QA: 결제 수단 없음 */}
        {qa === 'no-payment' ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-gray-200 rounded-md flex items-center justify-center shrink-0">
                <CreditCard size={14} className="text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-sm text-gray-400">등록된 결제 수단이 없습니다</p>
            </div>
            <button
              onClick={() => showToast('결제 수단 등록 페이지로 이동합니다.', 'info')}
              className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-xl hover:bg-brand-green-hover transition-colors"
            >
              등록하기
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-7 bg-gray-800 rounded-md flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">****-****-****-1234</p>
              <p className="text-xs text-gray-500">유효기한: 01/28</p>
            </div>
          </div>
        )}
      </div>

      {/* 최근 결제 내역 — 미구독 / 무료 상태면 숨김 */}
      {currentPlan && qa !== 'plan-free' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">최근 결제 내역</h3>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {['내용', '금액', '날짜', '상태'].map(h => (
                  <th key={h} scope="col" className="text-left text-xs font-medium text-gray-500 py-2.5 px-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...paymentHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-3 px-5 text-sm font-medium text-gray-900">{p.desc}</td>
                  <td className="py-3 px-5 text-sm text-gray-900">{p.amount}</td>
                  <td className="py-3 px-5 text-sm text-gray-600">{fmtDate(p.date)}</td>
                  <td className="py-3 px-5">
                    <span className="text-xs bg-brand-green/10 text-brand-green-text px-2 py-0.5 rounded-full font-medium">{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* 미구독 상태 빈 결제내역 */}
      {(!currentPlan || qa === 'plan-free') && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <CreditCard size={32} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-400">결제 내역이 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">플랜 구독 후 결제 내역이 표시됩니다</p>
        </div>
      )}

      {/* Enterprise 도입 문의 모달 */}
      <AlertModal
        open={enterpriseModal}
        onClose={() => setEnterpriseModal(false)}
        title="도입 문의"
        confirmLabel="확인"
        size="sm"
        onConfirm={() => setEnterpriseModal(false)}
        showCancel={false}
      >
        <p className="text-sm text-gray-600">웰링크 엔터프라이즈팀에 문의해 주세요.</p>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mt-2">
          <span className="text-sm text-gray-500">이메일</span>
          <span className="text-sm font-semibold text-gray-900">{ENTERPRISE_EMAIL}</span>
        </div>
      </AlertModal>

      {/* 플랜 변경 확인 모달 */}
      <Modal
        open={!!confirmModal}
        onClose={handleCloseConfirmModal}
        title="플랜 변경"
        size="sm"
        footer={!confirmed ? (
          <>
            <button onClick={handleCloseConfirmModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">취소</button>
            <button onClick={handleConfirm} disabled={confirmed} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-sm hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">확인</button>
          </>
        ) : undefined}
      >
        {confirmed ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-white" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-gray-900">플랜이 변경되었습니다!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600"><strong>{selectedPlan?.name}</strong> 플랜으로 변경하시겠습니까?</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">변경 플랜</span>
                <span className="font-semibold">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">금액</span>
                <span className="font-semibold">
                  {selectedPlan?.price === '커스텀' ? '커스텀' : `₩${selectedPlan?.price}${selectedPlan?.unit?.replace('원', '')}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">적용일</span>
                <span className="text-gray-500">다음 결제일부터 적용</span>
              </div>
              {currentPlan && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">현재 플랜</span>
                  <span className="text-gray-500">{plans.find(p => p.id === currentPlan)?.name ?? '없음'}</span>
                </div>
              )}
            </div>
            {currentPlan === 'scale' && confirmModal === 'focus' && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-amber-700">다운그레이드 시 AI 분석, 우선 매칭 등 Scale 전용 기능이 비활성화됩니다.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 해지 확인 모달 — 신규, 원본 CancelPaymentModal 동등 */}
      <AlertModal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="구독을 해지하시겠습니까?"
        confirmLabel="해지하기"
        cancelLabel="유지"
        variant="danger"
        size="sm"
        onConfirm={() => {
          setCancelStatus('cancel_scheduled')
          setCancelModal(false)
          showToast('해지가 예약되었습니다. 다음 결제일까지 이용 가능합니다.', 'info')
        }}
      >
        <p className="text-xs text-gray-500">
          해지하면 <strong className="text-gray-700">다음 결제일까지 계속 이용</strong>한 뒤 자동으로 해지됩니다.
          그 전까지는 언제든 해지 예약을 취소할 수 있습니다.
        </p>
      </AlertModal>

      {/* 환불 요청 모달 — 신규, 원본 동등 (즉시 종료) */}
      <AlertModal
        open={refundModal}
        onClose={() => setRefundModal(false)}
        title="환불을 요청하시겠습니까?"
        confirmLabel="환불 요청"
        cancelLabel="취소"
        variant="danger"
        size="sm"
        onConfirm={() => {
          setRefundModal(false)
          setCancelStatus('active')
          setCurrentPlan('')  // 즉시 미구독
          showToast('환불 요청이 접수되었습니다. 검토 후 영업일 기준 3~5일 내 처리됩니다.', 'info')
        }}
      >
        <p className="text-xs text-gray-500">
          환불 요청 시 <strong className="text-red-600">구독이 즉시 종료</strong>되며, 결제 금액은 영업일 기준 3~5일 내 카드사를 통해 환불됩니다.
          미사용 일수에 따라 부분 환불됩니다.
        </p>
      </AlertModal>
    </div>
  )
}
