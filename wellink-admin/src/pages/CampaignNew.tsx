import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'
import InfluencerCard from '../components/InfluencerCard'
import Modal from '../components/Modal'
import CustomSelect from '../components/CustomSelect'
import TagInput from '../components/TagInput'
import FileUpload from '../components/FileUpload'
import { useToast } from '../components/Toast'

const aiInfluencers = [
  { id: 1, name: '이창민', platform: '인스타그램', followers: 8700, engagement: 4.1, authentic: 64.7, category: ['피트니스', '크로스핏'] },
  { id: 4, name: '김가애', platform: '인스타그램', followers: 18900, engagement: 4.2, authentic: 5.5, category: ['요가'] },
  { id: 5, name: '박리나', platform: '인스타그램', followers: 7120, engagement: 2.23, authentic: 1.6, category: ['웰니스'] },
]

const goalOptions = [
  { label: '선택하세요', value: '' },
  { label: '브랜드 인지도 향상', value: '인지도' },
  { label: '구매 전환 유도', value: '전환' },
  { label: '팔로워 증가', value: '팔로워' },
  { label: '콘텐츠 제작', value: '콘텐츠' },
]

const supplyOptions = [
  { label: '배송', value: '배송' },
  { label: '직접 방문', value: '직접 방문' },
  { label: '제공 없음', value: '제공 없음' },
]

const TOTAL_STEPS = 5
const stepLabels = ['기본정보', '예산·조건', '원고가이드', '인플루언서', '검토·발행']

export default function CampaignNew() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [completedModal, setCompletedModal] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)

  const [s1, setS1] = useState({ name: '', goal: '', channels: [] as string[], startDate: '', endDate: '', applyDeadline: '', campaignType: '기본캠페인' as string, brandHashtags: [] as string[] })
  const [s2, setS2] = useState({ budget: '', minUnit: '', maxUnit: '', headcount: '', supply: '배송' })
  const [s3, setS3] = useState({ required: '', prohibited: [] as string[], hashtags: [] as string[], contentRef: '', snsExternalUse: '사용 불가' as string })
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const triggerAutoSave = () => {
    setAutoSaved(true)
    setTimeout(() => setAutoSaved(false), 2000)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!s1.name.trim() || !s1.goal) {
        showToast('캠페인명과 목적을 입력해주세요.', 'error')
        return
      }
    }
    if (step === 2) {
      if (!s2.budget.trim()) {
        showToast('예산을 입력해주세요.', 'error')
        return
      }
    }
    triggerAutoSave()
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const toggleChannel = (ch: string) => {
    setS1(prev => {
      const channels = prev.channels.includes(ch)
        ? prev.channels.filter(c => c !== ch)
        : [...prev.channels, ch]
      return { ...prev, channels }
    })
  }

  // 날짜 입력 wrapper (styled)
  const StyledDateInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150 bg-white cursor-pointer"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">새 캠페인 등록</h1>
        <p className="text-sm text-gray-500 mt-0.5">5단계로 캠페인을 설정합니다.</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center mb-8">
        {stepLabels.map((label, i) => {
          const num = i + 1
          const isActive = num === step
          const isDone = num < step
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => num < step && setStep(num)}
                className={`flex flex-col items-center gap-1 ${num < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                  isDone
                    ? 'bg-[#8CC63F] text-white'
                    : isActive
                    ? 'bg-[#8CC63F] text-white ring-4 ring-[#8CC63F]/20'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? <Check size={14} /> : num}
                </div>
                <span className={`text-[10px] whitespace-nowrap transition-colors duration-150 ${
                  isActive ? 'text-gray-900 font-semibold' : isDone ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </button>
              {i < stepLabels.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mt-[-12px] transition-all duration-300 ${num < step ? 'bg-[#8CC63F]' : 'bg-gray-100'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* 자동저장 표시 */}
      <div className="flex justify-end mb-3 h-5">
        {autoSaved && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Loader2 size={11} className="animate-spin" />
            자동 저장됨
          </span>
        )}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">기본 정보</h2>

          {/* 캠페인 유형 선택 */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">캠페인 유형 *</label>
            <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden w-fit">
              {['기본캠페인', '공동구매'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setS1(p => ({ ...p, campaignType: type }))}
                  className={`px-5 py-2 text-sm font-medium transition-all duration-150 ${
                    s1.campaignType === type
                      ? 'bg-[#8CC63F] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 썸네일 이미지 업로드 */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">썸네일 이미지</label>
            <FileUpload
              hint="캠페인 대표 이미지를 업로드하세요 (권장: 1200x630px)"
              accept="image/*"
              multiple={false}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">캠페인명 *</label>
            <input
              type="text"
              value={s1.name}
              onChange={e => setS1(p => ({ ...p, name: e.target.value }))}
              placeholder="예) 봄 시즌 웰니스 캠페인"
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">캠페인 목적 *</label>
            <CustomSelect
              value={s1.goal}
              onChange={v => setS1(p => ({ ...p, goal: v as string }))}
              options={goalOptions}
              placeholder="선택하세요"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">채널 선택 (복수 가능)</label>
            <div className="flex gap-2 flex-wrap">
              {['인스타그램', '유튜브', '틱톡', '블로그'].map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`text-sm px-4 py-2 rounded-lg border transition-all duration-150 ${
                    s1.channels.includes(ch)
                      ? 'bg-[#8CC63F] text-white border-[#8CC63F]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StyledDateInput label="시작일" value={s1.startDate} onChange={v => setS1(p => ({ ...p, startDate: v }))} />
            <StyledDateInput label="종료일" value={s1.endDate} onChange={v => setS1(p => ({ ...p, endDate: v }))} />
            <StyledDateInput label="지원 마감" value={s1.applyDeadline} onChange={v => setS1(p => ({ ...p, applyDeadline: v }))} />
          </div>

          {/* 브랜드 해시태그 */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">브랜드 해시태그</label>
            <TagInput
              tags={s1.brandHashtags}
              onChange={tags => setS1(p => ({ ...p, brandHashtags: tags }))}
              placeholder="#브랜드태그 입력 후 Enter"
              addHash
              tagColor="blue"
            />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">예산 & 조건</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">총 예산 (원)</label>
            <input
              type="text"
              value={s2.budget}
              onChange={e => setS2(p => ({ ...p, budget: e.target.value }))}
              placeholder="예) 2,000,000"
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">단가 최소 (원)</label>
              <input
                type="text"
                value={s2.minUnit}
                onChange={e => setS2(p => ({ ...p, minUnit: e.target.value }))}
                placeholder="예) 50,000"
                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition-all duration-150"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">단가 최대 (원)</label>
              <input
                type="text"
                value={s2.maxUnit}
                onChange={e => setS2(p => ({ ...p, maxUnit: e.target.value }))}
                placeholder="예) 300,000"
                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition-all duration-150"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">모집 인원</label>
            <input
              type="number"
              value={s2.headcount}
              onChange={e => setS2(p => ({ ...p, headcount: e.target.value }))}
              placeholder="예) 10"
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition-all duration-150"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">제품 제공 방식</label>
            <div className="w-48">
              <CustomSelect
                value={s2.supply}
                onChange={v => setS2(p => ({ ...p, supply: v as string }))}
                options={supplyOptions}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">원고 가이드</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">필수 포함 내용</label>
            <textarea
              value={s3.required}
              onChange={e => setS3(p => ({ ...p, required: e.target.value }))}
              placeholder="반드시 언급해야 할 제품 특징, 메시지 등을 입력하세요."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">금지 표현</label>
            <TagInput
              tags={s3.prohibited}
              onChange={tags => setS3(p => ({ ...p, prohibited: tags }))}
              placeholder="입력 후 Enter"
              tagColor="red"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">필수 해시태그</label>
            <TagInput
              tags={s3.hashtags}
              onChange={tags => setS3(p => ({ ...p, hashtags: tags }))}
              placeholder="#태그 입력 후 Enter"
              addHash
              tagColor="blue"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">파일 첨부</label>
            <FileUpload hint="브랜드 가이드라인, 이미지 파일 등을 첨부하세요" />
          </div>

          {/* 콘텐츠 참고 */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">콘텐츠 참고</label>
            <textarea
              value={s3.contentRef}
              onChange={e => setS3(p => ({ ...p, contentRef: e.target.value }))}
              placeholder="참고할 콘텐츠 스타일, 레퍼런스 URL, 톤앤매너 등을 자유롭게 작성해주세요."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-150"
            />
          </div>

          {/* SNS 외 활용 범위 */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">SNS 외 활용 범위</label>
            <div className="flex gap-4">
              {['사용 가능', '사용 불가'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="snsExternalUse"
                    checked={s3.snsExternalUse === opt}
                    onChange={() => setS3(p => ({ ...p, snsExternalUse: opt }))}
                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">콘텐츠를 SNS 외 홈페이지, 광고 소재 등에 활용할 수 있는지 설정합니다.</p>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">인플루언서 선택</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{selected.size}명 선택됨</span>
          </div>
          <p className="text-xs text-gray-500">AI가 추천한 인플루언서 중 참여를 요청할 인원을 선택하세요.</p>
          <div className="space-y-3">
            {aiInfluencers.map(inf => (
              <div key={inf.id} className="relative">
                <InfluencerCard
                  influencer={inf}
                  selected={selected.has(inf.id)}
                  onToggle={() => {
                    setSelected(prev => {
                      const next = new Set(prev)
                      if (next.has(inf.id)) next.delete(inf.id)
                      else next.add(inf.id)
                      return next
                    })
                  }}
                />
                {selected.has(inf.id) && (
                  <div className="absolute inset-0 rounded-xl bg-[#8CC63F]/5 pointer-events-none flex items-center justify-center">
                    <div className="absolute top-3 right-3 w-6 h-6 bg-[#8CC63F] rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">검토 & 발행</h2>
          <p className="text-xs text-gray-500">아래 내용을 최종 확인 후 발행하세요.</p>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {[
              { label: '캠페인 유형', value: s1.campaignType },
              { label: '캠페인명', value: s1.name || '(미입력)' },
              { label: '목적', value: s1.goal || '(미입력)' },
              { label: '채널', value: s1.channels.join(', ') || '(미선택)' },
              { label: '기간', value: s1.startDate && s1.endDate ? `${s1.startDate} ~ ${s1.endDate}` : '(미입력)' },
              { label: '브랜드 해시태그', value: s1.brandHashtags.length > 0 ? s1.brandHashtags.join(', ') : '(미입력)' },
              { label: '총 예산', value: s2.budget ? `${s2.budget}원` : '(미입력)' },
              { label: '모집 인원', value: s2.headcount ? `${s2.headcount}명` : '(미입력)' },
              { label: '제품 제공', value: s2.supply },
              { label: 'SNS 외 활용', value: s3.snsExternalUse },
              { label: '선택 인플루언서', value: `${selected.size}명` },
            ].map((row, idx, arr) => (
              <div
                key={row.label}
                className={`flex gap-4 px-4 py-3 ${idx < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <span className="text-xs text-gray-500 w-28 shrink-0">{row.label}</span>
                <span className="text-sm text-gray-900 font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCompletedModal(true)}
            className="w-full bg-[#8CC63F] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#7AB535] transition-colors duration-150 mt-2"
          >
            캠페인 발행하기
          </button>
        </div>
      )}

      {/* 이전/다음 버튼 */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40"
        >
          이전
        </button>
        {step < TOTAL_STEPS && (
          <button
            onClick={handleNext}
            className="flex-1 bg-[#8CC63F] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#7AB535] transition-colors duration-150"
          >
            다음
          </button>
        )}
      </div>

      {/* 완료 모달 */}
      <Modal open={completedModal} onClose={() => setCompletedModal(false)} size="sm">
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-[#8CC63F] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-white" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">캠페인이 발행되었습니다!</h3>
          <p className="text-sm text-gray-500 mb-5">인플루언서들에게 제안이 전송됩니다.</p>
          <button
            onClick={() => {
              setCompletedModal(false)
              showToast('캠페인이 발행되었습니다.', 'success')
              navigate('/campaigns')
            }}
            className="w-full bg-[#8CC63F] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#7AB535] transition-colors duration-150"
          >
            캠페인 목록으로
          </button>
        </div>
      </Modal>
    </div>
  )
}
