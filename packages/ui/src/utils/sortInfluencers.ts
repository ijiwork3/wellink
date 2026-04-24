/**
 * 인플루언서 공통 정렬 정책 — 데이터 정책 v1 §3-3
 *
 * 모든 인플루언서 리스트(InfluencerList, InfluencerManage, CampaignNew, AIListup 등)에서
 * 동일한 옵션과 동작을 보장하기 위한 공용 유틸.
 */

export type InfluencerSortKey = 'recent' | 'followers' | 'engagement' | 'fitScore'

export interface SortOption {
  value: InfluencerSortKey
  label: string
}

export const INFLUENCER_SORT_OPTIONS: SortOption[] = [
  { value: 'recent',     label: '최신순' },
  { value: 'followers',  label: '팔로워 많은순' },
  { value: 'engagement', label: '참여율 높은순' },
  { value: 'fitScore',   label: 'Fit Score 높은순' },
]

export const DEFAULT_INFLUENCER_SORT: InfluencerSortKey = 'recent'

interface SortableInfluencer {
  followers?: number
  engagement?: number
  fitScore?: number
  addedAt?: number
}

/**
 * 인플루언서 배열을 지정된 정렬 키로 정렬해 새 배열을 반환.
 * 원본은 변경하지 않음 (immutable).
 *
 * - recent: addedAt 내림차순. addedAt이 없으면 원본 순서 유지.
 * - followers / engagement / fitScore: 해당 필드 내림차순. 없으면 0 처리.
 */
export function sortInfluencers<T extends SortableInfluencer>(
  list: T[],
  key: InfluencerSortKey
): T[] {
  const sorted = [...list]
  switch (key) {
    case 'recent':
      return sorted.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))
    case 'followers':
      return sorted.sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))
    case 'engagement':
      return sorted.sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0))
    case 'fitScore':
      return sorted.sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0))
    default:
      return sorted
  }
}
