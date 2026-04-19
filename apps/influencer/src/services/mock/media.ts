// Mock data — replace with API calls when backend is ready
import { PLATFORM_COLORS } from '@wellink/ui'

export interface Platform {
  id: string
  name: string
  iconBg: string
  icon: string
  connected: boolean
  url?: string
  followers?: number
  engagementRate?: number
}

export const mockPlatforms: Platform[] = [
  { id: 'naver', name: '네이버 블로그', iconBg: PLATFORM_COLORS.naver, icon: 'N', connected: false },
  { id: 'instagram', name: '인스타그램', iconBg: PLATFORM_COLORS.instagram, icon: '📷', connected: true, url: 'chanstyler', followers: 8700, engagementRate: 4.1 },
  { id: 'youtube', name: '유튜브', iconBg: PLATFORM_COLORS.youtube, icon: '▶', connected: false },
]

export const mockPlatformsAllConnected: Platform[] = [
  { id: 'naver', name: '네이버 블로그', iconBg: PLATFORM_COLORS.naver, icon: 'N', connected: true, url: 'myblog', followers: 3200, engagementRate: 2.8 },
  { id: 'instagram', name: '인스타그램', iconBg: PLATFORM_COLORS.instagram, icon: '📷', connected: true, url: 'chanstyler', followers: 8700, engagementRate: 4.1 },
  { id: 'youtube', name: '유튜브', iconBg: PLATFORM_COLORS.youtube, icon: '▶', connected: true, url: 'chanChannel', followers: 1200, engagementRate: 3.5 },
]

export const mockPlatformsAllDisconnected: Platform[] = [
  { id: 'naver', name: '네이버 블로그', iconBg: PLATFORM_COLORS.naver, icon: 'N', connected: false },
  { id: 'instagram', name: '인스타그램', iconBg: PLATFORM_COLORS.instagram, icon: '📷', connected: false },
  { id: 'youtube', name: '유튜브', iconBg: PLATFORM_COLORS.youtube, icon: '▶', connected: false },
]
