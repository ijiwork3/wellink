/**
 * SNSPanel — SNS 연결 상태 패널
 * 네이버 블로그 / 인스타그램 / 유튜브
 * connected: true 시 연결됨 표시, false 시 연결하기 버튼
 */

import { Link2, ChevronRight } from 'lucide-react'
import { PLATFORM_COLORS } from '../constants/colors'

export interface PlatformConfig {
  id: 'naver' | 'instagram' | 'youtube'
  connected: boolean
  handle?: string
}

interface SNSPanelProps {
  platforms?: PlatformConfig[]
  onConnectClick?: (id: string) => void
}

const DEFAULT_PLATFORMS: PlatformConfig[] = [
  { id: 'naver', connected: false },
  { id: 'instagram', connected: false },
  { id: 'youtube', connected: false },
]

const PLATFORM_META: Record<PlatformConfig['id'], { name: string; icon: string; iconBg: string }> = {
  naver:     { name: '네이버 블로그', icon: 'N',  iconBg: PLATFORM_COLORS.naver },
  instagram: { name: '인스타그램',   icon: '📷', iconBg: PLATFORM_COLORS.instagram },
  youtube:   { name: '유튜브',       icon: '▶',  iconBg: PLATFORM_COLORS.youtube },
}

export default function SNSPanel({
  platforms = DEFAULT_PLATFORMS,
  onConnectClick,
}: SNSPanelProps) {
  const resolvedPlatforms = platforms.map(p => ({ ...p, ...PLATFORM_META[p.id] }))

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={15} className="text-brand-green" aria-hidden="true" />
        <span className="text-sm font-semibold text-gray-900">연결된 SNS</span>
      </div>
      <div>
        {resolvedPlatforms.map(p => (
          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: p.iconBg }}
              >
                {p.icon}
              </div>
              <div>
                <span className="text-xs text-gray-700 font-medium">{p.name}</span>
                {p.connected && p.handle && (
                  <p className="text-[11px] text-gray-400">@{p.handle}</p>
                )}
              </div>
            </div>
            {p.connected ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green inline-block" />
                <span className="text-xs text-green-600 font-medium">연결됨</span>
              </div>
            ) : (
              <button
                className="text-xs text-brand-green flex items-center gap-0.5 hover:opacity-70 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 rounded px-1 py-0.5"
                onClick={() => onConnectClick?.(p.id)}
                aria-label={`${p.name} 연결하기`}
              >
                연결하기
                <ChevronRight size={12} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
