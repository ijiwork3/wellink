import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Calendar, Clock, Users, CheckCircle2, Gift, UserCheck, FileText, Package, Footprints, Hash, Copy, Share2, Bell, Layers, Star, BookOpen } from 'lucide-react'
import { SEMANTIC_COLORS, PROGRESS_THRESHOLD } from '@wellink/ui'
import { StatusBadge, PlatformBadge } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import type { Campaign } from '../services/mock/campaigns'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'
import { useBookmarks } from '../services/userState'

interface CampaignDetailContentProps {
  campaign: Campaign
  inModal?: boolean
  forceApplied?: boolean
  forceClosed?: boolean
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

export default function CampaignDetailContent({ campaign, inModal = false, forceApplied = false, forceClosed = false }: CampaignDetailContentProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const bookmarks = useBookmarks()
  const liked = bookmarks.has(campaign.id)
  const applied = forceApplied

  // applyEnd 당일 23:59:59 KST까지는 신청 가능 — 그 이후는 자동 마감 (cold-review 7차 M4).
  // mount 시점 캡처해 React 19 purity 규칙 위반 회피 (Home.tsx와 동일 패턴)
  const [mountedAt] = useState(() => Date.now())
  const applyEndExpired = (() => {
    const end = new Date(campaign.applyEnd)
    end.setHours(23, 59, 59, 999)
    return end.getTime() < mountedAt
  })()
  const isClosed = forceClosed || campaign.status === '종료' || applyEndExpired

  // 모달 내부일 때는 카드 박스 없이 플랫하게, 페이지일 때는 @container 반응형
  const wrapCls = inModal ? '' : '@container'
  const imgCls = inModal
    ? 'h-48 bg-gray-100 rounded-xl overflow-hidden mb-5 relative'
    : 'h-52 @[640px]:h-64 bg-gray-100 @[640px]:mx-6 @[640px]:mt-6 @[640px]:rounded-2xl overflow-hidden relative'

  // inModal·페이지 모두 섹션 간 border-t 유지. 페이지일 때만 좌우 패딩 추가.
  const sectionCls = inModal ? 'py-4 border-t border-gray-100 first:border-t-0' : 'border-t border-gray-100 px-4 py-5 @[640px]:px-6'
  const firstSectionCls = inModal ? 'pb-4' : 'px-4 py-5 @[640px]:p-6'

  return (
    <>
    <div className={wrapCls} style={!inModal ? { paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' } : undefined}>
      {/* 마감임박 띠 */}
      {campaign.status === '마감임박' && (
        <div className="bg-orange-500 text-white text-xs font-semibold text-center py-1.5 tracking-wide">
          신청 마감이 임박했어요!
        </div>
      )}

      {/* 이미지 배너 — Unsplash 운동 사진 풀(seed=id). 외부 fetch 실패 시 SVG 그라데이션 fallback. */}
      <div className={imgCls}>
        <img
          src={getThumbnailFromPool(campaign.id)}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(campaign.id, campaign.brand) }}
        />
      </div>

      <div className={inModal ? '' : '@[640px]:max-w-3xl @[640px]:mx-auto @[640px]:px-6 @[640px]:py-6'}>
        <div className={inModal ? '' : '@[640px]:bg-white @[640px]:rounded-2xl @[640px]:shadow-sm @[640px]:border @[640px]:border-gray-100 @[640px]:overflow-hidden'}>

          {/* 브랜드 + 상태 + 관심등록 — 좁은 모바일에서 한 줄 강제 X. flex-wrap 으로 자연 줄바꿈 */}
          <div className={firstSectionCls}>
            <div className="flex flex-col @[480px]:flex-row @[480px]:items-center @[480px]:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-sm font-semibold text-gray-500 break-keep">{campaign.brand}</span>
                <StatusBadge status={campaign.status} />
                <PlatformBadge platform={campaign.channel} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/campaigns/${campaign.id}`
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: campaign.name, text: `${campaign.brand} · ${campaign.name}`, url })
                      } catch {
                        // 사용자가 공유 시트를 닫은 경우(AbortError) 등 조용히 무시
                      }
                      return
                    }
                    if (navigator.clipboard?.writeText) {
                      try {
                        await navigator.clipboard.writeText(url)
                        showToast('링크를 복사했어요!', 'success')
                      } catch {
                        showToast('링크 복사에 실패했어요', 'error')
                      }
                    } else {
                      showToast('이 브라우저는 공유를 지원하지 않아요', 'info')
                    }
                  }}
                  aria-label="공유하기"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Share2 size={15} className="text-gray-500" aria-hidden="true" />
                  <span className="text-sm text-gray-500">공유</span>
                </button>
                <button
                  onClick={() => {
                    const wasLiked = liked
                    bookmarks.toggle(campaign.id)
                    showToast(wasLiked ? '관심 등록을 취소했어요' : '관심 캠페인에 등록했어요!', wasLiked ? 'info' : 'success')
                  }}
                  aria-pressed={liked}
                  aria-label={liked ? '관심등록 취소' : '관심등록'}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${liked ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <Heart size={16} aria-hidden="true" fill={liked ? SEMANTIC_COLORS.heart : 'none'} color={liked ? SEMANTIC_COLORS.heart : SEMANTIC_COLORS.heartInactive} />
                  <span className={`text-sm ${liked ? 'text-red-500' : 'text-gray-500'}`}>{liked ? '관심등록됨' : '관심등록'}</span>
                </button>
              </div>
            </div>

            {inModal
              ? <h3 className="text-xl font-bold text-gray-900 mb-4 break-keep">{campaign.name}</h3>
              : <h1 className="text-xl font-bold text-gray-900 mb-4 break-keep">{campaign.name}</h1>
            }

            {/* 모집 현황 */}
            {(() => {
              const pct = Math.min(100, Math.round((campaign.applied / (campaign.headcount || 1)) * 100))
              return (
                <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1 whitespace-nowrap">
                      <Users size={13} className="text-brand-green" aria-hidden="true" />모집 현황
                    </span>
                    <span className="text-sm text-gray-500 tabular-nums whitespace-nowrap">{campaign.applied}/{campaign.headcount}명</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= PROGRESS_THRESHOLD.warning ? 'bg-orange-400' : 'bg-brand-green'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1 tabular-nums">{pct}% 모집</p>
                </div>
              )
            })()}

            <p className="text-sm text-gray-600 break-keep">{campaign.description}</p>
          </div>

          {/* 기간/채널 */}
          <div className={`${sectionCls} grid grid-cols-1 @[640px]:grid-cols-2 gap-3`}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Calendar size={17} className="text-brand-green flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">신청 마감</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums truncate">{campaign.applyEnd}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Clock size={17} className="text-brand-green flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">게시 마감</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums truncate">{campaign.postEnd}</p>
              </div>
            </div>
            {campaign.announceDate && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 col-span-full">
                <Bell size={17} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm text-amber-700">인플루언서 발표일</p>
                  <p className="text-sm font-semibold text-gray-900 tabular-nums truncate">{campaign.announceDate}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 col-span-full">
              <Users size={17} className="text-brand-green flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">모집 채널</p>
                <p className="text-sm font-semibold text-gray-900 break-keep">{campaign.channel}</p>
              </div>
            </div>
            {campaign.type && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 col-span-full">
                {campaign.type === 'delivery'
                  ? <Package size={17} className="text-brand-green flex-shrink-0" aria-hidden="true" />
                  : <Footprints size={17} className="text-blue-500 flex-shrink-0" aria-hidden="true" />
                }
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">캠페인 유형</p>
                  <p className={`text-sm font-semibold ${campaign.type === 'delivery' ? 'text-gray-900' : 'text-blue-700'}`}>
                    {campaign.type === 'delivery' ? '배송형' : '방문형'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 필수 키워드 */}
          {(campaign.keywords ?? []).length > 0 && (
            <div className={sectionCls}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 whitespace-nowrap">
                  <Hash size={14} className="text-brand-green" aria-hidden="true" />필수 키워드
                </p>
                <button
                  onClick={async () => {
                    const text = campaign.keywords!.map(k => `#${k}`).join(' ')
                    if (navigator.clipboard?.writeText) {
                      try {
                        await navigator.clipboard.writeText(text)
                        showToast('키워드를 복사했어요!', 'success')
                      } catch {
                        showToast('복사에 실패했어요', 'error')
                      }
                    } else {
                      showToast('이 브라우저는 복사를 지원하지 않아요', 'info')
                    }
                  }}
                  className="shrink-0 flex items-center gap-1 text-sm text-gray-500 hover:text-brand-green-text transition-colors rounded-md whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  <Copy size={12} aria-hidden="true" />한 번에 복사
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.keywords!.map(k => (
                  <span key={k} className="px-2.5 py-1 rounded-full bg-brand-green-bg text-xs font-medium text-brand-green-text whitespace-nowrap break-keep">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 보상 */}
          {campaign.reward && (
            <div className={sectionCls}>
              <div className="p-4 rounded-xl border border-brand-green-border bg-brand-green-bg flex items-start gap-3">
                <Gift size={17} className="text-brand-green-text flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-green-text mb-0.5">제공 혜택</p>
                  <p className="text-sm font-medium text-gray-900 break-keep">{campaign.reward}</p>
                </div>
              </div>
            </div>
          )}

          {/* 제공 내역 — 원본 CampaignDetail.tsx L249-265 */}
          {campaign.productDetail && (
            <div className={sectionCls}>
              <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Gift size={14} className="text-brand-green" aria-hidden="true" />제공 내역
              </p>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line break-keep leading-relaxed">{campaign.productDetail}</p>
              </div>
            </div>
          )}

          {/* 참여 조건 */}
          {campaign.conditions && (() => {
            const { follower, content, etc } = groupConditions(campaign.conditions!)
            const groups: { label: string; icon: React.ReactNode; items: string[] }[] = []
            if (follower.length) groups.push({ label: '팔로워·구독자 조건', icon: <UserCheck size={14} className="text-brand-green" />, items: follower })
            if (content.length) groups.push({ label: '콘텐츠 업로드 조건', icon: <FileText size={14} className="text-brand-green" />, items: content })
            if (etc.length) groups.push({ label: '기타 조건', icon: <CheckCircle2 size={14} className="text-brand-green" />, items: etc })
            return (
              <div className={sectionCls}>
                <p className="text-sm font-semibold text-gray-900 mb-3">참여 조건</p>
                <div className="space-y-3">
                  {groups.map((g, gi) => (
                    <div key={gi} className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                        {g.icon}
                        <span className="text-sm font-semibold text-gray-600">{g.label}</span>
                      </div>
                      <ul className="px-3 py-2 space-y-1.5">
                        {g.items.map((cond, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 break-keep">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-green flex-shrink-0" />
                            <span className="min-w-0 flex-1">{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* 필수 가이드 — 원본 CampaignDetail.tsx L301-308 */}
          {campaign.detailMissionDescription && (
            <div className={sectionCls}>
              <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <BookOpen size={14} className="text-brand-green" aria-hidden="true" />필수 가이드
              </p>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line break-keep leading-relaxed">{campaign.detailMissionDescription}</p>
              </div>
            </div>
          )}

          {/* 게시 유형 + 우대사항 — 원본 CampaignDetail.tsx L282-298 */}
          {(campaign.postType || campaign.priorityType) && (
            <div className={sectionCls}>
              <p className="text-sm font-semibold text-gray-900 mb-3">미션 정보</p>
              <div className="space-y-2.5">
                {campaign.postType && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <Layers size={15} className="text-brand-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">게시 유형</p>
                      <p className="text-sm font-medium text-gray-900 break-keep">{campaign.postType}</p>
                    </div>
                  </div>
                )}
                {campaign.priorityType && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <Star size={15} className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs text-amber-600 mb-0.5">우대사항</p>
                      <p className="text-sm font-medium text-gray-900 break-keep">{campaign.priorityType}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 신청 버튼 — 모달 내부일 때는 인라인, 페이지(전체화면)일 때는 fixed 하단 */}
          {inModal ? (
            <div className={sectionCls}>
              {isClosed ? (
                <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-gray-200 text-gray-400 bg-gray-50">
                  마감된 캠페인이에요
                </div>
              ) : applied ? (
                <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-brand-green text-brand-green-text bg-brand-green-bg flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} aria-hidden="true" />신청완료
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/campaigns/${campaign.id}/apply`)}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white bg-brand-green transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  신청하기
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

    </div>

    {/* 페이지 모드일 때만 — fixed 하단 신청 CTA */}

    {!inModal && (
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {isClosed ? (
          <div className="w-full py-3.5 rounded-xl text-sm font-medium text-center border border-gray-200 text-gray-400 bg-gray-50">
            마감된 캠페인이에요
          </div>
        ) : applied ? (
          <div className="w-full py-3.5 rounded-xl text-sm font-medium text-center border border-brand-green text-brand-green-text bg-brand-green-bg flex items-center justify-center gap-2">
            <CheckCircle2 size={16} aria-hidden="true" />신청완료
          </div>
        ) : (
          <button
            onClick={() => navigate(`/campaigns/${campaign.id}/apply`)}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-green transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            신청하기
          </button>
        )}
      </div>
    )}
    </>
  )
}
