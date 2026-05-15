/**
 * 웰링크 DS 공용 스타일 토큰
 * 여러 컴포넌트에서 공유하는 Tailwind 클래스 문자열 상수
 */

/** 기본 인풋 클래스 — Signup·폼 등에서 사용
 *
 * 글자 크기는 **16px(text-base)** 강제. 14px(text-sm)로 두면 iOS Safari가
 * input focus 시 자동으로 줌인하여 모바일 UX 손상.
 */
export const INPUT_BASE =
  'w-full px-4 py-2.5 rounded-xl border text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus:border-brand-green transition-all duration-150'
