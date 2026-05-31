import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, Info, Award, Megaphone, Zap, Eye, RotateCw, Clock, ThumbsUp, MessageCircle, Activity, Clapperboard, Share2, Bookmark } from 'lucide-react'
import { KPICard, ErrorState, EmptyState, useToast, DateRangePicker, Tooltip, Pagination, WordCloud, fmtNumber, getDateLabel, CHART_COLORS, CustomSelect, SkeletonCard, FloatingScrollChevrons, PageHeader, type DatePeriod, type WordCloudEntry } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import useHeaderStuck from '../hooks/useHeaderStuck'
import useTableScroll from '../hooks/useTableScroll'
import { useDeviceMode } from '../qa-mockup-kit'
import {
  viralContentData,
  CAMPAIGN_MATCH_MAP,
  type ViralContent,
} from '../data/analytics/viral'
import BetaBadge from '../components/analytics/viral/BetaBadge'
import GradeDonut from '../components/analytics/viral/GradeDonut'
import ContentDetailModal from '../components/analytics/viral/ContentDetailModal'
import ViralContentRowCard from '../components/analytics/viral/ViralContentRowCard'
import {
  DASHBOARD_VIRAL_KEYWORDS,
  DASHBOARD_VIRAL_MIX,
} from '../data/analytics/dashboard'

export default function ViralMetrics() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const isDesktop = useDeviceMode() === 'desktop'
  const [period, setPeriod] = useState<DatePeriod>('월간')
  const [dateOffset, setDateOffset] = useState(0)
  // 콘텐츠 뷰 모드 — 카드 그리드 전용 (테이블 모드 토글 제거됨, state는 호환용으로 남김)
  const [contentViewMode] = useState<'grid' | 'table'>('grid')
  void contentViewMode  // unused after toggle removal
  // 콘텐츠 필터·정렬·페이지네이션·등급 필터 (원본 보강)
  type ContentSort = 'createdAt' | 'views' | 'likes' | 'comments' | 'engagement'
  type ContentFilter = '전체' | '릴스' | '피드'
  type GradeFilterT = '전체' | 'processing' | 'A' | 'B' | 'C' | 'D' | 'E'
  const [contentSort, setContentSort] = useState<ContentSort>('createdAt')
  const [contentFilter, setContentFilter] = useState<ContentFilter>('전체')
  const [gradeFilter, setGradeFilter] = useState<GradeFilterT>('전체')
  const [contentPage, setContentPage] = useState(1)
  const [selectedContent, setSelectedContent] = useState<ViralContent | null>(null)
  const VC_PAGE_SIZE = 10

  // 테이블 가로 스크롤 — 공통 훅(useTableScroll)으로 추출 (쉐브론은 FloatingScrollChevrons에서 처리)
  const { scrollRef: tableScrollRef } = useTableScroll<HTMLDivElement>()
  const tableRef = useRef<HTMLTableElement>(null)

  // 기간/날짜 변경 시 페이지 1 리셋 — 외부 prop sync (정책 §외부동기화)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContentPage(1)
  }, [period, dateOffset])

  // 헤더 sticky 상태 추적 — 공통 훅(useHeaderStuck)으로 추출
  const { headerRef, isStuck } = useHeaderStuck<HTMLDivElement>()

  // 유형 필터만 적용된 리스트 — 등급 칩 카운트 계산에 사용
  const filteredByType = useMemo<ViralContent[]>(() => {
    if (contentFilter === '전체') return viralContentData
    return viralContentData.filter(c => c.type === contentFilter)
  }, [contentFilter])

  // 필터·정렬 결과 useMemo — 100개 정렬을 매 렌더 반복 방지
  const sortedContent = useMemo(() => {
    let list: ViralContent[] = viralContentData
    if (contentFilter !== '전체') list = list.filter(c => c.type === contentFilter)
    if (gradeFilter !== '전체') list = list.filter(c => c.grade === gradeFilter)
    return [...list].sort((a, b) => {
      switch (contentSort) {
        case 'createdAt': return b.createdAt.localeCompare(a.createdAt)
        case 'views': return b.reach - a.reach
        case 'likes': return b.likes - a.likes
        case 'comments': return b.comments - a.comments
        case 'engagement': return (b.likes + b.comments) - (a.likes + a.comments)
        default: return b.viralScore - a.viralScore
      }
    })
  }, [contentFilter, gradeFilter, contentSort])

  /* ── QA: 로딩 스켈레톤 — 공통 SkeletonCard ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col @sm:flex-row @sm:items-start @sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-32 bg-gray-100 animate-pulse rounded-xl" />
            <div className="h-5 w-10 bg-gray-100 animate-pulse rounded-full" />
          </div>
          <div className="h-9 w-64 bg-gray-100 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 @sm:gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} height={128} />)}
        </div>
        <SkeletonCard height={64} />
        <SkeletonCard height={256} />
      </div>
    )
  }

  /* ── Instagram 미연결 상태 ── */
  if (qa === 'disconnected' || !isInstagramConnected) {
    return (
      <div className="space-y-6">
        <PageHeader title="바이럴 지표" meta={<BetaBadge />} />
        <InstagramConnectPrompt featureName="바이럴 지표" />
      </div>
    )
  }

  /* ── QA: 빈 상태 — 바이럴 콘텐츠 없음 (공통 EmptyState) ── */
  if (qa === 'empty') {
    return (
      <div className="space-y-6">
        <PageHeader title="바이럴 지표" meta={<BetaBadge />} />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            size="lg"
            icon={<Zap size={40} />}
            title="바이럴 콘텐츠 데이터가 없습니다"
            description="인플루언서 캠페인 콘텐츠가 게시되면 바이럴 지표가 자동으로 집계됩니다."
            action={
              <button type="button"
                onClick={() => navigate('/campaigns')}
                className="text-base font-medium text-white px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                캠페인 만들기
              </button>
            }
          />
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

  // 원본 ViralMetricsSection KPI 5종 — 실제 viralContentData 집계 (정책서 § 9-1 동기화)
  const reels = useMemo(() => viralContentData.filter(c => c.type === '릴스' && !isZero), [isZero])
  const allContent = useMemo(() => isZero ? [] : viralContentData, [isZero])
  const reelTotalViews = useMemo(() => reels.reduce((s, c) => s + c.reach, 0), [reels])
  const reelAvgViews   = useMemo(() => reels.length > 0 ? Math.floor(reelTotalViews / reels.length) : 0, [reels, reelTotalViews])
  const totalLikes     = useMemo(() => allContent.reduce((s, c) => s + c.likes, 0), [allContent])
  const totalComments  = useMemo(() => allContent.reduce((s, c) => s + c.comments, 0), [allContent])
  const totalShares     = useMemo(() => allContent.reduce((s, c) => s + c.shares, 0), [allContent])
  const totalSaves      = useMemo(() => allContent.reduce((s, c) => s + c.saves, 0), [allContent])
  const totalEngagement = useMemo(() => allContent.reduce((s, c) => s + c.likes + c.comments + c.shares + c.saves, 0), [allContent])

  // 전날 대비 — 기간별 mock 성장률 (실연동 시 BE 응답)
  const growthByPeriod: Record<DatePeriod, { views: number; likes: number; comments: number; engagement: number; avgViews: number }> = {
    일간: { views: 3.2,  likes: 4.1,  comments: 2.8,  engagement: 3.5,  avgViews: 1.7  },
    주간: { views: 8.4,  likes: 12.3, comments: 9.7,  engagement: 10.5, avgViews: 5.2  },
    월간: { views: 15.3, likes: 22.1, comments: 18.7, engagement: 19.4, avgViews: 8.4  },
    연간: { views: 42.1, likes: 58.3, comments: 51.2, engagement: 48.6, avgViews: 24.6 },
  }
  const growth = isZero
    ? { views: 0, likes: 0, comments: 0, engagement: 0, avgViews: 0 }
    : growthByPeriod[period]

  // 마지막 동기화 시각 — mock: 현재 시각의 5분 전 (실연동 시 BE 응답)
  const [syncedAt, setSyncedAt] = useState<Date>(() => new Date(Date.now() - 5 * 60 * 1000))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    // mock: 1초 후 동기화 시각 갱신
    setTimeout(() => {
      setSyncedAt(new Date())
      setIsRefreshing(false)
      showToast('바이럴 지표를 새로고침했습니다', 'success')
    }, 1000)
  }
  const fmtSyncTime = (d: Date) => d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  // 기준일 — 현재 기간·offset에 따른 표시 일자 (period가 일간이면 오늘, 주간/월간은 시작일)
  const referenceDate = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() - dateOffset)
    return today.toISOString().split('T')[0]
  }, [dateOffset])

  // 페이지네이션 적용
  const totalPages = Math.max(1, Math.ceil(sortedContent.length / VC_PAGE_SIZE))
  const safePage = Math.min(contentPage, totalPages)
  const paginated = sortedContent.slice((safePage - 1) * VC_PAGE_SIZE, safePage * VC_PAGE_SIZE)

  return (
    <>
    <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
    <div className="space-y-6">
      {/* 헤더 — 공통 PageHeader + 새로고침/동기화 시각/기준일 배지 (원본 ViralMetricsSection L1596-1624 보강) */}
      <div ref={headerRef}>
        <PageHeader
          title="바이럴 지표"
          meta={
            <div className="flex items-center gap-2 flex-wrap">
              <BetaBadge />
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 whitespace-nowrap">
                기준일 {referenceDate}
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                <RotateCw size={13} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
                새로고침
              </button>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                <Clock size={11} aria-hidden="true" />
                <span>마지막 동기화 {fmtSyncTime(syncedAt)}</span>
              </div>
            </div>
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

      {/* 월간·연간 데이터 부정확 안내 배너 */}
      {(period === '월간' || period === '연간') && (
        <div className="flex items-start gap-2 bg-amber-100 border border-amber-200 rounded-xl px-4 py-3">
          <Info size={14} className="text-amber-700 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-amber-800 leading-relaxed">
            데이터는 최근 28일 기준으로 수집됩니다. <strong>월간·연간 수치는 실제와 다를 수 있습니다.</strong>
          </p>
        </div>
      )}

      {/* 데이터 수집/동기화 상태 배너 — 원본 ViralMetricsSection L1636-1647 보강. qa=updating 또는 새로고침 진행 중일 때 노출. */}
      {(qa === 'updating' || isRefreshing) && (
        <div className="flex items-center gap-2 rounded-xl border border-brand-green-border bg-brand-green-bg/60 px-4 py-3 text-sm text-brand-green-text">
          <RotateCw size={14} className="animate-spin shrink-0" aria-hidden="true" />
          <span>
            {qa === 'updating'
              ? '아직 오늘 멘션 데이터를 수집하고 있어요. 5초마다 상태를 다시 확인합니다.'
              : '멘션 데이터를 다시 불러오는 중입니다…'}
          </span>
        </div>
      )}

      {/* 전날 대비 비교 배너 — 원본 ViralMetricsSection L1649-1651 보강 */}
      {!isZero && (
        <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-gray-600 flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900">전날 대비</span>
          <span>총 참여 {growth.engagement > 0 ? '+' : ''}{growth.engagement.toFixed(1)}%</span>
          <span className="text-gray-300">·</span>
          <span>조회수 {growth.views > 0 ? '+' : ''}{growth.views.toFixed(1)}%</span>
          <span className="text-gray-300">·</span>
          <span>좋아요 {growth.likes > 0 ? '+' : ''}{growth.likes.toFixed(1)}%</span>
        </div>
      )}

      {/* KPI 카드 7개 — 총조회수·총좋아요·총댓글·총참여·평균조회수·총공유·총저장 */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="총 조회수 (릴스)"
          value={isZero ? '--' : fmtNumber(reelTotalViews)}
          sub={`릴스 ${reels.length}건`}
          trend={growth.views}
          trendLabel="전날 대비"
          icon={<Eye size={16} aria-hidden="true" />}
          tooltip="릴스 콘텐츠가 사용자에게 도달한 총 조회수 (피드는 조회수 비공개)"
        />
        <KPICard
          title="총 좋아요"
          value={isZero ? '--' : fmtNumber(totalLikes)}
          sub="모든 멘션 콘텐츠"
          trend={growth.likes}
          trendLabel="전날 대비"
          icon={<ThumbsUp size={16} aria-hidden="true" />}
          tooltip="피드·릴스 멘션 콘텐츠의 좋아요 합산"
        />
        <KPICard
          title="총 댓글"
          value={isZero ? '--' : fmtNumber(totalComments)}
          sub="모든 멘션 콘텐츠"
          trend={growth.comments}
          trendLabel="전날 대비"
          icon={<MessageCircle size={16} aria-hidden="true" />}
          tooltip="피드·릴스 멘션 콘텐츠의 댓글 합산"
        />
        <KPICard
          title="총 공유"
          value={isZero ? '--' : fmtNumber(totalShares)}
          sub="모든 멘션 콘텐츠"
          trend={growth.engagement}
          trendLabel="전날 대비"
          icon={<Share2 size={16} aria-hidden="true" />}
          tooltip="피드·릴스 멘션 콘텐츠의 공유 합산"
        />
        <KPICard
          title="총 저장"
          value={isZero ? '--' : fmtNumber(totalSaves)}
          sub="모든 멘션 콘텐츠"
          trend={growth.engagement}
          trendLabel="전날 대비"
          icon={<Bookmark size={16} aria-hidden="true" />}
          tooltip="피드·릴스 멘션 콘텐츠의 저장 합산"
        />
        <KPICard
          title="총 참여"
          value={isZero ? '--' : fmtNumber(totalEngagement)}
          sub="좋아요+댓글+공유+저장"
          trend={growth.engagement}
          trendLabel="전날 대비"
          icon={<Activity size={16} aria-hidden="true" />}
          valueColor="text-brand-green-text"
          tooltip="좋아요·댓글·공유·저장 합산"
        />
        <KPICard
          title="평균 조회수 (릴스)"
          value={isZero ? '--' : fmtNumber(reelAvgViews)}
          sub={`릴스 ${reels.length}건 평균`}
          trend={growth.avgViews}
          trendLabel="전날 대비"
          icon={<Clapperboard size={16} aria-hidden="true" />}
          tooltip="릴스 콘텐츠 1건당 평균 조회수"
        />
      </div>

      {/* 등급 분포 + 멘션 구성 — 두 요약 도넛 페어 (원본 ViralMetricsSection L1707-1748 보강) */}
      <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-4">
        {/* 등급 분포 도넛 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center gap-1.5 mb-3">
            <Award size={14} className="text-gray-400" aria-hidden="true" />
            <h2 className="text-base font-semibold text-gray-900">콘텐츠 등급 분포</h2>
            <Tooltip content="원본 ContentScoreItem 등급(A~E)에 따라 콘텐츠를 분류합니다." multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <GradeDonut data={viralContentData} />
        </div>

        {/* 멘션 구성 도넛 (피드/릴스) + 사이드 3카드 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center gap-1.5 mb-1">
            <Image size={14} className="text-gray-400" aria-hidden="true" />
            <h2 className="text-base font-semibold text-gray-900">멘션 구성</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">최근 수집된 멘션의 피드와 릴스의 비중입니다.</p>
          <div className="flex flex-col @sm:flex-row items-center @sm:items-center gap-4">
            <div className="shrink-0">
              <MentionMixDonut />
            </div>
            <div className="grid grid-cols-1 gap-2 w-full @sm:min-w-[160px]">
              <MentionStatCard label="총 멘션 수" value={DASHBOARD_VIRAL_MIX.total} growth={DASHBOARD_VIRAL_MIX.totalTrend} />
              <MentionStatCard label="피드 멘션"   value={DASHBOARD_VIRAL_MIX.feed.count}  growth={DASHBOARD_VIRAL_MIX.feedTrend} />
              <MentionStatCard label="릴스 멘션"   value={DASHBOARD_VIRAL_MIX.reels.count} growth={DASHBOARD_VIRAL_MIX.reelsTrend} />
            </div>
          </div>
        </div>
      </div>

      {/* ── ★ 최근 3개월 멘션 콘텐츠 섹션 — 캡션 워드클라우드 + 콘텐츠별 바이럴 성과를 하나의 그룹으로 인지 (원본 ViralMetricsSection L1751-1925 매칭) ★ ── */}
      <section className="space-y-4 pt-4 border-t-2 border-gray-100">
        <header className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">최근 3개월 멘션 콘텐츠</h2>
            <p className="text-sm text-gray-500 mt-1">릴스만 점수 분석하며, 목록은 피드와 릴스를 필터로 나눠 볼 수 있습니다.</p>
          </div>
          <p className="text-sm text-gray-500">계정 <span className="font-medium text-gray-700">@enuf.sports</span></p>
        </header>

        {/* 캡션 워드클라우드 — 원본 매칭, 단순 워드클라우드 (sentiment 토글 제거) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <Megaphone size={14} className="text-gray-400" aria-hidden="true" />
            <h2 className="text-base font-semibold text-gray-900">캡션 워드클라우드</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">캡션 데이터 {DASHBOARD_VIRAL_KEYWORDS.length}개 · 큰 단어일수록 많이 언급</p>
          <div className="flex-1 flex items-center justify-center min-h-[260px]">
          <WordCloud
            entries={DASHBOARD_VIRAL_KEYWORDS as WordCloudEntry[]}
            limit={36}
            className="w-full"
            onWordClick={(entry) => showToast(`'${entry.word}' 키워드로 콘텐츠 필터링 (${entry.count}회 멘션)`, 'info')}
            emptyMessage="단어 데이터가 아직 없습니다"
          />
          </div>
        </div>

        {/* fixed 플로팅 스크롤 쉐브론 — 사이드바 회피 + 40px 터치 타깃 */}
        <FloatingScrollChevrons scrollRef={tableScrollRef} contentRef={tableRef} />

      {/* 콘텐츠별 바이럴 성과 테이블 (필터·정렬·페이지네이션 보강) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">콘텐츠별 바이럴 성과</h2>
            <p className="text-sm text-gray-500 mt-1">총 {sortedContent.length}건 · {getDateLabel(period, dateOffset)}</p>
          </div>
          {/* 우측 — 콘텐츠 타입(pill) + 정렬 기준(dropdown) — 원본 ViralMetricsSection 매칭 */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">콘텐츠</span>
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
                {(['전체', '피드', '릴스'] as ContentFilter[]).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setContentFilter(f); setContentPage(1) }}
                    className={`text-sm px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                      contentFilter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-pressed={contentFilter === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">정렬 기준</span>
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
                className="text-sm min-w-[130px]"
              />
            </div>
          </div>
        </div>

        {/* 등급 칩 + 유형/정렬 필터 — 한 row 통합 (좌: 등급 / 우: 유형·정렬) */}
        <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
          {(() => {
            const counts = {
              전체: filteredByType.length,
              A: filteredByType.filter(c => c.grade === 'A').length,
              B: filteredByType.filter(c => c.grade === 'B').length,
              C: filteredByType.filter(c => c.grade === 'C').length,
              D: filteredByType.filter(c => c.grade === 'D').length,
              E: filteredByType.filter(c => c.grade === 'E').length,
              processing: filteredByType.filter(c => c.grade === 'processing').length,
            }
            const chips: { value: GradeFilterT; label: string; count: number }[] = [
              { value: '전체', label: '전체', count: counts.전체 },
              { value: 'A', label: 'A 우수', count: counts.A },
              { value: 'B', label: 'B', count: counts.B },
              { value: 'C', label: 'C', count: counts.C },
              { value: 'D', label: 'D', count: counts.D },
              { value: 'E', label: 'E', count: counts.E },
              { value: 'processing', label: '점수 산정중', count: counts.processing },
            ]
            return chips.map(chip => (
              <button
                key={chip.value}
                type="button"
                onClick={() => { setGradeFilter(chip.value); setContentPage(1) }}
                className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 ${
                  gradeFilter === chip.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={gradeFilter === chip.value}
              >
                {chip.label} <span className="tabular-nums opacity-70 ml-0.5">{chip.count}</span>
              </button>
            ))
          })()}
          </div>

        </div>
        {/* 글로벌 안내 — 피드 조회수 표시 정책 (영상 매칭) */}
        <div className="px-5 py-2.5 border-b border-gray-50 bg-amber-50/40">
          <p className="text-sm text-amber-800 flex items-center gap-1.5">
            <Info size={13} className="text-amber-600 shrink-0" aria-hidden="true" />
            피드 조회수는 확인할 수 없어 <strong className="font-semibold">'알 수 없음'</strong>으로 표시됩니다.
          </p>
        </div>

        {/* ── 콘텐츠 표시 — 카드 그리드 (테이블 토글 제거됨) ── */}
        <div className="p-3 @sm:p-4 bg-gray-50/30">
            {paginated.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">조건에 맞는 콘텐츠가 없습니다.</div>
            ) : (
              // 항상 1열 — 2열로 가면 카드가 좁아져 가로 layout이 깨짐. 카드 자체가 wide horizontal이라 1열로 충분히 나열.
              <div className="grid grid-cols-1 gap-3">
                {paginated.map((item, idx) => {
                  // seed 기반 증감률 mock (전월 대비 %) — 실 API 연동 전 임시
                  const s = (parseInt(item.id.replace(/\D/g, '') || '0', 10) * 7 + idx * 3) % 100
                  const growth = item.grade === 'processing' ? undefined : {
                    likes:    parseFloat((((s * 11) % 41) - 15).toFixed(1)),
                    comments: parseFloat((((s * 13) % 31) - 10).toFixed(1)),
                    shares:   parseFloat((((s * 7)  % 37) - 12).toFixed(1)),
                    reach:    parseFloat((((s * 17) % 43) - 14).toFixed(1)),
                  }
                  return (
                  <ViralContentRowCard
                    key={item.id}
                    caption={item.title}
                    postedAt={item.createdAt ?? '2026-05-14'}
                    influencer={{
                      username: item.influencer.replace(/^@/, ''),
                      platform: item.platform === 'instagram' ? 'instagram' : 'youtube',
                      profileUrl: item.platform === 'instagram'
                        ? `https://instagram.com/${item.influencer.replace(/^@/, '')}`
                        : `https://youtube.com/@${item.influencer.replace(/^@/, '')}`,
                    }}
                    contentType={item.type as '릴스' | '피드'}
                    metrics={{
                      likes: item.likes,
                      comments: item.comments,
                      shares: item.shares,
                      reach: item.reach,
                    }}
                    metricsGrowth={growth}
                    grade={item.grade as 'A' | 'B' | 'C' | 'D' | 'E' | 'processing'}
                    campaignMatched={!!CAMPAIGN_MATCH_MAP[item.id]}
                    campaignName={CAMPAIGN_MATCH_MAP[item.id]?.campaignName}
                    onCampaignClick={() => {
                      const match = CAMPAIGN_MATCH_MAP[item.id]
                      if (match) navigate(`/campaigns/${match.campaignId}`)
                    }}
                    onDetailClick={() => setSelectedContent(item)}
                    scoreData={item.grade !== 'processing' ? {
                      performanceScore: item.performanceScore,
                      momentumScore: item.momentumScore,
                    } : undefined}
                    isNew={(() => {
                      // 마지막 동기화(syncedAt) 이후 게시된 콘텐츠 = New. mock으로 24시간 이내 게시물 표시.
                      if (!item.createdAt) return false
                      const ageMs = Date.now() - new Date(item.createdAt).getTime()
                      return ageMs >= 0 && ageMs < 24 * 3600 * 1000
                    })()}
                  />
                  )
                })}
              </div>
            )}
          </div>

        {/* (테이블 뷰 제거됨 — 카드 그리드만 사용) {false && (
        <div className="relative" ref={tableWrapperRef}>
          {canTableScrollLeft && <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />}
          {canTableScrollRight && <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />}
          <div className="overflow-x-auto scrollbar-none" ref={tableScrollRef}>
          <table className="w-full" ref={tableRef}>
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                {([
                  { h: '콘텐츠',     w: 'min-w-[180px]' },
                  { h: '캠페인',     w: 'min-w-[140px]' },
                  { h: '인플루언서', w: 'min-w-[120px]' },
                  { h: '플랫폼',     w: 'min-w-[80px]' },
                  { h: '유형',       w: 'min-w-[72px]' },
                  { h: '등급',       w: 'min-w-[64px]' },
                  { h: '도달',       w: 'min-w-[88px]' },
                  { h: '좋아요',     w: 'min-w-[80px]' },
                  { h: '댓글',       w: 'min-w-[72px]' },
                  { h: '저장',       w: 'min-w-[72px]' },
                  { h: '공유',       w: 'min-w-[72px]' },
                  { h: '바이럴 점수', w: 'min-w-[96px]' },
                  { h: '동작',       w: 'min-w-[88px]' },
                ] as const).map(({ h, w }) => (
                  <th key={h} scope="col" className={`text-left text-sm font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap ${w}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Image size={14} className="text-gray-400" aria-hidden="true" />
                      </div>
                      <span className="text-sm text-gray-900 whitespace-nowrap">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {CAMPAIGN_MATCH_MAP[item.id] ? (
                      <Tooltip content={`${CAMPAIGN_MATCH_MAP[item.id].uploadPeriodLabel}`}>
                        <span className="inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-brand-green-bg text-brand-green-text whitespace-nowrap">
                          <Megaphone size={12} aria-hidden="true" />
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
                        <div
                          className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-label="바이럴 점수"
                          aria-valuenow={item.viralScore}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuetext={`${item.viralScore}점 / 100점`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.viralScore}%`,
                              backgroundColor: item.viralScore >= 80 ? 'var(--color-brand-green)' : item.viralScore >= 50 ? CHART_COLORS.warn : CHART_COLORS.inactive
                            }}
                          />
                        </div>
                        <span className={`text-base font-bold ${item.viralScore >= 80 ? 'text-brand-green-text' : item.viralScore >= 50 ? 'text-amber-700' : 'text-gray-400'}`}>
                          {item.viralScore}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedContent(item)}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                    >
                      상세 분석 <ChevronRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-sm text-gray-500">조건에 맞는 콘텐츠가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        )} */}
        {/* 페이지네이션 */}
        <Pagination
          total={sortedContent.length}
          page={safePage}
          pageSize={VC_PAGE_SIZE}
          onChange={setContentPage}
        />
      </div>
      </section>
    </div>
    </>
  )
}

/* ── 멘션 구성 도넛 — hover 시 segment 강조 + 중앙 텍스트 변경 (영상 매칭) ── */
function MentionMixDonut() {
  const mix = DASHBOARD_VIRAL_MIX
  const C = 2 * Math.PI * 36  // viewBox r=36
  const reelsDash = (mix.reels.percent / 100) * C
  const feedDash = (mix.feed.percent / 100) * C

  const [hover, setHover] = useState<'reels' | 'feed' | null>(null)

  // hover 상태에 따른 중앙 텍스트
  const center = hover === 'reels'
    ? { value: mix.reels.count, label: `릴스 (${mix.reels.percent}%)` }
    : hover === 'feed'
      ? { value: mix.feed.count, label: `피드 (${mix.feed.percent}%)` }
      : { value: mix.total, label: '총 멘션' }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 mb-4" role="img" aria-label={`총 멘션 ${mix.total}건, 릴스 ${mix.reels.percent}%, 피드 ${mix.feed.percent}%`}>
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r="36" fill="none" stroke={CHART_COLORS.grid} strokeWidth="14" aria-hidden="true" />
          <circle
            cx="45" cy="45" r="36" fill="none"
            stroke="var(--color-brand-green)" strokeWidth="14"
            strokeDasharray={`${reelsDash} ${C - reelsDash}`}
            className="transition-opacity cursor-pointer"
            style={{ opacity: hover && hover !== 'reels' ? 0.35 : 1 }}
            onMouseEnter={() => setHover('reels')}
            onMouseLeave={() => setHover(null)}
            aria-label="릴스 segment"
          />
          <circle
            cx="45" cy="45" r="36" fill="none"
            stroke="var(--color-brand-fuchsia)" strokeWidth="14"
            strokeDasharray={`${feedDash} ${C - feedDash}`}
            strokeDashoffset={-reelsDash}
            className="transition-opacity cursor-pointer"
            style={{ opacity: hover && hover !== 'feed' ? 0.35 : 1 }}
            onMouseEnter={() => setHover('feed')}
            onMouseLeave={() => setHover(null)}
            aria-label="피드 segment"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-2xl font-bold tabular-nums transition-colors ${
            hover === 'reels' ? 'text-brand-green-text' : hover === 'feed' ? 'text-brand-fuchsia-text' : 'text-gray-900'
          }`}>{center.value}</span>
          <span className="text-sm text-gray-500 mt-0.5">{center.label}</span>
        </div>
      </div>
      {/* 범례 (작은 색상 chip) — dl 리스트는 사이드 MentionStatCard로 이전 (원본 매칭). 색상 표기는 유지. */}
      <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block bg-brand-green" aria-hidden="true" />
          릴스 {mix.reels.percent}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block bg-brand-fuchsia" aria-hidden="true" />
          피드 {mix.feed.percent}%
        </span>
      </div>
    </div>
  )
}

/* ── 멘션 통계 미니카드 — 원본 ViralMetricsSection L1718-1746 (count + growth)
 *  라벨 위, 값+증감률을 한 줄로 인접 배치. 카드 폭이 넓어져도 값·증감률이 분리되지 않음. */
function MentionStatCard({ label, value, growth }: { label: string; value: number; growth: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <div className="text-lg font-bold text-gray-900 tabular-nums">{fmtNumber(value)}</div>
        <span className={`text-xs font-semibold tabular-nums whitespace-nowrap ${growth >= 0 ? 'text-success-green-text' : 'text-red-600'}`}>
          {growth >= 0 ? '↗︎ +' : '↘︎ '}{Math.abs(growth).toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
