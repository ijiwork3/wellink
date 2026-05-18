/**
 * shouldShowLabel — 차트 X축 라벨 표시 여부 통합 결정
 *
 * 차트별로 X축 라벨 정책이 분기되어 있던 것을 단일 룰로 통합.
 *
 * 우선순위:
 *  1. 데이터 항목에 `showLabel` 속성이 *명시*되어 있으면 그 값 사용 (개별 제어 우선)
 *  2. 첫·마지막 포인트는 항상 표시 (차트 양 끝 라벨 보장)
 *  3. 자동 간격:
 *     - data.length > 20 → 7개마다
 *     - data.length > 8  → 3개마다
 *     - 그 외           → 모두
 *
 * 사용 예:
 *   {data.map((d, i) =>
 *     shouldShowLabel(i, data.length, d)
 *       ? <text>{d.label}</text>
 *       : null
 *   )}
 */
export function shouldShowLabel(
  index: number,
  total: number,
  item?: { showLabel?: boolean },
): boolean {
  // 1. 데이터에 명시되어 있으면 그 값 우선
  if (item?.showLabel !== undefined) return item.showLabel

  // 2. 첫·마지막은 항상 표시
  if (index === 0 || index === total - 1) return true

  // 3. 자동 간격 룰
  const interval = total > 20 ? 7 : total > 8 ? 3 : 1
  return index % interval === 0
}
