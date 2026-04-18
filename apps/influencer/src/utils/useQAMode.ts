import { useSearchParams } from 'react-router-dom'

/**
 * QA 모드 훅 — URL `?qa=xxx` 파라미터를 읽어 반환
 */
export function useQAMode(): string {
  const [searchParams] = useSearchParams()
  return searchParams.get('qa') ?? ''
}
