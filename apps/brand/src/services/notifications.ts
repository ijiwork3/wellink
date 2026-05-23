/**
 * 알림 mock + 읽음 상태 store
 * - 알림 페이지·Sidebar dot 등 여러 컴포넌트에서 공유
 * - 읽음 ID는 localStorage에 저장, 'wl-notif-changed' 커스텀 이벤트로 sync
 * - BE 연동 시 이 모듈만 교체하면 됨
 */

import { useEffect, useSyncExternalStore } from 'react'

export type NotificationType = 'campaign' | 'system' | 'message'

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
const CAMPAIGN_TITLES = [
  '새로운 지원자가 있습니다',
  '캠페인 리포트 생성 완료',
  '캠페인 모집 마감 임박',
  '인플루언서가 콘텐츠를 제출했습니다',
  '캠페인 발표일이 도래했습니다',
  '인플루언서가 선정을 수락했습니다',
  '인플루언서가 참여를 취소했습니다',
  '콘텐츠 검수 마감 임박',
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
  '선정 인플루언서가 검수용 콘텐츠를 제출했습니다.',
  '오늘이 인플루언서 발표일입니다.',
  "@yoga_jimin님이 '봄 요가 프로모션' 캠페인 선정을 수락했습니다.",
  "@daily_hana님이 캠페인 참여를 취소했습니다. 대체 인플루언서를 선정해 주세요.",
  "'여름 맞이 챌린지' 콘텐츠 검수 마감이 72시간 안에 도래합니다.",
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

export const ALL_NOTIFICATIONS: NotificationItem[] = Array.from({ length: 100 }, (_, i) => {
  const type = TYPE_CYCLE[i % TYPE_CYCLE.length]
  const titlePool = type === 'campaign' ? CAMPAIGN_TITLES : type === 'system' ? SYSTEM_TITLES : MESSAGE_TITLES
  const descPool  = type === 'campaign' ? CAMPAIGN_DESCS : type === 'system' ? SYSTEM_DESCS  : MESSAGE_DESCS
  const title = titlePool[i % titlePool.length]
  const desc = descPool[i % descPool.length]
  // 타이틀별 딥링크 라우팅
  const link =
    title === '결제 실패 알림' ? '/payment/method'
    : title === '인플루언서가 선정을 수락했습니다' || title === '인플루언서가 참여를 취소했습니다' ? '/campaigns/1?qa=tab-selected'
    : title === '콘텐츠 검수 마감 임박' || title === '인플루언서가 콘텐츠를 제출했습니다' ? '/campaigns/1?qa=tab-content'
    : type === 'campaign' && i % 3 === 0 ? '/campaigns/1?qa=tab-applicants'
    : type === 'campaign' && i % 3 === 1 ? '/campaigns/1?qa=tab-report'
    : null
  return { id: i + 1, type, title, desc, time: TIME_POOL[i % TIME_POOL.length], link }
})

// 처음 8건은 unread (id 1~8)
const INITIAL_UNREAD_IDS = ALL_NOTIFICATIONS.slice(0, 8).map(n => n.id)

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

/** 미구독자는 결제·플랜 관련 system 알림 제외 (정합성) */
export function getVisibleNotifications(isSubscribed: boolean): NotificationItem[] {
  return isSubscribed ? ALL_NOTIFICATIONS : ALL_NOTIFICATIONS.filter(n => n.type !== 'system')
}

export function isUnread(id: number, readIds: Set<number>): boolean {
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
