/** 공통 날짜 레이블 유틸
 *  AdPerformance / ViralMetrics 에서 공용으로 사용
 */
export type DatePeriod = '일간' | '주간' | '월간' | '연간'

export function getDateLabel(period: DatePeriod, offset: number): string {
  const now = new Date()
  if (period === '일간') {
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  if (period === '주간') {
    const start = new Date(now)
    start.setDate(start.getDate() + offset * 7 - start.getDay() + 1)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.getMonth() + 1}/${start.getDate()} – ${end.getMonth() + 1}/${end.getDate()}`
  }
  if (period === '연간') {
    return `${now.getFullYear() + offset}년`
  }
  // 월간
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
}
