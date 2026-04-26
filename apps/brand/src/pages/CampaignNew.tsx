import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, Plus, X, Trash2, GripVertical, CheckCircle, Calendar, Upload, Users, AlertCircle } from 'lucide-react'
import { AlertModal, useToast, useQAMode, TIMER_MS, CustomSelect } from '@wellink/ui'

const PLATFORMS = ['인스타그램', '유튜브', '네이버 블로그', '틱톡'] as const
type Platform = typeof PLATFORMS[number]

const POST_TYPE_MAP: Record<Platform, string[]> = {
  '인스타그램':    ['피드', '릴스', '스토리'],
  '유튜브':        ['영상', '쇼츠'],
  '네이버 블로그': [],
  '틱톡':          [],
}

const CATEGORIES = ['맛집/푸드', '뷰티/패션', '피트니스', '여행', '라이프스타일', '육아']
const PRECAUTIONS = ['릴스 제작 우대', '체험 후기 필수', '없음']
const PHOTO_COUNTS = ['3장 이상', '5장 이상', '7장 이상', '10장 이상']
const VIDEO_COUNTS = ['1개 이상 (15초+)', '1개 이상 (30초+)', '2개 이상', '없음']

const TODAY = new Date().toISOString().split('T')[0]

const FILLED = {
  type: '방문형' as '방문형' | '택배형',
  location: '강남/서초',
  storeName: '봄 요가 스튜디오',
  // 택배형 전용 — 원본 mentionName(브랜드명) + product(상품이름) 분리 보강
  brandName: '킹콩푸드',
  shippedProductName: '한우 프리미엄 선물세트',
  platform: '인스타그램' as Platform,
  category: '맛집/푸드',
  description: '브랜드 소개와 캠페인 핵심 메시지를 담아주세요.',
  productName: '4구 한우 프리미엄 선물세트 1.2kg',
  productDetail: '등심 300g + 안심 300g + 채끝 300g + 특수부위 300g',
  productPrice: '168000',
  rewardPoint: '0',
  keywords: ['#봄요가', '#강남요가'],
  postType: '피드',
  precaution: '릴스 제작 우대',
  photoCount: '5장 이상',
  videoCount: '1개 이상 (15초+)',
  guideText: '구체적인 촬영 가이드를 적어주세요.',
  link: 'https://store.example.com/1',
  recruitStart: '2026-04-25',
  recruitEnd: '2026-05-25',
  announceDate: '2026-05-30',
  uploadStart: '2026-04-25',
  uploadEnd: '2026-05-25',
  headcount: '20',
}

type Question = {
  id: string
  type: 'short' | 'long' | 'choice'  // 신규: 'long' (서술형) — 원본 'textarea' 동등
  title: string
  desc: string
  required: boolean
  options?: string[]
}

const fmtKRW = (v: string | number) => {
  const n = typeof v === 'string' ? Number(v.replace(/[^0-9]/g, '')) : v
  if (!n) return '0원'
  return n.toLocaleString('ko-KR') + '원'
}

export default function CampaignNew() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qa = useQAMode()
  const { showToast } = useToast()

  const editId = searchParams.get('edit')
  const isEdit = !!editId
  const isFilled = isEdit || qa === 'filled' || qa === 'modal-complete'
  const init = isFilled ? FILLED : {
    type: '방문형' as '방문형' | '택배형',
    location: '', storeName: '',
    brandName: '', shippedProductName: '',  // 택배형 전용 — 원본 보강
    platform: '인스타그램' as Platform, category: '맛집/푸드',
    description: '', productName: '', productDetail: '', productPrice: '', rewardPoint: '',
    keywords: [] as string[], postType: '피드', precaution: '릴스 제작 우대',
    photoCount: '5장 이상', videoCount: '1개 이상 (15초+)', guideText: '', link: '',
    recruitStart: '', recruitEnd: '', announceDate: '', uploadStart: '', uploadEnd: '',
    headcount: '',
  }

  const [form, setForm] = useState(init)
  const [keywordInput, setKeywordInput] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [completedModal, setCompletedModal] = useState(qa === 'modal-complete')
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }))

  const handlePlatformChange = (p: string) => {
    const platform = p as Platform
    const types = POST_TYPE_MAP[platform]
    setForm(prev => ({ ...prev, platform, postType: types[0] ?? '' }))
  }

  // 자동 캠페인 제목 — 방문형: [지역] 가게이름 / 택배형: 브랜드명 — 상품이름
  const autoTitle = form.type === '방문형'
    ? (form.location && form.storeName ? `[${form.location}] ${form.storeName}` : '')
    : (form.brandName && form.shippedProductName ? `${form.brandName} — ${form.shippedProductName}` : '')

  // 총 결제 예정 금액 — 원본 정책: 참여자 수 × 10,000원 (수수료·리워드 통합 단가)
  const PER_PERSON_FEE = 10000
  const totalPay = useMemo(() => (Number(form.headcount) || 0) * PER_PERSON_FEE, [form.headcount])

  // 편집 모드 — 캠페인 상태별 수정 가능 여부 (원본 정책 보강)
  // PENDING(대기중)만 수정 가능. ACTIVE/CLOSED는 수정 불가.
  const editStatusInfo = (() => {
    if (!isEdit) return null
    // 더미 환경 — qa=edit-active / qa=edit-closed 인 경우 잠금
    if (qa === 'edit-active') return { editable: false, status: '모집중', reason: '모집 중인 캠페인은 일정·인원 등 일부 항목을 변경할 수 없습니다.' }
    if (qa === 'edit-closed') return { editable: false, status: '종료', reason: '이미 종료된 캠페인은 수정할 수 없습니다.' }
    return { editable: true, status: '대기중', reason: '' }
  })()
  // 편집 모드 — 현재 지원자 수 (원본 보강)
  const currentApplicantCount = isEdit ? (qa === 'edit-active' ? 12 : qa === 'edit-closed' ? 0 : 3) : 0

  const addKeyword = () => {
    const v = keywordInput.trim().replace(/^#/, '')
    if (!v) return
    if (form.keywords.includes('#' + v)) return
    setForm(p => ({ ...p, keywords: [...p.keywords, '#' + v] }))
    setKeywordInput('')
  }
  const removeKeyword = (k: string) => setForm(p => ({ ...p, keywords: p.keywords.filter(x => x !== k) }))

  const addQuestion = (type: 'short' | 'long' | 'choice') => {
    setQuestions(q => [...q, {
      id: Math.random().toString(36).slice(2, 8),
      type, title: '', desc: '', required: false,
      options: type === 'choice' ? ['옵션 1'] : undefined,
    }])
  }
  const updateQ = (id: string, patch: Partial<Question>) => setQuestions(q => q.map(x => x.id === id ? { ...x, ...patch } : x))
  const removeQ = (id: string) => setQuestions(q => q.filter(x => x.id !== id))

  const handleSubmit = () => {
    // 편집 잠금 — 원본 정책 (PENDING 외엔 차단)
    if (isEdit && editStatusInfo && !editStatusInfo.editable) {
      showToast(editStatusInfo.reason, 'error')
      return
    }
    // 방문형: 지역+가게이름 / 택배형: 브랜드명+상품이름 (원본 분기)
    if (form.type === '방문형') {
      if (!form.location || !form.storeName) { showToast('지역과 가게 이름을 입력해주세요', 'error'); return }
    } else {
      if (!form.brandName || !form.shippedProductName) { showToast('브랜드명과 상품 이름을 입력해주세요', 'error'); return }
    }
    if (!form.productName || !form.productPrice) { showToast('제공 상품 정보를 입력해주세요', 'error'); return }
    if (!form.recruitStart || !form.recruitEnd) { showToast('모집 기간을 설정해주세요', 'error'); return }
    // 모집 인원 — 신규 등록 시 최소 5명 (원본 정책)
    const hc = Number(form.headcount) || 0
    if (!isEdit && hc < 5) { showToast('모집 인원은 최소 5명부터 가능합니다.', 'error'); return }
    if (hc < 1) { showToast('모집 인원을 입력해주세요.', 'error'); return }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setCompletedModal(true)
    }, TIMER_MS.FORM_SUBMIT)
  }

  return (
    <div className="space-y-5 pb-24">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        뒤로 가기
      </button>

      {/* 페이지 타이틀 */}
      <div>
        <h1 className="text-xl @md:text-2xl font-bold text-gray-900">{isEdit ? '캠페인 정보 변경' : '새 캠페인 등록'}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? `내용을 수정하면 ${currentApplicantCount > 0 ? `현재 ${currentApplicantCount}명의 지원자에게 [조건 변경 알림]이 발송됩니다.` : '모든 지원자에게 [조건 변경 알림]이 발송됩니다.'}`
            : '인플루언서들에게 매력적으로 보일 수 있는 캠페인을 만들어보세요.'}
        </p>
      </div>

      {/* 편집 모드 잠금 배너 — 원본 정책 보강 (PENDING만 수정 가능) */}
      {isEdit && editStatusInfo && !editStatusInfo.editable && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">현재 캠페인 상태: {editStatusInfo.status}</p>
            <p className="text-xs text-amber-700 mt-0.5">{editStatusInfo.reason}</p>
          </div>
        </div>
      )}

      {/* ── 섹션 1: 기본 정보 입력 ── */}
      <Section title="기본 정보 입력">
        {/* 캠페인 유형 토글 */}
        <Field label="캠페인 유형">
          <div className="grid grid-cols-2 gap-2">
            {(['방문형', '택배형'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                  form.type === t
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        {/* 방문형: 지역+가게이름 / 택배형: 브랜드명+상품이름 (원본 정책 보강) */}
        {form.type === '방문형' ? (
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
            <Field label="지역">
              <Input value={form.location} onChange={v => set('location', v)} placeholder="예) 강남/서초" />
            </Field>
            <Field label="가게 이름">
              <Input value={form.storeName} onChange={v => set('storeName', v)} placeholder="예) 킹콩정육점" />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
            <Field label="브랜드명">
              <Input value={form.brandName} onChange={v => set('brandName', v)} placeholder="예) 킹콩푸드" />
            </Field>
            <Field label="상품 이름">
              <Input value={form.shippedProductName} onChange={v => set('shippedProductName', v)} placeholder="예) 한우 프리미엄 선물세트" />
            </Field>
          </div>
        )}

        <Field label="캠페인 제목 (자동 생성)">
          <input
            value={autoTitle}
            disabled
            placeholder="위 정보를 입력하면 제목이 자동 생성됩니다"
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700"
          />
        </Field>

        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
          <Field label="진행 플랫폼">
            <Select value={form.platform} onChange={handlePlatformChange} options={[...PLATFORMS]} />
          </Field>
          <Field label="카테고리">
            <Select value={form.category} onChange={v => set('category', v)} options={CATEGORIES} />
          </Field>
        </div>

        <Field label="대표 이미지">
          <div className="border border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center justify-center bg-gray-50/30 cursor-pointer hover:bg-gray-50 transition-colors">
            <ImageIcon size={28} className="text-gray-300 mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-500">이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-xs text-gray-400 mt-0.5">권장 사이즈: 1200 × 800px (JPG, PNG)</p>
          </div>
        </Field>

        <Field label="캠페인 설명">
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={6}
            placeholder="캠페인 소개 / 제공 내역 / 참여 방법을 작성해주세요."
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
          />
        </Field>
      </Section>

      {/* ── 섹션 2: 제공 내역 및 리워드 ── */}
      <Section title="제공 내역 및 리워드">
        <Field label="제공 상품명">
          <Input value={form.productName} onChange={v => set('productName', v)} placeholder="예) 4구 한우 프리미엄 선물세트 1.2kg" />
        </Field>

        <Field label="제공 내역 상세">
          <textarea
            value={form.productDetail}
            onChange={e => set('productDetail', e.target.value)}
            rows={3}
            placeholder="제공되는 상품의 구성이나 특징을 자세히 적어주세요."
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
          />
        </Field>

        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
          <Field label="상품 가격 (소비자가)">
            <div className="relative">
              <Input
                value={form.productPrice ? Number(form.productPrice).toLocaleString('ko-KR') : ''}
                onChange={v => set('productPrice', v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="text-right pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">원</span>
            </div>
          </Field>
          <Field label="추가 리워드 (포인트)">
            <div className="relative">
              <Input
                value={form.rewardPoint ? Number(form.rewardPoint).toLocaleString('ko-KR') : ''}
                onChange={v => set('rewardPoint', v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="text-right pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">P</span>
            </div>
          </Field>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-700">
          <p className="font-semibold mb-0.5">배송형 캠페인 안내</p>
          <p className="text-blue-600">상품 배송이 필요한 경우, 신청한 인플루언서의 배송지 정보를 엑셀로 다운로드할 수 있습니다.</p>
        </div>
      </Section>

      {/* ── 섹션 3: 미션 및 키워드 ── */}
      <Section title="미션 및 키워드">
        <Field label="필수 키워드">
          <div className="flex gap-2">
            <input
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              placeholder="예) 킹콩정육점, 수원한우선물세트 (엔터로 추가)"
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button
              onClick={addKeyword}
              className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-800 transition-colors"
            >추가</button>
          </div>
          {form.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.keywords.map(k => (
                <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                  {k}
                  <button type="button" onClick={() => removeKeyword(k)} aria-label="삭제"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="미션 가이드">
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 mb-3">
            {POST_TYPE_MAP[form.platform as Platform]?.length > 0 && (
            <SubField label="게시 유형">
              <Select value={form.postType} onChange={v => set('postType', v)} options={POST_TYPE_MAP[form.platform as Platform]} />
            </SubField>
            )}
            <SubField label="유의사항">
              <Select value={form.precaution} onChange={v => set('precaution', v)} options={PRECAUTIONS} />
            </SubField>
            <SubField label="사진 첨부">
              <Select value={form.photoCount} onChange={v => set('photoCount', v)} options={PHOTO_COUNTS} />
            </SubField>
            <SubField label="동영상 첨부">
              <Select value={form.videoCount} onChange={v => set('videoCount', v)} options={VIDEO_COUNTS} />
            </SubField>
          </div>
          <textarea
            value={form.guideText}
            onChange={e => set('guideText', e.target.value)}
            rows={5}
            placeholder={'구체적인 촬영 가이드나 강조하고 싶은 포인트를 적어주세요.\n\n예시) 1. 고기 굽는 소리가 들리게 영상 촬영\n      2. 보지기 포장 상태 언박싱 컷 필수'}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </Field>

        <Field label="링크 삽입">
          <Input value={form.link} onChange={v => set('link', v)} placeholder="스마트스토어 또는 플레이스 링크 입력" />
        </Field>

        <Field label="신청 정보 질문 설정" hint="인플루언서가 캠페인 신청 시 답변해야 할 질문을 설정합니다.">
          <div className="flex gap-2 mb-2 flex-wrap">
            <button onClick={() => addQuestion('short')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs">
              <Plus size={12} />단답형 추가
            </button>
            <button onClick={() => addQuestion('long')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs">
              <Plus size={12} />서술형 추가
            </button>
            <button onClick={() => addQuestion('choice')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs">
              <Plus size={12} />객관식 추가
            </button>
          </div>
          {questions.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl py-8 text-center text-xs text-gray-400">
              추가된 질문이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-gray-300" />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      질문 {i + 1} ({q.type === 'short' ? '단답형' : q.type === 'long' ? '서술형' : '객관식'})
                    </span>
                    <label className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                      <input type="checkbox" checked={q.required} onChange={e => updateQ(q.id, { required: e.target.checked })} />
                      필수 답변
                    </label>
                    <button onClick={() => removeQ(q.id)} aria-label="삭제" className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                  <Input value={q.title} onChange={v => updateQ(q.id, { title: v })} placeholder="질문 제목" />
                  <Input value={q.desc} onChange={v => updateQ(q.id, { desc: v })} placeholder="질문 설명 (선택)" />
                  {q.type === 'choice' && (
                    <div className="space-y-1.5 pl-2">
                      {(q.options ?? []).map((opt, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <input type="checkbox" disabled />
                          <Input
                            value={opt}
                            onChange={v => updateQ(q.id, { options: q.options!.map((o, k) => k === j ? v : o) })}
                            placeholder={`옵션 ${j + 1}`}
                          />
                          <button
                            onClick={() => updateQ(q.id, { options: q.options!.filter((_, k) => k !== j) })}
                            aria-label="옵션 삭제"
                            className="text-gray-300 hover:text-red-500"
                          ><X size={13} /></button>
                        </div>
                      ))}
                      <button
                        onClick={() => updateQ(q.id, { options: [...(q.options ?? []), `옵션 ${(q.options?.length ?? 0) + 1}`] })}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >+ 옵션 추가하기</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Field>
      </Section>

      {/* ── 섹션 4: 일정 및 모집 인원 ── */}
      <Section title="일정 및 모집 인원">
        <Field label={<span className="flex items-center gap-1"><Calendar size={13} /> 모집 일정</span>}>
          <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3">
            <SubField label="모집 기간">
              <div className="flex items-center gap-1.5">
                <DateInput value={form.recruitStart} min={TODAY} onChange={v => set('recruitStart', v)} />
                <span className="text-gray-400 text-xs">~</span>
                <DateInput value={form.recruitEnd} min={form.recruitStart || TODAY} onChange={v => set('recruitEnd', v)} />
              </div>
            </SubField>
            <SubField label="인플루언서 발표일">
              <DateInput value={form.announceDate} min={form.recruitEnd || TODAY} onChange={v => set('announceDate', v)} />
            </SubField>
          </div>
        </Field>

        <Field label={<span className="flex items-center gap-1"><Upload size={13} /> 콘텐츠 등록 일정</span>}>
          <SubField label="등록 기간">
            <div className="flex items-center gap-1.5 max-w-md">
              <DateInput value={form.uploadStart} min={form.announceDate || TODAY} onChange={v => set('uploadStart', v)} />
              <span className="text-gray-400 text-xs">~</span>
              <DateInput value={form.uploadEnd} min={form.uploadStart || TODAY} onChange={v => set('uploadEnd', v)} />
            </div>
          </SubField>
        </Field>

        <Field label={<span className="flex items-center gap-1"><Users size={13} /> 모집 인원</span>}>
          <div className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">총 모집 인원</p>
              <p className="text-xs text-gray-500">
                {isEdit
                  ? `현재 ${currentApplicantCount.toLocaleString()}명의 지원자가 있습니다.`
                  : '최소 5명 이상부터 진행 가능합니다.'}
              </p>
            </div>
            <div className="relative">
              <input
                type="number"
                min={isEdit ? '1' : '5'}
                placeholder="20"
                value={form.headcount}
                onChange={e => set('headcount', e.target.value)}
                className="w-24 text-sm text-right border border-gray-200 rounded-lg pr-7 pl-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">명</span>
            </div>
          </div>
        </Field>
      </Section>

      {/* 총 결제 예정 금액 */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-800">총 결제 예정 금액</span>
        <div className="text-right">
          <p className="text-lg @md:text-xl font-bold text-blue-700">{fmtKRW(totalPay)}</p>
          <p className="text-[10px] text-blue-500">기본 수수료 및 리워드가 포함된 금액입니다 (VAT 별도)</p>
        </div>
      </div>

      {/* 액션 */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => navigate('/campaigns')}
          className="px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >취소하기</button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isEdit ? '변경사항 저장' : '캠페인 등록하기'}
          <CheckCircle size={14} />
        </button>
      </div>

      {/* 완료 모달 */}
      <AlertModal
        open={completedModal}
        onClose={() => { setCompletedModal(false); navigate('/campaigns') }}
        title="캠페인이 등록되었습니다"
        confirmLabel="캠페인 목록으로"
        size="sm"
        onConfirm={() => { setCompletedModal(false); navigate('/campaigns') }}
        showCancel={false}
        variant="confirm"
      >
        <div className="text-center py-1">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm text-gray-700">{autoTitle || '새 캠페인'}이(가) 모집을 시작합니다.</p>
        </div>
      </AlertModal>
    </div>
  )
}

/* ────────── 헬퍼 컴포넌트 ────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 @md:p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, hint, children }: { label: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-800 block mb-2">{label}</label>
      {hint && <p className="text-xs text-gray-500 -mt-1 mb-2">{hint}</p>}
      {children}
    </div>
  )
}

function SubField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-colors ${className}`}
    />
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options.map(o => ({ label: o, value: o }))}
    />
  )
}

function DateInput({ value, min, onChange }: { value: string; min?: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      min={min}
      onChange={e => onChange(e.target.value)}
      className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
    />
  )
}
