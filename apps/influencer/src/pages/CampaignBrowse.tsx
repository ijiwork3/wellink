import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Layout from '../components/Layout'
import CampaignCard from '../components/CampaignCard'
import { mockCampaigns, BROWSE_CATEGORIES } from '../services/mock/campaigns'
import type { Campaign } from '../services/mock/campaigns'
import { useQAMode, useToast, ErrorState, EmptyState, Skeleton, BottomSheet, Pagination } from '@wellink/ui'
import { useBookmarks, useApplications } from '../services/userState'

function CampaignSkeletonCard() {
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

export default function CampaignBrowse() {
  const qa = useQAMode()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const bookmarks = useBookmarks()
  const applications = useApplications()
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 30
  // 인공 지연 제거 — 데이터는 정적 import이므로 즉시 표시. QA `?qa=loading`만 스켈레톤 노출.
  const loading = qa === 'loading'
  const [quickViewId, setQuickViewId] = useState<number | null>(qa === 'modal-detail' ? 1 : null)

  // PC·모바일 모두 동일하게 페이지 이동 (cold-review C1: 분기된 UX 통일)
  const handleCardClick = (campaign: Campaign) => {
    navigate(`/campaigns/${campaign.id}`)
  }

  // QA 파라미터 외부 동기화 (정책 §외부동기화)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (qa === 'empty-search') setSearch('검색결과없음xyz')
    if (qa === 'modal-detail') setQuickViewId(1)
  }, [qa])

  const toggleLike = (id: number) => {
    const wasBookmarked = bookmarks.has(id)
    bookmarks.toggle(id)
    showToast(wasBookmarked ? '관심 캠페인에서 제거했어요' : '관심 캠페인에 추가했어요!', wasBookmarked ? 'info' : 'success')
  }

  const baseFiltered = useMemo(() => {
    const filtered = mockCampaigns.filter(c => {
      const matchCat = selectedCategory === '전체' || c.category === selectedCategory
      const q = search.trim().toLowerCase()
      // A: 검색 범위 확대 — 원본 CampaignList.tsx L100-116 (name/brand/title/storeName/region/category/tags 7개)
      const matchSearch = !q || c.name.toLowerCase().includes(q)
        || c.brand.toLowerCase().includes(q)
        || (c.storeName ?? '').toLowerCase().includes(q)
        || (c.region ?? '').toLowerCase().includes(q)
        || c.category.toLowerCase().includes(q)
        || (c.tags ?? []).some(t => t.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
    return [...filtered].sort((a, b) =>
      new Date(a.applyEnd).getTime() - new Date(b.applyEnd).getTime()
    )
  }, [selectedCategory, search])

  const filtered = qa === 'empty' ? [] : baseFiltered

  // 필터·검색 변경 시 첫 페이지로 리셋
  useEffect(() => { setPage(1) }, [selectedCategory, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (qa === 'error') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="캠페인 목록을 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">진행 중인 캠페인</h1>
        <p className="text-sm text-gray-500 mt-0.5">당신의 채널과 잘 어울리는 브랜드를 찾아보세요</p>
      </div>

      <div className="pb-12">
        {/* 검색 */}
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="관심있는 브랜드나 키워드를 검색하세요"
            aria-label="캠페인 검색"
            autoComplete="off"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 bg-white text-base shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="검색어 지우기" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <X size={16} />
            </button>
          )}
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-5 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max">
            {BROWSE_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => { setSelectedCategory(cat); setSearch('') }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                  selectedCategory === cat
                    ? 'text-white bg-brand-green shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green-border hover:text-brand-green-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 수 */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4 mt-1">
            총 <strong className="text-gray-900">{filtered.length}</strong>개의 캠페인
            {totalPages > 1 && <span className="ml-1">({page}/{totalPages} 페이지)</span>}
          </p>
        )}

        {/* 카드 그리드 */}
        {loading ? (
          <div className="grid grid-cols-1 @[640px]:grid-cols-2 @[1024px]:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CampaignSkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 @[640px]:grid-cols-2 @[1024px]:grid-cols-3 gap-4">
              {paginated.map(c => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  liked={bookmarks.has(c.id)}
                  applied={applications.has(c.id)}
                  onToggleLike={toggleLike}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  total={filtered.length}
                  page={page}
                  pageSize={PAGE_SIZE}
                  onChange={p => {
                    setPage(p)
                    document.getElementById('main-content')?.closest('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            variant="search"
            title="검색 결과가 없어요"
            description="다른 키워드나 카테고리로 검색해 보세요"
            action={
              <button
                onClick={() => { setSearch(''); setSelectedCategory('전체') }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                전체 캠페인 보기
              </button>
            }
          />
        )}
      </div>

      {/* 퀵뷰 바텀시트 */}
      {(() => {
        const c = mockCampaigns.find(x => x.id === quickViewId)
        return (
          <BottomSheet
            open={quickViewId !== null}
            onClose={() => setQuickViewId(null)}
            label="캠페인 퀵뷰"
          >
            {c && (
              <div className="pb-4">
                <p className="text-sm text-gray-500 mb-1">{c.brand}</p>
                <h3 className="text-base font-bold text-gray-900 mb-3">{c.name}</h3>
                {c.reward && (
                  <div className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-brand-green-bg border border-brand-green-border">
                    <span className="text-sm font-medium text-gray-700 break-keep"><span aria-hidden="true">🎁</span> {c.reward}</span>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-green text-white whitespace-nowrap">{c.category}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">{c.channel}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap tabular-nums">{c.applied}/{c.headcount}명 모집</span>
                </div>
                <button
                  onClick={() => { setQuickViewId(null); navigate(`/campaigns/${c.id}`) }}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                >
                  상세보기 · 신청하기
                </button>
              </div>
            )}
          </BottomSheet>
        )
      })()}

    </Layout>
  )
}
