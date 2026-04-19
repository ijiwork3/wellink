/**
 * D-Day 계산 — 데이터 정책 v1 §3-4
 * 당일: D-Day(빨강+pulse) / 1~3일: D-N(빨강) / 4~7일: D-N(주황) / 8일+: D-N(회색) / 마감 후: D+N(회색)
 */
export function getDDay(deadline: string): { label: string; color: string; pulse: boolean } {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0)  return { label: `D+${Math.abs(diff)}`, color: 'text-gray-400',  pulse: false }
  if (diff === 0) return { label: 'D-Day',              color: 'text-red-500',   pulse: true  }
  if (diff <= 3)  return { label: `D-${diff}`,           color: 'text-red-500',   pulse: true  }
  if (diff <= 7)  return { label: `D-${diff}`,           color: 'text-orange-500',pulse: false }
  return               { label: `D-${diff}`,           color: 'text-gray-500',  pulse: false }
}

/** D-Day badge 배경+텍스트 클래스 — getDDay() 반환값의 color/pulse를 Tailwind className으로 변환 */
export function getDDayBadgeStyle(color: string, pulse: boolean): string {
  const base = 'text-xs font-semibold px-2 py-0.5 rounded-full'
  const colorMap: Record<string, string> = {
    'text-red-500':    'bg-red-50 text-red-600',
    'text-orange-500': 'bg-orange-50 text-orange-600',
    'text-gray-400':   'bg-gray-100 text-gray-500',
    'text-gray-500':   'bg-gray-100 text-gray-500',
  }
  const colorClass = colorMap[color] ?? 'bg-gray-100 text-gray-500'
  return `${base} ${colorClass}${pulse ? ' animate-pulse' : ''}`
}

/** getDDay() 반환 타입 — getDDayBadgeStyle 인자로 사용 */
export type DayResult = ReturnType<typeof getDDay>
