import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Users, Gift, Bookmark, XCircle, RefreshCw, Compass } from 'lucide-react'
import Layout from '../components/Layout'
import { useQAMode, fmtDate, getDDay } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { mockBookmarkedCampaigns } from '../services/mock/campaigns'
import type { BookmarkedCampaign } from '../services/mock/campaigns'

const STATUS_STYLE: Record<string, string> = {
  '모집중':   'bg-brand-green/10 text-brand-green-text',
  '마감임박': 'bg-orange-50 text-orange-600',
  '종료':     'bg-gray-100 text-gray-400',
}

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
    showToast(wasBookmarked ? '관심 캠페인에서 제거했어요.' : '관심 캠페인에 추가했어요!', wasBookmarked ? 'info' : 'success')
  }

  const visible: BookmarkedCampaign[] = qa === 'empty' ? [] : mockBookmarkedCampaigns.filter(c => bookmarks.has(c.id))

  if (qa === 'loading') {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-100 rounded-xl w-28" />
            <div className="h-7 bg-gray-100 rounded-xl w-24" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-100 rounded-full w-14" />
                    <div className="h-4 bg-gray-100 rounded-full w-10" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded-xl w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-xl w-1/2" />
                </div>
                <div className="w-7 h-7 bg-gray-100 rounded-full shrink-0" />
              </div>
              <div className="h-8 bg-gray-100 rounded-xl" />
              <div className="flex gap-3 items-center">
                <div className="h-3 bg-gray-100 rounded-xl w-16" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full" />
                <div className="h-3 bg-gray-100 rounded-xl w-14" />
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
          <XCircle size={44} className="text-red-300" />
          <p className="text-sm font-semibold text-gray-900">관심 캠페인을 불러오지 못했어요</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green">
            <RefreshCw size={14} />다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">관심 캠페인</h2>
            <p className="text-xs text-gray-400 mt-0.5">{visible.length}개 저장됨</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/browse')}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Compass size={12} />
            캠페인 탐색
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <Heart size={24} className="text-red-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">저장한 캠페인이 없어요</p>
              <p className="text-xs text-gray-400 mt-0.5">마음에 드는 캠페인에 북마크를 눌러보세요</p>
            </div>
            <button onClick={() => navigate('/campaigns/browse')} className="mt-1 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:opacity-90 transition-opacity">
              캠페인 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(c => {
              const { label: ddayLabel, color: ddayColor } = getDDay(c.deadline)
              const progressPct = Math.min(100, Math.round((c.applied / (c.headcount || 1)) * 100))
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all duration-150"
                  onClick={() => navigate(`/campaigns/${c.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: c.thumbnailBg }}
                    >
                      {c.thumbnailEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {c.status}
                        </span>
                        <span className={`text-[10px] font-medium ${ddayColor}`}>{ddayLabel}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.brand} · {c.channel}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark(c.id) }}
                      aria-label={bookmarks.has(c.id) ? '북마크 해제' : '북마크'}
                      className="shrink-0 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Bookmark
                        size={16}
                        className={bookmarks.has(c.id) ? 'text-brand-green fill-brand-green' : 'text-gray-300'}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 rounded-lg bg-brand-green/5 border border-brand-green/10">
                    <Gift size={11} className="text-brand-green shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate">{c.reward}</span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                      <Users size={11} />{c.applied}/{c.headcount}명
                    </span>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progressPct >= 80 ? 'bg-orange-400' : 'bg-brand-green'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">마감 {fmtDate(c.deadline)}</span>
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
