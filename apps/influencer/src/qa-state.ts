/**
 * 웰링크 광고주 POC — 전역 QA 상태 스토어
 *
 * 헤더에서 토글하는 4개의 독립 변수를 localStorage에 보관해 페이지 이동 후에도 유지.
 * 페이지 종속 URL 파라미터(?qa=tab-X 등)와는 별개로 동작.
 *
 * 변수
 *   plan            구독 플랜 (free/focus/scale/infinite/trial/expired/payment-failed)
 *   instaConnected  인스타그램 연결 여부
 *   loading         글로벌 로딩 토글
 *   error           글로벌 에러 토글
 */

import { useEffect, useState } from 'react'

export type QAPlan = 'free' | 'focus' | 'scale' | 'infinite' | 'trial' | 'expired' | 'payment-failed'

export interface QAState {
  plan: QAPlan
  instaConnected: boolean
  loading: boolean
  error: boolean
  empty: boolean
}

export const DEFAULT_QA_STATE: QAState = {
  plan: 'scale',
  instaConnected: true,
  loading: false,
  error: false,
  empty: false,
}

const STORAGE_KEY = 'wl_qa_state'
const CHANGE_EVENT = 'wl_qa_state_change'

function readStorage(): QAState {
  if (typeof window === 'undefined') return DEFAULT_QA_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_QA_STATE
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_QA_STATE, ...parsed }
  } catch {
    return DEFAULT_QA_STATE
  }
}

function writeStorage(state: QAState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
  } catch {
    // ignore
  }
}

export function setQAState(partial: Partial<QAState>) {
  const next = { ...readStorage(), ...partial }
  writeStorage(next)
}

export function resetQAState() {
  writeStorage(DEFAULT_QA_STATE)
}

export function useQAState(): QAState {
  const [state, setState] = useState<QAState>(readStorage)

  useEffect(() => {
    const sync = () => setState(readStorage())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return state
}

export const QA_PLAN_OPTIONS: { value: QAPlan; label: string }[] = [
  { value: 'free', label: '미구독 (무료)' },
  { value: 'trial', label: '무료 체험 중 (Scale 활성)' },
  { value: 'focus', label: 'Focus 플랜' },
  { value: 'scale', label: 'Scale 플랜' },
  { value: 'infinite', label: 'Infinite 플랜' },
  { value: 'expired', label: '구독 만료' },
  { value: 'payment-failed', label: '결제 실패' },
]
