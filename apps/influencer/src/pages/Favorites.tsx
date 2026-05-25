import { useNavigate } from 'react-router-dom'
import { Heart, Compass } from 'lucide-react'
import Layout from '../components/Layout'
import { useQAMode, EmptyState, ErrorState, Skeleton, getDDay, getDDayBadgeStyle } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { fmtDate } from '@wellink/ui'
import { mockCampaigns } from '../services/mock/campaigns'
import { useBookmarks } from '../services/userState'

/** 원본 mypage L772-789: getCampaignStatus — participateEndDate 기반 모집중/종료됨 */
function getRecruitChip(applyEnd?: string): { label: string; className: string } | null {
  if (!applyEnd) return null
  const end = new Date(applyEnd)
  if (isNaN(end.getTime())) return null
  end.setHours(23, 59, 59, 999)
  if (end >= new Date()) return { label: '모집중', className: 'bg-lime-100 text-lime-700' }
  return { label: '종료됨', className: 'bg-gray-100 text-gray-500' }
}

export default function Favorites() {
  const qa = useQAMode()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const bookmarks = useBookmarks()

  const toggleBookmark = (id: number) => {
    const wasBookmarked = bookmarks.has(id)
    bookmarks.toggle(id)
    showToast(wasBookmarked ? '관심 캠페인에서 제거했어요' : '관심 캠페인에 추가했어요!', wasBookmarked ? 'info' : 'success')
  }

  // 마스터(mockCampaigns)에서 북마크 ID만 필터링 — 단일 출처
  const visible = qa === 'empty'
    ? []
    : mockCampaigns.filter(c => bookmarks.has(c.id))

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton shape="text" height={20} width="7rem" />
            <Skeleton shape="card" height={28} width="6rem" />
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex gap-3">
                  <Skeleton shape="rect" className="w-[72px] h-[72px] rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex gap-2">
                      <Skeleton shape="circle" height={18} width="3.5rem" />
                      <Skeleton shape="circle" height={18} width="2.5rem" />
                    </div>
                    <Skeleton shape="text" height={15} width="85%" />
                    <Skeleton shape="text" height={12} width="55%" />
                    <Skeleton shape="text" height={12} width="40%" />
                  </div>
                  <Skeleton shape="circle" height={32} width={32} className="flex-shrink-0 self-start" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="관심 캠페인을 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="sr-only">관심 캠페인</h1>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">관심 캠페인</h2>
            <p className="text-sm text-gray-500 mt-0.5">{visible.length}개 저장됨</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            <Compass size={14} />
            캠페인 탐색
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12">
            <EmptyState
              icon={<Heart size={32} className="text-red-300" aria-hidden="true" />}
              title="저장한 캠페인이 없어요"
              description="마음에 드는 캠페인에 북마크를 눌러보세요"
              action={
                <button
                  onClick={() => navigate('/campaigns/browse')}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  캠페인 둘러보기
                </button>
              }
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map(c => {
              const dday = c.applyEnd ? getDDay(c.applyEnd) : null
              const recruitChip = getRecruitChip(c.applyEnd)
              const isBookmarked = bookmarks.has(c.id)

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/campaigns/${c.id}`)}
                >
                  <div className="p-4">
                    <div className="flex gap-3">
                      {/* 썸네일 */}
                      <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {c.image}
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        {/* 배지 행: 모집상태 + D-day */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {recruitChip && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap ${recruitChip.className}`}>
                              {recruitChip.label}
                            </span>
                          )}
                          {dday && (
                            <span className={getDDayBadgeStyle(dday.color, dday.pulse)}>
                              {dday.label}
                            </span>
                          )}
                        </div>

                        {/* 캠페인명 */}
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
                          {c.name}
                        </h3>

                        {/* 브랜드 · 보상 */}
                        <p className="text-xs text-gray-500 truncate">
                          {c.brand}
                          {c.rewardAmount != null && ` · ${c.rewardAmount.toLocaleString('ko-KR')}원 상당 혜택`}
                        </p>

                        {/* 모집 · 마감일 */}
                        <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                          모집 {c.headcount}명 · 마감 {fmtDate(c.applyEnd)}
                        </p>
                      </div>

                      {/* 북마크 버튼 */}
                      <button
                        aria-label={isBookmarked ? '관심 캠페인 해제' : '관심 캠페인 추가'}
                        onClick={e => { e.stopPropagation(); toggleBookmark(c.id) }}
                        className="flex-shrink-0 self-start p-1 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                      >
                        <Heart
                          size={20}
                          className={isBookmarked ? 'text-red-400 fill-red-400' : 'text-gray-300'}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
