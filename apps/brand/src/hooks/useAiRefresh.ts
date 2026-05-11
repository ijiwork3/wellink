/**
 * useAiRefresh — AI 분석 카드 새로고침 상태·타이머·중복 호출 가드
 *
 * AdPerformance / ProfileInsight 두 곳에서 동일 패턴 반복됨.
 * - refresh() 호출 시 refreshing=true → delayMs(기본 1800ms) 후 false 복귀
 * - 진행 중 추가 호출 무시 (중복 가드)
 * - 컴포넌트 unmount 시 타이머 cleanup
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export default function useAiRefresh(delayMs = 1800) {
  const [refreshing, setRefreshing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refresh = useCallback(() => {
    if (refreshing) return
    setRefreshing(true)
    timerRef.current = setTimeout(() => setRefreshing(false), delayMs)
  }, [refreshing, delayMs])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  return { refreshing, refresh }
}
