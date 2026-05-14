import { useEffect, useRef } from 'react'

/**
 * 모달·드로어 ESC 닫기 훅.
 *
 * 동작:
 * - open=true 일 때만 keydown 리스너 등록 → 닫힌 모달이 비용을 만들지 않음.
 * - 여러 모달이 동시에 열려 있어도 **가장 마지막에 등록된 모달만 닫힌다**.
 *   (내부 stack에 등록 시점 토큰을 push, ESC 발생 시 마지막 토큰의 onClose만 호출
 *    + `event.stopImmediatePropagation()`으로 하위 리스너 전파 차단)
 * - onClose가 매 렌더 새 함수여도 ref로 최신 참조를 유지하므로 stack 일관성이 깨지지 않음.
 *
 * 사용:
 *   useEscToClose(modalOpen, () => setModalOpen(false))
 */
type Token = { onClose: () => void }
const escStack: Token[] = []

export function useEscToClose(open: boolean, onClose: () => void) {
  // onClose는 매 렌더 새 함수일 수 있으므로 최신 참조를 ref에 보관 (effect 안에서 동기화)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) return
    const token: Token = { onClose: () => onCloseRef.current() }
    escStack.push(token)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (escStack[escStack.length - 1] !== token) return
      e.stopImmediatePropagation()
      token.onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      const idx = escStack.lastIndexOf(token)
      if (idx >= 0) escStack.splice(idx, 1)
    }
  }, [open])
}
