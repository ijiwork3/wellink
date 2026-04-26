import { useState, useEffect, useMemo } from 'react'
type SortKey = 'deadline' | 'reward' | 'recent'
import { useNavigate } from 'react-router-dom'
import { Search, X, SlidersHorizontal, XCircle, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import CampaignCard from '../components/CampaignCard'
import CampaignDetailContent from '../components/CampaignDetailContent'
import { mockCampaigns, BROWSE_CATEGORIES } from '../services/mock/campaigns'
import type { Campaign } from '../services/mock/campaigns'
import { useQAMode, TIMER_MS, CustomSelect, ChipSelect, useIsTouchDevice } from '@wellink/ui'
import { BRAND_URL, HELP_EMAIL } from '../config/urls'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2">
          <div className="h-4 bg-gray-100 rounded-full w-14" />
          <div className="h-4 bg-gray-100 rounded-full w-10" />
        </div>
        <div className="h-3 bg-gray-100 rounded-xl w-1/4" />
        <div className="h-4 bg-gray-100 rounded-xl w-4/5" />
        <div className="h-8 bg-gray-100 rounded-xl mt-1" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded-xl w-16" />
          <div className="h-3 bg-gray-100 rounded-xl w-16" />
        </div>
      </div>
    </div>
  )
}

export default function CampaignBrowse() {
  const qa = useQAMode()
  const navigate = useNavigate()
  const isTouch = useIsTouchDevice()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [sort, setSort] = useState<SortKey>('deadline')
  const [loading, setLoading] = useState(true)
  const [quickViewId, setQuickViewId] = useState<number | null>(qa === 'modal-detail' ? 1 : null)
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null)

  const handleCardClick = (campaign: Campaign) => {
    if (isTouch) {
      navigate(`/campaigns/${campaign.id}`)
    } else {
      setDetailCampaign(campaign)
    }
  }

  useEffect(() => {
    if (qa === 'loading') return
    const t = setTimeout(() => setLoading(false), TIMER_MS.SKELETON_LOADING)
    return () => clearTimeout(t)
  }, [qa])

  useEffect(() => {
    if (qa === 'empty-search') setSearch('검색결과없음xyz')
    if (qa === 'modal-detail') setQuickViewId(1)
  }, [qa])

  const toggleLike = (id: number) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
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
      <Layout showSidebar={false} showBottomTab pageTitle="진행 중인 캠페인" onBack={() => navigate(-1)}>
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-4">
          <XCircle size={44} className="text-red-300" />
          <p className="text-sm font-semibold text-gray-900">캠페인 목록을 불러오지 못했어요</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green">
            <RefreshCw size={14} />다시 시도
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSidebar={false} showBottomTab pageTitle="진행 중인 캠페인" onBack={() => navigate(-1)}>
      {/* 헤더 */}
      <div className="px-6 py-10" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-green) 10%, transparent) 0%, rgba(255,255,255,0) 60%)' }}>
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-1">진행 중인 캠페인</h1>
          <p className="text-sm text-gray-500">당신의 채널과 잘 어울리는 브랜드를 찾아보세요.</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-12">
        {/* 검색 + 필터 */}
        <div className="-mt-4 mb-5 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="캠페인 또는 브랜드 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>
          <button className="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
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
          <p className="text-xs text-gray-500 mb-4">
            총 <strong className="text-gray-900">{filtered.length}</strong>개의 캠페인
          </p>
        )}

        {/* 카드 그리드 */}
        {loading ? (
          <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                liked={likedIds.has(c.id)}
                onToggleLike={toggleLike}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center">
              <Search size={28} className="text-brand-green" />
            </div>
            <p className="text-sm font-medium text-gray-500">검색 결과가 없어요</p>
            <p className="text-xs text-gray-400">다른 키워드나 카테고리로 검색해 보세요</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('전체') }}
              className="mt-1 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-green hover:opacity-90 transition-opacity"
            >
              전체 캠페인 보기
            </button>
          </div>
        )}
      </div>

      {/* 퀵뷰 바텀시트 */}
      {quickViewId !== null && (() => {
        const c = mockCampaigns.find(x => x.id === quickViewId)
        if (!c) return null
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setQuickViewId(null)}>
            <div
              role="dialog"
              aria-modal="true"
              className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <p className="text-xs text-gray-400 mb-1">{c.brand}</p>
              <h3 className="text-base font-bold text-gray-900 mb-3">{c.name}</h3>
              {c.reward && (
                <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-brand-green/5 border border-brand-green/10">
                  <span className="text-xs font-medium text-gray-700">🎁 {c.reward}</span>
                </div>
              )}
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-green text-white">{c.category}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{c.channel}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{c.applied}/{c.headcount}명 모집</span>
              </div>
              <button
                onClick={() => { setQuickViewId(null); navigate(`/campaigns/${c.id}`) }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity"
              >
                상세보기 · 신청하기
              </button>
            </div>
          </div>
        )
      })()}

      {/* PC 캠페인 상세 모달 */}
      {detailCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          onClick={() => setDetailCampaign(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <CampaignDetailContent campaign={detailCampaign} inModal />
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-base font-bold text-brand-green">WELLINK AI</span>
              <p className="text-xs text-gray-400 mt-1">웰니스 인플루언서를 위한 캠페인 플랫폼</p>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <button onClick={() => window.open(`mailto:${HELP_EMAIL}`)} className="hover:text-white transition-colors">문의하기</button>
              <button onClick={() => window.open('https://wellink.co.kr/terms', '_blank', 'noopener,noreferrer')} className="hover:text-white transition-colors">이용약관</button>
              <button onClick={() => window.location.href = `${BRAND_URL}/#faq`} className="hover:text-white transition-colors">FAQ</button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 text-[11px] text-gray-600 space-y-0.5">
            <p>상호명: 주식회사 애프터액션 | 대표자: 안정식 | 사업자등록번호: 196-86-03374</p>
            <p>서울 영등포구 당산로 241 유니언타워 514호 | 070-8655-2299</p>
            <p className="mt-2">© 2026 WELLINK AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </Layout>
  )
}
