/**
 * StatusBadge — 전사 공통 상태 배지
 *
 * 색상은 CAMPAIGN_STATUS_STYLE · PARTICIPATION_STATUS_STYLE 과 1:1 동기화.
 * status.ts 상수가 정답 — 여기서 색을 바꾸지 말 것.
 */

import { memo } from 'react'
import type { CampaignStatus, ParticipationStatus } from '../constants/status'

type PlatformStatus = '인스타그램' | '유튜브' | '게재중' | '일시중지'

export type KnownStatus = CampaignStatus | ParticipationStatus | PlatformStatus

interface StatusBadgeProps {
  status: KnownStatus | (string & {})
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

type Cfg = { bg: string; text: string; dot: string }

function fromStyle(cls: string, dotColor: string): Cfg {
  const bg = cls.match(/bg-[\w-]+/)?.[0] ?? 'bg-slate-100'
  const text = cls.match(/text-[\w-]+/)?.[0] ?? 'text-slate-500'
  return { bg, text, dot: dotColor }
}

const statusConfig: Record<string, Cfg> = {
  // ── 캠페인 상태 (CAMPAIGN_STATUS_STYLE 동기화) ──
  '대기중':         fromStyle('bg-amber-100 text-amber-800', 'bg-amber-400'),
  '지원자 대기':    fromStyle('bg-amber-100 text-amber-800', 'bg-amber-400'),
  '모집중':         fromStyle('bg-brand-green-bg text-brand-green-text', 'bg-brand-green'),
  '진행중':         fromStyle('bg-emerald-100 text-emerald-700', 'bg-emerald-400'),
  '콘텐츠 등록 중': fromStyle('bg-emerald-100 text-emerald-700', 'bg-emerald-400'),
  '완료':           fromStyle('bg-brand-green-bg text-brand-green-text', 'bg-brand-green'),
  '종료':           fromStyle('bg-gray-100 text-gray-500', 'bg-gray-400'),
  '마감임박':       fromStyle('bg-orange-100 text-orange-700', 'bg-orange-400'),
  '선정 필요':      fromStyle('bg-rose-100 text-rose-700', 'bg-rose-400'),
  '취소':           fromStyle('bg-red-100 text-red-500', 'bg-red-400'),
  // ── 참여 상태 (PARTICIPATION_STATUS_STYLE 동기화) ──
  '신청완료':       fromStyle('bg-gray-100 text-gray-600', 'bg-gray-400'),
  '지원완료':       fromStyle('bg-gray-100 text-gray-600', 'bg-gray-400'),
  '검토중':         fromStyle('bg-amber-100 text-amber-800', 'bg-amber-400'),
  '선정':           fromStyle('bg-brand-green-bg text-brand-green-text', 'bg-brand-green'),
  '미선정':         fromStyle('bg-red-100 text-red-700', 'bg-red-400'),
  '콘텐츠대기':     fromStyle('bg-gray-100 text-gray-600', 'bg-gray-400'),
  '검수중':         fromStyle('bg-sky-100 text-sky-700', 'bg-sky-400'),
  '반려':           fromStyle('bg-red-100 text-red-700', 'bg-red-400'),
  // ── 기타 ──
  '마감':           fromStyle('bg-gray-100 text-gray-500', 'bg-gray-400'),
  '게시완료':       fromStyle('bg-gray-100 text-gray-500', 'bg-gray-400'),
  '포인트지급':     fromStyle('bg-gray-100 text-gray-500', 'bg-gray-400'),
  '게재중':         fromStyle('bg-emerald-100 text-emerald-700', 'bg-emerald-400'),
  '일시중지':       fromStyle('bg-amber-100 text-amber-800', 'bg-amber-400'),
  '인스타그램':     { bg: 'bg-pink-100',  text: 'text-pink-600',  dot: 'bg-pink-400'  },
  '유튜브':         { bg: 'bg-red-100',   text: 'text-red-600',   dot: 'bg-red-400'   },
  '블로그':         { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-400' },
  '적립':           fromStyle('bg-sky-100 text-sky-700', 'bg-sky-400'),
  '지급완료':       fromStyle('bg-gray-100 text-gray-500', 'bg-gray-400'),
}

const StatusBadge = memo(function StatusBadge({ status, size = 'sm', dot = true, className = '' }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' }
  const sizeClass = size === 'sm' ? 'text-[15px] px-2 py-0.5 gap-1' : 'text-[15px] px-2.5 py-1 gap-1.5'
  const dotSize   = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'

  return (
    <span className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClass} ${cfg.bg} ${cfg.text} ${className}`}>
      {dot && <span className={`${dotSize} rounded-full shrink-0 ${cfg.dot}`} />}
      {status}
    </span>
  )
})

export default StatusBadge
