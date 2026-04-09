/**
 * SNSPanel — SNS 연결 상태 패널
 * 네이버 블로그 / 인스타그램 / 유튜브
 * connected: true 시 연결됨 표시, false 시 연결하기 버튼
 */

import { Link2, ChevronRight } from 'lucide-react'

interface SNSPanelProps {
  naverConnected?: boolean
  instaConnected?: boolean
  youtubeConnected?: boolean
  naverHandle?: string
  instaHandle?: string
  youtubeHandle?: string
  onConnectClick?: (platform: 'naver' | 'instagram' | 'youtube') => void
}

export default function SNSPanel({
  naverConnected = false,
  instaConnected = false,
  youtubeConnected = false,
  naverHandle,
  instaHandle,
  youtubeHandle,
  onConnectClick,
}: SNSPanelProps) {
  const platforms = [
    {
      name: '네이버 블로그',
      icon: 'N',
      iconBg: '#03C75A',
      connected: naverConnected,
      handle: naverHandle,
      id: 'naver' as const,
    },
    {
      name: '인스타그램',
      icon: '📷',
      iconBg: '#E1306C',
      connected: instaConnected,
      handle: instaHandle,
      id: 'instagram' as const,
    },
    {
      name: '유튜브',
      icon: '▶',
      iconBg: '#FF0000',
      connected: youtubeConnected,
      handle: youtubeHandle,
      id: 'youtube' as const,
    },
  ]

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={15} style={{ color: '#8CC63F' }} />
        <span className="text-sm font-semibold text-gray-900">연결된 SNS</span>
      </div>
      <div>
        {platforms.map(p => (
          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                <span className="text-xs text-green-600 font-medium">연결됨</span>
              </div>
            ) : (
              <button
                className="text-xs flex items-center gap-0.5 text-[#8CC63F] hover:opacity-70 transition-all duration-150"
                onClick={() => onConnectClick?.(p.id)}
              >
                연결하기
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
