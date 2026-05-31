import { useNavigate } from 'react-router-dom'
import { Heart, Compass } from 'lucide-react'
import Layout from '../components/Layout'
import CampaignCard from '../components/CampaignCard'
import { useQAMode, EmptyState, ErrorState, Skeleton } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { mockCampaigns } from '../services/mock/campaigns'
import { useBookmarks, useApplications } from '../services/userState'

function FavoriteSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Skeleton shape="rect" className="aspect-video w-full" />
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2">
          <Skeleton shape="circle" height={16} width="3.5rem" />
          <Skeleton shape="circle" height={16} width="2.5rem" />
        </div>
        <Skeleton shape="text" height={16} width="80%" />
        <Skeleton shape="text" height={12} width="50%" />
        <div className="flex justify-between pt-2">
          <Skeleton shape="text" height={12} width="4rem" />
          <Skeleton shape="text" height={12} width="4rem" />
        </div>
      </div>
    </div>
  )
}

export default function Favorites() {
  const qa = useQAMode()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const bookmarks = useBookmarks()
  const applications = useApplications()

  const toggleBookmark = (id: number) => {
    const wasBookmarked = bookmarks.has(id)
    bookmarks.toggle(id)
    showToast(wasBookmarked ? '관심 캠페인에서 제거했어요' : '관심 캠페인에 추가했어요!', wasBookmarked ? 'info' : 'success')
  }

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
          <div className="grid grid-cols-1 @[640px]:grid-cols-2 @[1024px]:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map(i => <FavoriteSkeletonCard key={i} />)}
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
            <h2 className="text-[15px] font-semibold text-gray-900">관심 캠페인</h2>
            <p className="text-[15px] text-gray-500 mt-0.5">{visible.length}개 저장됨</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1.5 text-[15px] text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
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
                  className="px-5 py-2.5 rounded-xl text-[15px] font-medium text-white bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  캠페인 둘러보기
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 @[640px]:grid-cols-2 @[1024px]:grid-cols-3 gap-4">
            {visible.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                liked={bookmarks.has(c.id)}
                applied={applications.has(c.id)}
                onToggleLike={toggleBookmark}
                onCardClick={campaign => navigate(`/campaigns/${campaign.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
