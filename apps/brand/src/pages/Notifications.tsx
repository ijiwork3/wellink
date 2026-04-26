import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, CreditCard, FileText, MessageSquare, AlertCircle } from 'lucide-react'
import { useToast, ErrorState } from '@wellink/ui'
import { useQAModeBrand as useQAMode } from '../utils/useQAModeBrand'

/** 알림 센터 — 원본 NotificationView.tsx 동등 (광고주) */

type NotificationType = 'campaign' | 'system' | 'message'
type Notification = {
  id: number
  type: NotificationType
  title: string
  desc: string
  time: string
  unread: boolean
  link: string | null
}

// 100개 더미 — 원본 5개에서 확장 (페이지네이션·엣지케이스 표현)
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
  const descPool = type === 'campaign' ? CAMPAIGN_DESCS : type === 'system' ? SYSTEM_DESCS : MESSAGE_DESCS
  return {
    id: i + 1,
    type,
    title: titlePool[i % titlePool.length],
    desc: descPool[i % descPool.length],
    time: TIME_POOL[i % TIME_POOL.length],
    unread: i < 8,  // 최근 8개만 미읽음
    link: type === 'campaign' && i % 3 === 0 ? `/campaigns/1?qa=tab-applicants` : type === 'campaign' && i % 3 === 1 ? `/campaigns/1?qa=tab-report` : null,
  }
})

const PAGE_SIZE = 15

export default function Notifications() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qa = useQAMode()
  const initialFilter: 'all' | NotificationType =
    qa === 'tab-campaign' ? 'campaign' :
    qa === 'tab-message' ? 'message' :
    qa === 'tab-system' ? 'system' : 'all'
  const [filter, setFilter] = useState<'all' | NotificationType>(initialFilter)
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState<Notification[]>(
    qa === 'empty' ? [] : INITIAL_NOTIFICATIONS
  )

  if (qa === 'loading') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg" />)}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-4 p-6 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (qa === 'error') {
    return <ErrorState message="알림을 불러올 수 없습니다" onRetry={() => window.location.reload()} />
  }

  const handleNotificationClick = (n: Notification) => {
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    showToast('모든 알림을 읽음 처리했습니다.', 'success')
  }

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter)
  const unreadCount = notifications.filter(n => n.unread).length
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-gray-700" aria-hidden="true" />
          <h1 className="text-xl @md:text-2xl font-bold text-gray-900">알림 센터</h1>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-gray-500 hover:text-gray-900 underline"
          >모두 읽음으로 표시</button>
        )}
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 필터 탭 — 원본 동등 (전체/캠페인/메시지/시스템) */}
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'all', label: '전체' },
              { id: 'campaign', label: '캠페인' },
              { id: 'message', label: '메시지' },
              { id: 'system', label: '시스템/결제' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setFilter(tab.id); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        {/* 리스트 */}
        {paginated.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="text-gray-300" size={28} />
            </div>
            <p className="text-sm text-gray-500">
              {notifications.length === 0 ? '새로운 알림이 없습니다.' : '해당 카테고리에 알림이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginated.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNotificationClick(item)}
                className={`p-4 @sm:p-5 flex items-start gap-3 transition-colors w-full text-left ${
                  item.unread ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'campaign' ? 'bg-emerald-100 text-emerald-600'
                  : item.type === 'system' ? 'bg-amber-100 text-amber-600'
                  : 'bg-purple-100 text-purple-600'
                }`}>
                  {item.type === 'campaign' ? <FileText size={16} aria-hidden="true" /> :
                   item.type === 'system' ? <CreditCard size={16} aria-hidden="true" /> :
                   <MessageSquare size={16} aria-hidden="true" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-0.5">
                    <h3 className={`text-sm ${item.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                      {item.title}
                      {item.unread && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full ml-2 align-middle"></span>}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                </div>
                {item.link && (
                  <div className="text-gray-400 shrink-0 self-center">
                    <ChevronRight size={16} aria-hidden="true" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 페이지네이션 — 신규 (원본은 전체 표시) */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 flex-wrap">
            <span className="text-xs text-gray-500">총 {filtered.length}개 · {safePage} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >이전</button>
              <span className="text-xs text-gray-600 px-2">{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >다음</button>
            </div>
          </div>
        )}
      </div>

      {/* 안내 카드 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-amber-700">
          알림은 푸시·앱 내에서 확인할 수 있으며, 읽음 처리 후에도 30일간 보관됩니다.
        </p>
      </div>
    </div>
  )
}
