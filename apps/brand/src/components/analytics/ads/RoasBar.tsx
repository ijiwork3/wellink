/**
 * RoasBar — 광고 성과 ROAS 비교 바 (평균 기준)
 *
 * 정책 § 1-2: 소재 카드 + 캠페인 행에 ROAS 비교 바 표시.
 * data-policy-v1: ROAS ≥3.0 녹색 / ≥1.5 amber / >0 빨강 / 0 회색.
 * v2 (2026-05-14): 비교 기준을 *같은 그룹 평균* 으로 변경. 진행바 50% = 평균(1.0x).
 *   - 평균 위 → 평균 이상 ROAS / 평균 아래 → 평균 이하 ROAS
 *   - 1.0x 기준선 마커 + "vs 평균 N.Nx" 텍스트 명시
 * 진행바 접근성: role="progressbar" + aria-valuenow/min/max/text.
 */

import { memo } from 'react'
import { getRoasColor } from '@wellink/ui'

interface Props {
  value: number
  /** 같은 그룹 평균 ROAS — 진행바 50% 위치 = 평균(1.0x 효율) */
  avg: number
}

const RoasBar = memo(function RoasBar({ value, avg }: Props) {
  // 진행바 시각 범위: 0 ~ 2*평균. value/2*avg를 %로 변환 (평균 = 50% 위치)
  const maxScale = avg > 0 ? avg * 2 : 1
  const pct = Math.min(100, Math.max(0, (value / maxScale) * 100))
  const ratioPct = avg > 0 ? Math.round((value / avg) * 100) : 0
  const color =
    value >= 3.0 ? 'var(--color-brand-green)' :
    value >= 1.5 ? 'var(--color-roas-warning)' :
    value > 0    ? 'var(--color-roas-danger)' :
                   'var(--color-chart-empty)'
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        className="relative w-24 h-1.5 bg-gray-100 rounded-full"
        role="progressbar"
        aria-label="ROAS 비교 (같은 단계 평균 대비)"
        aria-valuenow={ratioPct}
        aria-valuemin={0}
        aria-valuemax={200}
        aria-valuetext={value > 0 && avg > 0 ? `${value}x · 같은 단계 평균 ${avg.toFixed(1)}x 대비 ${ratioPct}%` : '데이터 없음'}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        {/* 평균(1.0x) 기준선 마커 — 진행바 위/아래로 살짝 튀어나오게 */}
        {avg > 0 && (
          <div
            className="absolute left-1/2 -top-0.5 -bottom-0.5 w-px bg-gray-500 -translate-x-px"
            aria-hidden="true"
          />
        )}
      </div>
      <span className={`text-[15px] font-semibold ${getRoasColor(value)} whitespace-nowrap`}>
        {value > 0 ? `${value}x` : '—'}
      </span>
      {avg > 0 && (
        <span className="text-[15px] text-gray-500 whitespace-nowrap">
          vs 평균 {avg.toFixed(1)}x
        </span>
      )}
    </div>
  )
})

export default RoasBar
