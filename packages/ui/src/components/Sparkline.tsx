/**
 * Sparkline — KPI 카드 추이 시각화 (line / bar / area-strong variant)
 *
 * 진짜 반응형: ResizeObserver로 컨테이너 width 측정 → viewBox 1:1 매핑.
 * preserveAspectRatio 변형 X — 라인 기울기가 자연스럽게 유지됨.
 *
 * variant:
 *  - 'line' (기본): 부드러운 라인 + 끝점 강조 + 옵셔널 fill
 *  - 'bar': mini 막대 차트 — max 막대만 brand-green / 나머지 brand-green-border (시각 차별화)
 *  - 'area': 진한 면적 그라데이션 — 누적 성장 강조
 */
import { memo, useEffect, useRef, useState } from 'react'

interface SparklineProps {
  /** 데이터 포인트 배열 — 길이 < 2면 렌더 안 함 */
  data: number[]
  /** 라인/막대 색상 — 기본 brand-green-text (#527E18) */
  stroke?: string
  /** 옅은 톤 색 — bar variant 비활성 막대 (기본 brand-green-border) */
  mutedStroke?: string
  /** 너비 px (기본 60) — responsive=true 시 무시 (컨테이너 측정 width 사용) */
  width?: number
  /** 높이 px (기본 24) */
  height?: number
  /** 면적 채우기 — line/area 한정 (기본 false) */
  fill?: boolean
  /** 마지막 포인트 강조 점 — line 한정 (기본 true) */
  endDot?: boolean
  /** 진입 draw 애니메이션 (기본 true) */
  animate?: boolean
  /** 반응형 — 컨테이너 width를 측정해 viewBox 1:1 매핑 */
  responsive?: boolean
  /** 시각화 종류 — line / bar / area (기본 line) */
  variant?: 'line' | 'bar' | 'area'
  /** bar variant 강조 막대 결정 방식
   *  - 'max'  : 가장 높은 막대 (good 트렌드 — 최고점 강조)
   *  - 'min'  : 가장 낮은 막대 (bad 트렌드 — 현재 최저점 강조)
   *  - 'last' : 마지막 막대 (기본값)
   */
  highlightMode?: 'max' | 'min' | 'last'
  /** 기준선 — bar/area 시 y축 비교선 (예: 평균, 1.0x 등) */
  referenceLine?: number
  className?: string
}

const Sparkline = memo(function Sparkline({
  data,
  stroke = '#10b981',
  mutedStroke = '#6ee7b7',
  width = 60,
  height = 24,
  fill = false,
  endDot = true,
  animate = true,
  responsive = false,
  variant = 'line',
  highlightMode = 'last',
  referenceLine,
  className,
}: SparklineProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [measuredW, setMeasuredW] = useState(width)
  const [measuredH, setMeasuredH] = useState(height)

  useEffect(() => {
    if (!responsive || !wrapperRef.current) return
    const el = wrapperRef.current
    const update = () => {
      const w = Math.round(el.clientWidth || el.getBoundingClientRect().width)
      const h = Math.round(el.clientHeight || el.getBoundingClientRect().height)
      if (w > 0) setMeasuredW(w)
      if (h > 0) setMeasuredH(h)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [responsive])

  // responsive 시 wrapper 자체가 부모 width/height 100% fit (Tailwind h-XX 부모 컨테이너 기반)
  const wrapperStyle = responsive
    ? { width: '100%' as const, height: '100%' as const }
    : { width, height }

  if (!data || data.length < 2) {
    return <div ref={wrapperRef} className={className} style={wrapperStyle} />
  }

  const W = responsive ? measuredW : width
  const H = responsive ? measuredH : height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const rawRange = max - min
  // 좌·우 안전 영역 — 끝점 circle r=3.5 + 약간의 여유. line/area에서 끝점 잘림 방지
  const padX = 5
  const padY = 4
  const innerH = H - padY * 2
  const innerW = W - padX * 2
  // Y 패딩 — 위·아래 5%씩 (총 10%). 변동이 작아도 차트 끝에 닿지 않게.
  // 모든 값 동일 (range=0)이면 *카드 중앙*에 평탄선 (바닥 깔림 회피).
  const Y_PAD_RATIO = 0.1  // 10% (위 5 + 아래 5)
  const effMin = rawRange === 0 ? min - 1 : min - rawRange * (Y_PAD_RATIO / 2)
  const effRange = rawRange === 0 ? 2 : rawRange * (1 + Y_PAD_RATIO)
  const toY = (v: number) => rawRange === 0
    ? padY + innerH / 2
    : padY + innerH - ((v - effMin) / effRange) * innerH

  /* ── LINE / AREA ────────────────────────────────── */
  const stepX = innerW / (data.length - 1)
  const linePoints = data.map((v, i) => ({ x: padX + i * stepX, y: toY(v) }))
  const linePath = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L ${W - padX} ${H} L ${padX} ${H} Z`
  const lastPt = linePoints[linePoints.length - 1]

  /* ── BAR ────────────────────────────────────────── */
  const barSlot = innerW / data.length
  const barW = barSlot * 0.62
  const barOffset = padX + (barSlot - barW) / 2
  // bar 강조 인덱스 — highlightMode에 따라 결정
  const maxIdx = data.reduce((mi, v, i, a) => (v > a[mi] ? i : mi), 0)
  const minIdx = data.reduce((mi, v, i, a) => (v < a[mi] ? i : mi), 0)
  const highlightIdx =
    highlightMode === 'max' ? maxIdx :
    highlightMode === 'min' ? minIdx :
    data.length - 1  // 'last'
  const minBarH = 2  // 최소 가시 높이

  const svgInner = (() => {
    if (variant === 'bar') {
      return (
        <>
          {data.map((v, i) => {
            // 모든 값 동일 시 50% 높이 평탄 막대. 변동 있으면 5% 패딩 적용.
            const norm = rawRange === 0 ? 0.5 : (v - effMin) / effRange
            const h = Math.max(minBarH, norm * innerH)
            const x = barOffset + i * barSlot
            const y = padY + innerH - h
            const isHighlight = i === highlightIdx
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={1.5}
                fill={isHighlight ? stroke : mutedStroke}
                opacity={isHighlight ? 1 : 0.7}
              />
            )
          })}
          {referenceLine !== undefined && (
            <line
              x1={padX} y1={toY(referenceLine)} x2={W - padX} y2={toY(referenceLine)}
              stroke={stroke} strokeWidth={1} strokeDasharray="3 2" opacity={0.4}
            />
          )}
        </>
      )
    }

    if (variant === 'area') {
      return (
        <>
          <defs>
            <linearGradient id={`spark-area-${stroke.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#spark-area-${stroke.replace('#', '')})`} />
          <path
            d={linePath}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={animate ? drawAnim(W) : undefined}
          />
          {referenceLine !== undefined && (
            <line
              x1={padX} y1={toY(referenceLine)} x2={W - padX} y2={toY(referenceLine)}
              stroke={stroke} strokeWidth={1} strokeDasharray="3 2" opacity={0.5}
            />
          )}
        </>
      )
    }

    // line (default)
    return (
      <>
        {fill && <path d={areaPath} fill={stroke} fillOpacity={0.14} />}
        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={animate ? drawAnim(W) : undefined}
        />
        {referenceLine !== undefined && (
          <line
            x1={0} y1={toY(referenceLine)} x2={W} y2={toY(referenceLine)}
            stroke={stroke} strokeWidth={1} strokeDasharray="3 2" opacity={0.4}
          />
        )}
        {endDot && (
          <>
            <circle cx={lastPt.x} cy={lastPt.y} r={3} fill={stroke} />
            <circle cx={lastPt.x} cy={lastPt.y} r={1.4} fill="white" />
          </>
        )}
      </>
    )
  })()

  return (
    <div ref={wrapperRef} className={className} style={wrapperStyle}>
      {W > 0 && H > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ display: 'block' }}>
          {svgInner}
          <style>{`
            @keyframes sparkline-draw { to { stroke-dashoffset: 0; } }
            @media (prefers-reduced-motion: reduce) {
              path { animation-duration: 0s !important; stroke-dashoffset: 0 !important; }
            }
          `}</style>
        </svg>
      )}
    </div>
  )
})

function drawAnim(W: number): React.CSSProperties {
  return {
    strokeDasharray: W * 2,
    strokeDashoffset: W * 2,
    animation: 'sparkline-draw 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  }
}

export default Sparkline
