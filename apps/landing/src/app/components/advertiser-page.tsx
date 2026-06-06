import { useState, useEffect, useRef, type CSSProperties } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BackgroundGrid } from "./background-grid";
import { Reveal } from "./reveal";

import { CardReveal } from "./card-reveal";
import { User, Users, Dumbbell, CalendarDays } from "lucide-react";
import { useInView, AnimatedNumber } from "./count-up";

type Page = "main" | "advertiser" | "influencer";

export function AdvertiserPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <main className="relative w-full bg-white">
      <Hero />
      <Reveal bg="bg-white" className="relative z-10">
        <Stats />
      </Reveal>
      <Reveal bg="bg-white">
        <ThreeReasons />
      </Reveal>
      <Reveal bg="bg-[var(--cbg1)]">
        <Process />
      </Reveal>
      <Reveal bg="bg-[var(--cbg2)]">
        <DashboardPreview />
      </Reveal>
      <Reveal bg="bg-white">
        <InfluencerTypes />
      </Reveal>
      <Reveal bg="bg-[var(--cbg2)]">
        <Compare />
      </Reveal>
      <Reveal bg="bg-white">
        <Testimonials />
      </Reveal>
      <Reveal bg="bg-[var(--cbg2)]">
        <PartnerBrands />
      </Reveal>
      <Reveal bg="bg-white">
        <FAQ />
      </Reveal>
      <Reveal bg="bg-white">
        <CTA onNavigate={onNavigate} />
      </Reveal>
    </main>
  );
}

function AnimatedAdvertiserH1() {
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
      className="mt-10 text-neutral-950"
      style={{ fontSize: "clamp(24px, 4.4vw, 50px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.03em", wordBreak: "keep-all" }}
    >
      <span style={{ display: "block", ...f(80) }}>
        <span className="gradient-text-loop">매출</span>이 안 나온다면,
      </span>
      <span style={{ display: "block", ...f(220) }}>
        <span className="gradient-text-loop">기준</span>이 틀린 겁니다
      </span>
    </h1>
  );
}

function Hero() {
  const { ref: listRef, inView: listInView } = useInView(0.25);

  return (
    <section className="relative overflow-hidden bg-[var(--cbg1)] [scroll-snap-align:start]">
      <BackgroundGrid />
      {/* 배경 데코 — 우상단 주 글로우 */}
      <div className="pointer-events-none absolute -top-32 right-[-8%] h-[560px] w-[700px] rounded-full opacity-55 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cl-rgb),0.55), rgba(var(--cs-rgb),0.15) 60%, transparent 80%)" }} />
      {/* 좌하단 보조 글로우 */}
      <div className="pointer-events-none absolute -bottom-20 left-[-6%] h-[420px] w-[520px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cp-rgb),0.22), transparent 70%)" }} />
      {/* 중앙 미세 글로우 */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cs-rgb),0.3), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-20">
        <div className="grid items-center gap-16 grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full border border-[var(--cp)]/20 bg-white/80 px-3.5 py-2 text-[var(--cp)] backdrop-blur sm:px-4" style={{ fontSize: "clamp(12px, 3.4vw, 14px)", fontWeight: 600 }}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cp)]" />
              광고주 서비스 · 웰니스·피트니스 전문
            </span>
            <AnimatedAdvertiserH1 />
            <p className="mt-10 max-w-[560px] text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>
              웰링크는 팔로워 수가 아닌 브랜드 전환 패턴으로 인플루언서를 선별합니다.
              <br />맞지 않는 인플루언서는 처음부터 추천하지 않습니다.
            </p>
            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <button className="w-full sm:w-auto rounded-full px-8 py-4 whitespace-nowrap text-white transition-all hover:translate-y-[-1px] active:scale-[0.97]" style={{ fontSize: 15, fontWeight: 600, background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", boxShadow: "0 6px 18px -8px rgba(var(--cp-rgb),0.42)" }}>무료로 시작하기</button>
              <button
              onClick={() => document.getElementById("advertiser-faq")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white px-8 py-4 whitespace-nowrap text-neutral-700 transition-all hover:translate-y-[-1px] hover:border-neutral-400 active:scale-[0.97]"
              style={{ fontSize: 15, fontWeight: 600 }}
            >문의하기</button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-[40px] opacity-60 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(var(--cl-rgb),0.45), transparent 70%)" }} />
            <div className="relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_16px_32px_-26px_rgba(var(--cd-rgb),0.18)]">
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--cl)]" />
                  <span className="text-neutral-700" style={{ fontSize: 12, fontWeight: 600 }}>Fit-Score 추천 현황</span>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, background: "rgba(var(--cp-rgb),0.08)" }}>실시간</span>
              </div>
              <div ref={listRef} className="space-y-3 p-6">
                {[
                  { n: "@wellness.lab", s: 92, delay: 0 },
                  { n: "@runners.daily", s: 81, delay: 100 },
                  { n: "@yoga.with.j", s: 74, delay: 200 },
                  { n: "@fitstudio.k", s: 63, delay: 300 },
                ].map((r) => (
                  <div key={r.n} className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", fontSize: 14, fontWeight: 700 }}>{r.n.charAt(1).toUpperCase()}</span>
                      <div>
                        <p className="text-neutral-900" style={{ fontSize: 14, fontWeight: 600 }}>{r.n}</p>
                        <p className="text-neutral-500" style={{ fontSize: 12 }}>Fit-Score {r.s}</p>
                      </div>
                    </div>
                    <div className="flex w-32 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: listInView ? `${r.s}%` : "0%",
                            background: "linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)",
                            transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${r.delay}ms`,
                          }}
                        />
                      </div>
                      <span className="text-neutral-700" style={{ fontSize: 12, fontWeight: 600 }}>{r.s}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-neutral-500" style={{ fontSize: 12 }}>ROAS (실측 평균)</p>
                  <p style={{ fontSize: 18, fontWeight: 700, background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>4.8×</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { v: "20%", label: "평균 클릭률", note: "업계 평균 2~3% 대비 8배", headline: "팔로워가 아닌, 전환율을 봅니다.", desc: "Fit-Score 선별은 노출이 아닌 실제 클릭과 구매 전환을 목표로 합니다. 실제 캠페인 3건에서 업계 평균 대비 8배 높은 CTR을 검증했습니다." },
    { v: "4.8×", label: "ROAS (실측 평균)", note: "실제 캠페인 3건 평균 실측", headline: "광고비가 4.8배로 돌아옵니다.", desc: "브랜드 궁합이 맞는 인플루언서만 추천하기 때문에 전환 효율이 다릅니다. 투입 대비 수익률을 대시보드에서 실시간으로 확인합니다." },
    { v: "700원", label: "인플루언서 1인당 획득비용", note: "실제 캠페인 3건 평균", headline: "쓸모 있는 한 명에게만 비용을 씁니다.", desc: "맞지 않는 인플루언서는 처음부터 추천하지 않기 때문에, 광고비가 흩어지지 않고 진성 고객으로 직결됩니다." },
    { v: "70%↓", label: "캠페인 운영 업무 절감", note: "실제 캠페인 3건 실증", headline: "반복 업무를 플랫폼이 대신합니다.", desc: "캠페인 등록·인플루언서 선별·콘텐츠 확인·정산을 플랫폼 안에서 처리합니다. 기존에 쓰던 반복 업무 시간을 줄일 수 있습니다." },
  ];
  return (
    <section className="relative bg-white pt-14 sm:pt-20 lg:pt-24 pb-0">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>성과</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
            이런 성과를 목표로 합니다
          </h2>
          <p className="mt-4 text-neutral-500" style={{ fontSize: 16, lineHeight: 1.7 }}>
            팔로워가 아닌 전환 패턴 분석이 만드는 성과 — 아래 수치는 예시 기반 지표입니다
          </p>
        </div>
        <div className="relative z-30 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={it.label} className="relative h-auto lg:h-[260px]">
              <article className="group relative lg:absolute left-0 right-0 top-0 z-10 overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 transition-[box-shadow,border-color,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-20 hover:border-[var(--cp)]/30 hover:shadow-[0_18px_40px_-20px_rgba(var(--cp-rgb),0.28)] hover:-translate-y-1">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(var(--cl-rgb),0.18), transparent 60%)" }} />
                <div className="relative text-[var(--cp)]/80" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>0{i + 1}</div>
                <AnimatedNumber
                  v={it.v}
                  className="relative mt-6 origin-left transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                />
                <p className="relative mt-3 text-neutral-700" style={{ fontSize: 16, fontWeight: 600 }}>{it.label}</p>
                <p className="relative mt-2 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.7 }}>{it.note}</p>
                <div className="grid grid-rows-[1fr] lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                  <div className="overflow-hidden">
                    <div className="relative mt-6 border-t border-neutral-100 pt-6">
                      <p className="text-neutral-950 lg:opacity-0 transition-opacity duration-500 ease-out lg:group-hover:opacity-100 lg:group-hover:[transition-delay:180ms]" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{it.headline}</p>
                      <p className="mt-3 text-neutral-600 lg:opacity-0 transition-opacity duration-500 ease-out lg:group-hover:opacity-100 lg:group-hover:[transition-delay:280ms]" style={{ fontSize: 14, lineHeight: 1.7 }}>{it.desc}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerBrands() {
  const brands = [
    {
      name: "핏플로우",
      eng: "FitFlow",
      category: "홈트레이닝 앱",
      desc: "맞춤 운동 루틴 플랫폼. 웰링크 활용 후 앱 다운로드 CTR 23% 달성.",
      kpi: "CTR 23%",
    },
    {
      name: "그린바디",
      eng: "GreenBody",
      category: "웰니스 식품",
      desc: "유기농 단백질 보충제 브랜드. 인플루언서 선별 후 첫 달 ROAS 5.1× 기록.",
      kpi: "ROAS 5.1×",
    },
    {
      name: "런스튜디오",
      eng: "RunStudio",
      category: "스포츠웨어",
      desc: "러닝 전문 기능성 의류 브랜드. 운영 업무 70% 절감 및 캠페인 4건 동시 운영.",
      kpi: "업무 70%↓",
    },
    {
      name: "요가모먼트",
      eng: "YogaMoment",
      category: "필라테스·요가 용품",
      desc: "요가 매트·라이프스타일 브랜드. 나노 인플루언서 선정으로 획득비용 680원 달성.",
      kpi: "획득비용 680원",
    },
  ];

  return (
    <section className="bg-white py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>도입 예시</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>이런 브랜드에 맞습니다</h2>
          <p className="mt-3 max-w-xl text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>웰니스·피트니스 카테고리에 특화된 브랜드 유형별 예시입니다</p>
        </div>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((b) => (
            <div
              key={b.name}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 transition-all duration-[300ms] hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-neutral-950" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>{b.name}</p>
                </div>
                <span className="rounded-full px-3 py-1 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, background: "rgba(var(--cp-rgb),0.08)", whiteSpace: "nowrap" }}>{b.category}</span>
              </div>
              <p className="mt-5 flex-1 text-neutral-600" style={{ fontSize: 14, lineHeight: 1.7 }}>{b.desc}</p>
              <p className="mt-4" style={{ fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{b.kpi}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", title: "캠페인 설정", desc: "브랜드 카테고리·예산·전환 목표를 입력합니다. KPI 기준을 직접 설정할 수 있으며 5분 이내에 완료됩니다." },
    { n: "02", title: "Fit-Score 기반 인플루언서 추천", desc: "Fit-Score로 브랜드 카테고리·전환 이력·오디언스 특성을 분석해 최적 후보를 추천합니다. 광고주가 직접 검토하고 선택합니다." },
    { n: "03", title: "콘텐츠 확인·집행", desc: "선정된 인플루언서가 가이드라인에 맞춰 콘텐츠를 제작·게시합니다. 가이드라인 전달, 일정 관리, 콘텐츠 확인까지 플랫폼 안에서 이루어집니다." },
    { n: "04", title: "성과 확인 및 정산", desc: "ROAS·CTR·인플루언서별 기여도를 대시보드에서 확인합니다. 정산은 플랫폼을 통해 처리됩니다." },
  ];
  return (
    <section id="advertiser-process" className="relative overflow-hidden bg-[var(--cbg1)] pt-14 sm:pt-20 lg:pt-24 pb-0">
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>이용 방법</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>캠페인 운영, 이렇게 진행됩니다</h2>
          <p className="mt-3 max-w-xl text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>캠페인 등록부터 정산까지 플랫폼 안에서 처리됩니다</p>
        </div>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 transition-all hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]">
              <div className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "linear-gradient(90deg,transparent,rgba(var(--cp-rgb),0.3),transparent)" }} />
              <div className="text-[var(--ctag)]" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.12em" }}>{s.n}</div>
              <h3 className="mt-6 text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.015em" }}>{s.title}</h3>
              <p className="mt-4 text-neutral-600" style={{ fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThreeReasons() {
  return (
    <section className="bg-white py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>차별점</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>웰링크가 다른 3가지 이유</h2>
          <p className="mt-6 max-w-xl text-neutral-500" style={{ fontSize: 16, lineHeight: 1.7 }}>기존 대행사에서 한 번도 경험하지 못한 것들만 모았습니다.</p>
        </div>

        {/* Card 1: Featured - full width */}
        <CardReveal delay={0}>
        <article
          className="group relative mb-4 overflow-hidden rounded-[28px] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgba(var(--cd-rgb),0.45)]"
          style={{ background: "linear-gradient(135deg,#0F1E2E 0%,#060A11 100%)" }}
        >
          <div className="grid items-center grid-cols-1 lg:grid-cols-2">
            <div className="p-10 lg:p-12">
              <span className="inline-block rounded-full border border-[var(--cl)]/30 bg-[var(--cl)]/10 px-3 py-1 text-[var(--cl)]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>
                01 · Fit-Score 추천
              </span>
              <h3 className="mt-5 text-white" style={{ fontSize: "clamp(17px, 1.8vw, 24px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.015em" }}>
                팔로워 수가 아닌<br />브랜드 전환 가능성으로 고릅니다
              </h3>
              <p className="mt-5 text-white/70" style={{ fontSize: 16, lineHeight: 1.75 }}>
                브랜드 카테고리·전환 이력·오디언스 특성을 교차 분석해 맞지 않는 인플루언서는 처음부터 추천하지 않습니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[{ label: "평균 CTR", value: "20%" }, { label: "인플루언서 DB", value: "5만+" }].map((kpi) => (
                  <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3">
                    <p className="text-white/50" style={{ fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
                    <p className="mt-1 text-white" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>{kpi.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="relative hidden h-full min-h-[300px] overflow-hidden lg:block"
              style={{ maskImage: "linear-gradient(90deg, transparent 0%, black 30%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 30%)" }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80"
                alt="인플루언서 퍼포먼스 분석 화면"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
          </div>
        </article>
        </CardReveal>

        {/* Card 2 & 3: half width */}
        <div className="grid items-stretch gap-4 grid-cols-1 lg:grid-cols-2">
          <CardReveal delay={100} className="h-full">
          <article
            className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-neutral-200/80 bg-white transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-[var(--cp)]/25 hover:shadow-[0_16px_36px_-20px_rgba(var(--cp-rgb),0.22)]"
          >
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                alt="캠페인 자동화 실행 화면"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute left-6 top-6 rounded-full px-3 py-1 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, background: "var(--cl)", letterSpacing: "0.04em" }}>
                02 · 운영 지원
              </span>
            </div>
            <div className="relative flex flex-1 flex-col p-8">
              <h3 className="text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.015em" }}>
                캠페인 생성부터 정산까지,<br />담당자 없이도 돌아갑니다
              </h3>
              <p className="mt-4 flex-1 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.75 }}>
                인플루언서 탐색, 콘텐츠 확인, 정산까지 플랫폼 안에서 처리해 반복 업무를 줄입니다.
              </p>
              <div className="mt-6 inline-flex w-fit rounded-full px-4 py-2 text-[var(--cp)]" style={{ fontSize: 14, fontWeight: 600, background: "rgba(var(--cp-rgb),0.08)" }}>운영시간 70% 절감</div>
            </div>
          </article>
          </CardReveal>

          <CardReveal delay={200} className="h-full">
          <article
            className="relative flex h-full flex-col justify-between rounded-[28px] border border-neutral-200/80 bg-white p-6 sm:p-8 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-[var(--cp)]/25 hover:shadow-[0_16px_36px_-20px_rgba(var(--cp-rgb),0.22)]"
          >
            <div className="relative">
              <span className="inline-block rounded-full border border-[var(--cp)]/20 bg-[var(--cbg1)] px-3 py-1 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
                03 · 실시간 성과
              </span>
              <h3 className="mt-5 text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.015em" }}>
                ROAS·전환율·인플루언서별 기여도,<br />실시간으로 공개합니다
              </h3>
              <p className="mt-4 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.75 }}>
                리포트 수령을 기다릴 필요 없습니다. 선별 기준과 성과 데이터를 대시보드에서 실시간으로 확인합니다.
              </p>
            </div>
            <div className="relative mt-8 rounded-2xl border border-neutral-100 bg-[var(--cbg2)] p-5">
              <p className="text-neutral-400" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>LIVE REPORT</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[{ label: "ROAS", value: "4.8×" }, { label: "CTR", value: "20%" }, { label: "전환율", value: "8.2%" }, { label: "기여 인플루언서", value: "12명" }].map((m) => (
                  <div key={m.label} className="rounded-xl border border-neutral-100 bg-white p-3">
                    <p className="text-neutral-400" style={{ fontSize: 12, fontWeight: 500, wordBreak: "keep-all" }}>{m.label}</p>
                    <p className="mt-1 text-neutral-900" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
          </CardReveal>
        </div>
        <div className="mt-16 rounded-3xl border border-[var(--cp)]/15 bg-[var(--cbg1)] px-10 py-10">
          <div className="grid items-center gap-8 grid-cols-1 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5, letterSpacing: "-0.015em" }}>
                성과 데이터는 대시보드에서 직접 확인하실 수 있습니다.
              </p>
              <p className="mt-3 text-neutral-600" style={{ fontSize: 15, lineHeight: 1.75 }}>
                기대 이하의 결과가 나오면 원인 분석 리포트를 제공하고, 다음 캠페인 전략 조정을 무료로 지원합니다.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 shrink-0">
              {["성과 대시보드 직접 확인", "기대 미달 시 원인 분석 리포트", "캠페인 전략 조정 무료 지원"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[var(--cp)]/20 bg-white px-4 py-2 text-neutral-700" style={{ fontSize: 14, fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3L11.5 4" stroke="var(--cp)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const { ref, inView } = useInView(0.3);
  const metrics = [
    { k: "ROAS", v: "4.8×", note: "▲ 23% 전월 대비" },
    { k: "평균 CTR", v: "20%", note: "업계 평균 8배" },
    { k: "획득비용", v: "700원", note: "1인당 기준" },
    { k: "Fit-Score", v: "92", note: "선별 기준 점수" },
  ];
  return (
    <section className="relative bg-[var(--cbg1)] pt-14 sm:pt-20 lg:pt-24 pb-0">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>대시보드</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>모든 숫자, 한 화면에서.</h2>
        </div>
        <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_16px_32px_-26px_rgba(var(--cd-rgb),0.14)]">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-100 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--cl)]" />
              <span className="text-neutral-700" style={{ fontSize: 14, fontWeight: 600, wordBreak: "keep-all" }}>캠페인 대시보드 · 2026 Q2</span>
            </div>
            <span className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, background: "rgba(var(--cp-rgb),0.08)" }}>실시간 업데이트</span>
          </div>
          <div className="grid grid-cols-1 gap-px bg-neutral-100 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.k} className="group bg-white p-7 transition-colors hover:bg-[var(--cbg1)]/60">
                <p className="text-neutral-500 transition-colors group-hover:text-[var(--cp)]" style={{ fontSize: 14, fontWeight: 600 }}>{m.k}</p>
                <p className="mt-3 whitespace-nowrap transition-transform duration-300 group-hover:scale-[1.04] origin-left" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{m.v}</p>
                <p className="mt-2 text-neutral-500" style={{ fontSize: 12, lineHeight: 1.7 }}>{m.note}</p>
              </div>
            ))}
          </div>
          <div ref={ref} className="p-8">
            <p className="text-neutral-700" style={{ fontSize: 14, fontWeight: 600 }}>인플루언서별 전환 기여도</p>
            <div className="mt-5 space-y-4">
              {[{ n: "@wellness.lab", v: 92 }, { n: "@runners.daily", v: 76 }, { n: "@yoga.with.j", v: 64 }, { n: "@fitstudio.k", v: 48 }].map((b, i) => (
                <div key={b.n}>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700" style={{ fontSize: 14 }}>{b.n}</span>
                    <span className="text-neutral-500" style={{ fontSize: 12 }}>{b.v}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full" style={{ width: inView ? `${b.v}%` : "0%", background: "linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)", transition: `width 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfluencerTypes() {
  const types = [
    { Icon: User, name: "개인 크리에이터", desc: "피트니스·요가·헬시라이프를 다루는 개인 채널. 진정성 있는 콘텐츠가 브랜드 신뢰로 직결됩니다.", tags: ["헬스 인스타그래머", "요가 유튜버", "홈트 릴스 크리에이터", "건강식단 블로거"] },
    { Icon: Users, name: "크루·커뮤니티", desc: "러닝크루·요가모임·피트니스 그룹 운영자. 오프라인 커뮤니티의 집단 바이럴은 강한 신뢰 기반을 만듭니다.", tags: ["러닝크루 운영자", "필라테스 오픈채팅", "요가 소모임"] },
    { Icon: Dumbbell, name: "센터·스튜디오", desc: "필라테스·크로스핏·PT 센터 운영자. 실제 공간과 수업 기반 O2O 체험 콘텐츠는 다른 신뢰감을 만듭니다.", tags: ["스튜디오 공식 계정", "PT 트레이너", "필라테스 강사"] },
    { Icon: CalendarDays, name: "행사·이벤트", desc: "마라톤·피트니스 엑스포·웰니스 페스티벌 기획자. 대규모 참여자를 대상으로 한 강력한 노출 기회입니다.", tags: ["대회 조직위", "이벤트 기획사", "웰니스 페스티벌"] },
  ];
  return (
    <section className="bg-[var(--cbg1)] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>인플루언서 유형</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>어떤 인플루언서와 연결되나요?</h2>
          <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>웰니스·피트니스 카테고리 특화 4가지 유형</p>
        </div>
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {types.map((t) => {
            const Ic = t.Icon;
            return (
              <div key={t.name} className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 lg:p-9 transition-all hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(var(--cl-rgb),0.10), transparent 65%)" }} />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" style={{ background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)" }}>
                    <Ic size={24} className="text-white" />
                  </span>
                  <div>
                    <h3 className="text-neutral-950" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.015em" }}>{t.name}</h3>
                    <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>{t.desc}</p>
                  </div>
                </div>
                <div className="relative mt-6 flex flex-wrap gap-2">
                  {t.tags.map((tg) => (
                    <span key={tg} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-neutral-700 transition-colors group-hover:border-[var(--cp)]/20 group-hover:text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 500 }}>{tg}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Compare() {
  const rows = [
    ["인플루언서 선별", "담당자 주관", "Fit-Score 추천·직접 선택"],
    ["성과 확인", "리포트 수령 대기", "실시간 대시보드"],
    ["계약·정산", "개별 협의", "플랫폼 자동화"],
    ["버티컬 특화", "없음", "웰니스·피트니스 전문"],
    ["비용 구조", "대행 수수료 별도", "플랜 내 포함"],
  ];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollWidth - el.clientWidth > 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scrollByDir = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  return (
    <section className="bg-white pt-14 sm:pt-20 lg:pt-24 pb-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>비교</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>기존 대행사와 무엇이 다른가요?</h2>
          <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>주관적 판단이 아닌 데이터로 작동합니다</p>
        </div>
        {canScroll && (
          <div className="mb-4 flex items-center gap-2">
            <span className="mr-auto text-neutral-400" style={{ fontSize: 12, fontWeight: 500 }}>좌우로 넘겨보세요</span>
            <button onClick={() => scrollByDir(-1)} aria-label="이전 항목" className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 active:scale-95">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => scrollByDir(1)} aria-label="다음 항목" className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 active:scale-95">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div ref={scrollRef} className="overflow-x-auto">
          <div className="min-w-[480px]">
          <div className="grid grid-cols-3 border-b border-neutral-200">
            {["항목", "MCN 대행사", "웰링크"].map((h, i) => (
              <div
                key={h}
                className={`p-5 ${i === 2 ? "border-l border-[var(--cp)]/15" : ""}`}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: i === 2 ? "var(--cp)" : "#6B7280",
                  background: i === 2 ? "linear-gradient(135deg,rgba(var(--cp-rgb),0.07),rgba(var(--cl-rgb),0.05))" : "white",
                }}
              >
                {h}
                {i === 2 && (
                  <span className="ml-2 rounded-full bg-[var(--cp)]/10 px-2 py-0.5 text-[var(--cp)]" style={{ fontSize: 12, fontWeight: 600, verticalAlign: "middle" }}>추천</span>
                )}
              </div>
            ))}
          </div>
          {rows.map((r) => (
            <div key={r[0]} className="group grid grid-cols-3 border-b border-neutral-100 last:border-b-0">
              <div className="p-5 text-neutral-700 transition-colors group-hover:bg-[var(--cbg1)]/40" style={{ fontSize: 14, fontWeight: 600, background: "white" }}>{r[0]}</div>
              <div className="p-5 text-neutral-400 transition-colors group-hover:bg-[var(--cbg1)]/40" style={{ fontSize: 14, background: "white" }}>{r[1]}</div>
              <div
                className="border-l border-[var(--cp)]/15 p-5 text-[var(--cp)] transition-colors"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  background: "linear-gradient(135deg,rgba(var(--cp-rgb),0.05),rgba(var(--cl-rgb),0.03))",
                }}
              >
                {r[2]}
              </div>
            </div>
          ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { who: "웰니스 푸드 브랜드 · 마케팅 담당자", quote: "기존 대행사는 리포트 받기까지 2주가 걸렸는데, 웰링크는 캠페인 집행 당일 ROAS가 대시보드에 찍혔어요. 인플루언서 선정 기준도 팔로워가 아니라 실제 전환 데이터라 신뢰가 됐습니다.", kpis: [{ v: "4.8×", k: "ROAS" }, { v: "70%↓", k: "운영 시간" }], img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" },
    { who: "스포츠웨어 D2C 브랜드 · 대표", quote: "인플루언서 DM 보내고 협상하고 정산하는 데 담당자 시간의 절반이 갔었는데, 웰링크 쓰고 나서 그 시간에 신제품 기획을 할 수 있게 됐어요. 비용 대비 효율이 완전히 달랐습니다.", kpis: [{ v: "20%", k: "평균 CTR" }, { v: "700원", k: "획득비용" }], img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80" },
    { who: "필라테스 용품 브랜드 · CMO", quote: "웰니스·피트니스 버티컬만 다루는 DB라서 범용 플랫폼과 달리 처음부터 타겟이 맞았어요. 첫 캠페인에서 기대했던 CTR의 두 배가 나왔고, 그 이후로 계속 쓰고 있습니다.", kpis: [{ v: "2×", k: "예상 대비 CTR" }, { v: "3건", k: "연속 캠페인" }], img: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80" },
  ];
  return (
    <section className="bg-white pt-14 sm:pt-20 lg:pt-24 pb-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>후기 예시</span>
          <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>광고주가 이렇게 활용합니다</h2>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.who} className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all hover:translate-y-[-4px] hover:border-[var(--cp)]/30 hover:shadow-[0_14px_28px_-24px_rgba(var(--cp-rgb),0.22)]">
              <div className="relative h-44 overflow-hidden flex items-end p-6">
                <ImageWithFallback src={t.img} alt={t.who} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(12,26,16,0.12) 0%, rgba(8,18,11,0.72) 100%)" }} />
                <div className="relative text-white" style={{ fontSize: 13, fontWeight: 600 }}>{t.who}</div>
              </div>
              <div className="flex flex-col flex-1 p-8">
                <p className="flex-1 text-neutral-700" style={{ fontSize: 16, lineHeight: 1.7 }}>"{t.quote}"</p>
                <div className="mt-8 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-6">
                  {t.kpis.map((k) => (
                    <div key={k.k}>
                      <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", background: "linear-gradient(135deg,var(--cp) 0%,70%,var(--cs) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{k.v}</p>
                      <p className="mt-1 text-neutral-500" style={{ fontSize: 12 }}>{k.k}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "인플루언서 DB는 얼마나 되나요?", a: "웰니스·피트니스 카테고리에 특화된 5만 명 이상의 진성 크리에이터를 보유하고 있습니다. 개인 채널부터 크루·센터·이벤트까지 전 유형을 즉시 확인하고 선택할 수 있습니다." },
    { q: "Fit-Score는 어떻게 계산되나요?", a: "브랜드 카테고리 적합도, 오디언스 특성, 전환 이력을 분석해 0~100점으로 산정합니다. 팔로워 수는 기준에 포함되지 않습니다." },
    { q: "기존 대행사와 무엇이 다른가요?", a: "인플루언서 탐색·선정·정산을 플랫폼 안에서 처리합니다. 데이터 대시보드로 성과를 직접 확인할 수 있고, 담당자가 DM 협의·엑셀 정리에 쓰던 시간을 줄일 수 있습니다." },
    { q: "성과가 없을 경우 어떻게 되나요?", a: "성과 데이터를 대시보드에서 그대로 공개합니다. 기대 성과에 미치지 못하면 원인 분석 리포트를 제공하고 다음 캠페인 전략 조정을 무료로 지원합니다." },
    { q: "캠페인 최소 예산은 얼마인가요?", a: "Focus 플랜부터 월 99,000원으로 시작할 수 있습니다. 7일 무료 체험을 먼저 경험해보실 수 있으며 신용카드가 필요하지 않습니다." },
  ];
  return (
    <section id="advertiser-faq" className="relative bg-[var(--cbg1)] pt-14 sm:pt-20 lg:pt-24 pb-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        {/* 모바일: 1열, lg 이상: 2열 */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:items-start">

          {/* 좌측: 헤더 sticky */}
          <div className="lg:sticky lg:top-20">
            <span className="inline-flex items-center rounded-full px-3 py-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(var(--cp-rgb),0.10)", color: "var(--cp)" }}>FAQ</span>
            <h2 className="mt-4 text-neutral-950" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.28, letterSpacing: "-0.02em" }}>자주 묻는 질문</h2>
            <p className="mt-3 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>광고주가 가장 많이 묻는 질문들을 모았습니다</p>
          </div>

          {/* 우측: FAQ 항목들 */}
          <div className="divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
            {items.map((it, i) => (
              <details key={it.q} className="group px-7 py-6 transition-colors hover:bg-[var(--cbg1)]/50 open:bg-[var(--cbg1)]/30" {...(i === 0 ? { open: true } : {})}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-neutral-950 transition-colors group-hover:text-[var(--cp)]" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
                  <span>{it.q}</span>
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-300 group-hover:border-[var(--cp)]/40 group-hover:text-[var(--cp)] group-open:rotate-45 group-open:border-[var(--cp)] group-open:bg-[var(--cp)] group-open:text-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </span>
                </summary>
                <p className="mt-4 text-neutral-600" style={{ fontSize: 16, lineHeight: 1.7 }}>{it.a}</p>
              </details>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function CTA({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="bg-[var(--cbg1)] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 lg:p-16 text-center" style={{ background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)" }}>
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <h3 className="relative text-white" style={{ fontSize: "clamp(20px, 2.8vw, 30px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.015em" }}>지금 바로 시작해 보세요</h3>
          <p className="relative mx-auto mt-6 max-w-xl text-white/80" style={{ fontSize: 16, lineHeight: 1.7 }}>무료 플랜으로 시작 · 신용카드 없이 · 인플루언서 DB 5만 명+ 즉시 접근</p>
          <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={() => onNavigate("login")} className="rounded-full bg-white px-8 py-4 whitespace-nowrap text-[var(--cp)] transition-all hover:translate-y-[-1px] active:scale-[0.97]" style={{ fontSize: 15, fontWeight: 600, boxShadow: "0 10px 24px -16px rgba(0,0,0,0.18)" }}>무료로 시작하기</button>
            <button onClick={() => onNavigate("pricing")} className="rounded-full border border-white/30 bg-white/10 px-8 py-4 whitespace-nowrap text-white backdrop-blur transition-all hover:translate-y-[-1px] hover:bg-white/15" style={{ fontSize: 15, fontWeight: 600 }}>요금제 보기</button>
            <button onClick={() => document.getElementById("advertiser-faq")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full border border-white/30 bg-white/10 px-8 py-4 whitespace-nowrap text-white backdrop-blur transition-all hover:translate-y-[-1px] hover:bg-white/15" style={{ fontSize: 15, fontWeight: 600 }}>문의하기</button>
          </div>
        </div>
      </div>
    </section>
  );
}
