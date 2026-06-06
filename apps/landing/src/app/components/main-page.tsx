import { useState, useEffect, useRef, useCallback, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BackgroundGrid, FlowLines } from "./background-grid";
import { Reveal } from "./reveal";
import { CardReveal } from "./card-reveal";
import { AnimatedNumber, useInView, useCountUp } from "./count-up";

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login" | "pricing";

export function ScrollIndicator() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed bottom-3 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500 ${hidden ? "opacity-0" : "opacity-100"}`}
    >
      <span className="text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em" }}>SCROLL</span>
      <div className="animate-bounce">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 9l6 6 6-6" stroke="var(--cp)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function AnimatedHeroH1() {
  const [show, setShow] = useState(false);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  useEffect(() => {
    if (reduced) { setShow(true); return; }
    const id = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(id);
  }, [reduced]);

  const f = (delay: number): CSSProperties => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(14px)",
    transition: reduced ? "none" : `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 500ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });

  return (
    <h1
      className="max-w-[860px] text-neutral-950"
      style={{
        marginTop: "clamp(20px, 2.5vh, 32px)",
        fontSize: "clamp(32px, 5.4vw, 64px)",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "-0.035em",
        wordBreak: "keep-all",
      }}
    >
      <span style={{ display: "block", ...f(80) }}>
        <span className="gradient-text-loop">핏이 맞는</span> 브랜드와
      </span>
      <span style={{ display: "block", ...f(200) }}>인플루언서가 만납니다</span>
    </h1>
  );
}
function HeroLiveStats({ fade }: { fade: (d: number) => CSSProperties }) {
  const { ref, inView } = useInView(0.1);
  const brands = useCountUp(40, 1000, inView);
  const influencers = useCountUp(50000, 1400, inView);
  const ctr = useCountUp(20, 1000, inView);

  const stats = [
    { value: `${brands}개+`, label: "제휴 브랜드" },
    { value: `${influencers >= 10000 ? `${Math.floor(influencers / 10000)}만+` : influencers.toLocaleString()}명`, label: "인플루언서" },
    { value: `${ctr}%`, label: "평균 CTR" },
  ];

  return (
    <div
      ref={ref}
      className="flex items-center justify-center gap-4 sm:gap-12"
      style={{ marginTop: "clamp(28px, 4vh, 52px)", ...fade(520) }}
    >
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center gap-4 sm:gap-12">
          {i > 0 && <div className="h-8 w-px bg-neutral-200 shrink-0" />}
          <div className="text-center whitespace-nowrap">
            <div style={{ fontSize: "clamp(20px, 2.6vw, 28px)", fontWeight: 700, color: "var(--cp)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
            <div className="mt-1.5 text-neutral-400" style={{ fontSize: "clamp(12px, 1.4vw, 14px)", fontWeight: 500 }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MainPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <main className="relative w-full bg-white">
      <Hero onNavigate={onNavigate} heroViz="B" />
      <Reveal bg="bg-[var(--cbg1)]">
        <Reels />
      </Reveal>
      <Reveal bg="bg-gradient-to-b from-[var(--cbg1)] via-[var(--cbg2)] to-white" className="relative z-10">
        <Stats dashStyle="B" />
      </Reveal>
      <Reveal bg="bg-[var(--cbg2)]">
        <FitScoreExplainer />
      </Reveal>
      <Reveal bg="bg-white">
        <WhyWellink onNavigate={onNavigate} />
      </Reveal>
      <Reveal bg="bg-white">
        <CampaignPreview onNavigate={onNavigate} />
      </Reveal>
      <Reveal bg="bg-[var(--cbg2)]">
        <Pricing onNavigate={onNavigate} />
      </Reveal>
      <Reveal bg="bg-white">
        <FAQ />
      </Reveal>
      <Reveal bg="bg-white">
        <ContactCTA onNavigate={onNavigate} />
      </Reveal>
    </main>
  );
}

const SectionEyebrow = ({ children }: { children: ReactNode }) => (
  <span
    className="inline-flex items-center rounded-full px-3 py-1"
    style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}
  >
    {children}
  </span>
);

// ── Hero Key Visual Options (dev preview A/B/C) ─────────────────────────

function HeroVisualA() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px]" style={{ zIndex: 1 }}>
      <div className="absolute inset-x-0 top-0 h-32" style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice" fill="none">
        <defs>
          <radialGradient id="hvA-glow" cx="50%" cy="100%" r="50%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="600" cy="220" rx="300" ry="110" fill="url(#hvA-glow)" />
        <circle cx="600" cy="155" r="28" fill="white" stroke="#2563EB" strokeWidth="2.5" strokeOpacity="0.55" />
        <circle cx="600" cy="155" r="18" fill="#2563EB" fillOpacity="0.06" />
        <path d="M82,72 C280,72 330,155 600,155" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 4" />
        <path d="M170,150 C360,150 400,155 600,155" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M80,186 C280,186 370,162 600,155" stroke="#2563EB" strokeWidth="0.8" strokeOpacity="0.15" strokeDasharray="3 5" />
        <circle cx="82" cy="72" r="14" fill="white" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.38" />
        <circle cx="170" cy="150" r="10" fill="white" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="80" cy="186" r="8" fill="white" stroke="#2563EB" strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M600,155 C800,155 856,72 1118,72" stroke="#10B981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 4" />
        <path d="M600,155 C800,155 842,150 1030,150" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M600,155 C820,162 900,188 1120,188" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.15" strokeDasharray="3 5" />
        <circle cx="1118" cy="72" r="14" fill="white" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.38" />
        <circle cx="1030" cy="150" r="10" fill="white" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="1120" cy="188" r="8" fill="white" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.2" />
        <circle cx="338" cy="116" r="3.5" fill="#2563EB" fillOpacity="0.28" />
        <circle cx="456" cy="87" r="2.5" fill="#2563EB" fillOpacity="0.2" />
        <circle cx="752" cy="85" r="3.5" fill="#10B981" fillOpacity="0.28" />
        <circle cx="866" cy="113" r="2.5" fill="#10B981" fillOpacity="0.2" />
      </svg>
    </div>
  );
}

function HeroVisualB() {
  const steps: { label: string; icon: ReactNode }[] = [
    {
      label: "브랜드 등록",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M8 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 13v2M10 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "크리에이터 연결",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 8v2M20 9h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="18" cy="12" r="2.5" stroke="currentColor" strokeWidth="2"/>
          <path d="M15.5 14.5L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "성과 측정",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 14l3-4 3 3 4-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "성과 관리",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 3.5V2.5a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];
  return (
    <div className="w-full" style={{ marginTop: "clamp(32px, 4vh, 56px)", maxWidth: 960, marginLeft: "auto", marginRight: "auto" }}>
      <div className="relative flex items-start justify-between">
        {/* connector — centered on icon (h-14=56px); top = label(13px) + gap(14px) + half(28px) = 55px */}
        <div
          className="absolute rounded-full"
          style={{
            left: "calc(11% + 28px)", right: "calc(11% + 28px)",
            top: "55px",
            height: "3px",
            background: "linear-gradient(to right, var(--cp), var(--cs))",
            opacity: 0.45,
          }}
        />
        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex w-[22%] flex-col items-center gap-3.5">
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: i === 0 ? "var(--cp)" : "#c0c0c0",
                lineHeight: 1,
              }}
            >
              단계 {i + 1}
            </span>
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={
                i === 0
                  ? {
                      background: "var(--btn-gradient)",
                      color: "#fff",
                      boxShadow: "0 0 0 8px rgba(var(--cp-rgb),0.09), 0 4px 14px -4px rgba(var(--cp-rgb),0.32)",
                    }
                  : {
                      border: "3px solid rgba(var(--cp-rgb),0.32)",
                      color: "var(--cp)",
                      background: "#fff",
                    }
              }
            >
              {s.icon}
            </div>
            <p
              className="text-center"
              style={{
                fontSize: "clamp(14px, 2.8vw, 16px)",
                fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? "#333" : "#888",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                wordBreak: "keep-all",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroVisualC() {
  const matches = [
    { brand: "스웻이프", handle: "@fit_creator_h", score: 92, pct: "92%", status: "계약 완료", scolor: "var(--cp)" },
    { brand: "러닝랩", handle: "@running.diary", score: 85, pct: "85%", status: "협상 중", sColor: "var(--cs)" },
    { brand: "요가클럽", handle: "@yoga_daily_kr", score: 78, pct: "78%", status: "검토 중", sColor: "#aaa" },
  ];
  return (
    <div className="w-full" style={{ marginTop: "clamp(20px, 2.5vh, 36px)", maxWidth: 860, marginLeft: "auto", marginRight: "auto" }}>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-[0_8px_32px_-16px_rgba(0,0,0,0.10)]" style={{ borderColor: "rgba(var(--cp-rgb),0.15)" }}>
        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--cp)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6B7280" }}>매칭 현황</span>
          </div>
          <span className="rounded-full px-2.5 py-0.5" style={{ fontSize: 12, fontWeight: 600, color: "var(--cp)", background: "rgba(var(--cp-rgb),0.08)" }}>실시간</span>
        </div>
        <div className="grid grid-cols-3 divide-x" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {[
            { t: "매칭 완료", v: "23건", n: "이번 주" },
            { t: "평균 Fit-Score", v: "88점", n: "상위 10%" },
            { t: "평균 전환율 향상", v: "+34%", n: "업계 대비" },
          ].map((s, i) => (
            <div key={i} className="px-5 py-3">
              <p className="text-neutral-400" style={{ fontSize: 12, fontWeight: 500 }}>{s.t}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.2 }}>{s.v}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{s.n}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2.5 border-t px-5 py-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {matches.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-14 shrink-0 truncate text-neutral-500" style={{ fontSize: 12 }}>{m.brand}</span>
              <span className="w-28 shrink-0 text-neutral-400" style={{ fontSize: 12 }}>{m.handle}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full" style={{ width: m.pct, background: "linear-gradient(to right, var(--cp), var(--cs))" }} />
              </div>
              <span className="w-8 shrink-0 text-right" style={{ fontSize: 12, fontWeight: 700, color: "var(--cp)" }}>{m.score}</span>
              <span className="w-16 shrink-0 text-right" style={{ fontSize: 12, fontWeight: 600, color: m.sColor }}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ onNavigate, heroViz }: { onNavigate: (p: Page) => void; heroViz: "A" | "B" | "C" }) {
  const [show, setShow] = useState(false);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  useEffect(() => {
    if (reduced) { setShow(true); return; }
    const id = setTimeout(() => setShow(true), 30);
    return () => clearTimeout(id);
  }, [reduced]);

  const fade = (delay: number): CSSProperties => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(8px)",
    transition: reduced
      ? "none"
      : `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 500ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });


  return (
    <section
      className="relative overflow-hidden bg-white [scroll-snap-align:start]"
    >
      <BackgroundGrid />
      <FlowLines className="opacity-50" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(var(--cl-rgb),0.4), rgba(var(--cs-rgb),0.05) 60%, transparent 80%)",
        }}
      />
      <div
        className="hero-content-wrap relative z-10 mx-auto flex max-w-[1280px] flex-col items-center px-4 sm:px-6 lg:px-10 text-center"
        style={{
          paddingTop: "clamp(52px, 7vh, 80px)",
          paddingBottom: heroViz === "B" ? "clamp(48px, 6vh, 80px)" : heroViz === "C" ? "clamp(4px, 0.5vh, 8px)" : "clamp(40px, 5vh, 64px)",
        }}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 sm:px-4 py-2 backdrop-blur whitespace-nowrap"
          style={{ color: "var(--cp)", border: "1px solid rgba(var(--cp-rgb),0.22)", fontSize: "clamp(12px, 3.2vw, 15px)", fontWeight: 600, letterSpacing: "-0.005em", ...fade(0) }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--cm)" }} />
          웰니스·피트니스 인플루언서 마케팅 플랫폼
        </span>

        <AnimatedHeroH1 />

        <HeroLiveStats fade={fade} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-[720px]" style={{ marginTop: "clamp(32px, 4vh, 56px)", ...fade(600) }}>
          {/* 광고주 패널 */}
          <div
            className="relative overflow-hidden flex flex-col gap-6 rounded-3xl p-7 text-left"
            style={{
              background: "linear-gradient(145deg, var(--cbg1) 0%, var(--cbg3) 100%)",
              border: "1.5px solid rgba(var(--cp-rgb),0.18)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(var(--cp-rgb),0.14) 0%, transparent 60%)" }} />
            <div className="relative">
              <span className="inline-block rounded-full px-2.5 py-1" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>광고주</span>
              <p className="mt-3 text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.025em" }}>
                진짜 구매로 이어지게 하는<br />인플루언서만 추천해요
              </p>
              <ul className="mt-5 flex flex-col gap-2.5" style={{ paddingLeft: 16 }}>
                {["Fit-Score 기반 추천", "캠페인·정산 플랫폼 처리", "실시간 성과 대시보드"].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-neutral-600" style={{ fontSize: 15 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" style={{ marginTop: 4 }}><path d="M2.5 7l3 3L11.5 4" stroke="var(--cp)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => onNavigate("advertiser")}
              className="relative w-full rounded-full py-3.5 text-white transition-all hover:translate-y-[-1px] active:scale-[0.97]"
              style={{ fontSize: 15, fontWeight: 600, background: "var(--btn-gradient)", boxShadow: "0 6px 18px -6px rgba(var(--cp-rgb),0.4)", letterSpacing: "-0.01em" }}
            >
              광고주로 시작하기
            </button>
          </div>

          {/* 인플루언서 패널 */}
          <div
            className="relative overflow-hidden flex flex-col gap-6 rounded-3xl p-7 text-left"
            style={{
              background: "#fff",
              border: "1.5px solid rgba(var(--cp-rgb),0.22)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(var(--cp-rgb),0.07) 0%, transparent 60%)" }} />
            <div className="relative">
              <span className="inline-block rounded-full px-2.5 py-1" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>인플루언서 · 무료</span>
              <p className="mt-3 text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.025em" }}>
                팔로워가 아닌 핏이 맞는<br />브랜드와 연결돼요
              </p>
              <ul className="mt-5 flex flex-col gap-2.5" style={{ paddingLeft: 16 }}>
                {["팔로워 규모 관계없이 참여", "가입비·수수료 완전 무료", "Fit-Score 높으면 우선 추천"].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-neutral-600" style={{ fontSize: 15 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" style={{ marginTop: 4 }}><path d="M2.5 7l3 3L11.5 4" stroke="var(--cp)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => onNavigate("influencer")}
              className="relative w-full rounded-full py-3.5 transition-all hover:translate-y-[-1px] active:scale-[0.97]"
              style={{ fontSize: 15, fontWeight: 600, color: "var(--cp)", border: "1.5px solid rgba(var(--cp-rgb),0.35)", letterSpacing: "-0.01em", background: "transparent" }}
            >
              인플루언서로 시작하기
            </button>
          </div>
        </div>
                {heroViz === "B" && <HeroVisualB />}
        {heroViz === "C" && <HeroVisualC />}
      </div>
      {heroViz === "A" && <HeroVisualA />}

    </section>
  );
}

function Sparkline({ bars, up }: { bars: number[]; up: boolean }) {
  return (
    <svg width="80" height="28" viewBox="0 0 80 28" fill="none" aria-hidden="true">
      {bars.map((h, i) => (
        <rect key={i} x={i * 8} y={28 - (h * 28 / 100)} width="5" height={h * 28 / 100} rx="1.5"
          fill={up ? "var(--cp)" : "#F87171"}
          opacity={0.2 + (i / bars.length) * 0.8}
        />
      ))}
    </svg>
  );
}

function SparklineFull({ bars, up }: { bars: number[]; up: boolean }) {
  return (
    <svg width="100%" height="72" viewBox="0 0 80 72" preserveAspectRatio="none" fill="none" aria-hidden="true">
      {bars.map((h, i) => (
        <rect key={i} x={i * 8} y={72 - (h * 72 / 100)} width="5" height={h * 72 / 100} rx="1.5"
          fill={up ? "var(--cp)" : "#F87171"}
          opacity={0.15 + (i / bars.length) * 0.85}
        />
      ))}
    </svg>
  );
}

function Stats({ dashStyle = "A" }: { dashStyle?: "A" | "B" | "C" }) {
  const { ref, inView } = useInView(0.2);
  const reach = useCountUp(386000, 1600, inView);
  const share = useCountUp(1200,   1400, inView);
  const save  = useCountUp(856,    1200, inView);
  const viral = useCountUp(17,     1000, inView);

  const [animated, setAnimated] = useState(false);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  useEffect(() => { if (inView) setAnimated(true); }, [inView]);

  const CIRC   = 2 * Math.PI * 48;
  const CIRC_B = 2 * Math.PI * 68;

  const viralMetrics = [
    { label: "총 도달",    value: reach >= 10000 ? (reach / 10000).toFixed(1) + "만" : reach.toLocaleString(), trend: "+2.1%", up: true,  bars: [45,52,48,60,58,72,68,82,88,100], bg: "var(--cbg1)" },
    { label: "공유",        value: share >= 1000  ? (share / 1000).toFixed(1)   + "k"  : share.toLocaleString(),  trend: "-1.5%", up: false, bars: [95,88,80,85,72,78,68,74,65,58],  bg: "var(--cbg2)" },
    { label: "저장",        value: save.toLocaleString(), trend: "+0.4%", up: true,  bars: [38,45,52,48,60,58,68,72,80,90],  bg: "var(--cbg3)" },
    { label: "바이럴 계수", value: (viral / 10).toFixed(1), trend: "+4x",  up: true,  bars: [25,32,38,45,52,60,68,78,88,100], bg: "var(--cbg4)" },
  ];

  const profileStats = [
    { label: "팔로워 수",   value: "24,512", trend: "+0.5%",  up: true  },
    { label: "평균 도달률", value: "18.2%",  trend: "-1.2%p", up: false },
    { label: "참여율",      value: "3.6%",   trend: "+0.1%p", up: true  },
  ];

  const captionStats = [
    { label: "총 캡션 수",  value: "25" },
    { label: "피드 캡션",   value: "7"  },
    { label: "릴스 캡션",   value: "18" },
  ];

  const tags = [
    { t: "스웻이프",     w: 900, up: false },
    { t: "sweat",       w: 800, up: true  },
    { t: "운동복",       w: 800, up: true  },
    { t: "캡슐",         w: 750, up: true  },
    { t: "캡슐세제",     w: 750, up: true  },
    { t: "운동",         w: 650, up: true  },
    { t: "운동복세제",   w: 650, up: true  },
    { t: "세탁",         w: 580, up: false },
    { t: "하나로",       w: 580, up: false },
    { t: "기능성",       w: 580, up: false },
    { t: "냄새",         w: 530, up: false },
    { t: "없이",         w: 530, up: false },
    { t: "edone",       w: 400, up: false },
    { t: "everydayis1rm", w: 400, up: false },
    { t: "세제",         w: 400, up: false },
    { t: "제거",         w: 400, up: false },
    { t: "케이",         w: 400, up: false },
    { t: "직접",         w: 400, up: false },
    { t: "섬유",         w: 400, up: false },
    { t: "솔루션",       w: 400, up: false },
    { t: "일반",         w: 400, up: false },
    { t: "캡슐세제추천", w: 400, up: false },
    { t: "간편한",       w: 400, up: false },
    { t: "섬유유연제",   w: 400, up: false },
    { t: "선내제거",     w: 400, up: false },
  ];

  // -- viral metric icons
  const metricIcon = (label: string) => {
    const c = "text-[var(--cp)] opacity-60";
    if (label.includes("도달")) return (
      <svg className={c} width="16" height="16" viewBox="0 0 20 20" fill="none">
        <ellipse cx="10" cy="10" rx="8" ry="5.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    );
    if (label.includes("공유")) return (
      <svg className={c} width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M15 8l-3-3-3 3M12 5v8M5 12v2a2 2 0 002 2h6a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (label.includes("바이럴")) return (
      <svg className={c} width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M3 15l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (label.includes("저장")) return (
      <svg className={c} width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M5 3h10a1 1 0 011 1v12.5l-6-3.5-6 3.5V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    return (
      <svg className={c} width="16" height="16" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="13" width="3" height="4" rx="0.5" fill="currentColor"/>
        <rect x="8.5" y="9" width="3" height="8" rx="0.5" fill="currentColor"/>
        <rect x="14" y="5" width="3" height="12" rx="0.5" fill="currentColor"/>
      </svg>
    );
  };

  const donutSmall = (
    <svg width="108" height="108" viewBox="0 0 120 120" aria-label="릴스 72%, 피드 28% 비율">
      <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="20" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="var(--cp)" strokeWidth="20" strokeLinecap="round"
        strokeDasharray={animated ? `${CIRC * 0.72} ${CIRC}` : `0 ${CIRC}`}
        style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px", transition: reduced ? "none" : "stroke-dasharray 1200ms cubic-bezier(0.22,1,0.36,1) 200ms" }}
      />
      <text x="60" y="57" textAnchor="middle" style={{ fontSize: 16, fontWeight: 700, fill: "#111827" }}>72%</text>
      <text x="60" y="73" textAnchor="middle" style={{ fontSize: 12, fill: "#9ca3af" }}>릴스</text>
    </svg>
  );

  const donutLarge = (
    <svg className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px]" viewBox="0 0 160 160" aria-label="릴스 72%, 피드 28% 비율">
      <defs>
        <linearGradient id="donutGradB" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--cp)" />
          <stop offset="100%" stopColor="var(--cs)" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="68" fill="none" stroke="#f3f4f6" strokeWidth="22" />
      <circle cx="80" cy="80" r="68" fill="none" stroke="url(#donutGradB)" strokeWidth="22" strokeLinecap="round"
        strokeDasharray={animated ? `${CIRC_B * 0.72} ${CIRC_B}` : `0 ${CIRC_B}`}
        style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px", transition: reduced ? "none" : "stroke-dasharray 1200ms cubic-bezier(0.22,1,0.36,1) 200ms" }}
      />
      <text x="80" y="74" textAnchor="middle" style={{ fontSize: 24, fontWeight: 700, fill: "#111827" }}>72%</text>
      <text x="80" y="95" textAnchor="middle" style={{ fontSize: 14, fill: "#9ca3af" }}>릴스</text>
    </svg>
  );

  const legendAndCaption = (
    <div>
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--cp)" }} />
          <span className="text-neutral-600" style={{ fontSize: 14 }}>릴스 <strong style={{ color: "#111827" }}>72%</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          <span className="text-neutral-600" style={{ fontSize: 14 }}>피드 <strong style={{ color: "#111827" }}>28%</strong></span>
        </div>
      </div>
      <div className="space-y-2 border-t border-neutral-100 pt-3">
        {captionStats.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-5">
            <span className="shrink-0 whitespace-nowrap text-neutral-400" style={{ fontSize: 12 }}>{s.label}</span>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{s.value}</span>
              <span className="text-neutral-400" style={{ fontSize: 12 }}>↓0.0%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const wordCloudSection = (
    <div className="flex-1">
      <div className="mb-0.5 flex items-center justify-between">
        <p className="text-neutral-500" style={{ fontSize: 12, fontWeight: 600 }}>캡션 워드클라우드</p>
        <span className="text-neutral-400" style={{ fontSize: 12 }}>@sweat_if · 캡션 태그 25개 기준</span>
      </div>
      <p className="mb-3 text-neutral-400" style={{ fontSize: 12 }}>최근 7일 기준 상승/하락 단어에 아이콘 표시</p>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--cm)" }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--cp)" }} />상승
        </span>
        <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#9ca3af" }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-300" />하락
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag.t} className="inline-flex items-center gap-0.5 rounded-full px-3 py-1.5"
            style={{
              fontSize: tag.w >= 700 ? 14 : 12,
              fontWeight: tag.w >= 500 ? 600 : 500,
              background: tag.w >= 700 ? "#fff" : "#f9fafb",
              color: tag.w >= 700 ? "#111827" : tag.w >= 500 ? "#374151" : "#9ca3af",
              border: `1px solid ${tag.w >= 700 ? "rgba(var(--cp-rgb),0.22)" : "#e5e7eb"}`,
              boxShadow: tag.w >= 700 ? "0 1px 4px -1px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {tag.t}
            {tag.up && <span style={{ fontSize: 12, color: "var(--cp)", fontWeight: 700, lineHeight: 1 }}>↑</span>}
          </span>
        ))}
      </div>
    </div>
  );

  const dashHeaderLight = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-neutral-950 whitespace-nowrap" style={{ fontSize: 16, fontWeight: 700 }}>바이럴 지표</span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: "var(--cbg1)", fontSize: 12, fontWeight: 600, color: "var(--cm)" }}>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--cp)" }} />ready
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {(["일간", "주간", "월간"] as const).map((t, i) => (
            <span key={t} className="rounded-md px-2 py-1 sm:px-3 sm:py-1.5 whitespace-nowrap" style={{ fontSize: 12, fontWeight: 600, cursor: "default", background: i === 0 ? "rgba(var(--cp-rgb),0.10)" : "transparent", color: i === 0 ? "var(--cp)" : "#ccc" }}>{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <p className="text-neutral-400" style={{ fontSize: 11 }}>전날 대비 05. 20. 오전 09:00:00 기준 데이터를 비교합니다.</p>
        <p className="hidden text-neutral-400 sm:block" style={{ fontSize: 12 }}>마지막 동기화: 2026. 5. 20. 오전 9:00:02</p>
      </div>
    </>
  );

  const dashHeaderDark = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-6 sm:py-4 lg:px-8" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="whitespace-nowrap" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>바이럴 지표</span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: "rgba(255,255,255,0.10)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--cp)" }} />ready
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {(["일간", "주간", "월간"] as const).map((t, i) => (
            <span key={t} className="rounded-md px-2 py-1 sm:px-3 sm:py-1.5 whitespace-nowrap" style={{ fontSize: 12, fontWeight: 600, cursor: "default", background: i === 0 ? "rgba(var(--cp-rgb),0.20)" : "transparent", color: i === 0 ? "var(--cp)" : "rgba(255,255,255,0.30)" }}>{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-b px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>전날 대비 05. 20. 오전 09:00:00 기준 데이터를 비교합니다.</p>
        <p className="hidden sm:block" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>마지막 동기화: 2026. 5. 20. 오전 9:00:02</p>
      </div>
    </>
  );

  const fadeUp = (d: number): CSSProperties => ({
    opacity: animated ? 1 : 0,
    transform: animated ? "translateY(0)" : "translateY(16px)",
    transition: reduced ? "none" : `opacity 500ms cubic-bezier(0.22,1,0.36,1) ${d}ms, transform 440ms cubic-bezier(0.22,1,0.36,1) ${d}ms`,
  });
  const fadeLeft = (d: number): CSSProperties => ({
    opacity: animated ? 1 : 0,
    transform: animated ? "translateX(0)" : "translateX(-24px)",
    transition: reduced ? "none" : `opacity 580ms cubic-bezier(0.22,1,0.36,1) ${d}ms, transform 520ms cubic-bezier(0.22,1,0.36,1) ${d}ms`,
  });
  const fadeRight = (d: number): CSSProperties => ({
    opacity: animated ? 1 : 0,
    transform: animated ? "translateX(0)" : "translateX(24px)",
    transition: reduced ? "none" : `opacity 580ms cubic-bezier(0.22,1,0.36,1) ${d}ms, transform 520ms cubic-bezier(0.22,1,0.36,1) ${d}ms`,
  });

  return (
    <section className="relative bg-white pt-14 sm:pt-20 lg:pt-24 pb-0">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <SectionEyebrow>대시보드</SectionEyebrow>
          <h2
            className="mt-4 text-neutral-950"
            style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}
          >
            실제 캠페인의 바이럴 지표
          </h2>
        </div>

        <CardReveal>
          <div ref={ref} className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.10)]">

            {/* ── Style A: 아이콘 + 강조 ── */}
            {dashStyle === "A" && (
              <>
                {dashHeaderLight}
                <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4 lg:gap-4 lg:p-5">
                  {viralMetrics.map((m, i) => (
                    <div key={m.label} className="relative rounded-2xl p-3 sm:p-4 lg:p-5" style={{ background: m.bg, ...fadeUp(i * 70) }}>
                      <div className="absolute right-3 top-3">{metricIcon(m.label)}</div>
                      <p className="pr-5 text-neutral-500 whitespace-nowrap" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>{m.label}</p>
                      <p className="mt-2" style={{ fontSize: "clamp(17px, 1.8vw, 24px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#111827", lineHeight: 1.1 }}>{m.value}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span style={{ fontSize: 12, fontWeight: 600, color: m.up ? "var(--cm)" : "#F87171" }}>{m.trend}</span>
                        <Sparkline bars={m.bars} up={m.up} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-neutral-100 px-4 py-3 lg:px-5">
                  <p className="mb-2 text-neutral-500" style={{ fontSize: 12, fontWeight: 600 }}>프로필 인사이트</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {profileStats.map((s) => (
                      <div key={s.label} className="rounded-xl p-3" style={{ background: "#f9fafb" }}>
                        <p className="text-neutral-400" style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</p>
                        <p className="mt-1" style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{s.value}</p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: s.up ? "var(--cm)" : "#F87171" }}>{s.trend}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-6 border-t border-neutral-100 p-4 lg:flex-row lg:items-start lg:p-6">
                  <div className="shrink-0" style={fadeLeft(360)}>
                    <p className="mb-0.5 text-neutral-500" style={{ fontSize: 12, fontWeight: 600 }}>캡션 구성</p>
                    <p className="mb-4 text-neutral-400" style={{ fontSize: 12 }}>최근 수집한 캡션 중 피드와 릴스의 비율입니다.</p>
                    <div className="flex items-center gap-4 sm:gap-6">{donutSmall}{legendAndCaption}</div>
                  </div>
                  <div className="hidden w-px self-stretch bg-neutral-100 lg:block" />
                  <div className="flex-1" style={fadeRight(440)}>{wordCloudSection}</div>
                </div>
              </>
            )}

            {/* ── Style B: 도넛 히어로 ── */}
            {dashStyle === "B" && (
              <>
                {dashHeaderLight}
                <div className="flex flex-col lg:flex-row">
                  <div className="flex flex-col border-b border-neutral-100 p-4 sm:p-6 lg:w-[42%] lg:border-b-0 lg:border-r lg:p-8" style={fadeLeft(0)}>
                    <p className="mb-1 text-neutral-500" style={{ fontSize: 12, fontWeight: 600 }}>캡션 구성</p>
                    <p className="mb-5 text-neutral-400" style={{ fontSize: 12 }}>최근 수집한 캡션 중 피드와 릴스의 비율</p>
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="shrink-0">{donutLarge}</div>
                      <div className="flex-1 min-w-0 pt-2">
                        <div className="grid gap-y-2.5" style={{ gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "var(--cp)" }} />
                            <span className="text-neutral-500 whitespace-nowrap" style={{ fontSize: 12 }}>릴스</span>
                          </div>
                          <strong style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>72%</strong>

                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-200" />
                            <span className="text-neutral-500 whitespace-nowrap" style={{ fontSize: 12 }}>피드</span>
                          </div>
                          <strong style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>28%</strong>

                          <div className="col-span-2 border-t border-neutral-100 my-0.5" />

                          {captionStats.flatMap((s) => [
                            <span key={s.label + "-l"} className="text-neutral-400 whitespace-nowrap" style={{ fontSize: 12 }}>{s.label}</span>,
                            <span key={s.label + "-v"} style={{ fontSize: 14, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{s.value}</span>,
                          ])}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-3 sm:p-4 lg:flex lg:flex-col lg:p-6" style={fadeRight(80)}>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:flex-1">
                      {viralMetrics.map((m, i) => (
                        <div key={m.label} className={`rounded-2xl p-3 sm:p-4 ${i >= 2 ? "hidden lg:flex" : "flex"} flex-col gap-2`} style={{ background: m.bg, ...fadeUp(160 + i * 80) }}>
                          <p className="text-neutral-500 whitespace-nowrap" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>{m.label}</p>
                          <p style={{ fontSize: "clamp(20px,2vw,26px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#111827", lineHeight: 1.1 }}>{m.value}</p>
                          <div className="flex-1 flex items-end overflow-hidden rounded-lg">
                            <SparklineFull bars={m.bars} up={m.up} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: m.up ? "var(--cm)" : "#F87171" }}>{m.trend}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden border-t border-neutral-100 p-4 lg:block lg:p-6" style={fadeUp(320)}>{wordCloudSection}</div>
              </>
            )}

            {/* ── Style C: 다크 패널 ── */}
            {dashStyle === "C" && (
              <>
                <div style={{ background: "var(--cd)" }}>
                  {dashHeaderDark}
                  <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4 lg:gap-4 lg:p-5">
                    {viralMetrics.map((m, i) => (
                      <div key={m.label} className="rounded-2xl p-3 sm:p-4 lg:p-5" style={{ background: "rgba(255,255,255,0.07)", ...fadeUp(i * 70) }}>
                        <p className="whitespace-nowrap" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4, color: "rgba(255,255,255,0.55)" }}>{m.label}</p>
                        <p className="mt-2" style={{ fontSize: "clamp(17px, 1.8vw, 24px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1 }}>{m.value}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span style={{ fontSize: 12, fontWeight: 600, color: m.up ? "var(--cp)" : "#F87171" }}>{m.trend}</span>
                          <Sparkline bars={m.bars} up={m.up} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t px-4 py-3 lg:px-5" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
                    <p className="mb-2" style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>프로필 인사이트</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {profileStats.map((s) => (
                        <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                          <p className="mt-1" style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{s.value}</p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: s.up ? "var(--cp)" : "#F87171" }}>{s.trend}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6 border-t border-neutral-100 p-4 lg:flex-row lg:items-start lg:p-6">
                  <div className="shrink-0" style={fadeLeft(360)}>
                    <p className="mb-0.5 text-neutral-500" style={{ fontSize: 12, fontWeight: 600 }}>캡션 구성</p>
                    <p className="mb-4 text-neutral-400" style={{ fontSize: 12 }}>최근 수집한 캡션 중 피드와 릴스의 비율입니다.</p>
                    <div className="flex items-center gap-4 sm:gap-6">{donutSmall}{legendAndCaption}</div>
                  </div>
                  <div className="hidden w-px self-stretch bg-neutral-100 lg:block" />
                  <div className="flex-1" style={fadeRight(440)}>{wordCloudSection}</div>
                </div>
              </>
            )}

          </div>
        </CardReveal>
      </div>
    </section>
  );
}

function FitScoreH2() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) { setShow(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShow(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  const ww = (i: number): CSSProperties => ({
    display: "inline-block",
    opacity: show ? 1 : 0,
    transform: show ? "none" : "translateY(-8px)",
    transition: reduced
      ? "none"
      : `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 400ms cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`,
  });

  const line1 = ["전환률이", "높은", "인플루언서만"];
  const line2 = ["선별해서", "보여드립니다"];

  return (
    <h2
      ref={ref}
      className="mt-4 text-neutral-950"
      style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em", wordBreak: "keep-all" }}
    >
      {line1.map((w, i) => (
        <span key={i} style={ww(i)}>{w}{i < line1.length - 1 ? " " : ""}</span>
      ))}
      <br />
      {line2.map((w, i) => (
        <span key={`l2-${i}`} style={ww(line1.length + i)}>{w}{i < line2.length - 1 ? " " : ""}</span>
      ))}
    </h2>
  );
}

function FitScoreExplainer() {
  const [barFilled, setBarFilled] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const scoreCount = useCountUp(87, 1000, barFilled);
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  useEffect(() => {
    const el = barRef.current;
    if (!el || reduced) { setBarFilled(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setBarFilled(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  const factors = [
    { num: "01", label: "카테고리 적합도", desc: "콘텐츠가 브랜드 카테고리와 얼마나 잘 맞는지 분석합니다." },
    { num: "02", label: "오디언스 특성", desc: "팔로워의 관심사·연령대가 브랜드 타겟과 겹치는 정도를 봅니다." },
    { num: "03", label: "전환 이력", desc: "과거 협업에서 실제 구매로 이어진 기록을 반영합니다." },
    { num: "04", label: "참여 품질", desc: "댓글·저장·공유 등 실질적인 관심 행동 지표를 봅니다." },
  ];
  return (
    <section className="relative bg-white pt-14 sm:pt-20 lg:pt-24 pb-14 sm:pb-20 lg:pb-24">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">

        {/* 2열 레이아웃: 좌측 텍스트 블록 + 우측 카드 스택 */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">

          {/* 좌측: eyebrow, H2, sub-copy, 피처드 카드 */}
          <div>
            <SectionEyebrow>FIT-SCORE</SectionEyebrow>
            <FitScoreH2 />
            <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>
              Fit-Score는 실제 브랜드 전환을 만들어낸 이력으로 산출됩니다. 팔로워·좋아요 수는 반영하지 않습니다.
            </p>

            {/* 피처드 카드 */}
            <article
              className="mt-10 relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 transition-[box-shadow,border-color,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--cp)]/30 hover:shadow-[0_18px_40px_-20px_rgba(var(--cp-rgb),0.28)] hover:-translate-y-1"
            >
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#6B7280" }}>SAMPLE SCORE</p>
              <div className="mt-3 flex items-end gap-2">
                <span
                  style={{
                    fontSize: "clamp(52px,8vw,88px)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    background: "linear-gradient(135deg,var(--cp),var(--cm))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {scoreCount}
                </span>
                <span className="mb-3 text-neutral-400" style={{ fontSize: 20, fontWeight: 500 }}>/100</span>
              </div>
              <div ref={barRef} className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: barFilled ? "87%" : "0%",
                    background: "linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)",
                    transition: reduced ? "none" : "width 1000ms cubic-bezier(0.22,1,0.36,1) 200ms",
                  }}
                />
              </div>
              <p className="mt-2 text-neutral-400" style={{ fontSize: 12 }}>실제 점수는 조합마다 상이합니다</p>
              <div className="mt-6 border-t border-neutral-100 pt-6">
                <p className="text-neutral-950" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
                  Fit-Score는 전환으로 이어진 실적을 수치화합니다
                </p>
                <p className="mt-3 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.7 }}>
                  87점은 실제 캠페인에서 높은 구매 전환을 만들어낸 인플루언서라는 의미입니다. 웰링크는 Fit-Score 60점 이상인 인플루언서를 추천합니다.
                </p>
              </div>
            </article>
          </div>

          {/* 우측: 4개 카드 세로 스택 */}
          <div className="flex flex-col gap-4">
            {factors.map((f, i) => (
              <CardReveal key={f.label} delay={i * 100}>
                <div
                  className="rounded-3xl border border-neutral-200/80 bg-white p-6 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)] transition-shadow duration-300"
                  style={{ boxShadow: "0 4px 14px -8px rgba(var(--cd-rgb),0.08)" }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--cp)" }}>{f.num}</p>
                  <p className="mt-4 text-neutral-950" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
                    {f.label}
                  </p>
                  <p className="mt-2 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.7 }}>
                    {f.desc}
                  </p>
                </div>
              </CardReveal>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

function WhyWellink({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const cards = [
    {
      num: "1",
      tag: "Fit-Score 선별",
      title: "브랜드 전환 실적이 있는 인플루언서만 선별됩니다",
      desc: "전환 이력·오디언스 정합성·신뢰도를 종합해 Fit-Score 60점 이상 인플루언서만 DB에 등록됩니다.",
      img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
      page: "advertiser" as Page,
    },
    {
      num: "2",
      tag: "운영 지원",
      title: "탐색·선별·정산, 플랫폼 안에서 처리합니다",
      desc: "인플루언서 탐색, 콘텐츠 확인, 정산 처리를 플랫폼 안에서 진행합니다. 반복 업무를 줄일 수 있습니다.",
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
      page: "advertiser" as Page,
    },
    {
      num: "3",
      tag: "실시간 성과",
      title: "ROAS와 전환율, 대시보드에서 직접 확인합니다",
      desc: "인플루언서별 성과 기여도를 대시보드에서 확인합니다. 리포트를 기다릴 필요 없습니다.",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      page: "advertiser" as Page,
    },
  ];

  return (
    <section className="relative bg-[var(--cbg1)] py-14 sm:py-20 lg:py-24">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <SectionEyebrow>이유</SectionEyebrow>
          <h2
            className="mt-4 text-neutral-950"
            style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em", wordBreak: "keep-all" }}
          >
            세 가지가 완전히 다릅니다
          </h2>
          <p className="mt-6 max-w-lg text-neutral-500" style={{ fontSize: 16, lineHeight: 1.7 }}>
            검증된 인플루언서 선별, 플랫폼 기반 운영 지원, 성과 대시보드. 기존 대행사가 해결 못한 세 가지입니다.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <CardReveal key={c.num} delay={i * 100}>
              <div className="group relative overflow-hidden rounded-3xl" style={{ minHeight: 456 }}>
                <ImageWithFallback
                  src={c.img}
                  alt={c.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.85) 100%)" }}
                />
                <div
                  className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-white"
                  style={{ background: "linear-gradient(135deg,var(--cp),var(--cm))", fontSize: 14, fontWeight: 700 }}
                >
                  {c.num}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="text-white" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
                    {c.title}
                  </h3>
                  <p className="mt-3 text-white/70" style={{ fontSize: 14, lineHeight: 1.7 }}>
                    {c.desc}
                  </p>
                  <button onClick={() => onNavigate(c.page)} className="mt-5 flex min-h-[44px] items-center gap-1.5 text-white/70 transition-all duration-200 hover:gap-3 hover:text-white" style={{ fontSize: 14, fontWeight: 600 }}>
                    더 보기 <span>→</span>
                  </button>
                </div>
              </div>
            </CardReveal>
          ))}
        </div>
      </div>
    </section>
  );
}


function CampaignPreview({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const campaigns = [
    {
      brand: "핏플로우",
      category: "피트니스 앱",
      tag: "활동비",
      budget: "••••원",
      applicants: "••명",
      fit: 92,
      img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
    },
    {
      brand: "그린바디",
      category: "건강식품",
      tag: "제품 협찬",
      budget: "••••원",
      applicants: "••명",
      fit: 87,
      img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
    },
    {
      brand: "런스튜디오",
      category: "러닝 크루",
      tag: "활동비 캠페인",
      budget: "••••원",
      applicants: "••명",
      fit: 79,
      img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80",
    },
    {
      brand: "요가모먼트",
      category: "요가 용품",
      tag: "제품 협찬",
      budget: "••••원",
      applicants: "••명",
      fit: 85,
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section className="relative bg-white pt-14 sm:pt-20 lg:pt-24 pb-0">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <SectionEyebrow>캠페인</SectionEyebrow>
          <h2
            className="mt-4 text-neutral-950"
            style={{
              fontSize: "clamp(22px, 3vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            지금 진행 중인 캠페인
          </h2>
          <p
            className="mt-3 max-w-xl text-neutral-600"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            로그인하면 단가·지원자 수·상세 조건을 모두 확인할 수 있습니다
          </p>
        </div>

        <div className="relative -mx-4 sm:-mx-6 overflow-hidden lg:-mx-10" style={{ maskImage: "linear-gradient(90deg, transparent 0%, black 22%, black 78%, transparent 100%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 22%, black 78%, transparent 100%)" }}>
          <div className="marquee-track flex gap-5 px-4 sm:px-6 lg:px-10" style={{ width: "max-content" }}>
            {[...campaigns, ...campaigns].map((c, idx) => (
              <div
                key={`${c.brand}-${idx}`}
                className="group relative w-[280px] shrink-0 overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all duration-300 hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]"
              >
                <div className="relative h-40 overflow-hidden">
                  <ImageWithFallback
                    src={c.img}
                    alt={c.brand}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1 text-white"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      background: "linear-gradient(135deg,var(--cp),var(--cm))",
                    }}
                  >
                    {c.tag}
                  </span>
                </div>
                <div className="p-6">
                  <p
                    className="text-neutral-500"
                    style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}
                  >
                    {c.category}
                  </p>
                  <h3
                    className="mt-1 text-neutral-950"
                    style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}
                  >
                    {c.brand}
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-neutral-400" style={{ fontSize: 12, fontWeight: 500 }}>캠페인 단가</p>
                      <p className="mt-1 text-neutral-300 select-none" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", filter: "blur(3px)" }}>??,???원</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-400" style={{ fontSize: 12, fontWeight: 500 }}>지원자</p>
                      <p className="mt-1 text-neutral-300 select-none" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", filter: "blur(3px)" }}>??명</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500" style={{ fontSize: 12 }}>Fit-Score 최소</span>
                      <span className="text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 700 }}>{c.fit}점+</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full" style={{ width: `${c.fit}%`, background: "linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)" }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-8 flex flex-col items-center gap-5 rounded-[28px] border border-[var(--cp)]/20 bg-[var(--cbg1)] p-6 sm:p-8 text-center"
          style={{ boxShadow: "0 8px 20px -16px rgba(var(--cp-rgb),0.15)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "rgba(var(--cp-rgb),0.1)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1.5C5.067 1.5 3.5 3.067 3.5 5V5.5H3C2.448 5.5 2 5.948 2 6.5V11.5C2 12.052 2.448 12.5 3 12.5H11C11.552 12.5 12 12.052 12 11.5V6.5C12 5.948 11.552 5.5 11 5.5H10.5V5C10.5 3.067 8.933 1.5 7 1.5ZM9 5.5H5V5C5 3.895 5.895 3 7 3C8.105 3 9 3.895 9 5V5.5Z"
                  fill="var(--cp)"
                />
              </svg>
            </span>
            <p
              className="text-neutral-700"
              style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              단가·지원자 수는 로그인 후 확인 가능합니다
            </p>
          </div>
          <p className="text-neutral-500" style={{ fontSize: 14, lineHeight: 1.7 }}>
            현재{" "}
            <span className="font-semibold text-neutral-700">128개</span>의 캠페인이 진행 중입니다.
            가입하면 Fit-Score 기반으로 맞춤 캠페인을 추천받습니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate("influencer")}
              className="rounded-full px-8 py-4 text-white transition-all hover:translate-y-[-1px] active:scale-[0.97]"
              style={{
                fontSize: 15,
                fontWeight: 600,
                background: "var(--btn-gradient)",
                boxShadow: "0 6px 18px -8px rgba(var(--cp-rgb),0.42)",
              }}
            >
              무료로 가입하고 확인하기
            </button>
            <button
              onClick={() => onNavigate("campaigns")}
              className="rounded-full border border-neutral-300 bg-white px-8 py-4 text-neutral-700 transition-all hover:translate-y-[-1px] hover:border-neutral-400"
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              캠페인 더 보기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const formatPrice = (monthly: number) => {
    if (monthly === 0) return "문의";
    const price = billing === "annual" ? Math.round(monthly * 0.8) : monthly;
    return price.toLocaleString("ko-KR") + "원";
  };

  const plans = [
    {
      name: "Focus",
      monthly: 99000,
      desc: "소규모 브랜드를 위한 시작 플랜",
      features: [
        "웰니스 인플루언서 5,000명 DB",
        "Fit-Score 기반 인플루언서 추천",
        "기본 성과 분석 대시보드",
        "이메일 지원",
      ],
      featured: false,
    },
    {
      name: "Scale",
      monthly: 299000,
      desc: "성장 중인 브랜드를 위한 가장 인기 있는 플랜",
      features: [
        "웰니스 인플루언서 5만 명 DB",
        "성과 분석 및 최적화",
        "커스텀 대시보드 구성",
        "우선 지원",
      ],
      featured: true,
    },
    {
      name: "Infinite",
      monthly: 0,
      desc: "엔터프라이즈를 위한 무제한 통합 플랜",
      features: [
        "무제한 인플루언서 DB 접근",
        "전담 마케팅 전문가 배정",
        "API 통합 및 커스텀 개발",
        "24시간 전담 지원",
      ],
      featured: false,
    },
  ];

  return (
    <section className="relative bg-white py-14 sm:py-20 lg:py-24">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <SectionEyebrow>요금제</SectionEyebrow>
          <h2
            className="mt-4 text-neutral-950"
            style={{
              fontSize: "clamp(22px, 3vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.28,
              letterSpacing: "-0.02em",
            }}
          >
            투명한 가격, 명확한 가치
          </h2>
          <p
            className="mt-3 text-neutral-600"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            브랜드 규모와 목표에 맞는 플랜을 고르세요
          </p>

          <div className="mt-10 inline-flex items-center rounded-full border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setBilling("monthly")}
              className="min-h-[44px] rounded-full px-5 py-2 transition-all duration-300"
              style={{
                fontSize: 14,
                fontWeight: 600,
                ...(billing === "monthly"
                  ? {
                      background: "var(--btn-gradient)",
                      color: "#fff",
                    }
                  : { color: "#6B7280" }),
              }}
            >
              월간
            </button>
            <button
              onClick={() => setBilling("annual")}
              className="relative min-h-[44px] rounded-full px-5 py-2 transition-all duration-300"
              style={{
                fontSize: 14,
                fontWeight: 600,
                ...(billing === "annual"
                  ? {
                      background: "var(--btn-gradient)",
                      color: "#fff",
                    }
                  : { color: "#6B7280" }),
              }}
            >
              연간
              <span
                className="absolute -right-1 -top-2 rounded-full px-1.5 py-0.5 text-white"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  background: "var(--cp)",
                  letterSpacing: "0.02em",
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {plans.map((p, i) => (
            <CardReveal key={p.name} delay={i * 100}>
            <div
              className={`group relative flex h-full flex-col overflow-hidden rounded-[24px] p-8 transition-all duration-300 hover:translate-y-[-4px] ${
                p.featured
                  ? "border border-[var(--cp)]/20 bg-white shadow-[0_24px_48px_-20px_rgba(var(--cp-rgb),0.22)]"
                  : "border border-neutral-200 bg-white hover:border-[var(--cs)]/30 hover:shadow-[0_12px_28px_-20px_rgba(var(--cd-rgb),0.14)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-neutral-950" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {p.name}
                </h3>
                {p.featured && (
                  <span
                    className="rounded-full px-3 py-1"
                    style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cm)" }}
                  >
                    POPULAR
                  </span>
                )}
              </div>
              <p className="mt-2.5 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.6 }}>
                {p.desc}
              </p>
              <div className="mt-7 flex items-end gap-2">
                <span
                  className="whitespace-nowrap text-neutral-950"
                  style={{ fontSize: p.monthly === 0 ? 24 : 36, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}
                >
                  {formatPrice(p.monthly)}
                </span>
                {p.monthly !== 0 && (
                  <span className="mb-1 text-neutral-400" style={{ fontSize: 14 }}>
                    / {billing === "annual" ? "월·연간" : "월"}
                  </span>
                )}
              </div>
              {billing === "annual" && p.monthly !== 0 && (
                <p className="mt-1" style={{ fontSize: 12, fontWeight: 600, color: "var(--cm)" }}>
                  연간 {Math.round(p.monthly * 0.8 * 12).toLocaleString("ko-KR")}원
                </p>
              )}
              <div className="my-6 h-px bg-neutral-100" />
              <ul className="flex-1 space-y-3.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-neutral-700" style={{ fontSize: 14, lineHeight: 1.55 }}>
                    <span
                      className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                      style={{ background: "var(--btn-gradient)" }}
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate(p.monthly === 0 ? "advertiser" : "login")}
                className="mt-8 w-full rounded-full py-4 transition-all duration-300 hover:translate-y-[-1px]"
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  background: p.monthly === 0 ? "transparent" : "var(--btn-gradient)",
                  border: p.monthly === 0 ? "1.5px solid #D1D5DB" : "none",
                  color: p.monthly === 0 ? "#4B5563" : "white",
                  boxShadow: p.featured ? "0 8px 20px -8px rgba(var(--cp-rgb),0.38)" : "none",
                }}
              >
                {p.monthly === 0 ? "문의하기" : "시작하기"}
              </button>
            </div>
            </CardReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "웰링크의 인플루언서 DB 규모는?",
      a: "웰링크는 5만 명 이상의 웰니스·피트니스 인플루언서를 보유하고 있습니다. 모두 Fit-Score로 검증된 진성 크리에이터들입니다.",
    },
    {
      q: "Fit-Score는 무엇인가요?",
      a: "Fit-Score는 브랜드와 인플루언서의 궁합을 0~100점으로 평가하는 웰링크의 독자 기술입니다. 팔로워 수가 아닌 진정한 영향력과 관련성을 측정합니다.",
    },
    {
      q: "기존 대행사와 무엇이 다른가요?",
      a: "인플루언서 탐색·선정·정산을 플랫폼 안에서 처리합니다. 데이터 대시보드로 성과를 직접 확인할 수 있고, 반복 업무에 쓰던 시간을 줄일 수 있습니다.",
    },
    {
      q: "인플루언서는 비용이 드나요?",
      a: "아니요. 인플루언서 가입과 참여, 정산까지 모두 완전히 무료입니다. 웰링크는 인플루언서에게 추가 비용을 부과하지 않습니다.",
    },
    {
      q: "캠페인 최소 예산은 얼마인가요?",
      a: "Focus 플랜부터 시작할 수 있으며, 월 99,000원부터 가능합니다. 소상공인과 초기 스타트업을 위해 설계된 합리적인 가격입니다.",
    },
  ];
  return (
    <section className="relative bg-[var(--cbg1)] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-14 flex flex-col items-center text-center">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2
            className="mt-4 text-neutral-950"
            style={{
              fontSize: "clamp(22px, 3vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.28,
              letterSpacing: "-0.02em",
            }}
          >
            자주 묻는 질문
          </h2>
          <p
            className="mt-3 text-neutral-600"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            자주 받는 질문을 모았습니다
          </p>
        </div>
        <div className="divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          {items.map((it, i) => (
            <details
              key={i}
              className="group px-7 py-6 transition-colors hover:bg-[var(--cbg1)]/50 open:bg-[var(--cbg1)]/30"
              {...(i === 0 ? { open: true } : {})}
            >
              <summary
                className="flex cursor-pointer list-none items-start justify-between gap-6 text-neutral-950 transition-colors group-hover:text-[var(--cp)]"
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.6,
                  letterSpacing: "-0.01em",
                }}
              >
                <span>{it.q}</span>
                <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-300 group-hover:border-[var(--cp)]/40 group-hover:text-[var(--cp)] group-open:rotate-45 group-open:border-[var(--cp)] group-open:bg-[var(--cp)] group-open:text-white">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 2v8M2 6h8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <p
                className="mt-4 text-neutral-600"
                style={{ fontSize: 16, lineHeight: 1.7 }}
              >
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCTA({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="bg-[var(--cbg1)] pb-14 sm:pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div
          className="relative overflow-hidden rounded-[32px] p-10 sm:p-12 lg:p-16 text-center"
          style={{ background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <FlowLines className="opacity-20" />
          <h3
            className="relative text-white"
            style={{
              fontSize: "clamp(20px, 2.8vw, 30px)",
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
            }}
          >
            더 궁금한 점이 있으신가요?
          </h3>
          <p
            className="relative mx-auto mt-6 max-w-xl text-white/80"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            웰링크 팀이 무료로 컨설팅해 드립니다
          </p>
          <button
            onClick={() => onNavigate("advertiser")}
            className="relative mt-12 rounded-full bg-white px-8 py-4 text-[var(--cp)] transition-all hover:translate-y-[-1px] active:scale-[0.97]"
            style={{
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 10px 24px -16px rgba(0,0,0,0.18)",
            }}
          >
            문의하기
          </button>
        </div>
      </div>
    </section>
  );
}

const REELS = [
  { src: "https://wellink-v5export.vercel.app/videos/reel_01.mp4", label: "ENUF 러닝 기어 협찬", brand: "ENUF" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_02.mp4", label: "웰링크 매칭 캠페인", brand: "" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_03.mp4", label: "ENUF 러닝 풀세트 리뷰", brand: "ENUF" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_04.mp4", label: "피트니스 인플루언서 협업", brand: "" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_05.mp4", label: "사계단백 캠페인", brand: "사계단백" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_06.mp4", label: "사계단백 브랜드 릴스", brand: "사계단백" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_07.mp4", label: "스웻이프 × 운동 크루", brand: "스웻이프" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_08.mp4", label: "스웻이프 신상 라인 소개", brand: "스웻이프" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_09.mp4", label: "스웻이프 캠페인 하이라이트", brand: "스웻이프" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_01.mp4", label: "ENUF 트레이닝 룩 협업", brand: "ENUF" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_02.mp4", label: "웰링크 인플루언서 스토리", brand: "" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_03.mp4", label: "ENUF 러닝화 착용 리뷰", brand: "ENUF" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_04.mp4", label: "헬스 루틴 × 웰링크", brand: "" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_05.mp4", label: "사계단백 신제품 언박싱", brand: "사계단백" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_06.mp4", label: "사계단백 데일리 루틴", brand: "사계단백" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_07.mp4", label: "스웻이프 크루 챌린지", brand: "스웻이프" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_08.mp4", label: "스웻이프 시즌 룩북", brand: "스웻이프" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_09.mp4", label: "스웻이프 × 웰링크 콜라보", brand: "스웻이프" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_04.mp4", label: "크로스핏 크루 협업", brand: "" },
  { src: "https://wellink-v5export.vercel.app/videos/reel_02.mp4", label: "웰링크 캠페인 하이라이트", brand: "" },
];

function ReelCard({
  reel,
  isPaused,
  isDimmed,
  onOpen,
  onHoverEnter,
  onHoverLeave,
  videoRef,
}: {
  reel: { src: string; label: string; brand: string };
  isPaused: boolean;
  isDimmed: boolean;
  onOpen: () => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
}) {
  const internalRef = useRef<HTMLVideoElement | null>(null);

  const setRef = (el: HTMLVideoElement | null) => {
    internalRef.current = el;
    videoRef(el);
  };

  return (
    <div
      className="relative flex-1 overflow-hidden rounded-3xl bg-neutral-950 transition-transform duration-300 hover:-translate-y-1"
      style={{ aspectRatio: "9/16", minWidth: 0 }}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <video
        ref={setRef}
        src={reel.src}
        className="h-full w-full object-cover"
        preload="metadata"
        playsInline
        loop
        muted
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.06) 50%, transparent 100%)" }}
      />
      {/* 호버 dim 오버레이 — 다른 카드 호버 시 반투명 어둡게 */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.4)", opacity: isDimmed ? 1 : 0 }}
      />
      {/* 전체 클릭 → 라이트박스 열기 */}
      <button
        onClick={onOpen}
        className="absolute inset-0 h-full w-full cursor-pointer"
        aria-label="영상 크게 보기"
        style={{ background: "transparent" }}
      />
      {/* 재생 중 확대 힌트 아이콘 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {isPaused && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 4l12 6-12 6V4z" fill="var(--cp)" />
          </svg>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
        {reel.brand && (
          <span className="mb-1 block text-white/60" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
            {reel.brand}
          </span>
        )}
        <span className="text-white" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
          {reel.label}
        </span>
      </div>
    </div>
  );
}

/* ── 릴스 라이트박스 ── */
function ReelLightbox({
  reel,
  onClose,
}: {
  reel: { src: string; label: string; brand: string };
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);

  /* 열릴 때 body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPaused(false); }
    else { v.pause(); setPaused(true); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center py-14"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      {/* 영상 컨테이너 */}
      <div
        className="relative h-full"
        style={{ aspectRatio: "9/16", maxHeight: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 — 영상 밖 우상단 */}
        <button
          onClick={onClose}
          className="absolute -right-14 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
          aria-label="닫기"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* 영상 */}
        <video
          ref={videoRef}
          src={reel.src}
          className="h-full w-full rounded-2xl object-cover"
          autoPlay
          loop
          playsInline
          style={{ aspectRatio: "9/16" }}
        />

        {/* 하단 그라디언트 + 라벨 + 컨트롤 */}
        <div
          className="absolute inset-x-0 bottom-0 rounded-b-2xl px-4 pb-4 pt-12"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%)" }}
        >
          {/* 라벨 */}
          <div className="pointer-events-none mb-3">
            {reel.brand && (
              <span className="mb-0.5 block text-white/60" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
                {reel.brand}
              </span>
            )}
            <span className="text-white" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
              {reel.label}
            </span>
          </div>
          {/* 컨트롤 바 */}
          <div className="flex items-center gap-2">
            {/* 재생/일시정지 */}
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35"
              aria-label={paused ? "재생" : "일시정지"}
            >
              {paused ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 3l10 5-10 5V3z" fill="white" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="3" width="3.5" height="10" rx="1" fill="white" />
                  <rect x="9.5" y="3" width="3.5" height="10" rx="1" fill="white" />
                </svg>
              )}
            </button>
            {/* 음소거 토글 */}
            <button
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35"
              aria-label={muted ? "소리 켜기" : "소리 끄기"}
            >
              {muted ? (
                <svg width="14" height="14" viewBox="-1.5 0 16 16" fill="none">
                  <path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill="white" opacity="0.9" />
                  <line x1="1.5" y1="1.5" x2="14.5" y2="14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill="white" />
                  <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 클릭으로 재생/일시정지 (영상 중앙 터치 영역) */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 h-full w-full rounded-2xl"
          style={{ background: "transparent" }}
          aria-label={paused ? "재생" : "일시정지"}
        />
        {/* 일시정지 아이콘 */}
        {paused && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M4 3l10 5-10 5V3z" fill="white" />
            </svg>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* 크레용 필터 SVG 스니펫 */
function CrayonDefs({ id, seed }: { id: string; seed: number }) {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="4" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/* ── 릴스 캐루셀 상수 ── */
const RC_N = REELS.length;           // 9
const RC_BUF = 3;                    // 양쪽 버퍼 카드 수
const RC_GAP = 8;                    // px (gap-2)
const RC_VIS_D = 5;                  // 데스크탑 표시 카드 수 (+ 0.3 peek → 4.3장 효과)
const RC_MOB_FACTOR = 0.78;          // 모바일 카드 너비 비율 (78% → 옆 카드 22% peek)
/* 확장 스트립 인덱스: [6,7,8, 0..8, 0,1,2] */
const RC_EXT: number[] = [
  ...Array.from({ length: RC_BUF }, (_, i) => RC_N - RC_BUF + i),
  ...Array.from({ length: RC_N }, (_, i) => i),
  ...Array.from({ length: RC_BUF }, (_, i) => i),
];
const rcGetOff = (ext: number) => ((ext - RC_BUF) % RC_N + RC_N) % RC_N;

function Reels() {
  /* extOffset: 스트립 내 현재 위치 (RC_BUF ~ RC_BUF+RC_N-1 이 정상 범위) */
  const [extOffset, setExtOffset] = useState(RC_BUF);
  const [pausedSet, setPausedSet] = useState<Set<number>>(new Set());
  const [cardWidth, setCardWidth] = useState(300);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedReel, setSelectedReel] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const isMobileRef = useRef(typeof window !== "undefined" && window.innerWidth < 768);
  const touchStartX = useRef<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(RC_N).fill(null));
  const hasAutoPlayed = useRef(false);
  const busy = useRef(false);
  const stateRef = useRef({ extOffset: RC_BUF, pausedSet: new Set<number>() });
  stateRef.current = { extOffset, pausedSet };

  const offset = rcGetOff(extOffset);
  const visible = isMobile ? [offset % RC_N] : Array.from({ length: RC_VIS_D }, (_, i) => (offset + i) % RC_N);

  /* 카드 너비: 컨테이너 기준 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId: number;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const w = el.clientWidth;
        /* isMobile은 뷰포트 너비 기준 — 컨테이너 너비 기준으로 하면
           버튼 show/hide → 컨테이너 폭 변화 → ResizeObserver 재발화의 무한루프 발생 */
        const mobile = window.innerWidth < 768;
        isMobileRef.current = mobile;
        setIsMobile(mobile);
        /* 팬 레이아웃: 가운데 1.0, 양옆 0.88, 양끝 0.75 — 5장 합 = 4.26 × cW */
        setCardWidth(mobile ? w * RC_MOB_FACTOR : (w - (RC_VIS_D - 1) * RC_GAP) / 4.26);
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(rafId); };
  }, []);

  /* translateX 동기화 */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    /* 모바일: 모든 카드 동일 너비(cardWidth). 데스크탑: 팬 레이아웃 — 가장자리 0.75×cW */
    const stepWidth = isMobile ? cardWidth : 0.75 * cardWidth;
    strip.style.transform = `translateX(-${extOffset * (stepWidth + RC_GAP) - RC_GAP}px)`;
  }, [extOffset, cardWidth, isMobile]);

  const playVisible = useCallback(() => {
    const { extOffset: ext, pausedSet: paused } = stateRef.current;
    const off = rcGetOff(ext);
    const vis = isMobileRef.current ? [off % RC_N] : Array.from({ length: RC_VIS_D }, (_, j) => (off + j) % RC_N);
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (vis.includes(i)) {
        if (!paused.has(i)) v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, []);

  /* isMobile 전환 시 carousel 리셋 */
  const prevIsMobile = useRef(isMobile);
  useEffect(() => {
    if (prevIsMobile.current === isMobile) return;
    prevIsMobile.current = isMobile;
    busy.current = false;
    const strip = stripRef.current;
    if (strip) strip.style.transition = "none";
    setExtOffset(RC_BUF);
    setPausedSet(new Set());
    requestAnimationFrame(() => { playVisible(); });
  }, [isMobile, playVisible]);

  /* scroll into view → autoplay */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true;
          playVisible();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [playVisible]);

  const goDir = (dir: "right" | "left") => {
    if (busy.current) return;
    busy.current = true;
    setHoveredIdx(null);

    const { extOffset: cur } = stateRef.current;
    const curOff = rcGetOff(cur);

    /* 현재 영상 일시정지 */
    (isMobileRef.current ? [0] : Array.from({ length: RC_VIS_D }, (_, j) => j)).forEach(j => {
      const v = videoRefs.current[(curOff + j) % RC_N];
      if (v) v.pause();
    });
    setPausedSet(new Set());

    const newExt = dir === "right" ? cur + 1 : cur - 1;
    const strip = stripRef.current;

    /* CSS transition으로 부드럽게 슬라이드 */
    if (strip) strip.style.transition = `transform 300ms cubic-bezier(0.25,1,0.5,1)`;
    setExtOffset(newExt);

    /* 애니메이션 완료 후: 루프 경계 teleport + 영상 재생 */
    setTimeout(() => {
      const realExt = RC_BUF + rcGetOff(newExt);
      if (realExt !== newExt) {
        if (strip) strip.style.transition = "none";
        setExtOffset(realExt);
        /* 다음 프레임에 transition 복구 */
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (strip) strip.style.transition = `transform 300ms cubic-bezier(0.25,1,0.5,1)`;
          busy.current = false;
          playVisible();
        }));
      } else {
        busy.current = false;
        playVisible();
      }
    }, 320);
  };

  const togglePause = (absIdx: number) => {
    const v = videoRefs.current[absIdx];
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPausedSet(prev => { const s = new Set(prev); s.delete(absIdx); return s; });
    } else {
      v.pause();
      setPausedSet(prev => new Set(prev).add(absIdx));
    }
  };

  const handleHoverEnter = (absIdx: number) => {
    setHoveredIdx(absIdx);
    /* 호버된 카드만 재생, 나머지 일시정지 */
    const { extOffset: ext } = stateRef.current;
    const vis = isMobileRef.current ? [rcGetOff(ext) % RC_N] : Array.from({ length: RC_VIS_D }, (_, j) => (rcGetOff(ext) + j) % RC_N);
    vis.forEach(i => {
      const v = videoRefs.current[i];
      if (!v) return;
      if (i === absIdx) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  const handleHoverLeave = () => {
    setHoveredIdx(null);
    /* 호버 해제 → visible 영상 재개 (pausedSet 존중) */
    playVisible();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) goDir(dx < 0 ? "right" : "left");
    touchStartX.current = null;
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* ── 좌측 여백 낙서 (1200px 초과 화면에서만) ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 hidden xl:block"
        style={{ width: "max(0px, calc((100vw - 1200px) / 2 - 8px))" }}
        aria-hidden="true"
      >
        <CrayonDefs id="cf-lm" seed={11} />
        {/* 물병 + 심전도 */}
        <svg className="absolute left-3 top-12 opacity-55" width="130" height="160" viewBox="0 0 130 160" fill="none">
          <g filter="url(#cf-lm)">
            <rect x="48" y="8" width="18" height="10" rx="3" stroke="rgba(var(--cp-rgb),0.60)" strokeWidth="2.8" fill="none" />
            <path d="M40 20 Q38 26 40 32 L40 82 Q40 88 48 88 L66 88 Q74 88 74 82 L74 32 Q76 26 74 20 Z" stroke="rgba(var(--cp-rgb),0.62)" strokeWidth="3" fill="rgba(var(--cp-rgb),0.08)" />
            <path d="M41 56 Q57 50 73 56" stroke="rgba(var(--cp-rgb),0.45)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M4 130 L22 130 L30 110 L38 150 L46 100 L56 150 L62 130 L118 130" stroke="rgba(var(--cs-rgb),0.58)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
        {/* 달리기 스틱피겨 */}
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" width="110" height="130" viewBox="0 0 110 130" fill="none">
          <g filter="url(#cf-lm)">
            <circle cx="70" cy="16" r="10" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="2.8" fill="none" />
            <path d="M66 26 L54 58" stroke="rgba(var(--cp-rgb),0.62)" strokeWidth="3" strokeLinecap="round" />
            <path d="M62 38 L42 26" stroke="rgba(var(--cp-rgb),0.55)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M60 46 L80 56" stroke="rgba(var(--cp-rgb),0.55)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M54 58 L38 80 L28 100" stroke="rgba(var(--cs-rgb),0.55)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M54 58 L66 80 L84 90" stroke="rgba(var(--cs-rgb),0.55)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M12 46 L28 46" stroke="rgba(var(--cm-rgb),0.42)" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 56 L22 56" stroke="rgba(var(--cm-rgb),0.35)" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </svg>
        {/* 아령 (덤벨) */}
        <svg className="absolute left-2 bottom-16 opacity-52" width="120" height="110" viewBox="0 0 120 110" fill="none">
          <g filter="url(#cf-lm)">
            <rect x="6" y="34" width="18" height="32" rx="5" stroke="rgba(var(--cp-rgb),0.60)" strokeWidth="3" fill="none" />
            <path d="M24 50 L86 50" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="4" strokeLinecap="round" />
            <rect x="86" y="34" width="18" height="32" rx="5" stroke="rgba(var(--cp-rgb),0.60)" strokeWidth="3" fill="none" />
            <circle cx="60" cy="18" r="4" fill="rgba(var(--cs-rgb),0.45)" />
            <circle cx="36" cy="88" r="3" fill="rgba(var(--cm-rgb),0.40)" />
            <circle cx="92" cy="90" r="5" fill="rgba(var(--cs-rgb),0.40)" />
          </g>
        </svg>
      </div>

      {/* ── 우측 여백 낙서 ── */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 top-0 hidden xl:block"
        style={{ width: "max(0px, calc((100vw - 1200px) / 2 - 8px))" }}
        aria-hidden="true"
      >
        <CrayonDefs id="cf-rm" seed={13} />
        {/* 자전거 */}
        <svg className="absolute right-3 top-10 opacity-55" width="130" height="170" viewBox="0 0 130 170" fill="none">
          <g filter="url(#cf-rm)">
            <circle cx="32" cy="110" r="28" stroke="rgba(var(--cp-rgb),0.56)" strokeWidth="3" fill="none" />
            <circle cx="96" cy="110" r="28" stroke="rgba(var(--cp-rgb),0.56)" strokeWidth="3" fill="none" />
            <path d="M32 110 L64 66 L96 110" stroke="rgba(var(--cs-rgb),0.58)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M64 66 L64 110" stroke="rgba(var(--cs-rgb),0.50)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M52 64 L76 64" stroke="rgba(var(--cs-rgb),0.62)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M90 80 L106 76 M96 80 L96 94" stroke="rgba(var(--cs-rgb),0.55)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="64" cy="18" r="5" fill="rgba(var(--cm-rgb),0.45)" />
          </g>
        </svg>
        {/* 요가 나무자세 */}
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 opacity-52" width="110" height="130" viewBox="0 0 110 130" fill="none">
          <g filter="url(#cf-rm)">
            <circle cx="55" cy="14" r="10" stroke="rgba(var(--cp-rgb),0.60)" strokeWidth="2.8" fill="none" />
            <path d="M55 24 L55 68" stroke="rgba(var(--cp-rgb),0.62)" strokeWidth="3" strokeLinecap="round" />
            <path d="M55 36 L34 22" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M55 36 L76 22" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M55 68 L55 110" stroke="rgba(var(--cs-rgb),0.58)" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M55 80 L38 94 L44 110" stroke="rgba(var(--cs-rgb),0.52)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
        {/* 케틀벨 */}
        <svg className="absolute right-2 bottom-12 opacity-52" width="120" height="130" viewBox="0 0 120 130" fill="none">
          <g filter="url(#cf-rm)">
            <circle cx="60" cy="90" r="34" stroke="rgba(var(--cs-rgb),0.58)" strokeWidth="3" fill="none" />
            <path d="M38 74 Q38 34 60 34 Q82 34 82 74" stroke="rgba(var(--cs-rgb),0.60)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M46 58 L46 66" stroke="rgba(var(--cs-rgb),0.40)" strokeWidth="2" strokeLinecap="round" />
            <path d="M74 58 L74 66" stroke="rgba(var(--cs-rgb),0.40)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="20" r="5" fill="rgba(var(--cp-rgb),0.45)" />
            <circle cx="102" cy="18" r="3.5" fill="rgba(var(--cm-rgb),0.42)" />
          </g>
        </svg>
      </div>

      {/* ── 섹션 본체 ── */}
      <section
        ref={sectionRef}
        className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 pt-14 sm:pt-20 lg:pt-24 pb-20 lg:pb-24"
      >
        <CrayonDefs id="cf-sec" seed={7} />

        {/* 모서리 낙서 — 콘텐츠 영역과 겹치지 않는 위치 */}
        <div className="pointer-events-none absolute inset-0" style={{ clipPath: "inset(0 -9999px)" }} aria-hidden="true">
          {/* 좌상단: 덤벨 + 심전도 */}
          <svg className="absolute -left-4 -top-6 opacity-58" width="150" height="110" viewBox="0 0 150 110" fill="none">
            <g filter="url(#cf-sec)">
              <rect x="8" y="26" width="18" height="32" rx="5" stroke="rgba(var(--cp-rgb),0.68)" strokeWidth="3" fill="none" />
              <path d="M26 42 L92 42" stroke="rgba(var(--cp-rgb),0.65)" strokeWidth="4.2" strokeLinecap="round" />
              <rect x="92" y="26" width="18" height="32" rx="5" stroke="rgba(var(--cp-rgb),0.68)" strokeWidth="3" fill="none" />
              <path d="M8 84 L26 84 L32 68 L40 100 L46 58 L54 100 L60 84 L96 84" stroke="rgba(var(--cs-rgb),0.55)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="128" cy="30" r="5" fill="rgba(var(--cm-rgb),0.52)" />
            </g>
          </svg>
          {/* 우상단: 달리기 */}
          <svg className="absolute -right-4 -top-6 opacity-55" width="140" height="100" viewBox="0 0 140 100" fill="none">
            <g filter="url(#cf-sec)">
              <circle cx="100" cy="16" r="10" stroke="rgba(var(--cp-rgb),0.62)" strokeWidth="2.8" fill="none" />
              <path d="M96 26 L84 54" stroke="rgba(var(--cp-rgb),0.65)" strokeWidth="3" strokeLinecap="round" />
              <path d="M92 36 L72 26" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M90 42 L110 52" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M84 54 L96 76 L114 86" stroke="rgba(var(--cs-rgb),0.56)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M84 54 L70 74 L58 88" stroke="rgba(var(--cs-rgb),0.52)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M26 40 L44 40" stroke="rgba(var(--cm-rgb),0.48)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M20 52 L36 52" stroke="rgba(var(--cm-rgb),0.40)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 28 L28 28" stroke="rgba(var(--cm-rgb),0.35)" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </svg>
          {/* 좌하단: 물병 + 심전도 */}
          <svg className="absolute -bottom-4 -left-4 opacity-55" width="140" height="100" viewBox="0 0 140 100" fill="none">
            <g filter="url(#cf-sec)">
              <rect x="8" y="10" width="16" height="10" rx="3" stroke="rgba(var(--cp-rgb),0.60)" strokeWidth="2.5" fill="none" />
              <path d="M6 22 Q4 28 6 34 L6 74 Q6 80 14 80 L32 80 Q40 80 40 74 L40 34 Q42 28 40 22 Z" stroke="rgba(var(--cp-rgb),0.62)" strokeWidth="2.8" fill="rgba(var(--cp-rgb),0.08)" />
              <path d="M7 52 Q23 46 39 52" stroke="rgba(var(--cp-rgb),0.42)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M56 54 L72 54 L78 38 L86 70 L92 24 L100 70 L106 54 L132 54" stroke="rgba(var(--cs-rgb),0.62)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </svg>
          {/* 우하단: 요가 나무자세 + 사과 */}
          <svg className="absolute -bottom-4 -right-4 opacity-58" width="150" height="110" viewBox="0 0 150 110" fill="none">
            <g filter="url(#cf-sec)">
              <circle cx="110" cy="14" r="9" stroke="rgba(var(--cp-rgb),0.62)" strokeWidth="2.8" fill="none" />
              <path d="M110 23 L110 60" stroke="rgba(var(--cp-rgb),0.65)" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M110 34 L92 22" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M110 34 L128 22" stroke="rgba(var(--cp-rgb),0.58)" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M110 60 L110 98" stroke="rgba(var(--cs-rgb),0.58)" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M110 72 L95 84 L100 98" stroke="rgba(var(--cs-rgb),0.50)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M38 46 C22 46 10 56 10 68 C10 82 22 94 38 94 C54 94 66 82 66 68 C66 56 54 46 38 46 Z" stroke="rgba(var(--cs-rgb),0.55)" strokeWidth="2.5" fill="none" />
              <path d="M38 46 L38 36 Q38 28 46 26" stroke="rgba(var(--cs-rgb),0.55)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M38 38 Q48 32 52 38 Q46 44 38 42 Z" stroke="rgba(var(--cm-rgb),0.52)" strokeWidth="1.8" fill="rgba(var(--cm-rgb),0.22)" />
            </g>
          </svg>
        </div>

        {/* 헤더 */}
        <div className="mb-10 text-center">
          <SectionEyebrow>릴스</SectionEyebrow>
          <h2
            className="mt-3 text-neutral-950"
            style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", wordBreak: "keep-all" }}
          >
            인플루언서들의 캠페인 릴스
          </h2>
          <p className="mt-4 text-neutral-500" style={{ fontSize: 16, lineHeight: 1.7 }}>
            인플루언서들의 실제 릴스 영상이에요, 한번 확인해보시겠어요?
          </p>
        </div>

        {/* 캐루셀 — 쉐브론 absolute, 카드 팬 레이아웃 */}
        <div className="relative">
          {/* 좌 쉐브론 — 카드 마진 영역에 위치 (z-10) */}
          {!isMobile && (
            <button
              onClick={() => goDir("left")}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:opacity-85 active:scale-[0.97]"
              style={{ background: "var(--btn-gradient)" }}
              aria-label="이전"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* 클립 컨테이너 — full width, 데스크탑에서만 양쪽 fade mask */}
          <div
            ref={containerRef}
            style={{
              touchAction: "pan-y",
              overflowX: "clip",
              overflowY: "clip",
              ...(isMobile ? {
                maskImage: "linear-gradient(90deg, transparent 0%, black 5%, black 100%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 5%, black 100%)",
              } : {
                maskImage: "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
              }),
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 슬라이드 스트립 */}
            <div
              ref={stripRef}
              className="flex items-center"
              style={{ gap: RC_GAP, willChange: "transform" }}
            >
              {RC_EXT.map((absIdx, extPos) => {
                const isBuffer = extPos < RC_BUF || extPos >= RC_BUF + RC_N;
                const isDimmed = !isBuffer && hoveredIdx !== null && hoveredIdx !== absIdx && visible.includes(absIdx);
                /* 데스크탑 fan 스케일 — 가운데 1.0, 양쪽 0.88, 양끝 0.75 / 모바일 무변경 */
                const distFromCenter = !isMobile ? Math.abs(extPos - (extOffset + 2)) : 0;
                const posScale = !isMobile
                  ? (distFromCenter === 0 ? 1.0 : distFromCenter === 1 ? 0.88 : 0.75)
                  : 1.0;
                return (
                  <div
                    key={extPos}
                    style={{
                      width: !isMobile ? cardWidth * posScale : cardWidth,
                      flexShrink: 0,
                      position: "relative",
                      zIndex: !isMobile ? (distFromCenter === 0 ? 5 : distFromCenter === 1 ? 3 : 2) : undefined,
                    }}
                  >
                    <ReelCard
                      reel={REELS[absIdx]}
                      isPaused={!isBuffer && pausedSet.has(absIdx)}
                      isDimmed={isDimmed}
                      onOpen={isBuffer || isMobile ? () => {} : () => setSelectedReel(absIdx)}
                      onHoverEnter={isBuffer ? () => {} : () => handleHoverEnter(absIdx)}
                      onHoverLeave={isBuffer ? () => {} : handleHoverLeave}
                      videoRef={(el) => { if (!isBuffer) videoRefs.current[absIdx] = el; }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우 쉐브론 */}
          {!isMobile && (
            <button
              onClick={() => goDir("right")}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:opacity-85 active:scale-[0.97]"
              style={{ background: "var(--btn-gradient)" }}
              aria-label="다음"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* 모바일 — 스와이프 dot 인디케이터 + 좌우 버튼 */}
        {isMobile && (
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => goDir("left")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-[0.97]"
              style={{ background: "var(--btn-gradient)" }}
              aria-label="이전"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-hidden px-2">
              {Array.from({ length: RC_N }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { if (!busy.current) { setExtOffset(RC_BUF + i); setPausedSet(new Set()); setTimeout(playVisible, 50); } }}
                  className="flex min-h-[36px] shrink-0 items-center justify-center px-0.5"
                  aria-label={`${i + 1}번 영상`}
                >
                  <span
                    className="block h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === offset ? 14 : 5,
                      background: i === offset ? "var(--cp)" : "#d1d5db",
                    }}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => goDir("right")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-[0.97]"
              style={{ background: "var(--btn-gradient)" }}
              aria-label="다음"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

      </section>

      {/* ── 릴스 라이트박스 모달 ── */}
      {selectedReel !== null && (
        <ReelLightbox
          reel={REELS[selectedReel]}
          onClose={() => setSelectedReel(null)}
        />
      )}
    </div>
  );
}
