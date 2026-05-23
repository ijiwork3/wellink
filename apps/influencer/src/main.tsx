import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { auth } from '@wellink/ui'

// POC: 항상 로그인 상태로 시작 + 전화번호 인증 우회
auth.set('influencer')
localStorage.setItem('wl_inf_phone_verified_v1', '1')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
