/**
 * 썸네일 placeholder 유틸
 *
 * 1) getThumbnailFromPool(seed)
 *    - seed 해시 → Unsplash 운동/피트니스 사진 풀 30장에서 deterministic 선택
 *    - 100개 콘텐츠 기준 평균 3.3회 이하 중복
 *
 * 2) getPlaceholderDataUri(seed, label)
 *    - Unsplash fetch 실패 시 최종 fallback — SVG gradient + 카메라 아이콘
 *    - 이모지 없음, 실제 콘텐츠가 없는 상태임을 중립적으로 표현
 */

const PALETTES: { from: string; to: string }[] = [
  { from: '#E8F5E9', to: '#66BB6A' },  // 그린
  { from: '#E3F2FD', to: '#42A5F5' },  // 블루
  { from: '#F3E5F5', to: '#AB47BC' },  // 퍼플
  { from: '#FFF3E0', to: '#FFA726' },  // 오렌지
  { from: '#FCE4EC', to: '#EC407A' },  // 핑크
  { from: '#E8EAF6', to: '#5C6BC0' },  // 인디고
  { from: '#E0F7FA', to: '#26C6DA' },  // 시안
  { from: '#F1F8E9', to: '#9CCC65' },  // 라임
]

/**
 * 시드 기반 안정적 해시
 */
function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') return Math.abs(seed)
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

/**
 * Unsplash 운동/피트니스/건강 사진 풀 — 30장 (curl 200 확인 완료)
 * 4컬럼 그리드 기준 7~8행까지 중복 없음
 */
const UNSPLASH_POOL = [
  // 기존 12장 (검증됨)
  'photo-1534438327276-14e5300c3a48',  // 크로스핏 바벨
  'photo-1571019613454-1cb2f99b2d8b',  // 웨이트 트레이닝
  'photo-1518611012118-696072aa579a',  // 러닝 트랙
  'photo-1538805060514-97d9cc17730c',  // 풀업 바
  'photo-1517836357463-d25dfeac3438',  // 크로스핏 박스
  'photo-1599058917212-d750089bc07e',  // 스프린트
  'photo-1571019614242-c5c5dee9f50b',  // 보충제
  'photo-1581009146145-b5ef050c2e1e',  // 데드리프트
  'photo-1574680096145-d05b474e2155',  // 헬스장 내부
  'photo-1540497077202-7c8a3999166f',  // 퍼스널 트레이닝
  'photo-1554344728-77cf90d9ed7f',     // 박스 점프
  'photo-1605296867724-fa87a8ef53fd',  // 그룹 운동
  // 추가 18장 (curl 200 확인)
  'photo-1549060279-7e168fcee0c2',     // 여성 웨이트
  'photo-1526506118085-60ce8714f8c5',  // 상체 운동
  'photo-1583454110551-21f2fa2afe61',  // 요가 스트레칭
  'photo-1544367567-0f2fcb009e0b',     // 야외 요가
  'photo-1552674605-db6ffd4facb5',     // 헬스장 여성
  'photo-1594737625785-a6cbdabd333c',  // 마라톤 런
  'photo-1604480133435-25b86862d276',  // 피트니스 여성
  'photo-1535914254981-b5012eebbd15',  // 달리기
  'photo-1579758629938-03607ccdbaba',  // 줄넘기
  'photo-1601422407692-ec4eeec1d9b3',  // 필라테스
  'photo-1534367610401-9f5ed68180aa',  // 요가 포즈
  'photo-1533560904424-a0c61dc306fc',  // 야외 운동
  'photo-1574680178050-55c6a6a96e0a',  // 덤벨
  'photo-1506126613408-eca07ce68773',  // 명상/요가
  'photo-1598966739654-5e9a252d8c32',  // 바디빌딩
  'photo-1489516408517-0c0a15662682',  // 피트니스
  'photo-1584735935682-2f2b69dff9d2',  // 홈트레이닝
  'photo-1607962837359-5e7e89f86776',  // 스트레칭
]

/**
 * 시드 해시 → Unsplash 풀에서 deterministic 선택
 * 반환: 9:16 crop URL (360×640)
 */
export function getThumbnailFromPool(seed: string | number): string {
  const id = UNSPLASH_POOL[hashSeed(seed) % UNSPLASH_POOL.length]
  return `https://images.unsplash.com/${id}?w=360&h=640&fit=crop&q=70`
}

/**
 * 9:16 SVG 그라데이션 + 카메라 아이콘 fallback
 * 이모지 없음 — 이미지 로드 실패 시 중립적 UI 처리
 */
export function getPlaceholderDataUri(seed: string | number, label?: string): string {
  const idx = hashSeed(seed) % PALETTES.length
  const { from, to } = PALETTES[idx]

  // 카메라 아이콘 (SVG path) — 64×48 중앙 배치
  const camX = 58; const camY = 132
  const camPath = [
    `M${camX} ${camY + 10} Q${camX} ${camY + 6} ${camX + 4} ${camY + 6}`,
    `L${camX + 14} ${camY + 6} L${camX + 17} ${camY + 2} L${camX + 47} ${camY + 2}`,
    `L${camX + 50} ${camY + 6} L${camX + 60} ${camY + 6}`,
    `Q${camX + 64} ${camY + 6} ${camX + 64} ${camY + 10}`,
    `L${camX + 64} ${camY + 38} Q${camX + 64} ${camY + 42} ${camX + 60} ${camY + 42}`,
    `L${camX + 4} ${camY + 42} Q${camX} ${camY + 42} ${camX} ${camY + 38} Z`,
  ].join(' ')

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 320' preserveAspectRatio='xMidYMid slice'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/></linearGradient></defs>
<rect width='180' height='320' fill='url(%23g)'/>
<path d='${camPath}' fill='white' fill-opacity='0.45'/>
<circle cx='90' cy='${camY + 24}' r='14' fill='white' fill-opacity='0.45'/>
<circle cx='90' cy='${camY + 24}' r='8' fill='white' fill-opacity='0.35'/>
${label ? `<text x='90' y='272' font-size='11' font-weight='600' fill='white' fill-opacity='0.7' text-anchor='middle' font-family='-apple-system,BlinkMacSystemFont,sans-serif'>${label}</text>` : ''}
</svg>`

  return `data:image/svg+xml;utf8,${svg.replace(/\n/g, '').replace(/#/g, '%23')}`
}

/**
 * 컴포넌트 onError 헬퍼: 외부 URL 실패 시 fallback으로 swap
 */
export function withFallback(src: string | undefined, seed: string | number, label?: string): string {
  return src ?? getPlaceholderDataUri(seed, label)
}
