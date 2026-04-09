import { useState } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  sub?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  valueColor?: string
  tooltip?: string
}

export default function KPICard({ title, value, sub, trend, trendLabel, icon, valueColor, tooltip }: KPICardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-2.5 hover:border-gray-200 transition-colors duration-150">
      {/* 제목 + 아이콘 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {icon && (
            <span className="text-gray-400 mr-0.5">{icon}</span>
          )}
          <span className="text-xs text-gray-500">{title}</span>
          {tooltip && (
            <div className="relative ml-0.5">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-gray-300 hover:text-gray-400 transition-colors"
              >
                <Info size={11} />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-gray-800 text-white text-[11px] rounded-lg whitespace-nowrap z-10 shadow-lg">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-800" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 값 */}
      <div>
        <div className={`text-2xl font-bold tracking-tight ${valueColor || 'text-gray-900'}`}>{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>

      {/* 트렌드 */}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-[#5a8a1f]' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{isPositive ? '+' : ''}{trend}%</span>
          {trendLabel && <span className="text-gray-400 font-normal ml-0.5">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}
