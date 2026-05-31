/**
 * Dashboard V2 — 광고주 피드백(2026-05-14) 반영 재설계
 *
 * 핵심 원칙: "눈으로 먼저 보이고, 텍스트로 보강"
 *  - 모든 KPI 카드: 스파크라인 + trend 톤 배경
 *  - 프로필 인사이트: 콘텐츠 유형별 성과 (참여율 비교 bar)
 *  - 광고 성과: CTR 추이 + 기간별 클릭 2열
 *  - 바이럴 지표 ★: 멘션 구성 도넛 + 워드클라우드 + 멘션 콘텐츠 카드 (영상 패턴)
 *  - 캠페인: 서브타이틀 + 진행률 + D-day + 인라인 지표 (종료 임박 카드 강조)
 *  - 빠른 실행: 삭제
 *
 * 모션: motion/react fade-in stagger (prefers-reduced-motion 가드)
 * 반응형: 모바일 1열 / 태블릿 sm: 일부 2-3열 / 데스크탑 lg: 본 레이아웃
 *
 * 참고: 문서/2026-05-14_광고주_대시보드_재설계_기획.md
 */

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight, Users, Eye, TrendingUp as TrendIcon, Sparkles,
  ListChecks, Calculator, Percent, DollarSign, Activity, Clapperboard,
  LayoutGrid, Hash, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react'
import {
  KPICard, PageHeader, DateRangePicker, WordCloud, EmptyState,
  ChartScrollContainer, useIsTouchDevice, fmtNumber, BRAND, CHART_COLORS,
  ErrorState, SkeletonCard, Skeleton,
  type ChartScrollContainerHandle, type DatePeriod, type WordCloudEntry,
} from '@wellink/ui'
import ImpressReachChart from '../components/analytics/profile/ImpressReachChart'
import ViralContentMiniCard from '../components/dashboard/ViralContentMiniCard'
import CampaignPreviewRow from '../components/dashboard/CampaignPreviewRow'
import useHeaderStuck from '../hooks/useHeaderStuck'
import { useDeviceMode } from '../qa-mockup-kit'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { usePlanAccess } from '../hooks/usePlanAccess'
import {
  DASHBOARD_VIRAL_KEYWORDS,
  DASHBOARD_VIRAL_MIX,
  DASHBOARD_VIRAL_CONTENTS,
  DASHBOARD_CAMPAIGN_PREVIEWS,
  DASHBOARD_CAMPAIGN_COUNTS,
  DASHBOARD_SPARKLINES_BY_PERIOD,
  DASHBOARD_KPI_VALUES_BY_PERIOD,
} from '../data/analytics/dashboard'
import { impressReachByPeriod } from '../data/analytics/profile'

const TREND_LABEL: Record<DatePeriod, string> = {
  일간: '전일 대비',
  주간: '전주 대비',
  월간: '전월 대비',
  연간: '전년 대비',
}

/* (KPI 라벨/아이콘/힌트는 정적, 값·trend·sparkline은 period별 동적 — 컴포넌트 안 useMemo) */

export default function DashboardV2() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const { isGated, planLabel } = usePlanAccess()
  const [period, setPeriod] = useState<DatePeriod>('일간')
  const [dateOffset, setDateOffset] = useState<number>(0)
  const trendLabel = TREND_LABEL[period]
  const reduceMotion = useReducedMotion()
  const isDesktop = useDeviceMode() === 'desktop'
  const isTouch = useIsTouchDevice()

  // 헤더 sticky 추적 — Dashboard v1 / 분석 페이지와 동일 패턴
  const { headerRef, isStuck } = useHeaderStuck<HTMLDivElement>()

  // 마지막 업데이트 시간 — mock (실제는 백엔드 sync 시간)
  const [lastSync] = useState(() => new Date(2026, 4, 14, 14, 0))
  const lastSyncStr = useMemo(() => {
    const m = String(lastSync.getMonth() + 1).padStart(2, '0')
    const d = String(lastSync.getDate()).padStart(2, '0')
    const h = String(lastSync.getHours()).padStart(2, '0')
    const min = String(lastSync.getMinutes()).padStart(2, '0')
    return `${lastSync.getFullYear()}.${m}.${d} ${h}:${min}`
  }, [lastSync])

  // 차트 ScrollContainer ref — period 변경 시 scrollToStart() 호출 (CLAUDE.md § 차트 인터랙션)
  const impReachChartRef = useRef<ChartScrollContainerHandle>(null)

  // 차트 활성 인덱스 — hover/touch 인터랙션 (ChartScrollContainer 툴팁 연동)
  // null로 초기화 후 mount 후 0으로 설정 → ChartScrollContainer scrollRef 준비 보장
  const [impReachActiveIdx, setImpReachActiveIdx] = useState<number | null>(null)

  // 마운트 후 초기 툴팁 — null로 시작해야 scrollRef가 준비된 뒤 툴팁 위치 계산 가능
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setImpReachActiveIdx(0)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  // mouseleave 시 null 무시 — 마지막 인덱스 유지 (호버 이탈 후 툴팁 사라짐 방지)
  const handleImpReachIdx = useCallback((i: number | null) => { if (i !== null) setImpReachActiveIdx(i) }, [])

  // 콘텐츠 카드 캐로셀 스크롤 추적
  const contentScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScroll = useCallback(() => {
    const el = contentScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = contentScrollRef.current
    if (!el) return
    updateScroll()
    el.addEventListener('scroll', updateScroll, { passive: true })
    const ro = new ResizeObserver(updateScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScroll)
      ro.disconnect()
    }
  }, [updateScroll])

  // 멘션 구성 도넛 계산
  const donutCircumference = 2 * Math.PI * 36
  const feedDash = (DASHBOARD_VIRAL_MIX.feed.percent / 100) * donutCircumference
  const reelsDash = (DASHBOARD_VIRAL_MIX.reels.percent / 100) * donutCircumference

  const viralKeywords = useMemo<WordCloudEntry[]>(() => DASHBOARD_VIRAL_KEYWORDS, [])

  /* ── period 기반 동적 데이터 ─────────────────────────────── */
  // 대시보드 요약: null 구간 제거 → "데이터 없음" 오버레이 없이 깔끔하게
  const impReachData = useMemo(
    () => impressReachByPeriod[period].filter(d => d.impressions !== null && d.reach !== null),
    [period]
  )
  const sparks = useMemo(() => DASHBOARD_SPARKLINES_BY_PERIOD[period], [period])
  const kpiValues = useMemo(() => DASHBOARD_KPI_VALUES_BY_PERIOD[period], [period])

  // period 변경 → 차트 스크롤 & 활성 인덱스 초기화 (CLAUDE.md § 차트 인터랙션 정책)
  useEffect(() => {
    impReachChartRef.current?.scrollToStart()
    requestAnimationFrame(() => {
      setImpReachActiveIdx(0)
    })
  }, [period])

  /* ── KPI 메트릭 — period별 값/trend
   *
   * Sparkline variant 선택 원칙 (데이터 종류 우선, 시각적 변주는 결과로):
   *   - Line  : 시점별 누적 절대값(팔로워 수, 총 도달) + 비율 메트릭(도달률·참여율·ROAS·결과당비용·바이럴계수)
   *   - Bar   : 시점별 증분 카운트(결과·공유·저장) + 증분 금액(일 지출)
   *   - Area  : 본 페이지에선 사용 X — 모든 KPI에 area 쓰면 변별력 손실. 메인 차트(별도 sticky chart)에서만 한정 사용.
   * ── */
  const profileMetrics = useMemo(() => [
    {
      label: '팔로워 수',
      value: kpiValues.profile.followers,
      trend: kpiValues.profile.trends.followers,
      trendUnit: '%',
      sparkline: sparks.followers,
      sparklineVariant: 'line' as const,  // 누적 절대값 — 추세 가시화
      icon: <Users size={14} aria-hidden="true" />,
      hint: '브랜드 계정 총 팔로워',
    },
    {
      label: '평균 도달률',
      value: kpiValues.profile.reachRate,
      trend: kpiValues.profile.trends.reachRate,
      trendUnit: '%p',
      sparkline: sparks.reachRate,
      sparklineVariant: 'line' as const,  // 비율
      icon: <Eye size={14} aria-hidden="true" />,
      hint: '게시물 1개당 팔로워 대비 도달 비율 평균',
    },
    {
      label: '참여율',
      value: kpiValues.profile.engagement,
      trend: kpiValues.profile.trends.engagement,
      trendUnit: '%p',
      sparkline: sparks.engagement,
      sparklineVariant: 'line' as const,  // 비율 — area는 "면적=총량"으로 오해 유발 (참여율은 비율이라 면적 의미 X)
      icon: <TrendIcon size={14} aria-hidden="true" />,
      hint: '(좋아요+댓글) / 도달 × 100',
    },
  ], [kpiValues, sparks])

  const adMetrics = useMemo(() => [
    {
      label: '광고 지출',
      value: kpiValues.ad.spend,
      trend: kpiValues.ad.trends.spend,
      trendUnit: '%',
      sparkline: sparks.adSpend,
      sparklineVariant: 'bar' as const,  // 일별 증분 금액 — 매일 따로 쓴 돈 (bar)
      icon: <DollarSign size={14} aria-hidden="true" />,
      hint: '선택 기간 광고 집행 총액',
    },
    {
      label: 'ROAS',
      value: kpiValues.ad.roas,
      trend: kpiValues.ad.trends.roas,
      trendUnit: 'x',
      sparkline: sparks.roas,
      sparklineVariant: 'line' as const,  // 비율 + 1.0x 손익분기 기준선
      sparklineReference: 1.0,
      icon: <Percent size={14} aria-hidden="true" />,
      hint: '광고 지출 대비 수익 효율 — 1.0x 이상이면 흑자',
    },
    {
      label: '결과',
      value: kpiValues.ad.results,
      trend: kpiValues.ad.trends.results,
      trendUnit: '%',
      sparkline: sparks.adResults,
      sparklineVariant: 'bar' as const,  // 증분 카운트
      icon: <ListChecks size={14} aria-hidden="true" />,
      hint: '캠페인 목표 달성 수',
    },
    {
      label: '결과당 비용',
      value: kpiValues.ad.costPerResult,
      trend: kpiValues.ad.trends.costPerResult,
      trendUnit: '%',
      positive: false,  // 낮을수록 좋음
      sparkline: sparks.costPerResult,
      sparklineVariant: 'line' as const,  // 비율
      icon: <Calculator size={14} aria-hidden="true" />,
      hint: '목표 1건 달성 평균 비용. 낮을수록 효율 우수.',
    },
  ], [kpiValues, sparks])

  const viralMetrics = useMemo(() => [
    {
      label: '총 조회수 (릴스)',
      value: kpiValues.viral.reelViews,
      trend: kpiValues.viral.trends.reelViews,
      trendUnit: '%',
      sparkline: sparks.reelViews,
      sparklineVariant: 'line' as const,
      icon: <Eye size={14} aria-hidden="true" />,
      hint: '릴스 콘텐츠가 사용자에게 도달한 총 조회수 (피드는 조회수 비공개)',
    },
    {
      label: '총 참여',
      value: kpiValues.viral.totalEngagement,
      trend: kpiValues.viral.trends.totalEngagement,
      trendUnit: '%',
      sparkline: sparks.totalEngagement,
      sparklineVariant: 'bar' as const,
      icon: <Activity size={14} aria-hidden="true" />,
      hint: '좋아요·댓글·공유·저장 합산',
    },
    {
      label: '평균 조회수 (릴스)',
      value: kpiValues.viral.avgReelViews,
      trend: kpiValues.viral.trends.avgReelViews,
      trendUnit: '%',
      sparkline: sparks.avgReelViews,
      sparklineVariant: 'line' as const,
      icon: <Clapperboard size={14} aria-hidden="true" />,
      hint: '릴스 콘텐츠 1건당 평균 조회수',
    },
  ], [kpiValues, sparks])

  // 캠페인 미리보기 — 종료 임박 플래그 사전 계산
  // (Date.now()는 useState lazy initializer로 mount 1회만 호출 → react-hooks/purity 회피)
  const [mountedAt] = useState(() => Date.now())
  const campaignsWithClosing = useMemo(() => {
    return DASHBOARD_CAMPAIGN_PREVIEWS
      .slice()
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 3)
      .map(c => {
        const dday = c.status === 'active' ? Math.ceil((new Date(c.endDate).getTime() - mountedAt) / 86400000) : 99
        return { ...c, isClosing: c.status === 'active' && dday >= 0 && dday <= 7 }
      })
  }, [mountedAt])

  const handleWordClick = useCallback((entry: WordCloudEntry) => {
    navigate(`/analytics/viral?keyword=${encodeURIComponent(entry.word)}`)
  }, [navigate])

  /* ── motion/react variants — prefers-reduced-motion 가드 ── */
  const sectionVariants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: { delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
        }),
      }

  if (qa === 'loading') {
    return (
      <div className="space-y-4 @sm:space-y-6">
        <div>
          <Skeleton shape="text" className="h-7 w-40 mb-2" />
          <Skeleton shape="text" className="h-4 w-56" />
        </div>
        {/* KPI 카드 그리드 — 2x3 */}
        <div className="grid grid-cols-2 @sm:grid-cols-3 gap-3 @sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        {/* 차트 섹션 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <Skeleton shape="text" className="h-4 w-28 mb-4" />
          <Skeleton shape="rect" className="h-48 w-full rounded-xl" />
        </div>
        {/* 바이럴 섹션 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <Skeleton shape="text" className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton shape="rect" className="h-32 rounded-xl" />
            <Skeleton shape="rect" className="h-32 rounded-xl" />
          </div>
        </div>
        {/* 캠페인 섹션 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <Skeleton shape="text" className="h-4 w-24 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} shape="text" className="h-14 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (qa === 'error') {
    return <ErrorState message="대시보드를 불러올 수 없습니다" subMessage="잠시 후 다시 시도해 주세요." onRetry={() => window.location.reload()} />
  }

  if (qa === 'empty' || qa === 'new-user') {
    return (
      <div className="space-y-4 @sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-[15px] text-gray-500 mt-0.5">캠페인 성과를 한눈에 확인하세요.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            size="lg"
            title={qa === 'new-user' ? '첫 캠페인을 시작해 보세요' : '캠페인이 없습니다'}
            description={qa === 'new-user'
              ? '캠페인을 등록하면 대시보드에서 성과를 실시간으로 확인할 수 있습니다.'
              : '진행 중인 캠페인이 없어 표시할 데이터가 없습니다.'
            }
            action={
              <button
                onClick={() => navigate('/campaigns/new')}
                className="mt-2 px-5 py-2.5 rounded-xl text-[15px] font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                캠페인 만들기
              </button>
            }
          />
        </div>
      </div>
    )
  }

  if (qa === 'plan-locked' || isGated) {
    return (
      <div className="space-y-4 @sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-[15px] text-gray-500 mt-0.5">캠페인 성과를 한눈에 확인하세요.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            size="lg"
            title={`${planLabel} 플랜에서는 이용할 수 없습니다`}
            description="더 높은 플랜으로 업그레이드하면 대시보드 전체 기능을 이용할 수 있습니다."
            action={
              <button
                onClick={() => navigate('/subscription')}
                className="mt-2 px-5 py-2.5 rounded-xl text-[15px] font-semibold text-white bg-brand-green hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                플랜 업그레이드
              </button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 @sm:space-y-6">
      {/* 헤더 — 페이지 제목 + 기간선택(PC만, sticky 전) + 마지막 업데이트 (sticky 감지 ref) */}
      <motion.div
        variants={sectionVariants}
        custom={0}
        initial="hidden"
        animate="visible"
        ref={headerRef}
      >
        <PageHeader
          title="대시보드"
          description="브랜드 운영 현황 한눈에 보기"
          actions={
            isDesktop && !isStuck ? (
              <DateRangePicker
                period={period}
                dateOffset={dateOffset}
                onPeriodChange={setPeriod}
                onDateOffsetChange={setDateOffset}
              />
            ) : undefined
          }
        />
        <p className="text-[15px] text-gray-500 mt-1.5 flex items-center gap-2 flex-wrap">
          <RefreshCw size={13} aria-hidden="true" />
          <span>마지막 업데이트 {lastSyncStr}</span>
          <span className="text-gray-300">·</span>
          <span>{trendLabel} 기준 데이터와 비교했습니다.</span>
        </p>
      </motion.div>

      {/* 기간 선택기 sticky — 모바일은 항상 보임 / PC는 PageHeader 화면 밖으로 빠질 때만 (우측 정렬) */}
      <div
        className={`sticky z-20 -mx-4 px-4 @sm:-mx-6 @sm:px-6 @lg:-mx-8 @lg:px-8 transition-all ${
          isDesktop && !isStuck
            ? 'h-0 overflow-hidden py-0 border-b border-transparent'
            : isStuck
              ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100 py-2.5'
              : 'border-b border-transparent py-2.5'
        } ${isDesktop ? 'top-0' : 'top-12'}`}
        aria-hidden={isDesktop && !isStuck}
      >
        <div className={isStuck ? 'flex justify-end' : undefined}>
          <DateRangePicker
            period={period}
            dateOffset={dateOffset}
            onPeriodChange={setPeriod}
            onDateOffsetChange={setDateOffset}
            compact={!isDesktop}
          />
        </div>
      </div>

      {/* ── 1+2 xl 이상: 2열 나란히 / xl 미만: 세로 쌓기 ── */}
      <div className="grid grid-cols-1 @[700px]:grid-cols-2 gap-4 @[350px]:gap-6 items-stretch">

      {/* ── 1. 프로필 인사이트 ─────────────────────────── */}
      <motion.section
        variants={sectionVariants}
        custom={1}
        initial="hidden"
        animate="visible"
        className="@container bg-white rounded-2xl border border-gray-100 shadow-sm p-3 @[350px]:p-5 flex flex-col"
      >
        <SectionHeader
          icon={<Users size={16} aria-hidden="true" />}
          title="프로필 인사이트"
          meta={trendLabel}
          actionLabel="더보기"
          onAction={() => navigate('/analytics/profile')}
        />
        {/* 프로필 인사이트 KPI 3개 — 모바일 1열 → 350px 2열 → 530px 3열 */}
        <div className="grid grid-cols-1 @[350px]:grid-cols-2 @[530px]:grid-cols-3 gap-3 @[350px]:gap-4 mb-4 shrink-0">
          {profileMetrics.map(m => (
            <KPICard
              key={m.label}
              title={m.label}
              value={m.value}
              trend={m.trend}
              trendUnit={m.trendUnit}
              trendLabel={trendLabel}
              sparkline={[...m.sparkline]}
              sparklineVariant={m.sparklineVariant}
              tonedBackground
              icon={m.icon}
              tooltip={m.hint}
            />
          ))}
        </div>
        {/* 노출 & 도달 추이 — 프로필인사이트 ImpressReachChart 재사용 */}
        <div className="flex-1 min-h-0 pt-2">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="text-[15px] font-medium text-gray-600">노출 & 도달 추이</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-indigo-400 inline-block" />노출</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-brand-green inline-block" />도달</span>
            </div>
          </div>
          <ChartScrollContainer
            ref={impReachChartRef}
            chartW={Math.max(620, impReachData.length * 22)} padL={48} padR={24}
            dataLength={impReachData.length}
            activeIndex={impReachActiveIdx}
            tooltipContent={(i) => {
              const d = impReachData[i]
              if (!d) return null
              return (
                <>
                  <p className="text-xs text-gray-400 mb-1.5 whitespace-nowrap">{d.label}</p>
                  {d.impressions !== null && <p className="text-xs font-semibold text-indigo-600 whitespace-nowrap">노출 {fmtNumber(d.impressions)}</p>}
                  {d.reach !== null && <p className="text-xs font-semibold text-brand-green-text whitespace-nowrap">도달 {fmtNumber(d.reach)}</p>}
                </>
              )
            }}
          >
            <ImpressReachChart
              data={impReachData}
              activeIndex={impReachActiveIdx}
              onActiveIndex={handleImpReachIdx}
              isTouch={isTouch}
              padL={48}
              padR={24}
              minWidthPerItem={22}
            />
          </ChartScrollContainer>
        </div>
      </motion.section>

      {/* ── 2. 광고 성과 ─────────────────────────────── */}
      <motion.section
        variants={sectionVariants}
        custom={2}
        initial="hidden"
        animate="visible"
        className="@container bg-white rounded-2xl border border-gray-100 shadow-sm p-3 @[350px]:p-5 flex flex-col"
      >
        <SectionHeader
          icon={<TrendIcon size={16} aria-hidden="true" />}
          title="광고 성과"
          meta={trendLabel}
          actionLabel="더보기"
          onAction={() => navigate('/analytics/ads')}
        />
        {/* 광고 성과 KPI 4개 — 모바일 1열, 350px 이상 2열. 그래프-값 충돌 방지. */}
        <div className="grid grid-cols-1 @[350px]:grid-cols-2 gap-3 @[350px]:gap-4 mb-4 flex-1 content-start">
          {adMetrics.map(m => (
            <KPICard
              key={m.label}
              title={m.label}
              value={m.value}
              trend={m.trend}
              trendUnit={m.trendUnit}
              trendLabel={trendLabel}
              positive={'positive' in m ? m.positive : undefined}
              sparkline={[...m.sparkline]}
              sparklineVariant={m.sparklineVariant}
              sparklineReference={'sparklineReference' in m ? m.sparklineReference : undefined}
              tonedBackground
              icon={m.icon}
              tooltip={m.hint}
            />
          ))}
        </div>
      </motion.section>

      </div>{/* /grid 1+2 */}

      {/* ── 3. ★ 바이럴 지표 ─────────────────────────── */}
      <motion.section
        variants={sectionVariants}
        custom={3}
        initial="hidden"
        animate="visible"
        className="@container bg-white rounded-2xl border border-gray-100 shadow-sm p-3 @[350px]:p-5"
      >
        <SectionHeader
          icon={<Sparkles size={16} aria-hidden="true" />}
          title="바이럴 지표"
          meta={`기준 ${lastSyncStr.slice(0, 10)}`}
          actionLabel="더보기"
          onAction={() => navigate('/analytics/viral')}
        />

        {/* 바이럴 KPI 3개 — 모바일 1열, 480px 이상 3열 */}
        <div className="grid grid-cols-1 @[480px]:grid-cols-3 gap-3 @[350px]:gap-4 mb-5">
          {viralMetrics.map(m => (
            <KPICard
              key={m.label}
              title={m.label}
              value={m.value}
              trend={m.trend}
              trendUnit={m.trendUnit}
              trendLabel={trendLabel}
              sparkline={[...m.sparkline]}
              sparklineVariant={m.sparklineVariant}
              tonedBackground
              icon={m.icon}
              tooltip={m.hint}
            />
          ))}
        </div>

        {/* 멘션 구성 도넛 + 워드클라우드 */}
        <div className="grid grid-cols-1 @[500px]:grid-cols-[240px_1fr] gap-4 @[500px]:gap-6 mb-5">
          {/* 멘션 구성 도넛 */}
          <div className="rounded-xl bg-gray-50 p-4 flex flex-col items-center">
            <h3 className="text-[15px] font-bold text-gray-700 uppercase tracking-wide mb-3 self-start">멘션 구성</h3>
            <div className="relative w-32 h-32 mb-3" role="img" aria-label={`총 멘션 ${DASHBOARD_VIRAL_MIX.total}건, 릴스 ${DASHBOARD_VIRAL_MIX.reels.percent}%, 피드 ${DASHBOARD_VIRAL_MIX.feed.percent}%`}>
              <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="45" cy="45" r="36" fill="none" stroke={CHART_COLORS.grid} strokeWidth="14" />
                <circle
                  cx="45" cy="45" r="36" fill="none"
                  stroke={BRAND.green} strokeWidth="14"
                  strokeDasharray={`${reelsDash} ${donutCircumference - reelsDash}`}
                />
                <circle
                  cx="45" cy="45" r="36" fill="none"
                  stroke={BRAND.greenText} strokeWidth="14"
                  strokeDasharray={`${feedDash} ${donutCircumference - feedDash}`}
                  strokeDashoffset={-reelsDash}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 tabular-nums">{DASHBOARD_VIRAL_MIX.total}</span>
                <span className="text-[15px] text-gray-500 mt-0.5">총 멘션</span>
              </div>
            </div>
            <dl className="w-full space-y-1.5 text-[15px]">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-brand-green inline-block" aria-hidden="true" />
                  릴스
                </dt>
                <dd className="font-semibold text-gray-900 tabular-nums">
                  {DASHBOARD_VIRAL_MIX.reels.count} ({DASHBOARD_VIRAL_MIX.reels.percent}%)
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-brand-green-text inline-block" aria-hidden="true" />
                  피드
                </dt>
                <dd className="font-semibold text-gray-900 tabular-nums">
                  {DASHBOARD_VIRAL_MIX.feed.count} ({DASHBOARD_VIRAL_MIX.feed.percent}%)
                </dd>
              </div>
            </dl>
          </div>

          {/* 워드클라우드 */}
          <div className="rounded-xl bg-gray-50 p-4 flex flex-col">
            <div className="flex items-center gap-1.5 mb-3">
              <Hash size={12} className="text-gray-400" aria-hidden="true" />
              <h3 className="text-[15px] font-bold text-gray-700 uppercase tracking-wide">캡션 워드클라우드</h3>
            </div>
            <div className="flex-1 flex items-center min-h-[140px]">
              <WordCloud
                entries={viralKeywords}
                limit={28}
                onWordClick={handleWordClick}
                emptyMessage="아직 멘션 데이터가 없습니다."
                className="w-full py-2"
              />
            </div>
            <p className="text-[15px] text-gray-500 mt-3">단어 클릭 시 해당 키워드로 필터된 바이럴 페이지로 이동합니다.</p>
          </div>
        </div>

        {/* 멘션 콘텐츠 캐로셀 — 가로 스크롤 + 쉐브론 + fade */}
        <div>
          <h3 className="text-[15px] font-medium text-gray-600 mb-3">최근 멘션 콘텐츠</h3>
          {DASHBOARD_VIRAL_CONTENTS.length === 0 ? (
            <EmptyState
              variant="default"
              title="멘션 콘텐츠가 없습니다"
              description="캠페인이 시작되면 인플루언서 멘션 콘텐츠가 이곳에 나타납니다."
            />
          ) : (
            <div className="relative -mx-3 @[350px]:-mx-5">
              {/* 좌측 fade */}
              {canScrollLeft && (
                <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none z-[5]" aria-hidden="true" />
              )}
              {canScrollRight && (
                <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none z-[5]" aria-hidden="true" />
              )}

              {/* 쉐브론 좌 */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => contentScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                  aria-label="콘텐츠 왼쪽으로 스크롤"
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                </button>
              )}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => contentScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                  aria-label="콘텐츠 오른쪽으로 스크롤"
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 transition-colors"
                >
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              )}

              {/* 가로 스크롤 트랙 */}
              <div ref={contentScrollRef} className="overflow-x-auto scrollbar-none px-3 @[350px]:px-5">
                <div className="flex gap-3 pb-1">
                  {DASHBOARD_VIRAL_CONTENTS.map(content => (
                    <ViralContentMiniCard
                      key={content.id}
                      thumbnail={content.thumbnail}
                      contentType={content.contentType}
                      caption={content.caption}
                      influencer={content.influencer}
                      metrics={content.metrics}
                      grade={content.grade}
                      onClick={() => navigate(`/analytics/viral?content_id=${content.id}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── 4. 캠페인 ──────────────────────────────────── */}
      <motion.section
        variants={sectionVariants}
        custom={4}
        initial="hidden"
        animate="visible"
        className="@container bg-white rounded-2xl border border-gray-100 shadow-sm p-3 @[350px]:p-5"
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-gray-500" aria-hidden="true" />
            <h2 className="text-[15px] font-semibold text-gray-900">캠페인</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
          >
            캠페인 목록 <ArrowRight size={12} aria-hidden="true" />
          </button>
        </div>
        <p className="text-[15px] text-gray-500 mb-4">
          <span className="text-brand-green-text font-medium tabular-nums">진행중 {DASHBOARD_CAMPAIGN_COUNTS.active}</span>
          <span className="mx-1.5 text-gray-300">·</span>
          <span className="tabular-nums">검토 대기 {DASHBOARD_CAMPAIGN_COUNTS.review}</span>
          <span className="mx-1.5 text-gray-300">·</span>
          <span className={`tabular-nums ${DASHBOARD_CAMPAIGN_COUNTS.closing > 0 ? 'text-rose-600 font-medium' : ''}`}>
            종료 임박 {DASHBOARD_CAMPAIGN_COUNTS.closing}
          </span>
        </p>
        {DASHBOARD_CAMPAIGN_PREVIEWS.length === 0 ? (
          <EmptyState
            variant="default"
            title="등록된 캠페인이 없습니다"
            description="첫 캠페인을 시작해 보세요."
            action={
              <button
                type="button"
                onClick={() => navigate('/campaigns/new')}
                className="bg-brand-green hover:bg-brand-green-hover text-white px-4 py-2 rounded-lg text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                캠페인 만들기
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {campaignsWithClosing.map(c => (
              <div key={c.id} className={c.isClosing ? 'rounded-xl ring-1 ring-rose-100' : ''}>
                <CampaignPreviewRow
                  name={c.name}
                  status={c.status}
                  goal={c.goal}
                  influencers={c.influencers}
                  startDate={c.startDate}
                  endDate={c.endDate}
                  metrics={c.metrics}
                  onClick={() => navigate('/campaigns')}
                />
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}

/* ── 공통 섹션 헤더 — 일관 레이아웃 ────────────────────────── */
function SectionHeader({
  icon, title, meta, actionLabel, onAction,
}: {
  icon: React.ReactNode
  title: string
  meta?: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-gray-500 shrink-0">{icon}</span>
        <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
        {meta && <span className="text-[15px] text-gray-500 whitespace-nowrap">{meta}</span>}
      </div>
      <button
        type="button"
        onClick={onAction}
        className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded shrink-0"
      >
        {actionLabel} <ArrowRight size={12} aria-hidden="true" />
      </button>
    </div>
  )
}
