import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDateLabel, type DatePeriod } from '../utils/getDateLabel'

/**
 * DateRangePicker — 분석 페이지 공통 기간 선택 컴포넌트
 *
 * 사용처: AdPerformance / ProfileInsight / ViralMetrics
 * - 기간 탭(일간/주간/월간/연간) + 좌우 화살표 + 라벨 클릭 → 캘린더 popover
 * - dateOffset 모델: 0 = 현재, 음수 = 과거 (단위는 period에 따름)
 *   · 일간: 1일, 주간: 1주, 월간: 1개월, 연간: 1년
 */

export type DateRangePickerProps = {
  period: DatePeriod
  dateOffset: number
  onPeriodChange: (period: DatePeriod) => void
  onDateOffsetChange: (offset: number) => void
  /** 노출할 기간 옵션 (default: 4개 모두) */
  periods?: readonly DatePeriod[]
}

const ALL_PERIODS: readonly DatePeriod[] = ['일간', '주간', '월간', '연간'] as const

export default function DateRangePicker({
  period,
  dateOffset,
  onPeriodChange,
  onDateOffsetChange,
  periods = ALL_PERIODS,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="flex items-center flex-wrap gap-2">
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => { onPeriodChange(p); onDateOffsetChange(0) }}
            className={`text-sm px-3 py-1.5 rounded-md transition-all ${
              period === p ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div ref={wrapRef} className="relative flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
        <button
          onClick={() => onDateOffsetChange(dateOffset - 1)}
          aria-label="이전 기간"
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={14} className="text-gray-500" aria-hidden="true" />
        </button>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="기간 선택"
          aria-expanded={open}
          className="inline-flex items-center gap-1 px-2 min-w-[110px] text-center justify-center text-xs font-medium text-gray-700 hover:bg-gray-50 rounded transition-colors"
        >
          <Calendar size={12} className="text-gray-400" aria-hidden="true" />
          <span className="whitespace-nowrap">{getDateLabel(period, dateOffset)}</span>
          <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <button
          onClick={() => onDateOffsetChange(Math.min(0, dateOffset + 1))}
          disabled={dateOffset >= 0}
          aria-label="다음 기간"
          className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} className="text-gray-500" aria-hidden="true" />
        </button>
        {open && (
          <DatePickerPopover
            period={period}
            dateOffset={dateOffset}
            onSelect={(offset) => { onDateOffsetChange(offset); setOpen(false) }}
          />
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
 * Popover — period 별로 다른 캘린더 뷰
 * ──────────────────────────────────────────────────────────── */

function DatePickerPopover({
  period,
  dateOffset,
  onSelect,
}: {
  period: DatePeriod
  dateOffset: number
  onSelect: (offset: number) => void
}) {
  return (
    <div
      role="dialog"
      aria-label="기간 선택"
      className="absolute top-full right-0 mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[300px]"
    >
      {period === '일간' && <DailyCalendar dateOffset={dateOffset} onSelect={onSelect} />}
      {period === '주간' && <WeeklyCalendar dateOffset={dateOffset} onSelect={onSelect} />}
      {period === '월간' && <MonthlyCalendar dateOffset={dateOffset} onSelect={onSelect} />}
      {period === '연간' && <YearlyCalendar dateOffset={dateOffset} onSelect={onSelect} />}
    </div>
  )
}

/* ── 일간: 월 단위 캘린더(7×6), 월 navigator로 과거 무제한 ── */
function DailyCalendar({ dateOffset, onSelect }: { dateOffset: number; onSelect: (offset: number) => void }) {
  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  const selected = new Date(today)
  selected.setDate(today.getDate() + dateOffset)

  // 보고 있는 달 — 선택된 날짜의 월 기준
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: startDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length < 42) cells.push(null)

  const offsetForDay = (day: number) => {
    const target = new Date(viewYear, viewMonth, day)
    const ms = target.getTime() - new Date(todayY, todayM, todayD).getTime()
    return Math.round(ms / (1000 * 60 * 60 * 24))
  }

  const isFutureMonth = viewYear > todayY || (viewYear === todayY && viewMonth >= todayM)

  return (
    <div>
      <CalendarNav
        label={`${viewYear}년 ${viewMonth + 1}월`}
        onPrev={() => {
          if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) } else setViewMonth(viewMonth - 1)
        }}
        onNext={() => {
          if (isFutureMonth) return
          if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) } else setViewMonth(viewMonth + 1)
        }}
        nextDisabled={isFutureMonth}
      />
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} className="text-[10px] text-gray-400 text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const offset = offsetForDay(day)
          const isFuture = offset > 0
          const isToday = offset === 0
          const isSelected = offset === dateOffset
          return (
            <button
              key={i}
              disabled={isFuture}
              onClick={() => onSelect(offset)}
              className={`text-xs h-8 rounded-md transition-colors ${
                isSelected
                  ? 'bg-brand-green text-white font-semibold'
                  : isFuture
                    ? 'text-gray-300 cursor-not-allowed'
                    : isToday
                      ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── 주간: 월 navigator + 해당 월 안의 주 목록 ── */
function WeeklyCalendar({ dateOffset, onSelect }: { dateOffset: number; onSelect: (offset: number) => void }) {
  const today = new Date()
  // 현재 주 시작(월요일)
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7))

  // dateOffset 기준 선택 주
  const selectedWeekStart = new Date(currentWeekStart)
  selectedWeekStart.setDate(currentWeekStart.getDate() + dateOffset * 7)

  const [viewYear, setViewYear] = useState(selectedWeekStart.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedWeekStart.getMonth())

  // 해당 월에 걸치는 주들 — 월요일 기준
  const weeks: { offset: number; start: Date; end: Date; weekOfMonth: number }[] = []
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const lastOfMonth = new Date(viewYear, viewMonth + 1, 0)
  // 해당 월 1일이 속한 주의 월요일
  const firstWeekStart = new Date(firstOfMonth)
  firstWeekStart.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7))

  let cursor = new Date(firstWeekStart)
  let weekIdx = 1
  while (cursor <= lastOfMonth) {
    const start = new Date(cursor)
    const end = new Date(cursor)
    end.setDate(start.getDate() + 6)
    const diffMs = start.getTime() - currentWeekStart.getTime()
    const offset = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7))
    weeks.push({ offset, start, end, weekOfMonth: weekIdx })
    cursor.setDate(cursor.getDate() + 7)
    weekIdx++
  }

  const isFutureMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth())

  return (
    <div>
      <CalendarNav
        label={`${viewYear}년 ${viewMonth + 1}월`}
        onPrev={() => {
          if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) } else setViewMonth(viewMonth - 1)
        }}
        onNext={() => {
          if (isFutureMonth) return
          if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) } else setViewMonth(viewMonth + 1)
        }}
        nextDisabled={isFutureMonth}
      />
      <div className="space-y-1">
        {weeks.map(({ offset, start, end, weekOfMonth }) => {
          const isFuture = offset > 0
          const isSelected = offset === dateOffset
          const label = `${weekOfMonth}주차 · ${start.getMonth() + 1}/${start.getDate()} – ${end.getMonth() + 1}/${end.getDate()}`
          return (
            <button
              key={offset}
              disabled={isFuture}
              onClick={() => onSelect(offset)}
              className={`w-full text-xs px-3 py-2 rounded-lg transition-colors text-left ${
                isSelected
                  ? 'bg-brand-green text-white font-semibold'
                  : isFuture
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── 월간: 연도 navigator + 12개월 ── */
function MonthlyCalendar({ dateOffset, onSelect }: { dateOffset: number; onSelect: (offset: number) => void }) {
  const today = new Date()
  const selected = new Date(today.getFullYear(), today.getMonth() + dateOffset, 1)
  const [viewYear, setViewYear] = useState(selected.getFullYear())

  const isFutureYear = viewYear >= today.getFullYear()

  return (
    <div>
      <CalendarNav
        label={`${viewYear}년`}
        onPrev={() => setViewYear(viewYear - 1)}
        onNext={() => { if (!isFutureYear) setViewYear(viewYear + 1) }}
        nextDisabled={isFutureYear}
      />
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 12 }, (_, i) => {
          const offset = (viewYear - today.getFullYear()) * 12 + (i - today.getMonth())
          const isFuture = offset > 0
          const isSelected = offset === dateOffset
          return (
            <button
              key={i}
              disabled={isFuture}
              onClick={() => onSelect(offset)}
              className={`text-xs px-2 py-2 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-brand-green text-white font-semibold'
                  : isFuture
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}월
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── 연간: 10년 단위 그리드 ── */
function YearlyCalendar({ dateOffset, onSelect }: { dateOffset: number; onSelect: (offset: number) => void }) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const selectedYear = currentYear + dateOffset

  // 10년 단위 페이지
  const [pageEnd, setPageEnd] = useState(currentYear) // 페이지 마지막 연도

  const years = Array.from({ length: 10 }, (_, i) => pageEnd - 9 + i)
  const isFuturePage = pageEnd >= currentYear

  return (
    <div>
      <CalendarNav
        label={`${years[0]} – ${years[9]}`}
        onPrev={() => setPageEnd(pageEnd - 10)}
        onNext={() => { if (!isFuturePage) setPageEnd(pageEnd + 10) }}
        nextDisabled={isFuturePage}
      />
      <div className="grid grid-cols-2 gap-1.5">
        {years.map(year => {
          const offset = year - currentYear
          const isFuture = year > currentYear
          const isSelected = year === selectedYear
          return (
            <button
              key={year}
              disabled={isFuture}
              onClick={() => onSelect(offset)}
              className={`text-xs px-2 py-2 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-brand-green text-white font-semibold'
                  : isFuture
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {year}년
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── 공용 좌우 navigator ── */
function CalendarNav({
  label,
  onPrev,
  onNext,
  nextDisabled,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
  nextDisabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={onPrev}
        aria-label="이전"
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={14} className="text-gray-600" aria-hidden="true" />
      </button>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        aria-label="다음"
        className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={14} className="text-gray-600" aria-hidden="true" />
      </button>
    </div>
  )
}
