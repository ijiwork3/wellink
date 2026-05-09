import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Share2, Bookmark, Eye, Zap, Image, Info, Award, ChevronLeft, ChevronRight, Megaphone, TrendingUp, Heart, MessageCircle, Lock } from 'lucide-react'
import { KPICard, Modal, ErrorState, useToast, DateRangePicker, Tooltip, Pagination, fmtNumber, getDateLabel, CHART_COLORS, CONTENT_TYPE_STYLE, CustomSelect, PlatformBadge, type DatePeriod } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import { useDeviceMode } from '../qa-mockup-kit'
import { usePlanAccess } from '../hooks/usePlanAccess'

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly'

const VIEW_MODE_TO_PERIOD: Record<ViewMode, DatePeriod> = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
  yearly: '연간',
}

const PERIOD_TO_VIEW_MODE: Record<DatePeriod, ViewMode> = {
  '일간': 'daily',
  '주간': 'weekly',
  '월간': 'monthly',
  '연간': 'yearly',
}

// 뷰 모드별 KPI 더미 데이터
// data-policy-v1 §4-3: 바이럴 계수(viral)는 배수(x) 단위 표시. reach/shares/saves는 fmtNumber() 적용
const kpiByMode: Record<ViewMode, { reach: number; shares: number; saves: number; viral: number }> = {
  daily:   { reach: 4200,   shares: 82,    saves: 312,   viral: 2.1 },
  weekly:  { reach: 18700,  shares: 410,   saves: 1820,  viral: 2.3 },
  monthly: { reach: 48200,  shares: 1240,  saves: 3890,  viral: 2.4 },
  yearly:  { reach: 578000, shares: 14880, saves: 46680, viral: 2.6 },
}

// 100개 바이럴 콘텐츠 더미 — 원본 ContentScoreItem 동등 (finalScore/grade/performanceScore/momentumScore)
type ViralContentType = '릴스' | '피드' | '스토리' | '영상' | '쇼츠'
type ContentGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'processing'
type ViralPlatform = 'instagram' | 'youtube' | 'tiktok'
type ViralContent = {
  id: string
  title: string
  influencer: string
  platform: ViralPlatform
  type: ViralContentType
  reach: number
  likes: number
  comments: number
  saves: number
  shares: number
  viralScore: number
  performanceScore: number
  momentumScore: number
  grade: ContentGrade
  createdAt: string
}
// 등급 계산 — 원본 getPerformanceGrade
const calcGrade = (score: number): ContentGrade => {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  if (score >= 20) return 'D'
  return 'E'
}
const VC_TITLES = [
  '봄맞이 요가 루틴 5분 챌린지', '비건 프로틴 바 솔직 후기', '주말 홈트 브이로그', '웰링크 제품 언박싱', '건강간식 추천 TOP3',
  '신상 앰플 일주일 사용기', '러닝화 100km 신어보기', '다이어트 도시락 일주일 기록', '아침 요가 루틴 추천', '필라테스 입문 한 달 변화',
  '비타민C 앰플 비교 리뷰', '스트레칭 루틴 따라해봤어요', '단백질 보충제 솔직 시식', '레깅스 코디 추천', '저당 디저트 만들기',
  '홈카페 굿즈 언박싱', '미니멀 인테리어 챌린지', '캠핑 장비 추천템', '노티드 도넛 후기', '강남 맛집 투어',
]
const VC_INFLUENCERS = [
  '@yoga_jimin', '@fitfoodie_kr', '@daily_hana', '@beauty_sora', '@snack_master',
  '@runner_kim', '@diet_diary', '@yoga_morning', '@pilates_world', '@vitamin_review',
  '@stretch_daily', '@protein_kim', '@leggings_lover', '@low_sugar', '@homecafe_master',
  '@minimal_int', '@camping_pick', '@notted_kr', '@gangnam_food', '@beauty_lab',
]
const VC_TYPES: ViralContentType[] = ['릴스', '피드', '스토리', '영상', '쇼츠']
const viralContentData: ViralContent[] = Array.from({ length: 100 }, (_, i) => {
  const isProcessing = i % 19 === 18  // 5%는 점수 산정 중
  const viralScore = isProcessing ? 0 : Math.max(8, Math.min(98, 30 + (i * 7) % 70))
  const performanceScore = isProcessing ? 0 : Math.max(0, viralScore - 5 + (i % 9))
  const momentumScore = isProcessing ? 0 : Math.max(0, viralScore - 8 + (i % 13))
  const grade: ContentGrade = isProcessing ? 'processing' : calcGrade(performanceScore)
  const reach = isProcessing ? 0 : 1000 + (i * 511) % 30000
  const likes = isProcessing ? 0 : Math.floor(reach * (0.06 + (i % 7) * 0.005))
  const comments = isProcessing ? 0 : Math.floor(likes * (0.08 + (i % 5) * 0.01))
  const saves = isProcessing ? 0 : Math.floor(likes * (0.3 + (i % 4) * 0.05))
  const shares = isProcessing ? 0 : Math.floor(likes * (0.15 + (i % 6) * 0.02))
  const monthIdx = (i * 7) % 4 + 1
  const dayIdx = ((i * 11) % 28) + 1
  const type = VC_TYPES[i % VC_TYPES.length]
  const platform: ViralPlatform = type === '영상'
    ? 'youtube'
    : type === '쇼츠'
      ? (i % 2 === 0 ? 'youtube' : 'tiktok')
      : 'instagram'
  return {
    id: `v-${i + 1}`,
    title: i < VC_TITLES.length ? VC_TITLES[i] : `${VC_TITLES[i % VC_TITLES.length]} #${Math.floor(i / VC_TITLES.length) + 1}`,
    influencer: VC_INFLUENCERS[i % VC_INFLUENCERS.length],
    platform,
    type,
    reach, likes, comments, saves, shares,
    viralScore,
    performanceScore,
    momentumScore,
    grade,
    createdAt: `2026-${String(monthIdx).padStart(2, '0')}-${String(dayIdx).padStart(2, '0')}`,
  }
})

// 캠페인 매칭 더미 데이터 — 콘텐츠 index % 3 === 0 항목에 배지 노출
const CAMPAIGN_MATCH_MAP: Record<string, { campaignId: string; campaignName: string; uploadPeriodLabel: string }> = {}
viralContentData.forEach((item, i) => {
  if (i % 3 === 0) {
    const names = [
      '봄 시즌 릴스 캠페인', '비건 프로틴 체험단', '홈케어 루틴 챌린지',
      '여름 한정 시딩', '신제품 언박싱 캠페인', '웰니스 라이프 콜라보',
    ]
    CAMPAIGN_MATCH_MAP[item.id] = {
      campaignId: `camp-${(i % 6) + 1}`,
      campaignName: names[i % names.length],
      uploadPeriodLabel: `${item.createdAt} 등록`,
    }
  }
})

// 추세 미니 차트 (바 형태)
function TrendMiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: max > 0 ? `${(v / max) * 100}%` : '4px', backgroundColor: color, opacity: i === values.length - 1 ? 1 : 0.35 }}
        />
      ))}
    </div>
  )
}

// 뷰 모드별 추세 데이터 — 일간 30일, 주간 12주, 월간 12개월, 연간 2025년~
const trendData: Record<ViewMode, { reach: number[]; saves: number[]; shares: number[] }> = {
  // 일간: 30일치 (TrendMiniBar가 비율로 자동 렌더)
  daily: {
    reach:  [0,0,0,0,0,0,0,0, 2100,2800,2400,3200,2900,3600,3100,3900,3500,4200,3800,4600,4100,4800,4400,4200,4600,4100,4300,4500,4200,4200],
    saves:  [0,0,0,0,0,0,0,0, 160,195,175,220,200,245,215,265,240,290,260,330,295,340,315,308,325,295,310,320,305,312],
    shares: [0,0,0,0,0,0,0,0, 42,52,47,61,54,70,62,76,68,82,74,88,80,90,84,80,86,78,82,84,80,82],
  },
  // 주간: 12주
  weekly: {
    reach:  [0, 0, 12800, 14200, 16800, 15200, 18700, 17100, 18200, 19400, 18700, 18700],
    saves:  [0, 0, 1100,  1400,  1650,  1520,  1820,  1680,  1750,  1860,  1800,  1820],
    shares: [0, 0, 275,   310,   380,   350,   410,   390,   400,   428,   415,   410],
  },
  // 월간: 12개월 (앞 8개월 데이터 없음 → 0)
  monthly: {
    reach:  [0,0,0,0,0,0,0,0, 34000,38200,44000,48200],
    saves:  [0,0,0,0,0,0,0,0, 2800, 3100, 3600, 3890],
    shares: [0,0,0,0,0,0,0,0, 920,  1020, 1160, 1240],
  },
  // 연간: 월별 12포인트
  yearly: {
    reach:  [28000, 54000, 89000, 124000, 168000, 215000, 264000, 318000, 365000, 410000, 462000, 578000],
    saves:  [2100,  4200,  7000,  10200,  13800,  17600,  21800,  26200,  30100,  34500,  39200,  46680],
    shares: [620,   1240,  2100,  3050,   4120,   5280,   6510,   7840,   9080,   10420,  11840,  14880],
  },
}

export default function ViralMetrics() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const isDesktop = useDeviceMode() === 'desktop'
  const { canViewAdvancedAnalytics } = usePlanAccess()
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [dateOffset, setDateOffset] = useState(0)
  // 신규 — 콘텐츠 필터·정렬·페이지네이션·등급 필터 (원본 보강)
  type ContentSort = 'createdAt' | 'views' | 'likes' | 'comments' | 'engagement'
  type ContentFilter = '전체' | '릴스' | '피드' | '스토리' | '영상' | '쇼츠'
  type GradeFilterT = '전체' | 'processing' | 'A' | 'B' | 'C' | 'D' | 'E'
  const [contentSort, setContentSort] = useState<ContentSort>('createdAt')
  const [contentFilter, setContentFilter] = useState<ContentFilter>('전체')
  const [gradeFilter, setGradeFilter] = useState<GradeFilterT>('전체')
  const [contentPage, setContentPage] = useState(1)
  const [selectedContent, setSelectedContent] = useState<ViralContent | null>(null)
  const VC_PAGE_SIZE = 10

  // 테이블 가로 스크롤 화살표
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [canTableScrollLeft, setCanTableScrollLeft] = useState(false)
  const [canTableScrollRight, setCanTableScrollRight] = useState(false)
  const [tableBtnTop, setTableBtnTop] = useState<number | null>(null)

  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const update = () => {
      setCanTableScrollLeft(el.scrollLeft > 0)
      setCanTableScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const update = () => {
      const el = tableRef.current ?? tableWrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const visTop = Math.max(rect.top, 0)
      const visBottom = Math.min(rect.bottom, window.innerHeight)
      setTableBtnTop(visBottom > visTop + 40 ? (visTop + visBottom) / 2 : null)
    }
    const debouncedUpdate = () => {
      if (debounceTimer !== null) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(update, 150)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', debouncedUpdate)
    const ro = new ResizeObserver(debouncedUpdate)
    if (tableRef.current) ro.observe(tableRef.current)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', debouncedUpdate)
      ro.disconnect()
      if (debounceTimer !== null) clearTimeout(debounceTimer)
    }
  }, [])

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="flex flex-col @sm:flex-row @sm:items-start @sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-32 bg-gray-100 rounded-xl" />
            <div className="h-5 w-10 bg-gray-100 rounded-full" />
          </div>
          <div className="h-9 w-64 bg-gray-100 rounded-xl" />
        </div>
        {/* KPI 4개 스켈레톤 */}
        <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-32" />
          ))}
        </div>
        {/* 차트/배너 스켈레톤 */}
        <div className="bg-gray-100 rounded-xl h-16" />
        {/* 테이블 스켈레톤 */}
        <div className="bg-gray-100 rounded-xl h-64" />
      </div>
    )
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-sm font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full leading-none">Beta</span>
        </div>
        <InstagramConnectPrompt featureName="바이럴 지표" />
      </div>
    )
  }

  /* ── QA: 빈 상태 — 바이럴 콘텐츠 없음 ── */
  if (qa === 'empty') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-sm font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full leading-none">Beta</span>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[380px] bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <Zap size={40} className="text-gray-200 mb-3" />
          <p className="text-base font-semibold text-gray-400 mb-1">바이럴 콘텐츠 데이터가 없습니다</p>
          <p className="text-sm text-gray-400 max-w-[220px] mb-4">인플루언서 캠페인 콘텐츠가 게시되면 바이럴 지표가 자동으로 집계됩니다.</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="text-base font-medium text-white px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover transition-colors"
          >
            캠페인 만들기
          </button>
        </div>
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="바이럴 지표를 불러올 수 없습니다" subMessage="Instagram API 연결을 확인해 주세요." onRetry={() => window.location.reload()} />
  }

  /* ── QA: 전부 0 (엣지케이스) — 데이터 있으나 지표가 모두 0 ── */
  const isZero = qa === 'zero'
  const trendZero = { reach: [0,0,0,0,0,0,0], saves: [0,0,0,0,0,0,0], shares: [0,0,0,0,0,0,0] }

  const rawKpi = kpiByMode[viewMode]
  const kpi = isZero
    ? { reach: '--', shares: '--', saves: '--', viral: '--' }
    : { reach: fmtNumber(rawKpi.reach), shares: fmtNumber(rawKpi.shares), saves: fmtNumber(rawKpi.saves), viral: `${rawKpi.viral}x` }
  const trend = isZero ? trendZero : trendData[viewMode]

  const trendPct: Record<ViewMode, { reach: string; shares: string; saves: string; viral: string }> = {
    daily:   { reach: '+3.2%',  shares: '+5.1%',  saves: '+4.8%',  viral: '+1.2%' },
    weekly:  { reach: '+8.4%',  shares: '+12.3%', saves: '+9.7%',  viral: '+3.8%' },
    monthly: { reach: '+15.3%', shares: '+22.1%', saves: '+18.7%', viral: '+8.4%' },
    yearly:  { reach: '+42.1%', shares: '+58.3%', saves: '+51.2%', viral: '+24.6%' },
  }

  return (
    <>
    <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2.5">
        <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">바이럴 지표</h1>
        <span className="text-sm font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full leading-none whitespace-nowrap">Beta</span>
      </div>

      {/* 기간 선택기 — sticky: 데스크톱 top-0, 모바일/태블릿 top-12 */}
      <div className={`sticky z-20 -mx-4 px-4 @sm:-mx-6 @sm:px-6 @lg:-mx-8 @lg:px-8 py-2.5 bg-white/95 backdrop-blur-sm border-b border-gray-100 ${isDesktop ? 'top-0' : 'top-12'}`}>
        <DateRangePicker
          period={VIEW_MODE_TO_PERIOD[viewMode]}
          dateOffset={dateOffset}
          onPeriodChange={(p) => setViewMode(PERIOD_TO_VIEW_MODE[p])}
          onDateOffsetChange={setDateOffset}
        />
      </div>

      {/* 월간·연간 데이터 부정확 안내 배너 */}
      {(viewMode === 'monthly' || viewMode === 'yearly') && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 leading-relaxed">
            데이터는 최근 28일 기준으로 수집됩니다. <strong>월간·연간 수치는 실제와 다를 수 있습니다.</strong>
          </p>
        </div>
      )}

      {/* KPI 카드 4개 — @wellink/ui KPICard 사용 */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="총 바이럴 도달"
          value={kpi.reach}
          sub="고유 사용자"
          trend={isZero ? 0 : parseFloat(trendPct[viewMode].reach)}
          trendLabel="전기간 대비"
          icon={<Eye size={16} aria-hidden="true" />}
          tooltip="바이럴 콘텐츠가 도달한 고유 사용자 수 합산"
        />
        <KPICard
          title="공유 수"
          value={kpi.shares}
          sub="콘텐츠 공유"
          trend={isZero ? 0 : parseFloat(trendPct[viewMode].shares)}
          trendLabel="전기간 대비"
          icon={<Share2 size={16} aria-hidden="true" />}
          tooltip="콘텐츠가 다른 사용자에게 공유된 횟수"
        />
        <KPICard
          title="저장 수"
          value={kpi.saves}
          sub="지속 관심도"
          trend={isZero ? 0 : parseFloat(trendPct[viewMode].saves)}
          trendLabel="전기간 대비"
          icon={<Bookmark size={16} aria-hidden="true" />}
          tooltip="사용자가 콘텐츠를 저장한 횟수 — 지속 관심도 지표"
        />
        <KPICard
          title="바이럴 계수"
          value={kpi.viral}
          sub="확산 지수"
          trend={isZero ? 0 : parseFloat(trendPct[viewMode].viral)}
          trendLabel="전기간 대비"
          icon={<Zap size={16} aria-hidden="true" />}
          valueColor="text-brand-green"
          tooltip="공유·저장 기반으로 산출한 바이럴 확산 지수 (x배) — 높을수록 자생적 확산"
        />
      </div>

      {/* 릴스 평균 조회수 + 등급 분포 — 원본 ViralMetricsSection 보강 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        {/* 릴스 평균 조회수 카드 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          {!canViewAdvancedAnalytics && <AdvancedAnalyticsOverlay />}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">릴스 평균 조회수</span>
            <Eye size={14} className="text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(() => {
              const reels = viralContentData.filter(c => c.type === '릴스' && c.reach > 0)
              return reels.length > 0 ? fmtNumber(Math.floor(reels.reduce((s, c) => s + c.reach, 0) / reels.length)) : '—'
            })()}
          </p>
          <p className="text-sm text-gray-400 mt-1">릴스 콘텐츠 {viralContentData.filter(c => c.type === '릴스').length}건 평균</p>
        </div>
        {/* 등급 분포 도넛 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          {!canViewAdvancedAnalytics && <AdvancedAnalyticsOverlay />}
          <div className="flex items-center gap-1.5 mb-3">
            <Award size={14} className="text-gray-400" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900">콘텐츠 등급 분포</h3>
            <Tooltip content="원본 ContentScoreItem 등급(A~E)에 따라 콘텐츠를 분류합니다." multiline><Info size={11} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <GradeDonut data={viralContentData} />
        </div>
      </div>

      {/* 테이블 가로 스크롤 — 고정 화살표 버튼 */}
      {tableBtnTop !== null && canTableScrollLeft && (
        <button type="button" onClick={() => tableScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })} aria-label="왼쪽으로 스크롤"
          style={{ top: tableBtnTop }}
          className="fixed left-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all">
          <ChevronLeft size={15} />
        </button>
      )}
      {tableBtnTop !== null && canTableScrollRight && (
        <button type="button" onClick={() => tableScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })} aria-label="오른쪽으로 스크롤"
          style={{ top: tableBtnTop }}
          className="fixed right-2 z-30 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg text-gray-500 hover:text-gray-900 transition-all">
          <ChevronRight size={15} />
        </button>
      )}

      {/* 콘텐츠별 바이럴 성과 테이블 (필터·정렬·페이지네이션 보강) */}
      {(() => {
        // 필터링·정렬
        let list = viralContentData
        if (contentFilter !== '전체') list = list.filter(c => c.type === contentFilter)
        if (gradeFilter !== '전체') list = list.filter(c => c.grade === gradeFilter)
        const sorted = [...list].sort((a, b) => {
          switch (contentSort) {
            case 'createdAt': return b.createdAt.localeCompare(a.createdAt)
            case 'views': return b.reach - a.reach
            case 'likes': return b.likes - a.likes
            case 'comments': return b.comments - a.comments
            case 'engagement': return (b.likes + b.comments) - (a.likes + a.comments)
            default: return b.viralScore - a.viralScore
          }
        })
        const totalPages = Math.max(1, Math.ceil(sorted.length / VC_PAGE_SIZE))
        const safePage = Math.min(contentPage, totalPages)
        const paginated = sorted.slice((safePage - 1) * VC_PAGE_SIZE, safePage * VC_PAGE_SIZE)
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900">콘텐츠별 바이럴 성과</h3>
                <p className="text-sm text-gray-500 mt-0.5">총 {sorted.length}건 · {getDateLabel(VIEW_MODE_TO_PERIOD[viewMode], dateOffset)}</p>
              </div>
              <button
                onClick={() => showToast('CSV 파일 다운로드를 시작합니다.', 'success')}
                className="text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                CSV 내보내기
              </button>
            </div>
            {/* 필터·정렬 컨트롤 — 신규 (원본 SortKey/ContentFilter/GradeFilter 보강) */}
            <div className="px-5 py-3 border-b border-gray-50 grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-2 @sm:gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">유형</span>
                <CustomSelect
                  value={contentFilter}
                  onChange={v => { setContentFilter(v as ContentFilter); setContentPage(1) }}
                  options={(['전체', '릴스', '피드', '스토리', '영상', '쇼츠'] as ContentFilter[]).map(f => ({ label: f, value: f }))}
                  className="text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">등급</span>
                <CustomSelect
                  value={gradeFilter}
                  onChange={v => { setGradeFilter(v as GradeFilterT); setContentPage(1) }}
                  options={[
                    { label: '전체', value: '전체' },
                    { label: 'A (우수)', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'C', value: 'C' },
                    { label: 'D', value: 'D' },
                    { label: 'E', value: 'E' },
                    { label: '점수 산정중', value: 'processing' },
                  ]}
                  className="text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">정렬</span>
                <CustomSelect
                  value={contentSort}
                  onChange={v => { setContentSort(v as ContentSort); setContentPage(1) }}
                  options={[
                    { label: '최신순', value: 'createdAt' },
                    { label: '조회 많은순', value: 'views' },
                    { label: '좋아요 많은순', value: 'likes' },
                    { label: '댓글 많은순', value: 'comments' },
                    { label: '참여 많은순', value: 'engagement' },
                  ]}
                  className="text-sm"
                />
              </label>
            </div>
            <div className="relative" ref={tableWrapperRef}>
              {canTableScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
              {canTableScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
              <div className="overflow-x-auto scrollbar-none" ref={tableScrollRef}>
              <table className="w-full" ref={tableRef}>
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    {['콘텐츠', '캠페인', '인플루언서', '플랫폼', '유형', '등급', '도달', '좋아요', '댓글', '저장', '공유', '바이럴 점수'].map(h => (
                      <th key={h} scope="col" className="text-left text-sm font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(item => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-gray-50"
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedContent(item)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedContent(item) } }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Image size={14} className="text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-900 whitespace-nowrap">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {CAMPAIGN_MATCH_MAP[item.id] ? (
                          <Tooltip content={`${CAMPAIGN_MATCH_MAP[item.id].uploadPeriodLabel}`}>
                            <span className="inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-brand-green-bg text-brand-green-text whitespace-nowrap">
                              <Megaphone size={10} aria-hidden="true" />
                              {CAMPAIGN_MATCH_MAP[item.id].campaignName}
                            </span>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{item.influencer}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PlatformBadge platform={item.platform} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-sm font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${CONTENT_TYPE_STYLE[item.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-700'}`}>{item.type}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <GradePill grade={item.grade} />
                      </td>
                      <td className="py-3 px-4 text-base text-gray-700 font-medium whitespace-nowrap">{item.reach > 0 ? fmtNumber(item.reach) : '—'}</td>
                      <td className="py-3 px-4 text-base text-gray-700 whitespace-nowrap">{item.likes > 0 ? fmtNumber(item.likes) : '—'}</td>
                      <td className="py-3 px-4 text-base text-gray-700 whitespace-nowrap">{item.comments > 0 ? fmtNumber(item.comments) : '—'}</td>
                      <td className="py-3 px-4 text-base text-gray-700 whitespace-nowrap">{item.saves > 0 ? fmtNumber(item.saves) : '—'}</td>
                      <td className="py-3 px-4 text-base text-gray-700 whitespace-nowrap">{item.shares > 0 ? fmtNumber(item.shares) : '—'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.grade === 'processing' ? (
                          <span className="text-sm text-gray-500">산정 중</span>
                        ) : (
                          <div className="flex items-center gap-2 min-w-[110px]">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${item.viralScore}%`,
                                  backgroundColor: item.viralScore >= 80 ? 'var(--color-brand-green)' : item.viralScore >= 50 ? CHART_COLORS.warn : CHART_COLORS.inactive
                                }}
                              />
                            </div>
                            <span className={`text-base font-bold ${item.viralScore >= 80 ? 'text-brand-green' : item.viralScore >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>
                              {item.viralScore}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-sm text-gray-400">조건에 맞는 콘텐츠가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
            {/* 페이지네이션 */}
            <Pagination
              total={sorted.length}
              page={safePage}
              pageSize={VC_PAGE_SIZE}
              onChange={setContentPage}
            />
          </div>
        )
      })()}
    </div>
    </>
  )
}

/** 등급 배지 — 원본 ScorePill 동등 */
/** 심화 분석 잠금 overlay — Scale 미만 플랜에서 카드 위에 표시 */
function AdvancedAnalyticsOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/80 backdrop-blur-[2px]">
      <Lock size={20} className="text-gray-400" aria-hidden="true" />
      <p className="text-sm font-medium text-gray-600">Scale 이상 플랜에서 이용 가능합니다</p>
      <Link
        to="/subscription"
        className="mt-1 text-sm font-semibold text-brand-green hover:underline"
      >
        업그레이드 →
      </Link>
    </div>
  )
}

function GradePill({ grade }: { grade: ContentGrade }) {
  const cls = grade === 'A' ? 'bg-brand-green-bg text-brand-green-text'
    : grade === 'B' ? 'bg-amber-100 text-amber-700'
    : grade === 'processing' ? 'bg-blue-50 text-blue-600'
    : 'bg-gray-100 text-gray-600'
  const label = grade === 'processing' ? '산정 중' : grade
  return <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
}

/** 등급 분포 도넛 — 원본 DonutChart 동등 (SVG 인라인) */
function GradeDonut({ data }: { data: ViralContent[] }) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, processing: 0 } as Record<ContentGrade, number>
  for (const c of data) counts[c.grade] = (counts[c.grade] ?? 0) + 1
  const arr = [
    { label: 'A 우수', value: counts.A, color: '#8CC63F' },
    { label: 'B', value: counts.B, color: '#f59e0b' },
    { label: 'C', value: counts.C, color: '#9ca3af' },
    { label: 'D', value: counts.D, color: '#d1d5db' },
    { label: 'E', value: counts.E, color: '#e5e7eb' },
    { label: '산정중', value: counts.processing, color: '#3b82f6' },
  ].filter(a => a.value > 0)
  const total = arr.reduce((s, a) => s + a.value, 0)
  if (total === 0) return <p className="text-base text-gray-400 text-center py-8">데이터가 없습니다.</p>
  const cx = 60, cy = 60, r = 50, ir = 32
  let acc = 0
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="콘텐츠 등급 분포 도넛 차트">
        {arr.map(a => {
          const start = (acc / total) * Math.PI * 2 - Math.PI / 2
          acc += a.value
          const end = (acc / total) * Math.PI * 2 - Math.PI / 2
          const large = end - start > Math.PI ? 1 : 0
          const sx = cx + r * Math.cos(start), sy = cy + r * Math.sin(start)
          const ex = cx + r * Math.cos(end), ey = cy + r * Math.sin(end)
          const isx = cx + ir * Math.cos(end), isy = cy + ir * Math.sin(end)
          const iex = cx + ir * Math.cos(start), iey = cy + ir * Math.sin(start)
          const d = `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${ir} ${ir} 0 ${large} 0 ${iex} ${iey} Z`
          return <path key={a.label} d={d} fill={a.color} />
        })}
      </svg>
      <div className="flex-1 grid grid-cols-1 @md:grid-cols-2 gap-x-3 gap-y-1 min-w-[120px]">
        {arr.map(a => (
          <div key={a.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-sm text-gray-700">
              <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
              {a.label}
            </span>
            <span className="text-sm font-semibold text-gray-900">{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 콘텐츠 상세 모달 — @wellink/ui Modal 사용 */
function ContentDetailModal({ content, onClose }: { content: ViralContent | null; onClose: () => void }) {
  const campaignMatch = content ? (CAMPAIGN_MATCH_MAP[content.id] ?? null) : null

  // 점수 시계열 더미 (7포인트)
  const scoreHistory = content && content.grade !== 'processing' ? Array.from({ length: 7 }, (_, i) => {
    const base = Math.max(0, content.performanceScore - (6 - i) * 4 + (i % 3) * 2)
    const mom  = Math.max(0, content.momentumScore  - (6 - i) * 3 + (i % 4) * 3)
    return { label: `D-${6 - i}`, performance: Math.min(100, base), momentum: Math.min(100, mom) }
  }) : []

  const metrics = content ? [
    { label: '도달',   value: content.reach,    icon: <Eye size={13} />,          color: 'text-blue-600' },
    { label: '좋아요', value: content.likes,    icon: <Heart size={13} />,         color: 'text-rose-500' },
    { label: '댓글',   value: content.comments, icon: <MessageCircle size={13} />, color: 'text-amber-600' },
    { label: '저장',   value: content.saves,    icon: <Bookmark size={13} />,      color: 'text-violet-600' },
    { label: '공유',   value: content.shares,   icon: <Share2 size={13} />,        color: 'text-emerald-600' },
    { label: '바이럴 점수', value: content.viralScore, icon: <TrendingUp size={13} />, color: 'text-brand-green' },
  ] : []

  return (
    <Modal
      open={content !== null}
      onClose={onClose}
      size="md"
      label="콘텐츠 상세"
    >
      {content && (
        <div className="space-y-5">
          {/* 헤더 정보 */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <GradePill grade={content.grade} />
              <PlatformBadge platform={content.platform} />
              <span className="text-sm font-medium text-gray-500">{content.type}</span>
            </div>
            <p className="text-base font-semibold text-gray-900 mt-1 leading-snug">{content.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{content.influencer} · {content.createdAt}</p>
          </div>

          {/* 캠페인 매칭 */}
          {campaignMatch && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-green-bg border border-brand-green-border rounded-xl">
              <Megaphone size={14} className="text-brand-green-text shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-green-text">{campaignMatch.campaignName}</p>
                <p className="text-sm text-brand-green-text/70">{campaignMatch.uploadPeriodLabel}</p>
              </div>
            </div>
          )}

          {/* 주요 지표 그리드 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">주요 지표</h4>
            <div className="grid grid-cols-3 gap-2">
              {metrics.map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                  <div className={`flex items-center gap-1 mb-1 ${m.color}`}>{m.icon}<span className="text-sm text-gray-500">{m.label}</span></div>
                  <p className="text-base font-bold text-gray-900">
                    {m.value > 0 ? fmtNumber(m.value) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 점수 섹션 */}
          {content.grade !== 'processing' ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">성과 점수</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">퍼포먼스 점수</span>
                    <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교한 누적 조회수 수준" multiline>
                      <Info size={11} className="text-gray-400" />
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{content.performanceScore}</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${content.performanceScore}%` }} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-gray-500">모멘텀 점수</span>
                    <Tooltip content="같은 게시 후 시점의 다른 릴스와 비교한 최근 조회수 증가 속도" multiline>
                      <Info size={11} className="text-gray-400" />
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{content.momentumScore}</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${content.momentumScore}%` }} />
                  </div>
                </div>
              </div>

              {/* 점수 추이 차트 */}
              {scoreHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-violet-500 inline-block rounded" />퍼포먼스</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded" />모멘텀</span>
                  </div>
                  <ScoreHistoryChart data={scoreHistory} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-600">
              점수 산정 중입니다. 게시 후 일정 시간이 지나면 자동으로 산출됩니다.
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

/** 점수 추이 미니 라인 차트 */
function ScoreHistoryChart({ data }: { data: { label: string; performance: number; momentum: number }[] }) {
  const W = 400, H = 120, padL = 8, padR = 8, padT = 8, padB = 24
  const plotW = W - padL - padR, plotH = H - padT - padB
  const stepX = plotW / Math.max(data.length - 1, 1)
  const toY = (v: number) => padT + plotH - (v / 100) * plotH
  const line = (key: 'performance' | 'momentum') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * stepX} ${toY(d[key])}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 120 }} role="img" aria-label="퍼포먼스·모멘텀 점수 추이 차트">
      {[0, 0.5, 1].map(r => (
        <line key={r} x1={padL} y1={padT + plotH - r * plotH} x2={W - padR} y2={padT + plotH - r * plotH} stroke="#e5e7eb" strokeWidth={1} />
      ))}
      <path d={line('performance')} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={line('momentum')} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = padL + i * stepX
        return <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize={8} fill="#9ca3af">{d.label}</text>
      })}
    </svg>
  )
}
