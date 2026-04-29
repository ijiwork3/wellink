import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Bookmark, Eye, Zap, Image, Info, Award } from 'lucide-react'
import { ErrorState, useToast, DateRangePicker, Tooltip, Pagination, fmtNumber, getDateLabel, CHART_COLORS, CONTENT_TYPE_STYLE, CustomSelect, PlatformBadge, type DatePeriod } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'

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
  const VC_PAGE_SIZE = 10

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
          <h1 className="text-xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full leading-none">Beta</span>
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
          <h1 className="text-xl font-bold text-gray-900">바이럴 지표</h1>
          <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full leading-none">Beta</span>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[380px] bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <Zap size={40} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400 mb-1">바이럴 콘텐츠 데이터가 없습니다</p>
          <p className="text-xs text-gray-400 max-w-[220px] mb-4">인플루언서 캠페인 콘텐츠가 게시되면 바이럴 지표가 자동으로 집계됩니다.</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="text-sm font-medium text-white px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover transition-colors"
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
    <div className="space-y-6">
      {/* 헤더 — 제목과 날짜 네비게이션을 분리 (제목 한 행, 날짜 picker 아래 행) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">바이럴 지표</h1>
          <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full leading-none whitespace-nowrap">Beta</span>
        </div>
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
          <p className="text-xs text-amber-700 leading-relaxed">
            데이터는 최근 28일 기준으로 수집됩니다. <strong>월간·연간 수치는 실제와 다를 수 있습니다.</strong>
          </p>
        </div>
      )}

      {/* KPI 카드 4개 — 지표 중심 */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">총 바이럴 도달</span>
            <Eye size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.reach}</p>
          <TrendMiniBar values={trend.reach} color={CHART_COLORS.reach} />
          <p className="text-xs text-brand-green font-medium mt-1">{trendPct[viewMode].reach} 전기간 대비</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">공유 수</span>
            <Share2 size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.shares}</p>
          <TrendMiniBar values={trend.shares} color="var(--color-brand-green)" />
          <p className="text-xs text-brand-green font-medium mt-1">{trendPct[viewMode].shares} 전기간 대비</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">저장 수</span>
            <Bookmark size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.saves}</p>
          <TrendMiniBar values={trend.saves} color={CHART_COLORS.saves} />
          <p className="text-xs text-brand-green font-medium mt-1">{trendPct[viewMode].saves} 전기간 대비</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">바이럴 계수</span>
            <Zap size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-brand-green">{kpi.viral}</p>
          <div className="mt-3 h-8 flex items-center">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: `${isZero ? 0 : Math.max(0, Math.min(100, (rawKpi.viral / 4) * 100))}%` }} />
            </div>
          </div>
          <p className="text-xs text-brand-green font-medium mt-1">{trendPct[viewMode].viral} 전기간 대비</p>
        </div>
      </div>

      {/* 릴스 평균 조회수 + 등급 분포 — 원본 ViralMetricsSection 보강 */}
      <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4">
        {/* 릴스 평균 조회수 카드 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">릴스 평균 조회수</span>
            <Eye size={14} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(() => {
              const reels = viralContentData.filter(c => c.type === '릴스' && c.reach > 0)
              return reels.length > 0 ? fmtNumber(Math.floor(reels.reduce((s, c) => s + c.reach, 0) / reels.length)) : '—'
            })()}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">릴스 콘텐츠 {viralContentData.filter(c => c.type === '릴스').length}건 평균</p>
        </div>
        {/* 등급 분포 도넛 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Award size={14} className="text-gray-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-900">콘텐츠 등급 분포</h3>
            <Tooltip content="원본 ContentScoreItem 등급(A~E)에 따라 콘텐츠를 분류합니다." multiline><Info size={11} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <GradeDonut data={viralContentData} />
        </div>
      </div>

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
                <h3 className="text-sm font-semibold text-gray-900">콘텐츠별 바이럴 성과</h3>
                <p className="text-xs text-gray-500 mt-0.5">총 {sorted.length}건 · {getDateLabel(VIEW_MODE_TO_PERIOD[viewMode], dateOffset)}</p>
              </div>
              <button
                onClick={() => showToast('CSV 파일 다운로드를 시작합니다.', 'success')}
                className="text-xs text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                CSV 내보내기
              </button>
            </div>
            {/* 필터·정렬 컨트롤 — 신규 (원본 SortKey/ContentFilter/GradeFilter 보강) */}
            <div className="px-5 py-3 border-b border-gray-50 grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-2 @sm:gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-500">유형</span>
                <CustomSelect
                  value={contentFilter}
                  onChange={v => { setContentFilter(v as ContentFilter); setContentPage(1) }}
                  options={(['전체', '릴스', '피드', '스토리', '영상', '쇼츠'] as ContentFilter[]).map(f => ({ label: f, value: f }))}
                  className="text-xs"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-500">등급</span>
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
                  className="text-xs"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-500">정렬</span>
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
                  className="text-xs"
                />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    {['콘텐츠', '인플루언서', '플랫폼', '유형', '등급', '도달', '좋아요', '댓글', '저장', '공유', '바이럴 점수'].map(h => (
                      <th key={h} scope="col" className="text-left text-xs font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(item => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Image size={14} className="text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-900 whitespace-nowrap">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{item.influencer}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PlatformBadge platform={item.platform} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${CONTENT_TYPE_STYLE[item.type as keyof typeof CONTENT_TYPE_STYLE] ?? 'bg-gray-100 text-gray-700'}`}>{item.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <GradePill grade={item.grade} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 font-medium">{item.reach > 0 ? fmtNumber(item.reach) : '—'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.likes > 0 ? fmtNumber(item.likes) : '—'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.comments > 0 ? fmtNumber(item.comments) : '—'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.saves > 0 ? fmtNumber(item.saves) : '—'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.shares > 0 ? fmtNumber(item.shares) : '—'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.grade === 'processing' ? (
                          <span className="text-xs text-gray-400">산정 중</span>
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
                            <span className={`text-sm font-bold ${item.viralScore >= 80 ? 'text-brand-green' : item.viralScore >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>
                              {item.viralScore}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-sm text-gray-400">조건에 맞는 콘텐츠가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
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
  )
}

/** 등급 배지 — 원본 ScorePill 동등 */
function GradePill({ grade }: { grade: ContentGrade }) {
  const cls = grade === 'A' ? 'bg-emerald-100 text-emerald-700'
    : grade === 'B' ? 'bg-amber-100 text-amber-700'
    : grade === 'processing' ? 'bg-blue-50 text-blue-600'
    : 'bg-gray-100 text-gray-600'
  const label = grade === 'processing' ? '산정 중' : grade
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

/** 등급 분포 도넛 — 원본 DonutChart 동등 (SVG 인라인) */
function GradeDonut({ data }: { data: ViralContent[] }) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, processing: 0 } as Record<ContentGrade, number>
  for (const c of data) counts[c.grade] = (counts[c.grade] ?? 0) + 1
  const arr = [
    { label: 'A 우수', value: counts.A, color: '#10b981' },
    { label: 'B', value: counts.B, color: '#f59e0b' },
    { label: 'C', value: counts.C, color: '#9ca3af' },
    { label: 'D', value: counts.D, color: '#d1d5db' },
    { label: 'E', value: counts.E, color: '#e5e7eb' },
    { label: '산정중', value: counts.processing, color: '#3b82f6' },
  ].filter(a => a.value > 0)
  const total = arr.reduce((s, a) => s + a.value, 0)
  if (total === 0) return <p className="text-sm text-gray-400 text-center py-8">데이터가 없습니다.</p>
  const cx = 60, cy = 60, r = 50, ir = 32
  let acc = 0
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
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
            <span className="flex items-center gap-1 text-[11px] text-gray-700">
              <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
              {a.label}
            </span>
            <span className="text-[11px] font-semibold text-gray-900">{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
