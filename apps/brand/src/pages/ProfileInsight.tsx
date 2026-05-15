import { useState, useRef, useEffect, useCallback } from 'react'
import { BarChart2, Users, TrendingUp, Eye, Heart, MessageCircle, Bookmark } from 'lucide-react'
import { KPICard, ErrorState, EmptyState, DateRangePicker, Tooltip, fmtNumber, ENGAGEMENT_THRESHOLD, useIsTouchDevice, SkeletonCard, ChartScrollContainer, FloatingScrollChevrons, PageHeader, type ChartScrollContainerHandle, type DatePeriod } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import AIAnalysisCard from '../components/AIAnalysisCard'
import useHeaderStuck from '../hooks/useHeaderStuck'
import useAiRefresh from '../hooks/useAiRefresh'
import useTableScroll from '../hooks/useTableScroll'
import { useDeviceMode } from '../qa-mockup-kit'
import {
  trimEdgeNulls,
  kpiByPeriod,
  conversionByPeriod,
  FOLLOWER_DEMOGRAPHIC,
  PROFILE_AI_DATA,
  followerDataByPeriod,
  trendDataByPeriod,
  impressReachByPeriod,
  contentTypeData,
  metricColors,
  type MetricKey,
} from '../data/analytics/profile'
import FollowerAreaChart from '../components/analytics/profile/FollowerAreaChart'
import MultiLineTrendChart from '../components/analytics/profile/MultiLineTrendChart'
import ImpressReachChart from '../components/analytics/profile/ImpressReachChart'
import PostContentTable from '../components/analytics/profile/PostContentTable'

export default function ProfileInsight() {
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const isDesktop = useDeviceMode() === 'desktop'
  const isTouch = useIsTouchDevice()
  const [period, setPeriod] = useState<DatePeriod>('월간')
  const [dateOffset, setDateOffset] = useState(0)
  // 복수 메트릭 동시 활성화 — 최소 1개는 유지
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['likes'])
  const toggleMetric = useCallback((metric: MetricKey) => {
    setActiveMetrics(prev => {
      if (prev.includes(metric)) {
        if (prev.length === 1) return prev // 최소 1개 유지
        return prev.filter(m => m !== metric)
      }
      // 정의된 순서(metricColors) 유지 — 툴팁/범례 정렬 일관성
      const order = Object.keys(metricColors) as MetricKey[]
      return order.filter(m => prev.includes(m) || m === metric)
    })
  }, [])
  // AI 분석 새로고침 — 공통 훅(useAiRefresh)으로 추출
  const { refreshing: aiRefreshing, refresh: handleAiRefresh, generatedAt: aiGeneratedAt } = useAiRefresh()

  // 차트 인터랙티브 인덱스 — 모바일/태블릿은 호버 불가능하므로 마지막 포인트를 기본 노출 (정책)
  // 초기값 0 — 맨 왼쪽 데이터 포인트에 툴팁 자동 노출
  const [followerChartIdx, setFollowerChartIdx] = useState<number | null>(0)
  const [trendChartIdx, setTrendChartIdx] = useState<number | null>(0)
  const [impReachChartIdx, setImpReachChartIdx] = useState<number | null>(0)

  // 차트 가로 스크롤 refs
  const followerChartScrollRef = useRef<ChartScrollContainerHandle>(null)
  const trendChartScrollRef    = useRef<ChartScrollContainerHandle>(null)
  const impReachChartScrollRef = useRef<ChartScrollContainerHandle>(null)

  // period 변경 시 차트 인덱스·스크롤 초기화 — 맨 왼쪽 포인트(0) 기본 노출 + scrollToStart
  useEffect(() => {
    const followerLen  = followerDataByPeriod[period].length
    const trendLen     = trendDataByPeriod[period].length
    const impReachLen  = impressReachByPeriod[period].length
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFollowerChartIdx(followerLen > 0 ? 0 : null)
    setTrendChartIdx(trendLen > 0 ? 0 : null)
    setImpReachChartIdx(impReachLen > 0 ? 0 : null)
    requestAnimationFrame(() => {
      followerChartScrollRef.current?.scrollToStart()
      trendChartScrollRef.current?.scrollToStart()
      impReachChartScrollRef.current?.scrollToStart()
    })
  }, [period])

  // 테이블 가로 스크롤 — 공통 훅(useTableScroll)으로 추출 (쉐브론은 FloatingScrollChevrons에서 처리)
  const { scrollRef: tableScrollRef, canScrollLeft: canTableScrollLeft, canScrollRight: canTableScrollRight } = useTableScroll<HTMLDivElement>()
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  // 헤더 sticky 상태 추적 — 공통 훅(useHeaderStuck)으로 추출
  const { headerRef, isStuck } = useHeaderStuck<HTMLDivElement>()

  const metricLabels: Record<MetricKey, string> = {
    likes: '좋아요',
    reach: '도달',
    comments: '댓글',
    saves: '저장',
  }

  /* ── QA: 로딩 스켈레톤 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-4 w-56 bg-gray-100 animate-pulse rounded-xl" />
          </div>
          <div className="h-9 w-36 bg-gray-100 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} height={128} />)}
        </div>
        <SkeletonCard height={256} />
        <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-3 @sm:gap-5">
          <SkeletonCard height={192} />
          <SkeletonCard height={192} />
        </div>
      </div>
    )
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <PageHeader title="프로필 인사이트" description="브랜드 프로필의 콘텐츠 성과 및 팔로워 현황" />
        <InstagramConnectPrompt featureName="프로필 인사이트" />
      </div>
    )
  }

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState message="프로필 인사이트를 불러올 수 없습니다" subMessage="네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." onRetry={() => window.location.reload()} />
  }

  /* ── QA: 빈 상태 — 공통 EmptyState ── */
  if (qa === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full max-w-sm">
          <EmptyState
            size="lg"
            icon={<BarChart2 size={40} />}
            title="분석 데이터가 없습니다"
            description="인스타그램 계정을 연결하면 자동으로 수집됩니다"
          />
        </div>
      </div>
    )
  }

  const kpi = kpiByPeriod[period]
  // 신규 계정·미수집 상태 시 KPI 0 노출 — AdPerformance/ViralMetrics 패턴 동등 (qa=zero)
  const isZero = qa === 'zero'

  // 앞뒤 null 항목 제거 — 데이터 없는 구간이 차트 너비를 잠식하지 않도록
  const followerData  = trimEdgeNulls(followerDataByPeriod[period],  d => d.value === null)
  const trendData     = trimEdgeNulls(trendDataByPeriod[period],     d => d.likes === null)
  const impressReachData = trimEdgeNulls(impressReachByPeriod[period], d => d.impressions === null)

  const nullCount = followerData.filter(d => d.value === null).length
  const growthLabel = { 일간: '+0.3% 전일 대비', 주간: '+1.2% 전주 대비', 월간: '+22.8% 연초 대비', 연간: '+22.8% 전년 대비' }[period]

  const periodLabel = (() => {
    const today = new Date()
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
    if (period === '일간') return fmt(today)
    if (period === '주간') { const s = new Date(today); s.setDate(today.getDate() - 6); return `${fmt(s)}~${fmt(today)}` }
    if (period === '월간') { const s = new Date(today); s.setDate(today.getDate() - 29); return `${fmt(s)}~${fmt(today)}` }
    return `${today.getFullYear() - 1}~${today.getFullYear()}`
  })()

  return (
    <div className="space-y-6">
      {/* 헤더 — 공통 PageHeader (sticky 감지용 ref는 래퍼 div에 부착) */}
      <div ref={headerRef}>
        <PageHeader title="프로필 인사이트" description="브랜드 프로필의 콘텐츠 성과 및 팔로워 현황" />
      </div>

      {/* 기간 선택기 — sticky: 데스크톱은 상단 GNB 없으므로 top-0, 모바일/태블릿은 h-12 GNB 아래 top-12 */}
      <div className={`sticky z-20 !mt-2 -mx-4 px-4 @sm:-mx-6 @sm:px-6 @lg:-mx-8 @lg:px-8 py-2.5 transition-colors ${isStuck ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' : 'border-b border-transparent'} ${isDesktop ? 'top-0' : 'top-12'}`}>
        <DateRangePicker
          period={period}
          dateOffset={dateOffset}
          onPeriodChange={setPeriod}
          onDateOffsetChange={setDateOffset}
          compact={!isDesktop}
        />
      </div>

      {/* AI 프로필 분석 카드 — 분석/가이드 그룹 분리 (광고주 결정 v3) */}
      <AIAnalysisCard
        title="AI 프로필 분석"
        analysis={PROFILE_AI_DATA.analysis}
        guides={PROFILE_AI_DATA.guides}
        generatedAt={aiGeneratedAt}
        refreshing={aiRefreshing}
        onRefresh={handleAiRefresh}
      />

      {/* KPI 카드 4개 — 클라 #1: 부연 설명(sub) 제거. 라벨/값/전기간 대비만 간결하게 */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="팔로워 수"
          value={isZero ? '0' : fmtNumber(kpi.followers)}
          trend={isZero ? 0 : kpi.trends.followers}
          trendLabel="전기간 대비"
          icon={<Users size={16} aria-hidden="true" />}
          tooltip="현재 브랜드 계정을 팔로우하는 총 사용자 수"
        />
        <KPICard
          title="평균 도달률"
          value={isZero ? '0%' : `${kpi.reach}%`}
          trend={isZero ? 0 : kpi.trends.reach}
          trendLabel="전기간 대비"
          icon={<Eye size={16} aria-hidden="true" />}
          tooltip="게시물 1개당 팔로워 대비 도달한 비율 평균"
        />
        <KPICard
          title="참여율"
          value={isZero ? '0%' : `${kpi.engagement}%`}
          trend={isZero ? 0 : kpi.trends.engagement}
          trendLabel="전기간 대비"
          /* valueColor 제거 — trend(증감) 색상과 시각 모순 방지 (값=검정, 흐름=trend) — AdPerformance ROAS/CTR과 동일 정책 */
          icon={<TrendingUp size={16} aria-hidden="true" />}
          tooltip="(좋아요+댓글) / 도달 수 x 100으로 산출"
        />
        <KPICard
          title="노출 수"
          value={isZero ? '0' : fmtNumber(kpi.impressions)}
          trend={isZero ? 0 : kpi.trends.impressions}
          trendLabel="전기간 대비"
          icon={<BarChart2 size={16} aria-hidden="true" />}
          tooltip="콘텐츠가 화면에 노출된 총 횟수 (중복 포함)"
        />
      </div>

      {/* 전환 KPI 3개 — 원본 buildProfileConversionMetrics 보강. 클라 #1: sub 제거 */}
      {(() => {
        const conv = conversionByPeriod[period]
        const ctr = conv.profileViews > 0 ? +((conv.websiteClicks / conv.profileViews) * 100).toFixed(1) : 0
        return (
          <div className="grid grid-cols-1 @lg:grid-cols-3 gap-3 @sm:gap-4">
            <KPICard
              title="프로필 방문"
              value={isZero ? '0' : fmtNumber(conv.profileViews)}
              trend={isZero ? 0 : conv.profileViewsGrowth}
              trendLabel="전기간 대비"
              icon={<Users size={16} aria-hidden="true" />}
              tooltip="콘텐츠/계정을 본 사용자가 프로필 페이지로 이동한 횟수"
            />
            <KPICard
              title="웹사이트 클릭"
              value={isZero ? '0' : fmtNumber(conv.websiteClicks)}
              trend={isZero ? 0 : conv.websiteClicksGrowth}
              trendLabel="전기간 대비"
              icon={<TrendingUp size={16} aria-hidden="true" />}
              tooltip="프로필에 연결된 웹사이트 링크를 누른 횟수"
            />
            <KPICard
              title="클릭률"
              value={isZero ? '0%' : `${ctr}%`}
              trend={isZero ? 0 : conv.ctrGrowth}
              trendLabel="전기간 대비"
              icon={<BarChart2 size={16} aria-hidden="true" />}
              tooltip="웹사이트 클릭 ÷ 프로필 방문 × 100 — 전환 유도 효율"
            />
          </div>
        )
      })()}

      {/* 피드별 성과 추세 + 노출&도달 — 960px+ 부터 1:1 2열 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        {/* 피드별 추세선 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 relative">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">피드별 성과 추세</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {period === '일간' ? '최근 30일' : period === '주간' ? '최근 12주' : period === '월간' ? '최근 12개월' : '연도별'} · 위 기간 선택기로 변경
                {nullCount > 0 && <span className="ml-1.5 text-gray-500">· 회색 구간은 데이터 없음</span>}
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap" role="group" aria-label="표시할 지표 선택 (복수 선택 가능)">
              {(Object.keys(metricColors) as MetricKey[]).map(metric => {
                const isActive = activeMetrics.includes(metric)
                const isOnly = isActive && activeMetrics.length === 1
                const btn = (
                  <button type="button"
                    onClick={() => toggleMetric(metric)}
                    aria-pressed={isActive}
                    disabled={isOnly}
                    className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                      isActive
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'
                    } ${isOnly ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                    style={isActive ? { backgroundColor: metricColors[metric] } : {}}
                  >
                    {metric === 'likes'    && <Heart size={12} aria-hidden="true" />}
                    {metric === 'reach'    && <Eye size={12} aria-hidden="true" />}
                    {metric === 'comments' && <MessageCircle size={12} aria-hidden="true" />}
                    {metric === 'saves'    && <Bookmark size={12} aria-hidden="true" />}
                    {metricLabels[metric]}
                  </button>
                )
                // HTML title 금지 정책(CLAUDE.md §공통UI) — 비활성 안내는 Tooltip으로 감싼다
                return isOnly ? (
                  <Tooltip key={metric} content="최소 1개 지표는 활성화돼야 합니다">{btn}</Tooltip>
                ) : (
                  <span key={metric}>{btn}</span>
                )
              })}
            </div>
          </div>
          <ChartScrollContainer
            ref={trendChartScrollRef}
            chartW={580} padL={56} padR={56}
            dataLength={trendData.length}
            activeIndex={trendChartIdx}
            tooltipContent={(i) => {
              const d = trendData[i]
              if (!d) return null
              const fmtV = (v: number | null) => v === null ? '—' : v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)
              return (
                <>
                  <p className="text-xs text-gray-500 mb-1.5 whitespace-nowrap">{d.label}</p>
                  <div className="space-y-1">
                    {activeMetrics.map(metric => (
                      <div key={metric} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: metricColors[metric] }} />
                        <span className="text-xs text-gray-700 whitespace-nowrap font-medium">
                          {metricLabels[metric]}: {fmtV(d[metric])}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )
            }}
          >
            <MultiLineTrendChart
              data={trendData}
              activeMetrics={activeMetrics}
              activeIndex={trendChartIdx}
              onActiveIndex={setTrendChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
        </div>

        {/* 노출 & 도달 라인 차트 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 relative">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">노출 & 도달</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                노출(총 표시 횟수) vs 도달(순 사용자 수) · {period === '일간' ? '최근 30일' : period === '주간' ? '최근 12주' : period === '월간' ? '최근 12개월' : '연도별'}
                {impressReachByPeriod[period].some(d => d.impressions === null) && (
                  <span className="ml-1.5 text-gray-500">· 일부 구간 데이터 없음</span>
                )}
              </p>
            </div>
            <div className="flex gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded" />노출</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-green inline-block rounded" />도달</span>
            </div>
          </div>
          <ChartScrollContainer
            ref={impReachChartScrollRef}
            chartW={580} padL={60} padR={16}
            dataLength={impressReachData.length}
            activeIndex={impReachChartIdx}
            tooltipContent={(i) => {
              const d = impressReachData[i]
              if (!d) return null
              const fmtV = (v: number | null) => v === null ? '—' : v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)
              return (
                <>
                  <p className="text-xs text-gray-500 mb-1.5 whitespace-nowrap">{d.label}</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-violet-500" />
                    <span className="text-xs text-gray-700 whitespace-nowrap font-medium">노출: {fmtV(d.impressions)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
                    <span className="text-xs text-gray-700 whitespace-nowrap font-medium">도달: {fmtV(d.reach)}</span>
                  </div>
                </>
              )
            }}
          >
            <ImpressReachChart
              data={impressReachData}
              activeIndex={impReachChartIdx}
              onActiveIndex={setImpReachChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
        </div>
      </div>

      {/* 콘텐츠 유형별 성과 + 팔로워 추이 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-3 @sm:gap-5">
        {/* 콘텐츠 유형별 성과 — 클라 #2: bar 기준을 *최상위 참여율 100% 상대 비교* 로 명시 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">콘텐츠 유형별 성과</h2>
          <p className="text-sm text-gray-500 mb-3">막대는 *참여율* 기준 — 최상위 유형을 100%로 두고 나머지 유형의 상대 비율</p>
          {/* 헤더 행 */}
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-gray-500 w-16 shrink-0">유형</span>
            <div className="flex-1" />
            <span className="text-sm text-gray-500 w-14 text-right">평균 도달</span>
            <span className="text-sm text-gray-500 w-10 text-right">참여율</span>
          </div>
          <div className="space-y-3">
            {(() => {
              // 막대 분모: 최상위 참여율 (클라가 가정한 "릴스 4.8% = 100% 기준")
              const maxEng = Math.max(0.001, ...contentTypeData.map(c => c.engagementRate))
              return contentTypeData.map(ct => {
                const engPct = Math.round((ct.engagementRate / maxEng) * 100)
                const isMax = ct.engagementRate === maxEng
                return (
                  <div key={ct.type} className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 font-medium w-16 shrink-0">{ct.type}</span>
                    <div
                      className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label={`${ct.type} 참여율 비교 (최상위 ${maxEng.toFixed(1)}% 대비)`}
                      aria-valuenow={engPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuetext={`참여율 ${ct.engagementRate}% (${engPct}%)`}
                    >
                      {/* 공통 정책 — 최대값만 brand-green (진함), 나머지는 brand-green-border (옅음) */}
                      <div
                        className={`h-full rounded-full ${isMax ? 'bg-brand-green' : 'bg-brand-green-border'}`}
                        style={{ width: `${engPct}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-14 text-right tabular-nums">{fmtNumber(ct.avgReach)}</span>
                    <span className="text-sm font-semibold text-brand-green-text w-10 text-right tabular-nums">
                      {ct.engagementRate}%
                    </span>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* 팔로워 추이 (2/5) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">팔로워 추이</h2>
            <p className="text-sm text-brand-green-text font-medium mt-0.5">{growthLabel}</p>
          </div>
          <ChartScrollContainer
            ref={followerChartScrollRef}
            chartW={620} padL={48} padR={24}
            dataLength={followerData.length}
            activeIndex={followerChartIdx}
            tooltipContent={(i) => {
              const d = followerData[i]
              if (!d || d.value === null) return null
              return (
                <>
                  <p className="text-xs text-gray-500 mb-1.5 whitespace-nowrap">{d.label}</p>
                  <span className="text-xs text-gray-700 whitespace-nowrap font-medium tabular-nums">
                    팔로워 {fmtNumber(d.value)}
                  </span>
                </>
              )
            }}
          >
            <FollowerAreaChart
              data={followerData}
              activeIndex={followerChartIdx}
              onActiveIndex={setFollowerChartIdx}
              isTouch={isTouch}
            />
          </ChartScrollContainer>
          {nullCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              회색 점선 바: 해당 기간 데이터 없음
            </p>
          )}
          {period === '연간' && (
            <p className="text-sm text-gray-500 mt-2">
              * 2026년은 1~4월 기준
            </p>
          )}
        </div>
      </div>

      {/* 최근 게시물 상세 */}
      {/* fixed 플로팅 스크롤 쉐브론 — 사이드바 회피 + 40px 터치 타깃 */}
      <FloatingScrollChevrons scrollRef={tableScrollRef} contentRef={tableRef} />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {period === '일간' ? '일별' : period === '주간' ? '주별' : period === '월간' ? '월별' : '연도별'} 게시물 성과
        </h2>
        <div className="relative" ref={tableWrapperRef}>
          {canTableScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
          {canTableScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
          <div className="overflow-x-auto scrollbar-none" ref={tableScrollRef}>
            <table className="w-full text-base" ref={tableRef}>
              <thead>
                <tr className="border-b border-gray-100">
                  <th scope="col" className="text-left text-sm font-medium text-gray-400 pb-3 pr-4 whitespace-nowrap">기간</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">도달</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">좋아요</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">댓글</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 px-4 whitespace-nowrap">저장</th>
                  <th scope="col" className="text-right text-sm font-medium text-gray-400 pb-3 whitespace-nowrap">참여율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...trendData].reverse().map((d, i) => {
                  const isNull = d.reach === null
                  return (
                    <tr key={i} className={`transition-colors ${isNull ? '' : 'hover:bg-gray-50'}`}>
                      <td className={`py-2.5 pr-4 text-sm whitespace-nowrap ${isNull ? 'text-gray-400' : 'text-gray-500'}`}>{d.label}</td>
                      {isNull ? (
                        <td colSpan={5} className="py-2.5 text-center text-sm text-gray-500 whitespace-nowrap">데이터 없음</td>
                      ) : (
                        <>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.reach as number)}</td>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.likes as number)}</td>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.comments as number)}</td>
                          <td className="py-2.5 px-4 text-right text-sm text-gray-700 whitespace-nowrap">{fmtNumber(d.saves as number)}</td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            {(() => {
                              const engRate = (((d.likes as number) + (d.comments as number) + (d.saves as number)) / (d.reach as number) * 100).toFixed(1)
                              const isGood = parseFloat(engRate) >= ENGAGEMENT_THRESHOLD.high
                              const isBad  = parseFloat(engRate) < 2.5
                              return (
                                <span className={`text-sm font-semibold ${isGood ? 'text-brand-green-text' : isBad ? 'text-red-500' : 'text-gray-700'}`}>
                                  {engRate}%
                                </span>
                              )
                            })()}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 팔로워 인구통계 분석 — 원본 followersAudience 보강 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 relative">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-900">팔로워 분석</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{periodLabel}</span>
            <span className="text-sm text-gray-500">비공개 계정 제외</span>
          </div>
        </div>
        {(() => {
          // 공통 정책 (2026-05-14): 막대 차트 = brand-green-border (옅음) + 최대값만 brand-green (진함)
          const malePct = FOLLOWER_DEMOGRAPHIC.gender.malePercent
          const femalePct = FOLLOWER_DEMOGRAPHIC.gender.femalePercent
          const maleIsMax = malePct >= femalePct
          const ageMaxIdx = FOLLOWER_DEMOGRAPHIC.age.reduce((mi, a, i, arr) => a.percent > arr[mi].percent ? i : mi, 0)
          return (
            <div className="grid grid-cols-1 @md:grid-cols-2 gap-6">
              {/* 성별 */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">성별</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">남성</span>
                      <span className="text-brand-green-text font-bold">{malePct}%</span>
                    </div>
                    <div
                      className="h-2 bg-gray-100 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label="남성 팔로워 비율"
                      aria-valuenow={malePct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuetext={`${malePct}%`}
                    >
                      <div className={`h-full rounded-full ${maleIsMax ? 'bg-brand-green' : 'bg-brand-green-border'}`} style={{ width: `${malePct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">여성</span>
                      <span className="text-brand-green-text font-bold">{femalePct}%</span>
                    </div>
                    <div
                      className="h-2 bg-gray-100 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label="여성 팔로워 비율"
                      aria-valuenow={femalePct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuetext={`${femalePct}%`}
                    >
                      <div className={`h-full rounded-full ${!maleIsMax ? 'bg-brand-green' : 'bg-brand-green-border'}`} style={{ width: `${femalePct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* 연령대 */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">연령대</p>
                <div className="space-y-2.5">
                  {FOLLOWER_DEMOGRAPHIC.age.map((a, i) => (
                    <div key={a.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{a.range}세</span>
                        <span className="text-brand-green-text font-bold">{a.percent}%</span>
                      </div>
                      <div
                        className="h-2 bg-gray-100 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-label={`${a.range}세 팔로워 비율`}
                        aria-valuenow={a.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuetext={`${a.percent}%`}
                      >
                        <div
                          className={`h-full rounded-full ${i === ageMaxIdx ? 'bg-brand-green' : 'bg-brand-green-border'}`}
                          style={{ width: `${a.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* 게시물별 상세 성과 — 기존 서비스 ContentPerformance 동등 */}
      <PostContentTable />
    </div>
  )
}
