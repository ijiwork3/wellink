/**
 * Pagination — 전사 공통 페이지네이션
 *
 * 정책:
 * - 윈도우 축약: 1, …, current±1, …, last
 * - 모바일 줄바꿈 방지(flex-wrap)
 * - 1페이지면 미노출 (total <= pageSize)
 *
 * 사용:
 *   <Pagination total={items.length} page={page} pageSize={20} onChange={setPage} />
 */

interface PaginationProps {
  total: number
  page: number
  pageSize: number
  onChange: (p: number) => void
  /** 좌측 요약 라벨 표시 (default: true) */
  showSummary?: boolean
  /** 컨테이너 추가 클래스 */
  className?: string
}

export default function Pagination({ total, page, pageSize, onChange, showSummary = true, className = '' }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  if (total <= pageSize) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce<(number | '…')[]>((acc, p) => {
      if (acc.length && p - (acc[acc.length - 1] as number) > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className={`flex items-center justify-between gap-2 px-3 @sm:px-5 py-3 border-t border-gray-100 flex-wrap ${className}`}>
      {showSummary ? (
        <span className="text-xs text-gray-500 shrink-0">
          총 {total.toLocaleString()}개 · {safePage} / {totalPages}
        </span>
      ) : <span />}
      <div className="flex items-center gap-1 flex-wrap justify-end">
        <button
          onClick={() => onChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >이전</button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="text-xs text-gray-400 px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={safePage === p ? 'page' : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                safePage === p
                  ? 'bg-gray-100 text-gray-900'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >{p}</button>
          )
        )}
        <button
          onClick={() => onChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >다음</button>
      </div>
    </div>
  )
}
