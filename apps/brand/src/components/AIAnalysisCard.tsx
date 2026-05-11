/**
 * AIAnalysisCard — 분석 페이지 공통 AI 분석 카드
 *
 * AdPerformance / ProfileInsight 두 곳에서 동일 마크업 반복되던 카드.
 * 정책: bg-gradient purple→blue, Sparkles 아이콘, '다시 분석' 버튼 + 1800ms 로딩 스켈레톤.
 *
 * 사용:
 *   const { refreshing, refresh } = useAiRefresh()
 *   <AIAnalysisCard title="AI 광고 성과 분석" summary={SUMMARY} refreshing={refreshing} onRefresh={refresh} />
 */

import { memo } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export interface AIAnalysisCardProps {
  title: string
  summary: string
  refreshing: boolean
  onRefresh: () => void
}

const AIAnalysisCard = memo(function AIAnalysisCard({ title, summary, refreshing, onRefresh }: AIAnalysisCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-600" aria-hidden="true" />
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
        <button type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/50"
        >
          {refreshing ? (
            <>
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
              분석 중…
            </>
          ) : (
            <>
              <Sparkles size={12} aria-hidden="true" />
              다시 분석
            </>
          )}
        </button>
      </div>
      {refreshing ? (
        <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="AI 분석 진행 중">
          <div className="h-3 w-3/4 bg-purple-200/50 rounded-xl" />
          <div className="h-3 w-full bg-purple-200/50 rounded-xl" />
          <div className="h-3 w-5/6 bg-purple-200/50 rounded-xl" />
          <div className="h-3 w-2/3 bg-purple-200/50 rounded-xl" />
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{summary}</p>
      )}
    </div>
  )
})

export default AIAnalysisCard
