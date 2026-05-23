import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import {
  Heart, Users, CheckCircle2, Gift, UserCheck, FileText,
  Package, Footprints, Hash, Copy, Share2, Search, Type, Star, ArrowLeft,
} from 'lucide-react'
import { SEMANTIC_COLORS, PROGRESS_THRESHOLD } from '@wellink/ui'
import { StatusBadge, PlatformBadge } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import type { Campaign } from '../services/mock/campaigns'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'
import { useBookmarks } from '../services/userState'

// ── 날짜 포맷 유틸 (원본 CampaignSidebar formatDateRangeWithDay/formatDateWithDay 대응) ──
const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}. ${m}. ${day}. (${DAYS_KO[d.getDay()]})`
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}. ${day}. (${DAYS_KO[d.getDay()]})`
}

function formatDateRangeShort(startStr: string, endStr: string): string {
  return `${formatDateShort(startStr)} ~ ${formatDateShort(endStr)}`
}

interface CampaignDetailContentProps {
  campaign: Campaign
  inModal?: boolean
  forceApplied?: boolean
  forceClosed?: boolean
  onBack?: () => void
}

function groupConditions(conditions: string[]) {
  const follower: string[] = []
  const content: string[] = []
  const etc: string[] = []
  for (const c of conditions) {
    if (/팔로워|구독자|이웃/.test(c)) follower.push(c)
    else if (/피드|게시물|스토리|영상|콘텐츠|업로드|포스팅|릴스|사진|멘션|태그|해시태그|캡션/.test(c)) content.push(c)
    else etc.push(c)
  }
  return { follower, content, etc }
}

// ── SVG 헬퍼 아이콘 (원본 동일) ──────────────────────────────────────────────
function GiftSvgIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-gray-400" aria-hidden="true">
      <title>Gift</title>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}
function HashSvgIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-gray-400" aria-hidden="true">
      <title>Hash</title>
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  )
}

export default function CampaignDetailContent({
  campaign,
  inModal = false,
  forceApplied = false,
  forceClosed = false,
  onBack,
}: CampaignDetailContentProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const bookmarks = useBookmarks()
  const liked = bookmarks.has(campaign.id)
  const applied = forceApplied

  const [mountedAt] = useState(() => Date.now())
  const applyEndExpired = (() => {
    const end = new Date(campaign.applyEnd)
    end.setHours(23, 59, 59, 999)
    return end.getTime() < mountedAt
  })()
  const isClosed = forceClosed || campaign.status === '종료' || applyEndExpired

  // D-day 계산 (원본 CampaignSidebar getDaysLeft 대응)
  const dDay = (() => {
    const end = new Date(campaign.applyEnd)
    end.setHours(23, 59, 59, 999)
    const diff = end.getTime() - mountedAt
    if (diff <= 0) return 0
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  })()

  const pct = Math.min(100, Math.round((campaign.applied / (campaign.headcount || 1)) * 100))

  const handleShare = async () => {
    const url = `${window.location.origin}/campaigns/${campaign.id}`
    if (navigator.share) {
      try { await navigator.share({ title: campaign.name, url }) } catch { /* abort */ }
      return
    }
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(url); showToast('링크를 복사했어요!', 'success') }
      catch { showToast('링크 복사에 실패했어요', 'error') }
    } else {
      showToast('이 브라우저는 공유를 지원하지 않아요', 'info')
    }
  }

  const handleLike = () => {
    const wasLiked = liked
    bookmarks.toggle(campaign.id)
    showToast(wasLiked ? '관심 등록을 취소했어요' : '관심 캠페인에 등록했어요!', wasLiked ? 'info' : 'success')
  }

  const handleApply = () => navigate(`/campaigns/${campaign.id}/apply`)

  // ── 모달 모드 (compact 단열) ─────────────────────────────────────────────────
  if (inModal) {
    const sectionCls = 'py-4 border-t border-gray-100'
    return (
      <div>
        {/* 이미지 */}
        <div className="h-48 bg-gray-100 rounded-xl overflow-hidden mb-5 relative">
          <img src={getThumbnailFromPool(campaign.id)} alt="" loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(campaign.id, campaign.brand) }} />
        </div>

        {/* 브랜드 + 상태 */}
        <div className="pb-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-sm font-semibold text-gray-500">{campaign.brand}</span>
            <StatusBadge status={campaign.status} />
            <PlatformBadge platform={campaign.channel} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 break-keep">{campaign.name}</h3>

          {/* 모집 현황 */}
          <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1 whitespace-nowrap">
                <Users size={13} className="text-brand-green" />모집 현황
              </span>
              <span className="text-sm text-gray-500 tabular-nums whitespace-nowrap">{campaign.applied}/{campaign.headcount}명</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct >= PROGRESS_THRESHOLD.warning ? 'bg-orange-400' : 'bg-brand-green'}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-1 tabular-nums">{pct}% 모집</p>
          </div>

          <div className="text-sm text-gray-600 break-keep leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-headings:text-gray-900 prose-strong:text-gray-900">
            <Markdown>{campaign.description}</Markdown>
          </div>
        </div>

        {/* 신청 버튼 */}
        <div className={sectionCls}>
          {isClosed ? (
            <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-gray-200 text-gray-400 bg-gray-50">
              마감된 캠페인이에요
            </div>
          ) : applied ? (
            <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-brand-green text-brand-green-text bg-brand-green-bg flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />신청완료
            </div>
          ) : (
            <button onClick={handleApply}
              className="w-full py-3 rounded-xl text-sm font-medium text-white bg-brand-green transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              신청하기
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── 페이지 모드 (원본 구조: 좌열 + 우사이드바) ────────────────────────────
  const conditions = campaign.conditions
  const { follower, content, etc } = conditions ? groupConditions(conditions) : { follower: [], content: [], etc: [] }
  const condGroups: { label: string; icon: React.ReactNode; items: string[] }[] = []
  if (follower.length) condGroups.push({ label: '팔로워·구독자 조건', icon: <UserCheck size={14} className="text-brand-green" />, items: follower })
  if (content.length) condGroups.push({ label: '콘텐츠 업로드 조건', icon: <FileText size={14} className="text-brand-green" />, items: content })
  if (etc.length) condGroups.push({ label: '기타 조건', icon: <CheckCircle2 size={14} className="text-brand-green" />, items: etc })

  const ApplyButton = ({ size = 'md' }: { size?: 'md' | 'lg' }) => {
    const py = size === 'lg' ? 'py-4' : 'py-3.5'
    const text = size === 'lg' ? 'text-lg font-bold' : 'text-base font-semibold'
    if (isClosed) return (
      <div className={`w-full ${py} rounded-xl ${text} text-center bg-gray-100 text-gray-400`}>마감된 캠페인이에요</div>
    )
    if (applied) return (
      <div className={`w-full ${py} rounded-xl ${text} text-center bg-brand-green-bg text-brand-green-text border border-brand-green-border flex items-center justify-center gap-2`}>
        <CheckCircle2 size={size === 'lg' ? 20 : 18} />신청완료
      </div>
    )
    return (
      <button onClick={handleApply}
        className={`w-full ${py} rounded-xl ${text} text-white bg-brand-green hover:opacity-90 transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50`}>
        캠페인 지원하기
      </button>
    )
  }

  return (
    <>
      <div className="pt-8 pb-28 lg:pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

              {/* ── 좌열: 콘텐츠 ─────────────────────────────────────────── */}
              <div className="flex-1 min-w-0">

                {/* 뒤로가기 (원본 동일: 콘텐츠 영역 상단) */}
                {onBack && (
                  <div className="mb-6">
                    <button
                      onClick={onBack}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-md"
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                      목록으로 돌아가기
                    </button>
                  </div>
                )}

                {/* 타이틀 섹션 */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <StatusBadge status={campaign.status} />
                    {campaign.category && (
                      <span className="text-gray-500 text-sm whitespace-nowrap">
                        {campaign.category}
                        {campaign.type && ` · ${campaign.type === 'delivery' ? '배송형' : '방문형'}`}
                      </span>
                    )}
                    <div className="w-[1px] h-3 bg-gray-300 mx-1" />
                    <span className="text-gray-600 text-sm font-bold whitespace-nowrap">{campaign.brand}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight break-keep">
                    {campaign.name}
                  </h1>
                  <p className="text-gray-500 text-sm md:text-base break-keep">
                    {campaign.name} 관련 캠페인입니다.
                  </p>
                </div>

                {/* 이미지 (원본: aspect-video + rounded-2xl) */}
                <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden relative mb-10 border border-gray-200">
                  <img
                    src={getThumbnailFromPool(campaign.id)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(campaign.id, campaign.brand) }}
                  />
                </div>

                {/* 섹션 그룹 (원본: space-y-12) */}
                <div className="space-y-12">

                  {/* 캠페인 설명 */}
                  {campaign.description && (
                    <section>
                      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="text-gray-400" size={20} aria-hidden="true" />
                        캠페인 설명
                      </h3>
                      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white p-6">
                        <div className="text-base text-gray-600 break-keep leading-relaxed prose prose-base max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1.5 prose-headings:text-gray-900 prose-strong:text-gray-900">
                          <Markdown>{campaign.description}</Markdown>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* 제공 내역 */}
                  {campaign.productDetail && (
                    <section>
                      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <GiftSvgIcon />
                        제공 내역
                      </h3>
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6">
                          <p className="text-base text-gray-700 whitespace-pre-line break-keep leading-relaxed">
                            {campaign.productDetail}
                          </p>
                        </div>
                        <div className="px-6 pb-6 space-y-1.5 text-sm text-gray-500">
                          <p>※ 제품은 받자마자 보관방법을 확인하여 설명서대로 보관해주세요.</p>
                          <p>※ 제품의 자세한 정보는 반드시 상세페이지에서 꼼꼼히 숙지 부탁드립니다.</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* 캠페인 미션 */}
                  {(campaign.keywords?.length || campaign.postType || campaign.priorityType || campaign.detailMissionDescription) ? (
                    <section>
                      <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="text-gray-400" size={20} aria-hidden="true" />
                        캠페인 미션
                      </h3>

                      {/* 3열 카드: 키워드 / 게시유형 / 우대사항 (원본 그대로) */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                          <div className="w-10 h-10 bg-brand-green-bg text-brand-green rounded-full flex items-center justify-center mx-auto mb-2">
                            <Search size={18} aria-hidden="true" />
                          </div>
                          <div className="text-sm text-gray-500 mb-1">키워드</div>
                          <div className="font-bold text-sm text-gray-900 break-keep">
                            {(campaign.keywords?.length ?? 0) > 0 ? '필수 포함' : '없음'}
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                          <div className="w-10 h-10 bg-brand-green-bg text-brand-green rounded-full flex items-center justify-center mx-auto mb-2">
                            <Type size={18} aria-hidden="true" />
                          </div>
                          <div className="text-sm text-gray-500 mb-1">게시 유형</div>
                          <div className="font-bold text-sm text-gray-900 break-keep">
                            {campaign.postType?.trim() || '없음'}
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-xl text-center shadow-sm">
                          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Star size={18} aria-hidden="true" />
                          </div>
                          <div className="text-sm text-gray-500 mb-1">우대사항</div>
                          <div className="font-bold text-sm text-gray-900 break-keep">
                            {campaign.priorityType?.trim() || '없음'}
                          </div>
                        </div>
                      </div>

                      {/* 필수 가이드 */}
                      {campaign.detailMissionDescription && (
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="text-gray-400" size={18} aria-hidden="true" />
                            필수 가이드
                          </h4>
                          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white p-6">
                            <div className="text-base text-gray-700 break-keep leading-relaxed prose prose-base max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1.5 prose-headings:text-gray-900 prose-strong:text-gray-900">
                              <Markdown>{campaign.detailMissionDescription}</Markdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  ) : null}

                  {/* 필수 키워드 */}
                  {(campaign.keywords ?? []).length > 0 && (
                    <section>
                      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <HashSvgIcon />
                        필수 키워드
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {campaign.keywords!.map((k) => (
                            <span key={k}
                              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-base font-medium text-gray-700 shadow-sm whitespace-nowrap">
                              #{k}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const text = campaign.keywords!.map((k) => `#${k}`).join(' ')
                            if (navigator.clipboard?.writeText) {
                              try { await navigator.clipboard.writeText(text); showToast('키워드를 복사했어요!', 'success') }
                              catch { showToast('복사에 실패했어요', 'error') }
                            } else {
                              showToast('이 브라우저는 복사를 지원하지 않아요', 'info')
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 p-4 rounded-xl text-gray-600 font-bold hover:border-brand-green-border hover:bg-brand-green-bg hover:text-brand-green-text transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                        >
                          <Copy size={18} className="text-gray-400 group-hover:text-brand-green transition-colors" aria-hidden="true" />
                          <span>키워드 한 번에 복사하기</span>
                        </button>
                      </div>
                    </section>
                  )}

                  {/* 참여 조건 */}
                  {condGroups.length > 0 && (
                    <section>
                      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-gray-400" size={20} aria-hidden="true" />
                        참여 조건
                      </h3>
                      <div className="space-y-3">
                        {condGroups.map((g, gi) => (
                          <div key={gi} className="rounded-xl border border-gray-200 overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                              {g.icon}
                              <span className="text-sm font-semibold text-gray-600">{g.label}</span>
                            </div>
                            <ul className="px-4 py-3 space-y-2">
                              {g.items.map((cond, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 break-keep">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                                  <span className="min-w-0 flex-1">{cond}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 캠페인 유형 */}
                  {campaign.type && (
                    <section>
                      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        {campaign.type === 'delivery'
                          ? <Package className="text-gray-400" size={20} aria-hidden="true" />
                          : <Footprints className="text-blue-400" size={20} aria-hidden="true" />}
                        캠페인 유형
                      </h3>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${campaign.type === 'delivery' ? 'bg-brand-green-bg text-brand-green' : 'bg-blue-50 text-blue-500'}`}>
                          {campaign.type === 'delivery'
                            ? <Package size={18} aria-hidden="true" />
                            : <Footprints size={18} aria-hidden="true" />}
                        </div>
                        <div>
                          <p className={`font-bold text-base ${campaign.type === 'delivery' ? 'text-gray-900' : 'text-blue-700'}`}>
                            {campaign.type === 'delivery' ? '배송형' : '방문형'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {campaign.type === 'delivery' ? '제품을 배송받아 콘텐츠를 제작해요' : '매장/장소를 방문하여 콘텐츠를 제작해요'}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                </div>
              </div>

              {/* ── 우열: 사이드바 (PC sticky) ──────────────────────────────── */}
              <div className="hidden lg:block w-[360px] flex-shrink-0">
                <div className="sticky top-24 space-y-4">

                  {/* 정보 카드 */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="space-y-4 pb-5 border-b border-gray-100">
                      {/* 모집 기간 + D-day (원본 CampaignSidebar participateStartDate~participateEndDate) */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-500 whitespace-nowrap">모집 기간</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-gray-900 text-sm tabular-nums text-right">
                            {campaign.applyStart
                              ? formatDateRangeShort(campaign.applyStart, campaign.applyEnd)
                              : formatDateShort(campaign.applyEnd)}
                          </span>
                          {dDay > 0 && (
                            <span className="shrink-0 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                              {dDay === 1 ? '당일 마감' : `D-${dDay}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {campaign.announceDate && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-gray-500 whitespace-nowrap">인플루언서 발표</span>
                          <span className="font-semibold text-gray-900 text-sm tabular-nums">{formatDateFull(campaign.announceDate)}</span>
                        </div>
                      )}

                      {/* 업로드 기간 (원본 CampaignSidebar startDate~endDate) */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-500 whitespace-nowrap">업로드 기간</span>
                        <span className="font-semibold text-gray-900 text-sm tabular-nums text-right">
                          {campaign.postStart
                            ? formatDateRangeShort(campaign.postStart, campaign.postEnd)
                            : formatDateShort(campaign.postEnd)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-500 whitespace-nowrap">모집 인원</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-semibold text-gray-900 text-base tabular-nums">{campaign.headcount}</span>
                          <span className="text-sm text-gray-500">명</span>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 (원본 CampaignSidebar mt-8 space-y-3) */}
                    <div className="mt-8 space-y-3">
                      <ApplyButton size="lg" />

                      <div className="flex gap-2">
                        <button
                          onClick={handleLike}
                          aria-pressed={liked}
                          aria-label={liked ? '찜 취소' : '찜하기'}
                          className={`flex-1 py-3 border rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${liked ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          <Heart size={16} aria-hidden="true" fill={liked ? SEMANTIC_COLORS.heart : 'none'} color={liked ? SEMANTIC_COLORS.heart : SEMANTIC_COLORS.heartInactive} />
                          {liked ? '찜완료' : '찜하기'}
                        </button>
                        <button
                          onClick={handleShare}
                          aria-label="공유하기"
                          className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                        >
                          <Share2 size={16} aria-hidden="true" />
                          공유하기
                        </button>
                      </div>
                    </div>
                  </div>


                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 고정 버튼 (원본 동일) */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 lg:hidden z-40"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <ApplyButton size="lg" />
      </div>
    </>
  )
}
