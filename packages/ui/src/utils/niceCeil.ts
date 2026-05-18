/**
 * niceCeil — 데이터 max 값을 *깔끔한 라운드 숫자*로 올림.
 *
 * 차트 Y축 max를 데이터 그대로 쓰면 *라인이 차트 위 끝에 닿아* 답답하고,
 * 라벨도 "82,137" 같은 어중간한 숫자가 노출됨.
 *
 * niceCeil은 자릿수를 보존하면서 *1·1.5·2·3·5·7.5·10 ×10^n* 단계 중
 * 가장 가까운 *위쪽* 숫자로 라운드업.
 *
 * 예:
 *   82,137  →  100,000
 *   10,200  →  15,000
 *   3,400   →  5,000
 *   880     →  1,000
 *   24      →  30
 *   1.84    →  2
 */
export function niceCeil(v: number): number {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const magnitude = Math.pow(10, exp)
  const normalized = v / magnitude
  const nice = normalized <= 1   ? 1
             : normalized <= 1.5 ? 1.5
             : normalized <= 2   ? 2
             : normalized <= 3   ? 3
             : normalized <= 5   ? 5
             : normalized <= 7.5 ? 7.5
             : 10
  return nice * magnitude
}
