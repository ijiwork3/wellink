/**
 * FollowerBarChart — 팔로워 추이 바 차트
 *
 * 클라 피드백:
 *  - 각 막대 위에 *데이터 레이블* (값) 디폴트 inline 표시 (호버 없이도 항상)
 *  - 진한 녹색 막대 = *최대값 인덱스* (activeIndex 아님) — 가장 높은 값이 자동 강조
 *  - 데이터 레이블 색: brand-green-text (막대 녹색과 통일 톤, 디자인 시스템 정합)
 *  - 데이터 밀도 ≤14: 모든 막대에 라벨, >14: showLabel 간격 정책 (X축 라벨 동기)
 */

import { memo } from 'react'
import { fmtNumber } from '@wellink/ui'
import type { BarDataItem } from '../../../data/analytics/profile'

interface Props {
  data: BarDataItem[]
  /** hover/click 시 활성 인덱스 — X축 라벨 강조 정도에만 사용 (막대 색은 maxIdx 기준) */
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}

const FollowerBarChart = memo(function FollowerBarChart({ data, activeIndex, onActiveIndex, isTouch }: Props) {
  const nonNullVals = data.filter(m => m.value !== null).map(m => m.value as number)
  const maxVal = Math.max(...nonNullVals, 1)
  const isDense = data.length > 14
  const BAR_AREA_PX = 112

  // 최대값 인덱스 — 진한 녹색 막대 강조 대상 (null 제외)
  const maxIdx = (() => {
    let mi = -1
    let mv = -Infinity
    data.forEach((m, i) => {
      if (m.value !== null && m.value > mv) { mv = m.value; mi = i }
    })
    return mi
  })()

  // 가로 스크롤 발생 최소 너비: 바당 최소 20px (일간 30개 = 600px → 모바일에서 스크롤)
  const barMinW = Math.max(240, data.length * 20)

  // Y축 라벨 — 0 / 중간 / 최대값 (좌측 고정 width)
  const Y_LABEL_W = 44

  return (
    <div className="flex gap-2" style={{ minWidth: barMinW + Y_LABEL_W }} role="img" aria-label="팔로워 추이 차트">
      {/* Y축 라벨 — 좌측 고정 영역 */}
      <div className="shrink-0 flex flex-col justify-between text-sm text-gray-500 tabular-nums" style={{ width: Y_LABEL_W, height: BAR_AREA_PX + 30, paddingTop: 30 }}>
        <span className="text-right leading-none">{fmtNumber(maxVal)}</span>
        <span className="text-right leading-none">{fmtNumber(Math.round(maxVal / 2))}</span>
        <span className="text-right leading-none">0</span>
      </div>
      {/* 차트 본문 */}
      <div className="flex-1 space-y-1 min-w-0">
      {/* 각 막대 위 데이터 레이블 디폴트 inline 표시 — 최대값 막대만 진한 녹색 */}
      <div className="flex items-end" style={{ height: BAR_AREA_PX + 30, gap: isDense ? '2px' : '8px' }}>
        {data.map(({ label, value, showLabel }, idx) => {
          const isNull = value === null
          const barH = isNull ? 8 : Math.max(4, Math.round((value / maxVal) * BAR_AREA_PX))
          const isMax = idx === maxIdx
          // 밀도에 따라 데이터 레이블 표시 여부 — X축 라벨 간격 정책 동기화
          const showInlineLabel = !isNull && (isDense ? (showLabel ?? false) : true)
          return (
            <div
              key={label}
              className="flex-1 flex flex-col items-center min-w-0 justify-end cursor-pointer relative"
              style={{ height: BAR_AREA_PX + 30 }}
              onMouseEnter={!isTouch && !isNull ? () => onActiveIndex?.(idx) : undefined}
              onClick={isTouch && !isNull ? () => onActiveIndex?.(idx) : undefined}
            >
              {showInlineLabel && (
                <span
                  className={`block text-sm font-semibold tabular-nums mb-1 whitespace-nowrap pointer-events-none text-brand-green-text`}
                >
                  {fmtNumber(value as number)}
                </span>
              )}
              <div
                className={`w-full rounded-t-sm transition-[height] duration-300 ${isNull ? 'bg-gray-100 border border-dashed border-gray-300' : isMax ? 'bg-brand-green' : 'bg-brand-green-border'}`}
                style={{ height: barH }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex" style={{ gap: isDense ? '2px' : '8px' }}>
        {data.map(({ label, value, showLabel }, idx) => {
          const isNull = value === null
          const doShow = isDense ? (showLabel ?? false) : true
          const isMax = idx === maxIdx
          const isActive = activeIndex === idx && !isMax
          // X축 라벨: 최대값 인덱스 = brand-green-text 강조, 활성 hover = gray-700, 일반 = gray-500
          const labelColor = isNull
            ? 'text-gray-400'
            : isMax
              ? 'text-brand-green-text font-medium'
              : isActive
                ? 'text-gray-700'
                : 'text-gray-500'
          return (
            <div key={label} className="flex-1 min-w-0 text-center" style={{ visibility: doShow ? 'visible' : 'hidden' }}>
              <span className={`text-sm truncate block ${labelColor}`}>{label}</span>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
})

export default FollowerBarChart
