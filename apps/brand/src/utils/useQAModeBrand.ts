import { useQAMode } from '@wellink/ui'
import { useQAState } from '../qa-state'

/**
 * 브랜드 앱 전용 QA 모드 훅.
 * URL `?qa=xxx` 우선, 없으면 전역 QA 헤더 토글(loading/error/empty) 반영.
 */
export function useQAModeBrand(): string {
  const urlQa = useQAMode()
  const { loading, error, empty } = useQAState()

  if (urlQa) return urlQa
  if (error) return 'error'
  if (loading) return 'loading'
  if (empty) return 'empty'
  return ''
}
