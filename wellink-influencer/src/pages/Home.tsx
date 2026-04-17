import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Users, ChevronRight, Megaphone, Bookmark, XCircle, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { useQAMode } from '../utils/useQAMode'
import { useToast } from '../components/Toast'

interface BookmarkedCampaign {
  id: string
  name: string
  brand: string
  category: string
  channel: string
  deadline: string
  budget: string
  headcount: number
  applied: number
  status: '모집중' | '마감임박' | '종료'
  thumbnailColor: string
}

const bookmarkedCampaigns: BookmarkedCampaign[] = [
  {
    id: '1',
    name: '비건 단백질 쉐이크 체험단 모집',
    brand: '그린푸드',
    category: '맛집/푸드',
    channel: '인스타그램',
    deadline: '2026-04-20',
    budget: '제품 1개월분 무료 제공',
    headcount: 15,
    applied: 8,
    status: '모집중',
    thumbnailColor: '#C4B5FD',
  },
  {
    id: '2',
    name: '크로스핏 보충제 리뷰어 모집',
    brand: 'SMILEATO',
    category: '어필/스포츠',
    channel: '인스타그램/유튜브',
    deadline: '2026-04-25',
    budget: '보충제 풀패키지 + 활동비 10만원',
    headcount: 10,
    applied: 6,
    status: '모집중',
    thumbnailColor: '#86EFAC',
  },
  {
    id: '3',
    name: '프리미엄 요가매트 체험단',
    brand: 'ENUF',
    category: '어필/스포츠',
    channel: '인스타그램',
    deadline: '2026-04-18',
    budget: '요가매트 1개 제공',
    headcount: 5,
    applied: 3,
    status: '마감임박',
    thumbnailColor: '#93C5FD',
  },
]

function getDDay(deadline: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.round((new Date(deadline).getTime() - today.getTime()) / 86400000)
  if (diff <= 0) return { label: '마감', color: 'bg-gray-100 text-gray-400', pulse: false }
  if (diff <= 3) return { label: `D-${diff}`, color: 'bg-red-100 text-red-600', pulse: true }
  if (diff <= 7) return { label: `D-${diff}`, color: 'bg-orange-100 text-orange-600', pulse: false }
  return { label: `D-${diff}`, color: 'bg-gray-100 text-gray-500', pulse: false }
}

function statusBadge(status: BookmarkedCampaign['status']) {
  switch (status) {
    case '모집중': return 'bg-[#8CC63F]/10 text-[#5a8228]'
    case '마감임박': return 'bg-red-100 text-red-600'
    case '종료': return 'bg-gray-100 text-gray-400'
  }
}

export default function Home() {
  const qa = useQAMode()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedCampaigns.map(c => c.id)))

  const toggleBookmark = (id: string) => {
    const wasBookmarked = bookmarks.has(id)
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    addToast(wasBookmarked ? '관심 캠페인에서 제거되었습니다.' : '관심 캠페인에 추가되었습니다.', wasBookmarked ? 'info' : 'success')
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
          <XCircle size={44} className="text-red-300" />
          <p className="text-sm font-semibold text-gray-900">홈 정보를 불러오지 못했어요</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all duration-150"
            style={{ backgroundColor: '#8CC63F' }}
          >
            <RefreshCw size={14} />
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
            더 찾아보기 <ChevronRight size={12} />
          </button>
        </div>

        {visible.length === 0 ? (
          /* 빈 상태 */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <Heart size={24} className="text-red-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">관심 캠페인이 없어요</p>
            <p className="text-xs text-gray-400 mb-4">마음에 드는 캠페인에 북마크를 눌러보세요</p>
            <button
              onClick={() => navigate('/campaigns/browse')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
              style={{ backgroundColor: '#8CC63F' }}
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
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.thumbnailColor + '40' }}
                    >
                      <Megaphone size={18} style={{ color: c.thumbnailColor }} />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusBadge(c.status)}`}>
                          {c.status}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ddayColor} ${ddayPulse ? 'animate-pulse' : ''}`}>
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
                        className={bookmarks.has(c.id) ? 'text-[#8CC63F] fill-[#8CC63F]' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  {/* 하단 정보 */}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={11} />
                      <span>{c.applied}/{c.headcount}명</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progressPct}%`, backgroundColor: progressPct >= 80 ? '#EF4444' : '#8CC63F' }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={11} />
                      <span>{c.deadline}</span>
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
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[#5a8228] border border-[#8CC63F]/40 bg-[#8CC63F]/5 hover:bg-[#8CC63F]/10 transition-colors"
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
