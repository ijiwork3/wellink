import { useState, useEffect, useRef, type CSSProperties } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BackgroundGrid } from "./background-grid";
import { Reveal } from "./reveal";

import { CardReveal } from "./card-reveal";
import { Gift, Wallet, BarChart2, Tag, Zap, Sparkles, Building2, Settings, User, Users, Dumbbell, CalendarDays } from "lucide-react";
import { useInView, useCountUp } from "./count-up";

type Page = "main" | "advertiser" | "influencer";

export function InfluencerPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <main className="relative w-full bg-white">
      <Hero />
      <Reveal bg="bg-[var(--cbg1)]">
        <InfluencerTypes />
      </Reveal>
      <Reveal bg="bg-[var(--cbg1)]">
        <FitScoreShowcase />
      </Reveal>
      <Reveal bg="bg-white">
        <Earnings />
      </Reveal>
      <Reveal bg="bg-white">
        <RevenueStructure />
      </Reveal>
      <Reveal bg="bg-[var(--cbg2)]">
        <Steps />
      </Reveal>
      <Reveal bg="bg-white">
        <Testimonials />
      </Reveal>
      <Reveal bg="bg-white">
        <CTA onNavigate={onNavigate} />
      </Reveal>
    </main>
  );
}

function AnimatedInfluencerH1() {
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
      className="text-neutral-950"
      style={{ fontSize: "clamp(24px, 4.4vw, 50px)", fontWeight: 700, lineHeight: 1.32, letterSpacing: "-0.025em", wordBreak: "keep-all" }}
    >
      <span style={{ display: "block", ...f(80) }}>팔로워 수가 아니라,</span>
      <span style={{ display: "block", ...f(200) }}>
        <span className="gradient-text-loop">콘텐츠 실적이</span>
      </span>
      <span style={{ display: "block", ...f(320) }}>수익이 됩니다.</span>
    </h1>
  );
}

function Hero() {
  const { ref: scoreRef, inView: scoreInView } = useInView(0.3);
  const score = useCountUp(85, 1400, scoreInView);

  return (
    <section className="relative overflow-hidden bg-white text-neutral-950 [scroll-snap-align:start]">
      {/* 도트 그리드 */}
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(var(--cp-rgb),0.18) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      {/* 우상단 주 글로우 */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[820px] rounded-full opacity-45 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cl-rgb),0.55), rgba(var(--cs-rgb),0.1) 60%, transparent 80%)" }} />
      {/* 좌하단 보조 글로우 */}
      <div className="pointer-events-none absolute bottom-0 left-[-4%] h-[360px] w-[480px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cp-rgb),0.2), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 pt-8 pb-12 sm:pt-10 sm:pb-20 lg:pt-12 lg:pb-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cp)]/20 bg-[var(--cbg1)] px-4 py-2 text-[var(--cp)] backdrop-blur" style={{ fontSize: 14, fontWeight: 600 }}>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cp)]" />
          인플루언서 서비스 · 완전 무료
        </span>
        <div className="mt-10 grid items-start gap-16 grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <AnimatedInfluencerH1 />
            <p className="mt-10 max-w-[560px] text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>
              팔로워 수가 아니라 Fit-Score가 기준입니다. 궁합이 맞으면 팔로워 3,000명도 대형 인플루언서보다 먼저 추천됩니다. 활동비·협찬 정산은 플랫폼에서 처리합니다.
            </p>
            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <button className="w-full sm:w-auto rounded-full px-8 py-4 whitespace-nowrap transition-all hover:translate-y-[-1px] active:scale-[0.97]" style={{ fontSize: 15, fontWeight: 600, color: "white", background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", boxShadow: "0 6px 18px -8px rgba(var(--cp-rgb),0.42)" }}>내 채널 수익 연결하기</button>
              <button
                onClick={() => document.getElementById("influencer-steps")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white px-8 py-4 whitespace-nowrap text-neutral-700 transition-all hover:translate-y-[-1px] hover:border-neutral-400 active:scale-[0.97]"
                style={{ fontSize: 15, fontWeight: 600 }}
              >
                가입 4단계 미리보기
              </button>
            </div>

          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-[40px] opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cl-rgb),0.5), transparent 70%)" }} />
            <div ref={scoreRef} className="relative overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 text-neutral-500" style={{ fontSize: 12, fontWeight: 600 }}>내 Fit-Score · 팔로워 3,000명</p>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-[var(--cbg1)] px-3 py-1 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600 }}>우선 추천</span>
              </div>
              <p className="mt-6" style={{ fontSize: 88, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {score}<span style={{ fontSize: 24, color: "var(--cp)", WebkitTextFillColor: "var(--cp)" }}>점</span>
              </p>
              <p className="mt-8 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.7 }}>팔로워 수와 무관하게, Fit-Score가 높을수록 브랜드 추천 우선순위가 올라갑니다.</p>
              <div className="mt-6 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--cp)" }} />
                <span className="text-neutral-400" style={{ fontSize: 12 }}>팔로워 3,000명 · 우선 추천 적용 중</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Earnings() {
  const [carouselIdx, setCarouselIdx] = useState(0);

  const items = [
    {
      Icon: Wallet,
      title: "활동비 캠페인 단가",
      desc: "브랜드가 직접 의뢰하는 캠페인. Fit-Score 기반 산정이라 팔로워보다 궁합이 단가를 결정합니다.",
      kpis: [{ label: "결정 기준", value: "Fit-Score" }, { label: "정산", value: "플랫폼 처리" }],
      img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    },
    {
      Icon: Gift,
      title: "제품·서비스 협찬",
      desc: "좋아서 쓰는 제품이 협찬으로 연결됩니다. 브랜드 핏이 맞으면 별도 협의를 통해 활동비 캠페인으로 이어질 수 있습니다.",
      kpis: [{ label: "혜택 유형", value: "제품 협찬" }, { label: "활동비 전환", value: "협의 가능" }],
      img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    },
    {
      Icon: BarChart2,
      title: "협업 이력 기반 단가 산정",
      desc: "협업이 쌓일수록 Fit-Score와 이력이 쌓여 더 좋은 캠페인에 우선 추천됩니다. 경험이 단가에 반영됩니다.",
      kpis: [{ label: "단가 기준", value: "협업 이력" }, { label: "조정", value: "이력 반영" }],
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    },
    {
      Icon: Tag,
      title: "웰링크 공식 파트너",
      desc: "웰니스 카테고리 전문 인플루언서로 포지셔닝됩니다. 브랜드 인지도가 함께 성장합니다.",
      kpis: [{ label: "카테고리", value: "웰니스 전문" }, { label: "인지도", value: "공동 성장" }],
      img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    },
    {
      Icon: Zap,
      title: "수익 정산",
      desc: "콘텐츠 승인 후 플랫폼을 통해 정산됩니다. 추가 청구서나 별도 협의 없이 처리됩니다.",
      kpis: [{ label: "정산", value: "플랫폼 처리" }, { label: "추가 절차", value: "없음" }],
      img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    },
    {
      Icon: Sparkles,
      title: "모두 무료",
      desc: "가입비, 수수료, 위약금 없음. 인플루언서는 완전 무료로 참여합니다.",
      kpis: [{ label: "가입비", value: "0원" }, { label: "수수료", value: "없음" }],
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const goTo = (idx: number) => {
    setCarouselIdx(Math.max(0, Math.min(items.length - 1, idx)));
  };

  return (
    <section className="bg-white py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>수익 구조</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>참여하면 이런 수입이 생깁니다</h2>
          <p className="mt-3 max-w-xl text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>팔로워 수가 아닌 채널 핏으로 단가가 결정됩니다</p>
        </div>

        {/* 컨트롤 바 */}
        <div className="mb-4 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo(carouselIdx - 1)}
              disabled={carouselIdx === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-30"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center gap-1">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="flex min-h-[44px] items-center justify-center px-1.5"
                >
                  <span
                    className="block h-1.5 rounded-full transition-all duration-300"
                    style={{ width: carouselIdx === i ? 20 : 6, background: carouselIdx === i ? "var(--cp)" : "#E5E7EB" }}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => goTo(carouselIdx + 1)}
              disabled={carouselIdx === items.length - 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-30"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* 슬라이드 트랙 */}
        <div className="overflow-hidden rounded-[28px] border border-neutral-200">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${carouselIdx * 100}%)` }}
          >
            {items.map((it) => {
              const Ic = it.Icon;
              return (
                <div
                  key={it.title}
                  className="min-w-full bg-white"
                >
                  <div className="grid items-center grid-cols-1 lg:grid-cols-2">
                    <div className="p-7 sm:p-10 lg:p-12">
                      <span
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(var(--cp-rgb),0.10)" }}
                      >
                        <Ic size={20} className="text-[var(--cp)]" />
                      </span>
                      <h3
                        className="mt-5 text-neutral-950"
                        style={{ fontSize: "clamp(22px,2.6vw,34px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.015em" }}
                      >
                        {it.title}
                      </h3>
                      <p className="mt-4 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.75 }}>
                        {it.desc}
                      </p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        {it.kpis.map((kpi) => (
                          <div key={kpi.label} className="rounded-2xl border border-neutral-200 bg-[var(--cbg1)] px-5 py-3">
                            <p className="text-neutral-500" style={{ fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
                            <p className="mt-1 text-neutral-950" style={{ fontSize: 16, fontWeight: 700 }}>{kpi.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      className="relative hidden h-full min-h-[280px] overflow-hidden lg:block"
                      style={{
                        maskImage: "linear-gradient(90deg, transparent 0%, black 30%)",
                        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 30%)",
                      }}
                    >
                      <ImageWithFallback
                        src={it.img}
                        alt="캠페인 유형 이미지"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FitScoreShowcase() {
  const { ref, inView } = useInView(0.2);
  const ranks = [
    { rank: 1, name: "이지연", handle: "@fitjunki_yeon", followers: "3,000명", score: 85, status: "matched" as const, delay: 0 },
    { rank: 2, name: "정우현", handle: "@wellness_j", followers: "8,500명", score: 72, status: "matched" as const, delay: 150 },
    { rank: 3, name: "대계정", handle: "@bigfollower", followers: "100,000명", score: 40, status: "waiting" as const, delay: 300 },
  ];
  return (
    <section className="relative overflow-hidden bg-[var(--cbg1)] py-14 sm:py-20 lg:py-24">
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-16 px-4 sm:px-6 lg:px-10 grid-cols-1 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>FIT-SCORE</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(24px, 3.4vw, 40px)", fontWeight: 700, lineHeight: 1.28, letterSpacing: "-0.02em", wordBreak: "keep-all" }}>
            팔로워 3,000명도 Fit-Score 높으면{" "}
            <span style={{ background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>10만 명보다 먼저</span>
          </h2>
          <p className="mt-8 max-w-md text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>웰링크는 팔로워 수가 아니라 브랜드와의 궁합을 봅니다. 팔로워가 적어도 Fit-Score가 높으면 먼저 추천됩니다.</p>
          <button className="mt-12 rounded-full px-8 py-4 whitespace-nowrap transition-all hover:translate-y-[-1px] active:scale-[0.97]" style={{ fontSize: 15, fontWeight: 600, color: "white", background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", boxShadow: "0 6px 18px -8px rgba(var(--cp-rgb),0.42)" }}>내 채널 Fit-Score 미리보기</button>
        </div>

        {/* 매칭 순위 위젯 */}
        <div ref={ref} className="relative">
          <div className="absolute -inset-6 rounded-[40px] opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cl-rgb),0.4), transparent 70%)" }} />
          <div className="relative overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cp)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cp)]" />
                </span>
                <span className="text-neutral-700" style={{ fontSize: 14, fontWeight: 600 }}>브랜드 추천 순위</span>
              </div>
              <span className="text-neutral-400" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>실시간</span>
            </div>

            {/* 순위 rows */}
            <div className="divide-y divide-neutral-100 px-6">
              {ranks.map((r) => (
                <div key={r.rank} className="py-5" style={{ opacity: r.status === "waiting" ? 0.45 : 1 }}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 shrink-0 text-neutral-400" style={{ fontSize: 12, fontWeight: 700 }}>#{r.rank}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-neutral-900" style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                          <span className="ml-2 text-neutral-400" style={{ fontSize: 12 }}>{r.handle}</span>
                        </div>
                        {r.status === "matched" ? (
                          <span className="shrink-0 rounded-full bg-[var(--cbg1)] px-2.5 py-1 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 700 }}>✓ 선정 완료</span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-neutral-50 px-2.5 py-1 text-neutral-400" style={{ fontSize: 12, fontWeight: 600 }}>대기 중</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-neutral-500" style={{ fontSize: 12, fontWeight: 500 }}>
                          팔로워 {r.followers}
                        </span>
                        <div className="flex flex-1 items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: inView ? `${r.score}%` : "0%",
                                background: r.status === "matched" ? "linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)" : "rgba(0,0,0,0.1)",
                                transition: `width 1.2s cubic-bezier(0.22,1,0.36,1) ${r.delay}ms`,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: r.status === "matched" ? "var(--cp)" : "#ccc", minWidth: 34, textAlign: "right" }}>
                            {r.score}점
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 설명 */}
            <div className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-4">
              <p className="text-neutral-400" style={{ fontSize: 12, lineHeight: 1.7 }}>
                팔로워 10만 계정이 3천 계정보다 후순위인 이유 —{" "}
                <span className="text-[var(--cp)]">Fit-Score</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueStructure() {
  const items = [
    { Icon: Gift, title: "제품 협찬", desc: "제품·서비스 무상 제공. 체험 후 리뷰 게시. 활동비 없음." },
    { Icon: Wallet, title: "활동비", desc: "제품 협찬 + 활동비 지급. Fit-Score 기반으로 단가 산정." },
    { Icon: Settings, title: "활동비 기준", desc: "팔로워 수가 아닌 Fit-Score 기반 산정. 협업 이력이 쌓이면 다음 캠페인 단가에 반영됩니다." },
    { Icon: Building2, title: "정산 방식", desc: "콘텐츠 승인 후 플랫폼을 통해 정산 처리. 추가 청구서·위약금 없음." },
  ];
  return (
    <section className="bg-[var(--cbg1)] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>정산</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>수익 구조를 투명하게 공개합니다</h2>
          <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>제품 협찬과 활동비 혜택 범위를 미리 확인하세요</p>
        </div>
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {items.map((it) => {
            const Ic = it.Icon;
            return (
              <div key={it.title} className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 sm:p-9 transition-all hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" style={{ background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)" }}>
                    <Ic size={20} className="text-white" />
                  </span>
                  <h3 className="text-neutral-950" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>{it.title}</h3>
                </div>
                <p className="mt-5 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>{it.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const steps = [
    { n: "01", title: "채널 분석", desc: "SNS 계정 연동 시 게시물·오디언스 데이터를 분석해 Fit-Score를 산정합니다.", note: "SNS 연동으로 완료" },
    { n: "02", title: "맞춤 캠페인 추천", desc: "Fit-Score 기반으로 내 채널에 맞는 캠페인을 추천합니다. DM 없이 플랫폼에서 확인하고 지원합니다.", note: "Fit-Score 기반 추천" },
    { n: "03", title: "콘텐츠 등록", desc: "브랜드 가이드라인 확인 후 콘텐츠 제출. 검수 완료 시 승인 여부를 알림으로 안내합니다.", note: "가이드라인 제공" },
    { n: "04", title: "수익 정산", desc: "콘텐츠 승인 후 플랫폼을 통해 정산 처리됩니다. 추가 청구서나 별도 협의가 필요 없습니다.", note: "플랫폼 정산" },
  ];
  return (
    <section id="influencer-steps" className="relative bg-[var(--cbg2)] py-14 sm:py-20 lg:py-24">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>단계</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>참여는 4단계로 끝납니다</h2>
          <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>SNS 연동부터 수익 정산까지, 모두 웰링크 앱 하나에서</p>
        </div>

        <div className="mb-8 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", title: "채널 분석", desc: "SNS 연동 후 Fit-Score 산정" },
            { n: "02", title: "맞춤 캠페인", desc: "Fit-Score 기반 캠페인 추천" },
            { n: "03", title: "콘텐츠 등록", desc: "가이드라인 확인 후 제출" },
            { n: "04", title: "정산", desc: "콘텐츠 승인 후 플랫폼 정산" },
          ].map((s, i) => (
            <div
              key={s.n}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
            >
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                style={{ fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)" }}
              >
                {s.n}
              </span>
              <div>
                <p className="text-neutral-950" style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</p>
                <p className="text-neutral-500" style={{ fontSize: 12 }}>{s.desc}</p>
              </div>
              {i < 3 && (
                <svg className="ml-auto shrink-0 text-[var(--cp)]/40" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <CardReveal key={s.n} delay={i * 80} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 transition-all hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]">
                <div className="text-[var(--cp)]" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>{s.n}</div>
                <h3 className="mt-6 text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.01em" }}>{s.title}</h3>
                <p className="mt-4 flex-1 text-neutral-600" style={{ fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
                <div className="mt-8 inline-flex w-fit rounded-full px-3 py-1.5 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, background: "rgba(var(--cp-rgb),0.08)" }}>{s.note}</div>
              </div>
            </CardReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      name: "이지현",
      handle: "@jihyun_yoga",
      followers: "팔로워 4,200명",
      platform: "IG",
      quote: "팔로워가 많지 않아서 협찬받기 어려울 거라 생각했는데, Fit-Score 덕분에 오히려 좋은 브랜드랑 연결됐어요. 첫 달에 3개 캠페인 진행했습니다.",
      campaigns: 3,
      earned: "420,000원",
      gradient: "linear-gradient(135deg, #2563EB 0%, #10B981 100%)",
    },
    {
      name: "서울러닝크루",
      handle: "@seoul_running_crew",
      followers: "멤버 280명",
      platform: "IG",
      quote: "크루 계정으로 브랜드 제안 받을 수 있는지 몰랐어요. 웰링크에 연동하니까 스포츠 브랜드에서 협찬 제안이 바로 왔고, 멤버들도 같이 혜택받았습니다.",
      campaigns: 5,
      earned: "750,000원",
      gradient: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
    },
    {
      name: "스튜디오 J",
      handle: "@studio_j_pilates",
      followers: "인스타 8,500명",
      platform: "IG",
      quote: "대행사 통해서 계약하면 수수료도 많고 정산도 느린데, 웰링크는 승인되면 바로 입금됐어요. 정산 스트레스가 없어서 콘텐츠에 집중할 수 있습니다.",
      campaigns: 8,
      earned: "1,280,000원",
      gradient: "linear-gradient(135deg, #065F46 0%, #10B981 100%)",
    },
  ];
  return (
    <section className="bg-white py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>후기 예시</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>인플루언서들이 이렇게 활용합니다</h2>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <CardReveal key={t.handle} delay={i * 90} className="h-full">
              <div className="group relative flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 transition-all hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-105" style={{ fontSize: 20, fontWeight: 700, background: t.gradient }}>
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-neutral-950" style={{ fontSize: 16, fontWeight: 700 }}>{t.name}</p>
                    <p className="mt-0.5 truncate text-neutral-500" style={{ fontSize: 12 }}>{t.handle} · {t.followers}</p>
                  </div>
                  <span className="ml-auto shrink-0 rounded-full bg-[var(--cp)]/10 px-2.5 py-1 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 700 }}>{t.platform}</span>
                </div>
                <p className="mt-6 flex-1 text-neutral-700" style={{ fontSize: 14, lineHeight: 1.8 }}>"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-6 border-t border-neutral-100 pt-5">
                  <div>
                    <p className="text-neutral-400" style={{ fontSize: 12 }}>참여 캠페인</p>
                    <p className="mt-1 text-neutral-950" style={{ fontSize: 16, fontWeight: 700 }}>{t.campaigns}건</p>
                  </div>
                  <div>
                    <p className="text-neutral-400" style={{ fontSize: 12 }}>정산 수익</p>
                    <p className="mt-1 text-[var(--cp)]" style={{ fontSize: 16, fontWeight: 700 }}>{t.earned}</p>
                  </div>
                </div>
              </div>
            </CardReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="bg-white pb-16 sm:pb-28 lg:pb-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 lg:p-16 text-center" style={{ background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)" }}>
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <h3 className="relative text-white" style={{ fontSize: "clamp(20px, 2.8vw, 30px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.015em" }}>지금 무료로 등록하세요</h3>
          <p className="relative mx-auto mt-6 max-w-xl text-white/80" style={{ fontSize: 16, lineHeight: 1.7 }}>SNS 연동 3분 · 가입비 없음 · 언제든 탈퇴 가능</p>
          <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => onNavigate("login")} className="rounded-full bg-white px-8 py-4 whitespace-nowrap text-[var(--cp)] transition-all hover:translate-y-[-1px] active:scale-[0.97]" style={{ fontSize: 15, fontWeight: 600, boxShadow: "0 10px 24px -16px rgba(0,0,0,0.18)" }}>지금 무료로 등록하기</button>
            <button onClick={() => onNavigate("campaigns")} className="rounded-full border border-white/30 bg-white/10 px-8 py-4 whitespace-nowrap text-white backdrop-blur transition-all hover:translate-y-[-1px] hover:bg-white/15" style={{ fontSize: 15, fontWeight: 600 }}>진행 중인 캠페인 보기</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfluencerTypes() {
  const types = [
    { Icon: User, name: "개인 크리에이터", desc: "피트니스·요가·헬시라이프를 다루는 개인 채널. 팔로워 수보다 진정성 있는 콘텐츠가 브랜드 신뢰로 직결됩니다.", tags: ["헬스 인스타그래머", "요가 유튜버", "홈트 릴스 크리에이터", "건강식단 블로거"] },
    { Icon: Users, name: "크루·커뮤니티", desc: "러닝크루·요가모임·피트니스 그룹 운영자. 오프라인 기반의 집단 바이럴은 강한 신뢰감을 형성합니다.", tags: ["러닝크루 운영자", "필라테스 오픈채팅", "요가 소모임"] },
    { Icon: Dumbbell, name: "센터·스튜디오", desc: "필라테스·크로스핏·PT 센터 운영자. 실제 공간과 수업 기반 O2O 체험 콘텐츠는 강한 구매 전환을 만듭니다.", tags: ["스튜디오 공식 계정", "PT 트레이너", "필라테스 강사"] },
    { Icon: CalendarDays, name: "행사·이벤트", desc: "마라톤·피트니스 엑스포·웰니스 페스티벌 기획자. 대규모 참여자를 대상으로 한 강력한 노출 기회입니다.", tags: ["대회 조직위", "이벤트 기획사", "웰니스 페스티벌"] },
  ];
  return (
    <section className="bg-[var(--cbg1)] pt-14 sm:pt-20 lg:pt-24 pb-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>유형</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>나는 어떤 유형인가요?</h2>
          <p className="mt-3 max-w-xl text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>팔로워 수, 채널 유형 상관없이 Fit-Score가 높으면 우선 추천됩니다</p>
        </div>
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {types.map((t, i) => {
            const Ic = t.Icon;
            return (
              <CardReveal key={t.name} delay={i * 80} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 lg:p-9 transition-all hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(var(--cl-rgb),0.10), transparent 65%)" }} />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" style={{ background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)" }}>
                      <Ic size={24} className="text-white" />
                    </span>
                    <div>
                      <h3 className="text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.015em", wordBreak: "keep-all" }}>{t.name}</h3>
                      <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>{t.desc}</p>
                    </div>
                  </div>
                  <div className="relative mt-6 flex flex-wrap gap-2">
                    {t.tags.map((tg) => (
                      <span key={tg} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-neutral-700 transition-colors group-hover:border-[var(--cp)]/20 group-hover:text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 500 }}>{tg}</span>
                    ))}
                  </div>
                </div>
              </CardReveal>
            );
          })}
        </div>
        <p className="mt-8 text-center text-neutral-500" style={{ fontSize: 14 }}>어떤 유형이든 Fit-Score가 높으면 우선 추천됩니다.</p>
      </div>
    </section>
  );
}
