/**
 * 숫자 포맷 — 데이터 정책 v1 §1-2 기준
 * 1만 미만: 천 단위 쉼표 / 1만 이상: 만 단위 / 억 이상: 억 단위
 */
export function fmtNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}만`
  if (n >= 1_000) return n.toLocaleString('ko-KR')
  return String(n)
}

/**
 * 팔로워 수 포맷 (숫자 입력 전용)
 */
export function fmtFollowers(n: number): string {
  return fmtNumber(n)
}

/** fmtFollowers 별칭 — formatFollowers 네이밍 통일용 */
export const formatFollowers = fmtFollowers

/**
 * 증감률 포맷 — §1-3: 양수 +N% / 음수 -N% / 0 → 0%
 */
export function fmtRate(n: number): string {
  if (n > 0) return `+${n}%`
  if (n < 0) return `${n}%`
  return '0%'
}

/**
 * 금액 포맷 — 천 단위 쉼표 (394182 → 394,182원)
 * 도달수·팔로워 등 통계 수치와 달리 금액은 정확한 값을 표시
 */
export function fmtPrice(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}
