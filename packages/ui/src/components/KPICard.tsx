/**
 * KPICard — 핵심 지표 카드
 * - trend: 양수 = 상승(초록), 음수 = 하락(빨강)
 * - positive: false 시 하락이 좋은 지표 (비용·반려율 등) — 컬러 반전
 */

import { memo } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import Tooltip from './Tooltip'

interface KPICardProps {
  title: string
  value: string | number
  sub?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  valueColor?: string
  tooltip?: string
  positive?: boolean
}

const KPICard = memo(function KPICard({ title, value, sub, trend, trendLabel, icon, valueColor, tooltip, positive }: KPICardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const isGood = positive === false ? !isPositive : isPositive

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
            <Tooltip content={tooltip} side="top" multiline className="ml-0.5">
              <span aria-label="상세 정보" className="text-gray-300 hover:text-gray-400 transition-colors inline-flex">
                <Info size={11} aria-hidden="true" />
              </span>
            </Tooltip>
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
        <div className={`flex items-center gap-1 text-xs font-medium ${isGood ? 'text-brand-green-text' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
          <span>{isPositive ? '+' : ''}{trend}%</span>
          {trendLabel && <span className="text-gray-400 font-normal ml-0.5">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
})

export default KPICard
