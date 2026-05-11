/**
 * RoasBar — 광고 성과 ROAS 비교 바
 *
 * 정책 § 1-2: 소재 카드 + 캠페인 행에 ROAS 비교 바 표시.
 * data-policy-v1: ROAS ≥3.0 녹색 / ≥1.5 amber / >0 빨강 / 0 회색.
 * 진행바 접근성: role="progressbar" + aria-valuenow/min/max/text.
 */

import { memo } from 'react'
import { getRoasColor } from '@wellink/ui'

interface Props {
  value: number
  max: number
}

const RoasBar = memo(function RoasBar({ value, max }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const color = value >= 3.0 ? 'var(--color-brand-green)' : value >= 1.5 ? 'var(--color-roas-warning)' : value > 0 ? 'var(--color-roas-danger)' : 'var(--color-chart-empty)'
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-label="ROAS 비교"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={value > 0 ? `${value}x (최댓값 대비 ${pct}%)` : '데이터 없음'}
      >
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className={`text-base font-semibold ${getRoasColor(value)}`}>
        {value > 0 ? `${value}x` : '—'}
      </span>
    </div>
  )
})

export default RoasBar
