/**
 * 인플루언서 앱 전용 포맷 유틸.
 * 공용 포맷은 `@wellink/ui`에서 가져온다 (fmtNumber, fmtDate, fmtPrice 등).
 */

/**
 * 한국 휴대폰 번호 포맷: 숫자만 추출 후 11자리까지 받아 "010-1234-5678" 형태로 변환.
 */
export function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

/**
 * 한국어 주격조사 자동 선택. 마지막 글자에 받침이 있으면 "이", 없으면 "가".
 * 한글 외 문자(영문·숫자)는 보수적으로 "이(가)" 형태로 둔다.
 */
export function ko주격조사(word: string): '이' | '가' | '이(가)' {
  if (!word) return '이(가)'
  const last = word.charCodeAt(word.length - 1)
  if (last < 0xac00 || last > 0xd7a3) return '이(가)'
  return (last - 0xac00) % 28 === 0 ? '가' : '이'
}
