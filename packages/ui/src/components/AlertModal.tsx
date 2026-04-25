/**
 * AlertModal — 짧은 확인/취소 모달
 * 메시지 + 하단 버튼 1~2개 전용. children으로 추가 콘텐츠 삽입 가능.
 *
 * variant:
 *   'default'  — 기본 (파란 계열 확인 버튼)
 *   'danger'   — 삭제/취소 등 위험 액션 (빨간 확인 버튼)
 *   'confirm'  — 긍정적 확인 (초록 확인 버튼)
 */

import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import Modal from './Modal'

interface AlertModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  /** 확인 버튼 비활성화 (로딩 중 등) */
  confirmDisabled?: boolean
  /** 확인 버튼 로딩 텍스트 */
  confirmLoadingLabel?: string
  loading?: boolean
  variant?: 'default' | 'danger' | 'confirm'
  size?: 'sm' | 'md' | 'lg'
  /** false면 취소 버튼 숨김 */
  showCancel?: boolean
}

const VARIANT_STYLES = {
  default: {
    confirm: 'bg-gray-900 text-white hover:bg-gray-700',
    icon: null,
  },
  danger: {
    confirm: 'bg-red-500 text-white hover:bg-red-600',
    icon: <AlertTriangle size={20} className="text-red-500" aria-hidden="true" />,
  },
  confirm: {
    confirm: 'bg-brand-green text-white hover:bg-brand-green-hover',
    icon: <CheckCircle size={20} className="text-brand-green" aria-hidden="true" />,
  },
}

export default function AlertModal({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  confirmDisabled,
  confirmLoadingLabel,
  loading = false,
  variant = 'default',
  size = 'sm',
  showCancel = true,
}: AlertModalProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          {showCancel && (
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={confirmDisabled || loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${styles.confirm}`}
            >
              {loading && confirmLoadingLabel ? confirmLoadingLabel : confirmLabel}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-3">
        {styles.icon && (
          <div className="flex items-center gap-2">
            {styles.icon}
          </div>
        )}
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        {children}
      </div>
    </Modal>
  )
}
