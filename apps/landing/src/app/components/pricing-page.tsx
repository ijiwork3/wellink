import { useState, useRef, useEffect, Fragment } from "react";
import { BackgroundGrid } from "./background-grid";

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login" | "pricing";

export function PricingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  // ── 모바일 테이블 가로 스크롤 큐 (컨테이너 내부 쉐브론·페이드) ──
  const mobileTableRef = useRef<HTMLDivElement>(null);
  const [mobileCanScrollLeft, setMobileCanScrollLeft] = useState(false);
  const [mobileCanScrollRight, setMobileCanScrollRight] = useState(false);

  useEffect(() => {
    const el = mobileTableRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setMobileCanScrollLeft(el.scrollLeft > 0);
        setMobileCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollMobileTable = (dir: "left" | "right") => {
    mobileTableRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  const plans = [
    {
      name: "Focus",
      monthly: 99000,
      desc: "소규모 브랜드를 위한 시작 플랜",
      quota: [
        { value: "5,000명", label: "인플루언서 DB" },
        { value: "월 5건", label: "캠페인" },
        { value: "1명", label: "팀 멤버" },
      ],
      features: [
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
      quota: [
        { value: "5만 명+", label: "인플루언서 DB" },
        { value: "월 20건", label: "캠페인" },
        { value: "5명", label: "팀 멤버" },
      ],
      features: [
        "AI 성과 분석 및 최적화",
        "커스텀 대시보드 구성",
        "우선 지원",
      ],
      featured: true,
    },
    {
      name: "Infinite",
      monthly: 0,
      desc: "엔터프라이즈를 위한 무제한 통합 플랜",
      quota: [
        { value: "무제한", label: "인플루언서 DB" },
        { value: "무제한", label: "캠페인" },
        { value: "무제한", label: "팀 멤버" },
      ],
      features: [
        "전담 마케팅 전문가 배정",
        "API 통합 및 커스텀 개발",
        "24시간 전담 지원",
      ],
      featured: false,
    },
  ];

  const formatPrice = (monthly: number) => {
    if (monthly === 0) return "문의";
    const price = billing === "annual" ? Math.round(monthly * 0.8) : monthly;
    return price.toLocaleString("ko-KR") + "원";
  };

  type FeatureVal = string | boolean;
  const comparison: {
    name: string;
    focus: FeatureVal;
    scale: FeatureVal;
    infinite: FeatureVal;
    section?: string;
  }[] = [
    { name: "인플루언서 DB", focus: "5,000명", scale: "5만 명+", infinite: "무제한", section: "핵심 기능" },
    { name: "Fit-Score 기반 인플루언서 추천", focus: true, scale: true, infinite: true },
    { name: "성과 대시보드", focus: "기본", scale: "고급", infinite: "커스텀" },
    { name: "Fit-Score 상세 리포트", focus: false, scale: true, infinite: true },
    { name: "콘텐츠 다운로드", focus: true, scale: true, infinite: true },
    { name: "캠페인 수", focus: "월 5건", scale: "월 20건", infinite: "무제한", section: "운영 한도" },
    { name: "팀 멤버", focus: "1명", scale: "5명", infinite: "무제한" },
    { name: "동시 활성 캠페인", focus: "1건", scale: "5건", infinite: "무제한" },
    { name: "API 접근", focus: false, scale: false, infinite: true, section: "기술·통합" },
    { name: "Webhook 연동", focus: false, scale: false, infinite: true },
    { name: "커스텀 도메인 리포트", focus: false, scale: false, infinite: true },
    { name: "전담 매니저", focus: false, scale: false, infinite: true, section: "지원" },
    { name: "고객 지원", focus: "이메일", scale: "우선 응대", infinite: "전담 24시간" },
    { name: "온보딩 지원", focus: false, scale: "기본", infinite: "맞춤형" },
    { name: "무료 체험", focus: "7일", scale: "7일", infinite: "데모 제공" },
  ];

  const renderCell = (v: FeatureVal, featured: boolean) => {
    if (typeof v === "boolean") {
      return v ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto" style={{ color: featured ? "var(--cp)" : "#9CA3AF" }}>
          <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <span className="text-neutral-300" style={{ fontSize: 18, lineHeight: 1 }}>—</span>
      );
    }
    return (
      <span style={{ fontSize: 14, fontWeight: featured ? 600 : 500, color: featured ? "var(--cp)" : "#4B5563" }}>
        {v}
      </span>
    );
  };

  const focusPrice = billing === "annual" ? "79,200원" : "99,000원";
  const scalePrice = billing === "annual" ? "239,200원" : "299,000원";

  return (
    <main className="relative w-full overflow-hidden bg-white">
      {/* Free trial notice — top of page */}
      <div className="bg-[var(--cbg1)] border-b border-[var(--cp)]/15">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg sm:h-7 sm:w-7" style={{ background: "var(--btn-gradient)" }}>
              <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                <path d="M9 2.25L11.06 6.42L15.75 7.1L12.375 10.39L13.12 15.06L9 12.9L4.88 15.06L5.625 10.39L2.25 7.1L6.94 6.42L9 2.25Z" fill="white" />
              </svg>
            </span>
            <p className="text-neutral-600" style={{ fontSize: "clamp(12.5px, 3.4vw, 14px)", fontWeight: 500 }}>
              <span style={{ fontWeight: 700, color: "var(--cp)" }}>7일 무료 체험</span> · 결제 정보 없이 바로 시작<span className="hidden sm:inline"> — Focus·Scale 플랜 모두 적용</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-white pt-14 pb-6 sm:pt-16 sm:pb-6 lg:pt-20 lg:pb-8">
        <BackgroundGrid />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>
            PRICING
          </span>
          <h1
            className="mt-4 text-neutral-950"
            style={{ fontSize: "clamp(26px, 4vw, 46px)", fontWeight: 700, lineHeight: 1.28, letterSpacing: "-0.025em", wordBreak: "keep-all" }}
          >
            투명한 가격, 명확한 가치
          </h1>
          <p className="mt-5 mx-auto max-w-xl text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>
            숨겨진 비용 없이, 브랜드 규모에 맞는 플랜을 고르세요
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-white pt-6 pb-0 lg:pt-8">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          {/* Billing toggle */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-1">
              {(["monthly", "annual"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="relative rounded-full px-5 py-2 min-h-[44px] transition-all duration-300"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    ...(billing === b
                      ? { background: "var(--btn-gradient)", color: "#fff" }
                      : { color: "#6B7280" }),
                  }}
                >
                  {b === "monthly" ? "월간" : "연간"}
                  {b === "annual" && (
                    <span
                      className="absolute -right-1 -top-2 rounded-full px-1.5 py-0.5 text-white"
                      style={{ fontSize: 12, fontWeight: 700, background: "var(--cp)" }}
                    >
                      -20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`group relative flex flex-col overflow-hidden rounded-[24px] p-8 transition-all duration-300 hover:translate-y-[-4px] ${
                  p.featured
                    ? "border border-[var(--cp)]/20 bg-white shadow-[0_24px_48px_-20px_rgba(var(--cp-rgb),0.22)]"
                    : "border border-neutral-200 bg-white hover:border-[var(--cs)]/30 hover:shadow-[0_12px_28px_-20px_rgba(var(--cd-rgb),0.14)]"
                }`}
              >

                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-neutral-950" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
                    {p.name}
                  </h3>
                  {p.featured && (
                    <span
                      className="rounded-full px-3 py-1"
                      style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}
                    >
                      POPULAR
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  {p.desc}
                </p>

                {/* Price */}
                <div className="mt-7 flex items-end gap-2">
                  <span
                    className="text-neutral-950"
                    style={{ fontSize: p.monthly === 0 ? 30 : 38, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}
                  >
                    {formatPrice(p.monthly)}
                  </span>
                  {p.monthly !== 0 && billing === "annual" && (
                    <span className="mb-1 text-neutral-400" style={{ fontSize: 14 }}>/월</span>
                  )}
                </div>
                {billing === "monthly" && p.monthly !== 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <p className="text-neutral-400" style={{ fontSize: 12 }}>매월 청구</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--cp)" }}>
                      연간 결제 시 {Math.round(p.monthly * 0.8).toLocaleString("ko-KR")}원/월
                    </p>
                  </div>
                )}
                {billing === "annual" && p.monthly !== 0 && (
                  <div className="mt-1.5" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="text-neutral-400" style={{ fontSize: 13, textDecoration: "line-through" }}>
                        {p.monthly.toLocaleString("ko-KR")}원/월
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cp)", background: "var(--cp-bg, #eff6ff)", padding: "2px 7px", borderRadius: 6 }}>
                        20% 절약
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280" }}>
                      연 {Math.round(p.monthly * 0.8 * 12).toLocaleString("ko-KR")}원 청구
                    </p>
                  </div>
                )}

                <div className="mt-5 mb-2 grid grid-cols-3 rounded-xl border border-neutral-100 bg-neutral-50">
                  {p.quota.map((q) => (
                    <div key={q.label} className="flex flex-col items-center py-2.5 px-1 gap-0.5">
                      <span className="text-sm font-bold text-neutral-900 tabular-nums whitespace-nowrap">{q.value}</span>
                      <span className="text-[10px] text-neutral-400 whitespace-nowrap">{q.label}</span>
                    </div>
                  ))}
                </div>

                <div className="my-5 h-px bg-neutral-100" />

                <ul className="flex-1 space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-neutral-700" style={{ fontSize: 14, lineHeight: 1.55 }}>
                      <span
                        className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                        style={{ background: "var(--btn-gradient)" }}
                      >
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onNavigate("login")}
                  className="mt-8 w-full rounded-full py-4 text-white transition-all duration-300 hover:translate-y-[-1px]"
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
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="bg-white pt-0 pb-12 sm:pb-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">

          {/* ── 모바일·태블릿: 고정너비 테이블 (스와이프 스크롤) ── */}
          <div className="lg:hidden">
            <div className="mb-3 mt-8 flex items-end justify-between gap-2">
              <div>
                <p className="text-neutral-950" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em" }}>플랜별 기능 비교</p>
                <p className="mt-0.5 text-neutral-400" style={{ fontSize: 12 }}>{billing === "annual" ? "연간 결제 (-20%)" : "월간 결제"}</p>
              </div>
              {(mobileCanScrollLeft || mobileCanScrollRight) && (
                <span className="shrink-0 text-neutral-400" style={{ fontSize: 11 }}>← 좌우로 넘겨보세요 →</span>
              )}
            </div>

            {/* 테이블 — position:fixed 쉐브론은 아래 별도 렌더링 */}
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div ref={mobileTableRef} className="overflow-x-auto">
                  <div style={{ minWidth: 520 }}>
                    <div className="border-b border-neutral-100" style={{ display: "grid", gridTemplateColumns: "160px repeat(3, 120px)" }}>
                      <div className="px-4 py-5" style={{ background: "#fff" }} />
                      {(["Focus", "Scale", "Infinite"] as const).map((name, i) => {
                        const price = i === 0 ? focusPrice : i === 1 ? scalePrice : "문의";
                        const featured = i === 1;
                        return (
                          <div
                            key={name}
                            className="px-3 py-4 text-center"
                            style={{ borderLeft: "1px solid #F3F4F6", background: featured ? "rgba(var(--cp-rgb),0.06)" : "#fff" }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 700, color: featured ? "var(--cp)" : "#111827" }}>{name}</div>
                            <div className="mt-0.5" style={{ fontSize: 11, color: featured ? "var(--cp)" : "#9CA3AF", opacity: featured ? 0.7 : 1 }}>{price}{price !== "문의" && (billing === "annual" ? "/월" : "")}</div>
                          </div>
                        );
                      })}
                    </div>
                    {comparison.map((row) => (
                      <Fragment key={row.name}>
                        {row.section && (
                          <div className="px-4 pb-1.5 pt-6" style={{ borderTop: "1px solid #F3F4F6" }}>
                            <span className="text-neutral-950" style={{ fontSize: 12, fontWeight: 700 }}>{row.section}</span>
                          </div>
                        )}
                        <div
                          className="transition-colors hover:bg-neutral-50/60"
                          style={{ display: "grid", gridTemplateColumns: "160px repeat(3, 120px)", borderTop: "1px solid #F3F4F6" }}
                        >
                          <div className="px-4 py-3.5 text-neutral-600" style={{ fontSize: 13 }}>{row.name}</div>
                          {(["focus", "scale", "infinite"] as const).map((key, i) => (
                            <div
                              key={key}
                              className="flex items-center justify-center px-3 py-3.5"
                              style={{ borderLeft: "1px solid #F3F4F6", background: i === 1 ? "rgba(var(--cp-rgb),0.03)" : "#fff" }}
                            >
                              {renderCell(row[key], i === 1)}
                            </div>
                          ))}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
                {mobileCanScrollRight && (
                  <>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-2xl" style={{ background: "linear-gradient(to left, #fff 25%, transparent)" }} />
                    <button onClick={() => scrollMobileTable("right")} aria-label="오른쪽으로 스크롤" className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md text-neutral-500 transition-all hover:text-neutral-900 active:scale-95">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </>
                )}
                {mobileCanScrollLeft && (
                  <>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-12 rounded-l-2xl" style={{ background: "linear-gradient(to right, #fff 25%, transparent)" }} />
                    <button onClick={() => scrollMobileTable("left")} aria-label="왼쪽으로 스크롤" className="absolute left-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md text-neutral-500 transition-all hover:text-neutral-900 active:scale-95">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </>
                )}
              </div>
          </div>

          {/* ── 데스크탑: 기존 full-width 테이블 유지 ── */}
          <div className="hidden lg:block mt-8">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-100">
                <table className="w-full" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "38%" }} />
                    <col style={{ width: "20.67%" }} />
                    <col style={{ width: "20.67%" }} />
                    <col style={{ width: "20.67%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="pt-5 pb-4 px-6 text-left" style={{ background: "#fff" }}>
                        <div className="text-neutral-950" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em" }}>플랜별 기능 비교</div>
                        <p className="mt-1 text-neutral-400" style={{ fontSize: 12 }}>{billing === "annual" ? "연간 결제 (-20%)" : "월간 결제"}</p>
                      </th>
                      <th className="pt-5 pb-4 px-4 text-center border-l border-neutral-100" style={{ background: "#fff" }}>
                        <div className="text-neutral-800" style={{ fontSize: 14, fontWeight: 700 }}>Focus</div>
                        <div className="mt-1 text-neutral-400" style={{ fontSize: 12 }}>{focusPrice}{billing === "annual" ? "/월" : ""}</div>
                      </th>
                      <th className="pt-5 pb-4 px-4 text-center border-l border-neutral-100" style={{ background: "rgba(var(--cp-rgb),0.06)" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cp)" }}>Scale</div>
                        <div className="mt-1" style={{ fontSize: 12, color: "var(--cp)", opacity: 0.65 }}>{scalePrice}{billing === "annual" ? "/월" : ""}</div>
                      </th>
                      <th className="pt-5 pb-4 px-4 text-center border-l border-neutral-100" style={{ background: "#fff" }}>
                        <div className="text-neutral-800" style={{ fontSize: 14, fontWeight: 700 }}>Infinite</div>
                        <div className="mt-1 text-neutral-400" style={{ fontSize: 12 }}>문의</div>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <table className="w-full" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "38%" }} />
                  <col style={{ width: "20.67%" }} />
                  <col style={{ width: "20.67%" }} />
                  <col style={{ width: "20.67%" }} />
                </colgroup>
                <tbody>
                  {comparison.map((row) => (
                    <Fragment key={row.name}>
                      {row.section && (
                        <tr>
                          <td colSpan={4} className="pb-2 pt-8 px-6">
                            <span className="text-neutral-950" style={{ fontSize: 14, fontWeight: 700 }}>{row.section}</span>
                          </td>
                        </tr>
                      )}
                      <tr className="transition-colors hover:bg-neutral-50/60">
                        <td className="py-4 px-6 text-neutral-600" style={{ fontSize: 14, borderTop: "1px solid #F3F4F6" }}>{row.name}</td>
                        <td className="px-4 py-4 text-center" style={{ borderTop: "1px solid #F3F4F6", borderLeft: "1px solid #F3F4F6" }}>{renderCell(row.focus, false)}</td>
                        <td className="px-4 py-4 text-center" style={{ borderTop: "1px solid #F3F4F6", borderLeft: "1px solid #F3F4F6", background: "rgba(var(--cp-rgb),0.03)" }}>{renderCell(row.scale, true)}</td>
                        <td className="px-4 py-4 text-center" style={{ borderTop: "1px solid #F3F4F6", borderLeft: "1px solid #F3F4F6" }}>{renderCell(row.infinite, false)}</td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>
              FAQ
            </span>
            <h2
              className="mt-4 text-neutral-950"
              style={{ fontSize: "clamp(18px, 2.4vw, 26px)", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              가격에 대해 자주 묻는 질문
            </h2>
          </div>
          <div className="divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            {[
              { q: "무료 체험 기간이 있나요?", a: "네, 7일 무료 체험을 제공합니다. 결제 정보 없이 바로 시작할 수 있습니다." },
              { q: "연간 결제 시 할인이 적용되나요?", a: "연간 결제 시 20% 할인이 적용됩니다. Focus 플랜 기준 월 79,200원(연 950,400원)으로 이용 가능합니다." },
              { q: "플랜을 중간에 변경할 수 있나요?", a: "언제든지 업그레이드 또는 다운그레이드할 수 있습니다. 변경 시 남은 기간은 일할 계산하여 정산됩니다." },
              { q: "Infinite 플랜 가격은 어떻게 되나요?", a: "Infinite 플랜은 이용 규모와 필요 기능에 따라 맞춤 견적을 제공합니다. 문의하기를 통해 상담을 요청해 주세요." },
              { q: "인플루언서는 요금이 없나요?", a: "인플루언서의 가입·참여·정산은 모두 완전 무료입니다. 웰링크는 인플루언서에게 어떠한 수수료도 받지 않습니다." },
            ].map((it, i) => (
              <details
                key={it.q}
                className="group px-7 py-6 transition-colors hover:bg-[var(--cbg1)]/50 open:bg-[var(--cbg1)]/30"
                {...(i === 0 ? { open: true } : {})}
              >
                <summary
                  className="flex cursor-pointer list-none items-start justify-between gap-6 text-neutral-950 transition-colors group-hover:text-[var(--cp)]"
                  style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, letterSpacing: "-0.01em" }}
                >
                  <span>{it.q}</span>
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-300 group-hover:border-[var(--cp)]/40 group-hover:text-[var(--cp)] group-open:rotate-45 group-open:border-[var(--cp)] group-open:bg-[var(--cp)] group-open:text-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>
                  {it.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 sm:pb-28 lg:pb-32">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div
            className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 lg:p-16 text-center"
            style={{ background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <h3
              className="relative text-white"
              style={{ fontSize: "clamp(18px, 2.6vw, 26px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.015em", wordBreak: "keep-all" }}
            >
              어떤 플랜이 맞는지 모르겠다면
            </h3>
            <p className="relative mx-auto mt-5 max-w-md text-white/80" style={{ fontSize: 16, lineHeight: 1.7 }}>
              웰링크 팀이 무료로 컨설팅해 드립니다.<br />브랜드 규모와 목표에 맞는 플랜을 함께 찾아드립니다.
            </p>
            <button
              onClick={() => onNavigate("login")}
              className="relative mt-10 whitespace-nowrap rounded-full bg-white px-10 py-4 text-[var(--cp)] transition-all hover:translate-y-[-2px]"
              style={{ fontSize: 16, fontWeight: 600, boxShadow: "0 10px 24px -16px rgba(0,0,0,0.2)" }}
            >
              무료 상담 신청하기
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
