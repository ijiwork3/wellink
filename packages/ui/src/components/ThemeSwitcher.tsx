/**
 * ThemeSwitcher — 데모용 플로팅 테마 팔레트 스위처
 * html 루트 클래스를 전환해 CSS 변수를 런타임 교체.
 * 선택값은 localStorage 'wl-demo-theme'에 유지.
 *
 * 기본 (4): blue · teal-navy · violet · indigo
 * 한색 (7): cyan-navy · sky-indigo · deep-purple · teal-blue · teal-deep · teal-vivid · teal-cyan
 */
import { useEffect, useState } from 'react'

export type ThemeId =
  | 'blue'
  | 'teal-navy' | 'violet' | 'indigo'
  | 'cyan-navy' | 'sky-indigo' | 'deep-purple' | 'teal-blue'
  | 'teal-deep' | 'teal-vivid' | 'teal-cyan'

interface ThemeDef {
  id: ThemeId
  label: string
  primary: string
  secondary: string
  /** 그라디언트 중간 정지점 — 명시 시 primary가 이 지점까지 유지 후 secondary로 전환 */
  midpoint?: string
}

const STANDARD: ThemeDef[] = [
  { id: 'teal-navy', label: '틸+퍼플네이비', primary: '#00C9B5', secondary: '#8B5CF6', midpoint: '70%' },
  { id: 'blue',      label: '블루+에메랄드', primary: '#2563EB', secondary: '#10B981' },
  { id: 'violet',    label: '보라+퓨시아',   primary: '#A44FFF', secondary: '#F00B7A' },
  { id: 'indigo',    label: '인디고+블루',   primary: '#4F46E5', secondary: '#0EA5E9' },
]

const COOL: ThemeDef[] = [
  { id: 'cyan-navy',    label: '사이언+딥네이비', primary: '#06B6D4', secondary: '#0F172A' },
  { id: 'sky-indigo',   label: '스카이+인디고',   primary: '#0EA5E9', secondary: '#4338CA' },
  { id: 'deep-purple',  label: '딥블루+퍼플',     primary: '#1D4ED8', secondary: '#7C3AED' },
  { id: 'teal-blue',    label: '틸+딥블루',       primary: '#0D9488', secondary: '#1D4ED8' },
  { id: 'teal-deep',    label: '딥아쿠아+로얄퍼플', primary: '#00BFB2', secondary: '#4935D0' },
  { id: 'teal-vivid',   label: '비비드틸+일렉트릭퍼플', primary: '#00D4C4', secondary: '#5B3EE0' },
  { id: 'teal-cyan',    label: '사이언+미드나잇퍼플', primary: '#06C8D8', secondary: '#2D1FA8' },
]

/** html에서 제거할 모든 테마 클래스 목록 */
export const ALL_THEME_CLASSES = [
  'theme-teal-navy', 'theme-violet', 'theme-indigo',
  'theme-cyan-navy', 'theme-sky-indigo', 'theme-deep-purple', 'theme-teal-blue',
  'theme-teal-deep', 'theme-teal-vivid', 'theme-teal-cyan',
  // 구버전 클래스 (마이그레이션용)
  'theme-teal', 'theme-orange', 'theme-red', 'theme-coral', 'theme-sunset', 'theme-crimson',
  'theme-c', 'theme-d', 'theme-e', 'theme-blue', 'theme-green',
] as const

const CLASS_MAP: Record<ThemeId, string> = {
  blue:          '',
  'teal-navy':   'theme-teal-navy',
  violet:        'theme-violet',
  indigo:        'theme-indigo',
  'cyan-navy':   'theme-cyan-navy',
  'sky-indigo':  'theme-sky-indigo',
  'deep-purple': 'theme-deep-purple',
  'teal-blue':   'theme-teal-blue',
  'teal-deep':   'theme-teal-deep',
  'teal-vivid':  'theme-teal-vivid',
  'teal-cyan':   'theme-teal-cyan',
}

export const STORAGE_KEY = 'wl-demo-theme'

export function applyThemeById(id: ThemeId) {
  const html = document.documentElement
  html.classList.remove(...ALL_THEME_CLASSES)
  const cls = CLASS_MAP[id]
  if (cls) html.classList.add(cls)
  localStorage.setItem(STORAGE_KEY, id)
}

function Dot({ theme, active, onSelect }: {
  theme: ThemeDef
  active: boolean
  onSelect: (id: ThemeId) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={theme.label}
      onClick={() => onSelect(theme.id)}
      className="relative group w-[18px] h-[18px] rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50 flex-shrink-0"
      style={{
        background: theme.midpoint
          ? `linear-gradient(135deg, ${theme.primary}, ${theme.midpoint}, ${theme.secondary})`
          : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        transform: active ? 'scale(1.25)' : 'scale(1)',
        opacity: active ? 1 : 0.55,
        boxShadow: active
          ? `0 0 0 2px white, 0 0 0 3.5px ${theme.primary}`
          : 'none',
      }}
    >
      {/* 호버 툴팁 */}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 rounded bg-gray-800 text-white text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-10"
      >
        {theme.label}
      </span>
    </button>
  )
}

function Row({ label, themes, active, onSelect }: {
  label: string
  themes: ThemeDef[]
  active: ThemeId
  onSelect: (id: ThemeId) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-semibold text-gray-300 w-4 text-right select-none leading-none">{label}</span>
      <div className="flex gap-1.5">
        {themes.map(t => (
          <Dot key={t.id} theme={t} active={active === t.id} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

interface Props {
  /** 하단 오프셋 — 기본 3.75rem (QA 버튼 위) */
  bottomOffset?: string
}

export default function ThemeSwitcher({ bottomOffset = '3.75rem' }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved && saved in CLASS_MAP ? saved : 'teal-navy') as ThemeId
  })

  // 마운트 시 저장된 테마 적용
  useEffect(() => { applyThemeById(active) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 다른 탭에서 변경 시 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in CLASS_MAP) {
        const id = e.newValue as ThemeId
        setActive(id)
        applyThemeById(id)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleSelect = (id: ThemeId) => {
    setActive(id)
    applyThemeById(id)
  }

  return (
    <div className="fixed right-4 z-[1090] flex flex-col items-end gap-1.5" style={{ bottom: bottomOffset }}>
      {open && (
        <div
          role="group"
          aria-label="데모 테마 선택"
          className="relative bg-white/92 backdrop-blur-sm border border-gray-200/80 rounded-2xl px-2.5 py-2 shadow-lg flex flex-col gap-2"
        >
          {/* 닫기 버튼 */}
          <button
            type="button"
            aria-label="테마 패널 닫기"
            onClick={() => setOpen(false)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* 기본 팔레트 */}
          <Row label="기본" themes={STANDARD} active={active} onSelect={handleSelect} />
          <div className="h-px bg-gray-100 -mx-1" />
          {/* 한색 팔레트 */}
          <Row label="❄" themes={COOL} active={active} onSelect={handleSelect} />
        </div>
      )}
      {!open && (
        <button
          type="button"
          aria-label="테마 패널 열기"
          onClick={() => setOpen(true)}
          className="w-8 h-8 rounded-full bg-white/90 border border-gray-200/80 shadow-md backdrop-blur-sm flex items-center justify-center hover:shadow-lg transition-all active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="3" cy="7" r="1.5" fill="#aaa"/>
            <circle cx="7" cy="7" r="1.5" fill="#aaa"/>
            <circle cx="11" cy="7" r="1.5" fill="#aaa"/>
          </svg>
        </button>
      )}
    </div>
  )
}
