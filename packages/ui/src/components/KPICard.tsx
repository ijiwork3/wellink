/**
 * KPICard — 핵심 지표 카드 v2 (대시보드 재설계, 2026-05-14)
 *
 * 디자인 원칙 (KPI dashboard best practice 2026):
 *  - 40-30-20-10 공간 룰: 값 40% / 라벨·trend 30% / 시각(sparkline) 30%
 *  - Semantic 3단계 색상: Green (good ≥+5%) / Amber (neutral) / Rose (bad ≤-3%)
 *  - 가로 분할: 데스크탑 sm+ = 좌 텍스트 + 우 큰 sparkline / 모바일 = 세로 풀폭
 *  - prefers-reduced-motion 가드는 Sparkline 내부 처리
 *
 * Props:
 *  - sparklineVariant: line / bar / area (데이터 특성 차별화)
 *  - sparklineReference: 비교 기준선 (예: ROAS 1.0x 손익분기)
 *  - tonedBackground: trend 방향 기반 카드 톤 배경
 *  - positive=false: 낮을수록 좋은 지표 (비용 등 색 반전)
 */

import { memo } from 'react'
import { TrendingUp, TrendingDown, Info, Minus } from 'lucide-react'
import Tooltip from './Tooltip'
import Sparkline from './Sparkline'
import { useIsTouchDevice } from '../utils/useIsTouchDevice'

interface KPICardProps {
  title: string
  value: string | number
  sub?: string
  trend?: number
  trendLabel?: string
  trendUnit?: string
  icon?: React.ReactNode
  valueColor?: string
  tooltip?: string
  positive?: boolean
  sparkline?: number[]
  sparklineVariant?: 'line' | 'bar' | 'area'
  sparklineReference?: number
  tonedBackground?: boolean
}

type Severity = 'good' | 'neutral' | 'bad'

/**
 * trend → 의미 단계 변환
 *
 * 규칙 (단순 명료):
 *  - trend > 0 & positive=true(기본)  → good (오른 게 좋음 → 초록)
 *  - trend < 0 & positive=true        → bad  (내린 게 나쁨 → 빨강)
 *  - trend < 0 & positive=false       → good (내린 게 좋음 → 초록, 비용성 지표)
 *  - trend > 0 & positive=false       → bad  (오른 게 나쁨 → 빨강, 비용 증가)
 *  - trend = 0 또는 undefined         → neutral (회색)
 *
 * → amber 중간 단계 제거. magnitude 임계값 사용 X. 사용자 멘탈 모델 = "방향만 본다."
 */
function severityFromTrend(trend: number | undefined, positive: boolean | undefined): Severity {
  if (trend === undefined || trend === 0) return 'neutral'
  const goodDirection = positive === false ? trend < 0 : trend > 0
  return goodDirection ? 'good' : 'bad'
}

const SEVERITY_BG: Record<Severity, string> = {
  good:    'bg-brand-green-bg/40 border-brand-green-border',
  neutral: 'bg-gray-50 border-gray-100',
  bad:     'bg-amber-50/70 border-amber-200',  // 노란색 (사용자 정책)
}

const SEVERITY_TEXT: Record<Severity, string> = {
  good:    'text-brand-green-text',
  neutral: 'text-gray-500',
  bad:     'text-amber-700',
}

const SEVERITY_STROKE: Record<Severity, string> = {
  good:    '#527F1B',  // brand-green-text
  neutral: '#9ca3af',  // gray-400
  bad:     '#B45309',  // amber-700
}

const KPICard = memo(function KPICard({
  title, value, sub, trend, trendLabel, trendUnit, icon, valueColor, tooltip, positive,
  sparkline, sparklineVariant = 'line', sparklineReference, tonedBackground,
}: KPICardProps) {
  const isPositive = trend !== undefined && trend > 0
  const isZero = trend === 0
  const severity = severityFromTrend(trend, positive)
  const isTouch = useIsTouchDevice()

  const tonedBg = tonedBackground && trend !== undefined ? SEVERITY_BG[severity] : 'bg-white border-gray-100'
  const trendColor = trend === undefined ? 'text-gray-500' : SEVERITY_TEXT[severity]
  const sparkStroke = trend === undefined ? '#9ca3af' : SEVERITY_STROKE[severity]

  const ariaLabel = trend !== undefined
    ? `${title} ${value}, ${trendLabel ?? ''} ${isZero ? '변동 없음' : isPositive ? '증가' : '감소'} ${Math.abs(trend)}${trendUnit ?? '%'}`
    : `${title} ${value}`

  const TrendIconCmp = isZero ? Minus : isPositive ? TrendingUp : TrendingDown

  const hasSpark = sparkline && sparkline.length >= 2

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-colors duration-150 hover:border-gray-300 ${tonedBg}`}
      role="group"
      aria-label={ariaLabel}
    >
      {/* 카드 본체 — 모바일 세로, sm+ 가로 분할. 카드 min-height로 sparkline 영역 풀 stretch */}
      <div className={`flex flex-col sm:flex-row gap-3 sm:gap-5 ${hasSpark ? 'sm:min-h-[112px]' : ''}`}>
        {/* 좌측 — 라벨 + 값 + trend (sm+ flex-1, content top-to-bottom 정렬) */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 라벨 */}
          <div className="flex items-center gap-1.5 min-w-0 mb-2.5">
            {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
            <span className="text-sm sm:text-base text-gray-600 whitespace-nowrap font-medium">{title}</span>
            {tooltip && !isTouch && (
              <Tooltip content={tooltip} side="top" multiline className="ml-0.5">
                <span aria-label="상세 정보" className="text-gray-300 hover:text-gray-400 transition-colors inline-flex">
                  <Info size={13} aria-hidden="true" />
                </span>
              </Tooltip>
            )}
          </div>

          {/* 값 — 큼직 (사용자 가독성 요구) */}
          <div className="min-w-0">
            <div className={`text-3xl sm:text-4xl font-bold tracking-tight whitespace-nowrap tabular-nums leading-tight ${valueColor || 'text-gray-900'}`}>
              {value}
            </div>
            {sub && <div className="text-sm text-gray-400 mt-1">{sub}</div>}
          </div>

          {/* trend — 카드 하단 */}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm sm:text-base font-semibold whitespace-nowrap mt-auto pt-2.5 ${trendColor}`}>
              <TrendIconCmp size={15} aria-hidden="true" />
              <span className="tabular-nums">
                {isPositive ? '+' : ''}{trend}{trendUnit ?? '%'}
              </span>
              {trendLabel && <span className="text-gray-400 font-normal ml-0.5">{trendLabel}</span>}
            </div>
          )}
        </div>

        {/* 우측 — sparkline. 데스크탑: w-1/2 + 카드 전체 height stretch. 모바일: h-16 풀폭 */}
        {hasSpark && (
          <div className="w-full sm:w-1/2 h-16 sm:h-auto sm:self-stretch -mx-1 sm:mx-0">
            <Sparkline
              data={sparkline!}
              stroke={sparkStroke}
              variant={sparklineVariant}
              referenceLine={sparklineReference}
              fill={sparklineVariant === 'line'}
              responsive
            />
          </div>
        )}
      </div>

      {/* 모바일/태블릿 hint inline */}
      {tooltip && isTouch && (
        <p className="text-sm text-gray-500 leading-snug border-t border-gray-100 pt-2 mt-3">{tooltip}</p>
      )}
    </div>
  )
})

export default KPICard
