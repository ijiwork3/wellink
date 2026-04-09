import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Calendar, Clock, Users, CheckCircle2, Gift, Search } from 'lucide-react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { StatusBadge, PlatformBadge } from '../components/Badge'
import { campaigns } from '../data/campaigns'

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const campaign = campaigns.find((c) => c.id === Number(id))

  const [liked, setLiked] = useState(false)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [applied, setApplied] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleApply = () => {
    setApplied(true)
    setApplyModalOpen(false)
    setSuccessModal(true)
    setTimeout(() => setSuccessModal(false), 2500)
  }

  if (!campaign) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">캠페인을 찾을 수 없어요</p>
          <p className="text-xs text-gray-400 mb-4">잘못된 링크이거나 삭제된 캠페인이에요</p>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
            style={{ backgroundColor: '#8CC63F' }}
          >
            캠페인 목록으로
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors duration-150"
        >
          <ArrowLeft size={16} />
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
            className="h-56 flex items-center justify-center text-8xl relative"
            style={{ backgroundColor: '#f0fce8' }}
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
                  showToast(liked ? '관심 등록을 취소했어요' : '관심 캠페인에 등록되었어요!')
                }}
                aria-pressed={liked}
                aria-label={liked ? '관심 캠페인 해제' : '관심 캠페인 등록'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 hover:bg-gray-50 ${
                  liked ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <Heart
                  size={16}
                  fill={liked ? '#ef4444' : 'none'}
                  color={liked ? '#ef4444' : '#9ca3af'}
                />
                <span className={`text-sm ${liked ? 'text-red-500' : 'text-gray-500'}`}>
                  {liked ? '관심등록됨' : '관심등록'}
                </span>
              </button>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
            <p className="text-sm text-gray-600 mb-5">{campaign.description}</p>

            {/* 기간 정보 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <Calendar size={18} style={{ color: '#8CC63F' }} />
                <div>
                  <p className="text-xs text-gray-500">신청 마감</p>
                  <p className="text-sm font-semibold text-gray-900">{campaign.applyEnd}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <Clock size={18} style={{ color: '#8CC63F' }} />
                <div>
                  <p className="text-xs text-gray-500">게시 마감</p>
                  <p className="text-sm font-semibold text-gray-900">{campaign.postEnd}</p>
                </div>
              </div>
            </div>

            {/* 채널 */}
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-gray-50">
              <Users size={18} style={{ color: '#8CC63F' }} />
              <div>
                <p className="text-xs text-gray-500">모집 채널</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.channel}</p>
              </div>
            </div>

            {/* 보상 */}
            {campaign.reward && (
              <div className="mb-5 p-4 rounded-xl border border-green-200 bg-green-50 flex items-start gap-3">
                <Gift size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-0.5">제공 혜택</p>
                  <p className="text-sm font-medium text-gray-900">{campaign.reward}</p>
                </div>
              </div>
            )}

            {/* 참여 조건 */}
            {campaign.conditions && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">참여 조건</p>
                <ul className="space-y-2">
                  {campaign.conditions.map((cond, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#8CC63F' }} />
                      {cond}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 신청 버튼 */}
            {applied ? (
              <div className="w-full py-3 rounded-xl text-sm font-medium text-center border border-[#8CC63F] text-[#8CC63F] bg-[#8CC63F]/5 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                신청 완료
              </div>
            ) : (
              <button
                onClick={() => setApplyModalOpen(true)}
                className={`w-full py-3 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90 ${
                  campaign.status === '마감임박' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: '#8CC63F' }}
              >
                신청하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 신청 확인 모달 */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="캠페인 신청">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{campaign.name}</span>에 신청하시겠습니까?
          </p>
          <div className="p-3 rounded-xl text-sm bg-green-50 text-green-700">
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
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
              style={{ backgroundColor: '#8CC63F' }}
            >
              신청하기
            </button>
          </div>
        </div>
      </Modal>

      {/* 신청 완료 성공 모달 */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 mx-4"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#f0fce8' }}
            >
              <CheckCircle2 size={40} style={{ color: '#8CC63F' }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">신청 완료!</p>
              <p className="text-sm text-gray-500 mt-1">브랜드 검토 후 결과를 알려드릴게요</p>
            </div>
            <button onClick={() => setSuccessModal(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors" aria-label="닫기">닫기</button>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg min-w-[260px]"
          style={{ animation: 'slideInRight 0.2s ease-out' }}
        >
          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900">{toast}</span>
        </div>
      )}
    </Layout>
  )
}
