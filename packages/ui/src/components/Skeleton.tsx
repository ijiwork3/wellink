/**
 * Skeleton — 로딩 플레이스홀더 통일
 *
 * 정책 (CLAUDE.md > "공통 빈/에러/로딩 상태 정책"):
 * - 색상: bg-gray-100 (배경) + animate-pulse (느린 깜빡)
 * - radius: rounded-md (텍스트 라인) / rounded-xl (카드) / rounded-full (아바타)
 * - SkeletonCard / SkeletonRow / SkeletonText 헬퍼 제공
 * - 너무 화려하면 안 됨 (실제 콘텐츠 가시성을 떨어뜨림)
 */

import { memo, type CSSProperties } from 'react'

type Shape = 'text' | 'card' | 'circle' | 'rect'

export interface SkeletonProps {
  shape?: Shape
  /** width — 픽셀 또는 Tailwind 클래스 (예: 'w-32') */
  width?: string | number
  /** height — 픽셀 또는 Tailwind 클래스 (예: 'h-4') */
  height?: string | number
  className?: string
  style?: CSSProperties
}

const RADIUS: Record<Shape, string> = {
  text:   'rounded-md',
  card:   'rounded-xl',
  circle: 'rounded-full',
  rect:   'rounded',
}

const Skeleton = memo(function Skeleton({
  shape = 'text',
  width,
  height,
  className = '',
  style,
}: SkeletonProps) {
  const wCls = typeof width  === 'string' && width.startsWith('w-')  ? width  : ''
  const hCls = typeof height === 'string' && height.startsWith('h-') ? height : ''
  const inline: CSSProperties = {
    ...(typeof width  === 'number' ? { width }  : {}),
    ...(typeof height === 'number' ? { height } : {}),
    ...(typeof width  === 'string' && !wCls ? { width }  : {}),
    ...(typeof height === 'string' && !hCls ? { height } : {}),
    ...style,
  }
  return (
    <div
      aria-hidden="true"
      className={`bg-gray-100 animate-pulse ${RADIUS[shape]} ${wCls} ${hCls} ${className}`.trim()}
      style={inline}
    />
  )
})

export default Skeleton

/** 텍스트 라인 N개 — 분석 카드 / 리스트 행 placeholder */
export const SkeletonText = memo(function SkeletonText({
  lines = 3,
  className = '',
}: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          shape="text"
          height={12}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
})

/** 카드 형태 placeholder — 헤더 + 본문 */
export const SkeletonCard = memo(function SkeletonCard({
  className = '',
  height = 120,
}: { className?: string; height?: number }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 space-y-3 ${className}`.trim()}>
      <Skeleton shape="text" height={14} width="40%" />
      <Skeleton shape="text" height={28} width="70%" />
      <Skeleton shape="rect" height={height - 80} width="100%" />
    </div>
  )
})

/** 테이블 행 placeholder */
export const SkeletonRow = memo(function SkeletonRow({
  cols = 5,
  className = '',
}: { cols?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-3 py-3 border-b border-gray-50 ${className}`.trim()}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          shape="text"
          height={14}
          width={i === 0 ? '20%' : i === cols - 1 ? '12%' : `${Math.floor(60 / (cols - 2))}%`}
        />
      ))}
    </div>
  )
})
