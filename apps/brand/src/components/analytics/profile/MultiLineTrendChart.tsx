/**
 * MultiLineTrendChart — 멀티라인 추세 SVG 차트 (null 구간 점선 처리)
 * ProfileInsight 메인 컴포넌트에서 분리.
 */

import { memo } from 'react'
import { CHART_COLORS, useChartScrollContext } from '@wellink/ui'
import { metricColors, type TrendItem, type MetricKey } from '../../../data/analytics/profile'

interface Props {
  data: TrendItem[]
  activeMetrics: MetricKey[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}

const MultiLineTrendChart = memo(function MultiLineTrendChart({
  data,
  activeMetrics,
  activeIndex,
  onActiveIndex,
  isTouch,
}: Props) {
  const ctx = useChartScrollContext()
  const width = ctx?.measuredW ?? 580
  const height = 220
  const padX = 56
  const padY = 28

  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const metricRanges: Record<MetricKey, { min: number; max: number }> = {} as Record<MetricKey, { min: number; max: number }>
  ;(Object.keys(metricColors) as MetricKey[]).forEach(metric => {
    const vals = data.map(d => d[metric]).filter((v): v is number => v !== null)
    metricRanges[metric] = { min: Math.min(...vals, 0), max: Math.max(...vals, 1) }
  })

  const getPoints = (metric: MetricKey) => {
    const { min, max } = metricRanges[metric]
    const range = max - min || 1
    return data.map((d, i) => ({
      x: padX + (chartW / Math.max(1, data.length - 1)) * i,
      y: d[metric] !== null
        ? padY + chartH - ((d[metric] as number - min) / range) * chartH
        : null,
      value: d[metric],
    }))
  }

  const handlePointerAt = (clientX: number, rect: DOMRect) => {
    const ratio = (clientX - rect.left) / rect.width
    const svgX = ratio * width
    const relX = svgX - padX
    const stepX = chartW / Math.max(1, data.length - 1)
    const idx = Math.round(relX / stepX)
    onActiveIndex?.(Math.max(0, Math.min(data.length - 1, idx)))
  }

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="[&_*]:pointer-events-none"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: Math.max(580, data.length * 44), height }}
      role="img"
      aria-label="기간별 지표 추이 차트"
      onMouseMove={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      /* PC hover 떠나도 activeIndex 유지 — 항상 1개 노출 정책 */
      onClick={!isTouch ? (e) => handlePointerAt(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchStart={isTouch ? (e) => handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); handlePointerAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) } : undefined}
    >
      {/* 그리드 라인 */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padY + chartH - ratio * chartH
        return <line key={ratio} x1={padX} y1={y} x2={width - padX} y2={y} stroke={CHART_COLORS.grid} strokeWidth={1} />
      })}

      {/* Y축 라벨 — 단일 메트릭일 때만 표시 (X축과 동일 spec: axisLabel, 10pt, regular) */}
      {activeMetrics.length === 1 && (() => {
        const primary = activeMetrics[0]
        const { min, max } = metricRanges[primary]
        return [0, 0.5, 1].map(ratio => {
          const y = padY + chartH - ratio * chartH + 3
          const value = min + (max - min) * ratio
          return (
            <text key={ratio} x={padX - 6} y={y} textAnchor="end" fontSize="12" fill={CHART_COLORS.axisLabel}>
              {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value).toString()}
            </text>
          )
        })
      })()}

      {/* null 구간 배경 음영 */}
      {(() => {
        const nullIndices = data.map((d, i) =>
          Object.keys(metricColors).some(m => d[m as MetricKey] === null) ? i : -1
        ).filter(i => i >= 0)
        if (!nullIndices.length) return null
        // 연속 구간 그룹핑
        const groups: number[][] = []
        nullIndices.forEach(idx => {
          if (!groups.length || idx !== groups[groups.length - 1][groups[groups.length - 1].length - 1] + 1) {
            groups.push([idx])
          } else {
            groups[groups.length - 1].push(idx)
          }
        })
        return groups.map((group, gi) => {
          const xStart = padX + (chartW / Math.max(1, data.length - 1)) * group[0] - (group[0] === 0 ? 0 : chartW / (data.length - 1) / 2)
          const xEnd   = padX + (chartW / Math.max(1, data.length - 1)) * group[group.length - 1] + (group[group.length - 1] === data.length - 1 ? 0 : chartW / (data.length - 1) / 2)
          return (
            <rect
              key={gi}
              x={xStart}
              y={padY}
              width={Math.max(0, xEnd - xStart)}
              height={chartH}
              fill={CHART_COLORS.nullBg}
              rx={4}
            />
          )
        })
      })()}

      {/* null 구간 텍스트 — 첫 번째 null 그룹에만 */}
      {(() => {
        const nullCount = data.filter(d => d.likes === null).length
        if (!nullCount) return null
        const firstNullEnd = data.findIndex(d => d.likes !== null) - 1
        if (firstNullEnd < 0) return null
        const cx = padX + (chartW / Math.max(1, data.length - 1)) * (firstNullEnd / 2)
        return (
          <text x={cx} y={padY + chartH / 2 + 4} textAnchor="middle" fill={CHART_COLORS.nullText} fontSize="12">
            데이터 없음
          </text>
        )
      })()}

      {/* 각 지표 라인 — null 구간 건너뜀 */}
      {activeMetrics.map(metric => {
        const points = getPoints(metric)
        const color = metricColors[metric]
        const isDense = data.length > 14
        const dotR = isDense ? 2 : 3.5
        const dotInner = isDense ? 0.8 : 1.5

        const segments: { x: number; y: number; idx: number }[][] = []
        let current: { x: number; y: number; idx: number }[] = []
        points.forEach((p, idx) => {
          if (p.y !== null) {
            current.push({ x: p.x, y: p.y, idx })
          } else {
            if (current.length) { segments.push(current); current = [] }
          }
        })
        if (current.length) segments.push(current)

        return (
          <g key={metric}>
            {segments.map((seg, si) => {
              const linePath = seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
              return (
                <g key={si}>
                  <path d={linePath} fill="none" stroke={color} strokeWidth={isDense ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
                  {seg.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={dotR} fill={color} />
                      <circle cx={p.x} cy={p.y} r={dotInner} fill="white" />
                    </g>
                  ))}
                </g>
              )
            })}
          </g>
        )
      })}

      {/* 각 라인 우측 끝 — 최종값 라벨 (복수 메트릭일 때만, 색상별 / 겹침 자동 정렬) */}
      {activeMetrics.length > 1 && (() => {
        type EndLabel = { metric: MetricKey; x: number; y: number; color: string; text: string }
        const labels: EndLabel[] = []
        activeMetrics.forEach(metric => {
          const points = getPoints(metric)
          let lastIdx = -1
          for (let i = points.length - 1; i >= 0; i--) {
            if (points[i].y !== null) { lastIdx = i; break }
          }
          if (lastIdx < 0) return
          const p = points[lastIdx]
          const value = p.value as number
          labels.push({
            metric,
            x: p.x,
            y: p.y as number,
            color: metricColors[metric],
            text: value >= 1000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value).toString(),
          })
        })
        // 겹침 방지 — Y 기준 정렬 후 최소 간격 12px 보장 (위→아래)
        labels.sort((a, b) => a.y - b.y)
        const MIN_GAP = 12
        for (let i = 1; i < labels.length; i++) {
          if (labels[i].y - labels[i - 1].y < MIN_GAP) {
            labels[i].y = labels[i - 1].y + MIN_GAP
          }
        }
        // 하단 경계 초과 시 위로 밀어내기
        const maxY = padY + chartH
        for (let i = labels.length - 1; i >= 0; i--) {
          if (labels[i].y > maxY) labels[i].y = maxY
          if (i > 0 && labels[i].y - labels[i - 1].y < MIN_GAP) {
            labels[i - 1].y = labels[i].y - MIN_GAP
          }
        }
        return labels.map(l => (
          <text
            key={`endlabel-${l.metric}`}
            x={l.x + 6}
            y={l.y + 3}
            fontSize="12"
            fill={l.color}
            fontWeight="600"
            textAnchor="start"
          >
            {l.text}
          </text>
        ))
      })()}

      {/* x축 라벨 — showLabel 조건 적용, null은 회색 */}
      {data.map((d, i) => {
        const x = padX + (chartW / Math.max(1, data.length - 1)) * i
        const isNull = d.likes === null
        const isDense = data.length > 14
        const doShow = data.length > 20
          ? i % 7 === 0
          : isDense
            ? (d.showLabel ?? false)
            : true
        if (!doShow) return null
        return (
          <text key={i} x={x} y={height - 4} textAnchor="middle" fill={isNull ? CHART_COLORS.nullText : CHART_COLORS.axisLabel} fontSize="12">
            {d.label}
          </text>
        )
      })}

      {/* 인터랙티브 crosshair — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex != null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const stepX = chartW / Math.max(1, data.length - 1)
        const x = padX + activeIndex * stepX
        return (
          <g key="active">
            <line x1={x} y1={padY} x2={x} y2={padY + chartH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
          </g>
        )
      })()}
    </svg>
  )
})

export default MultiLineTrendChart
