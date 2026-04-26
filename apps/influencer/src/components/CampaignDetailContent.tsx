import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Calendar, Clock, Users, CheckCircle2, Gift, UserCheck, FileText } from 'lucide-react'
import { Modal, SEMANTIC_COLORS, PROGRESS_THRESHOLD, TIMER_MS } from '@wellink/ui'
import { StatusBadge, PlatformBadge } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import type { Campaign } from '../services/mock/campaigns'

interface CampaignDetailContentProps {
  campaign: Campaign
  inModal?: boolean
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

export default function CampaignDetailContent({ campaign, inModal = false }: CampaignDetailContentProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [liked, setLiked] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [successModal, setSuccessModal] = useState(false)

  const isClosed = campaign.status === '종료'

  const handleApply = () => {
    setApplied(true)
    setApplyModalOpen(false)
    setSuccessModal(true)
    setTimeout(() => setSuccessModal(false), TIMER_MS.SUCCESS_MODAL_CLOSE)
  }

  // 모달 내부일 때는 카드 박스 없이 플랫하게, 페이지일 때는 @container 반응형
  const wrapCls = inModal ? '' : '@container'
  const imgCls = inModal
    ? 'h-48 flex items-center justify-center text-7xl bg-brand-green/10 rounded-xl overflow-hidden mb-5'
    : 'h-52 @sm:h-64 flex items-center justify-center text-8xl bg-brand-green/10 @sm:mx-6 @sm:mt-6 @sm:rounded-2xl overflow-hidden'

  const sectionCls = inModal ? 'py-4' : 'border-t border-gray-100 px-4 py-5 @sm:px-6'
  const firstSectionCls = inModal ? 'pb-4' : 'px-4 py-5 @sm:p-6'

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

      <div className={inModal ? '' : '@sm:max-w-3xl @sm:mx-auto @sm:px-6 @sm:py-6'}>
        <div className={inModal ? '' : '@sm:bg-white @sm:rounded-2xl @sm:shadow-sm @sm:border @sm:border-gray-100 @sm:overflow-hidden'}>

          {/* 브랜드 + 상태 + 관심등록 */}
          <div className={firstSectionCls}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-500">{campaign.brand}</span>
                <StatusBadge status={campaign.status} />
                <PlatformBadge platform={campaign.channel} />
              </div>
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
          <div className={`${sectionCls} grid grid-cols-1 @sm:grid-cols-2 gap-3`} style={inModal ? { borderTop: '1px solid #f3f4f6' } : {}}>
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
          </div>

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
                onClick={() => setApplyModalOpen(true)}
                className={`w-full py-3 rounded-xl text-sm font-medium text-white bg-brand-green transition-all duration-150 hover:opacity-90 ${campaign.status === '마감임박' ? 'animate-pulse' : ''}`}
              >
                신청하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 신청 확인 모달 */}
      <Modal open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="캠페인 신청">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{campaign.name}</span>에 신청하시겠습니까?
          </p>
          <div className="p-3 rounded-xl text-sm bg-brand-green/5 text-brand-green-text">
            신청 후 브랜드 검토 → 선정 결과 알림 → 제품 수령 → 콘텐츠 게시 순으로 진행됩니다.
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setApplyModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-150">취소</button>
            <button onClick={handleApply} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green transition-all duration-150 hover:opacity-90">신청하기</button>
          </div>
        </div>
      </Modal>

      {/* 신청 완료 모달 */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 mx-4" style={{ animation: 'scaleIn 0.2s ease-out' }}>
            <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-brand-green" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">신청 완료!</p>
              <p className="text-sm text-gray-500 mt-1">브랜드 검토 후 결과를 알려드릴게요</p>
            </div>
            <button onClick={() => { setSuccessModal(false); navigate('/campaigns/my') }} className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-green">나의 캠페인 확인</button>
            <button onClick={() => { setSuccessModal(false); navigate('/campaigns/browse') }} className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">계속 둘러보기</button>
          </div>
        </div>
      )}
    </div>
  )
}
