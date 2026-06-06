import { useState } from "react";

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login" | "pricing";

interface HeaderProps {
  current: Page;
  onNavigate: (p: Page) => void;
  variant?: "light" | "dark";
  isLoggedIn?: boolean;
}

export function Header({ current, onNavigate, variant = "light", isLoggedIn = true }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = variant === "dark";
  const headerBg = isDark
    ? "bg-[var(--cd-deep)]/70 border-white/10"
    : "bg-white/70 border-neutral-200/80";

  const idleText = isDark ? "text-white/70" : "text-neutral-500";
  const hoverText = isDark ? "hover:text-white" : "hover:text-[var(--cp)]";
  const activeText = isDark ? "text-white" : "text-[var(--cp)]";

  const navItems: { label: string; page?: Page }[] = [
    { label: "광고주", page: "advertiser" },
    { label: "인플루언서", page: "influencer" },
    { label: "캠페인", page: "campaigns" },
    { label: "블로그" },
    { label: "가격", page: "pricing" },
  ];

  const handleNavigate = (page?: Page) => {
    if (page) onNavigate(page);
    setMobileOpen(false);
  };

  const showLoginBanner = !isLoggedIn && current === "campaigns";

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md border-b ${headerBg} transition-colors`}>
      {showLoginBanner && (
        <div
          className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 text-center sm:flex-row sm:gap-2"
          style={{ background: "rgba(var(--cp-rgb),0.07)", borderBottom: "1px solid rgba(var(--cp-rgb),0.12)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: "var(--cd)" }}>
              <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.35"/>
              <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
            </svg>
            <span className="whitespace-nowrap" style={{ fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 500, color: "#4B5563" }}>
              캠페인 혜택·신청 정보는 로그인 후 확인할 수 있어요
            </span>
          </span>
          <button
            onClick={() => onNavigate("login")}
            className="whitespace-nowrap font-semibold hover:underline"
            style={{ fontSize: "clamp(11px, 3vw, 13px)", color: "var(--cd)" }}
          >
            로그인하기 →
          </button>
        </div>
      )}
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* 로고 */}
        <button
          onClick={() => onNavigate("main")}
          className="flex items-center rounded-md px-2 py-1.5 transition-all duration-150 hover:bg-neutral-100/80 active:scale-[0.97]"
        >
          <span className={isDark ? "text-white" : "text-neutral-950"} style={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.02em" }}>
            WELLINK<span style={{ fontWeight: 800, background: "linear-gradient(135deg, #2563EB 0%, #2563EB 65%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>.AI</span>
          </span>
        </button>

        {/* PC 네비 */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = item.page && current === item.page;
            return (
              <button
                key={item.label}
                onClick={() => item.page && onNavigate(item.page)}
                className={`relative inline-flex h-10 items-center rounded-full px-4 transition-colors duration-200 ${
                  active ? activeText : `${idleText} ${hoverText}`
                }`}
                style={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full"
                    style={{ bottom: -14, background: "var(--cp)" }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* PC 우측 버튼 */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={() => onNavigate("login")}
            className={`inline-flex h-10 items-center rounded-full px-4 transition-colors ${
              isDark ? "text-white/85 hover:text-white" : "text-neutral-600 hover:text-[var(--cp)]"
            }`}
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            로그인
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="inline-flex h-10 items-center rounded-full px-4 text-white transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_8px_18px_-8px_rgba(var(--cp-rgb),0.55)]"
            style={{
              fontSize: 14,
              fontWeight: 600,
              background: "linear-gradient(135deg, var(--cp) 0%, var(--cm) 100%)",
              boxShadow: "0 4px 12px -6px rgba(var(--cp-rgb),0.35)",
            }}
          >
            무료로 시작하기
          </button>
        </div>

        {/* 모바일 우측: 로그인 + 햄버거 */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            onClick={() => onNavigate("login")}
            className={`inline-flex h-11 items-center rounded-full px-3 transition-colors ${
              isDark ? "text-white/85" : "text-neutral-600"
            }`}
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            로그인
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              isDark ? "text-white/70 hover:text-white" : "text-neutral-600 hover:text-neutral-950"
            }`}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileOpen && (
        <div
          className={`border-t lg:hidden ${isDark ? "border-white/10 bg-[var(--cd-deep)]/95" : "border-neutral-100 bg-white/95"} backdrop-blur-md`}
        >
          <nav className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3">
            {navItems.map((item) => {
              const active = item.page && current === item.page;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.page)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3.5 transition-colors ${
                    active
                      ? isDark ? "text-white bg-white/10" : "text-[var(--cp)] bg-[var(--cbg1)]"
                      : isDark ? "text-white/70 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                  }`}
                  style={{ fontSize: 16, fontWeight: active ? 600 : 500 }}
                >
                  {item.label}
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--cp)]" />
                  )}
                </button>
              );
            })}
            <div className="mt-3 border-t pt-3" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB" }}>
              <button
                onClick={() => { onNavigate("login"); setMobileOpen(false); }}
                className="w-full rounded-xl px-3 py-3.5 text-left text-white transition-all"
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, var(--cp) 0%, var(--cm) 100%)",
                }}
              >
                무료로 시작하기
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
