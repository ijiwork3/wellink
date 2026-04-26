/**
 * ChipSelect — 반응형 카테고리 선택 컴포넌트
 *
 * 컨테이너가 충분히 넓으면 칩(pill) 목록, 좁으면 드롭다운으로 자동 전환.
 * overflow로 레이아웃이 깨지는 문제를 방지하기 위해 @container query 기반으로 동작.
 *
 * 사용법:
 *   <ChipSelect
 *     options={[{ label: '전체', value: '전체' }, ...]}
 *     value={selected}
 *     onChange={setSelected}
 *   />
 *
 * breakpoint prop으로 전환 기준 컨테이너 너비 조정 가능 (기본: '@md' = 448px).
 */

import CustomSelect from './CustomSelect'

interface Option {
  label: string
  value: string
}

interface ChipSelectProps {
  options: Option[]
  value: string
  onChange: (val: string) => void
  breakpoint?: '@sm' | '@md' | '@lg' | '@xl'
  className?: string
  selectClassName?: string
}

export default function ChipSelect({
  options,
  value,
  onChange,
  breakpoint = '@md',
  className = '',
  selectClassName = '',
}: ChipSelectProps) {
  return (
    <div className={className}>
      {/* 넓은 화면: 칩 */}
      <div className={`hidden ${breakpoint}:flex flex-wrap gap-2`}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
              value === opt.value
                ? 'text-white bg-brand-green shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green/40 hover:text-brand-green'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 좁은 화면: 드롭다운 */}
      <div className={`${breakpoint}:hidden`}>
        <CustomSelect
          value={value}
          onChange={onChange}
          options={options}
          className={selectClassName}
        />
      </div>
    </div>
  )
}
