import { useState, useEffect } from 'react'
import {
  Search,
  Download,
  Eye,
  LayoutGrid,
  List,
  ChevronDown,
  Check,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  TrendingUp,
  Crown,
  ImageOff,
} from 'lucide-react'
import { Modal, StatusBadge } from '@wellink/ui'
import { useToast } from '@wellink/ui'
import { ErrorState } from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import { fmtNumber } from '@wellink/ui'
import { fmtDate } from '../utils/fmtDate'

/* ───── Mock Data ───── */

interface Content {
  id: number
  creator: string
  campaign: string
  type: '릴스' | '피드' | '스토리' | '숏폼'
  platform: '인스타그램' | '유튜브' | '블로그'
  date: string
  reach: number
  likes: number
  comments: number
  saves: number
  shareRate: number
  engagementRate: number
  status: '승인' | '검수중' | '대기중' | '반려'
  thumbnailColor: string
}

const contents: Content[] = [
  { id: 1, creator: '이창민', campaign: '봄 요가 프로모션', type: '릴스', platform: '인스타그램', date: '2026-04-05', reach: 4200, likes: 312, comments: 48, saves: 67, shareRate: 3.2, engagementRate: 10.2, status: '승인', thumbnailColor: '#F9A8D4' },
  { id: 2, creator: '김가애', campaign: '봄 요가 프로모션', type: '피드', platform: '인스타그램', date: '2026-04-03', reach: 8100, likes: 540, comments: 92, saves: 134, shareRate: 4.1, engagementRate: 9.5, status: '승인', thumbnailColor: '#93C5FD' },
  { id: 3, creator: '박리나', campaign: '봄 요가 프로모션', type: '스토리', platform: '인스타그램', date: '2026-04-01', reach: 2900, likes: 180, comments: 23, saves: 18, shareRate: 1.8, engagementRate: 7.6, status: '승인', thumbnailColor: '#C4B5FD' },
  { id: 4, creator: '민경완', campaign: '봄 요가 프로모션', type: '피드', platform: '인스타그램', date: '2026-03-28', reach: 6700, likes: 420, comments: 67, saves: 89, shareRate: 2.9, engagementRate: 8.6, status: '검수중', thumbnailColor: '#FCA5A5' },
  { id: 5, creator: '장영훈', campaign: '비건 신제품 론칭', type: '릴스', platform: '인스타그램', date: '2026-03-25', reach: 1200, likes: 88, comments: 12, saves: 9, shareRate: 1.2, engagementRate: 9.1, status: '대기중', thumbnailColor: '#FDE68A' },
  { id: 6, creator: '한서연', campaign: '비건 신제품 론칭', type: '숏폼', platform: '유튜브', date: '2026-04-06', reach: 15200, likes: 1240, comments: 189, saves: 312, shareRate: 5.8, engagementRate: 11.4, status: '승인', thumbnailColor: '#6EE7B7' },
  { id: 7, creator: '오진석', campaign: '여름 캠페인', type: '피드', platform: '블로그', date: '2026-04-07', reach: 3400, likes: 210, comments: 34, saves: 45, shareRate: 2.1, engagementRate: 8.5, status: '검수중', thumbnailColor: '#FDBA74' },
  { id: 8, creator: '정예린', campaign: '여름 캠페인', type: '릴스', platform: '인스타그램', date: '2026-04-08', reach: 9800, likes: 870, comments: 142, saves: 198, shareRate: 4.7, engagementRate: 12.3, status: '승인', thumbnailColor: '#A5B4FC' },
  { id: 9, creator: '최다은', campaign: '비건 신제품 론칭', type: '스토리', platform: '인스타그램', date: '2026-03-30', reach: 1800, likes: 95, comments: 11, saves: 14, shareRate: 1.0, engagementRate: 6.7, status: '대기중', thumbnailColor: '#FDA4AF' },
  { id: 10, creator: '김태우', campaign: '여름 캠페인', type: '숏폼', platform: '유튜브', date: '2026-04-02', reach: 11400, likes: 920, comments: 156, saves: 230, shareRate: 5.2, engagementRate: 11.5, status: '승인', thumbnailColor: '#86EFAC' },
]

/* ───── Style Maps ───── */

const typeColors: Record<string, string> = {
  '이미지': 'bg-sky-100 text-sky-700',
  '릴스': 'bg-pink-100 text-pink-700',
  '스토리': 'bg-purple-100 text-purple-700',
  '영상': 'bg-orange-100 text-orange-700',
  '피드': 'bg-blue-100 text-blue-700',
  '숏폼': 'bg-emerald-100 text-emerald-700',
}


const platformIcons: Record<string, string> = {
  '인스타그램': 'IG',
  '유튜브': 'YT',
  '블로그': 'BL',
}

/* ───── Campaign list ───── */
const campaigns = ['전체', '봄 요가 프로모션', '비건 신제품 론칭', '여름 캠페인']

/* ───── Sort helpers ───── */

type SortKey = '최신순' | '도달순' | '좋아요순'

function sortContents(items: Content[], key: SortKey): Content[] {
  const sorted = [...items]
  switch (key) {
    case '최신순':
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    case '도달순':
      return sorted.sort((a, b) => b.reach - a.reach)
    case '좋아요순':
      return sorted.sort((a, b) => b.likes - a.likes)
    default:
      return sorted
  }
}

/* ───── ConfirmState ───── */

interface ConfirmState {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
}

const defaultConfirm: ConfirmState = { open: false, title: '', description: '', onConfirm: () => {} }

/* ───── Component ───── */

export default function Library() {
  const { showToast } = useToast()
  const qa = useQAMode()
  const [search, setSearch] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('전체')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [platformFilter, setPlatformFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [approvedIds, setApprovedIds] = useState<Set<number>>(new Set(contents.filter(c => c.status === '승인').map(c => c.id)))
  const [rejectedIds, setRejectedIds] = useState<Set<number>>(new Set(contents.filter(c => c.status === '반려').map(c => c.id)))
  const [sortKey, setSortKey] = useState<SortKey>('최신순')
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(qa === 'view-list' ? 'list' : 'grid')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [previewItem, setPreviewItem] = useState<Content | null>(null)
  const [rejectConfirm, setRejectConfirm] = useState<ConfirmState>(defaultConfirm)
  const [rejectReason, setRejectReason] = useState('')

  // 정렬 드롭다운 Escape 키 닫기
  useEffect(() => {
    if (!sortOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSortOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [sortOpen])

  const openRejectConfirm = (item: Content) => {
    setRejectConfirm({
      open: true,
      title: '이 콘텐츠를 반려할까요?',
      description: '이 작업은 되돌릴 수 없습니다.',
      onConfirm: () => {
        setRejectedIds(prev => new Set([...prev, item.id]))
        setPreviewItem(null)
        showToast('콘텐츠가 반려되었습니다.', 'info')
      },
    })
  }

  const closeRejectConfirm = () => {
    setRejectConfirm(defaultConfirm)
    setRejectReason('')
  }

  const handleRejectConfirm = () => {
    rejectConfirm.onConfirm()
    closeRejectConfirm()
  }

  if (qa === 'loading') {
    return (
      <div className="space-y-4 animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
          <div>
            <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-gray-200 rounded-xl" />
            <div className="h-9 w-28 bg-gray-200 rounded-xl" />
          </div>
        </div>
        {/* KPI 4개 스켈레톤 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        {/* 필터 바 스켈레톤 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
          <div className="h-9 w-20 bg-gray-200 rounded-xl" />
          <div className="h-9 w-24 bg-gray-200 rounded-xl" />
        </div>
        {/* 콘텐츠 그리드 6개 스켈레톤 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200" />
              <div className="p-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (qa === 'error') {
    return <ErrorState message="라이브러리를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  /* ── Filter & Sort ── */

  const filtered = qa === 'empty' ? [] : sortContents(
    contents.filter(c => {
      const matchSearch = c.creator.includes(search) || c.campaign.includes(search)
      const matchCampaign = campaignFilter === '전체' || c.campaign === campaignFilter
      const matchStatus = statusFilter === '전체' || c.status === statusFilter
      const matchPlatform = platformFilter === '전체' || c.platform === platformFilter
      const matchType = typeFilter === '전체' || c.type === typeFilter
      return matchSearch && matchCampaign && matchStatus && matchPlatform && matchType
    }),
    sortKey,
  )

  /* ── Selection helpers ── */

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)))
    }
  }

  const isAllSelected = filtered.length > 0 && selectedIds.size === filtered.length

  /* ── Summary stats ── */

  const totalReach = contents.reduce((s, c) => s + c.reach, 0)
  const totalLikes = contents.reduce((s, c) => s + c.likes, 0)
  const avgEngagement = contents.length > 0
    ? (contents.reduce((s, c) => s + c.engagementRate, 0) / contents.length).toFixed(1)
    : '0'
  const topPerformer = [...contents].sort((a, b) => b.engagementRate - a.engagementRate)[0]

  /* ── Chip component ── */

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-xl border transition-all ${
        active
          ? 'bg-brand-green text-white border-brand-green'
          : 'border-gray-200 text-gray-600 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  )

  /* ─────────── Render ─────────── */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">콘텐츠 라이브러리</h1>
          <p className="text-sm text-gray-500 mt-0.5">인플루언서가 제작한 콘텐츠를 한 곳에서 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => showToast(`${selectedIds.size}개 콘텐츠 다운로드를 시작합니다.`, 'success')}
              className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Download size={14} />
              선택 다운로드 ({selectedIds.size})
            </button>
          )}
          {filtered.length > 0 && (
            <button
              onClick={() => showToast('전체 콘텐츠 다운로드를 시작합니다.', 'success')}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              전체 다운로드
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="text-xs text-gray-500 mb-1">총 콘텐츠</div>
          <div className="text-xl font-bold text-gray-900">{contents.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="text-xs text-gray-500 mb-1">총 도달</div>
          <div className="text-xl font-bold text-gray-900">{fmtNumber(totalReach)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="text-xs text-gray-500 mb-1">총 좋아요</div>
          <div className="text-xl font-bold text-gray-900">{fmtNumber(totalLikes)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <TrendingUp size={12} />
            평균 참여율
          </div>
          <div className="text-xl font-bold text-brand-green">{avgEngagement}%</div>
        </div>
      </div>

      {/* Top Performer */}
      {topPerformer && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-all">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-green/10">
            <Crown size={16} className="text-brand-green" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-500">Top Performer</span>
            <div className="text-sm font-semibold text-gray-900">
              {topPerformer.creator} — {topPerformer.campaign}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">참여율</div>
            <div className="text-sm font-bold text-brand-green">{topPerformer.engagementRate}%</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">도달</div>
            <div className="text-sm font-bold text-gray-900">{fmtNumber(topPerformer.reach)}</div>
          </div>
        </div>
      )}

      {/* Campaign Tab Filter */}
      <div className="flex gap-1 border-b border-gray-200">
        {campaigns.map(camp => {
          const count = camp === '전체' ? contents.length : contents.filter(c => c.campaign === camp).length
          return (
            <button
              key={camp}
              onClick={() => setCampaignFilter(camp)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
                campaignFilter === camp
                  ? 'border-brand-green font-semibold text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {camp}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                campaignFilter === camp ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search + Filters Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="제작자, 캠페인 검색..."
              aria-label="콘텐츠 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => { setViewMode('grid'); setSelectedIds(new Set()) }}
              aria-label="그리드 보기"
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => { setViewMode('list'); setSelectedIds(new Set()) }}
              aria-label="리스트 보기"
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 text-sm px-3 py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors bg-white text-gray-700"
            >
              {sortKey}
              <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 min-w-[120px]">
                  {(['최신순', '도달순', '좋아요순'] as SortKey[]).map(key => (
                    <button
                      key={key}
                      onClick={() => { setSortKey(key); setSortOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${sortKey === key ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                    >
                      {key}
                      {sortKey === key && <Check size={14} className="text-brand-green" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-medium mr-1">상태</span>
          {['전체', '승인', '검수중', '대기중', '반려'].map(s => (
            <Chip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <span className="text-xs text-gray-400 font-medium mr-1">플랫폼</span>
          {['전체', '인스타그램', '유튜브', '블로그'].map(p => (
            <Chip key={p} label={p} active={platformFilter === p} onClick={() => setPlatformFilter(p)} />
          ))}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <span className="text-xs text-gray-400 font-medium mr-1">유형</span>
          {['전체', '릴스', '피드', '스토리', '숏폼'].map(t => (
            <Chip key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
          ))}
        </div>
      </div>

      {/* ────── Content Area ────── */}

      {filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <ImageOff size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">콘텐츠가 없습니다</p>
          <p className="text-xs text-gray-400">검색 조건을 변경하거나 필터를 초기화해 보세요.</p>
          <button
            onClick={() => {
              setSearch('')
              setCampaignFilter('전체')
              setStatusFilter('전체')
              setPlatformFilter('전체')
              setTypeFilter('전체')
            }}
            className="mt-4 text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ───── Grid View ───── */
        <div>
          {/* Select all bar */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={toggleSelectAll}
              role="checkbox"
              aria-checked={isAllSelected}
              aria-label="전체 선택"
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isAllSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              {isAllSelected && <Check size={12} className="text-white" />}
            </button>
            <span className="text-xs text-gray-500">전체 선택 ({filtered.length})</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 @lg:grid-cols-4 gap-4">
            {filtered.map(c => {
              const isSelected = selectedIds.has(c.id)
              const displayStatus = approvedIds.has(c.id) ? '승인' : rejectedIds.has(c.id) ? '반려' : c.status
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${
                    isSelected ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleSelect(c.id) }}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`${c.creator} 콘텐츠 선택`}
                    className={`absolute top-3 left-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-brand-green bg-brand-green'
                        : 'border-white/80 bg-white/80 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </button>

                  {/* Thumbnail */}
                  <div
                    className="aspect-square rounded-t-xl flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: c.thumbnailColor + '40' }}
                    onClick={() => setPreviewItem(c)}
                  >
                    <span className="text-2xl font-bold" style={{ color: c.thumbnailColor }}>
                      {platformIcons[c.platform]}
                    </span>
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[c.type]}`}>{c.type}</span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/30 to-transparent h-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                      <Eye size={16} className="text-white" />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-3" onClick={() => setPreviewItem(c)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{c.creator}</span>
                      <StatusBadge status={displayStatus} dot={false} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">{c.campaign}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Eye size={11} /> {fmtNumber(c.reach)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart size={11} /> {fmtNumber(c.likes)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle size={11} /> {c.comments}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ───── List (Table) View ───── */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-3 px-3 w-8">
                  <button
                    onClick={toggleSelectAll}
                    role="checkbox"
                    aria-checked={isAllSelected}
                    aria-label="전체 선택"
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isAllSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isAllSelected && <Check size={10} className="text-white" />}
                  </button>
                </th>
                {['콘텐츠', '제작자', '캠페인', '유형', '플랫폼', '날짜', '도달', '좋아요', '댓글', '저장', '참여율', '상태', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isSelected = selectedIds.has(c.id)
                const displayStatus = approvedIds.has(c.id) ? '승인' : rejectedIds.has(c.id) ? '반려' : c.status
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150 ${isSelected ? 'bg-brand-green/5' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleSelect(c.id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={`${c.creator} 콘텐츠 선택`}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={10} className="text-white" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer"
                        style={{ backgroundColor: c.thumbnailColor + '40', color: c.thumbnailColor }}
                        onClick={() => setPreviewItem(c)}
                      >
                        {platformIcons[c.platform]}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm font-medium text-gray-900">{c.creator}</td>
                    <td className="py-3 px-3 text-xs text-gray-600 max-w-[120px] truncate">{c.campaign}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[c.type]}`}>{c.type}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500">{c.platform}</td>
                    <td className="py-3 px-3 text-xs text-gray-500">{fmtDate(c.date)}</td>
                    <td className="py-3 px-3 text-sm text-gray-700">{fmtNumber(c.reach)}</td>
                    <td className="py-3 px-3 text-sm text-gray-700">{fmtNumber(c.likes)}</td>
                    <td className="py-3 px-3 text-sm text-gray-700">{c.comments}</td>
                    <td className="py-3 px-3 text-sm text-gray-700">{c.saves}</td>
                    <td className={`py-3 px-3 text-sm font-medium ${c.engagementRate >= 4 ? 'text-brand-green-text' : c.engagementRate >= 2.5 ? 'text-gray-700' : 'text-red-500'}`}>{c.engagementRate}%</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={displayStatus} dot={false} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreviewItem(c)}
                          aria-label="미리보기"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => showToast(`${c.creator}님의 콘텐츠를 다운로드합니다.`, 'success')}
                          aria-label="다운로드"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* ────── Preview Modal ────── */}
      <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} title="콘텐츠 상세" size="lg">
        {previewItem && (() => {
          const modalDisplayStatus = approvedIds.has(previewItem.id) ? '승인' : rejectedIds.has(previewItem.id) ? '반려' : previewItem.status
          return (
          <div className="space-y-5">
            {/* Thumbnail */}
            <div
              className="w-full aspect-video rounded-xl flex items-center justify-center"
              style={{ backgroundColor: previewItem.thumbnailColor + '30' }}
            >
              <span className="text-5xl font-bold" style={{ color: previewItem.thumbnailColor }}>
                {platformIcons[previewItem.platform]}
              </span>
            </div>

            {/* Creator + Campaign */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-gray-900">{previewItem.creator}</h4>
                <p className="text-sm text-gray-500">{previewItem.campaign}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[previewItem.type]}`}>{previewItem.type}</span>
                <StatusBadge status={modalDisplayStatus} dot={false} size="sm" />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Eye size={14} />, label: '도달', value: previewItem.reach.toLocaleString() },
                { icon: <Heart size={14} />, label: '좋아요', value: previewItem.likes.toLocaleString() },
                { icon: <MessageCircle size={14} />, label: '댓글', value: previewItem.comments.toLocaleString() },
                { icon: <Bookmark size={14} />, label: '저장', value: previewItem.saves.toLocaleString() },
                { icon: <Share2 size={14} />, label: '공유율', value: previewItem.shareRate + '%' },
                { icon: <TrendingUp size={14} />, label: '참여율', value: previewItem.engagementRate + '%' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">{stat.icon}<span className="text-xs">{stat.label}</span></div>
                  <div className="text-base font-bold text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>{previewItem.platform} · {previewItem.date}</span>
            </div>

            {/* Approve / Reject + Download */}
            {!approvedIds.has(previewItem.id) && !rejectedIds.has(previewItem.id) && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setApprovedIds(prev => new Set([...prev, previewItem.id])); setPreviewItem(null) }}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-green-hover transition-colors"
                >
                  <Check size={15} />
                  승인
                </button>
                <button
                  onClick={() => openRejectConfirm(previewItem)}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  반려
                </button>
              </div>
            )}
            {approvedIds.has(previewItem.id) && (
              <div className="w-full text-center text-sm text-brand-green font-medium py-2">승인된 콘텐츠입니다</div>
            )}
            {rejectedIds.has(previewItem.id) && (
              <div className="w-full text-center text-sm text-red-400 font-medium py-2">반려된 콘텐츠입니다</div>
            )}
            <button
              onClick={() => showToast(`${previewItem.creator}님의 콘텐츠를 다운로드합니다.`, 'success')}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
            >
              <Download size={15} />
              다운로드
            </button>
          </div>
          )
        })()}
      </Modal>

      {/* 반려 확인 모달 */}
      <Modal open={rejectConfirm.open} onClose={closeRejectConfirm} size="sm" title="콘텐츠 반려">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">{rejectConfirm.title}</p>
            <p className="text-xs text-gray-500 mt-1">{rejectConfirm.description}</p>
          </div>
          <div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="인플루언서에게 전달할 반려 사유를 입력해 주세요 (선택)"
              maxLength={300}
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all duration-150 placeholder:text-gray-400"
            />
            <div className="text-right text-xs text-gray-400 mt-0.5">{rejectReason.length}/300</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeRejectConfirm}
              className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              취소
            </button>
            <button
              onClick={handleRejectConfirm}
              className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm hover:bg-red-600 transition-colors duration-150"
            >
              반려
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
