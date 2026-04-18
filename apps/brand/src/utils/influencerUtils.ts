export const avatarColors = ['bg-purple-100','bg-blue-100','bg-green-100','bg-yellow-100','bg-pink-100','bg-indigo-100']

export function formatFollowers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return n.toString()
}

export function fitScoreBadge(score: number): string {
  if (score >= 85) return 'bg-[#8CC63F]/10 text-[#5a8228]'
  if (score >= 70) return 'bg-amber-50 text-amber-700'
  return 'bg-gray-100 text-gray-500'
}

export function fitScoreLabel(score: number): string {
  if (score >= 85) return '우수'
  if (score >= 70) return '보통'
  return '개선필요'
}
