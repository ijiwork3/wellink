/**
 * AIAnalysisCard — 분석 페이지 공통 AI 분석 카드
 *
 * AdPerformance / ProfileInsight / ViralMetrics 세 곳에서 동일 마크업 사용.
 * 패턴: *분석(번호 리스트) + 가이드(번호 리스트) + 분석 시각* 그룹 분리.
 * 옵셔널 — analysis/guides 미제공 시 기존 단일 summary 텍스트 fallback (바이럴 호환).
 *
 * 사용:
 *   const { refreshing, refresh, generatedAt } = useAiRefresh()
 *   <AIAnalysisCard
 *     title="AI 프로필 분석"
 *     analysis={data.analysis}
 *     guides={data.guides}
 *     generatedAt={generatedAt}
 *     refreshing={refreshing}
 *     onRefresh={refresh}
 *   />
 */

import { memo } from 'react'
import { Sparkles, Loader2, BarChart3, Target } from 'lucide-react'

export interface AIAnalysisCardProps {
  title: string
  /** 단일 텍스트 fallback (analysis/guides 없을 때) — 바이럴 호환 */
  summary?: string
  /** 분석 번호 리스트 */
  analysis?: readonly string[]
  /** 가이드 번호 리스트 */
  guides?: readonly string[]
  generatedAt?: Date | string
  refreshing: boolean
  onRefresh: () => void
}

function formatTimestamp(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

interface NumberedSectionProps {
  icon: React.ReactNode
  title: string
  items: readonly string[]
}

function NumberedSection({ icon, title, items }: NumberedSectionProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-purple-100/60">
      <div className="flex items-center gap-1.5 mb-3 text-sm font-semibold text-purple-700">
        {icon}
        {title}
      </div>
      <ol className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <span className="shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center mt-0.5" aria-hidden="true">
              {i + 1}
            </span>
            <span className="leading-relaxed flex-1 min-w-0">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

const AIAnalysisCard = memo(function AIAnalysisCard({
  title, summary, analysis, guides, generatedAt, refreshing, onRefresh,
}: AIAnalysisCardProps) {
  const hasStructured = (analysis && analysis.length > 0) || (guides && guides.length > 0)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-600" aria-hidden="true" />
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
        </div>
        <button type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/50 whitespace-nowrap"
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
      ) : !hasStructured ? (
        // 단일 summary fallback (바이럴 호환)
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{summary ?? ''}</p>
      ) : (
        <div className="space-y-3">
          {/* 분석 + 가이드 2열 (좁은 화면에서 1열) */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
            {analysis && analysis.length > 0 && (
              <NumberedSection
                icon={<BarChart3 size={14} aria-hidden="true" />}
                title="분석"
                items={analysis}
              />
            )}
            {guides && guides.length > 0 && (
              <NumberedSection
                icon={<Target size={14} aria-hidden="true" />}
                title="가이드"
                items={guides}
              />
            )}
          </div>

          {/* 분석 시각 */}
          {generatedAt && (
            <p className="text-sm text-gray-500 text-right pt-1">
              분석 시각: {formatTimestamp(generatedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

export default AIAnalysisCard
