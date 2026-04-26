// Mock data — replace with API calls when backend is ready

export interface SubscriptionPlan {
  id: string
  name: string
  price: string
  unit: string
  tag: string | null
  desc: string
  features: string[]
  cta: string
  style: 'white' | 'green' | 'dark'
}

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'focus',
    name: 'Focus',
    price: '99,000',
    unit: '원/월',
    tag: null,
    desc: '인플루언서 매칭 기본 지원',
    features: ['기본 인플루언서 DB 접근 (5,000명)', '월별 프로모션 참여', '기본 분석 리포트 제공'],
    cta: '이 플랜으로 변경',
    style: 'white',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '299,000',
    unit: '원/월',
    tag: '추천',
    desc: 'AI 기반 성과 분석 + 우선 매칭',
    features: ['50,000명+ 인플루언서 DB 접근', 'AI 기반 성과 예측·분석', '우선 인플루언서 매칭', '커스텀 대시보드', '우선 지원'],
    cta: '이 플랜으로 변경',
    style: 'green',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '커스텀',
    unit: '',
    tag: null,
    desc: '글로벌 엔터프라이즈 맞춤형',
    features: ['무제한 인플루언서 DB', '전담 전문가 배정', '실시간 전략 컨설팅', '글로벌 솔루션', '우선 기술 지원'],
    cta: '도입 문의하기',
    style: 'dark',
  },
]

export interface PaymentRecord {
  id: number
  date: string
  desc: string
  amount: string
  status: string
}

export const mockPaymentHistory: PaymentRecord[] = [
  { id: 1, date: '2026-04-01', desc: 'Scale Plan 정기결제', amount: '299,000원', status: '완료' },
  { id: 2, date: '2026-03-01', desc: 'Scale Plan 정기결제', amount: '299,000원', status: '완료' },
  { id: 3, date: '2026-02-15', desc: 'Focus → Scale 업그레이드', amount: '200,000원', status: '완료' },
]
