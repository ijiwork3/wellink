import { useQAMode } from '@wellink/ui'
import { useQAState } from '../qa-state'

/**
 * 브랜드 앱 전용 QA 모드 훅.
 * URL `?qa=xxx` 우선, 없으면 전역 QA 헤더 토글(loading/error) 반영.
 * 나머지 qa 값(empty, grid 등)은 URL 파라미터 전용.
 */
export function useQAModeBrand(): string {
  const urlQa = useQAMode()
  const { loading, error } = useQAState()

  if (urlQa) return urlQa
  if (error) return 'error'
  if (loading) return 'loading'
  return ''
}
