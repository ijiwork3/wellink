import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Markdown from 'react-markdown'
import { CheckCircle2, MapPin, Package, Footprints, User, AtSign, Pencil, Gift, BookOpen, ExternalLink, HelpCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { mockCampaigns, mockAppliedData } from '../services/mock/campaigns'
import { mockProfile } from '../services/mock/profile'
import { useToast, ErrorState, TIMER_MS, Tooltip, useQAMode, Skeleton } from '@wellink/ui'
import { formatPhone } from '../utils/format'
import { useApplications, useInstagramState } from '../services/userState'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'
import { TERMS_URL } from '../config/urls'


export default function CampaignApply() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const qa = useQAMode()
  const applications = useApplications()
  const ig = useInstagramState()
  const campaign = mockCampaigns.find(c => c.id === Number(id))
  // 유가시딩(activityFee > 0) + 일반 계정 → 신청 불가
  const needsProfessional = (campaign?.activityFee ?? 0) > 0 && !ig.professional
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current)
  }, [])

  const mode = searchParams.get('mode')
  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'
  const hasPrefill = isViewMode || isEditMode
  const appliedData = mockAppliedData[id ?? '']

  // A: 원본 CampaignApplyForm.tsx L468-473 — 연락처는 항상 프로필에서 가져오며 disabled (변경 불가)
  // 실제 구현: influencerProfile.contact 필드 사용
  const [phone] = useState(appliedData?.phone ?? mockProfile.phone)
  const [agreed1, setAgreed1] = useState(hasPrefill)
  const [agreed2, setAgreed2] = useState(hasPrefill)
  const [answers, setAnswers] = useState<Record<string, string>>(hasPrefill ? (appliedData?.answers ?? {}) : {})
  const [deliveryName, setDeliveryName] = useState(hasPrefill ? (appliedData?.deliveryName ?? '') : '')
  const [deliveryPhone, setDeliveryPhone] = useState(hasPrefill ? (appliedData?.deliveryPhone ?? '') : '')
  const [deliveryZip, setDeliveryZip] = useState(hasPrefill ? (appliedData?.deliveryZip ?? '') : '')
  const [deliveryAddr, setDeliveryAddr] = useState(hasPrefill ? (appliedData?.deliveryAddr ?? '') : '')
  const [deliveryAddrDetail, setDeliveryAddrDetail] = useState(hasPrefill ? (appliedData?.deliveryAddrDetail ?? '') : '')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [addrSearchOpen, setAddrSearchOpen] = useState(false)
  const [addrQuery, setAddrQuery] = useState('')

  // 사용자가 input 수정하면 해당 필드 에러 해소 (cold-review 7차 H6)
  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  if (qa === 'loading') {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 신청" onBack={() => navigate(-1)} pageWidth="max-w-lg">
        <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-6">
          {/* 캠페인 요약 카드 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-gray-50">
              <Skeleton shape="rect" className="w-14 h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton shape="text" className="h-3 w-1/3" />
                <Skeleton shape="text" className="h-4 w-3/4" />
                <Skeleton shape="text" className="h-3 w-1/4" />
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
              <Skeleton shape="text" className="h-3 w-1/5" />
              <Skeleton shape="text" className="h-3 w-full" />
              <Skeleton shape="text" className="h-3 w-2/3" />
            </div>
          </div>
          {/* 신청자 정보 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            <Skeleton shape="text" className="h-4 w-1/4 mb-1" />
            <div className="flex items-center gap-2.5">
              <Skeleton shape="circle" className="w-3.5 h-3.5" />
              <Skeleton shape="text" className="h-3 w-2/5" />
            </div>
            <div className="flex items-center gap-2.5">
              <Skeleton shape="circle" className="w-3.5 h-3.5" />
              <Skeleton shape="text" className="h-3 w-3/5" />
            </div>
          </div>
          {/* 연락처 섹션 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <Skeleton shape="text" className="h-4 w-1/4" />
            <Skeleton shape="text" className="h-10 w-full rounded-xl" />
          </div>
          {/* 배송 정보 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <Skeleton shape="text" className="h-4 w-1/3" />
            <Skeleton shape="text" className="h-10 w-full rounded-xl" />
            <Skeleton shape="text" className="h-10 w-full rounded-xl" />
            <div className="flex gap-2">
              <Skeleton shape="text" className="h-10 flex-1 rounded-xl" />
              <Skeleton shape="text" className="h-10 w-20 rounded-xl" />
            </div>
            <Skeleton shape="text" className="h-10 w-full rounded-xl" />
            <Skeleton shape="text" className="h-10 w-full rounded-xl" />
          </div>
          {/* 추가 질문 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <Skeleton shape="text" className="h-4 w-1/2" />
            <Skeleton shape="text" className="h-20 w-full rounded-xl" />
          </div>
          {/* 약관 동의 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Skeleton shape="circle" className="w-4 h-4" />
              <Skeleton shape="text" className="h-3 flex-1" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Skeleton shape="circle" className="w-4 h-4" />
              <Skeleton shape="text" className="h-3 flex-1" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Skeleton shape="text" className="h-3 w-1/3" />
              <Skeleton shape="text" className="h-3 w-1/5" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 신청" onBack={() => navigate(-1)} pageWidth="max-w-lg">
        <ErrorState
          message="신청 정보를 불러올 수 없어요"
          subMessage="잠시 후 다시 시도해 주세요"
          onRetry={() => window.location.reload()}
        />
      </Layout>
    )
  }

  if (!campaign) {
    return (
      <Layout showSidebar={false} pageTitle="캠페인 신청" onBack={() => navigate(-1)} pageWidth="max-w-lg">
        <ErrorState
          message="캠페인을 찾을 수 없어요"
          subMessage="이미 삭제됐거나 잘못된 링크일 수 있어요"
          retryLabel="캠페인 탐색으로 이동"
          showRetryIcon={false}
          onRetry={() => navigate('/campaigns/browse')}
        />
      </Layout>
    )
  }

  const isDelivery = campaign.type === 'delivery'

  const validate = () => {
    const e: Record<string, boolean> = {}
    // 연락처는 프로필에서 자동 입력 (disabled) — 별도 검증 없음 (원본 CampaignApplyForm.tsx L468)
    const phoneRe = /^01[0-9]-?\d{3,4}-?\d{4}$/
    if (!agreed1) e.agreed1 = true
    if (!agreed2) e.agreed2 = true
    if (isDelivery) {
      if (!deliveryName.trim() || deliveryName.trim().length < 2) e.deliveryName = true
      if (!deliveryPhone || !phoneRe.test(deliveryPhone)) e.deliveryPhone = true
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
      showToast('필수 항목을 모두 입력해 주세요', 'error')
      return
    }
    setIsSubmitting(true)
    // mock: 즉시 완료 처리 (실제 API 연동 시 async 교체)
    submitTimerRef.current = setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      // 신청 완료를 글로벌 store에 기록 — Detail 페이지의 "신청완료" 배지에 반영 (cold-review A3)
      if (campaign) applications.add(campaign.id)
    }, TIMER_MS.FORM_SUBMIT)
  }

  if (submitted) {
    return (
      <Layout showSidebar={false} pageTitle={isEditMode ? '신청 정보 수정' : '캠페인 신청'} onBack={() => navigate(-1)} pageWidth="max-w-lg">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-6">
          <div className="w-20 h-20 rounded-full bg-brand-green-bg flex items-center justify-center">
            <CheckCircle2 size={40} className="text-brand-green" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{isEditMode ? '수정 완료!' : '신청 완료!'}</p>
            <p className="text-sm text-gray-500 mt-1">{isEditMode ? '변경 사항을 반영했어요' : '브랜드 검토 후 결과를 알려드릴게요'}</p>
          </div>
          {isEditMode ? (
            <button
              onClick={() => navigate(`/campaigns/${id}/apply?mode=view`)}
              className="w-full max-w-sm py-3 rounded-xl text-sm font-semibold text-white bg-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              신청 정보 보기
            </button>
          ) : (
            <button
              onClick={() => navigate('/campaigns/my')}
              className="w-full max-w-sm py-3 rounded-xl text-sm font-semibold text-white bg-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              내 캠페인 확인
            </button>
          )}
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="w-full max-w-sm py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            계속 둘러보기
          </button>
        </div>
      </Layout>
    )
  }

  const pageTitle = isViewMode ? '신청 정보 확인' : isEditMode ? '신청 정보 수정' : `${campaign.name} 신청`

  return (
    <Layout showSidebar={false} pageTitle={pageTitle} onBack={() => navigate(-1)} pageWidth="max-w-lg">
      {/* 하단 fixed CTA — safe-area 포함 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-lg mx-auto">
          {isViewMode ? (
            <button
              onClick={() => navigate('/campaigns/my')}
              className="w-full py-3.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              돌아가기
            </button>
          ) : needsProfessional ? (
            <div className="space-y-2">
              <p className="text-xs text-center text-amber-700 font-medium break-keep">
                활동비 지급 캠페인은 프로페셔널 계정이 필요해요
              </p>
              <button
                type="button"
                onClick={() => navigate('/media')}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
              >
                인스타 관리에서 계정 연동하기
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              {isSubmitting ? '제출 중...' : isEditMode ? '수정 완료' : '신청하기'}
            </button>
          )}
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-6">
        <h1 className="sr-only">{pageTitle}</h1>

        {/* view 모드 배너 + 선정 상태 배지 — 원본 CampaignApplyForm.tsx L798-817 */}
        {isViewMode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-brand-green-bg border border-brand-green-border">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={16} className="text-brand-green flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-brand-green-text truncate">신청 완료된 정보예요</span>
              </div>
              <button
                onClick={() => navigate(`/campaigns/${id}/apply?mode=edit`)}
                className="shrink-0 flex items-center gap-1 text-sm text-brand-green-text font-medium border border-brand-green-border rounded-lg px-2.5 py-1 hover:bg-brand-green-bg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <Pencil size={14} aria-hidden="true" />수정하기
              </button>
            </div>
            {appliedData?.selectionStatus && (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-sm text-gray-500">선정 상태</span>
                <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                  appliedData.selectionStatus === 'selected'
                    ? 'bg-brand-green-bg text-brand-green-text'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {appliedData.selectionStatus === 'selected' ? '선정' : '검토 중'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 바로가기 링크 — 원본 CampaignApplyForm.tsx L417-437: campaign.link 존재 시 노출 */}
        {campaign.link && (
          <div className="rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-500 mb-2">바로가기 링크</p>
            <a
              href={campaign.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-green-text hover:underline flex items-center gap-1 break-all"
            >
              {campaign.link}
              <ExternalLink size={13} className="shrink-0" aria-hidden="true" />
            </a>
          </div>
        )}

        {/* 캠페인 요약 — 원본 CampaignApplyForm.tsx:439-459: 썸네일 + 제품 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 썸네일 + 기본 정보 */}
          <div className="flex items-center gap-3 p-4 bg-gray-50">
            <div className="w-14 h-14 rounded-xl shrink-0 bg-gray-100 overflow-hidden">
              <img
                src={getThumbnailFromPool(campaign.id)}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(campaign.id, campaign.brand) }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 truncate">{campaign.brand}</p>
              <p className="text-sm font-semibold text-gray-900 line-clamp-2 break-keep">{campaign.name}</p>
              <div className="flex items-center gap-x-2 gap-y-0.5 mt-1 flex-wrap">
                {isDelivery
                  ? <span className="flex items-center gap-1 text-xs text-brand-green-text whitespace-nowrap"><Package size={12} />배송형</span>
                  : <span className="flex items-center gap-1 text-xs text-blue-700 whitespace-nowrap"><Footprints size={12} />방문형</span>
                }
                {campaign.reward && <span className="text-xs text-gray-500 break-keep">· {campaign.reward}</span>}
              </div>
            </div>
          </div>

          {/* 제공 내역 — 원본 CampaignApplyForm.tsx:444-450 */}
          {campaign.productDetail && (
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                <Gift size={11} className="text-brand-green" aria-hidden="true" />제공 내역
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line break-keep leading-relaxed">{campaign.productDetail}</p>
            </div>
          )}

          {/* 필수 가이드 — 원본 CampaignApplyForm.tsx L450-457: ToastEditorViewer로 마크다운 렌더링 */}
          {campaign.detailMissionDescription && (
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                <BookOpen size={11} className="text-brand-green" aria-hidden="true" />필수 가이드
              </p>
              <div className="text-sm text-gray-700 break-keep leading-relaxed prose prose-sm max-w-none prose-p:my-0.5 prose-li:my-0 prose-ul:my-0.5">
                <Markdown>{campaign.detailMissionDescription}</Markdown>
              </div>
            </div>
          )}
        </div>


        {/* 신청자 정보 (읽기 전용) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 @[640px]:p-5 space-y-2.5">
          <p className="text-sm font-semibold text-gray-500 mb-1">신청자 정보</p>
          <div className="flex items-center gap-2.5 min-w-0">
            <User size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-900 truncate">{mockProfile.name}</span>
          </div>
          {/* SNS 연결 정보 — 원본 CampaignApplyForm.tsx L479-518: 선정 후 변경 불가 안내 + HelpCircle tooltip */}
          {mockProfile.instagramConnected && (
            <div className="flex items-start gap-2.5 min-w-0">
              <AtSign size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-900 truncate">@{mockProfile.instagram}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">인스타그램</span>
                  {/* 원본 CampaignApplyForm.tsx L490-505: HelpCircle 툴팁 "마이페이지에서만 수정 가능" */}
                  <Tooltip content="등록한 SNS는 마이페이지 내에서만 수정이 가능합니다">
                    <button type="button" aria-label="SNS 수정 안내" className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                      <HelpCircle size={11} className="text-gray-500" aria-hidden="true" />
                    </button>
                  </Tooltip>
                </div>
                {!isViewMode && (
                  <p className="text-xs text-gray-400 mt-0.5 break-keep">등록한 SNS는 선정 후 변경할 수 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 연락처 — 원본 CampaignApplyForm.tsx L467-474: 항상 disabled, 프로필에서 자동 입력 */}
        <Section title="연락처" required={false}>
          <input
            type="tel"
            disabled
            value={phone || '마이페이지에서 등록해 주세요.'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
            aria-label="연락처 (마이페이지에서 변경)"
          />
          {!phone && (
            <p className="text-xs text-gray-400 mt-1">연락처는 마이페이지 &gt; 내 정보에서 변경할 수 있어요.</p>
          )}
        </Section>

        {/* 배송 정보 (배송형만) */}
        {isDelivery && (
          <Section title="배송 정보" required={!isViewMode} icon={<MapPin size={14} className="text-brand-green" />}>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">수령인 이름{!isViewMode && <span className="text-red-500"> *</span>}</label>
                {isViewMode ? (
                  <ViewField value={deliveryName} />
                ) : (
                  <>
                    <input
                      type="text"
                      value={deliveryName}
                      onChange={e => { setDeliveryName(e.target.value); clearError('deliveryName') }}
                      placeholder="배송받는 분의 이름"
                      autoComplete="name"
                      maxLength={20}
                      className={fieldCls(errors.deliveryName)}
                      aria-invalid={!!errors.deliveryName}
                      aria-describedby={errors.deliveryName ? 'apply-error-delivery-name' : undefined}
                    />
                    {errors.deliveryName && <p id="apply-error-delivery-name" role="alert" aria-live="polite" className="text-xs text-red-500 mt-1">수령인 이름을 입력해 주세요</p>}
                  </>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">연락처{!isViewMode && <span className="text-red-500"> *</span>}</label>
                {isViewMode ? (
                  <ViewField value={deliveryPhone} />
                ) : (
                  <>
                    <input
                      type="tel"
                      value={deliveryPhone}
                      onChange={e => { setDeliveryPhone(formatPhone(e.target.value)); clearError('deliveryPhone') }}
                      placeholder="010-0000-0000"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={13}
                      className={fieldCls(errors.deliveryPhone)}
                      aria-invalid={!!errors.deliveryPhone}
                      aria-describedby={errors.deliveryPhone ? 'apply-error-delivery-phone' : undefined}
                    />
                    {errors.deliveryPhone && <p id="apply-error-delivery-phone" role="alert" aria-live="polite" className="text-xs text-red-500 mt-1">올바른 연락처를 입력해 주세요</p>}
                  </>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">주소{!isViewMode && <span className="text-red-500"> *</span>}</label>
                {isViewMode ? (
                  <ViewField value={`(${deliveryZip}) ${deliveryAddr}${deliveryAddrDetail ? ' ' + deliveryAddrDetail : ''}`} />
                ) : (
                  <>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={deliveryZip}
                        readOnly
                        placeholder="우편번호"
                        autoComplete="postal-code"
                        inputMode="numeric"
                        aria-label="우편번호"
                        className={`${fieldCls(false)} flex-1 tabular-nums`}
                      />
                      <button
                        onClick={() => { setAddrQuery(''); setAddrSearchOpen(true) }}
                        className="shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                      >
                        주소 검색
                      </button>
                    </div>
                    <input
                      type="text"
                      value={deliveryAddr}
                      readOnly
                      placeholder="기본 주소"
                      autoComplete="street-address"
                      aria-label="기본 주소"
                      className={`${fieldCls(errors.deliveryAddr)} mb-2`}
                      aria-invalid={!!errors.deliveryAddr}
                      aria-describedby={errors.deliveryAddr ? 'apply-error-addr' : undefined}
                    />
                    <input
                      type="text"
                      value={deliveryAddrDetail}
                      onChange={e => setDeliveryAddrDetail(e.target.value)}
                      placeholder="상세 주소 (예: 101동 202호)"
                      autoComplete="address-line2"
                      aria-label="상세 주소"
                      maxLength={50}
                      className={fieldCls(false)}
                    />
                    {errors.deliveryAddr && <p id="apply-error-addr" role="alert" aria-live="polite" className="text-xs text-red-500 mt-1">주소를 입력해 주세요</p>}
                  </>
                )}
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
                  <label className="text-sm font-medium text-gray-900 block mb-1">
                    {q.question}
                    {q.required && !isViewMode && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {/* 질문 서브 설명 — 원본 CampaignApplyForm.tsx L551-552 */}
                  {q.description?.trim() && (
                    <p className="text-xs text-gray-500 mb-2">{q.description}</p>
                  )}
                  {isViewMode ? (
                    <ViewField value={answers[q.id] ?? '—'} />
                  ) : q.type === 'radio' && q.options ? (
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label key={opt} className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => { setAnswers(prev => ({ ...prev, [q.id]: opt })); clearError(`q_${q.id}`) }}
                            className="accent-brand-green mt-0.5 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-700 break-keep min-w-0 flex-1">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (() => {
                    const len = (answers[q.id] ?? '').length
                    // 글자수 임박 알림 — 90% 이상 주황, 100% 빨강 (M7)
                    const counterCls = len >= 500 ? 'text-red-500 font-medium' : len >= 450 ? 'text-orange-500' : 'text-gray-400'
                    return (
                      <>
                        <textarea
                          value={answers[q.id] ?? ''}
                          onChange={e => { setAnswers(prev => ({ ...prev, [q.id]: e.target.value })); clearError(`q_${q.id}`) }}
                          placeholder="답변을 입력해 주세요"
                          rows={3}
                          maxLength={500}
                          className={`${fieldCls(errors[`q_${q.id}`])} resize-none`}
                          aria-invalid={!!errors[`q_${q.id}`]}
                          aria-describedby={errors[`q_${q.id}`] ? `apply-error-q-${q.id}` : undefined}
                        />
                        <p className={`text-sm mt-1 text-right tabular-nums ${counterCls}`}>{len}/500</p>
                      </>
                    )
                  })()}
                  {errors[`q_${q.id}`] && <p id={`apply-error-q-${q.id}`} role="alert" aria-live="polite" className="text-xs text-red-500 mt-1">필수 항목이에요</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 약관 동의 */}
        {!isViewMode && (
          <Section title="약관 동의" required>
            <div className="space-y-3">
              <AgreementRow
                checked={agreed1}
                onChange={(v) => { setAgreed1(v); clearError('agreed1') }}
                error={errors.agreed1}
                text="초상권 활용에 동의합니다."
              />
              <AgreementRow
                checked={agreed2}
                onChange={(v) => { setAgreed2(v); clearError('agreed2') }}
                error={errors.agreed2}
                text={campaign.secondaryUse?.enabled
                  ? `캠페인 유의사항, 개인정보 및 콘텐츠 제3자 제공, 저작물 이용에 동의합니다. (콘텐츠 2차 활용 포함${campaign.secondaryUse.durationMonths ? ` — ${campaign.secondaryUse.durationMonths}개월` : ''})`
                  : '캠페인 유의사항, 개인정보 및 콘텐츠 제3자 제공, 저작물 이용에 동의합니다.'}
              />
              {/* 공통 안내사항 자세히보기 — 원본 CampaignApplyForm.tsx L859-872 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-700">공통 안내사항 <span className="text-red-500">*</span></p>
                <a
                  href={TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
                >
                  자세히보기
                  <ExternalLink size={10} aria-hidden="true" />
                </a>
              </div>
            </div>
          </Section>
        )}

      </div>

      {/* 주소 검색 모달 — 원본은 Kakao Postcode API(handleOpenPostcode L364-392). mock 환경에서 샘플 주소 목록으로 대체 */}
      {addrSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end @[640px]:items-center justify-center bg-black/40"
          onClick={() => setAddrSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl @[640px]:rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <p className="text-base font-bold text-gray-900">주소 검색</p>
              <button
                onClick={() => setAddrSearchOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-lg p-1"
                aria-label="닫기"
              >✕</button>
            </div>
            <div className="px-4 pt-3 pb-2">
              <input
                type="text"
                value={addrQuery}
                onChange={e => setAddrQuery(e.target.value)}
                placeholder="도로명, 건물명, 지번 검색"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
              />
            </div>
            <div className="overflow-y-auto max-h-64 px-2 pb-3">
              {([
                { zip: '06234', addr: '서울 강남구 테헤란로 123' },
                { zip: '06135', addr: '서울 강남구 역삼로 100' },
                { zip: '04799', addr: '서울 성동구 왕십리로 410' },
                { zip: '03181', addr: '서울 종로구 세종대로 172' },
                { zip: '07249', addr: '서울 영등포구 당산로 241' },
              ] as const)
                .filter(a => !addrQuery.trim() || a.addr.includes(addrQuery.trim()))
                .map(a => (
                  <button
                    key={a.zip}
                    onClick={() => {
                      setDeliveryZip(a.zip)
                      setDeliveryAddr(a.addr)
                      clearError('deliveryAddr')
                      setAddrSearchOpen(false)
                    }}
                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  >
                    <p className="text-sm font-medium text-gray-900">{a.addr}</p>
                    <p className="text-xs text-gray-400 tabular-nums mt-0.5">({a.zip})</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}

function ViewField({ value }: { value: string }) {
  return (
    <div className="w-full px-3.5 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-700">
      {value}
    </div>
  )
}

function Section({ title, required, icon, children }: {
  title: string
  required?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 @[640px]:p-5">
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {required && <span className="text-red-500 text-sm" aria-label="필수">*</span>}
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
      error ? 'border-red-200 bg-red-50' : checked ? 'border-brand-green-border bg-brand-green-bg' : 'border-gray-100 bg-gray-50'
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 accent-brand-green"
      />
      <span className="text-sm text-gray-700 leading-snug break-keep">{text}</span>
    </label>
  )
}

function fieldCls(error?: boolean) {
  // 글자 크기 16px(text-base) 강제 — iOS Safari 인풋 focus 시 auto-zoom 방지
  return `w-full px-3.5 py-2.5 rounded-xl border text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
    error
      ? 'border-red-300 bg-red-50 focus-visible:ring-red-300/50'
      : 'border-gray-200 bg-white focus-visible:border-brand-green'
  }`
}
