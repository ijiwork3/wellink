/**
 * PostContentTable — ProfileInsight 게시물별 상세 성과 테이블
 *
 * ProfileInsight 메인 컴포넌트에서 분리. 내부에 SortBtn / PostDetailModal / MetricCell 포함.
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Layers, Play, Image as ImageIcon } from 'lucide-react'
import { Modal, Pagination, Tabs, fmtNumber, ENGAGEMENT_THRESHOLD } from '@wellink/ui'
import { POST_DATA, type PostItem, type PostType, type PostSortKey } from '../../../data/analytics/profile'

const TYPE_LABEL: Record<PostType, string> = { reels: 'Reels', feed: 'Feed', carousel: 'Carousel' }
const TYPE_COLOR: Record<PostType, string> = {
  reels:    'bg-rose-50 text-rose-600',
  carousel: 'bg-blue-50 text-blue-600',
  feed:     'bg-gray-100 text-gray-600',
}

// ── 작은 셀 표시기 ──────────────────────────────────────────────────────────
function MetricCell({ label, value, color = 'bg-gray-50' }: { label: string; value: string; color?: string }) {
  return (
    <div className={`${color} rounded-xl p-3`}>
      <p className="text-[15px] text-gray-500 mb-1">{label}</p>
      <p className="text-[15px] font-bold text-gray-900">{value}</p>
    </div>
  )
}

// ── 정렬 헤더 버튼 ──────────────────────────────────────────────────────────
function SortBtn({ k, label, sortKey, sortDir, onSort }: {
  k: PostSortKey; label: string
  sortKey: PostSortKey; sortDir: 'asc' | 'desc'
  onSort: (k: PostSortKey) => void
}) {
  const ariaSortValue = sortKey === k ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'
  return (
    <th scope="col"
      tabIndex={0}
      aria-sort={ariaSortValue}
      className="text-left text-[15px] font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap cursor-pointer hover:bg-gray-100/50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/50"
      onClick={() => onSort(k)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(k) } }}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={sortKey === k ? 'text-gray-700' : 'text-gray-300'} aria-hidden="true">
          {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
        </span>
      </span>
    </th>
  )
}

// ── 게시물 상세 모달 ────────────────────────────────────────────────────────
function PostDetailModal({ post, onClose }: { post: PostItem | null; onClose: () => void }) {
  const fmtSec = (s: number) => s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`
  const fmtTotalWatch = (avgSec: number, plays: number) => {
    const totalMin = Math.floor(avgSec * plays / 60)
    if (totalMin >= 60) return `${Math.floor(totalMin / 60)}시간 ${totalMin % 60}분`
    return `${totalMin}분`
  }

  return (
    <Modal
      open={post !== null}
      onClose={onClose}
      size="md"
      label="게시물 상세 성과"
      title={post ? `${TYPE_LABEL[post.type]} · ${post.uploadDate}` : undefined}
    >
      {post && (
        <div className="space-y-5">
          {/* 타입 배지 */}
          <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLOR[post.type]}`}>
            {TYPE_LABEL[post.type]}
          </span>
          {/* 참여율 하이라이트 */}
          <div className="bg-brand-green-bg rounded-xl p-4 flex items-center gap-4">
            <div>
              <p className="text-[15px] text-gray-500 mb-0.5">참여율</p>
              <p className="text-3xl font-bold text-brand-green-text">{post.engagementRate}%</p>
            </div>
            <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full"
                style={{ width: `${Math.min(100, post.engagementRate * 10)}%` }} />
            </div>
          </div>
          {/* 핵심 지표 */}
          <div>
            <h2 className="text-[15px] font-semibold text-gray-700 mb-3">핵심 지표</h2>
            <div className="grid grid-cols-3 gap-2">
              <MetricCell label="좋아요"  value={fmtNumber(post.likes)} />
              <MetricCell label="댓글"    value={fmtNumber(post.comments)} />
              <MetricCell label="저장"    value={fmtNumber(post.saves)} />
              <MetricCell label="도달"    value={fmtNumber(post.reach)} />
              <MetricCell label="노출"    value={fmtNumber(post.impressions)} />
              <MetricCell label="총 참여" value={fmtNumber(post.likes + post.comments + post.saves)} />
            </div>
          </div>
          {/* 릴스 전용 */}
          {post.type === 'reels' && (
            <div>
              <h2 className="text-[15px] font-semibold text-gray-700 mb-3">릴스 인사이트</h2>
              <div className="grid grid-cols-2 gap-2">
                <MetricCell label="조회수"       value={fmtNumber(post.views)}                                                                          color="bg-rose-50" />
                <MetricCell label="다시 보기"    value={fmtNumber(post.replays ?? 0)}                                                                   color="bg-rose-50" />
                <MetricCell label="평균 시청"    value={post.avgWatchTimeSec ? fmtSec(post.avgWatchTimeSec) : '—'}                                      color="bg-rose-50" />
                <MetricCell label="총 시청 시간" value={post.avgWatchTimeSec && post.views > 0 ? fmtTotalWatch(post.avgWatchTimeSec, post.views) : '—'} color="bg-rose-50" />
              </div>
            </div>
          )}
          {/* 피드·카루셀 전용 */}
          {(post.type === 'feed' || post.type === 'carousel') && (
            <div>
              <h2 className="text-[15px] font-semibold text-gray-700 mb-3">피드 인사이트</h2>
              <div className="grid grid-cols-2 gap-2">
                <MetricCell label="프로필 방문" value={fmtNumber(post.profileVisits ?? 0)} color="bg-blue-50" />
                <MetricCell label="팔로우"       value={fmtNumber(post.follows ?? 0)}       color="bg-blue-50" />
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

// ── 메인 테이블 ─────────────────────────────────────────────────────────────
// 유형 탭 필터 + 컬럼 정렬 + 페이지네이션 + 클릭→상세 모달 — 원본 ContentPerformance 동등
export default function PostContentTable() {
  const [activeType, setActiveType] = useState<'all' | PostType>('all')
  const [sortKey, setSortKey]       = useState<PostSortKey>('date')
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc')
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState<PostItem | null>(null)
  const PAGE_SIZE = 10

  const postScrollRef = useRef<HTMLDivElement>(null)
  const [postCanScrollLeft,  setPostCanScrollLeft]  = useState(false)
  const [postCanScrollRight, setPostCanScrollRight] = useState(false)
  useEffect(() => {
    const el = postScrollRef.current
    if (!el) return
    const update = () => {
      setPostCanScrollLeft(el.scrollLeft > 0)
      setPostCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  // 필터·정렬 결과 useMemo — 100개 정렬을 매 렌더 반복 방지
  const sorted = useMemo(() => {
    const filtered = activeType === 'all' ? POST_DATA : POST_DATA.filter(p => p.type === activeType)
    return [...filtered].sort((a, b) => {
      const val = (item: PostItem): number => {
        switch (sortKey) {
          case 'date':        return new Date(item.uploadDate).getTime()
          case 'views':       return item.views
          case 'reach':       return item.reach
          case 'impressions': return item.impressions
          case 'likes':       return item.likes
          case 'comments':    return item.comments
          case 'saves':       return item.saves
          case 'engagement':  return item.engagementRate
          default:            return 0
        }
      }
      return sortDir === 'desc' ? val(b) - val(a) : val(a) - val(b)
    })
  }, [activeType, sortKey, sortDir])

  const safePage = Math.min(page, Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)))
  const paged    = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSort = (key: PostSortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const TYPE_TABS: { value: 'all' | PostType; label: string }[] = [
    { value: 'all',      label: '전체' },
    { value: 'reels',    label: 'Reels' },
    { value: 'feed',     label: 'Feed' },
    { value: 'carousel', label: 'Carousel' },
  ]
  const TYPE_ICON: Record<PostType, React.ReactNode> = {
    reels:    <Play      size={12} className="inline mr-0.5" />,
    carousel: <Layers    size={12} className="inline mr-0.5" />,
    feed:     <ImageIcon size={12} className="inline mr-0.5" />,
  }

  return (
    <>
      <PostDetailModal post={selected} onClose={() => setSelected(null)} />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">콘텐츠 성과</h2>
            <p className="text-[15px] text-gray-500 mt-0.5">
              게시물별 상세 지표를 확인하세요
            </p>
          </div>
        </div>
        {/* 유형 탭 필터 — 가로 스크롤 + 쉐브론 (Tabs 컴포넌트) */}
        <div className="px-5 py-3 border-b border-gray-50">
          <Tabs
            variant="soft"
            value={activeType}
            onChange={(v) => { setActiveType(v as 'all' | PostType); setPage(1) }}
            ariaLabel="게시물 유형 필터"
            items={TYPE_TABS.map(tab => ({
              value: tab.value,
              label: tab.label,
              trailing: tab.value !== 'all'
                ? <span className="text-[15px] opacity-60 tabular-nums">{POST_DATA.filter(p => p.type === tab.value).length}</span>
                : undefined,
            }))}
          />
        </div>
        {/* 테이블 */}
        <div className="relative">
          {postCanScrollLeft  && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
          {postCanScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
          {postCanScrollLeft && (
            <button type="button" onClick={() => postScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
              aria-label="왼쪽으로 스크롤"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
          )}
          {postCanScrollRight && (
            <button type="button" onClick={() => postScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
              aria-label="오른쪽으로 스크롤"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          )}
          <div className="overflow-x-auto scrollbar-none" ref={postScrollRef}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th scope="col" className="text-center text-[15px] font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap w-12">No</th>
                <th scope="col" className="text-left text-[15px] font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap w-20">썸네일</th>
                <th scope="col" className="text-left text-[15px] font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap">유형</th>
                <SortBtn k="date"       label="날짜"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="views"      label="조회수"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="reach"      label="도달"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="impressions" label="노출"   sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="likes"      label="좋아요"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="comments"   label="댓글"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="saves"      label="저장"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortBtn k="engagement" label="참여율"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {paged.map((p, idx) => (
                <tr key={p.id}
                  className="group border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(p)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(p) } }}
                >
                  <td className="py-3 px-4 text-center text-[15px] text-gray-400 font-medium tabular-nums">{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden ring-1 ring-gray-200/60 shadow-sm group-hover:shadow-md transition-all">
                      <img
                        src={p.thumbnail}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLOR[p.type]}`}>
                      {TYPE_ICON[p.type]}
                      {p.type.charAt(0).toUpperCase() + p.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[15px] text-gray-500 whitespace-nowrap tabular-nums">{p.uploadDate}</td>
                  <td className="py-3 px-4 text-[15px] text-gray-700 whitespace-nowrap tabular-nums">
                    {p.views > 0 ? fmtNumber(p.views) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-[15px] text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.reach)}</td>
                  <td className="py-3 px-4 text-[15px] text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.impressions)}</td>
                  <td className="py-3 px-4 text-[15px] text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.likes)}</td>
                  <td className="py-3 px-4 text-[15px] text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.comments)}</td>
                  <td className="py-3 px-4 text-[15px] text-gray-700 whitespace-nowrap tabular-nums">{fmtNumber(p.saves)}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`text-[15px] font-bold tabular-nums ${
                      p.engagementRate >= ENGAGEMENT_THRESHOLD.high ? 'text-brand-green-text'
                      : p.engagementRate < 2.5 ? 'text-red-500'
                      : 'text-gray-700'
                    }`}>
                      {p.engagementRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[15px] text-gray-500">게시물이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        <Pagination total={sorted.length} page={safePage} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </>
  )
}
