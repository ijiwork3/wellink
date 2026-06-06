/**
 * ImpressReachChart — 노출 & 도달 듀얼 라인 차트 (null 구간 점선 배경 처리)
 * ProfileInsight 메인 컴포넌트에서 분리.
 */

import { memo } from 'react'
import { useChartScrollContext, niceCeil, shouldShowLabel, CHART_COLORS, SEMANTIC_COLORS, BRAND } from '@wellink/ui'
import type { ImpressReachItem } from '../../../data/analytics/profile'

interface Props {
  data: ImpressReachItem[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
  padL?: number
  padR?: number
  minWidthPerItem?: number
}

const ImpressReachChart = memo(function ImpressReachChart({ data, activeIndex, onActiveIndex, isTouch, padL: padLProp, padR: padRProp, minWidthPerItem = 44 }: Props) {
  const ctx = useChartScrollContext()
  const W = ctx?.measuredW ?? 580
  const H = 220, padL = padLProp ?? 60, padR = padRProp ?? 16, padT = 18, padB = 32
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const allImpress = data.map(d => d.impressions).filter((v): v is number => v !== null)
  const allReach   = data.map(d => d.reach).filter((v): v is number => v !== null)
  // 노출·도달 공통 Y축 + niceCeil로 깔끔한 라운드 max (차트 위 끝 안 닿게)
  const maxVal = niceCeil(Math.max(1, ...allImpress, ...allReach))

  const stepX = plotW / Math.max(data.length - 1, 1)
  const isDense = data.length > 14

  const toY = (v: number) => padT + plotH - (v / maxVal) * plotH

  const handlePointerAt = (clientX: number, rect: DOMRect) => {
    const ratio = (clientX - rect.left) / rect.width
    const svgX = ratio * W - padL
    const idx = Math.round(svgX / stepX)
    onActiveIndex?.(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const fmtAxis = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)

  const buildSegments = (key: 'impressions' | 'reach') => {
    const segs: { x: number; y: number }[][] = []
    let cur: { x: number; y: number }[] = []
    data.forEach((d, i) => {
      const v = d[key]
      if (v !== null) {
        cur.push({ x: padL + i * stepX, y: toY(v) })
      } else {
        if (cur.length) { segs.push(cur); cur = [] }
      }
    })
    if (cur.length) segs.push(cur)
    return segs
  }

  const impressSegs = buildSegments('impressions')
  const reachSegs   = buildSegments('reach')

  const nullGroups: number[][] = []
  data.forEach((d, i) => {
    if (d.impressions === null) {
      if (!nullGroups.length || i !== nullGroups[nullGroups.length - 1][nullGroups[nullGroups.length - 1].length - 1] + 1) {
        nullGroups.push([i])
      } else {
        nullGroups[nullGroups.length - 1].push(i)
      }
    }
  })

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="[&_*]:pointer-events-none"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: Math.max(580, data.length * minWidthPerItem), height: H }}
      role="img"
      aria-label="노출 및 도달 추이 차트"
      onMouseMove={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      /* PC hover 떠나도 activeIndex 유지 — 항상 1개 노출 정책 */
      onClick={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchStart={isTouch ? (e) => handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) } : undefined}
    >
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL} y1={y} x2={W - padR} y2={y} stroke={CHART_COLORS.grid} strokeWidth={1} />
      })}
      {[0, 0.5, 1].map(r => (
        <text key={r} x={padL - 6} y={padT + plotH - r * plotH + 4} textAnchor="end" fontSize={12} fill={CHART_COLORS.axisLabel}>
          {fmtAxis(Math.round(r * maxVal))}
        </text>
      ))}
      {nullGroups.map((group, gi) => {
        const xS = padL + group[0] * stepX - (group[0] === 0 ? 0 : stepX / 2)
        const xE = padL + group[group.length - 1] * stepX + (group[group.length - 1] === data.length - 1 ? 0 : stepX / 2)
        return <rect key={gi} x={xS} y={padT} width={Math.max(0, xE - xS)} height={plotH} fill={CHART_COLORS.nullBg} rx={3} />
      })}
      {nullGroups.length > 0 && (() => {
        const firstEnd = data.findIndex(d => d.impressions !== null) - 1
        if (firstEnd < 0) return null
        const cx = padL + (firstEnd / 2) * stepX
        return <text x={cx} y={padT + plotH / 2 + 4} textAnchor="middle" fill={CHART_COLORS.nullText} fontSize={10}>데이터 없음</text>
      })()}
      {impressSegs.map((seg, si) => (
        <g key={`i-${si}`}>
          <path d={seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            fill="none" stroke={CHART_COLORS.impressions} strokeWidth={isDense ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
          {seg.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={isDense ? 2 : 3} fill={CHART_COLORS.impressions} />
              <circle cx={p.x} cy={p.y} r={isDense ? 0.8 : 1.2} fill={SEMANTIC_COLORS.white} />
            </g>
          ))}
        </g>
      ))}
      {reachSegs.map((seg, si) => (
        <g key={`r-${si}`}>
          <path d={seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            fill="none" stroke={BRAND.green} strokeWidth={isDense ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
          {seg.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={isDense ? 2 : 3} fill={BRAND.green} />
              <circle cx={p.x} cy={p.y} r={isDense ? 0.8 : 1.2} fill={SEMANTIC_COLORS.white} />
            </g>
          ))}
        </g>
      ))}
      {data.map((d, i) => {
        const x = padL + i * stepX
        if (!shouldShowLabel(i, data.length, d)) return null
        return (
          <text key={i} x={x} y={H - 4} textAnchor="middle" fill={d.impressions === null ? CHART_COLORS.nullText : CHART_COLORS.axisLabel} fontSize={12}>
            {d.label}
          </text>
        )
      })}

      {/* 인터랙티브 crosshair + 활성 도트 — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const x = padL + activeIndex * stepX
        const impY = d.impressions !== null ? toY(d.impressions) : null
        const reachY = d.reach !== null ? toY(d.reach) : null
        return (
          <g key="active">
            <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke={CHART_COLORS.axisLabel} strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            {impY !== null && <circle cx={x} cy={impY} r={3.5} fill={CHART_COLORS.impressions} stroke={SEMANTIC_COLORS.white} strokeWidth={1.5} />}
            {reachY !== null && <circle cx={x} cy={reachY} r={3.5} fill={BRAND.green} stroke={SEMANTIC_COLORS.white} strokeWidth={1.5} />}
          </g>
        )
      })()}
    </svg>
  )
})

export default ImpressReachChart
