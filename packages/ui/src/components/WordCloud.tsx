/**
 * WordCloud — 캡션·키워드 빈도 시각화
 *
 * - 단어 크기 = 빈도 (비선형 sqrt 매핑 — 빈도 차이 시각 강조)
 * - 상위 8% = bold + brand-green-text / 중위 = gray-700 / 하위 = gray-500
 * - 클릭 가능 시 hover underline + 페이지 이동/필터 트리거
 * - 빈 데이터 → emptyMessage 노출
 */
import { memo, useMemo } from 'react'

export interface WordCloudEntry {
  word: string
  count: number
  /** 옵셔널 감성 분류 — 색 차등 (현재 미사용, 향후 확장) */
  sentiment?: 'positive' | 'negative' | 'neutral'
}

interface WordCloudProps {
  entries: WordCloudEntry[]
  /** 최대 단어 수 (기본 36) */
  limit?: number
  /** 단어 클릭 핸들러 — 생략 시 비활성 */
  onWordClick?: (entry: WordCloudEntry) => void
  /** 빈 상태 메시지 */
  emptyMessage?: string
  /** 컨테이너 max-height (스크롤 트리거) */
  maxHeight?: number
  className?: string
}

const MIN_SIZE = 14
const MAX_SIZE = 44

const WordCloud = memo(function WordCloud({
  entries,
  limit = 36,
  onWordClick,
  emptyMessage = '단어 데이터가 아직 없습니다.',
  maxHeight,
  className,
}: WordCloudProps) {
  const visible = useMemo(() => {
    const sliced = [...entries].sort((a, b) => b.count - a.count).slice(0, limit)
    if (sliced.length === 0) return []
    const max = sliced[0].count
    const min = sliced[sliced.length - 1].count
    const top8 = Math.max(1, Math.ceil(sliced.length * 0.08))
    return sliced.map((e, idx) => {
      // sqrt 비선형 매핑
      const ratio = max === min ? 0.5 : Math.sqrt((e.count - min) / (max - min))
      const size = MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE)
      const tier: 'top' | 'mid' | 'low' = idx < top8 ? 'top' : ratio > 0.4 ? 'mid' : 'low'
      return { ...e, size, tier }
    })
  }, [entries, limit])

  if (visible.length === 0) {
    return (
      <div className={`flex items-center justify-center py-10 text-[15px] text-gray-400 ${className ?? ''}`}>
        {emptyMessage}
      </div>
    )
  }

  const isClickable = !!onWordClick

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-4 py-4 ${className ?? ''}`}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      role="list"
      aria-label="캡션 워드클라우드"
    >
      {visible.map(({ word, count, size, tier }) => {
        const tone =
          tier === 'top'
            ? 'text-brand-green-text font-bold'
            : tier === 'mid'
              ? 'text-gray-700 font-medium'
              : 'text-gray-500'
        const baseCls = `whitespace-nowrap tabular-nums ${tone} ${isClickable ? 'hover:underline hover:text-brand-green-text transition-colors cursor-pointer' : ''}`
        const style = { fontSize: size, lineHeight: 1.15 }
        if (isClickable) {
          return (
            <button
              key={word}
              type="button"
              role="listitem"
              onClick={() => onWordClick?.({ word, count })}
              aria-label={`${word} ${count}회 멘션`}
              className={`${baseCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded`}
              style={style}
            >
              {word}
            </button>
          )
        }
        return (
          <span
            key={word}
            role="listitem"
            aria-label={`${word} ${count}회 멘션`}
            className={baseCls}
            style={style}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
})

export default WordCloud
