/**
 * 알림 mock + 읽음 상태 store
 * - 알림 페이지·Sidebar dot 등 여러 컴포넌트에서 공유
 * - 읽음 ID는 localStorage에 저장, 'wl-notif-changed' 커스텀 이벤트로 sync
 * - BE 연동 시 이 모듈만 교체하면 됨
 */

import { useEffect, useSyncExternalStore } from 'react'

export type NotificationType = 'campaign' | 'payment' | 'message' | 'system'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  desc: string
  time: string
  link: string | null
}

// ── 더미 데이터 ──────────────────────────────────────────────────
const TIME_POOL = ['방금 전', '5분 전', '30분 전', '1시간 전', '2시간 전', '4시간 전', '어제', '2일 전', '3일 전', '1주 전', '2주 전']
// ── 클라이언트 스펙 기준 데이터 풀 ──────────────────────────────
const CAMPAIGN_TITLES = [
  '캠페인이 삭제됐습니다',
  '캠페인 모집이 마감됐습니다',
  '인플루언서 선정 마감 3일 전입니다',
]
const CAMPAIGN_DESCS = [
  "'여름 맞이 챌린지' 캠페인이 삭제됐습니다.",
  "'봄 요가 프로모션' 캠페인 모집이 마감됐습니다.",
  "'비건 신제품 론칭' 캠페인의 인플루언서 선정 마감이 3일 남았습니다. 지금 선정하세요.",
]
const PAYMENT_TITLES = [
  '결제가 완료됐습니다',
  '결제 예정 3일 전',
  '결제에 실패했습니다',
]
const PAYMENT_DESCS = [
  'Pro 플랜 구독료 결제가 정상 완료됐습니다.',
  '다음 구독 결제일이 3일 후입니다. 결제 수단을 미리 확인해 주세요.',
  '카드 결제에 실패했습니다. 결제 수단을 확인해 주세요.',
]
const SYSTEM_TITLES = [
  '서비스 공지',
  '정기 점검 안내',
  '약관 변경 안내',
  '서비스 이용 관련 안내',
]
const SYSTEM_DESCS = [
  '웰링크 AI 매칭 기능이 업데이트됐습니다. 더욱 정교한 인플루언서 추천 결과를 경험해 보세요.',
  '정기 점검이 새벽 2시부터 4시까지 진행될 예정입니다.',
  '서비스 이용 약관이 2026년 7월 1일부로 변경됩니다. 변경 내용을 확인해 주세요.',
  '웰링크 서비스 이용 정책이 업데이트됐습니다. 확인해 주세요.',
]
const MESSAGE_TITLES = [
  '인플루언서가 제안 캠페인에 지원했습니다',
]
const MESSAGE_DESCS = [
  "@yoga_jimin 님이 제안받은 '봄 요가 프로모션' 캠페인에 지원했습니다.",
  "@daily_hana 님이 제안받은 '여름 캠페인'에 지원했습니다.",
  "@beauty_sora 님이 제안받은 '비건 신제품 론칭' 캠페인에 지원했습니다.",
]
const TYPE_CYCLE: NotificationType[] = ['campaign', 'campaign', 'campaign', 'payment', 'system', 'message', 'message']

export const ALL_NOTIFICATIONS: NotificationItem[] = Array.from({ length: 100 }, (_, i) => {
  const type = TYPE_CYCLE[i % TYPE_CYCLE.length]
  const titlePool =
    type === 'campaign' ? CAMPAIGN_TITLES :
    type === 'payment'  ? PAYMENT_TITLES  :
    type === 'system'   ? SYSTEM_TITLES   : MESSAGE_TITLES
  const descPool =
    type === 'campaign' ? CAMPAIGN_DESCS :
    type === 'payment'  ? PAYMENT_DESCS  :
    type === 'system'   ? SYSTEM_DESCS   : MESSAGE_DESCS
  const title = titlePool[i % titlePool.length]
  const desc = descPool[i % descPool.length]
  // 타이틀별 딥링크 라우팅 (스펙: 캠페인→캠페인 상세, 메시지→캠페인 상세, 결제→결제/구독, 시스템→null)
  const link =
    title === '결제에 실패했습니다' ? '/payment/method'
    : title === '결제가 완료됐습니다' || title === '결제 예정 3일 전' ? '/subscription'
    : title === '인플루언서 선정 마감 3일 전입니다' ? '/campaigns/1?qa=tab-applicants'
    : type === 'campaign' ? '/campaigns/1'
    : type === 'message'  ? '/campaigns/1?qa=tab-applicants'
    : null
  return { id: i + 1, type, title, desc, time: TIME_POOL[i % TIME_POOL.length], link }
})

// 처음 8건은 unread (id 1~8)
const INITIAL_UNREAD_IDS = ALL_NOTIFICATIONS.slice(0, 8).map(n => n.id)

// ── 동적 알림 (런타임 push) ─────────────────────────────────────
// 캠페인 선정/취소/반려 등의 액션 시 발송된 알림을 광고주 알림센터에 audit log 형태로 노출.
// id 10000+ 영역 사용 → INITIAL_UNREAD_IDS(1~8) 충돌 방지. 페이지 리프레시 시 휘발 (mock).
const DYNAMIC_ID_START = 10000
let dynamicCounter = DYNAMIC_ID_START
const dynamicNotifications: NotificationItem[] = []

export function pushNotification(item: Omit<NotificationItem, 'id' | 'time'>): number {
  const id = ++dynamicCounter
  const newItem: NotificationItem = { ...item, id, time: '방금 전' }
  dynamicNotifications.unshift(newItem)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }
  return id
}

// ── localStorage store ──────────────────────────────────────────
const STORAGE_KEY = 'wl_brand_notif_read'
const CHANGE_EVENT = 'wl-notif-changed'

function loadReadIds(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<number>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch { /* ignore quota error */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function markAsRead(id: number) {
  const ids = loadReadIds()
  ids.add(id)
  saveReadIds(ids)
}

export function markAllAsRead(allIds: number[] = INITIAL_UNREAD_IDS) {
  const ids = loadReadIds()
  allIds.forEach(id => ids.add(id))
  saveReadIds(ids)
}

/** 미구독자는 결제·플랜 관련 payment·system 알림 제외 (정합성). 동적 알림은 항상 최상단. */
export function getVisibleNotifications(isSubscribed: boolean): NotificationItem[] {
  const base = isSubscribed ? ALL_NOTIFICATIONS : ALL_NOTIFICATIONS.filter(n => n.type !== 'payment' && n.type !== 'system')
  return [...dynamicNotifications, ...base]
}

export function isUnread(id: number, readIds: Set<number>): boolean {
  // 동적 알림 (id ≥ 10000): 명시적으로 읽음 처리되지 않는 한 unread
  if (id >= DYNAMIC_ID_START) return !readIds.has(id)
  // 초기 unread (id 1~8) 중 읽지 않은 것
  return INITIAL_UNREAD_IDS.includes(id) && !readIds.has(id)
}

// ── React hook ─────────────────────────────────────────────────
function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function getReadIdsSnapshot(): string {
  // useSyncExternalStore는 안정적인 snapshot 필요 — 직렬화로 대체
  if (typeof window === 'undefined') return '[]'
  return localStorage.getItem(STORAGE_KEY) ?? '[]'
}

function getServerSnapshot(): string {
  return '[]'
}

/** 읽지 않은 알림 갯수를 구독하는 hook (Sidebar dot 등) */
export function useUnreadCount(isSubscribed = true): number {
  const snapshot = useSyncExternalStore(subscribe, getReadIdsSnapshot, getServerSnapshot)
  const readIds = new Set<number>(JSON.parse(snapshot) as number[])
  const visible = getVisibleNotifications(isSubscribed)
  return visible.filter(n => isUnread(n.id, readIds)).length
}

/** 읽음 ID Set을 구독하는 hook (Notifications 페이지) */
export function useReadIds(): Set<number> {
  const snapshot = useSyncExternalStore(subscribe, getReadIdsSnapshot, getServerSnapshot)
  return new Set<number>(JSON.parse(snapshot) as number[])
}

/** 페이지 마운트 시 다른 탭의 변경을 즉시 반영 (보조) */
export function useNotifSync(callback: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener(CHANGE_EVENT, callback)
    return () => window.removeEventListener(CHANGE_EVENT, callback)
  }, [callback])
}
