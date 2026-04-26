import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Calendar, Clock, Users, CheckCircle2, Gift, UserCheck, FileText, Package, Footprints, Hash, Copy, Share2 } from 'lucide-react'
import { SEMANTIC_COLORS, PROGRESS_THRESHOLD } from '@wellink/ui'
import { StatusBadge, PlatformBadge } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import type { Campaign } from '../services/mock/campaigns'

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
    else if (/피드|게시물|스토리|영상|콘텐츠|업로드|포스팅|릴스/.test(c)) content.push(c)
    else etc.push(c)
  }
  return { follower, content, etc }
}

export default function CampaignDetailContent({ campaign, inModal = false, forceApplied = false, forceClosed = false }: CampaignDetailContentProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [liked, setLiked] = useState(false)
  const applied = forceApplied

  const isClosed = forceClosed || campaign.status === '종료'

  // 모달 내부일 때는 카드 박스 없이 플랫하게, 페이지일 때는 @container 반응형
  const wrapCls = inModal ? '' : '@container'
  const imgCls = inModal
    ? 'h-48 flex items-center justify-center text-7xl bg-brand-green/10 rounded-xl overflow-hidden mb-5'
    : 'h-52 @[640px]:h-64 flex items-center justify-center text-8xl bg-brand-green/10 @[640px]:mx-6 @[640px]:mt-6 @[640px]:rounded-2xl overflow-hidden'

  const sectionCls = inModal ? 'py-4' : 'border-t border-gray-100 px-4 py-5 @[640px]:px-6'
  const firstSectionCls = inModal ? 'pb-4' : 'px-4 py-5 @[640px]:p-6'

  return (
    <div className={wrapCls}>
      {/* 마감임박 띠 */}
      {campaign.status === '마감임박' && (
        <div className="bg-orange-500 text-white text-xs font-semibold text-center py-1.5 tracking-wide">
          신청 마감이 임박했어요!
        </div>
      )}

      {/* 이미지 배너 */}
      <div className={imgCls}>{campaign.image}</div>

      <div className={inModal ? '' : '@[640px]:max-w-3xl @[640px]:mx-auto @[640px]:px-6 @[640px]:py-6'}>
        <div className={inModal ? '' : '@[640px]:bg-white @[640px]:rounded-2xl @[640px]:shadow-sm @[640px]:border @[640px]:border-gray-100 @[640px]:overflow-hidden'}>

          {/* 브랜드 + 상태 + 관심등록 */}
          <div className={firstSectionCls}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-500">{campaign.brand}</span>
                <StatusBadge status={campaign.status} />
                <PlatformBadge platform={campaign.channel} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/campaigns/${campaign.id}`
                    if (navigator.share) {
                      navigator.share({ title: campaign.name, text: `${campaign.brand} · ${campaign.name}`, url })
                    } else {
                      navigator.clipboard.writeText(url)
                      showToast('링크가 복사되었어요!', 'success')
                    }
                  }}
                  aria-label="공유하기"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 transition-all duration-150 hover:bg-gray-50"
                >
                  <Share2 size={15} className="text-gray-500" aria-hidden="true" />
                  <span className="text-sm text-gray-500">공유</span>
                </button>
                <button
                  onClick={() => {
                    setLiked(!liked)
                    showToast(liked ? '관심 등록을 취소했어요.' : '관심 캠페인에 등록되었어요!', liked ? 'info' : 'success')
                  }}
                  aria-pressed={liked}
                  aria-label={liked ? '좋아요 취소' : '좋아요'}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 hover:bg-gray-50 ${liked ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <Heart size={16} aria-hidden="true" fill={liked ? SEMANTIC_COLORS.heart : 'none'} color={liked ? SEMANTIC_COLORS.heart : SEMANTIC_COLORS.heartInactive} />
                  <span className={`text-sm ${liked ? 'text-red-500' : 'text-gray-500'}`}>{liked ? '관심등록됨' : '관심등록'}</span>
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">{campaign.name}</h2>

            {/* 모집 현황 */}
            {(() => {
              const pct = Math.min(100, Math.round((campaign.applied / (campaign.headcount || 1)) * 100))
              return (
                <div className="mb-5 p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Users size={13} className="text-brand-green" />모집 현황
                    </span>
                    <span className="text-xs text-gray-500">{campaign.applied}/{campaign.headcount}명</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= PROGRESS_THRESHOLD.warning ? 'bg-orange-400' : 'bg-brand-green'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{pct}% 모집</p>
                </div>
              )
            })()}

            <p className="text-sm text-gray-600">{campaign.description}</p>
          </div>

          {/* 기간/채널 */}
          <div className={`${sectionCls} grid grid-cols-1 @[640px]:grid-cols-2 gap-3`} style={inModal ? { borderTop: '1px solid #f3f4f6' } : {}}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Calendar size={17} className="text-brand-green" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">신청 마감</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.applyEnd}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Clock size={17} className="text-brand-green" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">게시 마감</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.postEnd}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 col-span-full">
              <Users size={17} className="text-brand-green" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">모집 채널</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.channel}</p>
              </div>
            </div>
            {campaign.type && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 col-span-full">
                {campaign.type === 'delivery'
                  ? <Package size={17} className="text-brand-green" aria-hidden="true" />
                  : <Footprints size={17} className="text-blue-500" aria-hidden="true" />
                }
                <div>
                  <p className="text-xs text-gray-500">캠페인 유형</p>
                  <p className={`text-sm font-semibold ${campaign.type === 'delivery' ? 'text-gray-900' : 'text-blue-700'}`}>
                    {campaign.type === 'delivery' ? '배송형' : '방문형'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 필수 키워드 */}
          {(campaign.keywords ?? []).length > 0 && (
            <div className={sectionCls} style={inModal ? { borderTop: '1px solid #f3f4f6' } : {}}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Hash size={14} className="text-brand-green" />필수 키워드
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(campaign.keywords!.map(k => `#${k}`).join(' '))
                    showToast('키워드가 복사되었어요!', 'success')
                  }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-green transition-colors"
                >
                  <Copy size={12} />한 번에 복사
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.keywords!.map(k => (
                  <span key={k} className="px-2.5 py-1 rounded-full bg-brand-green/10 text-xs font-medium text-brand-green">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 보상 */}
          {campaign.reward && (
            <div className={sectionCls} style={inModal ? { borderTop: '1px solid #f3f4f6' } : {}}>
              <div className="p-4 rounded-xl border border-brand-green/20 bg-brand-green/5 flex items-start gap-3">
                <Gift size={17} className="text-brand-green-text flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-brand-green-text mb-0.5">제공 혜택</p>
                  <p className="text-sm font-medium text-gray-900">{campaign.reward}</p>
                </div>
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
              <div className={sectionCls} style={inModal ? { borderTop: '1px solid #f3f4f6' } : {}}>
                <p className="text-sm font-semibold text-gray-900 mb-3">참여 조건</p>
                <div className="space-y-3">
                  {groups.map((g, gi) => (
                    <div key={gi} className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                        {g.icon}
                        <span className="text-xs font-semibold text-gray-600">{g.label}</span>
                      </div>
                      <ul className="px-3 py-2 space-y-1.5">
                        {g.items.map((cond, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-green flex-shrink-0" />
                            {cond}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* 신청 버튼 */}
          <div className={sectionCls} style={inModal ? { borderTop: '1px solid #f3f4f6' } : {}}>
            {isClosed ? (
              <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-gray-200 text-gray-400 bg-gray-50">
                마감된 캠페인입니다
              </div>
            ) : applied ? (
              <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-brand-green text-brand-green bg-brand-green/5 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} aria-hidden="true" />신청완료
              </div>
            ) : (
              <button
                onClick={() => navigate(`/campaigns/${campaign.id}/apply`)}
                className={`w-full py-3 rounded-xl text-sm font-medium text-white bg-brand-green transition-all duration-150 hover:opacity-90 ${campaign.status === '마감임박' ? 'animate-pulse' : ''}`}
              >
                신청하기
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
