/**
 * StatusBadge — 전사 공통 상태 배지
 *
 * 전사 상태 컬러 정책 — 5그룹
 * ─────────────────────────────────────────────────────
 * active  (진행 중)   emerald  모집중·진행중
 * pending (대기·예정) amber    대기중·신청완료·콘텐츠대기
 * review  (검토 필요) sky      검수중
 * done    (종료·완료) slate    완료·종료·마감·게시완료·포인트지급
 * alert   (반려·긴급) rose     반려·마감임박
 * ─────────────────────────────────────────────────────
 * 원색 사용 금지 — bg-*-100 / text-*-600~700 톤 유지
 */

import { memo } from 'react'
import type { CampaignStatus, ParticipationStatus } from '../constants/status'

/** 플랫폼 문자열 리터럴 타입 */
type PlatformStatus = '인스타그램' | '유튜브' | '틱톡' | '게재중' | '일시중지'

/** StatusBadge가 수용하는 알려진 상태값 유니온 */
export type KnownStatus = CampaignStatus | ParticipationStatus | PlatformStatus

interface StatusBadgeProps {
  /** 알려진 상태값 우선 사용. 미등록 문자열도 허용 (fallback: slate) */
  status: KnownStatus | (string & {})
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

type Cfg = { bg: string; text: string; dot: string }

const active:  Cfg = { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' }
const pending: Cfg = { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400'   }
const review:  Cfg = { bg: 'bg-sky-100',     text: 'text-sky-700',     dot: 'bg-sky-400'     }
const done:    Cfg = { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400'   }
const alert:   Cfg = { bg: 'bg-rose-100',    text: 'text-rose-600',    dot: 'bg-rose-400'    }

const statusConfig: Record<string, Cfg> = {
  // active
  '모집중':         active,
  '진행중':         active,
  '콘텐츠 등록 중': active, // 친절화 라벨 (정책서 § 4-0)
  // pending
  '대기중':       pending,
  '지원자 대기':  pending, // 친절화 라벨 (정책서 § 4-0)
  '신청완료':     pending,
  '콘텐츠대기':   pending,
  // review
  '검수중':     review,
  // done
  '완료':       done,
  '종료':       done,
  '마감':       done,
  '게시완료':   done,
  '포인트지급': done,
  // alert
  '반려':       alert,
  '마감임박':   alert,
  '선정 필요': alert, // 광고주 액션 필요 — 정책서 § 4-0
  // 광고 게재 상태
  '게재중':     active,
  '일시중지':   pending,
  // 플랫폼
  '인스타그램': { bg: 'bg-pink-100',  text: 'text-pink-600',  dot: 'bg-pink-400'  },
  '유튜브':     { bg: 'bg-red-100',   text: 'text-red-600',   dot: 'bg-red-400'   },
  '틱톡':       { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
}

const StatusBadge = memo(function StatusBadge({ status, size = 'sm', dot = true, className = '' }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' }
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5'
  const dotSize   = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'

  return (
    <span className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClass} ${cfg.bg} ${cfg.text} ${className}`}>
      {dot && <span className={`${dotSize} rounded-full shrink-0 ${cfg.dot}`} />}
      {status}
    </span>
  )
})

export default StatusBadge
