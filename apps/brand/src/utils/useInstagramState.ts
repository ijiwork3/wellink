import { useQAState } from '../qa-state'

/**
 * 인스타그램 비즈니스 계정 연결 상태 훅
 *
 * 전역 QA 헤더 토글(localStorage `wl_qa_state`) 값을 그대로 위임.
 * 이전 URL `?gs=` 파라미터·sessionStorage 방식은 deprecated.
 */
export function useInstagramConnected(): boolean {
  return useQAState().instaConnected
}
