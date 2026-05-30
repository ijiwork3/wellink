import { useState, useEffect, useMemo, useRef } from 'react'
import { TrendingUp, MousePointer, ShoppingBag, DollarSign, BarChart2, ExternalLink, ChevronDown, ChevronUp, Megaphone, Info, Layers } from 'lucide-react'
import { getThumbnailFromPool, getPlaceholderDataUri } from '../utils/thumbnailPlaceholder'
import { KPICard, StatusBadge, ErrorState, EmptyState, DateRangePicker, Tooltip, Pagination, fmtNumber, fmtPrice, getRoasColor, getCtrColor, useIsTouchDevice, SkeletonCard, ChartScrollContainer, PageHeader, CHART_COLORS, type ChartScrollContainerHandle } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import AIAnalysisCard from '../components/AIAnalysisCard'
import useHeaderStuck from '../hooks/useHeaderStuck'
import useAiRefresh from '../hooks/useAiRefresh'
import { useDeviceMode } from '../qa-mockup-kit'
import {
  ALL_ACTIVE_CAMPAIGNS,
  ALL_PAUSED_CAMPAIGNS,
  kpiByPeriod,
  CHART_DATA_BY_PERIOD,
  CHART_PERIOD_LABEL,
  AD_AI_DATA,
  AD_SECTION_HINTS_KO,
  adFormatPerf,
  getAdStatusBadge,
  getObjectiveBadge,
  type Ad,
} from '../data/analytics/ads'
import RoasBar from '../components/analytics/ads/RoasBar'
import MixedChart from '../components/analytics/ads/MixedChart'
import SimpleLineChart from '../components/analytics/ads/SimpleLineChart'
import SimpleBarChart from '../components/analytics/ads/SimpleBarChart'
import DonutChartSimple from '../components/analytics/ads/DonutChartSimple'

export default function AdPerformance() {
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const isDesktop = useDeviceMode() === 'desktop'
  const [period, setPeriod] = useState<'일간' | '주간' | '월간' | '연간'>('월간')
  const [dateOffset, setDateOffset] = useState(0)
  // 게재중/일시정지 상태 탭 — 'active' = 게재중 / 'paused' = 일시정지 (원본 AdPerformance 동등)
  const [statusTab, setStatusTab] = useState<'active' | 'paused'>('active')
  const [campaignPage, setCampaignPage] = useState(1)
  const CAMPAIGN_PAGE_SIZE = 10
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(
    ALL_ACTIVE_CAMPAIGNS[0]?.campaignId ?? null
  )
  const [expandedAdSet, setExpandedAdSet] = useState<string | null>(null)
  // AI 분석 새로고침 — 공통 훅(useAiRefresh)으로 추출
  const { refreshing: aiRefreshing, refresh: handleAiRefresh, generatedAt: aiGeneratedAt } = useAiRefresh()

  // 터치 디바이스 감지
  const isTouch = useIsTouchDevice()

  // 각 차트별 active index
  // 초기값 0 — 맨 왼쪽 데이터 포인트에 툴팁 자동 노출. 다른 곳 hover/click 시 그곳으로 이동
  const [mixedChartIdx, setMixedChartIdx] = useState<number | null>(0)
  const [ctrChartIdx, setCtrChartIdx] = useState<number | null>(0)
  const [clicksChartIdx, setClicksChartIdx] = useState<number | null>(0)

  // ChartScrollContainer refs — imperativeHandle (scrollToStart / scrollToEnd)
  const mixedChartScrollRef = useRef<ChartScrollContainerHandle>(null)
  const ctrChartScrollRef    = useRef<ChartScrollContainerHandle>(null)
  const clicksChartScrollRef = useRef<ChartScrollContainerHandle>(null)

  // 기간·날짜(외부 prop) 변경 시 패널 리셋 — 정당한 외부 동기화. (정책 §외부동기화)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedCampaign(null)
    setExpandedAdSet(null)
    setCampaignPage(1)
  }, [period, dateOffset])

  // period 변경 시 차트 인덱스·스크롤 초기화 — 맨 왼쪽 포인트(0) 기본 노출 + scrollToStart
  useEffect(() => {
    const len = CHART_DATA_BY_PERIOD[period].length
    const firstIdx = len > 0 ? 0 : null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMixedChartIdx(firstIdx)
    setCtrChartIdx(firstIdx)
    setClicksChartIdx(firstIdx)
    requestAnimationFrame(() => {
      mixedChartScrollRef.current?.scrollToStart()
      ctrChartScrollRef.current?.scrollToStart()
      clicksChartScrollRef.current?.scrollToStart()
    })
  }, [period])

  // 헤더 sticky 상태 추적 — 공통 훅(useHeaderStuck)으로 추출
  const { headerRef, isStuck } = useHeaderStuck<HTMLDivElement>()

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
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 @sm:gap-4">
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
        <PageHeader title="광고 성과" description="Meta 광고 캠페인 성과 및 전환 분석" />
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
              <button type="button"
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

      {/* 헤더 — 공통 PageHeader (sticky 감지용 ref는 래퍼 div에 부착) */}
      <div ref={headerRef}>
        <PageHeader
          title="광고 성과"
          description="Meta 광고 캠페인 성과 및 전환 분석"
          actions={
            <button type="button"
              onClick={() => window.open('https://business.facebook.com/ads/manager/', '_blank', 'noopener,noreferrer')}
              className="shrink-0 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 border border-gray-200 rounded-lg bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <ExternalLink size={12} aria-hidden="true" />
              Meta 광고 관리자
            </button>
          }
        />
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

      {/* AI 광고 성과 분석 카드 — 분석/가이드 그룹 분리 (광고주 결정 v3) */}
      <AIAnalysisCard
        title="AI 광고 성과 분석"
        analysis={AD_AI_DATA.analysis}
        guides={AD_AI_DATA.guides}
        generatedAt={aiGeneratedAt}
        refreshing={aiRefreshing}
        onRefresh={handleAiRefresh}
      />

      {/* KPI 카드 8개 — 원본 KPI_LABELS 동등 (지출/ROAS/결과/결과당비용/도달/클릭/CTR/CPC) */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-4 gap-3 @sm:gap-4">
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
          /* valueColor 제거 — trend 색상과 시각 모순 방지 (ROAS·CTR 모두 검정 통일) */
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
          positive={false}
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
          /* valueColor 제거 — trend(positive) 기반 색상과 분리 (값은 검정, 흐름은 trend로) */
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
          positive={false}
        />
      </div>

      {/* Meta 광고 캠페인별 성과 — 게재중/일시정지 탭 + 캠페인 → 광고세트 → 소재 3단계 계층 (원본 보강) */}
      <CampaignList
        statusTab={statusTab}
        setStatusTab={setStatusTab}
        isZero={isZero}
        campaignPage={campaignPage}
        setCampaignPage={setCampaignPage}
        expandedCampaign={expandedCampaign}
        setExpandedCampaign={setExpandedCampaign}
        expandedAdSet={expandedAdSet}
        setExpandedAdSet={setExpandedAdSet}
        pageSize={CAMPAIGN_PAGE_SIZE}
      />

      {/* 기간별 광고 성과 차트 (지출 bar + 클릭 line) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 @sm:p-5 relative">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-gray-900">{chartPeriodLabel} 광고 성과</h2>
            <Tooltip content={AD_SECTION_HINTS_KO.dailyPerformance} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" />지출</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500 inline-block" />클릭</span>
          </div>
        </div>
        <ChartScrollContainer
          ref={mixedChartScrollRef}
          chartW={700} padL={130} padR={130}
          dataLength={chartData.length}
          activeIndex={mixedChartIdx}
          tooltipContent={(i) => {
            const d = chartData[i]
            if (!d) return null
            return (
              <>
                <p className="text-xs text-gray-500 mb-1.5 whitespace-nowrap">{d.date}</p>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-sm shrink-0 bg-violet-500" />
                  <span className="text-xs text-gray-700 whitespace-nowrap font-medium">지출 {fmtPrice(d.spend)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3 h-0.5 shrink-0 bg-orange-500" />
                  <span className="text-xs text-gray-700 whitespace-nowrap font-medium">클릭 {fmtNumber(d.clicks)}</span>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap mt-0.5">CTR {d.ctr.toFixed(2)}%</p>
              </>
            )
          }}
        >
          <MixedChart
            data={chartData}
            activeIndex={mixedChartIdx}
            onActiveIndex={setMixedChartIdx}
            isTouch={isTouch}
          />
        </ChartScrollContainer>
      </div>

      {/* CTR 추이 + 기간별 클릭 — 2열 배치 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 @sm:p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h2 className="text-base font-semibold text-gray-900">CTR 추이</h2>
            <Tooltip content={AD_SECTION_HINTS_KO.ctrTrend} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <ChartScrollContainer
            ref={ctrChartScrollRef}
            chartW={400} padL={56} padR={16}
            dataLength={chartData.length}
            activeIndex={ctrChartIdx}
            tooltipContent={(i) => {
              const d = chartData[i]
              if (!d) return null
              return (
                <>
                  <p className="text-xs text-gray-500 mb-1.5 whitespace-nowrap">{d.date}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS.feed }} />
                    <span className="text-xs text-gray-700 whitespace-nowrap font-medium">CTR {d.ctr.toFixed(2)}%</span>
                  </div>
                </>
              )
            }}
          >
            <SimpleLineChart
              data={chartData.map(d => ({ label: d.date, value: d.ctr }))}
              stroke={CHART_COLORS.feed}
              ariaLabel="CTR 추이 차트"
              yLabelFormatter={(n) => `${n.toFixed(1)}%`}
              activeIndex={ctrChartIdx}
              onActiveIndex={setCtrChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 @sm:p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h2 className="text-base font-semibold text-gray-900">{chartPeriodLabel} 클릭</h2>
            <Tooltip content={AD_SECTION_HINTS_KO.dailyClicks} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <ChartScrollContainer
            ref={clicksChartScrollRef}
            chartW={400} padL={56} padR={16}
            dataLength={chartData.length}
            activeIndex={clicksChartIdx}
            tooltipContent={(i) => {
              const d = chartData[i]
              if (!d) return null
              return (
                <>
                  <p className="text-xs text-gray-500 mb-1.5 whitespace-nowrap">{d.date}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-blue-500" />
                    <span className="text-xs text-gray-700 whitespace-nowrap font-medium">클릭 {fmtNumber(d.clicks)}</span>
                  </div>
                </>
              )
            }}
          >
            <SimpleBarChart
              data={chartData.map(d => ({ label: d.date, value: d.clicks }))}
              stroke={CHART_COLORS.reach}
              ariaLabel="기간별 클릭 수 차트"
              yLabelFormatter={(n) => fmtNumber(Math.round(n))}
              activeIndex={clicksChartIdx}
              onActiveIndex={setClicksChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
        </div>
      </div>

      {/* 도달·참여 출처 도넛 (광고 vs 유기적) */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 @sm:p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h2 className="text-base font-semibold text-gray-900">도달 출처</h2>
            <Tooltip content={AD_SECTION_HINTS_KO.reachSource} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <DonutChartSimple
            ariaLabel="광고 도달과 유기적 도달 비율 도넛 차트"
            data={[
              { label: '광고 도달', value: kpi.reach, color: CHART_COLORS.feed },
              { label: '유기적 도달', value: Math.floor(kpi.reach * 0.6), color: CHART_COLORS.saves },
            ]}
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 @sm:p-5 relative">
          <div className="flex items-center gap-1.5 mb-4">
            <h2 className="text-base font-semibold text-gray-900">참여 출처</h2>
            <Tooltip content={AD_SECTION_HINTS_KO.engagementSource} multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <DonutChartSimple
            ariaLabel="광고 참여와 유기적 참여 비율 도넛 차트"
            data={[
              { label: '광고 참여', value: kpi.clicks, color: CHART_COLORS.feed },
              { label: '유기적 참여', value: Math.floor(kpi.clicks * 0.45), color: CHART_COLORS.saves },
            ]}
          />
        </div>
      </div>

      {/* 광고 소재 유형별 성과 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-900">소재 유형별 성과</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            광고 포맷별 효율 비교 · <span className="text-gray-600 font-medium">CPM</span> = 1,000회 노출당 비용 (Cost Per Mille)
          </p>
        </div>
        <div className="p-5 space-y-4">
          {adFormatPerf.map(f => {
            const ratioPct = Math.round((f.impressions / adFormatPerf[0].impressions) * 100)
            return (
            <div key={f.format} className="flex items-center gap-2 @sm:gap-4">
              <div className="w-20 @sm:w-24 shrink-0">
                <span className="text-sm font-medium text-gray-700">{f.format}</span>
                <p className="text-sm text-gray-500 mt-0.5">CPM {fmtPrice(f.cpm)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">노출 {fmtNumber(f.impressions)}</span>
                  <span className={`text-sm font-semibold ${getCtrColor(f.ctr)}`}>CTR {f.ctr}%</span>
                </div>
                <div
                  className="h-2 bg-gray-100 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-label={`${f.format} 노출 비율 (최상위 대비)`}
                  aria-valuenow={ratioPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={`${ratioPct}%`}
                >
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${ratioPct}%` }}
                  />
                </div>
              </div>
              <div className="w-14 @sm:w-20 text-right shrink-0">
                <span className="text-sm text-gray-500">클릭 </span>
                <span className="text-sm font-bold text-gray-900">{fmtNumber(f.clicks)}</span>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── 캠페인 리스트 (캠페인 → 광고세트 → 소재 3단계 펼침/접힘) ─────────────────
// 본 컴포넌트는 AdPerformance 메인의 캠페인 영역 IIFE를 추출. 페이지 외 재사용 의도 없음.
interface CampaignListProps {
  statusTab: 'active' | 'paused'
  setStatusTab: (v: 'active' | 'paused') => void
  isZero: boolean
  campaignPage: number
  setCampaignPage: (n: number) => void
  expandedCampaign: string | null
  setExpandedCampaign: (id: string | null) => void
  expandedAdSet: string | null
  setExpandedAdSet: (id: string | null) => void
  pageSize: number
}
function CampaignList({
  statusTab, setStatusTab, isZero, campaignPage, setCampaignPage,
  expandedCampaign, setExpandedCampaign, expandedAdSet, setExpandedAdSet,
  pageSize,
}: CampaignListProps) {
  // visibleList useMemo — conditional 배열의 reference 안정화 (avgRoas 의존성 안전)
  const visibleList = useMemo(
    () => isZero ? [] : (statusTab === 'active' ? ALL_ACTIVE_CAMPAIGNS : ALL_PAUSED_CAMPAIGNS),
    [isZero, statusTab]
  )
  const totalPages = Math.max(1, Math.ceil(visibleList.length / pageSize))
  const safePage = Math.min(campaignPage, totalPages)
  const pagedCampaigns = visibleList.slice((safePage - 1) * pageSize, safePage * pageSize)
  // 같은 탭 내 캠페인 ROAS 비교용 평균 — RoasBar 평균 기준 (v2). 진행바 50% = 평균(1.0x)
  const avgRoas = useMemo(() => {
    const list = visibleList.filter(x => x.roas > 0)
    return list.length > 0 ? list.reduce((s, x) => s + x.roas, 0) / list.length : 0
  }, [visibleList])
  // 같은 광고세트 내 소재 ROAS 비교용 평균 — 정책 § 1-2 "소재: ROAS 비교 바"
  const adsetAvgRoas = (ads: Ad[]) => {
    const list = ads.filter(a => a.roas > 0)
    return list.length > 0 ? list.reduce((s, a) => s + a.roas, 0) / list.length : 0
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">캠페인별 성과</h2>
          <p className="text-sm text-gray-500 mt-0.5">Meta 광고 관리자 기준 — 캠페인 → 광고세트 → 소재 3단계</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-green inline-block" />≥4.0x 우수</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{'<'}2.0x 주의</span>
        </div>
      </div>
      {/* 상태 탭 — 게재중 / 일시정지 */}
      <div className="flex gap-2 px-5 py-3 border-b border-gray-50">
        <button type="button"
          onClick={() => { setStatusTab('active'); setCampaignPage(1); setExpandedCampaign(null) }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
            statusTab === 'active' ? 'bg-brand-green-bg text-brand-green-text' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >게재중 {ALL_ACTIVE_CAMPAIGNS.length}</button>
        <button type="button"
          onClick={() => { setStatusTab('paused'); setCampaignPage(1); setExpandedCampaign(null) }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
            statusTab === 'paused' ? 'bg-brand-green-bg text-brand-green-text' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >일시정지 {ALL_PAUSED_CAMPAIGNS.length}</button>
      </div>
      {pagedCampaigns.length === 0 ? (
        <div className="py-12 text-center text-base text-gray-400">
          {visibleList.length === 0 ? '해당 상태의 캠페인이 없습니다.' : '결과가 없습니다.'}
        </div>
      ) : (
        /* 캠페인 리스트 — 그레이 배경 위 흰색 카드로 시인성 ↑ (펼침 식별 명확) */
        <div className="space-y-2 p-3 bg-gray-50">
          {pagedCampaigns.map(c => {
            const isCampaignOpen = expandedCampaign === c.campaignId
            return (
              <div key={c.campaignId} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                <button type="button"
                  onClick={() => { setExpandedCampaign(isCampaignOpen ? null : c.campaignId); setExpandedAdSet(null) }}
                  aria-expanded={isCampaignOpen}
                  aria-controls={`campaign-detail-${c.campaignId}`}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 shrink-0">
                      <Megaphone size={16} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* 모바일: 타이틀 행 분할 + 배지 두 번째 줄 / @sm 이상: 한 줄 정렬 (truncate 금지 정책) */}
                      <div className="flex flex-col @sm:flex-row @sm:items-center @sm:gap-2 min-w-0">
                        <span className="font-medium text-base text-gray-900 break-keep min-w-0">{c.campaignName}</span>
                        <div className="flex items-center gap-2 mt-1 @sm:mt-0 shrink-0">
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getObjectiveBadge(c.objective)}`}>{c.objective}</span>
                          <StatusBadge status={c.status} dot={false} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">광고세트 {c.adSets.length}개</p>
                    </div>
                  </div>
                  {isCampaignOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" aria-hidden="true" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" aria-hidden="true" />}
                </button>
                {isCampaignOpen && (
                  <div className="border-t border-gray-100 p-4" id={`campaign-detail-${c.campaignId}`}>
                    {/* 캠페인 KPI 8개 — 원본 동등 */}
                    <div className="grid grid-cols-1 @sm:grid-cols-2 gap-x-4 gap-y-3 mb-4">
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
                    {/* 광고세트 리스트 — 계층 표시는 텍스트 라벨 + 들여쓰기만 (트리 라인·좌측 보더 제거) */}
                    <div className="mb-2 text-sm font-semibold text-violet-700 uppercase tracking-wide">
                      광고세트 ({c.adSets.length})
                    </div>
                    <div className="space-y-2">
                      {c.adSets.map(set => {
                        const isSetOpen = expandedAdSet === set.id
                        const setAdsetAvg = adsetAvgRoas(set.ads)
                        return (
                          <div key={set.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <button type="button"
                              onClick={() => setExpandedAdSet(isSetOpen ? null : set.id)}
                              aria-expanded={isSetOpen}
                              aria-controls={`adset-detail-${set.id}`}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-600 shrink-0">
                                  <Layers size={12} aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-sm font-medium text-gray-900 break-keep">{set.name}</span>
                                  <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">소재 {set.ads.length}개</span>
                                </div>
                              </div>
                              {isSetOpen ? <ChevronUp size={14} className="text-gray-400 shrink-0" aria-hidden="true" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" aria-hidden="true" />}
                            </button>
                            {isSetOpen && (
                              <div className="border-t border-gray-100 p-3 bg-teal-50/20" id={`adset-detail-${set.id}`}>
                                {/* 광고세트 KPI */}
                                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-x-3 gap-y-2 mb-3">
                                  {([
                                    { k: '지출', v: fmtPrice(set.spend) },
                                    { k: 'ROAS', v: `${set.roas}x` },
                                    { k: '결과', v: fmtNumber(set.results) },
                                    { k: '결과당 비용', v: fmtPrice(set.costPerResult) },
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
                                {/* 소재 리스트 — 계층 표시는 텍스트 라벨 + 들여쓰기만 (트리 라인·좌측 보더 제거) */}
                                <div className="mt-1 mb-1.5 text-sm font-semibold text-teal-700 uppercase tracking-wide">
                                  소재 ({set.ads.length})
                                </div>
                                <div className="space-y-2">
                                  {set.ads.map(ad => (
                                    <div key={ad.id} className="flex gap-3 rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                                      <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                          src={ad.thumbnailUrl ?? getThumbnailFromPool(ad.id)}
                                          alt=""
                                          loading="lazy"
                                          className="w-full h-full object-cover"
                                          onError={(e) => { e.currentTarget.src = getPlaceholderDataUri(ad.id, ad.adName) }}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-sm font-bold bg-brand-green-bg text-brand-green-text px-2 py-1 rounded whitespace-nowrap">소재</span>
                                          <span className="text-sm font-medium text-gray-900">{ad.adName}</span>
                                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getAdStatusBadge(ad.status).cls}`}>
                                            {getAdStatusBadge(ad.status).label}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{ad.message}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                                          <span className="whitespace-nowrap">지출 <strong className="text-gray-900">{fmtPrice(ad.spend)}</strong></span>
                                          <span className="whitespace-nowrap">ROAS <strong className={getRoasColor(ad.roas)}>{ad.roas}x</strong></span>
                                          <span className="whitespace-nowrap">결과 <strong className="text-gray-900">{fmtNumber(ad.results)}</strong></span>
                                          <span className="whitespace-nowrap">결과당 비용 <strong className="text-gray-900">{fmtPrice(ad.costPerResult)}</strong></span>
                                          <span className="whitespace-nowrap">도달 <strong className="text-gray-900">{fmtNumber(ad.reach)}</strong></span>
                                          <span className="whitespace-nowrap">클릭 <strong className="text-gray-900">{fmtNumber(ad.clicks)}</strong></span>
                                          <span className="whitespace-nowrap">CTR <strong className="text-gray-900">{ad.ctr}%</strong></span>
                                          <span className="whitespace-nowrap">CPC <strong className="text-gray-900">{fmtPrice(ad.cpc)}</strong></span>
                                        </div>
                                        {/* ROAS 비교 바 — 정책 § 1-2 소재 레벨 (같은 광고세트 내 비교) */}
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1.5">
                                          <span className="whitespace-nowrap">ROAS 비교</span>
                                          <RoasBar value={ad.roas} avg={setAdsetAvg} />
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
                        <RoasBar value={c.roas} avg={avgRoas} />
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
        pageSize={pageSize}
        onChange={p => { setCampaignPage(p); setExpandedCampaign(null) }}
      />
    </div>
  )
}
