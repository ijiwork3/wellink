/**
 * SimpleBarChart — 기간 발생량(Flow) 전용 바 차트
 *
 * 클릭 수처럼 "매 기간 새로 발생한 양"을 표현. SimpleLineChart와 동일 인터페이스.
 * 연속된 상태값(CTR, ROAS 등)은 SimpleLineChart 사용.
 */

import { memo } from 'react'
import { useChartScrollContext, niceCeil, shouldShowLabel } from '@wellink/ui'

interface Props {
  data: { label: string; value: number }[]
  stroke: string
  ariaLabel?: string
  yLabelFormatter?: (n: number) => string
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}

const SimpleBarChart = memo(function SimpleBarChart({ data, stroke, ariaLabel, yLabelFormatter, activeIndex, onActiveIndex, isTouch }: Props) {
  const ctx = useChartScrollContext()
  const W = ctx?.measuredW ?? 400
  const H = 200, padL = 56, padR = 16, padT = 18, padB = 32
  const plotW = W - padL - padR, plotH = H - padT - padB
  const max = niceCeil(Math.max(1, ...data.map(d => d.value)))
  const stepX = plotW / Math.max(data.length, 1)
  const barW = Math.max(6, Math.min(40, stepX * 0.6))
  const svgMinW = Math.max(400, data.length * 44)

  const barX = (i: number) => padL + i * stepX + stepX / 2

  const idxAt = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(data.length - 1, Math.round(((clientX - rect.left) / rect.width * W - padL - stepX / 2) / stepX)))

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="[&_*]:pointer-events-none"
      role="img"
      aria-label={ariaLabel ?? '막대 차트'}
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: svgMinW, height: H }}
      onMouseMove={!isTouch && onActiveIndex ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onClick={!isTouch && onActiveIndex ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchStart={isTouch && onActiveIndex ? (e) => onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchMove={isTouch && onActiveIndex ? (e) => { e.preventDefault(); onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) } : undefined}
    >
      {/* 그리드 */}
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}

      {/* Y축 라벨 */}
      {[0, 0.5, 1].map(r => {
        const labelValue = r * max
        const formatted = yLabelFormatter ? yLabelFormatter(labelValue) : Math.round(labelValue).toLocaleString()
        return (
          <text key={r} x={padL - 8} y={padT + plotH - r * plotH + 4} textAnchor="end" fontSize={12} fill="#6b7280">
            {formatted}
          </text>
        )
      })}

      {/* 막대 */}
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / max) * plotH)
        const x = barX(i) - barW / 2
        const y = padT + plotH - h
        const isActive = activeIndex === i
        return (
          <rect
            key={i}
            x={x} y={y}
            width={barW} height={h}
            rx={2}
            fill={stroke}
            opacity={activeIndex == null || isActive ? 1 : 0.35}
          />
        )
      })}

      {/* X축 라벨 */}
      {data.map((d, i) => {
        if (!shouldShowLabel(i, data.length)) return null
        return (
          <text key={i} x={barX(i)} y={padT + plotH + 20} textAnchor="middle" fontSize={12} fill="#6b7280">
            {d.label}
          </text>
        )
      })}

      {/* 활성 crosshair */}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const h = Math.max(2, (d.value / max) * plotH)
        const cx = barX(activeIndex)
        const cy = padT + plotH - h
        return (
          <line x1={cx} y1={padT} x2={cx} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
        )
      })()}
    </svg>
  )
})

export default SimpleBarChart
