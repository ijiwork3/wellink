/**
 * DonutChartSimple — 도달 출처·참여 출처 도넛 차트
 *
 * AdPerformance에서 사용. 누적값을 immutable scan으로 계산 (react-hooks/immutability 준수).
 */

import { memo } from 'react'
import { fmtNumber } from '@wellink/ui'

interface Props {
  data: { label: string; value: number; color: string }[]
  ariaLabel?: string
}

const DonutChartSimple = memo(function DonutChartSimple({ data, ariaLabel }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <p className="text-base text-gray-500 text-center py-12">데이터가 없습니다.</p>
  const cx = 90, cy = 90, r = 70, ir = 50
  // 누적값 계산 — reduce로 mutation 없이 [acc0, acc1, ...] 생성
  const cumulative = data.reduce<number[]>((arr, d) => [...arr, (arr[arr.length - 1] ?? 0) + d.value], [])
  const arcs = data.map((d, i) => {
    const startAcc = i === 0 ? 0 : cumulative[i - 1]
    const endAcc = cumulative[i]
    const start = (startAcc / total) * Math.PI * 2 - Math.PI / 2
    const end = (endAcc / total) * Math.PI * 2 - Math.PI / 2
    const large = end - start > Math.PI ? 1 : 0
    const sx = cx + r * Math.cos(start), sy = cy + r * Math.sin(start)
    const ex = cx + r * Math.cos(end), ey = cy + r * Math.sin(end)
    const isx = cx + ir * Math.cos(end), isy = cy + ir * Math.sin(end)
    const iex = cx + ir * Math.cos(start), iey = cy + ir * Math.sin(start)
    return {
      ...d,
      pct: ((d.value / total) * 100).toFixed(1),
      d: `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${ir} ${ir} 0 ${large} 0 ${iex} ${iey} Z`,
    }
  })
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg className="w-36 h-36 @sm:w-44 @sm:h-44 shrink-0" viewBox="0 0 180 180" role="img" aria-label={ariaLabel ?? '도넛 차트'}>
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      </svg>
      <div className="flex-1 min-w-[120px] space-y-2">
        {arcs.map(a => (
          <div key={a.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: a.color }} />
              <span className="text-sm text-gray-700 whitespace-nowrap">{a.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">{fmtNumber(a.value)}</span>
              <span className="text-sm text-gray-500 ml-1">({a.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

export default DonutChartSimple
