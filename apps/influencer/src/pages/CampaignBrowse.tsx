import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import Layout from '../components/Layout'
import CampaignCard from '../components/CampaignCard'
import { mockCampaigns, BROWSE_CATEGORIES } from '../services/mock/campaigns'
import type { Campaign } from '../services/mock/campaigns'
import { useQAMode, CustomSelect, ChipSelect, useToast, ErrorState, EmptyState, Skeleton, BottomSheet } from '@wellink/ui'
import { useBookmarks, useApplications } from '../services/userState'
import { BRAND_URL, HELP_EMAIL, TERMS_URL } from '../config/urls'

type SortKey = 'deadline' | 'reward' | 'recent'

function CampaignSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Skeleton shape="rect" height={144} width="100%" />
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2">
          <Skeleton shape="circle" height={16} width="3.5rem" />
          <Skeleton shape="circle" height={16} width="2.5rem" />
        </div>
        <Skeleton shape="text" height={12} width="25%" />
        <Skeleton shape="text" height={16} width="80%" />
        <Skeleton shape="card" height={32} width="100%" className="mt-1" />
        <div className="flex justify-between">
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
  const location = useLocation()
  // navigation key가 'default'면 탭/북마크 직접 진입 → 일반 헤더
  // 앱 내부 navigate()로 진입했으면 뒤로가기 헤더
  const showBack = location.key !== 'default'
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const bookmarks = useBookmarks()
  const applications = useApplications()
  const [sort, setSort] = useState<SortKey>('deadline')
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
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'reward') return (b.rewardAmount ?? 0) - (a.rewardAmount ?? 0)
      if (sort === 'recent') return b.id - a.id
      // deadline: 마감 임박순
      return new Date(a.applyEnd).getTime() - new Date(b.applyEnd).getTime()
    })
  }, [selectedCategory, search, sort])

  const filtered = qa === 'empty' ? [] : baseFiltered

  if (qa === 'error') {
    return (
      <Layout showSidebar={false} showBottomTab pageTitle="진행 중인 캠페인" onBack={showBack ? () => navigate(-1) : undefined}>
        <div className="flex items-center justify-center min-h-[350px]">
          <ErrorState message="캠페인 목록을 불러오지 못했어요" onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false} showBottomTab pageTitle="진행 중인 캠페인" onBack={showBack ? () => navigate(-1) : undefined}>
      {/* 헤더 */}
      <div className="px-4 @[640px]:px-6 pt-8 pb-5 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-1">진행 중인 캠페인</h1>
          <p className="text-sm text-gray-500">당신의 채널과 잘 어울리는 브랜드를 찾아보세요</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 @[640px]:px-6 pb-12">
        {/* 검색 + 필터 */}
        <div className="mb-5 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="캠페인 또는 브랜드 검색"
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
          <button
            onClick={() => showToast('상세 필터 기능은 준비 중이에요', 'info')}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-gray-500 shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            aria-label="상세 필터"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* 카테고리 탭 + 정렬 */}
        <div className="mb-5 flex items-start gap-2">
          <ChipSelect
            options={BROWSE_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
            value={selectedCategory}
            onChange={v => { setSelectedCategory(v); setSearch('') }}
            className="flex-1"
            selectClassName="w-full"
          />
          <CustomSelect
            value={sort}
            onChange={v => setSort(v as SortKey)}
            options={[
              { label: '마감 임박순', value: 'deadline' },
              { label: '리워드 높은순', value: 'reward' },
              { label: '최신 등록순', value: 'recent' },
            ]}
            className="shrink-0 w-32"
          />
        </div>

        {/* 결과 수 */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            총 <strong className="text-gray-900">{filtered.length}</strong>개의 캠페인
          </p>
        )}

        {/* 카드 그리드 */}
        {loading ? (
          <div className="grid grid-cols-1 @[640px]:grid-cols-2 @[1024px]:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CampaignSkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 @[640px]:grid-cols-2 @[1024px]:grid-cols-3 gap-4">
            {filtered.map(c => (
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

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white mt-8">
        <div className="max-w-6xl mx-auto px-4 @[640px]:px-6 py-8">
          <div className="flex flex-col @[640px]:flex-row @[640px]:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-base font-bold text-brand-green">WELLINK AI</span>
              <p className="text-sm text-gray-300 mt-1">웰니스 인플루언서를 위한 캠페인 플랫폼</p>
            </div>
            <div className="flex gap-4 text-sm text-gray-300">
              <a href={`mailto:${HELP_EMAIL}`} className="px-3 py-2.5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded">문의하기</a>
              <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded">이용약관</a>
              <a href={`${BRAND_URL}/#faq`} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded">FAQ</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 text-sm text-gray-400 space-y-0.5 break-keep">
            <p>상호명: 주식회사 애프터액션 | 대표자: 안정식 | 사업자등록번호: 196-86-03374</p>
            <p>서울 영등포구 당산로 241 유니언타워 514호 | 070-8655-2299</p>
            <p className="mt-2">© 2026 WELLINK AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </Layout>
  )
}
