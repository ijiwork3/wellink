/**
 * PlatformBadge — SNS 플랫폼 배지
 * 인스타그램 / 유튜브 / 블로그 / 틱톡
 */

type PlatformType = 'instagram' | 'youtube' | 'blog' | 'tiktok' | string

interface PlatformBadgeProps {
  platform: PlatformType
  className?: string
}

export default function PlatformBadge({ platform, className = '' }: PlatformBadgeProps) {
  const getStyle = (): { bg: string; text: string; label: string } => {
    switch (platform.toLowerCase()) {
      case 'instagram':
      case '인스타그램':
        return { bg: 'bg-pink-100', text: 'text-pink-700', label: '인스타그램' }
      case 'youtube':
      case '유튜브':
        return { bg: 'bg-red-100', text: 'text-red-700', label: '유튜브' }
      case 'blog':
      case '블로그':
      case '네이버 블로그':
        return { bg: 'bg-green-100', text: 'text-green-700', label: '블로그' }
      case 'tiktok':
      case '틱톡':
        return { bg: 'bg-slate-100', text: 'text-slate-600', label: '틱톡' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: platform }
    }
  }

  const style = getStyle()

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
    >
      {style.label}
    </span>
  )
}
