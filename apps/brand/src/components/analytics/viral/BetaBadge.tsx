/**
 * BetaBadge — 바이럴 지표 헤더 옆 베타 배지
 *
 * Tooltip(베타 버전 안내) + aria-label 필수.
 * disconnected/empty/메인 3곳에서 동일 사용.
 */

import { memo } from 'react'
import { Tooltip } from '@wellink/ui'

const BetaBadge = memo(function BetaBadge() {
  return (
    <Tooltip content="베타 버전 — 일부 기능이 변경될 수 있습니다">
      <span
        className="text-sm font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full leading-none whitespace-nowrap"
        aria-label="베타 버전"
      >
        Beta
      </span>
    </Tooltip>
  )
})

export default BetaBadge
