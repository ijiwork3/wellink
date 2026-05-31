/**
 * 인플루언서 알림 mock + 읽음 상태 store
 * - 읽음 ID는 localStorage에 저장, 'wl-inf-notif-changed' 이벤트로 sync
 * - BE 연동 시 이 모듈만 교체하면 됨
 */

import { useSyncExternalStore } from 'react'

export type NotificationType = 'campaign' | 'content' | 'message' | 'settlement' | 'system'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  desc: string
  time: string
  link: string | null
}

// ── 알림 데이터 (클라이언트 스펙 기준) ────────────────────────────
export const ALL_NOTIFICATIONS: NotificationItem[] = [
  // ── 캠페인 ──
  { id: 1,  type: 'campaign',   title: '헬스 보충제 캠페인의 신청 결과를 확인해 주세요', desc: "신청하신 '헬스 보충제 캠페인'의 선정 결과가 나왔습니다. 지금 바로 확인해 보세요.",        time: '방금 전',  link: '/campaigns/my' },
  { id: 2,  type: 'campaign',   title: '콘텐츠 등록 마감 3일 전',        desc: "'아웃도어 장비 리뷰' 캠페인 콘텐츠 등록 마감이 3일 남았습니다.",                             time: '1시간 전', link: '/campaigns/my' },
  { id: 3,  type: 'campaign',   title: '좋아요한 캠페인 마감 3일 전',     desc: "관심 등록한 '뷰티 트렌드 2026' 캠페인 모집이 3일 후 마감됩니다.",                             time: '3시간 전', link: '/campaigns/browse' },

  // ── 콘텐츠 ──
  { id: 4,  type: 'content',    title: '콘텐츠가 승인됐어요!',           desc: "'봄 요가 프로모션' 캠페인에 제출한 콘텐츠가 승인됐습니다.",                                   time: '30분 전',  link: '/campaigns/my' },
  { id: 5,  type: 'content',    title: '콘텐츠가 반려됐어요',             desc: "'운동복 신제품 리뷰' 콘텐츠가 반려됐습니다. 사유: 해시태그 누락. 수정 후 재제출해 주세요.",   time: '2시간 전', link: '/campaigns/my' },

  // ── 메시지 ──
  { id: 6,  type: 'message',    title: 'SMILEATO 광고주가 캠페인을 제안했습니다', desc: "'헬스 보충제 신제품 캠페인'에 참여를 제안했습니다. 조건을 확인해 보세요.",          time: '5분 전',   link: '/campaigns/1' },
  { id: 7,  type: 'message',    title: '요가랩 광고주가 캠페인을 제안했습니다',   desc: "'여름 요가웨어 캠페인'에 참여를 제안했습니다.",                                         time: '1시간 전', link: '/campaigns/1' },
  { id: 8,  type: 'message',    title: '글로우랩 광고주가 캠페인을 제안했습니다', desc: "'가을 뷰티 캠페인'에 초대됐습니다. 리워드 조건을 확인해 보세요.",                      time: '2일 전',   link: '/campaigns/1' },

  // ── 정산 ──
  { id: 9,  type: 'settlement', title: '유가시딩 정산 예정',              desc: "'봄 요가 프로모션' (유가시딩) 정산이 3일 후 지급 예정이에요. 계좌 정보를 확인해 주세요.",   time: '방금 전',  link: '/settlement' },
  { id: 10, type: 'settlement', title: '무가시딩 정산 예정',              desc: "'헬스 보충제 캠페인' (무가시딩) 정산이 예정됐습니다. 세금 서류를 미리 준비해 주세요.",       time: '1시간 전', link: '/settlement' },
  { id: 11, type: 'settlement', title: '정산이 완료됐어요',               desc: "150,000원이 등록 계좌로 지급됐습니다.",                                                        time: '어제',     link: '/settlement' },
  { id: 12, type: 'settlement', title: '정산에 실패했어요',               desc: "계좌 정보 불일치로 정산 지급에 실패했습니다. 계좌를 다시 확인해 주세요.",                     time: '3일 전',   link: '/settlement' },

  // ── 시스템 ──
  { id: 13, type: 'system',     title: '서비스 공지',                     desc: "웰링크 AI 추천 캠페인 기능이 업데이트됐습니다. 더욱 정확한 매칭 결과를 확인해 보세요.",       time: '어제',     link: null },
  { id: 14, type: 'system',     title: '정기 점검 안내',                  desc: "2026년 6월 1일 새벽 2시~4시 정기 점검이 예정되어 있습니다. 해당 시간대 서비스 이용이 제한됩니다.", time: '2일 전', link: null },
  { id: 15, type: 'system',     title: '약관 변경 안내',                  desc: "개인정보 처리 방침이 2026년 6월 1일부로 변경됩니다. 변경 내용을 확인해 주세요.",             time: '3일 전',   link: null },
  { id: 16, type: 'system',     title: '서비스 이용 관련 안내',           desc: "웰링크 서비스 이용 정책이 업데이트됐습니다. 확인해 주세요.",                                  time: '1주 전',   link: null },

  // ── 제안 (스펙 외 추가) ──
  { id: 17, type: 'campaign',   title: '요가 스트레칭 밴드 캠페인의 신청 결과를 확인해 주세요', desc: "신청하신 '요가 스트레칭 밴드' 캠페인의 선정 결과가 나왔습니다. 지금 바로 확인해 보세요.", time: '4일 전',   link: '/campaigns/my' },
]

// 처음 6건은 unread (id 1~6)
const INITIAL_UNREAD_IDS = ALL_NOTIFICATIONS.slice(0, 6).map(n => n.id)

// ── localStorage store ──────────────────────────────────────────
const STORAGE_KEY = 'wl-inf-notif-read'
const CHANGE_EVENT = 'wl-inf-notif-changed'

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

export function getNotifications(): NotificationItem[] {
  return ALL_NOTIFICATIONS
}

export function isUnread(id: number, readIds: Set<number>): boolean {
  return INITIAL_UNREAD_IDS.includes(id) && !readIds.has(id)
}

export function markAsRead(id: number) {
  const ids = loadReadIds()
  ids.add(id)
  saveReadIds(ids)
}

export function markAllAsRead(allIds?: number[]) {
  const ids = loadReadIds()
  const targets = allIds ?? INITIAL_UNREAD_IDS
  targets.forEach(id => ids.add(id))
  saveReadIds(ids)
}

export function deleteNotification(_id: number) {
  // mock: no-op (실서비스에서 API 연동)
}

// ── React hooks ─────────────────────────────────────────────────
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
  if (typeof window === 'undefined') return '[]'
  return localStorage.getItem(STORAGE_KEY) ?? '[]'
}

function getServerSnapshot(): string {
  return '[]'
}

/** 읽음 ID Set을 구독하는 hook (Notifications 페이지) */
export function useReadIds(): Set<number> {
  const snapshot = useSyncExternalStore(subscribe, getReadIdsSnapshot, getServerSnapshot)
  return new Set<number>(JSON.parse(snapshot) as number[])
}

/** 미읽음 갯수 hook (벨 뱃지용) */
export function useUnreadCount(): number {
  const snapshot = useSyncExternalStore(subscribe, getReadIdsSnapshot, getServerSnapshot)
  const readIds = new Set<number>(JSON.parse(snapshot) as number[])
  return ALL_NOTIFICATIONS.filter(n => isUnread(n.id, readIds)).length
}
