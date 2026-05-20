/**
 * SimpleLineChart — gradient fill 라인 차트
 *
 * AdPerformance CTR 추이·일별 클릭 두 차트에 공유. SVG 인라인.
 * 원본 LineChart 동등.
 */

import { memo } from 'react'
import { useChartScrollContext, niceCeil, shouldShowLabel, CHART_COLORS } from '@wellink/ui'

interface Props {
  data: { label: string; value: number }[]
  stroke: string
  ariaLabel?: string
  /** Y축 라벨 포매터 — 단위에 맞게 (예: (n) => `${n.toFixed(1)}%` / (n) => fmtNumber(Math.round(n))) */
  yLabelFormatter?: (n: number) => string
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}

const SimpleLineChart = memo(function SimpleLineChart({ data, stroke, ariaLabel, yLabelFormatter, activeIndex, onActiveIndex, isTouch }: Props) {
  const ctx = useChartScrollContext()
  const W = ctx?.measuredW ?? 400
  const H = 200, padL = 56, padR = 16, padT = 18, padB = 32
  const plotW = W - padL - padR, plotH = H - padT - padB
  // niceCeil로 Y축 max 라운드업 (차트 위 끝 안 닿게, 라벨 깔끔)
  const max = niceCeil(Math.max(1, ...data.map(d => d.value)))
  const stepX = plotW / Math.max(data.length - 1, 1)
  const points = data.map((d, i) => ({
    x: padL + i * stepX,
    y: padT + plotH - (d.value / max) * plotH,
    label: d.label,
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillPath = points.length > 0
    ? `${path} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
    : ''
  const svgMinW = Math.max(400, data.length * 44)

  // X축 라벨 간격: data.length 기반
  // X축 라벨 표시 — 공통 정책 (shouldShowLabel 유틸 사용)

  const idxAt = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(data.length - 1, Math.round(((clientX - rect.left) / rect.width * W - padL) / stepX)))

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="[&_*]:pointer-events-none"
      role="img"
      aria-label={ariaLabel ?? '추이 차트'}
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: svgMinW, height: H }}
      onMouseMove={!isTouch && onActiveIndex ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      /* PC hover 떠나도 activeIndex 유지 — 항상 1개 노출 정책 */
      onClick={!isTouch && onActiveIndex ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchStart={isTouch && onActiveIndex ? (e) => onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchMove={isTouch && onActiveIndex ? (e) => { e.preventDefault(); onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) } : undefined}
    >
      <defs>
        <linearGradient id={`grad-${stroke.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke={CHART_COLORS.grid} strokeWidth={1} />
      })}
      {/* Y축 라벨 — 0 / 50% / max (X축과 동일 spec: #6b7280, 9pt, regular) */}
      {[0, 0.5, 1].map(r => {
        const labelValue = r * max
        const formatted = yLabelFormatter ? yLabelFormatter(labelValue) : Math.round(labelValue).toLocaleString()
        return (
          <text key={r} x={padL - 8} y={padT + plotH - r * plotH + 4} textAnchor="end" fontSize={12} fill={CHART_COLORS.axisLabel}>
            {formatted}
          </text>
        )
      })}
      <path d={fillPath} fill={`url(#grad-${stroke.replace('#', '')})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={stroke} />
      ))}
      {/* X축 라벨 — data.length 기반 간격 */}
      {points.map((p, i) => {
        if (!shouldShowLabel(i, points.length)) return null
        return <text key={i} x={p.x} y={padT + plotH + 20} textAnchor="middle" fontSize={12} fill={CHART_COLORS.axisLabel}>{p.label}</text>
      })}
      {/* 인터랙티브 crosshair + 활성 도트 — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex != null && (() => {
        const p = points[activeIndex]
        if (!p) return null
        return (
          <g key="active">
            <line x1={p.x} y1={padT} x2={p.x} y2={padT + plotH} stroke={CHART_COLORS.axisLabel} strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={p.x} cy={p.y} r={4} fill={stroke} stroke="white" strokeWidth={2} />
          </g>
        )
      })()}
    </svg>
  )
})

export default SimpleLineChart
