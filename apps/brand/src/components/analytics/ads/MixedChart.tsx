/**
 * MixedChart — 광고 성과 일별 지출(막대) + 클릭(라인) 차트
 *
 * 원본 MixedBarLineChart 동등. SVG 인라인.
 * 차트 인터랙션 정책: PC=hover+click / 모바일=tap+drag (CLAUDE.md § 차트 인터랙션)
 */

import { memo } from 'react'

interface Props {
  data: { date: string; spend: number; clicks: number; ctr?: number }[]
  activeIndex: number | null
  onActiveIndex: (i: number | null) => void
  isTouch: boolean
}

const MixedChart = memo(function MixedChart({ data, activeIndex, onActiveIndex, isTouch }: Props) {
  const W = 700, H = 220, padL = 50, padR = 50, padT = 16, padB = 32
  const plotW = W - padL - padR, plotH = H - padT - padB
  const maxSpend = Math.max(1, ...data.map(d => d.spend))
  const maxClicks = Math.max(1, ...data.map(d => d.clicks))
  const barW = plotW / data.length * 0.6
  const stepX = plotW / Math.max(data.length - 1, 1)
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
      aria-label="기간별 광고 지출(막대)과 클릭 수(선) 추이 차트"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: svgMinW }}
      onMouseMove={!isTouch ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onMouseLeave={!isTouch ? () => onActiveIndex(null) : undefined}
      onClick={!isTouch ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchStart={isTouch ? (e) => onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) } : undefined}
    >
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}
      {/* 좌축 (지출) */}
      {[0, 0.5, 1].map(r => (
        <text key={r} x={padL - 6} y={padT + plotH - r * plotH + 3} textAnchor="end" fontSize={9} fill="#9ca3af">
          {Math.round(r * maxSpend / 1000).toLocaleString()}k
        </text>
      ))}
      {/* 우축 (클릭) */}
      {[0, 0.5, 1].map(r => (
        <text key={r} x={W - padR + 6} y={padT + plotH - r * plotH + 3} textAnchor="start" fontSize={9} fill="#9ca3af">
          {Math.round(r * maxClicks).toLocaleString()}
        </text>
      ))}
      {/* 막대 (지출) */}
      {data.map((d, i) => {
        const x = padL + i * stepX - barW / 2
        const h = (d.spend / maxSpend) * plotH
        return <rect key={i} x={x} y={padT + plotH - h} width={barW} height={h} rx={2} fill="#8b5cf6" fillOpacity={0.8} />
      })}
      {/* 라인 (클릭) */}
      <path
        d={data.map((d, i) => {
          const x = padL + i * stepX
          const y = padT + plotH - (d.clicks / maxClicks) * plotH
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
        }).join(' ')}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
      />
      {data.map((d, i) => {
        const x = padL + i * stepX
        const y = padT + plotH - (d.clicks / maxClicks) * plotH
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#3b82f6" />
      })}
      {/* X축 라벨 — data.length 기반 간격 */}
      {data.map((d, i) => {
        if (i % labelInterval !== 0 && i !== data.length - 1) return null
        const x = padL + i * stepX
        return <text key={i} x={x} y={padT + plotH + 14} textAnchor="middle" fontSize={9} fill="#6b7280">{d.date}</text>
      })}
      {/* 인터랙티브 crosshair + 활성 도트 — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex !== null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const x = padL + activeIndex * stepX
        const spendY = padT + plotH - (d.spend / maxSpend) * plotH
        const clicksY = padT + plotH - (d.clicks / maxClicks) * plotH
        return (
          <g key="active-indicator">
            <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={x} cy={spendY} r={3.5} fill="#8b5cf6" stroke="white" strokeWidth={1.5} />
            <circle cx={x} cy={clicksY} r={3.5} fill="#3b82f6" stroke="white" strokeWidth={1.5} />
          </g>
        )
      })()}
    </svg>
  )
})

export default MixedChart
