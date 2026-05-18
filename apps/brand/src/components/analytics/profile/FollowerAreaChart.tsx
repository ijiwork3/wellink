/**
 * FollowerAreaChart — 팔로워 추이 area 차트
 *
 * 변경 사유 (cold-review 2026-05-15):
 *   "팔로워 수, 팔로워 추이를 보면 바 그래프로 되어있는데, 어떤 상황에서 라인/바를 쓰시는지" 피드백.
 *   팔로워 수는 *시점별 누적 절대값* — bar로 그리면 매일이 독립 카운트라는 의미가 됨 (오해).
 *   line + area fill 이 추세와 누적 성장을 함께 보여주는 정석.
 *
 * 디자인:
 *   - line: brand-green-text (#527E18) 2px
 *   - area: brand-green gradient (위 35% → 아래 0)
 *   - Y축: minVal·midVal·maxVal 3구간 라벨 (0에서 시작 X — base 24000에서 변동 100 단위 가시화)
 *   - X축: showLabel 정책 (>14 데이터 시 sparse)
 *   - max point: 진한 dot + 값 라벨
 *   - null 구간: 세로 점선 표시
 *   - hover/touch: activeIndex 갱신 → ChartScrollContainer tooltip 표시
 */

import { memo } from 'react'
import { fmtNumber, useChartScrollContext, shouldShowLabel } from '@wellink/ui'
import type { BarDataItem } from '../../../data/analytics/profile'

interface Props {
  data: BarDataItem[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}

const BASE_W = 620
const H = 180
const padT = 30
const padB = 30
const padL = 48
const padR = 24

const FollowerAreaChart = memo(function FollowerAreaChart({ data, activeIndex, onActiveIndex, isTouch }: Props) {
  // MixedChart와 동일 패턴: ChartScrollContext에서 컨테이너 측정 폭 수신 → fluid 반응형
  const ctx = useChartScrollContext()
  const W = Math.max(BASE_W, ctx?.measuredW ?? BASE_W)
  const minWidth = Math.max(BASE_W, data.length * 22)
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const nonNull = data.filter(d => d.value !== null).map(d => d.value as number)
  const maxVal = nonNull.length > 0 ? Math.max(...nonNull) : 1
  const minVal = nonNull.length > 0 ? Math.min(...nonNull) : 0
  // Y축 baseline: 팔로워 수처럼 base가 큰 누적 메트릭은 0 기준이면 변동이 안 보임.
  // 5% 여유로 minVal-여유 ~ maxVal+여유 범위로 스케일링.
  const yPad = Math.max((maxVal - minVal) * 0.15, maxVal * 0.005)
  const yMin = Math.max(0, minVal - yPad)
  const yMax = maxVal + yPad
  const yRange = yMax - yMin || 1

  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = padL + i * stepX
    if (d.value === null) return null
    const y = padT + plotH - ((d.value - yMin) / yRange) * plotH
    return { x, y, value: d.value, label: d.label, idx: i }
  })

  const validPoints = points.filter((p): p is NonNullable<typeof p> => p !== null)

  const linePath = validPoints.length > 0
    ? validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''
  const areaPath = validPoints.length > 0
    ? `${linePath} L ${validPoints[validPoints.length - 1].x} ${padT + plotH} L ${validPoints[0].x} ${padT + plotH} Z`
    : ''

  const maxIdx = (() => {
    let mi = -1; let mv = -Infinity
    data.forEach((d, i) => { if (d.value !== null && d.value > mv) { mv = d.value; mi = i } })
    return mi
  })()
  const maxPoint = validPoints.find(p => p.idx === maxIdx)

  const idxAt = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(data.length - 1, Math.round(((clientX - rect.left) / rect.width * W - padL) / stepX)))

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      style={{ minWidth }}
      role="img"
      aria-label="팔로워 추이 차트"
      onMouseMove={!isTouch ? (e) => onActiveIndex?.(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onMouseLeave={!isTouch ? () => onActiveIndex?.(null) : undefined}
      onClick={!isTouch ? (e) => onActiveIndex?.(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchStart={isTouch ? (e) => onActiveIndex?.(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); onActiveIndex?.(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) } : undefined}
    >
      <defs>
        <linearGradient id="follower-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#95D135" stopOpacity={0.42} />
          <stop offset="100%" stopColor="#95D135" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* 그리드 — 0, mid, max */}
      {[0, 0.5, 1].map(r => {
        const y = padT + plotH * (1 - r)
        return <line key={`grid-${r}`} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}

      {/* Y축 라벨 (3단) — 범위 좁을 때 소수점 2자리 만 단위로 구분 */}
      {[0, 0.5, 1].map(r => {
        const y = padT + plotH * (1 - r)
        const val = yMin + yRange * r
        const label = yRange < 5000 && val >= 10000
          ? `${(val / 10000).toFixed(2)}만`
          : fmtNumber(Math.round(val))
        return (
          <text
            key={`y-${r}`}
            x={padL - 8}
            y={y + 4}
            textAnchor="end"
            fontSize="11"
            fill="#9ca3af"
            fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
            className="tabular-nums"
          >
            {label}
          </text>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#follower-area-grad)" />

      {/* Null 구간 — 세로 점선 */}
      {data.map((d, i) => {
        if (d.value !== null) return null
        const x = padL + i * stepX
        return (
          <line key={`null-${i}`} x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#d1d5db" strokeDasharray="3 2" strokeWidth={1} />
        )
      })}

      {/* Line stroke */}
      <path d={linePath} fill="none" stroke="#527E18" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* X축 라벨 — 공통 shouldShowLabel 유틸 */}
      {data.map((d, i) => {
        if (!shouldShowLabel(i, data.length, d)) return null
        const x = padL + i * stepX
        const isMax = i === maxIdx
        const isActive = i === activeIndex && !isMax
        return (
          <text
            key={`x-${i}`}
            x={x}
            y={H - 10}
            textAnchor="middle"
            fontSize="11"
            fill={isMax ? '#527E18' : (isActive ? '#374151' : '#9ca3af')}
            fontWeight={isMax ? 600 : 400}
            fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
          >
            {d.label}
          </text>
        )
      })}

      {/* Max point 강조 + 값 라벨 */}
      {maxPoint && (
        <g>
          <circle cx={maxPoint.x} cy={maxPoint.y} r={5} fill="#fff" stroke="#527E18" strokeWidth={2.5} />
          <text
            x={maxPoint.x}
            y={maxPoint.y - 12}
            textAnchor="middle"
            fontSize="12"
            fill="#527E18"
            fontWeight={700}
            fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
            className="tabular-nums"
          >
            {fmtNumber(maxPoint.value)}
          </text>
        </g>
      )}

      {/* Active index 표시 — hover/touch */}
      {activeIndex !== null && activeIndex !== undefined && (() => {
        const p = validPoints.find(p => p.idx === activeIndex)
        if (!p) return null
        return (
          <g>
            <line x1={p.x} y1={padT} x2={p.x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={p.x} cy={p.y} r={4} fill="#527E18" stroke="#fff" strokeWidth={2} />
          </g>
        )
      })()}
    </svg>
  )
})

export default FollowerAreaChart
