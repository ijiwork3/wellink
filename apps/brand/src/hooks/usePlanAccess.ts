import { useQAState, type QAPlan } from '../qa-state'

export type PlanId = '' | 'free' | 'focus' | 'scale' | 'infinite'

const PLAN_LABEL: Record<QAPlan, string> = {
  free: '무료',
  trial: '무료 체험 (Focus)',
  focus: 'Focus',
  scale: 'Scale',
  infinite: 'Infinite',
  expired: '구독 만료',
  'payment-failed': '결제 실패',
}

// QAPlan → 효과적 PlanId 매핑
//   free: 무료 구독 — 전 기능 오픈
//   trial: Focus 활성으로 취급
//   expired/payment-failed: 기능 잠금 (isGated=true)
function effectivePlan(qaPlan: QAPlan): PlanId {
  if (qaPlan === 'free') return 'free'
  if (qaPlan === 'focus') return 'focus'
  if (qaPlan === 'scale') return 'scale'
  if (qaPlan === 'infinite') return 'infinite'
  if (qaPlan === 'trial') return 'focus'
  return ''
}

export function usePlanAccess() {
  const { plan: qaPlan } = useQAState()
  const plan: PlanId = effectivePlan(qaPlan)

  // expired/payment-failed만 잠금 — free 포함 나머지 전체 오픈
  const isGated = qaPlan === 'expired' || qaPlan === 'payment-failed'

  // 플랜별 티어 (Focus < Scale < Infinite)
  const planTier = plan === 'infinite' ? 3 : plan === 'scale' ? 2 : plan === 'focus' ? 1 : 0

  // 유효 플랜 여부 (tier > 0 이고 잠금 아님)
  const hasActivePlan = planTier > 0 && !isGated

  // 다운로드 권한: 유료 플랜(focus/scale/infinite)만
  const canDownloadContent = hasActivePlan

  // Scale 이상 — 고급 분석
  const canViewAdvancedAnalytics = planTier >= 2

  // Scale 이상 — 다중 캠페인 (Focus는 1개)
  const canCreateMultipleCampaigns = planTier >= 2

  // 유효 플랜 — 그룹 관리
  const canManageGroups = hasActivePlan

  // 고급 분석: Infinite 전용 (기존 호환)
  const canUseAdvancedAnalytics = plan === 'infinite'

  // 다중 캠페인: Scale 이상 (기존 호환)
  const canUseMultiCampaign = plan === 'scale' || plan === 'infinite'

  return {
    plan,
    qaPlan,
    planLabel: PLAN_LABEL[qaPlan],
    // 'free'는 미가입(무료) 상태로 취급 — 결제·구독 영역에서 미구독 분기
    isSubscribed: plan !== '' && plan !== 'free',
    isGated,
    isExpired: qaPlan === 'expired',
    isPaymentFailed: qaPlan === 'payment-failed',
    isTrial: qaPlan === 'trial',
    hasActivePlan,
    planTier,
    canDownloadContent,
    canViewAdvancedAnalytics,
    canCreateMultipleCampaigns,
    canManageGroups,
    canUseAdvancedAnalytics,
    canUseMultiCampaign,
  }
}
