/**
 * qa-mockup-kit.tsx  v4
 *
 * ────────────────────────────────────────────
 * 구조
 *   QA 상단 바 : [DeviceToggle]  [ScreenBadge (중앙)]  [StateDropdown | PathDropdown]
 *   목업 박스  : viewport 높이 기준 scale, 내부만 스크롤
 *   QA 하단 바 : [ResetButton]  [QANavigator (중앙)]  [ScreenshotButton]
 *
 * 컴포넌트 목록
 *   useViewportScale      — viewport 높이 기준 scale 계산 훅
 *   parseQAPath           — 경로 파서 (구분자 자유)
 *   DeviceToggle          — PC / 태블릿 / 스마트폰 전환
 *   ScreenBadge           — 현재 경로 표시 + 복사 (중앙)
 *   StateDropdown         — 앱 상태 선택 드롭다운 (우상단 좌)
 *   PathDropdown          — 경로·모달 드롭다운 (우상단 우)
 *   QANavigator           — 경로 붙여넣기 이동 (중앙)
 *   ResetButton           — 초기화 (좌하단)
 *   ScreenshotButton      — 목업 스크린샷 → PNG 다운로드 (우하단)
 *   MockupShell           — 전체 래퍼
 *
 * deps: react, lucide-react, tailwind v4, html2canvas
 */

import { useState, useEffect, useRef, useCallback, createContext, useContext, type CSSProperties } from 'react';
import {
  Smartphone, Tablet, Monitor,
  Copy, Check, ArrowRight, Power, ChevronDown, ChevronRight, Camera,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { QA_ACCENT_COLOR, TIMER_MS } from '@wellink/ui';

// ─────────────────────────────────────────────────────────────
// 타입 & 상수
// ─────────────────────────────────────────────────────────────

export type DeviceMode = 'desktop' | 'tablet' | 'phone';

export const DEVICE_BASE: Record<DeviceMode, { w: number; h: number; radius: string }> = {
  desktop: { w: 1280, h: 800,  radius: '8px'  },
  tablet:  { w: 768,  h: 1024, radius: '14px' },
  phone:   { w: 390,  h: 844,  radius: '44px' },
};

const QA_CHROME_HEIGHT = 116; // 상단바 58px + 하단바 58px

// ─────────────────────────────────────────────────────────────
// DeviceModeContext — MockupShell의 deviceMode를 하위 컴포넌트에 전달
// ─────────────────────────────────────────────────────────────

const DeviceModeContext = createContext<DeviceMode>('desktop');

export function useDeviceMode(): DeviceMode {
  return useContext(DeviceModeContext);
}

export function useIsMobile(): boolean {
  return useContext(DeviceModeContext) === 'phone';
}

export function useIsDesktop(): boolean {
  return useContext(DeviceModeContext) === 'desktop';
}

export interface StatusItem {
  label: string;
  /** 경로 이동 (QANavigator와 동일한 onNavigate 콜백 재사용) */
  path?: string;
  /** 직접 실행할 핸들러 (상태 변경, 모달 열기 등) */
  onSelect?: () => void;
  children?: StatusItem[];
}

// ─────────────────────────────────────────────────────────────
// useViewportScale
// ─────────────────────────────────────────────────────────────

export function useViewportScale(deviceMode: DeviceMode): number {
  const { h: baseH, w: baseW } = DEVICE_BASE[deviceMode];

  const calc = useCallback(() => {
    const availH = window.innerHeight - QA_CHROME_HEIGHT;
    const availW = window.innerWidth - 32;
    return Math.min(availH / baseH, availW / baseW, 1);
  }, [baseH, baseW]);

  const [scale, setScale] = useState(calc);

  useEffect(() => {
    const onResize = () => setScale(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [calc]);

  return scale;
}

// ─────────────────────────────────────────────────────────────
// parseQAPath
// ─────────────────────────────────────────────────────────────

export function parseQAPath<S extends string, T extends string>(
  input: string,
  validStates: S[],
  tabMap: Record<string, T>,
): { state?: S; tab?: T; path?: string; modal?: string } | null {
  if (!input.trim()) return null;

  // [앱라벨] 접두어 제거
  const stripped = input.trim().replace(/^\[.*?\]\s*/, '').trim();
  if (!stripped) return null;

  // /로 시작하면 전체를 path로 직접 사용 (query string 포함)
  if (stripped.startsWith('/')) {
    return { path: stripped };
  }

  // # 뒤는 레거시 모달 구분자 지원
  const [mainPart, modalPart] = stripped.split('#').map(s => s.trim());
  const modal = modalPart || undefined;

  const parts = mainPart
    .split(/\s*[·:\|→]\s*|\s{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  const rawState = parts[0];
  const rawTab   = parts[1]?.toLowerCase();

  const state = validStates.length > 0 && validStates.includes(rawState as S)
    ? (rawState as S) : undefined;

  let tab: T | undefined;
  let path: string | undefined;

  if (rawTab) {
    if (tabMap[rawTab] !== undefined) tab = tabMap[rawTab];
    else path = rawTab.startsWith('/') ? rawTab : `/${rawTab}`;
  }

  if (!state && !tab && !path && rawState) {
    if (tabMap[rawState.toLowerCase()] !== undefined) tab = tabMap[rawState.toLowerCase()];
    else path = rawState.startsWith('/') ? rawState : `/${rawState}`;
  }

  if (!state && !tab && !path) return null;
  return { state, tab, path, modal };
}

// ─────────────────────────────────────────────────────────────
// DeviceToggle
// ─────────────────────────────────────────────────────────────

export function DeviceToggle({
  deviceMode, setDeviceMode,
}: {
  deviceMode: DeviceMode;
  setDeviceMode: (m: DeviceMode) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm">
      {([
        ['desktop', <Monitor size={13} />, 'PC'],
        ['tablet',  <Tablet size={13} />,  '태블릿'],
        ['phone',   <Smartphone size={13} />, '스마트폰'],
      ] as [DeviceMode, React.ReactNode, string][]).map(([mode, icon, label]) => (
        <button key={mode} onClick={() => setDeviceMode(mode)} title={label} aria-label={label}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
            deviceMode === mode ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
          }`}>
          {icon}<span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ScreenBadge (복사 버튼 포함)
// ─────────────────────────────────────────────────────────────

export function ScreenBadge({ label }: { label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(label);
    setCopied(true);
    setTimeout(() => setCopied(false), TIMER_MS.CLIPBOARD_FEEDBACK);
  };
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-md text-[12px] text-slate-600 whitespace-nowrap">
      <span className="font-mono font-semibold">{label}</span>
      <button onClick={copy} title="경로 복사"
        className="flex items-center text-slate-400 hover:text-slate-700 transition-colors">
        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// StateDropdown — 앱 상태 선택 (우상단 좌)
// ─────────────────────────────────────────────────────────────

export function StateDropdown({
  items,
  accentColor = QA_ACCENT_COLOR,
  onNavigate,
}: {
  items: StatusItem[];
  accentColor?: string;
  onNavigate?: (result: { state?: string; tab?: string; path?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item: StatusItem) => {
    if (item.onSelect) { item.onSelect(); setSelected(item.label); setOpen(false); return; }
    setSelected(item.label);
    if (item.path && onNavigate) onNavigate({ path: item.path });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="QA 상태 선택"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-white/80 backdrop-blur-sm shadow-sm text-slate-600 hover:text-slate-900 hover:bg-white transition-colors border border-slate-200"
        style={selected ? { borderColor: accentColor, color: accentColor } : undefined}
      >
        <span>{selected ? `상태: ${selected}` : '상태'}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-[999] overflow-hidden py-1">
          {items.map((item, i) => (
            <div key={i}>
              {item.children ? (
                <>
                  <button
                    onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={11} className={`transition-transform ${expanded === item.label ? 'rotate-90' : ''}`} />
                  </button>
                  {expanded === item.label && item.children.map((child, j) => (
                    <button
                      key={j}
                      onClick={() => handleSelect(child)}
                      className={`w-full text-left px-5 py-1.5 text-[11px] transition-colors ${
                        selected === child.label ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </>
              ) : (
                item.onSelect || item.path ? (
                  <button
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${
                      selected === item.label ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <div className="px-3 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PathDropdown — 경로·모달 선택 (우상단 우)
// ─────────────────────────────────────────────────────────────

export function PathDropdown<S extends string, T extends string>({
  items,
  onNavigate,
}: {
  items: StatusItem[];
  onNavigate: (result: { state?: S; tab?: T; path?: string }) => void;
  accentColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item: StatusItem) => {
    if (item.onSelect) { item.onSelect(); setOpen(false); return; }
    if (item.path) {
      onNavigate({ path: item.path });
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-white/80 backdrop-blur-sm shadow-sm text-slate-600 hover:text-slate-900 hover:bg-white transition-colors border border-slate-200"
      >
        <span>경로</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-[999] overflow-hidden py-1">
          {items.map((item, i) => (
            <div key={i}>
              {item.children ? (
                <>
                  <button
                    onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={11} className={`transition-transform ${expanded === item.label ? 'rotate-90' : ''}`} />
                  </button>
                  {expanded === item.label && item.children.map((child, j) => (
                    <button
                      key={j}
                      onClick={() => handleSelect(child)}
                      className="w-full text-left px-5 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {child.label}
                    </button>
                  ))}
                </>
              ) : (
                item.path || item.onSelect ? (
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <div className="px-3 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** @deprecated PathDropdown으로 대체됨 */
export const StatusDropdown = PathDropdown;

// ─────────────────────────────────────────────────────────────
// QANavigator
// ─────────────────────────────────────────────────────────────

export function QANavigator<S extends string, T extends string>({
  appLabel, validStates, tabMap, onNavigate, accentColor = '#8736e3', placeholder,
}: {
  appLabel: string;
  validStates: S[];
  tabMap: Record<string, T>;
  onNavigate: (result: { state?: S; tab?: T; path?: string; modal?: string }) => void;
  accentColor?: string;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleGo = () => {
    const result = parseQAPath(input.trim(), validStates, tabMap);
    if (!result) { setError(true); setTimeout(() => setError(false), TIMER_MS.QA_STATE_RESET); return; }
    onNavigate(result);
    setInput('');
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-md">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleGo()}
        placeholder={placeholder ?? `경로 붙여넣기 후 Enter  예) ${appLabel} /dashboard # 모달명`}
        className={`w-[380px] text-[11px] font-mono bg-slate-50 border rounded-lg px-3 py-1.5 outline-none transition-colors placeholder:text-slate-300 ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-200'
        }`}
        onFocus={e => { if (!error) e.target.style.borderColor = accentColor; }}
        onBlur={e => { e.target.style.borderColor = ''; }}
      />
      <button onClick={handleGo}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-white flex-shrink-0"
        style={{ backgroundColor: accentColor }}>
        <ArrowRight size={13} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ResetButton
// ─────────────────────────────────────────────────────────────

export function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button onClick={onReset}
      className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
      title="초기화"
      aria-label="초기화">
      <Power size={14} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ScreenshotButton — 목업 박스 캡처 → PNG 다운로드
// ─────────────────────────────────────────────────────────────

export function ScreenshotButton({ targetId }: { targetId: string }) {
  const [state, setState] = useState<'idle' | 'capturing' | 'done' | 'error'>('idle');

  const capture = async () => {
    const el = document.getElementById(targetId);
    if (!el) { setState('error'); setTimeout(() => setState('idle'), TIMER_MS.STATE_FEEDBACK); return; }

    setState('capturing');
    try {
      // transform:scale() 일시 제거 → 캡처 → 복원
      const prevTransform = el.style.transform;
      const prevTransformOrigin = el.style.transformOrigin;
      el.style.transform = 'none';
      el.style.transformOrigin = 'top left';
      await new Promise(r => requestAnimationFrame(r));

      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scale: window.devicePixelRatio || 1,
      });

      el.style.transform = prevTransform;
      el.style.transformOrigin = prevTransformOrigin;

      canvas.toBlob(blob => {
        if (!blob) { setState('error'); setTimeout(() => setState('idle'), TIMER_MS.STATE_FEEDBACK); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockup-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setState('done');
        setTimeout(() => setState('idle'), TIMER_MS.LONG_TASK_FEEDBACK);
      }, 'image/png');
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), TIMER_MS.STATE_FEEDBACK);
    }
  };

  return (
    <button onClick={capture} title="목업 스크린샷 복사"
      className={`w-9 h-9 rounded-full shadow flex items-center justify-center transition-colors ${
        state === 'done'     ? 'bg-green-500 text-white' :
        state === 'error'    ? 'bg-red-400 text-white' :
        state === 'capturing'? 'bg-slate-400 text-white' :
        'bg-white/80 backdrop-blur-sm text-slate-500 hover:text-slate-800 hover:bg-white'
      }`}>
      {state === 'done'      ? <Check size={14} /> :
       state === 'capturing' ? <span className="text-[9px] font-bold">...</span> :
       <Camera size={14} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// QA 크롬 바
// ─────────────────────────────────────────────────────────────

function QATopBar<S extends string, T extends string>({
  deviceMode, setDeviceMode, screenLabel, stateItems, statusItems, onNavigate, accentColor,
}: {
  deviceMode: DeviceMode;
  setDeviceMode: (m: DeviceMode) => void;
  screenLabel: string;
  stateItems: StatusItem[];
  statusItems: StatusItem[];
  onNavigate: (result: { state?: S; tab?: T; path?: string; modal?: string }) => void;
  accentColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 h-[58px] flex-shrink-0">
      {/* 좌: 디바이스 토글 */}
      <DeviceToggle deviceMode={deviceMode} setDeviceMode={setDeviceMode} />
      {/* 중앙: 경로 배지 */}
      <ScreenBadge label={screenLabel} />
      {/* 우: 상태 + 경로 드롭다운 */}
      <div className="flex items-center gap-1.5">
        <StateDropdown items={stateItems} accentColor={accentColor} onNavigate={onNavigate as (result: { state?: string; tab?: string; path?: string }) => void} />
        <PathDropdown items={statusItems} onNavigate={onNavigate} accentColor={accentColor} />
      </div>
    </div>
  );
}

function QABottomBar<S extends string, T extends string>({
  appLabel, validStates, tabMap, onNavigate, onReset, accentColor, mockupId,
}: {
  appLabel: string;
  validStates: S[];
  tabMap: Record<string, T>;
  onNavigate: (result: { state?: S; tab?: T; path?: string; modal?: string }) => void;
  onReset: () => void;
  accentColor?: string;
  mockupId: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 h-[58px] flex-shrink-0">
      {/* 좌: 초기화 */}
      <ResetButton onReset={onReset} />
      {/* 중앙: 경로 네비게이터 */}
      <QANavigator
        appLabel={appLabel}
        validStates={validStates}
        tabMap={tabMap}
        onNavigate={onNavigate}
        accentColor={accentColor}
      />
      {/* 우: 스크린샷 */}
      <ScreenshotButton targetId={mockupId} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MockupShell
// ─────────────────────────────────────────────────────────────

let shellCounter = 0;

export function MockupShell<S extends string, T extends string>({
  appLabel,
  screenLabel,
  validStates,
  tabMap,
  stateItems = [],
  statusItems = [],
  onNavigate,
  onReset,
  accentColor = QA_ACCENT_COLOR,
  children,
  defaultDevice = 'desktop',
  containerClassName,
}: {
  appLabel: string;
  screenLabel: string;
  validStates: S[];
  tabMap: Record<string, T>;
  /** 우상단 상태 드롭다운 (로그인 여부 등 앱 상태) */
  stateItems?: StatusItem[];
  /** 우상단 경로 드롭다운 메뉴 */
  statusItems?: StatusItem[];
  onNavigate: (result: { state?: S; tab?: T; path?: string; modal?: string }) => void;
  onReset: () => void;
  accentColor?: string;
  children: React.ReactNode;
  defaultDevice?: DeviceMode;
  containerClassName?: string;
}) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(defaultDevice);
  const scale = useViewportScale(deviceMode);
  const { w, h, radius } = DEVICE_BASE[deviceMode];

  // 고유 ID (스크린샷 대상 지정용)
  const mockupId = useRef(`qa-mockup-${++shellCounter}`).current;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-200 flex flex-col">
      {/* 상단 QA 바 */}
      <QATopBar
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        screenLabel={screenLabel}
        stateItems={stateItems}
        statusItems={statusItems}
        onNavigate={onNavigate}
        accentColor={accentColor}
      />

      {/* 목업 박스 */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div
          id={mockupId}
          style={{
            width: w, height: h,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            borderRadius: radius,
            flexShrink: 0,
            ['container-type' as string]: 'inline-size',
          } as CSSProperties}
          className={`overflow-hidden flex flex-col ${containerClassName ?? 'bg-white'}`}
        >
          <DeviceModeContext.Provider value={deviceMode}>
            {children}
          </DeviceModeContext.Provider>
        </div>
      </div>

      {/* 하단 QA 바 */}
      <QABottomBar
        appLabel={appLabel}
        validStates={validStates}
        tabMap={tabMap}
        onNavigate={onNavigate}
        onReset={onReset}
        accentColor={accentColor}
        mockupId={mockupId}
      />
    </div>
  );
}
