/**
 * GradeDonut — 바이럴 콘텐츠 등급 분포 도넛 차트
 *
 * 원본 DonutChart 동등. 누적값은 immutable reduce 스캔.
 * 클라 피드백: hover 시 활성 segment 강조 + 툴팁 노출 (라벨/값/퍼센트)
 */

import { memo, useRef, useState } from 'react'
import { GRADE_COLORS } from '@wellink/ui'
import type { ViralContent, ContentGrade } from '../../../data/analytics/viral'

const GradeDonut = memo(function GradeDonut({ data }: { data: ViralContent[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null)

  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, processing: 0 } as Record<ContentGrade, number>
  for (const c of data) counts[c.grade] = (counts[c.grade] ?? 0) + 1
  const arr = [
    { label: 'A 우수',  value: counts.A,          color: GRADE_COLORS.A },
    { label: 'B',       value: counts.B,          color: GRADE_COLORS.B },
    { label: 'C',       value: counts.C,          color: GRADE_COLORS.C },
    { label: 'D',       value: counts.D,          color: GRADE_COLORS.D },
    { label: 'E',       value: counts.E,          color: GRADE_COLORS.E },
    { label: '산정중',  value: counts.processing, color: GRADE_COLORS.processing },
  ].filter(a => a.value > 0)
  const total = arr.reduce((s, a) => s + a.value, 0)
  if (total === 0) return <p className="text-[15px] text-gray-500 text-center py-8">데이터가 없습니다.</p>
  const cx = 60, cy = 60, r = 50, ir = 32
  const cumulative = arr.reduce<number[]>((carry, a) => [...carry, (carry[carry.length - 1] ?? 0) + a.value], [])

  const arcsWithPct = arr.map(a => ({ ...a, pct: ((a.value / total) * 100).toFixed(1) }))

  const handleMove = (idx: number, clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ idx, x: clientX - rect.left, y: clientY - rect.top })
  }

  // 정렬 — 값 내림차순(주요 등급 위로)
  const sortedArcs = [...arcsWithPct].sort((a, b) => b.value - a.value)
  const maxVal = Math.max(...arcsWithPct.map(a => a.value), 1)

  return (
    <div ref={containerRef} className="relative flex items-center gap-5 flex-wrap">
      <div className="relative shrink-0">
        <svg viewBox="0 0 120 120" className="w-[120px] h-[120px] @sm:w-[140px] @sm:h-[140px]" role="img" aria-label="콘텐츠 등급 분포 도넛 차트">
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
        {/* 도넛 중앙 — 총합 + 라벨 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl @sm:text-2xl font-bold text-gray-900 tabular-nums leading-none">{total}</span>
          <span className="text-xs text-gray-500 mt-0.5">총 콘텐츠</span>
        </div>
      </div>

      {/* 단일 컬럼 리스트 + 미니 막대 (값 내림차순) */}
      <ul className="flex-1 min-w-[200px] flex flex-col gap-2">
        {sortedArcs.map((a) => {
          const realIdx = arcsWithPct.findIndex(x => x.label === a.label)
          return (
            <li
              key={a.label}
              className="grid grid-cols-[14px_64px_1fr_auto_44px] items-center gap-2.5 text-[15px] cursor-pointer hover:bg-gray-50/60 -mx-1 px-1 py-0.5 rounded transition-colors"
              onMouseEnter={(e) => handleMove(realIdx, e.clientX, e.clientY)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: a.color }} aria-hidden="true" />
              <span className="text-gray-600 whitespace-nowrap">{a.label}</span>
              {/* 미니 막대 — 최대값 대비 비율 */}
              <span className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <span className="block h-full rounded-full" style={{ width: `${(a.value / maxVal) * 100}%`, background: a.color }} aria-hidden="true" />
              </span>
              <span className="font-bold text-gray-900 tabular-nums text-right whitespace-nowrap">{a.value}</span>
              <span className="text-xs text-gray-400 tabular-nums text-right whitespace-nowrap">{a.pct}%</span>
            </li>
          )
        })}
      </ul>

      {/* 호버 툴팁 — 마우스 좌표 따라감 */}
      {hover && (
        <div
          className="absolute z-20 pointer-events-none bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2"
          style={{ left: hover.x + 14, top: hover.y - 12 }}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap mb-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: arcsWithPct[hover.idx].color }} aria-hidden="true" />
            <span className="text-[15px] font-medium text-gray-700">{arcsWithPct[hover.idx].label}</span>
          </div>
          <p className="text-[15px] font-semibold text-gray-900 tabular-nums whitespace-nowrap">
            {arcsWithPct[hover.idx].value}건
            <span className="text-[15px] text-gray-500 font-normal ml-1">({arcsWithPct[hover.idx].pct}%)</span>
          </p>
        </div>
      )}
    </div>
  )
})

export default GradeDonut
