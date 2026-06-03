/**
 * PlatformBadge — SNS 플랫폼 배지
 * 정책 §8.3: 인스타그램 / 유튜브 / 네이버 블로그 (한글 통일)
 *
 * variant:
 *  - 'soft' (기본): 흰 배경 위 사용. 연한 톤 + 진한 텍스트
 *  - 'solid': 이미지·컬러 썸네일 위 오버레이용. 진한 배경 + 흰 텍스트
 */

import { memo } from 'react'
import type React from 'react'

type PlatformType = 'instagram' | 'youtube' | 'blog' | string
type Variant = 'soft' | 'solid'

interface PlatformBadgeProps {
  platform: PlatformType
  variant?: Variant
  className?: string
}

const STYLES: Record<string, { soft: string; solid: string; softStyle?: React.CSSProperties; solidStyle?: React.CSSProperties; label: string }> = {
  '인스타그램':    {
    soft:       'text-[#C13584]',
    softStyle:  { background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 60%, #fff7ed 100%)' },
    solid:      'text-white',
    solidStyle: { background: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #FCAF45 100%)' },
    label: '인스타그램',
  },
  '유튜브':        { soft: 'bg-red-100 text-red-700',      solid: 'bg-red-500/90 text-white',     label: '유튜브' },
  '네이버 블로그': { soft: 'bg-green-100 text-green-700',  solid: 'bg-green-600/90 text-white',   label: '네이버 블로그' },
}

const ALIAS: Record<string, string> = {
  'instagram': '인스타그램',
  'youtube': '유튜브',
  'blog': '네이버 블로그',
  '블로그': '네이버 블로그',
}

const PlatformBadge = memo(function PlatformBadge({ platform, variant = 'soft', className = '' }: PlatformBadgeProps) {
  const key = ALIAS[platform.toLowerCase?.() ?? platform] ?? platform
  const style = STYLES[key] ?? { soft: 'bg-gray-100 text-gray-600', solid: 'bg-gray-500/80 text-white', label: platform }
  const tone = variant === 'solid' ? style.solid : style.soft
  const inlineStyle = variant === 'solid' ? style.solidStyle : style.softStyle

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[15px] font-medium whitespace-nowrap ${tone} ${className}`}
      style={inlineStyle}
    >
      {style.label}
    </span>
  )
})

export default PlatformBadge
