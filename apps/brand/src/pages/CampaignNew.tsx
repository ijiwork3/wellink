import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Check, Loader2, XCircle, RefreshCw } from 'lucide-react'
import { InfluencerCard } from '@wellink/ui'
import { Modal } from '@wellink/ui'
import { CustomSelect } from '@wellink/ui'
import { TagInput } from '@wellink/ui'
import { FileUpload } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { useQAMode } from '../utils/useQAMode'

// NOTE: 인플루언서 mock 데이터 — 추후 src/data/influencers.ts로 통합 예정
const aiInfluencers = [
  { id: 1, name: '이창민', platform: '인스타그램', followers: 8700, engagement: 4.1, authentic: 92.3, category: ['피트니스', '크로스핏'] },
  { id: 4, name: '김가애', platform: '인스타그램', followers: 18900, engagement: 4.2, authentic: 88.7, category: ['요가'] },
  { id: 5, name: '박리나', platform: '인스타그램', followers: 7120, engagement: 2.23, authentic: 81.4, category: ['웰니스'] },
]

const goalOptions = [
  { label: '선택하세요', value: '' },
  { label: '브랜드 인지도 향상', value: '인지도' },
  { label: '구매 전환 유도', value: '전환' },
  { label: '팔로워 증가', value: '팔로워' },
  { label: '콘텐츠 제작', value: '콘텐츠' },
]

const TOTAL_STEPS = 5
const stepLabels = ['기본정보', '예산·조건', '원고가이드', '인플루언서', '검토발행']

const FILLED_S1 = { name: '봄 시즌 웰니스 캠페인', goal: '전환', channels: ['인스타그램'], startDate: '2026-05-01', endDate: '2026-05-31', applyDeadline: '2026-04-25', campaignType: '기본캠페인' as string, brandHashtags: ['#웰링크', '#건강한일상'] }
const FILLED_S2 = { budget: '2000000', minUnit: '50000', maxUnit: '300000', headcount: '10', supply: '배송' }

// 오늘 날짜 (min 속성용) — 컴포넌트 외부 상수로 한 번만 계산
const TODAY_STR = new Date().toISOString().split('T')[0]

// 천 단위 콤마 포맷
function formatNumber(v: string): string {
  const num = v.replace(/[^0-9]/g, '')
  if (!num) return ''
  return Number(num).toLocaleString('ko-KR')
}

// 콤마 제거 후 숫자만
function parseNumber(v: string): string {
  return v.replace(/[^0-9]/g, '')
}
const FILLED_S3 = { required: '제품의 건강 효능을 자연스럽게 언급해주세요. 실제 사용 경험 중심으로 제작하세요.', prohibited: ['#광고', '#협찬제품'], hashtags: ['#웰링크', '#웰니스챌린지'], contentRef: '밝고 자연스러운 라이프스타일 스타일', snsExternalUse: '사용 가능' as string }

// 날짜 입력 wrapper (styled)
function StyledDateInput({ label, value, min, max, onChange }: { label: string; value: string; min: string; max?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150 bg-white cursor-pointer"
        />
      </div>
    </div>
  )
}

export default function CampaignNew() {
  const navigate = useNavigate()
  const location = useLocation()
  const qa = useQAMode()
  const { showToast } = useToast()

  const isFilled = qa === 'filled' || qa === 'modal-complete'
  const initStep = () => {
    if (qa === 'step-2') return 2
    if (qa === 'step-3') return 3
    if (qa === 'step-4') return 4
    if (qa === 'filled' || qa === 'step-5' || qa === 'modal-complete') return 5
    return 1
  }

  // AIListup에서 전달된 인플루언서 ID 파싱
  const locationSelectedIds: number[] = (() => {
    const ids = (location.state as { selectedInfluencers?: (string | number)[] } | null)?.selectedInfluencers
    if (!ids || !Array.isArray(ids)) return []
    return ids.map(id => Number(id)).filter(id => !Number.isNaN(id))
  })()

  const [step, setStep] = useState(initStep)
  const [completedModal, setCompletedModal] = useState(qa === 'modal-complete')
  const [isPublishing, setIsPublishing] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)

  const [s1, setS1] = useState(isFilled ? FILLED_S1 : { name: '', goal: '', channels: [] as string[], startDate: '', endDate: '', applyDeadline: '', campaignType: '기본캠페인' as string, brandHashtags: [] as string[] })
  const [s2, setS2] = useState(isFilled ? FILLED_S2 : { budget: '', minUnit: '', maxUnit: '', headcount: '', supply: '배송' })
  const [s3, setS3] = useState(isFilled ? FILLED_S3 : { required: '', prohibited: [] as string[], hashtags: [] as string[], contentRef: '', snsExternalUse: '사용 불가' as string })
  const [selected, setSelected] = useState<Set<number>>(
    isFilled
      ? new Set([1, 4])
      : locationSelectedIds.length > 0
        ? new Set(locationSelectedIds)
        : new Set()
  )

  useEffect(() => {
    const s = qa === 'step-2' ? 2 : qa === 'step-3' ? 3 : qa === 'step-4' ? 4 : (qa === 'filled' || qa === 'step-5' || qa === 'modal-complete') ? 5 : 1
    setStep(s)
    setCompletedModal(qa === 'modal-complete')
    if (qa === 'filled' || qa === 'modal-complete' || qa === 'step-5') {
      setS1(FILLED_S1); setS2(FILLED_S2); setS3(FILLED_S3)
      setSelected(new Set([1, 4]))
    }
  }, [qa])

  // 이슈 2: 폼 이탈 경고 — step > 1이거나 입력값 있을 때 beforeunload 설정
  const isDirty = useCallback(() => {
    if (step > 1) return true
    if (s1.name.trim() || s1.goal || s1.channels.length > 0) return true
    if (s2.budget || s2.headcount) return true
    if (s3.required.trim() || s3.contentRef.trim()) return true
    return false
  }, [step, s1, s2, s3])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Step4 진입 시 AIListup에서 전달된 인플루언서 ID 반영
  useEffect(() => {
    if (step === 4 && locationSelectedIds.length > 0) {
      setSelected(prev => {
        const next = new Set(prev)
        locationSelectedIds.forEach(id => next.add(id))
        return next
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  if (qa === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
        <XCircle size={44} className="text-red-300" />
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">캠페인 등록 중 오류가 발생했습니다</p>
          <p className="text-xs text-gray-500 mt-1">잠시 후 다시 시도해 주세요.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={14} />다시 시도
        </button>
      </div>
    )
  }

  const triggerAutoSave = () => {
    setAutoSaved(true)
    setTimeout(() => setAutoSaved(false), 2000)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!s1.name.trim()) { showToast('캠페인명을 입력해 주세요.', 'error'); return }
      if (!s1.goal) { showToast('캠페인 목적을 선택하세요.', 'error'); return }
      if (s1.channels.length === 0) { showToast('채널을 최소 1개 선택하세요.', 'error'); return }
      if (!s1.startDate || !s1.endDate) { showToast('시작일과 종료일을 입력하세요.', 'error'); return }
      if (s1.endDate <= s1.startDate) { showToast('종료일은 시작일보다 이후여야 합니다.', 'error'); return }
      if (s1.startDate && s1.endDate) {
        const diffDays = (new Date(s1.endDate).getTime() - new Date(s1.startDate).getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays < 7) { showToast('캠페인 기간은 최소 7일 이상이어야 합니다.', 'error'); return }
        if (diffDays > 180) { showToast('캠페인 기간은 최대 180일까지 설정 가능합니다.', 'error'); return }
      }
      if (s1.applyDeadline && s1.startDate && s1.applyDeadline > s1.startDate) {
        showToast('지원 마감일은 시작일 이전이어야 합니다.', 'error'); return
      }
      if (s1.applyDeadline && s1.endDate && s1.applyDeadline > s1.endDate) {
        showToast('지원 마감일은 캠페인 종료일 이전이어야 합니다.', 'error'); return
      }
    }
    if (step === 2) {
      if (!s2.headcount || parseInt(s2.headcount) < 1) { showToast('모집 인원을 1명 이상 입력하세요.', 'error'); return }
      if (!s2.budget || s2.budget === '0' || parseInt(s2.budget.replace(/,/g, ''), 10) < 1) { showToast('캠페인 예산을 입력하세요.', 'error'); return }
      if (s2.minUnit && s2.maxUnit && parseInt(s2.minUnit, 10) > parseInt(s2.maxUnit, 10)) {
        showToast('최소 단가는 최대 단가보다 클 수 없습니다.', 'error'); return
      }
      if (s2.maxUnit && s2.headcount && s2.budget) {
        const totalUnit = parseInt(s2.maxUnit, 10) * parseInt(s2.headcount, 10)
        if (totalUnit > parseInt(s2.budget, 10)) {
          showToast('1인당 최대 단가 × 모집 인원이 총 예산을 초과합니다.', 'error'); return
        }
      }
    }
    if (step === 3) {
      if (!s3.required.trim()) { showToast('필수 포함 내용을 입력하세요.', 'error'); return }
    }
    if (step === 4) {
      if (selected.size === 0) { showToast('인플루언서를 최소 1명 선택하세요.', 'error'); return }
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">새 캠페인 등록</h1>
          <p className="text-sm text-gray-500 mt-0.5">5단계로 캠페인을 설정합니다.</p>
        </div>
        <button
          onClick={() => navigate('/campaigns')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1"
        >
          취소
        </button>
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
                  isActive
                    ? 'block text-gray-900 font-semibold'
                    : isDone
                    ? 'hidden @sm:block text-gray-600'
                    : 'hidden @sm:block text-gray-400'
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

      {/* Step 1 — wellwave 참고 순서: 제목 → 유형/채널 → 목적 → 기간 → 썸네일+해시태그 */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700">기본 정보</h2>

          {/* Row 1: 캠페인명 (가장 먼저) */}
          <div>
            <label htmlFor="s1-campaign-name" className="text-xs font-medium text-gray-600 block mb-1.5">캠페인명 *</label>
            <input
              id="s1-campaign-name"
              type="text"
              value={s1.name}
              onChange={e => setS1(p => ({ ...p, name: e.target.value }))}
              placeholder="예) 봄 시즌 웰니스 캠페인"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
            />
          </div>

          {/* Row 2: 캠페인 유형 + 채널 선택 */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">캠페인 유형 *</label>
              <div className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden">
                {['기본캠페인', '공동구매'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setS1(p => ({ ...p, campaignType: type }))}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all duration-150 ${
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
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">채널 선택 (복수 가능)</label>
              <div className="flex gap-2 flex-wrap">
                {['인스타그램', '유튜브', '틱톡', '블로그'].map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`text-sm px-3 py-1.5 rounded-xl border transition-all duration-150 ${
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
          </div>

          {/* Row 3: 캠페인 목적 */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">캠페인 목적 *</label>
            <CustomSelect
              value={s1.goal}
              onChange={v => setS1(p => ({ ...p, goal: v as string }))}
              options={goalOptions}
              placeholder="선택하세요"
            />
          </div>

          {/* Row 4: 날짜 3개 */}
          <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3 @sm:gap-4">
            <StyledDateInput label="시작일 *" value={s1.startDate} min={TODAY_STR} onChange={v => setS1(p => ({ ...p, startDate: v }))} />
            <StyledDateInput label="종료일 *" value={s1.endDate} min={s1.startDate || TODAY_STR} onChange={v => setS1(p => ({ ...p, endDate: v }))} />
            <StyledDateInput label="지원 마감" value={s1.applyDeadline} min={TODAY_STR} max={s1.startDate || undefined} onChange={v => setS1(p => ({ ...p, applyDeadline: v }))} />
          </div>

          {/* Row 5: 썸네일 + 해시태그 */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">썸네일 이미지</label>
              <FileUpload
                hint="캠페인 대표 이미지 (1200x630px 권장)"
                accept="image/*"
                multiple={false}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">브랜드 해시태그</label>
              <TagInput
                tags={s1.brandHashtags}
                onChange={tags => setS1(p => ({ ...p, brandHashtags: tags }))}
                placeholder="#브랜드태그 입력 후 Enter"
                addHash
                tagColor="brand"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — wellwave 참고 순서: 모집인원 → 제품제공방식 → 총예산 → 단가범위 */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700">예산·조건</h2>

          {/* Row 1: 모집 인원 + 제품 제공 방식 */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="s2-headcount" className="text-xs font-medium text-gray-600 block mb-1.5">모집 인원 *</label>
              <input
                id="s2-headcount"
                type="number"
                value={s2.headcount}
                onChange={e => setS2(p => ({ ...p, headcount: String(Math.floor(Number(e.target.value))) }))}
                placeholder="예) 10"
                min="1"
                max="9999"
                step="1"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">제품 제공 방식</label>
              <div className="flex gap-2">
                {['배송', '직접 방문', '제공 없음'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setS2(p => ({ ...p, supply: opt }))}
                    className={`flex-1 py-2.5 text-sm rounded-xl border transition-all duration-150 ${
                      s2.supply === opt
                        ? 'bg-[#8CC63F] text-white border-[#8CC63F]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: 총 예산 */}
          <div>
            <label htmlFor="s2-budget" className="text-xs font-medium text-gray-600 block mb-1.5">총 예산 (원) *</label>
            <input
              id="s2-budget"
              type="text"
              value={formatNumber(s2.budget)}
              onChange={e => {
                const raw = parseNumber(e.target.value)
                if (raw && Number(raw) > 999999999) return
                setS2(p => ({ ...p, budget: raw }))
              }}
              placeholder="예) 2,000,000"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
            />
          </div>

          {/* Row 3: 단가 범위 */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="s2-min-unit" className="text-xs font-medium text-gray-600 block mb-1.5">인플루언서 단가 최소 (원)</label>
              <input
                id="s2-min-unit"
                type="text"
                value={formatNumber(s2.minUnit)}
                onChange={e => setS2(p => ({ ...p, minUnit: parseNumber(e.target.value) }))}
                placeholder="예) 50,000"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
              />
            </div>
            <div>
              <label htmlFor="s2-max-unit" className="text-xs font-medium text-gray-600 block mb-1.5">인플루언서 단가 최대 (원)</label>
              <input
                id="s2-max-unit"
                type="text"
                value={formatNumber(s2.maxUnit)}
                onChange={e => setS2(p => ({ ...p, maxUnit: parseNumber(e.target.value) }))}
                placeholder="예) 300,000"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
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
            <label htmlFor="s3-required" className="text-xs font-medium text-gray-600 block mb-1.5">필수 포함 내용 *</label>
            <textarea
              id="s3-required"
              value={s3.required}
              onChange={e => setS3(p => ({ ...p, required: e.target.value }))}
              placeholder="반드시 언급해야 할 제품 특징, 메시지 등을 입력하세요."
              rows={4}
              maxLength={500}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
            />
            <div className="text-right text-xs text-gray-400 mt-0.5">{s3.required.length}/500</div>
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
              tagColor="brand"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">파일 첨부</label>
            <FileUpload hint="브랜드 가이드라인, 이미지 파일 등을 첨부하세요" />
          </div>

          {/* 콘텐츠 참고 */}
          <div>
            <label htmlFor="s3-content-ref" className="text-xs font-medium text-gray-600 block mb-1.5">콘텐츠 참고</label>
            <textarea
              id="s3-content-ref"
              value={s3.contentRef}
              onChange={e => setS3(p => ({ ...p, contentRef: e.target.value }))}
              placeholder="참고할 콘텐츠 스타일, 레퍼런스 URL, 톤앤매너 등을 자유롭게 작성해주세요."
              rows={4}
              maxLength={300}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
            />
            <div className="text-right text-xs text-gray-400 mt-0.5">{s3.contentRef.length}/300</div>
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
                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-[#8CC63F]/30"
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
          <h2 className="text-sm font-semibold text-gray-700">검토발행</h2>
          <p className="text-xs text-gray-500">아래 내용을 최종 확인 후 발행하세요.</p>

          {/* s1: 기본정보 */}
          <div className="rounded-xl border border-gray-100 overflow-hidden mb-3">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500">기본 정보</span>
            </div>
            {[
              { label: '캠페인 유형', value: s1.campaignType },
              { label: '캠페인명', value: s1.name || '(미입력)' },
              { label: '목적', value: s1.goal || '(미입력)' },
              { label: '채널', value: s1.channels.join(', ') || '(미선택)' },
              { label: '기간', value: s1.startDate && s1.endDate ? `${s1.startDate} ~ ${s1.endDate}` : '(미입력)' },
              { label: '지원 마감일', value: s1.applyDeadline || '미설정' },
              { label: '브랜드 해시태그', value: s1.brandHashtags.length > 0 ? s1.brandHashtags.join(', ') : '(미입력)' },
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

          {/* s2: 예산·조건 */}
          <div className="rounded-xl border border-gray-100 overflow-hidden mb-3">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500">예산·조건</span>
            </div>
            {[
              { label: '총 예산', value: s2.budget ? `${formatNumber(s2.budget)}원` : '(미입력)' },
              { label: '모집 인원', value: s2.headcount ? `${s2.headcount}명` : '(미입력)' },
              { label: '제품 제공', value: s2.supply },
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

          {/* s3: 원고 가이드 */}
          <div className="rounded-xl border border-gray-100 overflow-hidden mb-3">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500">원고 가이드</span>
            </div>
            {[
              { label: '필수 포함 내용', value: s3.required || '(미입력)' },
              { label: '금지 표현', value: s3.prohibited.length > 0 ? s3.prohibited.join(', ') : '(없음)' },
              { label: '필수 해시태그', value: s3.hashtags.length > 0 ? s3.hashtags.join(', ') : '(없음)' },
              { label: '콘텐츠 참고', value: s3.contentRef || '(미입력)' },
              { label: 'SNS 외 활용', value: s3.snsExternalUse },
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

          {/* 인플루언서 */}
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500">인플루언서</span>
            </div>
            <div className="flex gap-4 px-4 py-3">
              <span className="text-xs text-gray-500 w-28 shrink-0">선택 인플루언서</span>
              <span className="text-sm text-gray-900 font-medium">{selected.size}명</span>
            </div>
          </div>
        </div>
      )}

      {/* 이전/다음 버튼 — Step5에서는 "캠페인 발행하기"로 대체 */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40"
        >
          이전
        </button>
        {step < TOTAL_STEPS ? (
          <button
            onClick={handleNext}
            className="flex-1 bg-[#8CC63F] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors duration-150"
          >
            다음
          </button>
        ) : (
          <button
            onClick={() => { if (!isPublishing) { setIsPublishing(true); setCompletedModal(true) } }}
            disabled={isPublishing}
            className="flex-1 bg-[#8CC63F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7AB535] transition-colors duration-150 disabled:opacity-60"
          >
            캠페인 발행하기
          </button>
        )}
      </div>

      {/* 완료 모달 */}
      <Modal open={completedModal} onClose={() => { setCompletedModal(false); setIsPublishing(false) }} size="sm">
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-[#8CC63F] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-white" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">캠페인이 발행되었습니다!</h3>
          <p className="text-sm text-gray-500 mb-5">인플루언서들에게 제안이 전송됩니다.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setCompletedModal(false)
                showToast('캠페인이 발행되었습니다.', 'success')
                navigate('/influencers/manage')
              }}
              className="w-full bg-[#8CC63F] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#7AB535] transition-colors duration-150"
            >
              인플루언서 관리로 이동
            </button>
            <button
              onClick={() => {
                setCompletedModal(false)
                setIsPublishing(false)
                showToast('캠페인이 발행되었습니다.', 'success')
                navigate('/campaigns')
              }}
              className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors duration-150"
            >
              캠페인 목록으로
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
