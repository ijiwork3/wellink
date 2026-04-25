import { useQAState } from '../qa-state'

/**
 * 인스타그램 연결 상태 (전역 QA 헤더 토글)
 * 이전에는 Dashboard URL 파라미터(?gs=instagram)와 페이지별 분기로 처리되었으나,
 * 헤더 토글 → localStorage 전역 상태로 통일.
 */
export function useInstagramConnection(): boolean {
  return useQAState().instaConnected
}
