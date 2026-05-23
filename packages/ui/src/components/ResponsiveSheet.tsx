/**
 * ResponsiveSheet — PC에서는 Modal, 모바일/태블릿에서는 BottomSheet
 *
 * 공통 정책:
 * - PC (isTouch=false) → centered Modal
 * - 모바일/태블릿 (isTouch=true) → slide-up BottomSheet
 * - 내용이 많으면 size="md"|"lg" 지정 (기본 "sm")
 */

import type { ReactNode } from 'react'
import Modal from './Modal'
import BottomSheet from './BottomSheet'
import { useIsTouchDevice } from '../utils/useIsTouchDevice'

interface ResponsiveSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  /** dialog aria-label. title이 없을 때 사용 */
  label?: string
  children: ReactNode
  /** Modal size — PC 전용. 기본 'sm' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function ResponsiveSheet({ open, onClose, title, label, children, size = 'sm' }: ResponsiveSheetProps) {
  const isTouch = useIsTouchDevice()

  if (isTouch) {
    return (
      <BottomSheet open={open} onClose={onClose} title={title} label={label}>
        {children}
      </BottomSheet>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={title} label={label} size={size}>
      {children}
    </Modal>
  )
}
