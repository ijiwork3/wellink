import { Navigate, useLocation } from 'react-router-dom'
import { auth } from '../utils/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  // 개발 환경에서만 ?qa= 파라미터로 bypass 허용
  const isDev = import.meta.env.DEV
  const isQA = isDev && new URLSearchParams(location.search).has('qa')
  if (isQA || auth.isLoggedIn()) return <>{children}</>
  return <Navigate to="/login" replace state={{ from: location }} />
}
