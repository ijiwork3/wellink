/**
 * KPICard — 지표 요약 카드
 * trend 값: 양수 = 상승(초록), 음수 = 하락(빨강)
 * tooltip: hover 시 지표 설명 표시
 */

import { useState } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  sub?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  /** 값 텍스트에 적용할 커스텀 색상 클래스 (예: 'text-blue-600') */
  valueColor?: string
  /** hover 시 표시되는 지표 설명 */
  tooltip?: string
}

export default function KPICard({ title, value, sub, trend, trendLabel, icon, valueColor, tooltip }: KPICardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">{title}</span>
          {tooltip && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <Info size={12} />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] rounded-lg whitespace-nowrap z-10 shadow-lg">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          )}
        </div>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div>
        <div className={`text-2xl font-bold ${valueColor || 'text-gray-900'}`}>{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>{isPositive ? '+' : ''}{trend}%</span>
          {trendLabel && <span className="text-gray-400 font-normal">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}
