import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CreditCard, AlertTriangle, CheckCircle2, Receipt } from 'lucide-react'
import { Modal, AlertModal, useToast, TIMER_MS, ErrorState, EmptyState, SkeletonCard, Skeleton, FloatingScrollChevrons, PageHeader, fmtPrice } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { fmtDate } from '@wellink/ui'
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
      '인플루언서 DB 5,000명',
      'Fit-Score 기반 자동 매칭',
      '기본 성과 분석 대시보드',
      '이메일 지원',
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
      '인플루언서 DB 50,000명+',
      'AI 성과 분석 및 최적화',
      '커스텀 대시보드 구성',
      '우선 지원',
    ],
    cta: '이 플랜으로 변경',
    style: 'green' as const,
  },
  {
    id: 'infinite',
    name: 'Infinite',
    price: '문의',
    unit: '',
    tag: null,
    desc: '엔터프라이즈를 위한 무제한 통합 플랜',
    features: [
      '무제한 인플루언서 DB',
      '전담 마케팅 전문가 배정',
      'API 통합 및 커스텀 개발',
      '24시간 전담 지원',
    ],
    cta: '도입 문의하기',
    style: 'dark' as const,
  },
]

// 플랜 혜택 리스트 — 해지·환불 모달에서 *잃게 되는 혜택* 안내용
const PLAN_BENEFITS = [
  'IG 브랜드 계정 분석 및 AI 가이드',
  '메타 광고 데이터 분석 및 AI 가이드',
  '웰니스·피트니스 인플루언서 Pool',
  '무가/유가 시딩 캠페인 운영',
  'SNS 바이럴 지표 제공 및 분석',
] as const

const PAYMENT_HISTORY: Record<string, { id: number; date: string; desc: string; amount: string; status: string }[]> = {
  focus: [
    { id: 1, date: '2026-04-01', desc: 'Focus Plan 정기결제', amount: '99,000원',  status: '완료' },
    { id: 2, date: '2026-03-01', desc: 'Focus Plan 정기결제', amount: '99,000원',  status: '완료' },
    { id: 3, date: '2026-02-01', desc: 'Focus Plan 정기결제', amount: '99,000원',  status: '완료' },
  ],
  scale: [
    { id: 1, date: '2026-04-01', desc: 'Scale Plan 정기결제',      amount: '299,000원', status: '완료' },
    { id: 2, date: '2026-03-01', desc: 'Scale Plan 정기결제',      amount: '299,000원', status: '완료' },
    { id: 3, date: '2026-02-15', desc: 'Focus → Scale 업그레이드', amount: '200,000원', status: '완료' },
  ],
  infinite: [
    { id: 1, date: '2026-04-01', desc: 'Infinite 계약 체결', amount: '별도 문의', status: '완료' },
  ],
}

/** QA: 요금제 코드 → currentPlan 매핑 */
function planFromQA(qa: string): string {
  if (qa === 'plan-focus')     return 'focus'
  if (qa === 'plan-infinite')  return 'infinite'
  if (qa === 'plan-free')      return ''   // 미구독
  if (qa === 'trial')          return 'scale'  // 무료 체험 중 → Scale 활성
  return 'scale'                           // 기본 / plan-scale
}

export default function Subscription() {
  const navigate = useNavigate()
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
  // confirmTimer cleanup — 언마운트 시 타이머 누수 방지
  useEffect(() => () => { if (confirmTimerRef.current !== null) clearTimeout(confirmTimerRef.current) }, [])
  // 신규 — 해지·환불·해지 예약 (원본 보강)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [cancelStatus, setCancelStatus] = useState<'active' | 'cancel_scheduled'>('active')
  const [cancelModal, setCancelModal] = useState(false)
  const [refundModal, setRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  // 다음 결제일·남은 이용 기간 (mock — 실제는 백엔드)
  const nextPaymentDate = '2026-06-14'
  const remainingDays = (() => {
    const diff = new Date(nextPaymentDate).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()
  // 환불 예정 금액 (mock) — 현재 plan 월 가격 × 남은 일수 / 30 ÷ 1.1 (VAT 분리)
  const refundEstimate = (() => {
    const planObj = plans.find(p => p.id === currentPlan)
    if (!planObj || !/^\d/.test(planObj.price)) return 0
    const monthlyKRW = parseInt(planObj.price.replace(/,/g, ''), 10) || 0
    return Math.floor((monthlyKRW / 1.1) * (remainingDays / 30))
  })()
  // 부분 환불 — 환불 직전 플랜과 환불 금액·일자·대상 결제건 기록 (결제 내역 유지용)
  const [refundedFromPlan, setRefundedFromPlan] = useState<string | null>(null)
  const [refundInfo, setRefundInfo] = useState<{ amount: string; refundedAt: string; lastPaymentId: number } | null>(null)

  // 테이블 가로스크롤 — 그라디언트 오버레이 표시용 (쉐브론은 FloatingScrollChevrons에서 처리)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [canTableScrollLeft, setCanTableScrollLeft] = useState(false)
  const [canTableScrollRight, setCanTableScrollRight] = useState(false)

  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const update = () => {
      setCanTableScrollLeft(el.scrollLeft > 0)
      setCanTableScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  // QA 파라미터(URL search param) 변경 시 외부 시스템 동기화 — 정당한 useEffect 패턴.
  // React 19 idiomatic 대안(key 기반 리마운트·useSyncExternalStore)은 이 케이스에서 더 무거움.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (!selectedPlan) return

    // TODO: 토스페이먼츠 API 키 확정 후 아래 주석 해제
    // const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY
    // const toss = await loadTossPayments(TOSS_CLIENT_KEY)
    // await toss.requestBillingAuth('카드', {
    //   customerKey: user.id,
    //   successUrl: `${window.location.origin}/payment/success?plan=${selectedPlan.id}`,
    //   failUrl: `${window.location.origin}/payment/fail`,
    // })

    setConfirmed(true)
    confirmTimerRef.current = setTimeout(() => {
      if (confirmModal) {
        setCurrentPlan(confirmModal)
        setQAState({ plan: confirmModal as QAPlan })
        // 재구독 시 이전 환불 정보 초기화 (부분 환불 배지 자동 해제)
        setRefundedFromPlan(null)
        setRefundInfo(null)
      }
      setConfirmModal(null)
      setConfirmed(false)
      showToast(`${selectedPlan.name} 플랜으로 변경되었습니다.`, 'success')
      confirmTimerRef.current = null
    }, TIMER_MS.MOCK_PLAN_CHANGE)
  }

  const handleCloseConfirmModal = useCallback(() => {
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = null
    }
    setConfirmed(false)
    setConfirmModal(null)
  }, [])

  /* ── QA: 로딩 상태 — 공통 SkeletonCard ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton shape="text" width={112} height={24} />
            <Skeleton shape="text" width={192} height={12} />
          </div>
          <Skeleton shape="rect" width={96} height={28} />
        </div>
        <div className="grid grid-cols-1 @[560px]:grid-cols-2 @[920px]:grid-cols-3 gap-4 @sm:gap-5">
          {[1, 2, 3].map(i => <SkeletonCard key={i} height={280} />)}
        </div>
        <SkeletonCard height={160} />
      </div>
    )
  }

  /* ── QA: 에러 상태 — 공통 ErrorState ── */
  if (qa === 'error') {
    return (
      <div className="space-y-6">
        <PageHeader title="구독 관리" description="가장 합리적인 가격으로 캠페인 기능을 이용하세요" />
        <ErrorState message="구독 정보를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <PageHeader
        title="구독 관리"
        description="가장 합리적인 가격으로 캠페인 기능을 이용하세요"
        meta={
          displayPlan ? (
            <span className="shrink-0 text-sm font-semibold bg-brand-green-bg text-brand-green-text px-3 py-1.5 rounded-full border border-brand-green-border">
              현재: {plans.find(p => p.id === displayPlan)?.name ?? displayPlan} 플랜
              {(showExpired || showPaymentFailed) && ' (만료)'}
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-300">
              <AlertTriangle size={12} aria-hidden="true" />
              미구독 · 무료 플랜
            </span>
          )
        }
      />

      {/* QA: 구독 만료 배너 */}
      {showExpired && (
        <div className="flex items-start gap-3 bg-red-100 border border-red-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold text-red-700">구독이 만료되었습니다</p>
            <p className="text-sm text-red-500 mt-0.5">지금 플랜을 선택하고 서비스를 계속 이용하세요.</p>
          </div>
        </div>
      )}

      {/* QA: 결제 실패 배너 */}
      {showPaymentFailed && (
        <div className="flex items-start gap-3 bg-amber-100 border border-amber-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold text-amber-800">결제에 실패했습니다</p>
            <p className="text-sm text-amber-700 mt-0.5">결제 수단을 확인하고 다시 시도해 주세요.</p>
          </div>
          <button type="button"
            onClick={() => navigate('/payment/method')}
            className="ml-auto text-sm border border-amber-300 text-amber-800 px-3 py-1.5 rounded-xl hover:bg-amber-200 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            결제 수단 수정
          </button>
        </div>
      )}

      {/* QA: 무료 체험 중 배너 */}
      {showTrial && (
        <div className="bg-brand-green-bg border border-brand-green-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-brand-green-text">현재 Scale 플랜 7일 무료 체험 중입니다.</p>
              <span className="text-sm font-bold text-red-600 bg-red-100 border border-red-200 px-2.5 py-1 rounded-full animate-pulse">D-3</span>
            </div>
            <span className="text-sm font-medium text-brand-green-text bg-brand-green-border px-2.5 py-1 rounded-full">
              체험 중
            </span>
          </div>
          {/* 체험 진행 바 */}
          <div>
            <div className="flex justify-between text-sm text-brand-green-text mb-1.5">
              <span>시작일</span>
              <span>D-3 / 7일</span>
            </div>
            <div className="h-2 bg-brand-green-border rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: '57%' }} />
            </div>
          </div>
        </div>
      )}

      {/* 미구독 안내 배너 — 무료 플랜 / QA plan-free / globalPlan='free' */}
      {(qa === 'plan-free' || displayPlan === 'free' || (!displayPlan && !showExpired && !showPaymentFailed)) && (
        <div className="flex items-start gap-3 bg-amber-100 border border-amber-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-base font-bold text-amber-800">현재 무료 플랜을 이용 중입니다</p>
            <p className="text-sm text-amber-800 mt-0.5">유료 플랜 구독 시 인플루언서 매칭, AI 분석 등 모든 기능을 사용할 수 있어요.</p>
          </div>
        </div>
      )}

      {/* 현재 구독 정보 + 사용량 + 액션 — 유료 플랜 구독자만 노출 (free·미구독 제외) */}
      {displayPlan && displayPlan !== 'free' && !showExpired && !showPaymentFailed && qa !== 'plan-free' && (() => {
        const cur = plans.find(p => p.id === displayPlan)
        // 다음 결제일 — 오늘 + 30일
        const next = new Date()
        next.setDate(next.getDate() + 30)
        const nextBillingDate = next.toISOString().slice(0, 10)
        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 @md:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-green-bg text-brand-green-text px-2.5 py-1 text-sm font-bold">
                    <Check size={12} aria-hidden="true" /> 현재 이용중
                  </span>
                  {cancelStatus === 'cancel_scheduled' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-sm font-bold">
                      해지 예정
                    </span>
                  )}
                </div>
                <h2 className="text-xl @md:text-2xl font-bold text-gray-900">{cur?.name} 플랜</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg @md:text-xl font-bold text-gray-900">{cur?.price}</span>
                  <span className="text-sm text-gray-500">{cur?.unit}</span>
                </div>
                {cancelStatus === 'active' ? (
                  <p className="text-sm text-gray-500 mt-1.5">
                    다음 결제일은 <span className="font-medium text-gray-900">{fmtDate(nextBillingDate)}</span> 입니다.
                  </p>
                ) : (
                  <p className="text-sm text-amber-800 mt-1.5">
                    해지 예정일 <span className="font-bold">{fmtDate(nextBillingDate)}</span> 까지 이용 가능합니다.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {cancelStatus === 'cancel_scheduled' ? (
                  <button type="button"
                    onClick={() => { setCancelStatus('active'); showToast('해지 예약이 취소되었습니다.', 'success') }}
                    className="text-sm font-medium px-3 py-1.5 rounded-xl border border-brand-green-border text-brand-green-text hover:bg-brand-green-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >해지 예약 취소</button>
                ) : (
                  <>
                    <button type="button"
                      onClick={() => setCancelModal(true)}
                      className="text-sm font-medium px-3 py-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >해지</button>
                    <button type="button"
                      onClick={() => setRefundModal(true)}
                      className="text-sm font-medium px-3 py-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >환불 요청</button>
                  </>
                )}
              </div>
            </div>

          </div>
        )
      })()}

      {/* 결제 주기 토글 */}
      <div className="flex items-center justify-center gap-3">
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                billing === b
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {b === 'monthly' ? '월간 결제' : '연간 결제'}
              {b === 'annual' && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${billing === 'annual' ? 'bg-white/20 text-white' : 'bg-brand-green-bg text-brand-green-text'}`}>
                  -20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 플랜 카드 3개 */}
      <div className="grid grid-cols-1 @[560px]:grid-cols-2 @[920px]:grid-cols-3 gap-4 @sm:gap-5">
        {/* Focus — 흰 배경 + 검정 테두리 */}
        {plans.filter(p => p.style === 'white').map(plan => {
          const monthlyKRW = parseInt(plan.price.replace(/,/g, ''), 10)
          const displayPrice = billing === 'annual' ? Math.round(monthlyKRW * 0.8).toLocaleString('ko-KR') : plan.price
          return (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 flex flex-col relative transition-all duration-200 ${
              currentPlan === plan.id
                ? 'border-2 border-gray-900 shadow-md'
                : 'border border-gray-200'
            }`}
          >
            {currentPlan === plan.id && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gray-900 text-white text-sm px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                  현재 플랜
                </span>
              </div>
            )}
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-x-1">
                <span className="text-4xl font-extrabold text-gray-900 tabular-nums">{displayPrice}</span>
                <span className="text-base text-gray-500 whitespace-nowrap">{billing === 'annual' ? '원/월' : '원'}</span>
              </div>
              {billing === 'monthly' && (
                <p className="mt-1 text-xs text-gray-400">매월 청구됩니다</p>
              )}
              {billing === 'annual' && (
                <p className="mt-1 text-xs text-brand-green-text font-medium">연 {Math.round(monthlyKRW * 0.8 * 12).toLocaleString('ko-KR')}원 청구</p>
              )}
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-base text-gray-600">
                  <Check size={16} className="shrink-0 mt-0.5 text-gray-900" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button type="button"
              onClick={() => plan.id !== currentPlan && setConfirmModal(plan.id)}
              disabled={plan.id === currentPlan}
              className={`w-full py-3 rounded-xl text-base font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                plan.id === currentPlan
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {plan.id === currentPlan ? '현재 플랜' : plan.cta}
            </button>
          </div>
          )
        })}

        {/* Scale — 흰 배경 + 그린 테두리 (border opacity 60% 의도된 alpha — 비활성 시 약화 표시) */}
        {plans.filter(p => p.style === 'green').map(plan => {
          const monthlyKRW = parseInt(plan.price.replace(/,/g, ''), 10)
          const displayPrice = billing === 'annual' ? Math.round(monthlyKRW * 0.8).toLocaleString('ko-KR') : plan.price
          return (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 flex flex-col relative transition-all duration-200 ${
              currentPlan === plan.id
                ? 'border-2 border-brand-green shadow-md'
                : 'border-2 border-brand-green'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-brand-green text-white text-sm px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                {currentPlan === plan.id ? '현재 플랜' : plan.tag}
              </span>
            </div>
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-x-1">
                <span className="text-4xl font-extrabold text-gray-900 tabular-nums">{displayPrice}</span>
                <span className="text-base text-gray-500 whitespace-nowrap">{billing === 'annual' ? '원/월' : '원'}</span>
              </div>
              {billing === 'monthly' && (
                <p className="mt-1 text-xs text-gray-400">매월 청구됩니다</p>
              )}
              {billing === 'annual' && (
                <p className="mt-1 text-xs text-brand-green-text font-medium">연 {Math.round(monthlyKRW * 0.8 * 12).toLocaleString('ko-KR')}원 청구</p>
              )}
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-base text-gray-600">
                  <Check size={16} className="shrink-0 mt-0.5 text-brand-green" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button type="button"
              onClick={() => plan.id !== currentPlan && setConfirmModal(plan.id)}
              disabled={plan.id === currentPlan}
              className={`w-full py-3 rounded-xl text-base font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                plan.id === currentPlan
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-green text-white hover:bg-brand-green-hover'
              }`}
            >
              {plan.id === currentPlan ? '현재 플랜' : plan.cta}
            </button>
          </div>
          )
        })}

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
                <span className="bg-gray-600 text-white text-sm px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                  현재 플랜
                </span>
              </div>
            )}
            <div className="mb-5">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-gray-300 mt-1">{plan.desc}</p>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-base text-gray-300">
                  <Check size={16} className="shrink-0 mt-0.5 text-brand-green" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button type="button"
              onClick={() => {
                if (plan.id !== currentPlan) {
                  setEnterpriseModal(true)
                }
              }}
              className={`w-full py-3 rounded-xl text-base font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
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

      {/* 플랜 기능 비교표 */}
      {(() => {
        type FeatureVal = string | boolean
        const comparison: { name: string; focus: FeatureVal; scale: FeatureVal; infinite: FeatureVal; section?: string }[] = [
          { name: '인플루언서 DB',         focus: '5,000명',  scale: '50,000명+',  infinite: '무제한',      section: '핵심 기능' },
          { name: 'AI Fit-Score 매칭',     focus: true,       scale: true,          infinite: true },
          { name: '성과 대시보드',          focus: '기본',     scale: '고급',        infinite: '커스텀' },
          { name: 'Fit-Score 상세 리포트',  focus: false,      scale: true,          infinite: true },
          { name: '캠페인 수',              focus: '월 3건',   scale: '월 20건',     infinite: '무제한',      section: '운영 한도' },
          { name: '팀 멤버',                focus: '1명',      scale: '5명',         infinite: '무제한' },
          { name: '동시 활성 캠페인',       focus: '1건',      scale: '5건',         infinite: '무제한' },
          { name: 'API 접근',               focus: false,      scale: false,         infinite: true,         section: '기술·통합' },
          { name: 'Webhook 연동',           focus: false,      scale: false,         infinite: true },
          { name: '커스텀 도메인 리포트',   focus: false,      scale: false,         infinite: true },
          { name: '전담 매니저',            focus: false,      scale: false,         infinite: true,         section: '지원' },
          { name: '고객 지원',              focus: '이메일',   scale: '우선 응대',   infinite: '전담 24시간' },
          { name: '온보딩 지원',            focus: false,      scale: '기본',        infinite: '맞춤형' },
          { name: '무료 체험',              focus: '7일',      scale: '7일',         infinite: '데모 제공' },
        ]

        const renderCell = (v: FeatureVal, col: 'focus' | 'scale' | 'infinite') => {
          const isScale = col === 'scale'
          const isInfinite = col === 'infinite'
          if (v === true) return (
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${isScale ? 'bg-brand-green' : isInfinite ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Check size={12} className="text-white" strokeWidth={3} aria-hidden="true" />
            </span>
          )
          if (v === false) return <span className="text-gray-200 font-medium">—</span>
          return (
            <span className={`text-sm font-semibold whitespace-nowrap tabular-nums ${isScale ? 'text-brand-green-text' : isInfinite ? 'text-gray-700' : 'text-gray-500'}`}>
              {v}
            </span>
          )
        }

        return (
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">

            {/* 타이틀 */}
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-base font-bold text-gray-900">플랜별 기능 비교</p>
              <p className="text-sm text-gray-400 mt-0.5">월간 결제 기준</p>
            </div>

            {/* 컬럼 헤더 */}
            <div className="grid grid-cols-4">
              <div className="border-b border-gray-100" />
              {([
                { key: 'focus',    label: 'Focus',    price: '99,000원/월',   accent: false, dark: false },
                { key: 'scale',    label: 'Scale',    price: '299,000원/월',  accent: true,  dark: false },
                { key: 'infinite', label: 'Infinite', price: '문의',           accent: false, dark: true  },
              ] as const).map((col) => (
                <div
                  key={col.key}
                  className={`relative border-l border-b border-gray-100 px-4 py-5 text-center ${col.accent ? 'bg-brand-green-bg' : col.dark ? 'bg-gray-900' : 'bg-white'}`}
                >
                  <p className={`text-sm font-bold ${col.accent ? 'text-brand-green-text' : col.dark ? 'text-white' : 'text-gray-900'}`}>
                    {col.label}
                  </p>
                  <p className={`text-xs mt-1 ${col.accent ? 'text-brand-green-text/70' : col.dark ? 'text-gray-400' : 'text-gray-400'}`}>
                    {col.price}
                  </p>
                  {col.accent && (
                    <span className="mt-2 inline-block text-xs font-bold bg-brand-green text-white px-2 py-0.5 rounded-full">추천</span>
                  )}
                </div>
              ))}
            </div>

            {/* 비교 행 */}
            {comparison.map((row) => (
              <div key={row.name}>
                {row.section && (
                  <div className="grid grid-cols-4 bg-gray-50 border-t border-gray-100">
                    <div className="px-6 py-2.5 col-span-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{row.section}</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 border-t border-gray-50 group hover:bg-gray-50/60 transition-colors duration-100">
                  <div className="px-6 py-4 flex items-center">
                    <span className="text-sm text-gray-600 break-keep leading-snug">{row.name}</span>
                  </div>
                  {(['focus', 'scale', 'infinite'] as const).map((key) => (
                    <div
                      key={key}
                      className={`px-4 py-4 border-l border-gray-100 flex items-center justify-center ${key === 'scale' ? 'bg-brand-green-bg/40 group-hover:bg-brand-green-bg/60' : key === 'infinite' ? 'bg-gray-50/60' : ''} transition-colors duration-100`}
                    >
                      {renderCell(row[key], key)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>
        )
      })()}

      {/* 7일 무료 체험 안내 */}
      <p className="text-center text-sm text-gray-500">
        7일 무료 체험 후 자동 결제됩니다. 체험 기간 중 언제든 취소 가능합니다.
      </p>

      {/* 결제 수단 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard size={16} className="text-gray-500" aria-hidden="true" />
            결제 수단
          </h3>
          <button type="button"
            onClick={() => navigate('/payment/method')}
            className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            변경
          </button>
        </div>

        {/* QA: 결제 수단 없음 */}
        {qa === 'no-payment' ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-gray-100 rounded-md flex items-center justify-center shrink-0">
                <CreditCard size={14} className="text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-base text-gray-500">등록된 결제 수단이 없습니다</p>
            </div>
            <button type="button"
              onClick={() => navigate('/payment/method')}
              className="text-sm bg-brand-green text-white px-3 py-1.5 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              등록하기
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-7 bg-gray-800 rounded-md flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">VISA</span>
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">****-****-****-1234</p>
              <p className="text-sm text-gray-500">유효기한: 01/28</p>
            </div>
          </div>
        )}
      </div>

      {/* 최근 결제 내역 — 구독 중이거나 환불됨 상태(부분 환불 표시 유지)에서 노출 */}
      {((currentPlan && qa !== 'plan-free' && qa !== 'trial') || refundedFromPlan) && (() => {
        const planKey = currentPlan || refundedFromPlan || ''
        const sortedHistory = [...(PAYMENT_HISTORY[planKey] ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        return (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-base font-semibold text-gray-900">최근 결제 내역</h3>
            </div>

            {/* 모바일 (< @md) — 카드 리스트 */}
            <ul className="@md:hidden divide-y divide-gray-50">
              {sortedHistory.map(p => {
                const isRefunded = !!(refundInfo && p.id === refundInfo.lastPaymentId)
                return (
                  <li key={p.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-base font-medium text-gray-900 break-keep min-w-0">{p.desc}</p>
                      <span className={`text-sm px-2.5 py-1 rounded-full font-medium whitespace-nowrap shrink-0 ${
                        isRefunded ? 'bg-amber-100 text-amber-700' : 'bg-brand-green-bg text-brand-green-text'
                      }`}>{isRefunded ? '부분 환불 처리됨' : p.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="text-base font-semibold text-gray-900 tabular-nums whitespace-nowrap">{p.amount}</span>
                      <span className="text-gray-400" aria-hidden="true">·</span>
                      <span className="whitespace-nowrap">{fmtDate(p.date)}</span>
                    </div>
                    {isRefunded && refundInfo && (
                      <p className="text-sm text-amber-700 mt-1.5 whitespace-nowrap">
                        결제일 {fmtDate(p.date)} · 환불 요청일 {fmtDate(refundInfo.refundedAt)}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* 태블릿/데스크톱 (@md+) — 테이블 */}
            <div className="hidden @md:block">
              {/* fixed 플로팅 스크롤 쉐브론 — 사이드바 회피 + 40px 터치 타깃 */}
              <FloatingScrollChevrons scrollRef={tableScrollRef} contentRef={tableRef} />
              <div className="relative" ref={tableWrapperRef}>
                {canTableScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
                {canTableScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
                <div className="overflow-x-auto scrollbar-none" ref={tableScrollRef}>
                  <table className="w-full" ref={tableRef}>
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {['내용', '금액', '날짜', '상태'].map(h => (
                          <th key={h} scope="col" className="text-left text-sm font-medium text-gray-500 py-2.5 px-5 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedHistory.map(p => {
                        const isRefunded = !!(refundInfo && p.id === refundInfo.lastPaymentId)
                        return (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-3 px-5 text-base font-medium text-gray-900 whitespace-nowrap">{p.desc}</td>
                            <td className="py-3 px-5 text-base text-gray-900 whitespace-nowrap">{p.amount}</td>
                            <td className="py-3 px-5 whitespace-nowrap">
                              <div className="text-base text-gray-600">{fmtDate(p.date)}</div>
                              {isRefunded && refundInfo && (
                                <div className="text-sm text-amber-700 mt-0.5">환불 요청일 {fmtDate(refundInfo.refundedAt)}</div>
                              )}
                            </td>
                            <td className="py-3 px-5 whitespace-nowrap">
                              <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${
                                isRefunded ? 'bg-amber-100 text-amber-700' : 'bg-brand-green-bg text-brand-green-text'
                              }`}>{isRefunded ? '부분 환불 처리됨' : p.status}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 미구독 상태 빈 결제내역 — 환불 직후에는 결제 내역이 부분 환불 표시로 유지되므로 노출 X */}
      {(!currentPlan && !refundedFromPlan) || qa === 'plan-free' ? (
        <div className="bg-white rounded-xl border border-gray-100">
          <EmptyState
            size="md"
            icon={<CreditCard size={32} />}
            title="결제 내역이 없습니다"
            description="플랜 구독 후 결제 내역이 표시됩니다."
          />
        </div>
      ) : null}

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
        <p className="text-base text-gray-600">웰링크 엔터프라이즈팀에 문의해 주세요.</p>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mt-2">
          <span className="text-base text-gray-500">이메일</span>
          <span className="text-base font-semibold text-gray-900">{ENTERPRISE_EMAIL}</span>
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
            <button type="button" onClick={handleCloseConfirmModal} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-base hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">취소</button>
            <button type="button" onClick={handleConfirm} disabled={confirmed} className="flex-1 bg-brand-green text-white py-2.5 rounded-xl text-base hover:bg-brand-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">확인</button>
          </>
        ) : undefined}
      >
        {confirmed ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-white" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-gray-900">
              {!currentPlan || currentPlan === 'free' ? '구독이 시작되었습니다!' : '플랜이 변경되었습니다!'}
            </p>
          </div>
        ) : (() => {
          const isNewSubscribe = !currentPlan || currentPlan === 'free'
          const isDowngrade = currentPlan === 'scale' && confirmModal === 'focus'
          return (
            <div className="space-y-3">
              <p className="text-base text-gray-600">
                <strong>{selectedPlan?.name}</strong> 플랜으로 {isNewSubscribe ? '구독을 시작' : '변경'}하시겠습니까?
              </p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">{isNewSubscribe ? '구독 플랜' : '변경 플랜'}</span>
                  <span className="font-semibold">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">금액</span>
                  <span className="font-semibold">
                    {selectedPlan?.price === '커스텀' ? '커스텀' : `₩${selectedPlan?.price}${selectedPlan?.unit?.replace('원', '')}`}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">적용일</span>
                  <span className="text-gray-500">{isNewSubscribe ? '즉시 결제 후 적용' : '다음 결제일부터 적용'}</span>
                </div>
                {currentPlan && currentPlan !== 'free' && (
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">현재 플랜</span>
                    <span className="text-gray-500">{plans.find(p => p.id === currentPlan)?.name ?? '없음'}</span>
                  </div>
                )}
              </div>

              {/* 결제 수단 안내 — 미구독→유료 시 즉시 결제, 변경 시 등록 카드로 결제 */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                <CreditCard size={14} className="text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-blue-800 flex-1">
                  {isNewSubscribe
                    ? '등록된 결제 수단으로 즉시 결제됩니다. 결제 수단을 확인하거나 변경하시려면 아래 링크를 이용해 주세요.'
                    : '다음 결제일에 등록된 결제 수단으로 자동 결제됩니다.'}
                  <button type="button"
                    // eslint-disable-next-line react-hooks/refs -- onClick은 이벤트 시점 호출이라 안전 (룰 false positive)
                    onClick={() => { handleCloseConfirmModal(); navigate('/payment/method') }}
                    className="block mt-1 font-semibold underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
                  >
                    결제 수단 관리 →
                  </button>
                </div>
              </div>

              {isDowngrade && (
                <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-xl">
                  <AlertTriangle size={14} className="text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-amber-800">다운그레이드 시 AI 분석, 우선 매칭 등 Scale 전용 기능이 비활성화됩니다.</p>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>

      {/* ── 해지 예약 모달 — 정기 결제만 해지, 만료일까지 혜택 유지 (이미지 매칭) ── */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        size="lg"
        noDividers
        footer={
          <div className="flex flex-col gap-2 w-full">
            <button type="button"
              onClick={() => setCancelModal(false)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >구독 유지하기</button>
            <button type="button"
              onClick={() => {
                setCancelStatus('cancel_scheduled')
                setCancelModal(false)
                showToast('해지가 예약되었습니다. 다음 결제일까지 이용 가능합니다.', 'info')
              }}
              className="text-sm text-gray-500 hover:text-gray-700 py-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >해지 예약하기</button>
          </div>
        }
      >
        {/* 헤더 — 아이콘 + 제목 + 메시지 (모두 가운데) */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-amber-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">정기 결제 해지</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            해지하셔도 <strong className="text-gray-900 font-semibold">{fmtDate(nextPaymentDate)}</strong>까지는<br />
            혜택을 계속 이용하실 수 있습니다.
          </p>
        </div>

        {/* 정보 박스 — gray + 체크 아이콘 */}
        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2.5 mb-6">
          <CheckCircle2 size={18} className="text-gray-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-gray-900">다음 결제일부터 요금이 청구되지 않습니다.</p>
            <p className="text-sm text-gray-500 mt-1">현재 이용 중인 혜택은 만료일까지 유지됩니다.</p>
          </div>
        </div>

        {/* 잃게 되는 혜택 — 체크 아이콘 + 회색 텍스트 */}
        <p className="text-sm font-bold text-gray-900 mb-3">해지 후 잃게 되는 혜택:</p>
        <ul className="space-y-2.5">
          {PLAN_BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Modal>

      {/* ── 환불 및 즉시 해지 모달 — 남은 기간 환불 + 혜택 즉시 중단 + 환불 사유 (이미지 매칭) ── */}
      <Modal
        open={refundModal}
        onClose={() => { setRefundModal(false); setRefundReason('') }}
        size="lg"
        noDividers
        footer={
          <div className="flex flex-col gap-2 w-full">
            <button type="button"
              onClick={() => { setRefundModal(false); setRefundReason('') }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >구독 유지하기</button>
            <button type="button"
              onClick={() => {
                setRefundModal(false)
                setCancelStatus('active')

                // 마지막 결제건 + 미사용 일수 비례 환불 (결제 내역엔 부분 환불 일자만, 금액은 미노출 정책)
                const history = PAYMENT_HISTORY[currentPlan] ?? []
                const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                const last = sorted[0]
                if (last) {
                  setRefundedFromPlan(currentPlan)
                  setRefundInfo({
                    amount: '',  // 결제 내역 노출 X (이전 정책 유지)
                    refundedAt: new Date().toISOString().slice(0, 10),
                    lastPaymentId: last.id,
                  })
                }

                setCurrentPlan('')
                setRefundReason('')
                showToast('환불 요청이 접수되었습니다. 검토 후 영업일 기준 3~5일 내 처리됩니다.', 'info')
              }}
              disabled={!refundReason.trim()}
              className="text-sm text-gray-500 hover:text-gray-700 py-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded disabled:text-gray-300 disabled:cursor-not-allowed"
            >환불 및 해지하기</button>
          </div>
        }
      >
        {/* 헤더 — 아이콘 + 제목 + 메시지 (컴팩트, 첫 화면 안에 textarea 들어오게 압축) */}
        <div className="flex flex-col items-center text-center mb-3">
          <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mb-2">
            <AlertTriangle size={20} className="text-amber-500" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">환불 및 구독 취소</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            지금 취소하시면 남은 기간에 대한 금액이 환불되며,<br />
            <strong className="text-gray-900 font-semibold">{plans.find(p => p.id === currentPlan)?.name ?? '현재 플랜'}</strong>의 혜택이 즉시 중단됩니다.
          </p>
        </div>

        {/* 예상 환불 금액 박스 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5 mb-2">
            <Receipt size={14} aria-hidden="true" />
            예상 환불 금액
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">다음 결제일</span>
              <span className="text-gray-900 font-medium tabular-nums">{fmtDate(nextPaymentDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">남은 이용 기간</span>
              <span className="text-gray-900 font-medium tabular-nums">{remainingDays}일</span>
            </div>
          </div>
          {/* 구분선 + 환불 예정 금액 */}
          <div className="border-t border-gray-200 pt-2 mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              환불 예정 금액 <span className="text-sm font-normal text-gray-500">(vat 미포함)</span>
            </span>
            <span className="text-base font-bold text-brand-green-text tabular-nums">{fmtPrice(refundEstimate)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            * 실제 환불 금액은 결제 수단 및 카드사 정책에 따라 차이가 있을 수 있습니다.
          </p>
        </div>

        {/* 잃게 되는 혜택 */}
        <p className="text-sm font-bold text-gray-900 mb-1.5">취소 시 잃게 되는 혜택:</p>
        <ul className="space-y-1 mb-3">
          {PLAN_BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 size={14} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* 환불 사유 — 필수 */}
        <div>
          <label htmlFor="refund-reason" className="text-sm font-medium text-gray-900 block mb-1.5">
            환불 사유를 알려주세요 <span className="text-rose-500" aria-label="필수">*</span>
          </label>
          <textarea
            id="refund-reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="서비스 이용에 불편하셨던 점이나 환불 사유를 자세히 적어주시면 서비스 개선에 큰 도움이 됩니다."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-brand-green focus-visible:ring-2 focus-visible:ring-brand-green/20 transition-colors"
          />
        </div>
      </Modal>
    </div>
  )
}
