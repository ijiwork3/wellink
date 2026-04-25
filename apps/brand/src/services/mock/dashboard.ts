// Mock data — replace with API calls when backend is ready

export const mockDashboardKPIs = [
  { title: '활성 캠페인', value: 2, sub: '현재 진행 중', trend: 50 },
  { title: '진행중 인플루언서', value: 12, sub: '총 참여 인원', trend: 20 },
  { title: '이번달 도달', value: '482,000', sub: '누적 임프레션', trend: 8.3 },
  { title: '검수대기', value: 2, sub: '콘텐츠 대기 중', trend: -33.3 },
]

export const mockDashboardCampaigns = [
  { id: 1, name: '봄 요가 프로모션', status: '모집중' as const, total: 15, current: 8, deadline: '2026-04-28' },
  { id: 2, name: '비건 신제품 론칭', status: '대기중' as const, total: 10, current: 0, deadline: '2026-05-05' },
]

export interface Notification {
  id: number
  text: string
  time: string
  dot: string
  route: string
  unread: boolean
}

export const mockNotifications: Notification[] = [
  { id: 1, text: '이창민님이 콘텐츠를 제출했습니다 — 검수가 필요합니다.', time: '5분 전', dot: 'bg-sky-400', route: '/campaigns/1', unread: true },
  { id: 2, text: '비건 신제품 론칭에 새 인플루언서가 지원했습니다.', time: '1시간 전', dot: 'bg-emerald-400', route: '/campaigns/2', unread: true },
  { id: 4, text: '구독이 5일 후 만료됩니다. 갱신해 주세요.', time: '어제', dot: 'bg-amber-400', route: '/subscription', unread: false },
  { id: 5, text: '박리나님과의 협의가 수락되었습니다.', time: '2일 전', dot: 'bg-slate-400', route: '/influencers/manage', unread: false },
]

export type ContentPeriod = '일간' | '주간' | '월간'

export const mockContentByPeriod: Record<ContentPeriod, { label: string; value: number; change: number; sparkline: number[] }[]> = {
  일간: [
    { label: '조회수', value: 3400,   change: 5.2,  sparkline: [28,30,27,32,29,31,35,30,33,32,36,31,34,38,33,36,34,38,35,40,36,38,37,40,38,35,37,39,36,34] },
    { label: '좋아요', value: 263,    change: 3.1,  sparkline: [22,24,21,26,23,25,28,24,27,25,29,24,27,30,26,28,27,30,28,32,29,30,29,31,30,28,29,31,28,26] },
    { label: '댓글',   value: 47,     change: -8.3, sparkline: [52,50,53,48,51,49,46,50,47,49,45,48,46,43,47,44,46,43,41,44,42,44,43,45,43,41,42,44,41,47] },
    { label: '공유',   value: 27,     change: 12.5, sparkline: [18,19,17,20,19,21,22,20,22,21,23,21,23,24,22,24,23,25,23,26,24,25,25,26,25,24,25,26,24,27] },
  ],
  주간: [
    { label: '조회수', value: 24300,  change: 12,   sparkline: [0,0,18,22,28,24,34,30,36,38,34,42] },
    { label: '좋아요', value: 1842,   change: 8.5,  sparkline: [0,0,14,18,22,19,26,24,28,30,27,32] },
    { label: '댓글',   value: 326,    change: -5.2, sparkline: [0,0,30,28,34,26,22,20,18,16,14,18] },
    { label: '공유',   value: 189,    change: 22,   sparkline: [0,0,8,10,14,11,17,16,19,21,18,24] },
  ],
  월간: [
    { label: '조회수', value: 104800, change: 18.4, sparkline: [0,0,0,0,0,0,0,0,62,74,90,112] },
    { label: '좋아요', value: 7940,   change: 11.2, sparkline: [0,0,0,0,0,0,0,0,55,62,74,90]  },
    { label: '댓글',   value: 1408,   change: -2.1, sparkline: [0,0,0,0,0,0,0,0,48,44,40,42]  },
    { label: '공유',   value: 814,    change: 31.6, sparkline: [0,0,0,0,0,0,0,0,32,46,58,72]  },
  ],
}
