/**
 * QA 모드 훅 — URL `?qa=xxx` 파라미터를 읽어 반환
 * react-router-dom 의존성 없이 동작 (ui 패키지 독립성 유지)
 *
 * 사용 예)
 *   const qa = useQAMode()
 *   if (qa === 'empty') { ... }
 *   if (qa === 'loading') { ... }
 */
export function useQAMode(): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('qa') ?? ''
}
