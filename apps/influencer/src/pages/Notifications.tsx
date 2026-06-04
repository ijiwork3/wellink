import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, Megaphone, FileText, MessageSquare, Wallet, Settings, X } from 'lucide-react'
import {
  useToast, ErrorState, Pagination,
  Tabs, EmptyState, SkeletonRow, PageHeader, Toggle,
  type TabItem,
} from '@wellink/ui'
import { useQAMode } from '@wellink/ui'
import Layout from '../components/Layout'
import {
  getNotifications, isUnread, markAsRead, markAllAsRead, deleteNotification, useReadIds,
  type NotificationItem, type NotificationType,
} from '../services/notifications'

type FilterValue = 'all' | NotificationType

const PAGE_SIZE = 15

const FILTER_LABELS: Record<FilterValue, string> = {
  all:        '전체',
  campaign:   '캠페인',
  content:    '콘텐츠',
  message:    '메시지',
  settlement: '정산',
  system:     '시스템',
}

const TYPE_AVATAR: Record<NotificationType, { bg: string; icon: React.ReactNode }> = {
  campaign:   { bg: 'bg-brand-green-bg text-brand-green-text', icon: <Megaphone size={16} aria-hidden="true" /> },
  content:    { bg: 'bg-blue-100 text-blue-700',               icon: <FileText size={16} aria-hidden="true" /> },
  message:    { bg: 'bg-purple-100 text-purple-700',           icon: <MessageSquare size={16} aria-hidden="true" /> },
  settlement: { bg: 'bg-amber-100 text-amber-700',             icon: <Wallet size={16} aria-hidden="true" /> },
  system:     { bg: 'bg-gray-100 text-gray-500',               icon: <Settings size={16} aria-hidden="true" /> },
}

export default function Notifications() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()

  const initialFilter: FilterValue =
    qa === 'tab-campaign'   ? 'campaign'   :
    qa === 'tab-content'    ? 'content'    :
    qa === 'tab-message'    ? 'message'    :
    qa === 'tab-settlement' ? 'settlement' :
    qa === 'tab-system'     ? 'system'     : 'all'

  const readIds = useReadIds()
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  const notifications: NotificationItem[] = useMemo(
    () => (qa === 'empty' ? [] : getNotifications()).filter(n => !deletedIds.has(n.id)),
    [qa, deletedIds]
  )

  const [filter, setFilter] = useState<FilterValue>(initialFilter)
  const [page, setPage] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(qa === 'unread-only')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? notifications : notifications.filter(n => n.type === filter)
    if (unreadOnly) list = list.filter(n => isUnread(n.id, readIds))
    return list
  }, [filter, notifications, unreadOnly, readIds])

  const unreadCount = useMemo(
    () => notifications.filter(n => isUnread(n.id, readIds)).length,
    [notifications, readIds]
  )

  // 카테고리별 카운트
  const filterTabs: readonly TabItem<FilterValue>[] = useMemo(() => {
    const allTypes: FilterValue[] = ['all', 'campaign', 'content', 'message', 'settlement', 'system']
    return allTypes.map(v => {
      const count = v === 'all'
        ? notifications.length
        : notifications.filter(n => n.type === v).length
      return {
        value: v,
        label: FILTER_LABELS[v],
        trailing: count > 0 ? (
          <span className="ml-1 text-[15px] text-gray-500 font-normal whitespace-nowrap">{count}</span>
        ) : undefined,
      }
    })
  }, [notifications])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (qa === 'loading') {
    return (
      <Layout>
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
      </Layout>
    )
  }

  if (qa === 'error') {
    return (
      <Layout>
        <ErrorState message="알림을 불러올 수 없어요" onRetry={() => window.location.reload()} />
      </Layout>
    )
  }

  const handleNotificationClick = (n: NotificationItem) => {
    if (isUnread(n.id, readIds)) markAsRead(n.id)
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = () => {
    markAllAsRead(notifications.map(n => n.id))
    showToast('모든 알림을 읽음 처리했습니다.', 'success')
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    deleteNotification(id)
    setDeletedIds(prev => new Set(prev).add(id))
    showToast('알림을 삭제했습니다.', 'success')
  }

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="sr-only">알림</h1>

        {/* 헤더 */}
        <PageHeader
          title="알림"
          meta={unreadCount > 0 ? (
            <span
              className="bg-brand-green text-white text-[15px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
              aria-label={`미읽음 ${unreadCount}건`}
            >
              {unreadCount}
            </span>
          ) : undefined}
          actions={unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded whitespace-nowrap"
            >
              전체 읽음
            </button>
          ) : undefined}
        />

        {/* 본문 카드 */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 필터 탭 + 읽지않음 토글 */}
          <div className="px-3 @sm:px-5 py-3 @sm:py-4 border-b border-gray-50 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <Tabs<FilterValue>
                variant="soft"
                scrollable
                items={filterTabs}
                value={filter}
                onChange={(v) => { setFilter(v); setPage(1) }}
                ariaLabel="알림 카테고리 필터"
              />
            </div>
            <label className="flex items-center gap-2 shrink-0 cursor-pointer text-[15px]">
              <span className="text-gray-700 whitespace-nowrap">읽지 않음만</span>
              <Toggle
                checked={unreadOnly}
                onChange={() => { setUnreadOnly(prev => !prev); setPage(1) }}
                label="읽지 않은 알림만 보기"
              />
            </label>
          </div>

          {/* 리스트 */}
          {paginated.length === 0 ? (
            <EmptyState
              size="lg"
              variant={unreadOnly || filter !== 'all' || notifications.length > 0 ? 'filter' : 'default'}
              icon={<Bell size={40} aria-hidden="true" />}
              title={
                notifications.length === 0
                  ? '새로운 알림이 없어요'
                  : unreadOnly
                    ? '읽지 않은 알림이 없어요'
                    : '해당 카테고리에 알림이 없어요'
              }
              description={
                notifications.length === 0
                  ? '새 알림이 도착하면 이곳에 표시됩니다.'
                  : unreadOnly
                    ? '읽지 않음만 보기를 끄거나 다른 카테고리를 선택해 보세요.'
                    : '다른 카테고리를 선택해 보세요.'
              }
            />
          ) : (
            <ul className="divide-y divide-gray-50" role="list">
              {paginated.map(item => {
                const avatar = TYPE_AVATAR[item.type]
                const unread = isUnread(item.id, readIds)
                return (
                  <li key={item.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(item)}
                      className={`p-4 @sm:p-5 flex items-start gap-3 transition-colors w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green/50 pr-10 ${
                        unread ? 'bg-brand-green-bg/30 hover:bg-brand-green-bg/50' : 'hover:bg-gray-50/50'
                      }`}
                      aria-label={`${unread ? '미읽음 ' : ''}${item.title} — ${item.time}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatar.bg}`}
                        aria-hidden="true"
                      >
                        {avatar.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-[15px] mb-0.5 ${unread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                          {item.title}
                          {unread && (
                            <span
                              className="inline-block w-1.5 h-1.5 bg-brand-green rounded-full ml-2 align-middle"
                              aria-hidden="true"
                            />
                          )}
                          <span className="ml-2 text-xs font-normal text-gray-500 whitespace-nowrap">· {item.time}</span>
                        </h3>
                        <p className="text-[15px] text-gray-500 line-clamp-2">{item.desc}</p>
                      </div>
                      {item.link && (
                        <div className="text-gray-400 shrink-0 self-center mr-1" aria-hidden="true">
                          <ChevronRight size={16} />
                        </div>
                      )}
                    </button>
                    {/* 개별 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500 hover:bg-gray-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50"
                      aria-label="알림 삭제"
                    >
                      <X size={14} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {/* 페이지네이션 */}
          {filtered.length > PAGE_SIZE && (
            <Pagination
              total={filtered.length}
              page={safePage}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
