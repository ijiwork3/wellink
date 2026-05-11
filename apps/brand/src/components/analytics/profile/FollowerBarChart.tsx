/**
 * FollowerBarChart — 팔로워 추이 바 차트
 * null = 회색 점선 바, 30개 이상은 라벨 간소화. ProfileInsight 메인 컴포넌트에서 분리.
 */

import { memo } from 'react'
import { fmtNumber } from '@wellink/ui'
import type { BarDataItem } from '../../../data/analytics/profile'

interface Props {
  data: BarDataItem[]
  activeIndex?: number | null
  onActiveIndex?: (i: number | null) => void
  isTouch?: boolean
}

const FollowerBarChart = memo(function FollowerBarChart({ data, activeIndex, onActiveIndex, isTouch }: Props) {
  const nonNullVals = data.filter(m => m.value !== null).map(m => m.value as number)
  const maxVal = Math.max(...nonNullVals, 1)
  const isDense = data.length > 14
  const BAR_AREA_PX = 112

  // 가로 스크롤 발생 최소 너비: 바당 최소 20px (일간 30개 = 600px → 모바일에서 스크롤)
  const barMinW = Math.max(240, data.length * 20)

  return (
    <div className="space-y-1" style={{ minWidth: barMinW }} role="img" aria-label="팔로워 추이 차트">
      {/* 선택된 막대 값 표시 */}
      <div className="h-5 mb-1">
        {activeIndex != null && data[activeIndex]?.value != null && (
          <span className="text-sm font-semibold text-brand-green-text">
            {fmtNumber(data[activeIndex].value as number)}
          </span>
        )}
      </div>
      <div className="flex items-end" style={{ height: BAR_AREA_PX, gap: isDense ? '2px' : '8px' }}>
        {data.map(({ label, value }, idx) => {
          const isNull = value === null
          const barH = isNull ? 8 : Math.max(4, Math.round((value / maxVal) * BAR_AREA_PX))
          const isActive = activeIndex === idx
          return (
            <div
              key={label}
              className="flex-1 flex flex-col items-center min-w-0 justify-end cursor-pointer"
              style={{ height: BAR_AREA_PX }}
              onMouseEnter={!isTouch && !isNull ? () => onActiveIndex?.(idx) : undefined}
              onMouseLeave={!isTouch ? () => onActiveIndex?.(null) : undefined}
              onClick={isTouch && !isNull ? () => onActiveIndex?.(idx) : undefined}
            >
              {!isDense && !isNull && !isActive && (
                <span className="text-sm mb-1 leading-none text-gray-500 font-medium">
                  {fmtNumber(value)}
                </span>
              )}
              <div
                className={`w-full rounded-t-sm transition-[height] duration-300 ${isNull ? 'bg-gray-100 border border-dashed border-gray-300' : isActive ? 'bg-brand-green' : 'bg-brand-green-border'}`}
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
          const isActive = activeIndex === idx
          return (
            <div key={label} className="flex-1 min-w-0 text-center" style={{ visibility: doShow ? 'visible' : 'hidden' }}>
              <span className={`text-xs truncate block ${isNull ? 'text-gray-400' : isActive ? 'text-brand-green-text font-medium' : 'text-gray-500'}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default FollowerBarChart
