import { useState, useCallback, useEffect, useRef } from 'react'
import { TrendingUp, MousePointer, ShoppingBag, DollarSign, BarChart2, ExternalLink, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Megaphone, Image as ImageIcon, Info, Sparkles, Loader2 } from 'lucide-react'
import { KPICard, StatusBadge, ErrorState, EmptyState, DateRangePicker, Tooltip, Pagination, fmtNumber, fmtPrice, getRoasColor, getCtrColor, useIsTouchDevice, SkeletonCard } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import { useDeviceMode } from '../qa-mockup-kit'

type Period = '일간' | '주간' | '월간' | '연간'

/** 기간별 KPI 데이터 — Meta 유료 광고 기준 (원본 KPI 8개로 확장) */
type KpiBundle = {
  spend: number; roas: number; results: number; costPerResult: number
  reach: number; clicks: number; ctr: number; cpc: number
  trends: { spend: number; roas: number; results: number; costPerResult: number; reach: number; clicks: number; ctr: number; cpc: number }
}
const kpiByPeriod: Record<Period, KpiBundle> = {
  일간: { spend: 72000,    roas: 3.6, results: 18,    costPerResult: 4000, reach: 13800,   clicks: 350,    ctr: 1.4, cpc: 206,
    trends: { spend: 5.2, roas: 2.1, results: 8.4, costPerResult: -3.1, reach: 3.8, clicks: 12.0, ctr: 1.6, cpc: -2.5 } },
  주간: { spend: 486000,   roas: 3.8, results: 124,   costPerResult: 3920, reach: 96000,   clicks: 2410,   ctr: 1.5, cpc: 202,
    trends: { spend: 9.3, roas: 3.4, results: 11.2, costPerResult: -4.5, reach: 6.2, clicks: 18.5, ctr: 2.2, cpc: -3.8 } },
  월간: { spend: 1950000,  roas: 4.1, results: 512,   costPerResult: 3810, reach: 386000,  clicks: 9820,   ctr: 1.5, cpc: 199,
    trends: { spend: 14.8, roas: 7.6, results: 14.3, costPerResult: -5.2, reach: 11.2, clicks: 22.3, ctr: 3.1, cpc: -4.6 } },
  연간: { spend: 23400000, roas: 4.3, results: 6240,  costPerResult: 3750, reach: 4600000, clicks: 117840, ctr: 1.6, cpc: 198,
    trends: { spend: 32.1, roas: 18.9, results: 24.5, costPerResult: -7.4, reach: 28.4, clicks: 41.2, ctr: 5.8, cpc: -6.2 } },
}

/** AI 광고 성과 분석 더미 (원본 useGetAdInsightAI 동등) */
const AD_AI_SUMMARY = `최근 30일 광고 성과 요약

• 총 광고 지출이 직전 대비 +14.8% 증가했고, 그에 따른 ROAS도 4.1로 안정 구간에 있습니다.
• 결과당 비용이 -5.2%로 내려가 캠페인 효율이 개선되는 흐름입니다. 특히 릴스 부스팅 소재의 CTR이 1.5%로 가장 높아 비중을 더 늘려볼 만합니다.
• 도달 대비 클릭률(CTR)이 일관되게 1.4~1.6% 수준이라, 새로운 타겟 세그먼트 추가로 외연을 넓혀볼 시점입니다.`

/** 섹션별 도움말 (원본 AD_SECTION_HINTS 보강) */
const AD_SECTION_HINTS_KO = {
  dailyPerformance: '매일의 광고 지출과 클릭 수를 함께 추적하는 지표입니다. 지출이 늘어날 때 클릭도 함께 증가하면 광고 효율이 안정적이라는 뜻입니다.',
  ctrTrend: 'CTR은 클릭 수 ÷ 노출 수 × 100으로 계산하는 클릭률입니다. 광고를 본 사람 중 얼마나 관심을 보였는지 나타내며, 일반적으로 높을수록 광고 소재와 타게팅 반응이 좋다고 볼 수 있습니다.',
  dailyClicks: '클릭 수는 광고를 눌러 실제로 반응한 횟수입니다. 단순 노출보다 한 단계 더 적극적인 관심을 의미합니다.',
  reachSource: '광고 도달이 어느 채널(피드/스토리/릴스)에서 발생했는지를 보여주는 지표입니다.',
  engagementSource: '광고 참여(클릭/좋아요/댓글)가 어느 채널에서 발생했는지를 보여주는 지표입니다.',
}

/** Meta 광고 캠페인 + 광고세트 + 소재 3단계 계층 더미 (원본 CampaignHierarchy 동등, 100개) */
type Ad = { id: string; adId: string; adName: string; message: string; thumbnailUrl?: string; status: string; spend: number; roas: number; reach: number; clicks: number; ctr: number; cpc: number }
type AdSet = { id: string; name: string; status: string; spend: number; roas: number; results: number; costPerResult: number; reach: number; clicks: number; ctr: number; cpc: number; ads: Ad[] }
type CampaignHierarchy = { campaignId: string; campaignName: string; objective: string; status: '게재중' | '일시중지' | '종료'; totalSpend: number; roas: number; totalResults: number; costPerResult: number; totalReach: number; totalClicks: number; ctr: number; cpc: number; adSets: AdSet[] }
const OBJECTIVES = ['인지도', '전환', '트래픽'] as const
const CAMPAIGN_NAMES = [
  '브랜드 인지도 — 릴스 부스팅', '신제품 론칭 — 전환 캠페인', '리타겟팅 — 웹사이트 방문자', '팔로워 확보 — 프로필 방문 유도',
  '시즌 세일 — 한정 쿠폰', '프리미엄 라인 — 영상 광고', '여름 한정 — 스토리 광고', '겨울 한정 — 릴스 광고',
  '신규 회원 — 가입 유도', '리스타팅 — 휴면 고객 부활',
]
const AD_FORMATS = ['릴스 광고', '피드 이미지', '스토리 광고', '카루셀 광고']
const buildCampaignHierarchy = (count: number): CampaignHierarchy[] =>
  Array.from({ length: count }, (_, i) => {
    const isPaused = i % 7 === 6
    const isClosed = i % 11 === 10
    const status: '게재중' | '일시중지' | '종료' = isClosed ? '종료' : isPaused ? '일시중지' : '게재중'
    const baseSpend = 200000 + (i * 33000) % 800000
    const roas = +(2.5 + (i % 7) * 0.5).toFixed(1)
    const totalReach = baseSpend / 6 + (i * 1700) % 50000
    const totalClicks = Math.floor(totalReach * (0.012 + (i % 5) * 0.003))
    const ctr = +((totalClicks / Math.max(totalReach, 1)) * 100).toFixed(2)
    const totalResults = Math.floor(totalClicks * (0.05 + (i % 4) * 0.015))
    const costPerResult = totalResults > 0 ? Math.floor(baseSpend / totalResults) : 0
    const cpc = totalClicks > 0 ? Math.floor(baseSpend / totalClicks) : 0
    // 광고세트 1~3개
    const adSetCount = 1 + (i % 3)
    const adSets: AdSet[] = Array.from({ length: adSetCount }, (_, j) => {
      const setSpend = Math.floor(baseSpend / adSetCount)
      const setReach = Math.floor(totalReach / adSetCount)
      const setClicks = Math.floor(totalClicks / adSetCount)
      const adCount = 1 + ((i + j) % 3)
      const ads: Ad[] = Array.from({ length: adCount }, (_, k) => ({
        id: `ad-${i}-${j}-${k}`,
        adId: `ad-${i}-${j}-${k}`,
        adName: `${AD_FORMATS[(i + j + k) % AD_FORMATS.length]} #${k + 1}`,
        message: `광고 메시지 ${i + 1}-${j + 1}-${k + 1} — 신제품 출시 소식과 한정 혜택을 만나보세요.`,
        status: isClosed ? 'completed' : isPaused ? 'paused' : 'active',
        spend: Math.floor(setSpend / adCount),
        roas,
        reach: Math.floor(setReach / adCount),
        clicks: Math.floor(setClicks / adCount),
        ctr,
        cpc,
      }))
      return {
        id: `set-${i}-${j}`,
        name: `광고세트 ${j + 1}`,
        status: isClosed ? 'completed' : isPaused ? 'paused' : 'active',
        spend: setSpend, roas,
        results: Math.floor(totalResults / adSetCount),
        costPerResult,
        reach: setReach, clicks: setClicks, ctr, cpc,
        ads,
      }
    })
    return {
      campaignId: `camp-${i + 1}`,
      campaignName: i < CAMPAIGN_NAMES.length ? CAMPAIGN_NAMES[i] : `${CAMPAIGN_NAMES[i % CAMPAIGN_NAMES.length]} #${Math.floor(i / CAMPAIGN_NAMES.length) + 1}`,
      objective: OBJECTIVES[i % OBJECTIVES.length],
      status,
      totalSpend: baseSpend,
      roas,
      totalResults,
      costPerResult,
      totalReach,
      totalClicks,
      ctr,
      cpc,
      adSets,
    }
  })
const ALL_CAMPAIGNS: CampaignHierarchy[] = buildCampaignHierarchy(100)

/** 기간별 시계열 더미 데이터 (지출/클릭/CTR) */
const buildChartDataByPeriod = (): Record<Period, { date: string; spend: number; clicks: number; ctr: number }[]> => {
  const today = new Date()
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (29 - i))
    const spend = 50000 + (i * 1200) + ((i * 31) % 25000)
    const clicks = Math.floor(spend / (200 + (i % 5) * 10))
    const reach = Math.floor(spend / 8 + (i * 850) % 8000)
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const spend = 350000 + (i * 15000) + ((i * 43) % 90000)
    const clicks = Math.floor(spend / (205 + (i % 5) * 8))
    const reach = Math.floor(spend / 8 + (i * 5500) % 40000)
    return { date: `${Math.floor(i / 4) + 1}월${(i % 4) + 1}주`, spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const spend = 1200000 + (i * 80000) + ((i * 170) % 600000)
    const clicks = Math.floor(spend / (195 + (i % 5) * 6))
    const reach = Math.floor(spend / 8 + (i * 25000) % 200000)
    return { date: MONTHS[i], spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  const yearly = Array.from({ length: 5 }, (_, i) => {
    const spend = 12000000 + i * 3000000
    const clicks = Math.floor(spend / 200)
    const reach = Math.floor(spend / 8)
    return { date: `${2021 + i}년`, spend, clicks, ctr: +((clicks / Math.max(reach, 1)) * 100).toFixed(2) }
  })
  return { 일간: daily, 주간: weekly, 월간: monthly, 연간: yearly }
}
const CHART_DATA_BY_PERIOD = buildChartDataByPeriod()

const CHART_PERIOD_LABEL: Record<Period, string> = { 일간: '일별', 주간: '주별', 월간: '월별', 연간: '연도별' }

/** 광고 소재 유형별 성과 — CPM은 업계 평균 기준 (₩5K~₩18K) */
const adFormatPerf = [
  { format: '릴스 광고', impressions: 218000, clicks: 3270, ctr: 1.50, cpm: 8400 },
  { format: '피드 이미지', impressions: 124000, clicks: 1610, ctr: 1.30, cpm: 11200 },
  { format: '스토리 광고', impressions: 88000,  clicks: 1230, ctr: 1.40, cpm: 6800 },
]


function getAdStatusBadge(status: string): { label: string; cls: string } {
  // 채도 v2: bg-X-100 + text-X-700/800 일관
  if (status === 'active')    return { label: '게재중',   cls: 'bg-emerald-100 text-emerald-700' }
  if (status === 'paused')    return { label: '일시중지', cls: 'bg-amber-100 text-amber-800' }
  return                             { label: '종료',     cls: 'bg-red-100 text-red-500' }
}

function getObjectiveBadge(obj: string) {
  // 채도 v2: bg-X-100 + text-X-700 일관
  switch (obj) {
    case '인지도': return 'bg-blue-100 text-blue-700'
    case '전환':   return 'bg-purple-100 text-purple-700'
    case '트래픽': return 'bg-sky-100 text-sky-700'
    default:      return 'bg-gray-100 text-gray-600'
  }
}

function RoasBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  // data-policy-v1: ROAS ≥3.0 녹색 / ≥1.5 amber / >0 빨강
  const color = value >= 3.0 ? 'var(--color-brand-green)' : value >= 1.5 ? 'var(--color-roas-warning)' : value > 0 ? 'var(--color-roas-danger)' : 'var(--color-chart-empty)'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className={`text-base font-semibold ${getRoasColor(value)}`}>
        {value > 0 ? `${value}x` : '—'}
      </span>
    </div>
  )
}

export default function AdPerformance() {
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const isDesktop = useDeviceMode() === 'desktop'
  const [period, setPeriod] = useState<Period>('월간')
  const [dateOffset, setDateOffset] = useState(0)
  // 신규 — 진행중/종료 상태 탭 + 페이지네이션 + 확장된 캠페인 hover state (원본 보강)
  const [statusTab, setStatusTab] = useState<'active' | 'paused'>('active')
  const [campaignPage, setCampaignPage] = useState(1)
  const CAMPAIGN_PAGE_SIZE = 10
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(
    ALL_CAMPAIGNS.find(c => c.status !== '종료')?.campaignId ?? null
  )
  const [expandedAdSet, setExpandedAdSet] = useState<string | null>(null)
  const [aiRefreshing, setAiRefreshing] = useState(false)
  const aiRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 터치 디바이스 감지
  const isTouch = useIsTouchDevice()

  // 각 차트별 active index
  const [mixedChartIdx, setMixedChartIdx] = useState<number | null>(null)
  const [ctrChartIdx, setCtrChartIdx] = useState<number | null>(null)
  const [clicksChartIdx, setClicksChartIdx] = useState<number | null>(null)

  // 차트 스크롤 ref/state (MixedChart용)
  const mixedChartScrollRef = useRef<HTMLDivElement>(null)
  const [mixedCanScrollLeft, setMixedCanScrollLeft] = useState(false)
  const [mixedCanScrollRight, setMixedCanScrollRight] = useState(false)

  // CTR 차트 스크롤
  const ctrChartScrollRef = useRef<HTMLDivElement>(null)
  const [ctrCanScrollLeft, setCtrCanScrollLeft] = useState(false)
  const [ctrCanScrollRight, setCtrCanScrollRight] = useState(false)

  // 클릭 차트 스크롤
  const clicksChartScrollRef = useRef<HTMLDivElement>(null)
  const [clicksCanScrollLeft, setClicksCanScrollLeft] = useState(false)
  const [clicksCanScrollRight, setClicksCanScrollRight] = useState(false)

  // AI 분석 새로고침 — setTimeout cleanup
  const handleAiRefresh = useCallback(() => {
    if (aiRefreshing) return
    setAiRefreshing(true)
    aiRefreshTimerRef.current = setTimeout(() => setAiRefreshing(false), 1800)
  }, [aiRefreshing])

  useEffect(() => {
    return () => {
      if (aiRefreshTimerRef.current !== null) clearTimeout(aiRefreshTimerRef.current)
    }
  }, [])

  // 기간·날짜 변경 시 캠페인 상세 패널 리셋 — 다른 기간 데이터가 열린 채로 보이는 혼란 방지
  useEffect(() => {
    setExpandedCampaign(null)
    setExpandedAdSet(null)
    setCampaignPage(1)
  }, [period, dateOffset])

  // period/isTouch 변경 시 touch 기본값 설정 (마지막 포인트) + 스크롤 위치 초기화
  useEffect(() => {
    const chartData = CHART_DATA_BY_PERIOD[period]
    if (isTouch) {
      const n = chartData.length
      setMixedChartIdx(n - 1)
      setCtrChartIdx(n - 1)
      setClicksChartIdx(n - 1)
      // 모바일: 마지막 포인트(활성 툴팁)가 보이도록 오른쪽 끝으로 스크롤
      requestAnimationFrame(() => {
        mixedChartScrollRef.current?.scrollTo({ left: mixedChartScrollRef.current.scrollWidth })
        ctrChartScrollRef.current?.scrollTo({ left: ctrChartScrollRef.current.scrollWidth })
        clicksChartScrollRef.current?.scrollTo({ left: clicksChartScrollRef.current.scrollWidth })
      })
    } else {
      setMixedChartIdx(null)
      setCtrChartIdx(null)
      setClicksChartIdx(null)
      // PC: 처음으로 스크롤 초기화
      requestAnimationFrame(() => {
        mixedChartScrollRef.current?.scrollTo({ left: 0 })
        ctrChartScrollRef.current?.scrollTo({ left: 0 })
        clicksChartScrollRef.current?.scrollTo({ left: 0 })
      })
    }
  }, [period, isTouch])

  // MixedChart 스크롤 상태 추적
  useEffect(() => {
    const el = mixedChartScrollRef.current
    if (!el) return
    const update = () => {
      setMixedCanScrollLeft(el.scrollLeft > 2)
      setMixedCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  // CTR 차트 스크롤 상태 추적
  useEffect(() => {
    const el = ctrChartScrollRef.current
    if (!el) return
    const update = () => {
      setCtrCanScrollLeft(el.scrollLeft > 2)
      setCtrCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  // 클릭 차트 스크롤 상태 추적
  useEffect(() => {
    const el = clicksChartScrollRef.current
    if (!el) return
    const update = () => {
      setClicksCanScrollLeft(el.scrollLeft > 2)
      setClicksCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  const headerRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* ── QA: 로딩 — 공통 SkeletonCard ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-4 w-56 bg-gray-100 animate-pulse rounded-xl" />
          </div>
          <div className="h-9 w-48 bg-gray-100 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} height={128} />)}
        </div>
        <SkeletonCard height={256} />
        <SkeletonCard height={160} />
      </div>
    )
  }

  /* ── QA: 에러 ── */
  if (qa === 'error') {
    return <ErrorState message="광고 성과 데이터를 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900">광고 성과</h1>
          <p className="text-base text-gray-500 mt-0.5">Meta 광고 캠페인 성과 및 전환 분석</p>
        </div>
        <InstagramConnectPrompt featureName="광고 성과" />
      </div>
    )
  }

  /* ── QA: 빈 상태 — 공통 EmptyState ── */
  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full max-w-sm">
          <EmptyState
            size="lg"
            icon={<BarChart2 size={40} />}
            title="집행 중인 Meta 광고가 없습니다"
            description="Meta 광고를 집행하면 성과 데이터가 여기에 표시됩니다."
            action={
              <button
                type="button"
                onClick={() => window.open('https://business.facebook.com/ads/manager/', '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded-lg px-2 py-1"
              >
                <ExternalLink size={12} aria-hidden="true" />Meta 광고 관리자 열기
              </button>
            }
          />
        </div>
      </div>
    )
  }

  const isZero = qa === 'zero'
  const kpi = kpiByPeriod[period]
  const chartData = CHART_DATA_BY_PERIOD[period]
  const chartPeriodLabel = CHART_PERIOD_LABEL[period]

  return (
    <div className="space-y-6">
      {isZero && (
        <div className="bg-blue-100 border border-blue-200 text-blue-800 text-sm px-4 py-2 rounded-xl">
          광고가 방금 시작되었습니다. 데이터 집계까지 최대 24시간이 소요될 수 있습니다.
        </div>
      )}

      {/* 헤더 */}
      <div ref={headerRef} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900">광고 성과</h1>
          <p className="text-base text-gray-500 mt-0.5">Meta 광고 캠페인 성과 및 전환 분석</p>
        </div>
        <button
          onClick={() => window.open('https://business.facebook.com/ads/manager/', '_blank', 'noopener,noreferrer')}
          className="shrink-0 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 border border-gray-200 rounded-lg bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
        >
          <ExternalLink size={12} aria-hidden="true" />
          Meta 광고 관리자
        </button>
      </div>

      {/* 기간 선택기 — sticky: 데스크톱 top-0, 모바일/태블릿 top-12 */}
      <div className={`sticky z-20 !mt-2 -mx-4 px-4 @sm:-mx-6 @sm:px-6 @lg:-mx-8 @lg:px-8 py-2.5 transition-colors ${isStuck ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' : 'border-b border-transparent'} ${isDesktop ? 'top-0' : 'top-12'}`}>
        <DateRangePicker
          period={period}
          dateOffset={dateOffset}
          onPeriodChange={setPeriod}
          onDateOffsetChange={setDateOffset}
          compact={!isDesktop}
        />
      </div>

      {/* AI 광고 성과 분석 카드 — 원본 AIAnalysisCard 보강 */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-gray-900">AI 광고 성과 분석</h3>
          </div>
          <button
            onClick={handleAiRefresh}
            disabled={aiRefreshing}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/50"
          >
            {aiRefreshing ? (
              <>
                <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                분석 중…
              </>
            ) : (
              <>
                <Sparkles size={12} aria-hidden="true" />
                다시 분석
              </>
            )}
          </button>
        </div>
        {aiRefreshing ? (
          <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="AI 분석 진행 중">
            <div className="h-3 w-3/4 bg-purple-200/50 rounded-xl" />
            <div className="h-3 w-full bg-purple-200/50 rounded-xl" />
            <div className="h-3 w-5/6 bg-purple-200/50 rounded-xl" />
            <div className="h-3 w-2/3 bg-purple-200/50 rounded-xl" />
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{AD_AI_SUMMARY}</p>
        )}
      </div>

      {/* KPI 카드 8개 — 원본 KPI_LABELS 동등 (지출/ROAS/결과/결과당비용/도달/클릭/CTR/CPC) */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="광고 지출"
          value={isZero ? '₩0' : fmtPrice(kpi.spend)}
          sub={period === '일간' ? '오늘' : period === '주간' ? '이번 주' : period === '월간' ? '이번 달' : '올해 누적'}
          trend={isZero ? 0 : kpi.trends.spend}
          trendLabel="전기간 대비"
          icon={<DollarSign size={16} aria-hidden="true" />}
          tooltip="Meta 광고 관리자에서 집행된 총 광고 비용"
        />
        <KPICard
          title="ROAS"
          value={isZero ? '—' : `${kpi.roas}x`}
          sub="광고비 대비 매출"
          trend={isZero ? 0 : kpi.trends.roas}
          trendLabel="전기간 대비"
          icon={<ShoppingBag size={16} aria-hidden="true" />}
          valueColor={getRoasColor(isZero ? 0 : kpi.roas)}
          tooltip="광고 지출 1원당 발생한 매출 (≥4.0x 우수)"
        />
        <KPICard
          title="결과"
          value={isZero ? '0' : fmtNumber(kpi.results)}
          sub="목표 달성 건수"
          trend={isZero ? 0 : kpi.trends.results}
          trendLabel="전기간 대비"
          icon={<TrendingUp size={16} aria-hidden="true" />}
          tooltip="광고 목표(구매·문의·가입 등) 달성 총 건수"
        />
        <KPICard
          title="결과당 비용"
          value={isZero ? '₩0' : fmtPrice(kpi.costPerResult)}
          sub="목표 1건당 평균"
          trend={isZero ? 0 : kpi.trends.costPerResult}
          trendLabel="전기간 대비"
          icon={<DollarSign size={16} aria-hidden="true" />}
          tooltip="목표 1건을 달성하는 데 든 평균 비용 — 낮을수록 효율 ↑"
        />
        <KPICard
          title="총 도달"
          value={isZero ? '0' : fmtNumber(kpi.reach)}
          sub="고유 사용자"
          trend={isZero ? 0 : kpi.trends.reach}
          trendLabel="전기간 대비"
          icon={<TrendingUp size={16} aria-hidden="true" />}
          tooltip="광고를 1회 이상 본 고유 사용자 수"
        />
        <KPICard
          title="총 클릭"
          value={isZero ? '0' : fmtNumber(kpi.clicks)}
          sub="링크 클릭 합산"
          trend={isZero ? 0 : kpi.trends.clicks}
          trendLabel="전기간 대비"
          icon={<MousePointer size={16} aria-hidden="true" />}
          tooltip="광고 내 링크를 클릭한 횟수"
        />
        <KPICard
          title="평균 CTR"
          value={isZero ? '0%' : `${kpi.ctr}%`}
          sub="클릭률"
          trend={isZero ? 0 : kpi.trends.ctr}
          trendLabel="전기간 대비"
          valueColor={getCtrColor(isZero ? 0 : kpi.ctr)}
          icon={<MousePointer size={16} aria-hidden="true" />}
          tooltip="클릭 ÷ 노출 × 100 — 광고 소재·타게팅 효과 지표"
        />
        <KPICard
          title="평균 CPC"
          value={isZero ? '₩0' : fmtPrice(kpi.cpc)}
          sub="클릭 1회당"
          trend={isZero ? 0 : kpi.trends.cpc}
          trendLabel="전기간 대비"
          icon={<DollarSign size={16} aria-hidden="true" />}
          tooltip="클릭 1회당 평균 광고 비용 — 낮을수록 효율 ↑"
        />
      </div>

      {/* Meta 광고 캠페인별 성과 — 진행중/종료 탭 + 캠페인 → 광고세트 → 소재 3단계 계층 (원본 보강) */}
      {(() => {
        const activeCampaigns = ALL_CAMPAIGNS.filter(c => c.status !== '종료')
        const closedCampaigns = ALL_CAMPAIGNS.filter(c => c.status === '종료')
        const visibleList = isZero ? [] : (statusTab === 'active' ? activeCampaigns : closedCampaigns)
        const totalPages = Math.max(1, Math.ceil(visibleList.length / CAMPAIGN_PAGE_SIZE))
        const safePage = Math.min(campaignPage, totalPages)
        const pagedCampaigns = visibleList.slice((safePage - 1) * CAMPAIGN_PAGE_SIZE, safePage * CAMPAIGN_PAGE_SIZE)
        const maxRoas = Math.max(1, ...visibleList.map(x => x.roas))
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">캠페인별 성과</h3>
                <p className="text-sm text-gray-400 mt-0.5">Meta 광고 관리자 기준 — 캠페인 → 광고세트 → 소재 3단계</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-green inline-block" />≥4.0x 우수</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{'<'}2.0x 주의</span>
              </div>
            </div>
            {/* 상태 탭 — 진행중 / 종료 */}
            <div className="flex gap-2 px-5 py-3 border-b border-gray-50">
              <button
                onClick={() => { setStatusTab('active'); setCampaignPage(1); setExpandedCampaign(null) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                  statusTab === 'active' ? 'bg-brand-green-bg text-brand-green-text' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >진행중 {activeCampaigns.length}</button>
              <button
                onClick={() => { setStatusTab('paused'); setCampaignPage(1); setExpandedCampaign(null) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                  statusTab === 'paused' ? 'bg-brand-green-bg text-brand-green-text' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >종료 {closedCampaigns.length}</button>
            </div>
            {pagedCampaigns.length === 0 ? (
              <div className="py-12 text-center text-base text-gray-400">
                {visibleList.length === 0 ? '해당 상태의 캠페인이 없습니다.' : '결과가 없습니다.'}
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {pagedCampaigns.map(c => {
                  const isCampaignOpen = expandedCampaign === c.campaignId
                  return (
                    <div key={c.campaignId} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                      <button
                        onClick={() => { setExpandedCampaign(isCampaignOpen ? null : c.campaignId); setExpandedAdSet(null) }}
                        aria-expanded={isCampaignOpen}
                        aria-controls={`campaign-detail-${c.campaignId}`}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 shrink-0">
                            <Megaphone size={16} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-base text-gray-900 break-words">{c.campaignName}</span>
                              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getObjectiveBadge(c.objective)}`}>{c.objective}</span>
                              <StatusBadge status={c.status} dot={false} />
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">광고세트 {c.adSets.length}개</p>
                          </div>
                        </div>
                        {isCampaignOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" aria-hidden="true" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" aria-hidden="true" />}
                      </button>
                      {isCampaignOpen && (
                        <div className="border-t border-gray-100 p-4" id={`campaign-detail-${c.campaignId}`}>
                          {/* 캠페인 KPI 8개 — 원본 동등 */}
                          <div className="grid grid-cols-2 @lg:grid-cols-4 gap-x-4 gap-y-3 mb-4">
                            {([
                              { k: '지출', v: fmtPrice(c.totalSpend) },
                              { k: 'ROAS', v: `${c.roas}x` },
                              { k: '결과', v: fmtNumber(c.totalResults) },
                              { k: '결과당 비용', v: fmtPrice(c.costPerResult) },
                              { k: '도달', v: fmtNumber(c.totalReach) },
                              { k: '클릭', v: fmtNumber(c.totalClicks) },
                              { k: 'CTR', v: `${c.ctr}%` },
                              { k: 'CPC', v: fmtPrice(c.cpc) },
                            ] as const).map(item => (
                              <div key={item.k}>
                                <p className="text-sm text-gray-500">{item.k}</p>
                                <p className="text-sm font-medium text-gray-900">{item.v}</p>
                              </div>
                            ))}
                          </div>
                          {/* 광고세트 리스트 */}
                          <div className="space-y-2">
                            {c.adSets.map(set => {
                              const isSetOpen = expandedAdSet === set.id
                              return (
                                <div key={set.id} className="rounded-lg border border-gray-100 bg-gray-50/50">
                                  <button
                                    onClick={() => setExpandedAdSet(isSetOpen ? null : set.id)}
                                    aria-expanded={isSetOpen}
                                    aria-controls={`adset-detail-${set.id}`}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-600 shrink-0">
                                        <Megaphone size={12} aria-hidden="true" />
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-900">{set.name}</span>
                                        <span className="ml-2 text-sm text-gray-500">소재 {set.ads.length}개</span>
                                      </div>
                                    </div>
                                    {isSetOpen ? <ChevronUp size={14} className="text-gray-400" aria-hidden="true" /> : <ChevronDown size={14} className="text-gray-400" aria-hidden="true" />}
                                  </button>
                                  {isSetOpen && (
                                    <div className="border-t border-gray-100 p-3" id={`adset-detail-${set.id}`}>
                                      {/* 광고세트 KPI */}
                                      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-x-3 gap-y-2 mb-3">
                                        {([
                                          { k: '지출', v: fmtPrice(set.spend) },
                                          { k: 'ROAS', v: `${set.roas}x` },
                                          { k: '결과', v: fmtNumber(set.results) },
                                          { k: '결과당비용', v: fmtPrice(set.costPerResult) },
                                          { k: '도달', v: fmtNumber(set.reach) },
                                          { k: '클릭', v: fmtNumber(set.clicks) },
                                          { k: 'CTR', v: `${set.ctr}%` },
                                          { k: 'CPC', v: fmtPrice(set.cpc) },
                                        ] as const).map(item => (
                                          <div key={item.k}>
                                            <p className="text-sm text-gray-500">{item.k}</p>
                                            <p className="text-sm font-medium text-gray-900">{item.v}</p>
                                          </div>
                                        ))}
                                      </div>
                                      {/* 소재 리스트 */}
                                      <div className="space-y-2">
                                        {set.ads.map(ad => (
                                          <div key={ad.id} className="flex gap-3 border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                                            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                                              <ImageIcon size={16} aria-hidden="true" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-sm font-bold bg-brand-green-bg text-brand-green-text px-2 py-1 rounded">소재</span>
                                                <span className="text-sm font-medium text-gray-900">{ad.adName}</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getAdStatusBadge(ad.status).cls}`}>
                                                  {getAdStatusBadge(ad.status).label}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{ad.message}</p>
                                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                                                <span>지출 <strong className="text-gray-900">{fmtPrice(ad.spend)}</strong></span>
                                                <span>ROAS <strong className={getRoasColor(ad.roas)}>{ad.roas}x</strong></span>
                                                <span>도달 <strong className="text-gray-900">{fmtNumber(ad.reach)}</strong></span>
                                                <span>클릭 <strong className="text-gray-900">{fmtNumber(ad.clicks)}</strong></span>
                                                <span>CTR <strong className="text-gray-900">{ad.ctr}%</strong></span>
                                                <span>CPC <strong className="text-gray-900">{fmtPrice(ad.cpc)}</strong></span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          {/* ROAS bar — 캠페인 단위 시각화 */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>ROAS 비교</span>
                              <RoasBar value={c.roas} max={maxRoas} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {/* 페이지네이션 */}
            <Pagination
              total={visibleList.length}
              page={safePage}
              pageSize={CAMPAIGN_PAGE_SIZE}
              onChange={p => { setCampaignPage(p); setExpandedCampaign(null) }}
            />
          </div>
        )
      })()}

      {/* 기간별 광고 성과 차트 (지출 bar + 클릭 line) — 원본 MixedBarLineChart 보강 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold text-gray-900">{chartPeriodLabel} 광고 성과</h3>
            <Tooltip content={AD_SECTION_HINTS_KO.dailyPerformance} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" />지출</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" />클릭</span>
          </div>
        </div>
        {/* 가로 스크롤 wrapper */}
        <div className="relative">
          {mixedCanScrollLeft && <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[9]" />}
          {mixedCanScrollRight && <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-[9]" />}
          {mixedCanScrollLeft && (
            <button type="button" onClick={() => mixedChartScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
              aria-label="왼쪽으로 스크롤"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronLeft size={13} aria-hidden="true" />
            </button>
          )}
          {mixedCanScrollRight && (
            <button type="button" onClick={() => mixedChartScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
              aria-label="오른쪽으로 스크롤"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
              <ChevronRight size={13} aria-hidden="true" />
            </button>
          )}
          <div ref={mixedChartScrollRef} className="overflow-x-auto scrollbar-none">
            <MixedChart
              data={chartData}
              activeIndex={mixedChartIdx}
              onActiveIndex={setMixedChartIdx}
              isTouch={isTouch}
            />
          </div>
        </div>
      </div>

      {/* CTR 추이 + 기간별 클릭 — 2열 배치, 원본 LineChart 보강 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className="text-base font-semibold text-gray-900">CTR 추이</h3>
            <Tooltip content={AD_SECTION_HINTS_KO.ctrTrend} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <div className="relative">
            {ctrCanScrollLeft && <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[9]" />}
            {ctrCanScrollRight && <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-[9]" />}
            {ctrCanScrollLeft && (
              <button type="button" onClick={() => ctrChartScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                aria-label="왼쪽으로 스크롤"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                <ChevronLeft size={13} aria-hidden="true" />
              </button>
            )}
            {ctrCanScrollRight && (
              <button type="button" onClick={() => ctrChartScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                aria-label="오른쪽으로 스크롤"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            )}
            <div ref={ctrChartScrollRef} className="overflow-x-auto scrollbar-none">
              <SimpleLineChart
                data={chartData.map(d => ({ label: d.date, value: d.ctr }))}
                stroke="#f97316"
                ariaLabel="CTR 추이 차트"
                activeIndex={ctrChartIdx}
                onActiveIndex={setCtrChartIdx}
                isTouch={isTouch}
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className="text-base font-semibold text-gray-900">{chartPeriodLabel} 클릭</h3>
            <Tooltip content={AD_SECTION_HINTS_KO.dailyClicks} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <div className="relative">
            {clicksCanScrollLeft && <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-[9]" />}
            {clicksCanScrollRight && <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-[9]" />}
            {clicksCanScrollLeft && (
              <button type="button" onClick={() => clicksChartScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                aria-label="왼쪽으로 스크롤"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                <ChevronLeft size={13} aria-hidden="true" />
              </button>
            )}
            {clicksCanScrollRight && (
              <button type="button" onClick={() => clicksChartScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                aria-label="오른쪽으로 스크롤"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50">
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            )}
            <div ref={clicksChartScrollRef} className="overflow-x-auto scrollbar-none">
              <SimpleLineChart
                data={chartData.map(d => ({ label: d.date, value: d.clicks }))}
                stroke="#3b82f6"
                ariaLabel="기간별 클릭 수 추이 차트"
                activeIndex={clicksChartIdx}
                onActiveIndex={setClicksChartIdx}
                isTouch={isTouch}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 도달·참여 출처 도넛 — 원본 DonutChart 보강 (광고 vs 유기적) */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className="text-base font-semibold text-gray-900">도달 출처</h3>
            <Tooltip content={AD_SECTION_HINTS_KO.reachSource} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <DonutChartSimple
            ariaLabel="광고 도달과 유기적 도달 비율 도넛 차트"
            data={[
              { label: '광고 도달', value: kpi.reach, color: '#f97316' },
              { label: '유기적 도달', value: Math.floor(kpi.reach * 0.6), color: '#8b5cf6' },
            ]}
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className="text-base font-semibold text-gray-900">참여 출처</h3>
            <Tooltip content={AD_SECTION_HINTS_KO.engagementSource} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <DonutChartSimple
            ariaLabel="광고 참여와 유기적 참여 비율 도넛 차트"
            data={[
              { label: '광고 참여', value: kpi.clicks, color: '#f97316' },
              { label: '유기적 참여', value: Math.floor(kpi.clicks * 0.45), color: '#8b5cf6' },
            ]}
          />
        </div>
      </div>

      {/* 광고 소재 유형별 성과 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-base font-semibold text-gray-900">소재 유형별 성과</h3>
          <p className="text-sm text-gray-400 mt-0.5">광고 포맷별 효율 비교</p>
        </div>
        <div className="p-5 space-y-4">
          {adFormatPerf.map(f => (
            <div key={f.format} className="flex items-center gap-2 @sm:gap-4">
              <div className="w-20 @sm:w-24 shrink-0">
                <span className="text-sm font-medium text-gray-700">{f.format}</span>
                <p className="text-sm text-gray-400 mt-0.5">CPM {fmtPrice(f.cpm)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">노출 {fmtNumber(f.impressions)}</span>
                  <span className={`text-sm font-semibold ${getCtrColor(f.ctr)}`}>CTR {f.ctr}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${(f.impressions / adFormatPerf[0].impressions) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-14 @sm:w-20 text-right shrink-0">
                <span className="text-sm text-gray-500">클릭 </span>
                <span className="text-sm font-bold text-gray-800">{fmtNumber(f.clicks)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Mixed Bar+Line — 원본 MixedBarLineChart 동등 (SVG 인라인) */
function MixedChart({
  data,
  activeIndex,
  onActiveIndex,
  isTouch,
}: {
  data: { date: string; spend: number; clicks: number; ctr?: number }[]
  activeIndex: number | null
  onActiveIndex: (i: number | null) => void
  isTouch: boolean
}) {
  const W = 700, H = 220, padL = 50, padR = 50, padT = 16, padB = 32
  const plotW = W - padL - padR, plotH = H - padT - padB
  const maxSpend = Math.max(1, ...data.map(d => d.spend))
  const maxClicks = Math.max(1, ...data.map(d => d.clicks))
  const barW = plotW / data.length * 0.6
  const stepX = plotW / Math.max(data.length - 1, 1)
  const svgMinW = Math.max(W, data.length * 44)

  // X축 라벨 간격: data.length 기반
  const labelInterval = data.length > 20 ? 7 : data.length > 8 ? 3 : 1

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="overflow-visible"
      role="img"
      aria-label="기간별 광고 지출(막대)과 클릭 수(선) 추이 차트"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: svgMinW }}
      onMouseMove={!isTouch ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        const svgRelX = ratio * W - padL
        const idx = Math.round(svgRelX / stepX)
        onActiveIndex(Math.max(0, Math.min(data.length - 1, idx)))
      } : undefined}
      onMouseLeave={!isTouch ? () => onActiveIndex(null) : undefined}
      onTouchMove={isTouch ? (e) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = (e.touches[0].clientX - rect.left) / rect.width
        const svgRelX = ratio * W - padL
        const idx = Math.round(svgRelX / stepX)
        onActiveIndex(Math.max(0, Math.min(data.length - 1, idx)))
      } : undefined}
    >
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}
      {/* 좌축 (지출) */}
      {[0, 0.5, 1].map(r => (
        <text key={r} x={padL - 6} y={padT + plotH - r * plotH + 3} textAnchor="end" fontSize={9} fill="#9ca3af">
          {Math.round(r * maxSpend / 1000).toLocaleString()}k
        </text>
      ))}
      {/* 우축 (클릭) */}
      {[0, 0.5, 1].map(r => (
        <text key={r} x={W - padR + 6} y={padT + plotH - r * plotH + 3} textAnchor="start" fontSize={9} fill="#9ca3af">
          {Math.round(r * maxClicks).toLocaleString()}
        </text>
      ))}
      {/* 막대 (지출) */}
      {data.map((d, i) => {
        const x = padL + i * stepX - barW / 2
        const h = (d.spend / maxSpend) * plotH
        return <rect key={i} x={x} y={padT + plotH - h} width={barW} height={h} rx={2} fill="#8b5cf6" fillOpacity={0.8} />
      })}
      {/* 라인 (클릭) */}
      <path
        d={data.map((d, i) => {
          const x = padL + i * stepX
          const y = padT + plotH - (d.clicks / maxClicks) * plotH
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
        }).join(' ')}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
      />
      {data.map((d, i) => {
        const x = padL + i * stepX
        const y = padT + plotH - (d.clicks / maxClicks) * plotH
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#3b82f6" />
      })}
      {/* X축 라벨 — data.length 기반 간격 */}
      {data.map((d, i) => {
        if (i % labelInterval !== 0 && i !== data.length - 1) return null
        const x = padL + i * stepX
        return <text key={i} x={x} y={padT + plotH + 14} textAnchor="middle" fontSize={9} fill="#6b7280">{d.date}</text>
      })}
      {/* active indicator + tooltip */}
      {activeIndex !== null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const x = padL + activeIndex * stepX
        const spendY = padT + plotH - (d.spend / maxSpend) * plotH
        const clicksY = padT + plotH - (d.clicks / maxClicks) * plotH
        const tipW = 140, tipH = 62, tipX = x + (x > W * 0.65 ? -(tipW + 8) : 8)
        return (
          <g key="active-indicator">
            {/* 세로 가이드라인 */}
            <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            {/* active dot (지출 막대 상단) */}
            <circle cx={x} cy={spendY} r={3.5} fill="#8b5cf6" stroke="white" strokeWidth={1.5} />
            {/* active dot (클릭 라인) */}
            <circle cx={x} cy={clicksY} r={3.5} fill="#3b82f6" stroke="white" strokeWidth={1.5} />
            {/* 툴팁 배경 */}
            <rect x={tipX} y={padT + 2} width={tipW} height={tipH} rx={5} fill="white" stroke="#e5e7eb" strokeWidth={1} filter="drop-shadow(0 1px 3px rgba(0,0,0,.08))" />
            {/* 툴팁 텍스트 */}
            <text x={tipX + 8} y={padT + 16} fontSize={9} fill="#6b7280">{d.date}</text>
            <rect x={tipX + 8} y={padT + 23} width={6} height={6} rx={1} fill="#8b5cf6" />
            <text x={tipX + 18} y={padT + 30} fontSize={9} fill="#374151" fontWeight="600">지출 {fmtPrice(d.spend)}</text>
            <rect x={tipX + 8} y={padT + 38} width={6} height={2} rx={1} fill="#3b82f6" />
            <text x={tipX + 18} y={padT + 44} fontSize={9} fill="#374151" fontWeight="600">클릭 {fmtNumber(d.clicks)}</text>
            {/* CTR */}
            <text x={tipX + 8} y={padT + 57} fontSize={9} fill="#9ca3af">CTR {d.ctr != null ? d.ctr.toFixed(2) : '—'}%</text>
          </g>
        )
      })()}
    </svg>
  )
}

/** 단일 LineChart (gradient fill) — 원본 LineChart 동등 */
function SimpleLineChart({
  data,
  stroke,
  ariaLabel,
  activeIndex,
  onActiveIndex,
  isTouch,
}: {
  data: { label: string; value: number }[]
  stroke: string
  ariaLabel?: string
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}) {
  const W = 400, H = 180, padL = 36, padR = 12, padT = 12, padB = 28
  const plotW = W - padL - padR, plotH = H - padT - padB
  const max = Math.max(1, ...data.map(d => d.value))
  const stepX = plotW / Math.max(data.length - 1, 1)
  const points = data.map((d, i) => ({
    x: padL + i * stepX,
    y: padT + plotH - (d.value / max) * plotH,
    label: d.label,
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillPath = points.length > 0
    ? `${path} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
    : ''
  const svgMinW = Math.max(W, data.length * 44)

  // X축 라벨 간격: data.length 기반
  const labelInterval = data.length > 20 ? 7 : data.length > 8 ? 3 : 1

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="overflow-visible"
      role="img"
      aria-label={ariaLabel ?? '추이 차트'}
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: svgMinW }}
      onMouseMove={!isTouch && onActiveIndex ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        const svgRelX = ratio * W - padL
        const idx = Math.round(svgRelX / stepX)
        onActiveIndex(Math.max(0, Math.min(data.length - 1, idx)))
      } : undefined}
      onMouseLeave={!isTouch && onActiveIndex ? () => onActiveIndex(null) : undefined}
      onTouchMove={isTouch && onActiveIndex ? (e) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = (e.touches[0].clientX - rect.left) / rect.width
        const svgRelX = ratio * W - padL
        const idx = Math.round(svgRelX / stepX)
        onActiveIndex(Math.max(0, Math.min(data.length - 1, idx)))
      } : undefined}
    >
      <defs>
        <linearGradient id={`grad-${stroke.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}
      <path d={fillPath} fill={`url(#grad-${stroke.replace('#', '')})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={stroke} />
      ))}
      {/* X축 라벨 — data.length 기반 간격 */}
      {points.map((p, i) => {
        if (i % labelInterval !== 0 && i !== points.length - 1) return null
        return <text key={i} x={p.x} y={padT + plotH + 14} textAnchor="middle" fontSize={9} fill="#6b7280">{p.label}</text>
      })}
      {/* active indicator + tooltip */}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        const p = points[activeIndex]
        if (!d || !p) return null
        const tipW = 120, tipH = 44, tipX = p.x + (p.x > W * 0.65 ? -(tipW + 8) : 8)
        return (
          <g key="active">
            <line x1={p.x} y1={padT} x2={p.x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={p.x} cy={p.y} r={4} fill={stroke} stroke="white" strokeWidth={2} />
            <rect x={tipX} y={padT} width={tipW} height={tipH} rx={5} fill="white" stroke="#e5e7eb" strokeWidth={1} filter="drop-shadow(0 1px 3px rgba(0,0,0,.08))" />
            <text x={tipX + 8} y={padT + 14} fontSize={9} fill="#6b7280">{d.label}</text>
            <text x={tipX + 8} y={padT + 30} fontSize={10} fill="#374151" fontWeight="600">{typeof d.value === 'number' && d.value > 100 ? fmtNumber(d.value) : d.value.toFixed(2)}</text>
          </g>
        )
      })()}
    </svg>
  )
}

/** 도넛 차트 — 원본 DonutChart 동등 (SVG 인라인) */
function DonutChartSimple({ data, ariaLabel }: { data: { label: string; value: number; color: string }[]; ariaLabel?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <p className="text-base text-gray-400 text-center py-12">데이터가 없습니다.</p>
  const cx = 90, cy = 90, r = 70, ir = 50
  let acc = 0
  const arcs = data.map(d => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2
    acc += d.value
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2
    const large = end - start > Math.PI ? 1 : 0
    const sx = cx + r * Math.cos(start), sy = cy + r * Math.sin(start)
    const ex = cx + r * Math.cos(end), ey = cy + r * Math.sin(end)
    const isx = cx + ir * Math.cos(end), isy = cy + ir * Math.sin(end)
    const iex = cx + ir * Math.cos(start), iey = cy + ir * Math.sin(start)
    return {
      ...d,
      pct: ((d.value / total) * 100).toFixed(1),
      d: `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${ir} ${ir} 0 ${large} 0 ${iex} ${iey} Z`,
    }
  })
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg className="w-36 h-36 @sm:w-44 @sm:h-44 shrink-0" viewBox="0 0 180 180" role="img" aria-label={ariaLabel ?? '도넛 차트'}>
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      </svg>
      <div className="flex-1 min-w-[120px] space-y-2">
        {arcs.map(a => (
          <div key={a.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: a.color }} />
              <span className="text-sm text-gray-700 whitespace-nowrap">{a.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{fmtNumber(a.value)}</span>
              <span className="text-sm text-gray-500 ml-1">({a.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
