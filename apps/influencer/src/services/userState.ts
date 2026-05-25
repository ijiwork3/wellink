/**
 * 사용자 상태 store (localStorage 기반).
 *
 * 캠페인 id를 master(mockCampaigns)에서만 관리하고, 사용자별 상호작용 상태는
 * 여기서 관리한다. cold-review A2/A3 해결:
 *  - 북마크: campaignId Set (페이지 간 동기화)
 *  - 신청 완료: campaignId Set (CampaignDetail "신청완료" 배지 + Browse forceApplied)
 *
 * localStorage 동기화 + storage 이벤트 + 같은 탭 내 CustomEvent 로 페이지간 실시간 반영.
 */

import { useEffect, useState, useCallback } from 'react'

const BOOKMARKS_KEY    = 'wl_inf_bookmarks_v1'
const APPLICATIONS_KEY = 'wl_inf_applications_v1'
const SYNC_EVENT       = 'wl_inf_userstate_change'

// 초기 시연 데이터 — 처음 진입 사용자에게 보여줄 기본 상태
const DEFAULT_BOOKMARKS = [1, 2, 3]
const DEFAULT_APPLICATIONS = [1, 2, 3] // mockAppliedData와 일치

function readSet(key: string, fallback: number[]): Set<number> {
  if (typeof window === 'undefined') return new Set(fallback)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set(fallback)
    const parsed = JSON.parse(raw) as number[]
    return parsed.length > 0 ? new Set(parsed) : new Set(fallback)
  } catch {
    return new Set(fallback)
  }
}

function writeSet(key: string, set: Set<number>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  } catch {
    // ignore (private mode 등)
  }
}

function useSyncedSet(key: string, fallback: number[]) {
  const [set, setSet] = useState<Set<number>>(() => readSet(key, fallback))

  useEffect(() => {
    const sync = () => setSet(readSet(key, fallback))
    window.addEventListener(SYNC_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  // fallback은 const 배열이라 안정적
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const has = useCallback((id: number) => set.has(id), [set])

  const toggle = useCallback((id: number) => {
    setSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      writeSet(key, next)
      return next
    })
  }, [key])

  const add = useCallback((id: number) => {
    setSet(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      writeSet(key, next)
      return next
    })
  }, [key])

  const remove = useCallback((id: number) => {
    setSet(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      writeSet(key, next)
      return next
    })
  }, [key])

  return { ids: set, has, toggle, add, remove, size: set.size }
}

/** 북마크(관심 캠페인) — campaignId Set 관리 */
export function useBookmarks() {
  return useSyncedSet(BOOKMARKS_KEY, DEFAULT_BOOKMARKS)
}

/** 신청 완료 — campaignId Set 관리 */
export function useApplications() {
  return useSyncedSet(APPLICATIONS_KEY, DEFAULT_APPLICATIONS)
}
