import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, CreditCard, FileText, MessageSquare, AlertCircle } from 'lucide-react'
import {
  useToast, ErrorState, Pagination,
  Tabs, EmptyState, SkeletonRow,
  type TabItem,
} from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'
import { usePlanAccess } from '../hooks/usePlanAccess'
import {
  getVisibleNotifications, isUnread, markAsRead, markAllAsRead, useReadIds,
  type NotificationItem, type NotificationType,
} from '../services/notifications'

/** 알림 센터 — 원본 NotificationView.tsx 동등 (광고주) */

type FilterValue = 'all' | NotificationType

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

  const { isSubscribed } = usePlanAccess()

  // 알림 데이터·읽음 상태는 글로벌 store에서 (Sidebar dot과 동기화)
  const readIds = useReadIds()
  const notifications: NotificationItem[] = useMemo(
    () => qa === 'empty' ? [] : getVisibleNotifications(isSubscribed),
    [qa, isSubscribed]
  )

  const [filter, setFilter] = useState<FilterValue>(initialFilter)
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => filter === 'all' ? notifications : notifications.filter(n => n.type === filter),
    [filter, notifications]
  )
  const unreadCount = useMemo(
    () => notifications.filter(n => isUnread(n.id, readIds)).length,
    [notifications, readIds]
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
        <span className="ml-1 text-xs text-gray-500 font-normal whitespace-nowrap">{counts[v]}</span>
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

  const handleNotificationClick = (n: NotificationItem) => {
    if (isUnread(n.id, readIds)) markAsRead(n.id)
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = () => {
    markAllAsRead(notifications.map(n => n.id))
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
          <button type="button"
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
            icon={<Bell size={40} aria-hidden="true" />}
            title={notifications.length === 0 ? '새로운 알림이 없습니다' : '해당 카테고리에 알림이 없습니다'}
            description={notifications.length === 0
              ? '새 알림이 도착하면 이곳에 표시됩니다.'
              : '다른 카테고리를 선택해 보세요.'}
          />
        ) : (
          <ul className="divide-y divide-gray-50" role="list">
            {paginated.map(item => {
              const avatar = TYPE_AVATAR[item.type]
              const unread = isUnread(item.id, readIds)
              return (
                <li key={item.id}>
                  <button type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 @sm:p-5 flex items-start gap-3 transition-colors w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/50 ${
                      unread ? 'bg-brand-green-bg hover:bg-brand-green-border/40' : 'hover:bg-gray-50/50'
                    }`}
                    aria-label={`${unread ? '미읽음 ' : ''}${item.title} — ${item.time}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatar.bg}`} aria-hidden="true">
                      {avatar.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* 제목 + 시간 inline (메일 인박스 스타일) — 시간을 좌측 영역으로 이동 */}
                      <h3 className={`text-base mb-0.5 ${unread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {item.title}
                        {unread && <span className="inline-block w-1.5 h-1.5 bg-brand-green rounded-full ml-2 align-middle" aria-hidden="true" />}
                        <span className="ml-2 text-sm font-normal text-gray-500 whitespace-nowrap">· {item.time}</span>
                      </h3>
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
