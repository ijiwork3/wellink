import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, CreditCard, FileText, MessageSquare, AlertCircle } from 'lucide-react'
import {
  useToast, ErrorState, Pagination,
  Tabs, EmptyState, SkeletonRow,
  type TabItem,
} from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'

/** 알림 센터 — 원본 NotificationView.tsx 동등 (광고주) */

type NotificationType = 'campaign' | 'system' | 'message'
type FilterValue = 'all' | NotificationType
type Notification = {
  id: number
  type: NotificationType
  title: string
  desc: string
  time: string
  unread: boolean
  link: string | null
}

// ── 더미 데이터 ──────────────────────────────────────────────────
const TIME_POOL = ['방금 전', '5분 전', '30분 전', '1시간 전', '2시간 전', '4시간 전', '어제', '2일 전', '3일 전', '1주 전', '2주 전']
const CAMPAIGN_TITLES = [
  '새로운 지원자가 있습니다',
  '캠페인 리포트 생성 완료',
  '캠페인 모집 마감 임박',
  '인플루언서가 콘텐츠를 제출했습니다',
  '캠페인 발표일이 도래했습니다',
]
const SYSTEM_TITLES = [
  '포인트 충전 완료',
  '정기 점검 안내',
  '구독 결제 예정',
  '결제 실패 알림',
  '플랜 업그레이드 완료',
]
const MESSAGE_TITLES = [
  '새로운 메시지',
  '제안에 인플루언서가 답변했습니다',
  '캠페인 문의가 도착했습니다',
]
const CAMPAIGN_DESCS = [
  "'봄 요가 프로모션' 캠페인에 새로운 인플루언서가 지원했습니다.",
  "'비건 신제품 론칭' 캠페인의 최종 성과 리포트가 생성되었습니다.",
  "'여름 캠페인' 모집이 24시간 안에 마감됩니다.",
  "선정 인플루언서가 검수용 콘텐츠를 제출했습니다.",
  "오늘이 인플루언서 발표일입니다.",
]
const SYSTEM_DESCS = [
  '500,000 포인트가 성공적으로 충전되었습니다.',
  '정기 점검이 새벽 2시부터 4시까지 진행될 예정입니다.',
  '다음 결제일이 7일 남았습니다.',
  '카드 결제에 실패했습니다. 결제 수단을 확인해주세요.',
  'Scale 플랜으로 업그레이드되었습니다.',
]
const MESSAGE_DESCS = [
  "인플루언서 '@yoga_jimin'님으로부터 새로운 메시지가 도착했습니다.",
  "'@daily_hana'님이 캠페인 제안을 수락했습니다.",
  "'@beauty_sora'님이 캠페인 관련 문의를 보냈습니다.",
]
const TYPE_CYCLE: NotificationType[] = ['campaign', 'campaign', 'campaign', 'system', 'system', 'message', 'message']
const INITIAL_NOTIFICATIONS: Notification[] = Array.from({ length: 100 }, (_, i) => {
  const type = TYPE_CYCLE[i % TYPE_CYCLE.length]
  const titlePool = type === 'campaign' ? CAMPAIGN_TITLES : type === 'system' ? SYSTEM_TITLES : MESSAGE_TITLES
  const descPool  = type === 'campaign' ? CAMPAIGN_DESCS : type === 'system' ? SYSTEM_DESCS  : MESSAGE_DESCS
  return {
    id: i + 1,
    type,
    title: titlePool[i % titlePool.length],
    desc:  descPool[i % descPool.length],
    time:  TIME_POOL[i % TIME_POOL.length],
    unread: i < 8,
    link: type === 'campaign' && i % 3 === 0 ? '/campaigns/1?qa=tab-applicants'
        : type === 'campaign' && i % 3 === 1 ? '/campaigns/1?qa=tab-report'
        : null,
  }
})

const PAGE_SIZE = 15

const FILTER_LABELS: Record<FilterValue, string> = {
  all: '전체',
  campaign: '캠페인',
  message: '메시지',
  system: '시스템/결제',
}

const TYPE_AVATAR: Record<NotificationType, { bg: string; icon: React.ReactNode }> = {
  campaign: { bg: 'bg-brand-green-bg text-brand-green-text', icon: <FileText size={16} aria-hidden="true" /> },
  system:   { bg: 'bg-amber-100 text-amber-700',             icon: <CreditCard size={16} aria-hidden="true" /> },
  message:  { bg: 'bg-purple-100 text-purple-700',           icon: <MessageSquare size={16} aria-hidden="true" /> },
}

export default function Notifications() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()

  const initialFilter: FilterValue =
    qa === 'tab-campaign' ? 'campaign' :
    qa === 'tab-message'  ? 'message'  :
    qa === 'tab-system'   ? 'system'   : 'all'

  const [filter, setFilter] = useState<FilterValue>(initialFilter)
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState<Notification[]>(
    qa === 'empty' ? [] : INITIAL_NOTIFICATIONS
  )

  const filtered = useMemo(
    () => filter === 'all' ? notifications : notifications.filter(n => n.type === filter),
    [filter, notifications]
  )
  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.unread ? 1 : 0), 0),
    [notifications]
  )

  // 카테고리별 카운트 — 탭에 표시
  const filterTabs: readonly TabItem<FilterValue>[] = useMemo(() => {
    const counts: Record<FilterValue, number> = {
      all:      notifications.length,
      campaign: notifications.filter(n => n.type === 'campaign').length,
      message:  notifications.filter(n => n.type === 'message').length,
      system:   notifications.filter(n => n.type === 'system').length,
    }
    return (['all', 'campaign', 'message', 'system'] as const).map(v => ({
      value: v,
      label: FILTER_LABELS[v],
      trailing: counts[v] > 0 ? (
        <span className="ml-1 text-xs text-gray-400 font-normal">{counts[v]}</span>
      ) : undefined,
    }))
  }, [notifications])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (qa === 'loading') {
    return (
      <div className="space-y-5">
        <div className="h-8 w-32 bg-gray-100 animate-pulse rounded-xl" />
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg" />)}
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="px-5"><SkeletonRow cols={3} /></div>)}
          </div>
        </div>
      </div>
    )
  }
  if (qa === 'error') {
    return <ErrorState message="알림을 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  const handleNotificationClick = (n: Notification) => {
    if (n.unread) setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    showToast('모든 알림을 읽음 처리했습니다.', 'success')
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-gray-700" aria-hidden="true" />
          <h1 className="text-2xl @md:text-3xl font-bold tracking-tight text-gray-900 whitespace-nowrap">알림 센터</h1>
          {unreadCount > 0 && (
            <span className="bg-brand-green text-white text-sm font-bold px-2.5 py-1 rounded-full whitespace-nowrap" aria-label={`미읽음 ${unreadCount}건`}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-base text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded whitespace-nowrap"
          >모두 읽음으로 표시</button>
        )}
      </div>

      {/* 본문 */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 필터 탭 — 공통 Tabs (variant='soft') */}
        <div className="px-3 @sm:px-5 py-3 @sm:py-4 border-b border-gray-50">
          <Tabs<FilterValue>
            variant="soft"
            scrollable
            items={filterTabs}
            value={filter}
            onChange={(v) => { setFilter(v); setPage(1) }}
            ariaLabel="알림 카테고리 필터"
          />
        </div>

        {/* 리스트 */}
        {paginated.length === 0 ? (
          <EmptyState
            size="lg"
            variant={notifications.length === 0 ? 'default' : 'filter'}
            icon={<Bell size={40} />}
            title={notifications.length === 0 ? '새로운 알림이 없습니다' : '해당 카테고리에 알림이 없습니다'}
            description={notifications.length === 0
              ? '새 알림이 도착하면 이곳에 표시됩니다.'
              : '다른 카테고리를 선택해 보세요.'}
          />
        ) : (
          <ul className="divide-y divide-gray-50" role="list">
            {paginated.map(item => {
              const avatar = TYPE_AVATAR[item.type]
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 @sm:p-5 flex items-start gap-3 transition-colors w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/50 ${
                      item.unread ? 'bg-brand-green/5 hover:bg-brand-green-bg' : 'hover:bg-gray-50/50'
                    }`}
                    aria-label={`${item.unread ? '미읽음 ' : ''}${item.title} — ${item.time}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatar.bg}`} aria-hidden="true">
                      {avatar.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-0.5">
                        <h3 className={`text-base ${item.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                          {item.title}
                          {item.unread && <span className="inline-block w-1.5 h-1.5 bg-brand-green rounded-full ml-2 align-middle" aria-hidden="true" />}
                        </h3>
                        <span className="text-sm text-gray-400 whitespace-nowrap shrink-0">{item.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.desc}</p>
                    </div>
                    {item.link && (
                      <div className="text-gray-400 shrink-0 self-center" aria-hidden="true">
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* 페이지네이션 — 결과 0건일 때 미렌더 */}
        {filtered.length > PAGE_SIZE && (
          <Pagination
            total={filtered.length}
            page={safePage}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}
      </div>

      {/* 안내 카드 — 채도 v2: amber-50 → amber-100 가시성 ↑ */}
      <div className="bg-amber-100 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <AlertCircle size={14} className="text-amber-700 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-amber-800">
          알림은 푸시·앱 내에서 확인할 수 있으며, 읽음 처리 후에도 30일간 보관됩니다.
        </p>
      </div>
    </div>
  )
}
