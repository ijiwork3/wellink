import { fmtFollowers } from '@wellink/ui'

export const avatarColors = ['bg-purple-100','bg-blue-100','bg-green-100','bg-yellow-100','bg-pink-100','bg-indigo-100']

export { fmtFollowers as formatFollowers }

export function fitScoreBadge(score: number): string {
  if (score >= 85) return 'bg-brand-green/10 text-brand-green-text'
  if (score >= 70) return 'bg-amber-50 text-amber-700'
  return 'bg-gray-100 text-gray-500'
}

export function fitScoreLabel(score: number): string {
  if (score >= 85) return '우수'
  if (score >= 70) return '보통'
  return '개선필요'
}
