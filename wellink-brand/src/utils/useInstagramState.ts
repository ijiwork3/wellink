import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

const STORAGE_KEY = 'wellink_instagram_connected'

/**
 * 인스타그램 비즈니스 계정 연결 상태 훅
 *
 * ?gs=no-instagram  → 미연결 상태로 전환 (sessionStorage 저장)
 * ?gs=instagram     → 연결 상태로 복원
 * 파라미터 없음     → sessionStorage 값 사용 (기본값: 연결됨)
 */
export function useInstagramConnected(): boolean {
  const [searchParams] = useSearchParams()
  const gs = searchParams.get('gs')

  useEffect(() => {
    if (gs === 'no-instagram') {
      sessionStorage.setItem(STORAGE_KEY, 'false')
    } else if (gs === 'instagram') {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    }
  }, [gs])

  // gs 파라미터가 있을 때는 즉시 반영 (storage 업데이트 전에도)
  if (gs === 'no-instagram') return false
  if (gs === 'instagram') return true

  const stored = sessionStorage.getItem(STORAGE_KEY)
  // 기본값: 연결됨 (실제 서비스에서는 auth context에서 읽어옴)
  return stored !== 'false'
}
