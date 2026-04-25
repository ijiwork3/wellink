/**
 * PlatformBadge — SNS 플랫폼 배지
 * 정책 §8.3: 인스타그램 / 유튜브 / 네이버 블로그 / 틱톡 (한글 통일)
 *
 * variant:
 *  - 'soft' (기본): 흰 배경 위 사용. 연한 톤 + 진한 텍스트
 *  - 'solid': 이미지·컬러 썸네일 위 오버레이용. 진한 배경 + 흰 텍스트
 */

import { memo } from 'react'

type PlatformType = 'instagram' | 'youtube' | 'blog' | 'tiktok' | string
type Variant = 'soft' | 'solid'

interface PlatformBadgeProps {
  platform: PlatformType
  variant?: Variant
  className?: string
}

const STYLES: Record<string, { soft: string; solid: string; label: string }> = {
  '인스타그램':    { soft: 'bg-pink-100 text-pink-700',    solid: 'bg-pink-500/90 text-white',    label: '인스타그램' },
  '유튜브':        { soft: 'bg-red-100 text-red-700',      solid: 'bg-red-500/90 text-white',     label: '유튜브' },
  '네이버 블로그': { soft: 'bg-green-100 text-green-700',  solid: 'bg-green-600/90 text-white',   label: '네이버 블로그' },
  '틱톡':          { soft: 'bg-slate-100 text-slate-700',  solid: 'bg-black/80 text-white',       label: '틱톡' },
}

const ALIAS: Record<string, string> = {
  'instagram': '인스타그램',
  'youtube': '유튜브',
  'blog': '네이버 블로그',
  '블로그': '네이버 블로그',
  'tiktok': '틱톡',
}

const PlatformBadge = memo(function PlatformBadge({ platform, variant = 'soft', className = '' }: PlatformBadgeProps) {
  const key = ALIAS[platform.toLowerCase?.() ?? platform] ?? platform
  const style = STYLES[key] ?? { soft: 'bg-gray-100 text-gray-600', solid: 'bg-gray-500/80 text-white', label: platform }
  const tone = variant === 'solid' ? style.solid : style.soft

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tone} ${className}`}>
      {style.label}
    </span>
  )
})

export default PlatformBadge
