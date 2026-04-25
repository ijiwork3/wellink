import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Heart, Calendar, Clock, Users, CheckCircle2, Gift, UserCheck, FileText } from 'lucide-react'
import Layout from '../components/Layout'
import { Modal, ErrorState, TIMER_MS, SEMANTIC_COLORS } from '@wellink/ui'
import { StatusBadge, PlatformBadge } from '@wellink/ui'
import { mockCampaigns as campaigns } from '../services/mock/campaigns'
import { useQAMode } from '@wellink/ui'
import { useToast } from '@wellink/ui'

export default function CampaignDetail() {
  const qa = useQAMode()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const campaign = campaigns.find((c) => c.id === Number(id))

  const [liked, setLiked] = useState(false)
  const [searchParams] = useSearchParams()
  const [applyModalOpen, setApplyModalOpen] = useState(qa === 'modal-apply')

  useEffect(() => {
    if (searchParams.get('modal') === 'apply') setApplyModalOpen(true)
  }, [searchParams, location.key])
  const { showToast } = useToast()
  const [applied, setApplied] = useState(qa === 'applied')
  const [successModal, setSuccessModal] = useState(false)

  const isClosed = qa === 'closed' || campaign?.status === '종료'

  // 참여 조건 그룹화
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

  const handleApply = () => {
    if (applied) return
    setApplied(true)
    setApplyModalOpen(false)
    setSuccessModal(true)
    setTimeout(() => setSuccessModal(false), TIMER_MS.SUCCESS_MODAL_CLOSE)
  }

  if (qa === 'loading') {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-3xl mx-auto px-6 py-8 animate-pulse">
          {/* 뒤로가기 */}
          <div className="h-4 bg-gray-100 rounded-xl w-20 mb-6" />
          {/* 메인 카드 스켈레톤 */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
            {/* 이미지 배너 */}
            <div className="h-56 bg-gray-100" />
            <div className="p-6 space-y-4">
              {/* 브랜드 + 상태 */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-100 rounded-xl w-20" />
                  <div className="h-4 bg-gray-100 rounded-full w-12" />
                </div>
                <div className="h-8 bg-gray-100 rounded-xl w-20" />
              </div>
              {/* 제목 */}
              <div className="h-6 bg-gray-100 rounded-xl w-3/4" />
              <div className="h-4 bg-gray-100 rounded-xl w-full" />
              <div className="h-4 bg-gray-100 rounded-xl w-5/6" />
              {/* 기간 정보 박스 */}
              <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
                <div className="h-16 bg-gray-100 rounded-xl" />
                <div className="h-16 bg-gray-100 rounded-xl" />
              </div>
              {/* 채널 */}
              <div className="h-14 bg-gray-100 rounded-xl" />
              {/* 혜택 박스 */}
              <div className="h-14 bg-gray-100 rounded-xl" />
              {/* 신청 버튼 */}
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="캠페인 정보를 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  if (!campaign) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState
            message="캠페인을 찾을 수 없어요"
            onRetry={() => navigate('/campaigns/browse')}
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 뒤로가기 */}
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/campaigns/browse')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors duration-150"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          목록으로
        </button>

        {/* 메인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* 마감임박 띠 */}
          {campaign.status === '마감임박' && (
            <div className="bg-orange-500 text-white text-xs font-semibold text-center py-1.5 tracking-wide">
              신청 마감이 임박했어요!
            </div>
          )}
          {/* 이미지 배너 */}
          <div
            className="h-56 flex items-center justify-center text-8xl relative bg-brand-green/10"
          >
            {campaign.image}
          </div>

          <div className="p-6">
            {/* 브랜드 + 상태 */}
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 hover:bg-gray-50 ${
                  liked ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <Heart
                  size={16}
                  aria-hidden="true"
                  fill={liked ? SEMANTIC_COLORS.heart : 'none'}
                  color={liked ? SEMANTIC_COLORS.heart : SEMANTIC_COLORS.heartInactive}
                />
                <span className={`text-sm ${liked ? 'text-red-500' : 'text-gray-500'}`}>
                  {liked ? '관심등록됨' : '관심등록'}
                </span>
              </button>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h1>

            {/* 모집 현황 */}
            {(() => {
              const pct = Math.min(100, Math.round((campaign.applied / (campaign.headcount || 1)) * 100))
              return (
                <div className="mb-5 p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Users size={13} className="text-brand-green" />
                      모집 현황
                    </span>
                    <span className="text-xs text-gray-500">{campaign.applied}/{campaign.headcount}명</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 80 ? 'bg-orange-400' : 'bg-brand-green'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{pct}% 모집</p>
                </div>
              )
            })()}

            <p className="text-sm text-gray-600 mb-5">{campaign.description}</p>

            {/* 기간 정보 */}
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 mb-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <Calendar size={18} className="text-brand-green" aria-hidden="true" />
                <div>
                  <p className="text-xs text-gray-500">신청 마감</p>
                  <p className="text-sm font-semibold text-gray-900">{campaign.applyEnd}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <Clock size={18} className="text-brand-green" aria-hidden="true" />
                <div>
                  <p className="text-xs text-gray-500">게시 마감</p>
                  <p className="text-sm font-semibold text-gray-900">{campaign.postEnd}</p>
                </div>
              </div>
            </div>

            {/* 채널 */}
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-gray-50">
              <Users size={18} className="text-brand-green" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">모집 채널</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.channel}</p>
              </div>
            </div>

            {/* 보상 */}
            {campaign.reward && (
              <div className="mb-5 p-4 rounded-xl border border-brand-green/20 bg-brand-green/5 flex items-start gap-3">
                <Gift size={18} className="text-brand-green-text flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-brand-green-text mb-0.5">제공 혜택</p>
                  <p className="text-sm font-medium text-gray-900">{campaign.reward}</p>
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
                <div className="mb-6">
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
            {isClosed ? (
              <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-gray-200 text-gray-400 bg-gray-50">
                마감된 캠페인입니다
              </div>
            ) : applied ? (
              <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-brand-green text-brand-green bg-brand-green/5 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} aria-hidden="true" />
                신청완료
              </div>
            ) : (
              <button
                onClick={() => setApplyModalOpen(true)}
                className={`w-full py-3 rounded-xl text-sm font-medium text-white bg-brand-green transition-all duration-150 hover:opacity-90 ${
                  campaign.status === '마감임박' ? 'animate-pulse' : ''
                }`}
              >
                신청하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 신청 확인 모달 — 정책서 §신청 모달: 자기소개 입력 필드 추후 추가 예정 (API 연동 시) */}
      <Modal open={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="캠페인 신청">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{campaign.name}</span>에 신청하시겠습니까?
          </p>
          <div className="p-3 rounded-xl text-sm bg-brand-green/5 text-brand-green-text">
            신청 후 브랜드 검토 → 선정 결과 알림 → 제품 수령 → 콘텐츠 게시 순으로 진행됩니다.
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setApplyModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-150"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green transition-all duration-150 hover:opacity-90"
            >
              신청하기
            </button>
          </div>
        </div>
      </Modal>

      {/* 신청 완료 성공 모달 */}
      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          onKeyDown={e => e.key === 'Escape' && setSuccessModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 mx-4"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
          >
            <div
              className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center"
            >
              <CheckCircle2 size={40} className="text-brand-green" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p id="success-modal-title" className="text-lg font-bold text-gray-900">신청 완료!</p>
              <p className="text-sm text-gray-500 mt-1">브랜드 검토 후 결과를 알려드릴게요</p>
            </div>
            <button
              onClick={() => { setSuccessModal(false); navigate('/campaigns/my') }}
              className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-green transition-colors"
            >
              나의 캠페인 확인
            </button>
            <button
              onClick={() => { setSuccessModal(false); navigate('/campaigns/browse') }}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              계속 둘러보기
            </button>
          </div>
        </div>
      )}

    </Layout>
  )
}
