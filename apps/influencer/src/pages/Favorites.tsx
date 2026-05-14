import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Users, Gift, Bookmark, Compass } from 'lucide-react'
import Layout from '../components/Layout'
import { useQAMode, fmtDate, getDDay, EmptyState, ErrorState, PROGRESS_THRESHOLD, Skeleton, StatusBadge } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { mockBookmarkedCampaigns } from '../services/mock/campaigns'
import type { BookmarkedCampaign } from '../services/mock/campaigns'

export default function Favorites() {
  const qa = useQAMode()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(mockBookmarkedCampaigns.map(c => c.id)))

  const toggleBookmark = (id: string) => {
    const wasBookmarked = bookmarks.has(id)
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
    showToast(wasBookmarked ? '관심 캠페인에서 제거했어요' : '관심 캠페인에 추가했어요!', wasBookmarked ? 'info' : 'success')
  }

  const visible: BookmarkedCampaign[] = qa === 'empty' ? [] : mockBookmarkedCampaigns.filter(c => bookmarks.has(c.id))

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton shape="text" height={20} width="7rem" />
            <Skeleton shape="card" height={28} width="6rem" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton shape="card" height={56} width={56} className="shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton shape="circle" height={16} width="3.5rem" />
                    <Skeleton shape="circle" height={16} width="2.5rem" />
                  </div>
                  <Skeleton shape="text" height={16} width="75%" />
                  <Skeleton shape="text" height={12} width="50%" />
                </div>
                <Skeleton shape="circle" height={28} width={28} className="shrink-0" />
              </div>
              <Skeleton shape="card" height={32} width="100%" />
              <div className="flex gap-3 items-center">
                <Skeleton shape="text" height={12} width="4rem" />
                <Skeleton shape="circle" height={6} className="flex-1" />
                <Skeleton shape="text" height={12} width="3.5rem" />
              </div>
            </div>
          ))}
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">관심 캠페인</h1>
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
          <div className="space-y-3">
            {visible.map(c => {
              const { label: ddayLabel, color: ddayColor } = getDDay(c.deadline)
              const progressPct = Math.min(100, Math.round((c.applied / (c.headcount || 1)) * 100))
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                  onClick={() => navigate(`/campaigns/${c.id}`)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/campaigns/${c.id}`) } }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: c.thumbnailBg }}
                      aria-hidden="true"
                    >
                      {c.thumbnailEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <StatusBadge status={c.status} size="sm" dot={false} />
                        <span className={`text-sm font-medium ${ddayColor}`}>{ddayLabel}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{c.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{c.brand} · {c.channel}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark(c.id) }}
                      aria-label={bookmarks.has(c.id) ? '북마크 해제' : '북마크'}
                      className="shrink-0 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      <Bookmark
                        size={16}
                        className={bookmarks.has(c.id) ? 'text-brand-green fill-brand-green' : 'text-gray-300'}
                      />
                    </button>
                  </div>

                  <div className="flex items-start gap-1.5 mt-3 px-2.5 py-1.5 rounded-lg bg-brand-green-bg border border-brand-green-border">
                    <Gift size={14} className="text-brand-green shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-700 line-clamp-2 break-keep">{c.reward}</span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-gray-500 shrink-0 tabular-nums whitespace-nowrap">
                      <Users size={14} aria-hidden="true" />{c.applied}/{c.headcount}명
                    </span>
                    <div className="flex-1 min-w-0 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progressPct >= PROGRESS_THRESHOLD.warning ? 'bg-orange-400' : 'bg-brand-green'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 shrink-0 tabular-nums whitespace-nowrap">마감 {fmtDate(c.deadline)}</span>
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
