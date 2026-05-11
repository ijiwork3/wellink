/**
 * GradeDonut — 바이럴 콘텐츠 등급 분포 도넛 차트
 * 원본 DonutChart 동등. 누적값은 immutable reduce 스캔.
 */

import { memo } from 'react'
import type { ViralContent, ContentGrade } from '../../../data/analytics/viral'

const GradeDonut = memo(function GradeDonut({ data }: { data: ViralContent[] }) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, processing: 0 } as Record<ContentGrade, number>
  for (const c of data) counts[c.grade] = (counts[c.grade] ?? 0) + 1
  const arr = [
    { label: 'A 우수', value: counts.A, color: '#9DD737' },
    { label: 'B', value: counts.B, color: '#f59e0b' },
    { label: 'C', value: counts.C, color: '#9ca3af' },
    { label: 'D', value: counts.D, color: '#d1d5db' },
    { label: 'E', value: counts.E, color: '#e5e7eb' },
    { label: '산정중', value: counts.processing, color: '#3b82f6' },
  ].filter(a => a.value > 0)
  const total = arr.reduce((s, a) => s + a.value, 0)
  if (total === 0) return <p className="text-base text-gray-500 text-center py-8">데이터가 없습니다.</p>
  const cx = 60, cy = 60, r = 50, ir = 32
  const cumulative = arr.reduce<number[]>((carry, a) => [...carry, (carry[carry.length - 1] ?? 0) + a.value], [])
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg viewBox="0 0 120 120" className="w-[120px] h-[120px] @sm:w-[140px] @sm:h-[140px] shrink-0" role="img" aria-label="콘텐츠 등급 분포 도넛 차트">
        {arr.map((a, i) => {
          const startAcc = i === 0 ? 0 : cumulative[i - 1]
          const endAcc = cumulative[i]
          const start = (startAcc / total) * Math.PI * 2 - Math.PI / 2
          const end = (endAcc / total) * Math.PI * 2 - Math.PI / 2
          const large = end - start > Math.PI ? 1 : 0
          const sx = cx + r * Math.cos(start), sy = cy + r * Math.sin(start)
          const ex = cx + r * Math.cos(end), ey = cy + r * Math.sin(end)
          const isx = cx + ir * Math.cos(end), isy = cy + ir * Math.sin(end)
          const iex = cx + ir * Math.cos(start), iey = cy + ir * Math.sin(start)
          const d = `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${ir} ${ir} 0 ${large} 0 ${iex} ${iey} Z`
          return <path key={a.label} d={d} fill={a.color} />
        })}
      </svg>
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-5 gap-y-1.5">
        {arr.map(a => (
          <div key={a.label} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
            <span className="text-gray-700 break-keep">{a.label}</span>
            <span className="font-semibold text-gray-900 tabular-nums whitespace-nowrap">{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

export default GradeDonut
