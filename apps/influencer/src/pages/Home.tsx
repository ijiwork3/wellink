import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Users, ChevronRight, Megaphone, Bookmark, XCircle, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { useQAMode, fmtDate, getDDay, StatusBadge } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { mockBookmarkedCampaigns } from '../services/mock/campaigns'

const bookmarkedCampaigns = mockBookmarkedCampaigns


function ddayBgClass(textColor: string): string {
  if (textColor.includes('red'))    return 'bg-red-100'
  if (textColor.includes('orange')) return 'bg-orange-100'
  return 'bg-gray-100'
}

export default function Home() {
  const qa = useQAMode()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedCampaigns.map(c => c.id)))

  const toggleBookmark = (id: string) => {
    const wasBookmarked = bookmarks.has(id)
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    showToast(wasBookmarked ? '관심 캠페인에서 제거되었습니다.' : '관심 캠페인에 추가되었습니다.', wasBookmarked ? 'info' : 'success')
  }

  const baseVisible = bookmarkedCampaigns.filter(c => bookmarks.has(c.id))
  const visible = qa === 'empty' ? [] : baseVisible

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          {/* 헤더 스켈레톤 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-100 rounded-xl w-24 mb-1.5" />
              <div className="h-3 bg-gray-100 rounded-xl w-16" />
            </div>
            <div className="h-7 bg-gray-100 rounded-xl w-20" />
          </div>
          {/* 캠페인 카드 스켈레톤 3개 */}
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-100 rounded-full w-12" />
                    <div className="h-4 bg-gray-100 rounded-full w-10" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded-xl w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
                </div>
                <div className="w-6 h-6 bg-gray-100 rounded-xl flex-shrink-0" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 bg-gray-100 rounded-xl w-14" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full" />
                <div className="h-3 bg-gray-100 rounded-xl w-20" />
              </div>
              <div className="flex justify-end gap-2">
                <div className="h-7 bg-gray-100 rounded-xl w-16" />
                <div className="h-7 bg-gray-100 rounded-xl w-16" />
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
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-900">홈 정보를 불러오지 못했어요</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all duration-150 bg-brand-green"
          >
            <RefreshCw size={14} aria-hidden="true" />
            다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">관심 캠페인</h2>
            <p className="text-xs text-gray-400 mt-0.5">관심 캠페인 {visible.length}개</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            더 찾아보기 <ChevronRight size={12} aria-hidden="true" />
          </button>
        </div>

        {visible.length === 0 ? (
          /* 빈 상태 */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <Heart size={24} className="text-red-300" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">관심 캠페인이 없어요</p>
            <p className="text-xs text-gray-400 mb-4">마음에 드는 캠페인에 북마크를 눌러보세요</p>
            <button
              onClick={() => navigate('/campaigns/browse')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90 bg-brand-green"
            >
              캠페인 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(c => {
              const { label: ddayLabel, color: ddayColor, pulse: ddayPulse } = getDDay(c.deadline)
              const progressPct = Math.min(100, Math.round((c.applied / (c.headcount || 1)) * 100))
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* 썸네일 */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.thumbnailClass}`}
                    >
                      <Megaphone size={18} className={c.thumbnailTextClass} aria-hidden="true" />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <StatusBadge status={c.status} dot={false} size="sm" />
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ddayBgClass(ddayColor)} ${ddayColor} ${ddayPulse ? 'animate-pulse' : ''}`}>
                          {ddayLabel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.brand} · {c.channel} · {c.category}</p>
                    </div>

                    {/* 북마크 버튼 */}
                    <button
                      onClick={() => toggleBookmark(c.id)}
                      aria-label={bookmarks.has(c.id) ? '북마크 해제' : '북마크'}
                      className="shrink-0 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Bookmark
                        size={16}
                        aria-hidden="true"
                        className={bookmarks.has(c.id) ? 'text-brand-green fill-brand-green' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  {/* 하단 정보 */}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={11} aria-hidden="true" />
                      <span>{c.applied}/{c.headcount}명</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progressPct >= 80 ? 'bg-red-500' : 'bg-brand-green'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={11} aria-hidden="true" />
                      <span>{fmtDate(c.deadline)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/campaigns/${c.id}`)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      상세보기
                    </button>
                    <button
                      onClick={() => navigate(`/campaigns/${c.id}`)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-brand-green-text border border-brand-green/40 bg-brand-green/5 hover:bg-brand-green/10 transition-colors"
                    >
                      신청하기
                    </button>
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
