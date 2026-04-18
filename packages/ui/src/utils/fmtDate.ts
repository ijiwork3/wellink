/** 날짜 포맷 — 데이터 정책 v1 §1-1: 저장 YYYY-MM-DD → UI YYYY.MM.DD */
export function fmtDate(d: string): string {
  return d.replace(/-/g, '.')
}
