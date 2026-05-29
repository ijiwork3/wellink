import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Megaphone, Users, Clock, Bell,
  TrendingUp, TrendingDown, ArrowRight, Search,
  BarChart3, Sparkles, Lock, AlertTriangle, X,
  User, Globe, MousePointer2, Zap, DollarSign, ListChecks, Calculator, Percent, Share2, Bookmark
} from 'lucide-react'
import { StatusBadge, ErrorState, EmptyState, SkeletonCard, Skeleton, Card, KPICard, FloatingScrollChevrons, PageHeader, DateRangePicker, type DatePeriod } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { fmtNumber, fmtDate, getDDay, getDDayBadgeStyle, PROGRESS_THRESHOLD } from '@wellink/ui'
import { useDeviceMode } from '../qa-mockup-kit'
import { usePlanAccess } from '../hooks/usePlanAccess'
import useHeaderStuck from '../hooks/useHeaderStuck'
import type { CampaignStatus } from '@wellink/ui'

/* ── 표시용 status 친절화 (Dashboard 전용) — Campaigns 페이지와 동일 정책
 *  '모집중' + D-3 이내 → '마감임박' 자동 변환 (Campaigns.tsx와 일관)
 */
const URGENT_DAYS = 3 // thresholds.ts DDAY_THRESHOLD.urgent와 동일
function deriveDisplayStatus(status: string, deadline?: string): CampaignStatus {
  // '모집중'에서 D-Day 임박 자동 변환
  if (status === '모집중' && deadline) {
    const d = getDDay(deadline)
    if (d.label === 'D-Day' || (d.label.startsWith('D-') && Number(d.label.slice(2)) <= URGENT_DAYS)) {
      return '마감임박'
    }
  }
  switch (status) {
    case '대기중': return '지원자 대기'
    case '진행중': return '콘텐츠 등록 중'
    case '선정중': return '선정 필요'
    default: return status as CampaignStatus
  }
}


/* ── 즉각 확인 배너 데이터 ── */
type UrgentItem = { id: string; text: string; cta: string; route: string }
const URGENT_ITEMS: UrgentItem[] = [
  { id: 'review', text: '콘텐츠 검수 2건이 72시간 안에 마감됩니다.', cta: '지금 검수하기', route: '/campaigns/1' },
  { id: 'deadline', text: '봄 요가 프로모션 마감이 3일 남았습니다. 추가 인플루언서 초대를 권장합니다.', cta: '캠페인 확인', route: '/campaigns/1' },
]

/* ── KPI 데이터 ── */
/* ── 기간별 비교 라벨 — 분석 페이지(DateRangePicker)와 동일 패턴 ── */
const TREND_LABEL: Record<DatePeriod, string> = {
  일간: '전날 대비',
  주간: '전주 대비',
  월간: '전월 대비',
  연간: '전년 대비',
}

/* ── dateOffset 변경 시 value·trend 변동 적용 (deterministic noise, mock) ──
 * offset === 0 → ratio 1 (현재)
 * 그 외 → ±18% 범위 내 결정적 변동 (label seed로 KPI별 다르게)
 */
function offsetRatio(offset: number, seed: number): number {
  if (offset === 0) return 1
  return 1 + Math.sin((offset * 13 + seed) * 0.4) * 0.18
}
function seedOf(label: string): number {
  return [...label].reduce((s, c) => s + c.charCodeAt(0), 0)
}

const kpis = [
  {
    title: '활성 캠페인',
    baseValue: 2,
    fmt: (n: number) => Math.max(0, Math.round(n)).toString(),
    sub: '현재 진행 중',
    trends: { 일간: 0, 주간: 50, 월간: 100, 연간: 200 } as Record<DatePeriod, number>,
    icon: <Megaphone size={16} aria-hidden="true" />,
  },
  {
    title: '진행중 인플루언서',
    baseValue: 12,
    fmt: (n: number) => Math.max(0, Math.round(n)).toString(),
    sub: '총 참여 인원',
    trends: { 일간: 0, 주간: 9, 월간: 20, 연간: 60 } as Record<DatePeriod, number>,
    icon: <Users size={16} aria-hidden="true" />,
  },
  {
    title: '검수대기',
    baseValue: 2,
    fmt: (n: number) => Math.max(0, Math.round(n)).toString(),
    sub: '콘텐츠 대기 중',
    trends: { 일간: 0, 주간: -25, 월간: -33.3, 연간: 10 } as Record<DatePeriod, number>,
    icon: <Clock size={16} aria-hidden="true" />,
  },
]

/* ── 캠페인 데이터 ── */
// A-11: applicants 필드 추가 (mock — 실제: useCampaignParticipants(id).applicantCount)
const campaigns = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중', total: 15, current: 8, deadline: '2026-04-28', applicants: 7 },
  { id: 2, name: '비건 신제품 론칭', status: '대기중', total: 10, current: 0, deadline: '2026-05-05', applicants: 3 },
]

/* ── 알림 초기 데이터 ── */
const INITIAL_NOTIFICATIONS: { id: number; text: string; time: string; dot: string; route: string; unread: boolean }[] = [
  { id: 1, text: '이창민님이 콘텐츠를 제출했습니다 — 검수가 필요합니다.', time: '5분 전', dot: 'bg-sky-400', route: '/campaigns/1', unread: true },
  { id: 2, text: '비건 신제품 론칭에 새 인플루언서가 지원했습니다.', time: '1시간 전', dot: 'bg-brand-green', route: '/campaigns/2', unread: true },
  { id: 3, text: '인플루언서 관리에 새 그룹이 추가되었습니다.', time: '3시간 전', dot: 'bg-slate-400', route: '/influencers/manage', unread: true },
  { id: 4, text: '구독이 5일 후 만료됩니다. 갱신해 주세요.', time: '어제', dot: 'bg-amber-400', route: '/subscription', unread: false },
  { id: 5, text: '박리나님과의 협의가 수락되었습니다.', time: '2일 전', dot: 'bg-slate-400', route: '/influencers/manage', unread: false },
]

/* ── 프로필 인사이트 요약 mock (원본 대시보드 섹션 1)
 * 분석 페이지와 동일 패턴 — 기간(일/주/월/연)별 trend 분기. value는 누적 현재값.
 */
const PROFILE_METRICS = [
  { label: '팔로워',   baseValue: 12400,  fmt: (n: number) => fmtNumber(Math.round(n)), trends: { 일간: 0.4, 주간: 1.8, 월간: 6.2, 연간: 22.4 } as Record<DatePeriod, number>, icon: <User size={14} aria-hidden="true" />,         hint: '계정을 팔로우하는 사용자 수. 기본 도달 가능성 지표.' },
  { label: '도달',     baseValue: 48200,  fmt: (n: number) => fmtNumber(Math.round(n)), trends: { 일간: 2.8, 주간: 7.2, 월간: 18.5, 연간: 42.1 } as Record<DatePeriod, number>, icon: <Globe size={14} aria-hidden="true" />,        hint: '콘텐츠를 한 번 이상 본 고유 사용자 수.' },
  { label: '참여율',   baseValue: 4.1,    fmt: (n: number) => `${n.toFixed(1)}%`,        trends: { 일간: 0.2, 주간: 0.5, 월간: 1.1, 연간: 2.8 } as Record<DatePeriod, number>, icon: <MousePointer2 size={14} aria-hidden="true" />, hint: '좋아요·댓글·저장·공유 등 상호작용 비율. 높을수록 콘텐츠 반응 우수.' },
  { label: '노출',     baseValue: 93500,  fmt: (n: number) => fmtNumber(Math.round(n)), trends: { 일간: 3.1, 주간: 8.5, 월간: 22.0, 연간: 58.4 } as Record<DatePeriod, number>, icon: <Zap size={14} aria-hidden="true" />,          hint: '콘텐츠가 화면에 표시된 총 횟수 (동일 사용자 중복 포함).' },
]

/* ── 광고 성과 요약 mock (원본 대시보드 섹션 2)
 * 클라 #3: ROAS는 단위가 'x'(배수). trendUnit='x'.
 * 클라 #1 (대시보드 비용형): 결과당 비용·평균 CPC는 감소가 좋음 → positive=false.
 * 분석 페이지와 동일 패턴 — 기간별 trend 분기.
 */
const AD_METRICS = [
  { label: '총 광고 지출',  baseValue: 2_850_000, fmt: (n: number) => `${Math.round(n/10000)}만원`,            trends: { 일간: 1.8, 주간: 4.2, 월간: 11.5, 연간: 32.0 } as Record<DatePeriod, number>, icon: <DollarSign size={14} aria-hidden="true" />,  hint: '선택 기간 광고 집행에 사용된 총 금액.' },
  { label: 'ROAS',         baseValue: 3.2,       fmt: (n: number) => `${n.toFixed(1)}x`,                       trends: { 일간: 0.3, 주간: 0.5, 월간: 0.8, 연간: 1.2 } as Record<DatePeriod, number>,    trendUnit: 'x', icon: <Percent size={14} aria-hidden="true" />,    hint: '광고 지출 대비 수익 효율. 높을수록 수익성 우수.' },
  { label: '총 결과',       baseValue: 94,        fmt: (n: number) => Math.max(0, Math.round(n)).toString(),    trends: { 일간: 2.4, 주간: 6.8, 월간: 18.0, 연간: 48.0 } as Record<DatePeriod, number>, icon: <ListChecks size={14} aria-hidden="true" />, hint: '광고 목표(구매·문의 등) 달성 총 횟수.' },
  { label: '결과당 비용',   baseValue: 30319,     fmt: (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`, trends: { 일간: -0.8, 주간: -2.4, 월간: -5.8, 연간: -14.0 } as Record<DatePeriod, number>, positive: false, icon: <Calculator size={14} aria-hidden="true" />, hint: '목표 1건 달성 평균 비용. 낮을수록 효율 우수.' },
  { label: '총 광고 도달',  baseValue: 184000,    fmt: (n: number) => fmtNumber(Math.round(n)),                 trends: { 일간: 2.1, 주간: 5.5, 월간: 14.0, 연간: 38.0 } as Record<DatePeriod, number>, icon: <Users size={14} aria-hidden="true" />,     hint: '광고를 한 번 이상 본 고유 사용자 수.' },
  { label: '총 광고 클릭',  baseValue: 3290,      fmt: (n: number) => Math.round(n).toLocaleString('ko-KR'),    trends: { 일간: 1.5, 주간: 4.8, 월간: 12.5, 연간: 34.0 } as Record<DatePeriod, number>, icon: <MousePointer2 size={14} aria-hidden="true" />, hint: '광고가 클릭된 총 횟수.' },
  { label: '평균 CTR',     baseValue: 1.79,      fmt: (n: number) => `${n.toFixed(2)}%`,                       trends: { 일간: 0.3, 주간: 0.6, 월간: 1.1, 연간: 2.8 } as Record<DatePeriod, number>,    icon: <Percent size={14} aria-hidden="true" />,   hint: '클릭 수 ÷ 노출 수 × 100%. 높을수록 광고 소재 효과적.' },
  { label: '평균 CPC',     baseValue: 866,       fmt: (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`, trends: { 일간: -0.4, 주간: -1.2, 월간: -3.8, 연간: -9.0 } as Record<DatePeriod, number>, positive: false, icon: <Calculator size={14} aria-hidden="true" />, hint: '클릭 1회당 평균 광고 비용. 낮을수록 효율 우수.' },
] as const

/* ── 바이럴 메트릭스 요약 mock (클라 #1: 광고주 웹앱 ViralMetricsSection 패턴 마이그레이션) ──
 * 광고주 웹앱(`/dashboard/viral-metrics`)에 이미 풍부하게 구현되어 있던 자산을 대시보드 요약 형태로 재배치.
 * 바이럴 계수는 '배수' 단위이므로 trendUnit='x'.
 */
const VIRAL_METRICS = [
  { label: '총 바이럴 도달', baseValue: 67200, fmt: (n: number) => fmtNumber(Math.round(n)),                trends: { 일간: 2.6, 주간: 6.8, 월간: 18.0, 연간: 46.0 } as Record<DatePeriod, number>, icon: <Share2 size={14} aria-hidden="true" />,   hint: '광고 외 자생적 확산 도달 — 공유·저장 기반.' },
  { label: '공유 수',         baseValue: 1240,  fmt: (n: number) => fmtNumber(Math.round(n)),                trends: { 일간: 3.2, 주간: 7.5, 월간: 19.4, 연간: 51.0 } as Record<DatePeriod, number>, icon: <Share2 size={14} aria-hidden="true" />,   hint: '콘텐츠가 공유된 총 횟수.' },
  { label: '저장 수',         baseValue: 2860,  fmt: (n: number) => fmtNumber(Math.round(n)),                trends: { 일간: 1.8, 주간: 5.2, 월간: 14.0, 연간: 36.0 } as Record<DatePeriod, number>, icon: <Bookmark size={14} aria-hidden="true" />, hint: '콘텐츠가 저장된 총 횟수.' },
  { label: '바이럴 계수',     baseValue: 1.8,   fmt: (n: number) => `${n.toFixed(1)}x`,                      trends: { 일간: 0.2, 주간: 0.3, 월간: 0.5, 연간: 0.9 } as Record<DatePeriod, number>,    trendUnit: 'x', icon: <Sparkles size={14} aria-hidden="true" />, hint: '원본 1건당 평균 추가 확산 배수.' },
] as const

export default function Dashboard() {
  const navigate = useNavigate()
  const qa = useQAMode()
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const device = useDeviceMode()
  const isPhone = device === 'phone'
  const isDesktop = device === 'desktop'
  // 기간 선택기 — 분석 페이지와 동일 패턴. mock 데이터는 trends[period]로 분기
  // 클라 #4: 대시보드는 매일 확인하는 화면 → 디폴트는 *일간(전날 대비)*
  const [period, setPeriod] = useState<DatePeriod>('일간')
  const [dateOffset, setDateOffset] = useState(0)
  // 헤더 sticky 상태 추적 — 분석 페이지와 동일 패턴 (PageHeader 화면 밖으로 빠지면 isStuck=true)
  const { headerRef, isStuck } = useHeaderStuck<HTMLDivElement>()
  const { plan, planLabel, isSubscribed } = usePlanAccess()
  // 구독 만료 알림은 구독자에게만 의미 있음 — 미구독에는 노출 금지 (정합성)
  const [notifications, setNotifications] = useState(() =>
    isSubscribed ? INITIAL_NOTIFICATIONS : INITIAL_NOTIFICATIONS.filter(n => n.id !== 4),
  )
  const isPlanLocked = qa === 'plan-locked' || plan === '' || plan === 'focus'
  // 배너 메시지: 미구독은 가입 권유, Focus는 업그레이드 권유 — 동일 잠금 상태지만 워딩 분기
  const lockedBannerMessage = !isSubscribed
    ? '미구독 상태입니다. Focus 이상 플랜에서 전체 분석이 가능합니다.'
    : `현재 ${planLabel} 플랜입니다. Scale 이상에서 전체 분석이 가능합니다.`
  const lockedBannerCta = !isSubscribed ? '플랜 가입' : '플랜 업그레이드'

  const [dismissedUrgent, setDismissedUrgent] = useState<Set<string>>(new Set())
  const visibleUrgent = URGENT_ITEMS.filter(u => !dismissedUrgent.has(u.id))

  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  // 그라디언트 오버레이용 가로 스크롤 상태 (쉐브론은 FloatingScrollChevrons에서 처리)
  const [canTableScrollLeft, setCanTableScrollLeft] = useState(false)
  const [canTableScrollRight, setCanTableScrollRight] = useState(false)

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

  /* ── QA: 에러 상태 ── */
  if (qa === 'error') {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  /* ── QA: 신규 회원 온보딩 ── */
  if (qa === 'new-user') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="안녕하세요, 웰링크에 오신 것을 환영합니다 👋"
          description="웰링크에서 첫 캠페인을 시작해 보세요."
        />
        <div className="bg-gradient-to-br from-brand-green/10 to-brand-green-hover/5 border border-brand-green-border rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-green-bg flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-brand-green" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">첫 캠페인을 만들어 보세요</h2>
          <p className="text-base text-gray-500 mb-6 max-w-md mx-auto">
            캠페인을 등록하면 AI가 브랜드에 맞는 인플루언서를 추천해 드립니다.
          </p>
          <div className="flex justify-center gap-3">
            <button type="button"
              onClick={() => navigate('/campaigns/new')}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl text-base font-semibold hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <Megaphone size={14} className="inline mr-2" aria-hidden="true" />
              첫 캠페인 만들기
            </button>
            <button type="button"
              onClick={() => navigate('/influencers/list')}
              className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              인플루언서 탐색
            </button>
          </div>
        </div>

        {/* AI 추천 미리보기 */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-green" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-900">내 브랜드에 맞는 추천 인플루언서</h2>
            </div>
            <span className="text-sm text-gray-500">상위 3명</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { username: 'yoga_lee', name: '이영안', fit: 92, tags: '필라테스·비건', followers: '5.2만' },
              { username: 'kyungman_fit', name: '박경만', fit: 88, tags: '필라테스·크로스핏', followers: '1.2만' },
              { username: 'hyun_homfit', name: '유현', fit: 84, tags: '홈트·비건', followers: '3.8만' },
            ].map(inf => (
              <div key={inf.username} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-gray-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">@{inf.username}</span>
                    <span className="text-sm text-gray-500">{inf.name}</span>
                    <span className="text-sm bg-brand-green-bg text-brand-green-text px-2 py-1 rounded-md font-medium">Fit {inf.fit}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{inf.tags} · {inf.followers}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <button type="button"
              onClick={() => navigate('/influencers/list')}
              className="w-full text-sm font-semibold text-brand-green-text hover:text-brand-green-hover transition-colors flex items-center justify-center gap-1"
            >
              전체 보기 <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 @xl:grid-cols-3 gap-4">
          {[
            { step: '01', title: '캠페인 등록', desc: '제품과 캠페인 정보를 입력하세요' },
            { step: '02', title: '인플루언서 매칭', desc: 'AI가 적합한 인플루언서를 추천합니다' },
            { step: '03', title: '성과 관리', desc: '실시간으로 캠페인 성과를 확인하세요' },
          ].map(s => (
            <div key={s.step} className="bg-white border border-gray-100 rounded-xl p-4">
              <span className="text-sm font-bold text-brand-green-text">Step {s.step}</span>
              <p className="text-base font-semibold text-gray-900 mt-1">{s.title}</p>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── QA: 로딩 스켈레톤 — 공통 Skeleton 컴포넌트 ── */
  if (qa === 'loading') {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col @sm:flex-row @sm:items-end @sm:justify-between gap-3">
          <div className="space-y-2">
            <Skeleton shape="text" width={192} height={24} />
            <Skeleton shape="text" width={128} height={14} />
          </div>
          <Skeleton shape="rect" width={112} height={36} />
        </div>
        {/* KPI 3개 */}
        <div className="grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-3 gap-3 @sm:gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} height={128} />)}
        </div>
        {/* 프로필 인사이트 + 광고 성과 */}
        <SkeletonCard height={160} />
        <SkeletonCard height={200} />
        {/* 캠페인 + 알림 */}
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4 @sm:gap-5">
          <SkeletonCard className="@md:col-span-2" height={192} />
          <SkeletonCard height={192} />
        </div>
      </div>
    )
  }

  /* ── QA: 빈 상태 (캠페인 없음) ── */
  if (qa === 'empty') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="안녕하세요, 웰링크 브랜드님"
          description="아직 진행 중인 캠페인이 없습니다."
          actions={
            <button type="button"
              onClick={() => navigate('/campaigns/new')}
              className="flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
            >
              <Megaphone size={14} aria-hidden="true" />새 캠페인
            </button>
          }
        />
        {/* 0값 KPI — Card 컴포넌트로 통일 (정상 KPI와 동일 마크업) */}
        <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3 @sm:gap-4">
          {[
            { title: '활성 캠페인', value: '0', sub: '진행 중인 캠페인 없음', icon: <Megaphone size={16} aria-hidden="true" /> },
            { title: '진행중 인플루언서', value: '0', sub: '참여 인원 없음', icon: <Users size={16} aria-hidden="true" /> },
            { title: '검수대기', value: '0', sub: '콘텐츠 대기 없음', icon: <Clock size={16} aria-hidden="true" /> },
          ].map(k => (
            <Card key={k.title} padding="md" className="shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{k.title}</span>
                <span className="text-gray-300">{k.icon}</span>
              </div>
              <div className={`${isPhone ? 'text-xl' : 'text-[28px]'} font-bold text-gray-300 leading-tight`}>{k.value}</div>
              <div className="text-sm text-gray-500 mt-1">{k.sub}</div>
            </Card>
          ))}
        </div>
        {/* 빈 캠페인 영역 — 공통 EmptyState */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            size="lg"
            icon={<Megaphone size={40} />}
            title="진행 중인 캠페인이 없습니다"
            description="새 캠페인을 등록하고 인플루언서 마케팅을 시작해 보세요."
            action={
              <button type="button"
                onClick={() => navigate('/campaigns/new')}
                className="text-base bg-brand-green text-white px-4 py-2 rounded-xl hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
              >
                새 캠페인 만들기
              </button>
            }
          />
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => n.unread).length
  const visibleNotifications = showAllNotifications ? notifications : notifications.slice(0, 4)

  const handleNotificationClick = (id: number, route: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    )
    navigate(route)
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="space-y-6">
      {/* ── QA: plan-locked 배너 ── */}
      {isPlanLocked && (
        <div className="flex items-center flex-wrap gap-2 bg-amber-100 border border-amber-200 text-amber-800 rounded-xl px-5 py-3 text-base">
          <Lock size={14} className="shrink-0" aria-hidden="true" />
          <span>{lockedBannerMessage}</span>
          <button type="button"
            onClick={() => navigate('/subscription')}
            className="ml-auto text-sm font-semibold bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
          >
            {lockedBannerCta}
          </button>
        </div>
      )}
      {/* C-1: Instagram 초기 동기화 배너 (mock — qa=syncing 또는 localStorage 'wl_syncing' 플래그)
       * 실제 구현: useDashboardInitialSync({ dashMemberId, metaAccessToken }) 훅에서 isInitialSyncing 상태 수신
       * 원본 DashboardView.tsx L204-211 참고 */}
      {(qa === 'syncing' || (typeof window !== 'undefined' && localStorage.getItem('wl_syncing') === '1')) && (
        <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-5 py-3.5 text-base text-gray-600 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse shrink-0" aria-hidden="true" />
          Instagram 연동 후 초기 데이터를 동기화하는 중입니다. 잠시만 기다려 주세요.
        </div>
      )}

      {/* ── 즉각 확인 배너 — 채도 톤 다운 (rose-100 → rose-50). 아이콘·CTA만 rose, 텍스트는 검정 ── */}
      {visibleUrgent.map(u => (
        <div
          key={u.id}
          className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-base"
        >
          <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="flex-1 text-gray-900">{u.text}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button"
              onClick={() => navigate(u.route)}
              className="text-sm font-semibold text-rose-700 hover:text-rose-900 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >
              {u.cta} →
            </button>
            <button type="button"
              onClick={() => setDismissedUrgent(prev => new Set([...prev, u.id]))}
              aria-label="닫기"
              className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* ── 인사말 + 날짜 ── sticky 감지용 ref 부착 (분석 페이지와 동일 패턴) */}
      <div ref={headerRef}>
        <PageHeader
          title="안녕하세요, 웰링크 브랜드님"
          description={dateStr}
          actions={
            <button type="button"
              onClick={() => navigate('/campaigns/new')}
              className="flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-xl text-base font-medium hover:bg-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 whitespace-nowrap"
            >
              <Megaphone size={14} aria-hidden="true" />
              새 캠페인
            </button>
          }
        />
      </div>

      {/* 기간 선택기 — 분석 페이지(/analytics/profile·/ads·/viral)와 동일 패턴.
          기본 상태: 배경 투명. sticky로 상단 붙을 때만 흰색 배경 + 백드롭 블러 + 보더 적용 */}
      <div className={`sticky z-20 -mx-4 px-4 @sm:-mx-6 @sm:px-6 @lg:-mx-8 @lg:px-8 py-2.5 transition-colors ${isStuck ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' : 'border-b border-transparent'} ${isDesktop ? 'top-0' : 'top-12'}`}>
        {/* C-2: serverSyncTime + DateRangePicker 나란히 (원본 DashboardView.tsx L197-201, PeriodFilter.tsx L27-38)
         * 실제 구현: insights 응답의 collectedAt 필드 중 최신값을 serverSyncTime으로 사용 */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <DateRangePicker
            period={period}
            dateOffset={dateOffset}
            onPeriodChange={setPeriod}
            onDateOffsetChange={setDateOffset}
            compact={!isDesktop}
          />
          {/* TODO: 실제 구현 시 → insights.collectedAt 중 최신값 사용 */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400 whitespace-nowrap">
            <Clock size={12} aria-hidden="true" />
            마지막 동기화: {new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* 클라 #2: 캠페인 운영 KPI 3개는 *데이터 섹션 아래*로 이동 — 데이터 가치(프로필·광고·바이럴) 우선 노출 */}

      {/* ── 프로필 인사이트 요약 (원본 대시보드 섹션 1) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User size={16} className="text-gray-500" aria-hidden="true" />
            프로필 인사이트
          </h2>
          <button type="button" onClick={() => navigate('/analytics/profile')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
          >더보기 <ArrowRight size={12} /></button>
        </div>
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 @sm:gap-4">
          {PROFILE_METRICS.map(m => {
            const ratio = offsetRatio(dateOffset, seedOf(m.label))
            return (
              <KPICard
                key={m.label}
                title={m.label}
                value={m.fmt(m.baseValue * ratio)}
                trend={+(m.trends[period] * ratio).toFixed(1)}
                trendLabel={TREND_LABEL[period]}
                icon={m.icon}
                tooltip={m.hint}
              />
            )
          })}
        </div>
      </section>

      {/* ── 광고 성과 요약 (원본 대시보드 섹션 2) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-500" aria-hidden="true" />
            광고 성과
          </h2>
          <button type="button" onClick={() => navigate('/analytics/ads')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
          >더보기 <ArrowRight size={12} /></button>
        </div>
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 @sm:gap-4">
          {AD_METRICS.map(m => {
            const ratio = offsetRatio(dateOffset, seedOf(m.label))
            return (
              <KPICard
                key={m.label}
                title={m.label}
                value={m.fmt(m.baseValue * ratio)}
                trend={+(m.trends[period] * ratio).toFixed(1)}
                trendLabel={TREND_LABEL[period]}
                trendUnit={'trendUnit' in m ? m.trendUnit : undefined}
                positive={'positive' in m ? m.positive : undefined}
                icon={m.icon}
                tooltip={m.hint}
              />
            )
          })}
        </div>
      </section>

      {/* ── 바이럴 메트릭스 요약 (클라 #1 신규: 광고주 웹앱 ViralMetricsSection 패턴) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles size={16} className="text-gray-500" aria-hidden="true" />
            바이럴 지표
          </h2>
          <button type="button" onClick={() => navigate('/analytics/viral')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
          >더보기 <ArrowRight size={12} /></button>
        </div>
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 @sm:gap-4">
          {VIRAL_METRICS.map(m => {
            const ratio = offsetRatio(dateOffset, seedOf(m.label))
            return (
              <KPICard
                key={m.label}
                title={m.label}
                value={m.fmt(m.baseValue * ratio)}
                trend={+(m.trends[period] * ratio).toFixed(1)}
                trendLabel={TREND_LABEL[period]}
                trendUnit={'trendUnit' in m ? m.trendUnit : undefined}
                icon={m.icon}
                tooltip={m.hint}
              />
            )
          })}
        </div>
      </section>

      {/* ── 캠페인 운영 KPI (3개) — 데이터 섹션 아래 배치 (클라 #2). 기간·dateOffset별 분기 ── */}
      <div className="grid grid-cols-1 @sm:grid-cols-3 gap-3 @sm:gap-4">
        {kpis.map(kpi => {
          const ratio = offsetRatio(dateOffset, seedOf(kpi.title))
          const displayValue = kpi.fmt(kpi.baseValue * ratio)
          const trendValue = +(kpi.trends[period] * ratio).toFixed(1)
          const isPositive = trendValue >= 0
          return (
            <Card
              key={kpi.title}
              padding="md"
              interactive
              className="flex flex-col gap-3 shadow-sm cursor-default"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-500 font-medium min-w-0 break-keep">{kpi.title}</span>
                <span className="text-gray-400 shrink-0">{kpi.icon}</span>
              </div>
              <div>
                <div className={`${isPhone ? 'text-xl' : 'text-[28px]'} font-bold text-gray-900 leading-tight`}>{displayValue}</div>
                <div className="text-sm text-gray-500 mt-1">{kpi.sub}</div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-brand-green-text' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
                <span>{isPositive ? '+' : ''}{trendValue}%</span>
                <span className="text-gray-500 font-normal">{TREND_LABEL[period]}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── 활성 캠페인 현황 + 최근 알림 ── */}
      <div className="grid grid-cols-1 @xl:grid-cols-3 gap-4 @sm:gap-5">
        {/* 활성 캠페인 현황 */}
        <div className="@xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">활성 캠페인 현황</h2>
            <button type="button"
              onClick={() => navigate('/campaigns')}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >
              전체보기 <ArrowRight size={12} />
            </button>
          </div>

          {/* fixed 플로팅 스크롤 쉐브론 — 사이드바 회피 + 40px 터치 타깃 */}
          <FloatingScrollChevrons scrollRef={tableScrollRef} contentRef={tableRef} />

          <div className="relative" ref={tableWrapperRef}>
            {/* 그라데이션 페이드 오버레이 */}
            {canTableScrollLeft && (
              <div className="absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-white/95 to-transparent pointer-events-none z-10" />
            )}
            {canTableScrollRight && (
              <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-white/95 to-transparent pointer-events-none z-10" />
            )}
            <div className="overflow-x-auto scrollbar-none" ref={tableScrollRef}>
              <table className="w-full" ref={tableRef}>
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    {['캠페인명', '상태', '지원자', '진행률', '마감일'].map(h => (
                      <th key={h} scope="col" className="text-left text-sm font-medium text-gray-500 py-2.5 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => {
                    const pct = c.total > 0 ? Math.round((c.current / c.total) * 100) : 0
                    const { label: ddayLabel, pulse: ddayPulse, color: ddayTextColor } = getDDay(c.deadline)
                    const ddayBadgeStyle = getDDayBadgeStyle(ddayTextColor, ddayPulse)
                    return (
                      <tr
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/50"
                        onClick={() => navigate(`/campaigns/${c.id}`)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/campaigns/${c.id}`) } }}
                      >
                        <td className="py-3.5 px-4 text-base font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={deriveDisplayStatus(c.status, c.deadline)} />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-sm text-gray-700">
                            <Users size={13} className="text-gray-400" aria-hidden="true" />
                            {c.applicants}명
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${pct >= PROGRESS_THRESHOLD.warning ? 'bg-red-500' : 'bg-brand-green'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-gray-600">{fmtDate(c.deadline)}</span>
                            <span className={`text-sm ${ddayBadgeStyle}`}>
                              {ddayLabel}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 최근 알림 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gray-500" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-900">최근 알림</h2>
              {unreadCount > 0 && (
                <span
                  className="text-sm font-bold text-white px-2 py-1 rounded-full leading-none bg-brand-green"
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <button type="button"
              onClick={() => navigate('/notifications')}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
            >전체 보기 →</button>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {visibleNotifications.map(n => (
              <button type="button"
                key={n.id}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors duration-150 ${n.unread ? 'bg-brand-green-bg' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/50`}
                onClick={() => handleNotificationClick(n.id, n.route)}
              >
                <div className="flex gap-2.5 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${n.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {n.text}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{n.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {notifications.length > 4 && (
            <div className="px-5 py-3 border-t border-gray-50">
              <button type="button"
                onClick={() => setShowAllNotifications(prev => !prev)}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150 flex items-center gap-1 w-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded"
              >
                {showAllNotifications ? '접기' : '더보기'} <ArrowRight size={12} className={showAllNotifications ? 'rotate-90' : ''} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 빠른 실행 ── */}
      <div className={isPlanLocked ? 'relative' : ''}>
        {isPlanLocked && (
          <div className="absolute inset-0 z-10 rounded-xl backdrop-blur-md flex flex-col items-center justify-center gap-3 p-8">
            <Lock size={28} className="text-amber-400" aria-hidden="true" />
            <p className="text-base font-semibold text-gray-700 text-center">Scale 플랜 이상에서 확인 가능합니다</p>
            <button type="button" onClick={() => navigate('/subscription')} className="mt-1 text-sm font-semibold text-brand-green-text hover:text-brand-green-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded">플랜 업그레이드 →</button>
          </div>
        )}
        <h2 className="text-base font-semibold text-gray-900 mb-3">빠른 실행</h2>
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
          {[
            { icon: <Megaphone size={18} aria-hidden="true" />, label: '새 캠페인',      sub: '캠페인 만들기',    route: '/campaigns/new',     primary: true },
            { icon: <Users size={18} aria-hidden="true" />,     label: '인플루언서 탐색', sub: '전체 리스트 보기', route: '/influencers/list',  primary: false },
            { icon: <Search size={18} aria-hidden="true" />,    label: '인플루언서 관리', sub: '그룹·북마크 관리', route: '/influencers/manage', primary: false },
            { icon: <BarChart3 size={18} aria-hidden="true" />,  label: '성과 분석',      sub: '리포트 확인',     route: '/analytics/profile', primary: false },
          ].map(item => (
            <button type="button"
              key={item.label}
              onClick={() => navigate(item.route)}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 text-left hover:shadow-md hover:border-gray-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${item.primary ? 'bg-brand-green-bg' : 'bg-gray-100'}`}>
                <span className={item.primary ? 'text-brand-green' : 'text-gray-500'}>{item.icon}</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
