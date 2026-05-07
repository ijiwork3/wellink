import { useQAState, type QAPlan } from '../qa-state'

export type PlanId = '' | 'free' | 'focus' | 'scale' | 'enterprise'

const PLAN_LABEL: Record<QAPlan, string> = {
  free: '무료',
  trial: '무료 체험 (Scale)',
  focus: 'Focus',
  scale: 'Scale',
  enterprise: 'Enterprise',
  expired: '구독 만료',
  'payment-failed': '결제 실패',
}

// QAPlan → 효과적 PlanId 매핑
//   free: 무료 구독 — 전 기능 오픈
//   trial: Scale 활성으로 취급
//   expired/payment-failed: 기능 잠금 (isGated=true)
function effectivePlan(qaPlan: QAPlan): PlanId {
  if (qaPlan === 'free') return 'free'
  if (qaPlan === 'focus') return 'focus'
  if (qaPlan === 'scale') return 'scale'
  if (qaPlan === 'enterprise') return 'enterprise'
  if (qaPlan === 'trial') return 'scale'
  return ''
}

export function usePlanAccess() {
  const { plan: qaPlan } = useQAState()
  const plan: PlanId = effectivePlan(qaPlan)

  // expired/payment-failed만 잠금 — free 포함 나머지 전체 오픈
  const isGated = qaPlan === 'expired' || qaPlan === 'payment-failed'

  // 다운로드 권한: 유료 플랜(focus/scale/enterprise)만
  const canDownloadContent = plan === 'focus' || plan === 'scale' || plan === 'enterprise'

  // 고급 분석: Enterprise 전용
  const canUseAdvancedAnalytics = plan === 'enterprise'

  // 다중 캠페인: Scale 이상
  const canUseMultiCampaign = plan === 'scale' || plan === 'enterprise'

  return {
    plan,
    qaPlan,
    planLabel: PLAN_LABEL[qaPlan],
    isSubscribed: plan !== '',
    isGated,
    isExpired: qaPlan === 'expired',
    isPaymentFailed: qaPlan === 'payment-failed',
    isTrial: qaPlan === 'trial',
    canDownloadContent,
    canUseAdvancedAnalytics,
    canUseMultiCampaign,
  }
}
