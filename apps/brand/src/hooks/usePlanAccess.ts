import { useQAState, type QAPlan } from '../qa-state'

export type PlanId = '' | 'focus' | 'scale' | 'infinite'

const PLAN_LABEL: Record<QAPlan, string> = {
  free: '미구독',
  trial: '무료 체험 (Scale)',
  focus: 'Focus',
  scale: 'Scale',
  infinite: 'Infinite',
  expired: '구독 만료',
  'payment-failed': '결제 실패',
}

// QAPlan → 효과적 PlanId 매핑
//   trial: Scale 활성으로 취급
//   expired/payment-failed: 미구독으로 취급 (기능 잠김)
//   free: 미구독
function effectivePlan(qaPlan: QAPlan): PlanId {
  if (qaPlan === 'focus') return 'focus'
  if (qaPlan === 'scale') return 'scale'
  if (qaPlan === 'infinite') return 'infinite'
  if (qaPlan === 'trial') return 'scale'
  return ''
}

export function usePlanAccess() {
  const { plan: qaPlan } = useQAState()
  const plan: PlanId = effectivePlan(qaPlan)

  // 다운로드 권한: 유료 플랜(focus/scale/infinite)만
  const canDownloadContent = plan === 'focus' || plan === 'scale' || plan === 'infinite'

  // 고급 분석: Infinite 전용
  const canUseAdvancedAnalytics = plan === 'infinite'

  // 다중 캠페인: Scale 이상
  const canUseMultiCampaign = plan === 'scale' || plan === 'infinite'

  return {
    plan,
    qaPlan,
    planLabel: PLAN_LABEL[qaPlan],
    isSubscribed: plan !== '',
    isExpired: qaPlan === 'expired',
    isPaymentFailed: qaPlan === 'payment-failed',
    isTrial: qaPlan === 'trial',
    canDownloadContent,
    canUseAdvancedAnalytics,
    canUseMultiCampaign,
  }
}
