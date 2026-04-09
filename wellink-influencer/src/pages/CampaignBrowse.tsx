import { useState, useEffect } from 'react'
import { Search, Layers } from 'lucide-react'
import Layout from '../components/Layout'
import CampaignCard from '../components/CampaignCard'
import { campaigns } from '../data/campaigns'

const categories = ['전체', '뷰티/패션', '맛집/푸드', '생활/미용', '디지털/가전', '어필/스포츠', '기타']

// 스켈레톤 카드 컴포넌트
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-4 bg-gray-100 rounded-lg w-4/5" />
        <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-9 bg-gray-100 rounded-xl mt-3" />
      </div>
    </div>
  )
}

export default function CampaignBrowse() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = campaigns.filter((c) => {
    const matchCategory = selectedCategory === '전체' || c.category === selectedCategory
    const matchSearch = !search || c.name.includes(search) || c.brand.includes(search)
    return matchCategory && matchSearch
  })

  return (
    <Layout showSidebar={false}>
      {/* 페이지 헤더 — 라임그린 그라데이션 */}
      <div
        className="px-6 py-10"
        style={{ background: 'linear-gradient(135deg, rgba(140,198,63,0.12) 0%, rgba(255,255,255,0) 60%)' }}
      >
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-1">진행 중인 프리미엄 캠페인</h1>
          <p className="text-sm text-gray-500">당신의 채널과 가장 잘 어울리는 브랜드를 찾아보세요.<br />검증된 브랜드와의 협업 기회가 기다리고 있습니다.</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-10">
        {/* 검색바 */}
        <div className="relative mb-4 -mt-4">
          <label htmlFor="campaign-search" className="sr-only">캠페인 검색</label>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="campaign-search"
            type="text"
            placeholder="캠페인명, 브랜드명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8CC63F]/30 focus:border-[#8CC63F] transition-all duration-150"
          />
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                selectedCategory === cat
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#8CC63F]/40 hover:text-[#8CC63F]'
              }`}
              style={selectedCategory === cat ? { backgroundColor: '#8CC63F' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 결과 수 */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            총 <span className="font-semibold text-gray-900">{filtered.length}</span>개의 캠페인
          </p>
        )}

        {/* 스켈레톤 / 실제 그리드 */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                liked={likedIds.has(c.id)}
                onToggleLike={toggleLike}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#f0fce8' }}
            >
              <Search size={32} style={{ color: '#8CC63F' }} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">검색 결과가 없어요</p>
            <p className="text-xs text-gray-400 mb-4">다른 키워드나 카테고리로 검색해 보세요</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('전체') }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90 flex items-center gap-1.5"
              style={{ backgroundColor: '#8CC63F' }}
            >
              <Layers size={14} />
              전체 캠페인 보기
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div className="col-span-1">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-base font-bold" style={{color: '#8CC63F'}}>WELLINK AI</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">웰니스 성장의 정점, 데이터로 증명하며 만들면서 마케팅의 새로운 패러다임을 제시합니다.</p>
              <div className="mt-4 space-y-1 text-xs text-gray-500">
                <p>상호명: 주식회사 애프터액션 | 대표자: 안정식</p>
                <p>사업자등록번호: 196-86-03374</p>
                <p>통신판매업신고번호: 2025-서울왕동포-2637</p>
                <p>연락처: 070-8655-2299</p>
                <p>서울 영등포구 당산로 241 유니언타워 514호</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">제품</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><button onClick={() => window.location.href = `${import.meta.env.VITE_BRAND_URL || 'http://localhost:3003'}/#features`} className="hover:text-white transition-colors">기능</button></li>
                <li><button onClick={() => window.location.href = `${import.meta.env.VITE_BRAND_URL || 'http://localhost:3003'}/#pricing`} className="hover:text-white transition-colors">가격</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">회사</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><button onClick={() => window.open('https://wellink.co.kr/blog', '_blank')} className="hover:text-white transition-colors">블로그</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">지원</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><button onClick={() => window.open('mailto:help@wellink.co.kr')} className="hover:text-white transition-colors">문의하기</button></li>
                <li><button onClick={() => window.location.href = `${import.meta.env.VITE_BRAND_URL || 'http://localhost:3003'}/#faq`} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => window.open('https://wellink.co.kr/terms', '_blank')} className="hover:text-white transition-colors">서비스 이용 약관</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-gray-500">
            © 2026 WELLINK AI. All rights reserved.
          </div>
        </div>
      </footer>
    </Layout>
  )
}
