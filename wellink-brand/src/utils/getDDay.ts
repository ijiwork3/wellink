export function getDDay(deadline: string): { label: string; color: string; pulse: boolean } {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { label: `D+${Math.abs(diff)}`, color: 'text-gray-400', pulse: false }
  if (diff === 0) return { label: 'D-Day', color: 'text-red-500', pulse: true }
  if (diff <= 3) return { label: `D-${diff}`, color: 'text-red-500', pulse: true }
  if (diff <= 7) return { label: `D-${diff}`, color: 'text-orange-500', pulse: false }
  return { label: `D-${diff}`, color: 'text-gray-500', pulse: false }
}
