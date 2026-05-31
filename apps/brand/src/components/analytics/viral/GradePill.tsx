/**
 * GradePill — 바이럴 콘텐츠 등급 배지 (A·B·C·D·E·processing)
 * 원본 ScorePill 동등.
 */

import { memo } from 'react'
import type { ContentGrade } from '../../../data/analytics/viral'

const GradePill = memo(function GradePill({ grade }: { grade: ContentGrade }) {
  const cls = grade === 'A' ? 'bg-brand-green-bg text-brand-green-text'
    : grade === 'B' ? 'bg-amber-100 text-amber-800'
    : grade === 'processing' ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-600'
  const label = grade === 'processing' ? '산정 중' : grade
  return <span className={`text-[15px] font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
})

export default GradePill
