import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, MapPin, Package, Footprints } from 'lucide-react'
import Layout from '../components/Layout'
import { mockCampaigns } from '../services/mock/campaigns'
import { useToast } from '@wellink/ui'

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

export default function CampaignApply() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const campaign = mockCampaigns.find(c => c.id === Number(id))

  const [phone, setPhone] = useState('')
  const [agreed1, setAgreed1] = useState(false)
  const [agreed2, setAgreed2] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryZip, setDeliveryZip] = useState('')
  const [deliveryAddr, setDeliveryAddr] = useState('')
  const [deliveryAddrDetail, setDeliveryAddrDetail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  if (!campaign) {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 신청" onBack={() => navigate(-1)}>
        <div className="flex items-center justify-center min-h-[300px] text-sm text-gray-500">
          캠페인 정보를 찾을 수 없습니다.
        </div>
      </Layout>
    )
  }

  const isDelivery = campaign.type === 'delivery'

  const validate = () => {
    const e: Record<string, boolean> = {}
    if (!phone || phone.replace(/\D/g, '').length < 10) e.phone = true
    if (!agreed1) e.agreed1 = true
    if (!agreed2) e.agreed2 = true
    if (isDelivery) {
      if (!deliveryName.trim()) e.deliveryName = true
      if (!deliveryPhone || deliveryPhone.replace(/\D/g, '').length < 10) e.deliveryPhone = true
      if (!deliveryAddr.trim()) e.deliveryAddr = true
    }
    for (const q of campaign.questions ?? []) {
      if (q.required && !answers[q.id]?.trim()) e[`q_${q.id}`] = true
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      showToast('필수 항목을 모두 입력해 주세요.', 'error')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 신청" onBack={() => navigate(-1)}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-6">
          <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-brand-green" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">신청 완료!</p>
            <p className="text-sm text-gray-500 mt-1">브랜드 검토 후 결과를 알려드릴게요</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/my')}
            className="w-full max-w-sm py-3 rounded-xl text-sm font-semibold text-white bg-brand-green"
          >
            나의 캠페인 확인
          </button>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="w-full max-w-sm py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            계속 둘러보기
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false} pageTitle={`${campaign.name} 신청`} onBack={() => navigate(-1)}>
      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">

        {/* 캠페인 요약 */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="text-3xl">{campaign.image}</div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{campaign.brand}</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{campaign.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {isDelivery
                ? <span className="flex items-center gap-1 text-xs text-brand-green"><Package size={11} />배송형</span>
                : <span className="flex items-center gap-1 text-xs text-blue-500"><Footprints size={11} />방문형</span>
              }
              {campaign.reward && <span className="text-xs text-gray-500">· {campaign.reward}</span>}
            </div>
          </div>
        </div>

        {/* 연락처 */}
        <Section title="연락처" required>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            className={fieldCls(errors.phone)}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">올바른 연락처를 입력해 주세요.</p>}
        </Section>

        {/* 배송 정보 (배송형만) */}
        {isDelivery && (
          <Section title="배송 정보" required icon={<MapPin size={14} className="text-brand-green" />}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">수령인 이름 <span className="text-red-500">*</span></label>
                <input
                  value={deliveryName}
                  onChange={e => setDeliveryName(e.target.value)}
                  placeholder="배송받는 분의 이름"
                  className={fieldCls(errors.deliveryName)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">연락처 <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={deliveryPhone}
                  onChange={e => setDeliveryPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  className={fieldCls(errors.deliveryPhone)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">주소 <span className="text-red-500">*</span></label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={deliveryZip}
                    readOnly
                    placeholder="우편번호"
                    className={`${fieldCls(false)} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // 실제 환경에서는 Kakao 우편번호 API 연동
                      setDeliveryZip('06234')
                      setDeliveryAddr('서울 강남구 테헤란로 123')
                    }}
                    className="shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    주소 검색
                  </button>
                </div>
                <input
                  value={deliveryAddr}
                  readOnly
                  placeholder="기본 주소"
                  className={`${fieldCls(errors.deliveryAddr)} mb-2`}
                />
                <input
                  value={deliveryAddrDetail}
                  onChange={e => setDeliveryAddrDetail(e.target.value)}
                  placeholder="상세 주소 (예: 101동 202호)"
                  className={fieldCls(false)}
                />
                {errors.deliveryAddr && <p className="text-xs text-red-500 mt-1">주소를 입력해 주세요.</p>}
              </div>
            </div>
          </Section>
        )}

        {/* 커스텀 질문 */}
        {(campaign.questions ?? []).length > 0 && (
          <Section title="추가 질문">
            <div className="space-y-4">
              {campaign.questions!.map(q => (
                <div key={q.id}>
                  <label className="text-sm font-medium text-gray-800 block mb-2">
                    {q.question}
                    {q.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {q.type === 'radio' && q.options ? (
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className="accent-brand-green"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] ?? ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="답변을 입력해 주세요"
                      rows={3}
                      className={`${fieldCls(errors[`q_${q.id}`])} resize-none`}
                    />
                  )}
                  {errors[`q_${q.id}`] && <p className="text-xs text-red-500 mt-1">필수 항목입니다.</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 약관 동의 */}
        <Section title="약관 동의" required>
          <div className="space-y-3">
            <AgreementRow
              checked={agreed1}
              onChange={setAgreed1}
              error={errors.agreed1}
              text="초상권 활용에 동의합니다."
            />
            <AgreementRow
              checked={agreed2}
              onChange={setAgreed2}
              error={errors.agreed2}
              text="캠페인 유의사항, 개인정보 및 콘텐츠 제3자 제공, 저작물 이용에 동의합니다."
            />
          </div>
        </Section>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity"
        >
          신청하기
        </button>
      </div>
    </Layout>
  )
}

function Section({ title, required, icon, children }: {
  title: string
  required?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {children}
    </div>
  )
}

function AgreementRow({ checked, onChange, error, text }: {
  checked: boolean
  onChange: (v: boolean) => void
  error?: boolean
  text: string
}) {
  return (
    <label className={`flex items-start gap-2.5 cursor-pointer p-3 rounded-xl border transition-colors ${
      error ? 'border-red-200 bg-red-50' : checked ? 'border-brand-green/30 bg-brand-green/5' : 'border-gray-100 bg-gray-50'
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 accent-brand-green"
      />
      <span className="text-sm text-gray-700 leading-snug">{text}</span>
    </label>
  )
}

function fieldCls(error?: boolean) {
  return `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
    error
      ? 'border-red-300 bg-red-50 focus-visible:ring-red-300/50'
      : 'border-gray-200 bg-white focus-visible:border-brand-green'
  }`
}
