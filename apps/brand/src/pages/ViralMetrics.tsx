import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, Info, Award, Megaphone, Zap, Share2, Bookmark, Eye } from 'lucide-react'
import { KPICard, ErrorState, EmptyState, useToast, DateRangePicker, Tooltip, Pagination, fmtNumber, getDateLabel, CHART_COLORS, CONTENT_TYPE_STYLE, CustomSelect, PlatformBadge, SkeletonCard, FloatingScrollChevrons, PageHeader, type DatePeriod } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { useInstagramConnected } from '../utils/useInstagramState'
import InstagramConnectPrompt from '../components/InstagramConnectPrompt'
import useHeaderStuck from '../hooks/useHeaderStuck'
import useTableScroll from '../hooks/useTableScroll'
import { useDeviceMode } from '../qa-mockup-kit'
import {
  kpiByMode,
  viralContentData,
  CAMPAIGN_MATCH_MAP,
  type ViralContent,
} from '../data/analytics/viral'
import BetaBadge from '../components/analytics/viral/BetaBadge'
import GradePill from '../components/analytics/viral/GradePill'
import GradeDonut from '../components/analytics/viral/GradeDonut'
import ContentDetailModal from '../components/analytics/viral/ContentDetailModal'

export default function ViralMetrics() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const qa = useQAMode()
  const isInstagramConnected = useInstagramConnected()
  const isDesktop = useDeviceMode() === 'desktop'
  const [period, setPeriod] = useState<DatePeriod>('월간')
  const [dateOffset, setDateOffset] = useState(0)
  // 콘텐츠 필터·정렬·페이지네이션·등급 필터 (원본 보강)
  type ContentSort = 'createdAt' | 'views' | 'likes' | 'comments' | 'engagement'
  type ContentFilter = '전체' | '릴스' | '피드' | '스토리' | '영상' | '쇼츠'
  type GradeFilterT = '전체' | 'processing' | 'A' | 'B' | 'C' | 'D' | 'E'
  const [contentSort, setContentSort] = useState<ContentSort>('createdAt')
  const [contentFilter, setContentFilter] = useState<ContentFilter>('전체')
  const [gradeFilter, setGradeFilter] = useState<GradeFilterT>('전체')
  const [contentPage, setContentPage] = useState(1)
  const [selectedContent, setSelectedContent] = useState<ViralContent | null>(null)
  const VC_PAGE_SIZE = 10

  // 테이블 가로 스크롤 — 공통 훅(useTableScroll)으로 추출 (쉐브론은 FloatingScrollChevrons에서 처리)
  const { scrollRef: tableScrollRef, canScrollLeft: canTableScrollLeft, canScrollRight: canTableScrollRight } = useTableScroll<HTMLDivElement>()
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  // 기간/날짜 변경 시 페이지 1 리셋 — 외부 prop sync (정책 §외부동기화)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContentPage(1)
  }, [period, dateOffset])

  // 헤더 sticky 상태 추적 — 공통 훅(useHeaderStuck)으로 추출
  const { headerRef, isStuck } = useHeaderStuck<HTMLDivElement>()

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
        <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
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

  const rawKpi = kpiByMode[period]
  const kpi = isZero
    ? { reach: '--', shares: '--', saves: '--', viral: '--' }
    : { reach: fmtNumber(rawKpi.reach), shares: fmtNumber(rawKpi.shares), saves: fmtNumber(rawKpi.saves), viral: `${rawKpi.viral}x` }


  const trendPct: Record<DatePeriod, { reach: string; shares: string; saves: string; viral: string }> = {
    일간: { reach: '+3.2%',  shares: '+5.1%',  saves: '+4.8%',  viral: '+1.2%' },
    주간: { reach: '+8.4%',  shares: '+12.3%', saves: '+9.7%',  viral: '+3.8%' },
    월간: { reach: '+15.3%', shares: '+22.1%', saves: '+18.7%', viral: '+8.4%' },
    연간: { reach: '+42.1%', shares: '+58.3%', saves: '+51.2%', viral: '+24.6%' },
  }

  // 페이지네이션 적용
  const totalPages = Math.max(1, Math.ceil(sortedContent.length / VC_PAGE_SIZE))
  const safePage = Math.min(contentPage, totalPages)
  const paginated = sortedContent.slice((safePage - 1) * VC_PAGE_SIZE, safePage * VC_PAGE_SIZE)

  return (
    <>
    <ContentDetailModal content={selectedContent} onClose={() => setSelectedContent(null)} />
    <div className="space-y-6">
      {/* 헤더 — 공통 PageHeader (sticky 감지용 ref는 래퍼 div에 부착) */}
      <div ref={headerRef}>
        <PageHeader title="바이럴 지표" meta={<BetaBadge />} />
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

      {/* KPI 카드 4개 — @wellink/ui KPICard 사용 */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        <KPICard
          title="총 바이럴 도달"
          value={kpi.reach}
          sub="고유 사용자"
          trend={isZero ? 0 : parseFloat(trendPct[period].reach)}
          trendLabel="전기간 대비"
          icon={<Eye size={16} aria-hidden="true" />}
          tooltip="바이럴 콘텐츠가 도달한 고유 사용자 수 합산"
        />
        <KPICard
          title="공유 수"
          value={kpi.shares}
          sub="콘텐츠 공유"
          trend={isZero ? 0 : parseFloat(trendPct[period].shares)}
          trendLabel="전기간 대비"
          icon={<Share2 size={16} aria-hidden="true" />}
          tooltip="콘텐츠가 다른 사용자에게 공유된 횟수"
        />
        <KPICard
          title="저장 수"
          value={kpi.saves}
          sub="지속 관심도"
          trend={isZero ? 0 : parseFloat(trendPct[period].saves)}
          trendLabel="전기간 대비"
          icon={<Bookmark size={16} aria-hidden="true" />}
          tooltip="사용자가 콘텐츠를 저장한 횟수 — 지속 관심도 지표"
        />
        <KPICard
          title="바이럴 계수"
          value={kpi.viral}
          sub="확산 지수"
          trend={isZero ? 0 : parseFloat(trendPct[period].viral)}
          trendLabel="전기간 대비"
          icon={<Zap size={16} aria-hidden="true" />}
          valueColor="text-brand-green-text"
          tooltip="공유·저장 기반으로 산출한 바이럴 확산 지수 (x배) — 높을수록 자생적 확산"
        />
      </div>

      {/* 릴스 평균 조회수 + 등급 분포 — 원본 ViralMetricsSection 보강 */}
      <div className="grid grid-cols-1 @5xl:grid-cols-2 gap-4">
        {/* 릴스 평균 조회수 카드 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">릴스 평균 조회수</span>
            <Eye size={14} className="text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(() => {
              const reels = viralContentData.filter(c => c.type === '릴스' && c.reach > 0)
              return reels.length > 0 ? fmtNumber(Math.floor(reels.reduce((s, c) => s + c.reach, 0) / reels.length)) : '—'
            })()}
          </p>
          <p className="text-sm text-gray-500 mt-1">릴스 콘텐츠 {viralContentData.filter(c => c.type === '릴스').length}건 평균</p>
        </div>
        {/* 등급 분포 도넛 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative">
          <div className="flex items-center gap-1.5 mb-3">
            <Award size={14} className="text-gray-400" aria-hidden="true" />
            <h2 className="text-base font-semibold text-gray-900">콘텐츠 등급 분포</h2>
            <Tooltip content="원본 ContentScoreItem 등급(A~E)에 따라 콘텐츠를 분류합니다." multiline><Info size={12} className="text-gray-400" aria-hidden="true" /></Tooltip>
          </div>
          <GradeDonut data={viralContentData} />
        </div>
      </div>

      {/* fixed 플로팅 스크롤 쉐브론 — 사이드바 회피 + 40px 터치 타깃 */}
      <FloatingScrollChevrons scrollRef={tableScrollRef} contentRef={tableRef} />

      {/* 콘텐츠별 바이럴 성과 테이블 (필터·정렬·페이지네이션 보강) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">콘텐츠별 바이럴 성과</h2>
            <p className="text-sm text-gray-500 mt-0.5">총 {sortedContent.length}건 · {getDateLabel(period, dateOffset)}</p>
          </div>
          <button type="button"
            onClick={() => showToast('CSV 파일 다운로드를 시작합니다.', 'success')}
            className="text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            CSV 내보내기
          </button>
        </div>
        {/* 필터·정렬 컨트롤 — 원본 SortKey/ContentFilter/GradeFilter 보강 */}
        <div className="px-5 py-3 border-b border-gray-50 grid grid-cols-2 @md:grid-cols-3 gap-2 @sm:gap-3">
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
                ] as const).map(({ h, w }) => (
                  <th key={h} scope="col" className={`text-left text-sm font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap ${w}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-inset"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedContent(item)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedContent(item) } }}
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
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-sm text-gray-500">조건에 맞는 콘텐츠가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        {/* 페이지네이션 */}
        <Pagination
          total={sortedContent.length}
          page={safePage}
          pageSize={VC_PAGE_SIZE}
          onChange={setContentPage}
        />
      </div>
    </div>
    </>
  )
}
