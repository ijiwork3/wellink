/**
 * GradeDonut — 바이럴 콘텐츠 등급 분포 도넛 차트
 *
 * 원본 DonutChart 동등. 누적값은 immutable reduce 스캔.
 * 클라 피드백: hover 시 활성 segment 강조 + 툴팁 노출 (라벨/값/퍼센트)
 */

import { memo, useRef, useState } from 'react'
import type { ViralContent, ContentGrade } from '../../../data/analytics/viral'

const GradeDonut = memo(function GradeDonut({ data }: { data: ViralContent[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null)

  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, processing: 0 } as Record<ContentGrade, number>
  for (const c of data) counts[c.grade] = (counts[c.grade] ?? 0) + 1
  const arr = [
    { label: 'A 우수', value: counts.A, color: '#95D135' },
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

  const arcsWithPct = arr.map(a => ({ ...a, pct: ((a.value / total) * 100).toFixed(1) }))

  const handleMove = (idx: number, clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ idx, x: clientX - rect.left, y: clientY - rect.top })
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-4 flex-wrap">
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
          return (
            <path
              key={a.label}
              d={d}
              fill={a.color}
              className="cursor-pointer transition-opacity"
              style={{ opacity: hover && hover.idx !== i ? 0.4 : 1 }}
              onMouseMove={(e) => handleMove(i, e.clientX, e.clientY)}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
      </svg>
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-10 gap-y-1.5">
        {arcsWithPct.map((a, i) => (
          <div
            key={a.label}
            className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer"
            onMouseEnter={(e) => handleMove(i, e.clientX, e.clientY)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} aria-hidden="true" />
            {/* 라벨 폭 고정 — 가장 긴 "산정중"·"A 우수" 기준으로 값 시작 X 정렬 (44px) */}
            <span className="text-gray-700" style={{ minWidth: 44 }}>{a.label}</span>
            <span className="font-semibold text-gray-900 tabular-nums">{a.value}</span>
          </div>
        ))}
      </div>

      {/* 호버 툴팁 — 마우스 좌표 따라감 */}
      {hover && (
        <div
          className="absolute z-20 pointer-events-none bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2"
          style={{ left: hover.x + 14, top: hover.y - 12 }}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap mb-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: arcsWithPct[hover.idx].color }} aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">{arcsWithPct[hover.idx].label}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">
            {arcsWithPct[hover.idx].value}건
            <span className="text-sm text-gray-500 font-normal ml-1">({arcsWithPct[hover.idx].pct}%)</span>
          </p>
        </div>
      )}
    </div>
  )
})

export default GradeDonut
