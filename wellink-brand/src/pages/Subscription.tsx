import { useState } from 'react'
import { Check, CreditCard } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

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
    cta: '구독/요금제 변경하기',
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
    cta: '구독/요금제 변경하기',
    style: 'green' as const,
  },
  {
    id: 'infinite',
    name: 'Infinite',
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

export default function Subscription() {
  const [currentPlan] = useState('scale')
  const [confirmModal, setConfirmModal] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const { showToast } = useToast()

  const selectedPlan = plans.find(p => p.id === confirmModal)

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => {
      setConfirmModal(null)
      setConfirmed(false)
      showToast(`${selectedPlan?.name} 플랜으로 변경되었습니다.`, 'success')
    }, 1200)
  }

  return (
    <div className="space-y-8">
      {/* 타이틀 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">구독 관리</h1>
        <p className="text-sm text-gray-500 mt-1">가장 합리적 가격으로 캠페인 기능을 이용하세요</p>
      </div>

      {/* 플랜 카드 3개 */}
      <div className="grid grid-cols-3 gap-5">
        {/* Focus — 흰색 배경 */}
        {plans.filter(p => p.style === 'white').map(plan => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col relative"
          >
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
                  <Check size={15} className="shrink-0 mt-0.5 text-[#8CC63F]" />
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
                  : 'bg-[#8CC63F] text-white hover:bg-[#7AB535]'
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
            className="bg-[#8CC63F] rounded-2xl p-6 flex flex-col relative"
          >
            {/* 추천 배지 */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-[#8CC63F] text-xs px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                {plan.tag}
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
                  <Check size={15} className="shrink-0 mt-0.5 text-white" />
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
                  : 'bg-white text-[#8CC63F] hover:bg-white/90'
              }`}
            >
              {plan.id === currentPlan ? '현재 플랜' : plan.cta}
            </button>
          </div>
        ))}

        {/* Infinite — 검정 배경 */}
        {plans.filter(p => p.style === 'dark').map(plan => (
          <div
            key={plan.id}
            className="bg-gray-900 rounded-2xl p-6 flex flex-col relative"
          >
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <Check size={15} className="shrink-0 mt-0.5 text-[#8CC63F]" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setConfirmModal(plan.id)}
              className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors duration-150"
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* 결제 수단 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard size={15} className="text-gray-500" />
            결제 수단
          </h3>
          <button
            onClick={() => showToast('결제 수단 변경 페이지로 이동합니다.', 'info')}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            변경
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-7 bg-gray-800 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">****-****-****-1234</p>
            <p className="text-xs text-gray-500">유효기한: 01/28</p>
          </div>
        </div>
      </div>

      {/* 최근 결제 내역 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">최근 결제 내역</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {['내용', '금액', '날짜', '상태'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-500 py-2.5 px-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paymentHistory.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-3 px-5 text-sm font-medium text-gray-900">{p.desc}</td>
                <td className="py-3 px-5 text-sm text-gray-900">{p.amount}</td>
                <td className="py-3 px-5 text-sm text-gray-600">{p.date}</td>
                <td className="py-3 px-5">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 확인 모달 */}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} title="플랜 변경">
        {confirmed ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-[#8CC63F] rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-900">플랜이 변경되었습니다!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <strong>{selectedPlan?.name}</strong> 플랜으로 변경하시겠습니까?
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">플랜</span>
                <span className="font-semibold">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">금액</span>
                <span className="font-semibold">{selectedPlan?.price}{selectedPlan?.unit}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
              >취소</button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-[#8CC63F] text-white py-2 rounded-lg text-sm hover:bg-[#7AB535] transition-colors duration-150"
              >확인</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
