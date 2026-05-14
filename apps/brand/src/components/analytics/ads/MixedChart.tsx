/**
 * MixedChart — 광고 성과 일별 지출(막대) + 클릭(라인) 차트
 *
 * 원본 MixedBarLineChart 동등. SVG 인라인.
 * 차트 인터랙션 정책: PC=hover+click / 모바일=tap+drag (CLAUDE.md § 차트 인터랙션)
 *
 * 좌표계 — effective padL 방식:
 *  - barW: 막대 너비. 데이터 포인트 중심점 = padL + i*stepX.
 *  - padL/padR은 *데이터 포인트 영역의 시작/끝*. 즉 padL = (Y축 라벨 영역 + barW/2).
 *  - 첫 막대 시작 = padL - barW/2 = labelArea (Y축 라벨 영역 끝, 막대가 Y축 라벨을 침범 안 함)
 *  - 마지막 막대 끝 = (W - padR) + barW/2 (대칭, 우측 라벨 영역 침범 안 함)
 *  - ChartScrollContainer prop padL/pR과 정확히 동일하게 사용 → 툴팁 좌표 일치
 */

import { memo } from 'react'
import { useChartScrollContext } from '@wellink/ui'

interface Props {
  data: { date: string; spend: number; clicks: number; ctr?: number }[]
  activeIndex: number | null
  onActiveIndex: (i: number | null) => void
  isTouch: boolean
  /** 우상단 단위 라벨 (기본 "클릭") — 대시보드 v2에서 "ROAS" 등으로 재사용 */
  secondaryLabel?: string
  /** Y축 우측 라벨 포매터 (기본 toLocaleString) */
  secondaryFormatter?: (v: number) => string
  /** 보조 축 기준선 (우축 단위 기준, 점선) — 예: ROAS 1.0x 손익분기 */
  referenceLine?: { value: number; label?: string }
  /** 우측 라인 색 (기본 orange-500) */
  secondaryColor?: string
}

const MixedChart = memo(function MixedChart({
  data, activeIndex, onActiveIndex, isTouch,
  secondaryLabel = '클릭',
  secondaryFormatter,
  referenceLine,
  secondaryColor = '#f97316',
}: Props) {
  // 부모 ChartScrollContainer의 측정 width → fluid viewBox. 컨텍스트 없으면 default.
  const ctx = useChartScrollContext()
  const W = ctx?.measuredW ?? 700
  const H = 240, padT = 32, padB = 36
  // padL/padR — 데이터 포인트 중심점. Y축 라벨 안전 영역(70) + 최대 BAR_W/2(60) = 130
  const padL = 130
  const padR = 130
  const plotW = W - padL - padR, plotH = H - padT - padB
  const maxSpend = Math.max(1, ...data.map(d => d.spend))
  const maxClicks = Math.max(1, ...data.map(d => d.clicks))
  const stepX = plotW / Math.max(data.length - 1, 1)
  // 막대 너비 — stepX의 65%로 반응형, 16~100px 범위 clamp (W 커질수록 막대 ↑)
  const BAR_W = Math.max(16, Math.min(100, stepX * 0.65))
  const svgMinW = Math.max(700, data.length * 44)

  // X축 라벨 간격: data.length 기반
  const labelInterval = data.length > 20 ? 7 : data.length > 8 ? 3 : 1

  const idxAt = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(data.length - 1, Math.round(((clientX - rect.left) / rect.width * W - padL) / stepX)))

  // Y축 라벨 X 좌표 — BAR_W 무관 고정 (SVG 좌측 경계 10px 안쪽 + 라벨 폭 60 → 끝점 70)
  // (max BAR_W=100 시에도 padL-50=80 > 70이라 막대와 안 겹침)
  const yLabelLeftX  = 70
  const yLabelRightX = W - 70

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="[&_*]:pointer-events-none"
      role="img"
      aria-label="기간별 광고 지출(막대)과 클릭 수(선) 추이 차트"
      style={{ touchAction: isTouch ? 'pan-y' : 'auto', minWidth: svgMinW, height: H }}
      onMouseMove={!isTouch ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      /* PC hover 떠나도 activeIndex 유지 — 항상 1개 노출 정책 */
      onClick={!isTouch ? (e) => onActiveIndex(idxAt(e.clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchStart={isTouch ? (e) => onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) : undefined}
      onTouchMove={isTouch ? (e) => { e.preventDefault(); onActiveIndex(idxAt(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) } : undefined}
    >
      {/* 그리드 — plot 영역 내부만 */}
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + plotH - r * plotH
        return <line key={r} x1={padL - BAR_W / 2} y1={y} x2={(W - padR) + BAR_W / 2} y2={y} stroke="#f3f4f6" strokeWidth={1} />
      })}
      {/* 좌축 (지출) — Y축 숫자값: X축과 동일 spec (#6b7280, 9pt, regular) */}
      {[0, 0.5, 1].map(r => (
        <text key={r} x={yLabelLeftX} y={padT + plotH - r * plotH + 4} textAnchor="end" fontSize={14} fill="#6b7280">
          {Math.round(r * maxSpend / 1000).toLocaleString()}k
        </text>
      ))}
      {/* 우축 (보조) — Y축 숫자값: 포매터로 단위 적용 */}
      {[0, 0.5, 1].map(r => {
        const val = r * maxClicks
        const text = secondaryFormatter ? secondaryFormatter(val) : Math.round(val).toLocaleString()
        return (
          <text key={r} x={yLabelRightX} y={padT + plotH - r * plotH + 4} textAnchor="start" fontSize={14} fill="#6b7280">
            {text}
          </text>
        )
      })}
      {/* 축 단위 안내 — 컬러 유지 (어느 축이 어느 데이터인지 식별), 폰트는 X축과 동일 사이즈 */}
      <text x={yLabelLeftX} y={padT - 10} textAnchor="end" fontSize={14} fill="#8b5cf6">지출 (원)</text>
      <text x={yLabelRightX} y={padT - 10} textAnchor="start" fontSize={14} fill={secondaryColor}>{secondaryLabel}</text>

      {/* 기준선 (referenceLine) — 우축 값 기준 점선 + 우측 라벨 */}
      {referenceLine && referenceLine.value > 0 && referenceLine.value <= maxClicks && (() => {
        const refY = padT + plotH - (referenceLine.value / maxClicks) * plotH
        return (
          <g key="ref-line" aria-hidden="true">
            <line
              x1={padL - BAR_W / 2}
              y1={refY}
              x2={(W - padR) + BAR_W / 2}
              y2={refY}
              stroke={secondaryColor}
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.6}
            />
            {referenceLine.label && (
              <text
                x={(W - padR) + BAR_W / 2 + 4}
                y={refY + 3}
                fontSize={12}
                fill={secondaryColor}
                textAnchor="start"
                opacity={0.85}
              >
                {referenceLine.label}
              </text>
            )}
          </g>
        )
      })()}
      {/* 막대 (지출) — 색 진하게 (opacity 1) */}
      {data.map((d, i) => {
        const x = padL + i * stepX - BAR_W / 2
        const h = (d.spend / maxSpend) * plotH
        return <rect key={i} x={x} y={padT + plotH - h} width={BAR_W} height={h} rx={2} fill="#8b5cf6" />
      })}
      {/* 라인 (보조) — 보색으로 막대와 대비 강화 */}
      <path
        d={data.map((d, i) => {
          const x = padL + i * stepX
          const y = padT + plotH - (d.clicks / maxClicks) * plotH
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
        }).join(' ')}
        fill="none"
        stroke={secondaryColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = padL + i * stepX
        const y = padT + plotH - (d.clicks / maxClicks) * plotH
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill={secondaryColor} />
            <circle cx={x} cy={y} r={1.2} fill="white" />
          </g>
        )
      })}
      {/* X축 라벨 — data.length 기반 간격 */}
      {data.map((d, i) => {
        if (i % labelInterval !== 0 && i !== data.length - 1) return null
        const x = padL + i * stepX
        return <text key={i} x={x} y={padT + plotH + 18} textAnchor="middle" fontSize={14} fill="#6b7280">{d.date}</text>
      })}
      {/* 인터랙티브 crosshair + 활성 도트 — 툴팁은 HTML 오버레이로 처리 */}
      {activeIndex !== null && (() => {
        const d = data[activeIndex]
        if (!d) return null
        const x = padL + activeIndex * stepX
        const spendY = padT + plotH - (d.spend / maxSpend) * plotH
        const clicksY = padT + plotH - (d.clicks / maxClicks) * plotH
        return (
          <g key="active-indicator">
            <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <circle cx={x} cy={spendY} r={4} fill="#8b5cf6" stroke="white" strokeWidth={1.5} />
            <circle cx={x} cy={clicksY} r={4} fill={secondaryColor} stroke="white" strokeWidth={1.5} />
          </g>
        )
      })()}
    </svg>
  )
})

export default MixedChart
