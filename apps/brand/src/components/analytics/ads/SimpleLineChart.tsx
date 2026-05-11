/**
 * SimpleLineChart — gradient fill 라인 차트
 *
 * AdPerformance CTR 추이·일별 클릭 두 차트에 공유. SVG 인라인.
 * 원본 LineChart 동등.
 */

import { memo } from 'react'

interface Props {
  data: { label: string; value: number }[]
  stroke: string
  ariaLabel?: string
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}

const SimpleLineChart = memo(function SimpleLineChart({ data, stroke, ariaLabel, activeIndex, onActiveIndex, isTouch }: Props) {
  const W = 400, H = 180, padL = 36, padR = 12, padT = 12, padB = 28
  const plotW = W - padL - padR, plotH = H - padT - padB
  const max = Math.max(1, ...data.map(d => d.value))
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
  const svgMinW = Math.max(W, data.length * 44)

  // X축 라벨 간격: data.length 기반
  const labelInterval = data.length > 20 ? 7 : data.length > 8 ? 3 : 1

  const idxAt = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(data.length - 1, Math.round(((clientX - rect.left) / rect.width * W - padL) / stepX)))

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="overflow-visible [&_*]:pointer-events-none"
      role="img"
      aria-label={ariaLabel ?? '추이 차트'}
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: svgMinW }}
      onMouseMove={!isTouch && onActiveIndex ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onMouseLeave={!isTouch && onActiveIndex ? () => onActiveIndex(null) : undefined}
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
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}
      <path d={fillPath} fill={`url(#grad-${stroke.replace('#', '')})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={stroke} />
      ))}
      {/* X축 라벨 — data.length 기반 간격 */}
      {points.map((p, i) => {
        if (i % labelInterval !== 0 && i !== points.length - 1) return null
        return <text key={i} x={p.x} y={padT + plotH + 14} textAnchor="middle" fontSize={9} fill="#6b7280">{p.label}</text>
      })}
      {/* 인터랙티브 crosshair + 활성 도트 — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex != null && (() => {
        const p = points[activeIndex]
        if (!p) return null
        return (
          <g key="active">
            <line x1={p.x} y1={padT} x2={p.x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={p.x} cy={p.y} r={4} fill={stroke} stroke="white" strokeWidth={2} />
          </g>
        )
      })()}
    </svg>
  )
})

export default SimpleLineChart
