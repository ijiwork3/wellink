type PlatformType = 'instagram' | 'youtube' | 'blog' | 'tiktok' | string
type StatusType = '모집중' | '마감임박' | '마감' | '종료' | '진행중' | '완료' | '신청완료' | '대기중' | '게시완료' | '포인트지급' | '검수중' | '반려' | '콘텐츠대기' | string

interface PlatformBadgeProps {
  platform: PlatformType
  className?: string
}

interface StatusBadgeProps {
  status: StatusType
  className?: string
  dot?: boolean
}

/**
 * 전사 상태 컬러 정책 — 5그룹
 * ─────────────────────────────────────────────────────
 * active  (진행 중)   emerald  모집중·진행중
 * pending (대기·예정) amber    대기중·신청완료·콘텐츠대기
 * review  (검토 필요) sky      검수중
 * done    (종료·완료) slate    완료·종료·마감·게시완료·포인트지급
 * alert   (반려·긴급) rose     반려·마감임박
 * ─────────────────────────────────────────────────────
 * 원색 사용 금지 — bg-*-100/text-*-600 톤 유지
 */

type Cfg2 = { bg: string; text: string; dot: string }
const active2:  Cfg2 = { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' }
const pending2: Cfg2 = { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400'   }
const review2:  Cfg2 = { bg: 'bg-sky-100',     text: 'text-sky-700',     dot: 'bg-sky-400'     }
const done2:    Cfg2 = { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400'   }
const alert2:   Cfg2 = { bg: 'bg-rose-100',    text: 'text-rose-600',    dot: 'bg-rose-400'    }

const statusMap: Record<string, Cfg2> = {
  '모집중':    active2,
  '진행중':    active2,
  '대기중':    pending2,
  '신청완료':  pending2,
  '콘텐츠대기':pending2,
  '검수중':    review2,
  '완료':      done2,
  '종료':      done2,
  '마감':      done2,
  '게시완료':  done2,
  '포인트지급':done2,
  '반려':      alert2,
  '마감임박':  alert2,
}

export function PlatformBadge({ platform, className = '' }: PlatformBadgeProps) {
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
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: '틱톡' }
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

export function StatusBadge({ status, className = '', dot = true }: StatusBadgeProps) {
  const cfg = statusMap[status] ?? { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
      {status}
    </span>
  )
}
