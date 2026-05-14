/**
 * 썸네일 placeholder 유틸
 *
 * 1) getThumbnailFromPool(seed)
 *    - 인플루언서 username 해시 → Unsplash 운동/피트니스 사진 풀에서 선택 (deterministic)
 *    - thumbnail 데이터 미제공 시 *실제 운동 사진* 자동 매핑
 *
 * 2) getPlaceholderDataUri(seed, label)
 *    - Unsplash fetch 실패 시 최종 fallback — SVG gradient + 이모지
 *    - 항상 사용 가능 (외부 요청 무관)
 */

const PALETTES: { from: string; to: string; emoji: string }[] = [
  { from: '#FFE5E5', to: '#F87171', emoji: '🏋️' },  // 빨강
  { from: '#FEF3C7', to: '#FBBF24', emoji: '🏃' },  // 노랑
  { from: '#D1FAE5', to: '#10B981', emoji: '💪' },  // 초록
  { from: '#DBEAFE', to: '#3B82F6', emoji: '🤸' },  // 파랑
  { from: '#EDE9FE', to: '#8B5CF6', emoji: '⚡' },  // 보라
  { from: '#FCE7F3', to: '#EC4899', emoji: '🏅' },  // 분홍
  { from: '#FFEDD5', to: '#F97316', emoji: '🔥' },  // 주황
  { from: '#CFFAFE', to: '#06B6D4', emoji: '🚴' },  // 시안
]

/**
 * 시드 기반 안정적 색상 인덱스
 */
function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') return Math.abs(seed)
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

/**
 * Unsplash 운동/피트니스 사진 풀 — 영상 매칭 도메인(@enuf.sports 크로스핏)
 * 9:16 crop URL.
 */
const UNSPLASH_POOL = [
  'photo-1534438327276-14e5300c3a48',  // 크로스핏
  'photo-1571019613454-1cb2f99b2d8b',  // 웨이트 트레이닝
  'photo-1518611012118-696072aa579a',  // 러닝
  'photo-1538805060514-97d9cc17730c',  // 풀업
  'photo-1517836357463-d25dfeac3438',  // 크로스핏 박스
  'photo-1599058917212-d750089bc07e',  // 스프린트
  'photo-1571019614242-c5c5dee9f50b',  // 보충제
  'photo-1581009146145-b5ef050c2e1e',  // 데드리프트
  'photo-1574680096145-d05b474e2155',  // 헬스장
  'photo-1540497077202-7c8a3999166f',  // 트레이닝
  'photo-1554344728-77cf90d9ed7f',     // 박스 점프
  'photo-1605296867724-fa87a8ef53fd',  // 운동 그룹
]

/**
 * 시드(username 등) 해시 → Unsplash 풀에서 deterministic 선택
 * 반환 URL은 9:16 crop (360×640).
 */
export function getThumbnailFromPool(seed: string | number): string {
  const id = UNSPLASH_POOL[hashSeed(seed) % UNSPLASH_POOL.length]
  return `https://images.unsplash.com/${id}?w=360&h=640&fit=crop&q=70`
}

/**
 * 9:16 비율 SVG 그라데이션 + 이모지 placeholder
 * @param seed 인플루언서 username 또는 콘텐츠 ID
 * @param label 인플루언서 핸들 표시 (옵션)
 */
export function getPlaceholderDataUri(seed: string | number, label?: string): string {
  const idx = hashSeed(seed) % PALETTES.length
  const { from, to, emoji } = PALETTES[idx]

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 320' preserveAspectRatio='xMidYMid slice'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${from}'/>
        <stop offset='100%' stop-color='${to}'/>
      </linearGradient>
    </defs>
    <rect width='180' height='320' fill='url(%23g)'/>
    <text x='90' y='155' font-size='64' text-anchor='middle' dominant-baseline='middle'>${emoji}</text>
    ${label ? `<text x='90' y='275' font-size='12' font-weight='600' fill='%23ffffff' fill-opacity='0.85' text-anchor='middle' font-family='-apple-system, BlinkMacSystemFont, sans-serif'>${label}</text>` : ''}
  </svg>`
  // SVG data URI: # → %23, 공백/줄바꿈은 viewer가 처리. 안전하게 encode.
  return `data:image/svg+xml;utf8,${svg.replace(/\n\s*/g, '').replace(/#/g, '%23')}`
}

/**
 * 컴포넌트의 onError에서 호출: 외부 URL fetch 실패 시 placeholder로 swap
 */
export function withFallback(src: string | undefined, seed: string | number, label?: string): string {
  return src ?? getPlaceholderDataUri(seed, label)
}
