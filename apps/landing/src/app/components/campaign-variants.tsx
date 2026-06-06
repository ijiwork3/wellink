import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CardReveal } from "./card-reveal";
import { Breadcrumb } from "./breadcrumb";
import { Reveal } from "./reveal";
import { BackgroundGrid } from "./background-grid";
import {
  Campaign, CAMPAIGNS, CATEGORIES, BENEFIT_OPTIONS,
  FitBadge, TagBadge, CampaignDetailModal,
} from "./campaign-page";

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login";

// ─── Lock placeholder (공통) ──────────────────────────────────────────────────

function LockPlaceholder({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-3 py-2"
      style={{
        border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px dashed #E5E7EB",
        background: dark ? "rgba(255,255,255,0.07)" : "#F9FAFB",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke={dark ? "rgba(255,255,255,0.4)" : "#9CA3AF"} strokeWidth="1.35"/>
        <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke={dark ? "rgba(255,255,255,0.4)" : "#9CA3AF"} strokeWidth="1.35" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 500, color: dark ? "rgba(255,255,255,0.4)" : "#9CA3AF" }}>
        로그인하면 확인 가능
      </span>
    </div>
  );
}

// ─── Sort select ──────────────────────────────────────────────────────────────

function SortSelect({ sort, onSort }: { sort: string; onSort: (s: "latest" | "deadline" | "fit") => void }) {
  return (
    <select
      value={sort}
      onChange={(e) => onSort(e.target.value as "latest" | "deadline" | "fit")}
      className="shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-white px-3 py-2 text-neutral-600 outline-none"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      <option value="latest">최신순</option>
      <option value="deadline">마감임박순</option>
      <option value="fit">Fit-Score순</option>
    </select>
  );
}

// ─── Shared filter hook ───────────────────────────────────────────────────────

function useCampaignFilter() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const v = sessionStorage.getItem("wl_filter_cat");
    if (v) sessionStorage.removeItem("wl_filter_cat");
    return v ?? "전체";
  });
  const [activeBenefit, setActiveBenefit] = useState<string>(() => {
    const v = sessionStorage.getItem("wl_filter_ben");
    if (v) sessionStorage.removeItem("wl_filter_ben");
    return v ?? "전체";
  });
  const [sort, setSort] = useState<"latest" | "deadline" | "fit">(() => {
    const v = sessionStorage.getItem("wl_filter_sort") as "latest" | "deadline" | "fit" | null;
    if (v) sessionStorage.removeItem("wl_filter_sort");
    return v ?? "latest";
  });
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const filtered = CAMPAIGNS
    .filter((c) => {
      const catMatch = activeCategory === "전체" || c.category === activeCategory;
      const benMatch =
        activeBenefit === "전체" ||
        (activeBenefit === "fee" && c.tag.startsWith("활동비")) ||
        (activeBenefit === "product" && c.tag === "제품 협찬");
      const q = search.trim().toLowerCase();
      const searchMatch = !q ||
        c.brand.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q);
      return catMatch && benMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sort === "deadline") return a.dDayNum - b.dDayNum;
      if (sort === "fit") return b.fit - a.fit;
      return a.id - b.id;
    });

  return {
    search, setSearch,
    activeCategory, setActiveCategory,
    activeBenefit, setActiveBenefit,
    sort, setSort,
    filtered,
    selectedCampaign, setSelectedCampaign,
  };
}

// ─── 공용 캠페인 히어로 ──────────────────────────────────────────────────────────

function CampaignHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-14 pt-20 lg:pb-16 lg:pt-24">
      <BackgroundGrid />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-45 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(var(--cl-rgb),0.4), rgba(var(--cs-rgb),0.05) 60%, transparent 80%)" }}
      />
      <div className="relative mx-auto max-w-[900px] px-6 text-center lg:px-10">
        <span
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 backdrop-blur"
          style={{ fontSize: 14, fontWeight: 600, color: "var(--cm)", border: "2px solid rgba(var(--cm-rgb),0.35)" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--cm)" }} />
          캠페인 · 진행 중 8건
        </span>
        <h1
          className="mt-6 text-neutral-950"
          style={{ fontSize: "clamp(32px,5.2vw,62px)", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.025em", wordBreak: "keep-all" }}
        >
          내 채널에{" "}<span className="gradient-text-loop">딱 맞는</span>{" "}캠페인만<br />보여드립니다
        </h1>
        <p
          className="mx-auto mt-5 max-w-[500px] text-neutral-500"
          style={{ fontSize: 16, lineHeight: 1.7 }}
        >
          팔로워 수가 아닌 Fit-Score로 선별됩니다.
          <br className="hidden sm:inline" />
          내 채널 핏이 높은 캠페인이 먼저 노출됩니다.
        </p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT A — 사이드바 + 피드 그리드 + 검색창 (메인 시안)
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarA({
  activeCategory, onCategory, activeBenefit, onBenefit, sort, onSort, count,
}: {
  activeCategory: string; onCategory: (c: string) => void;
  activeBenefit: string; onBenefit: (b: string) => void;
  sort: "latest" | "deadline" | "fit"; onSort: (s: "latest" | "deadline" | "fit") => void;
  count: number;
}) {
  return (
    <aside className="shrink-0 w-56 hidden lg:block">
      <div className="sticky top-24 space-y-4">
        {/* Sort */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="mb-2.5 font-semibold text-neutral-400" style={{ fontSize: 12, letterSpacing: "0.06em" }}>정렬</p>
          {(["latest", "deadline", "fit"] as const).map((s) => {
            const labels = { latest: "최신순", deadline: "마감임박순", fit: "Fit-Score순" };
            return (
              <button
                key={s}
                onClick={() => onSort(s)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-all ${
                  sort === s ? "bg-[var(--cbg1)] text-[var(--cp)] font-semibold" : "text-neutral-500 hover:bg-neutral-50"
                }`}
                style={{ fontSize: 14 }}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${sort === s ? "bg-[var(--cp)]" : "bg-neutral-200"}`} />
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* Category */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="mb-2.5 font-semibold text-neutral-400" style={{ fontSize: 12, letterSpacing: "0.06em" }}>카테고리</p>
          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all ${
                  activeCategory === cat ? "bg-[var(--cbg1)] text-[var(--cp)] font-semibold" : "text-neutral-500 hover:bg-neutral-50"
                }`}
                style={{ fontSize: 14 }}
              >
                <span className={`h-3 w-3 shrink-0 rounded-full border-2 transition-all ${
                  activeCategory === cat ? "border-[var(--cp)] bg-[var(--cp)]" : "border-neutral-300"
                }`} />
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Benefit */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="mb-2.5 font-semibold text-neutral-400" style={{ fontSize: 12, letterSpacing: "0.06em" }}>혜택 유형</p>
          <div className="space-y-0.5">
            {BENEFIT_OPTIONS.map((b) => (
              <button
                key={b.key}
                onClick={() => onBenefit(b.key)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all ${
                  activeBenefit === b.key ? "bg-[var(--cbg1)] text-[var(--cp)] font-semibold" : "text-neutral-500 hover:bg-neutral-50"
                }`}
                style={{ fontSize: 14 }}
              >
                <span className={`h-3 w-3 shrink-0 rounded-full border-2 transition-all ${
                  activeBenefit === b.key ? "border-[var(--cp)] bg-[var(--cp)]" : "border-neutral-300"
                }`} />
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function CardA({
  c, isLoggedIn, onLogin, onCardClick,
}: {
  c: Campaign; isLoggedIn: boolean; onLogin: () => void; onCardClick: () => void;
}) {
  const isUrgent = c.dDayNum <= 20;
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(var(--cp-rgb),0.22)]"
      style={{ border: "1px solid rgba(0,0,0,0.07)" }}
      onClick={onCardClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <ImageWithFallback
          src={c.img}
          alt={c.brand}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3"><TagBadge tag={c.tag} /></div>
        <div className="absolute right-3 top-3">
          <span
            className="rounded-full px-2.5 py-1 text-white text-xs font-bold"
            style={{ background: isUrgent ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          >
            {c.dDay}
          </span>
        </div>
        {/* FitScore 하단 좌측 */}
        <div className="absolute bottom-3 left-3">
          {isLoggedIn ? (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
              <span className="text-white font-black" style={{ fontSize: 18, lineHeight: 1 }}>{c.fit}</span>
              <div>
                <p className="text-white/50" style={{ fontSize: 12, letterSpacing: "0.04em" }}>FIT</p>
                <p className="text-white/50" style={{ fontSize: 12, letterSpacing: "0.04em" }}>SCORE</p>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4"/>
                <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-white/60" style={{ fontSize: 12 }}>매칭률</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="text-white/60" style={{ fontSize: 12 }}>{c.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-neutral-950 font-bold" style={{ fontSize: 16, letterSpacing: "-0.01em" }}>{c.brand}</h3>
        <div className="mt-2">
          {isLoggedIn ? (
            <p className="text-neutral-500" style={{ fontSize: 12, lineHeight: 1.6 }}>{c.benefit}</p>
          ) : (
            <LockPlaceholder />
          )}
        </div>
        <div className="mt-auto pt-3">
          {isLoggedIn && (
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400" style={{ fontSize: 12 }}>신청 현황</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cd)" }}>{c.applicants}/{c.quota}명</span>
              </div>
              <div className="h-1 rounded-full bg-neutral-100">
                <div className="h-full rounded-full" style={{ width: `${Math.round(c.applicants / c.quota * 100)}%`, background: "var(--cp)" }} />
              </div>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); !isLoggedIn ? onLogin() : onCardClick(); }}
            className="w-full min-h-[44px] rounded-full text-xs font-semibold transition-all"
            style={{
              background: "var(--btn-gradient)",
              color: "white",
              border: "none",
            }}
          >
            {isLoggedIn ? "신청하기" : "로그인하고 신청하기"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function CampaignsPageA({
  onNavigate, isLoggedIn, onLogin,
}: {
  onNavigate: (p: Page) => void; isLoggedIn: boolean; onLogin: () => void;
}) {
  const {
    search, setSearch,
    activeCategory, setActiveCategory,
    activeBenefit, setActiveBenefit,
    sort, setSort,
    filtered,
    selectedCampaign, setSelectedCampaign,
  } = useCampaignFilter();

  const handleLogin = () => {
    sessionStorage.setItem("wl_filter_cat", activeCategory);
    sessionStorage.setItem("wl_filter_ben", activeBenefit);
    sessionStorage.setItem("wl_filter_sort", sort);
    onLogin();
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilterCount =
    (activeCategory !== "전체" ? 1 : 0) +
    (activeBenefit !== "전체" ? 1 : 0) +
    (sort !== "latest" ? 1 : 0);

  return (
    <main className="relative w-full bg-[var(--cbg2)]">

      <CampaignHero />

      {/* 검색 + 카운트 바 */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                width="16" height="16" viewBox="0 0 20 20" fill="none"
              >
                <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="브랜드, 카테고리, 혜택 검색..."
                aria-label="캠페인 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-neutral-800 outline-none transition-all focus:border-[var(--cp)]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(var(--cp-rgb),0.08)]"
                style={{ fontSize: 14 }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            {/* 모바일 필터 버튼 */}
            <button
              onClick={() => setFilterOpen(true)}
              className="relative lg:hidden flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 transition-all"
              style={{ fontSize: 14, fontWeight: 500, color: activeFilterCount > 0 ? "var(--cp)" : "#6B7280", borderColor: activeFilterCount > 0 ? "var(--cp)" : undefined }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>필터</span>
              {activeFilterCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-white"
                  style={{ fontSize: 12, fontWeight: 700, background: "var(--cp)" }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <p className="mt-2.5 text-neutral-400" style={{ fontSize: 12 }}>
            총 {filtered.length}건 · Fit-Score 기반 매칭
          </p>
        </div>
      </div>

      {/* Sidebar + Grid */}
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-8">
        <div className="flex gap-6 items-start">
          <SidebarA
            activeCategory={activeCategory} onCategory={setActiveCategory}
            activeBenefit={activeBenefit} onBenefit={setActiveBenefit}
            sort={sort} onSort={setSort}
            count={filtered.length}
          />

          <div className="flex-1 min-w-0">
            {!isLoggedIn && (
              <div
                className="mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                style={{ background: "var(--cbg1)", border: "1px solid rgba(var(--cp-rgb),0.15)" }}
              >
                <div>
                  <p className="font-bold text-neutral-950" style={{ fontSize: 16, letterSpacing: "-0.01em" }}>
                    Fit-Score로 내 채널에 맞는 캠페인만 보세요
                  </p>
                  <p className="mt-1 text-neutral-500" style={{ fontSize: 14 }}>
                    무료 등록 후 AI가 내 채널을 분석합니다
                  </p>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full sm:w-auto shrink-0 min-h-[44px] rounded-full px-5 py-2.5 text-white transition-all hover:-translate-y-0.5"
                  style={{ fontSize: 14, fontWeight: 600, background: "var(--btn-gradient)", boxShadow: "0 4px 12px -6px rgba(var(--cp-rgb),0.4)" }}
                >
                  무료로 Fit-Score 받기
                </button>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-100 bg-white">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5.75" stroke="#D1D5DB" strokeWidth="1.6"/>
                    <path d="M13 13l3.5 3.5" stroke="#D1D5DB" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="mt-4 text-neutral-950 font-bold" style={{ fontSize: 16 }}>검색 결과가 없습니다</p>
                <p className="mt-2 text-neutral-400" style={{ fontSize: 14 }}>
                  다른 검색어나 필터를 시도해보세요
                </p>
                <button
                  onClick={() => { setSearch(""); setActiveCategory("전체"); setActiveBenefit("전체"); }}
                  className="mt-4 rounded-full border border-neutral-200 px-5 py-2 text-neutral-600 transition-all hover:border-neutral-300"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((c, i) => (
                  <CardReveal key={c.id} delay={i * 50} className="h-full">
                    <CardA
                      c={c}
                      isLoggedIn={isLoggedIn}
                      onLogin={handleLogin}
                      onCardClick={() => isLoggedIn ? setSelectedCampaign(c) : handleLogin()}
                    />
                  </CardReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <Reveal bgStyle={{ background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)" }}>
          <section className="py-12 text-center">
            <div className="mx-auto max-w-[480px] px-6">
              <h2 className="text-white" style={{ fontSize: "clamp(20px,2.8vw,32px)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Fit-Score 없이는 절반만 보입니다
              </h2>
              <button
                onClick={handleLogin}
                className="mt-6 rounded-full px-8 py-3.5 text-[var(--cd)] font-semibold transition-all hover:-translate-y-0.5"
                style={{ fontSize: 14, background: "var(--btn-gradient)" }}
              >
                무료로 등록하고 Fit-Score 받기
              </button>
            </div>
          </section>
        </Reveal>
      )}

      {/* 모바일 필터 바텀시트 */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white">
            <div className="flex justify-center pb-2 pt-3">
              <div className="h-1 w-10 rounded-full bg-neutral-200" />
            </div>
            <div className="flex items-center justify-between px-5 pb-4 pt-1">
              <p className="font-bold text-neutral-950" style={{ fontSize: 16 }}>필터</p>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
                aria-label="닫기"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-5 px-5 pb-8">
              <div>
                <p className="mb-2 font-semibold text-neutral-400" style={{ fontSize: 12, letterSpacing: "0.06em" }}>정렬</p>
                <div className="flex gap-2 flex-wrap">
                  {(["latest", "deadline", "fit"] as const).map((s) => {
                    const labels = { latest: "최신순", deadline: "마감임박순", fit: "Fit-Score순" };
                    return (
                      <button
                        key={s}
                        onClick={() => setSort(s)}
                        className={`min-h-[44px] rounded-full px-4 py-2 transition-all ${
                          sort === s ? "text-white" : "border border-neutral-200 text-neutral-600 bg-white"
                        }`}
                        style={{ fontSize: 14, fontWeight: sort === s ? 600 : 500, background: sort === s ? "var(--btn-gradient)" : undefined }}
                      >
                        {labels[s]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 font-semibold text-neutral-400" style={{ fontSize: 12, letterSpacing: "0.06em" }}>카테고리</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`min-h-[44px] rounded-full px-4 py-2 transition-all ${
                        activeCategory === cat ? "text-white" : "border border-neutral-200 text-neutral-600 bg-white"
                      }`}
                      style={{ fontSize: 14, fontWeight: activeCategory === cat ? 600 : 500, background: activeCategory === cat ? "var(--btn-gradient)" : undefined }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-semibold text-neutral-400" style={{ fontSize: 12, letterSpacing: "0.06em" }}>혜택 유형</p>
                <div className="flex flex-wrap gap-2">
                  {BENEFIT_OPTIONS.map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setActiveBenefit(b.key)}
                      className={`min-h-[44px] rounded-full px-4 py-2 transition-all ${
                        activeBenefit === b.key ? "bg-neutral-900 text-white" : "border border-neutral-200 text-neutral-600 bg-white"
                      }`}
                      style={{ fontSize: 14, fontWeight: activeBenefit === b.key ? 600 : 500 }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full min-h-[52px] rounded-2xl text-white font-semibold transition-all"
                style={{ fontSize: 16, background: "var(--btn-gradient)" }}
              >
                {filtered.length}건 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCampaign && (
        <CampaignDetailModal
          c={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
        />
      )}
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT B — 리스트형 (수평 행, 정보 밀도 높음)
// ═══════════════════════════════════════════════════════════════════════════════

function RowB({
  c, isLoggedIn, onLogin, onCardClick,
}: {
  c: Campaign; isLoggedIn: boolean; onLogin: () => void; onCardClick: () => void;
}) {
  const isUrgent = c.dDayNum <= 20;
  const pct = Math.round(c.applicants / c.quota * 100);

  return (
    <article
      className="group flex items-stretch gap-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white cursor-pointer transition-all duration-300 hover:border-[var(--cp)]/25 hover:shadow-[0_12px_28px_-16px_rgba(var(--cp-rgb),0.2)]"
      onClick={onCardClick}
    >
      {/* Image */}
      <div className="relative shrink-0 overflow-hidden w-28 sm:w-40">
        <ImageWithFallback
          src={c.img}
          alt={c.brand}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        <div className="absolute left-2 top-2">
          <TagBadge tag={c.tag} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col justify-between p-4 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-neutral-400" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em" }}>{c.category.toUpperCase()}</p>
              <h3 className="mt-0.5 text-neutral-950 font-bold" style={{ fontSize: 16, letterSpacing: "-0.01em" }}>{c.brand}</h3>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white"
              style={{ background: isUrgent ? "rgba(239,68,68,0.85)" : "rgba(var(--cd-rgb),0.75)" }}
            >
              {c.dDay}
            </span>
          </div>
          <div className="mt-2">
            {isLoggedIn ? (
              <p className="text-neutral-500" style={{ fontSize: 14, lineHeight: 1.55 }}>{c.benefit}</p>
            ) : (
              <LockPlaceholder />
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-neutral-400" style={{ fontSize: 12 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1.5 10.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            팔로워 {c.minFollowers}
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-2 flex-1 max-w-[160px]">
              <div className="flex-1 h-1 rounded-full bg-neutral-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? "#D97706" : "var(--cp)" }} />
              </div>
              <span style={{ fontSize: 12, color: pct >= 70 ? "#D97706" : "var(--cp)", fontWeight: 600 }}>{c.applicants}/{c.quota}명</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Fit + CTA */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-3 border-l border-neutral-100 px-3 py-4 sm:w-[120px] sm:px-5">
        {isLoggedIn ? (
          <>
            <div className="text-center">
              <p className="text-neutral-400" style={{ fontSize: 12 }}>내 매칭률</p>
              <p className="font-black" style={{ fontSize: 24, color: c.fit >= 85 ? "var(--cp)" : c.fit >= 70 ? "#D97706" : "#9CA3AF", lineHeight: 1.1 }}>{c.fit}</p>
              <p className="text-neutral-400" style={{ fontSize: 12 }}>점</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onCardClick(); }}
              className="w-full min-h-[36px] rounded-full text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "var(--btn-gradient)", boxShadow: "0 4px 12px -4px rgba(var(--cp-rgb),0.35)" }}
            >
              신청하기
            </button>
          </>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onLogin(); }}
            className="w-full min-h-[36px] rounded-full text-xs font-medium transition-all"
            style={{ background: "var(--cbg1)", color: "var(--cd)", border: "1px solid rgba(var(--cp-rgb),0.2)" }}
          >
            로그인
          </button>
        )}
      </div>
    </article>
  );
}

export function CampaignsPageB({
  onNavigate, isLoggedIn, onLogin,
}: {
  onNavigate: (p: Page) => void; isLoggedIn: boolean; onLogin: () => void;
}) {
  const { activeCategory, setActiveCategory, activeBenefit, setActiveBenefit, sort, setSort, filtered, selectedCampaign, setSelectedCampaign } = useCampaignFilter();

  return (
    <main className="relative w-full bg-[var(--cbg2)]">

      <div className="sticky top-16 z-40 bg-white border-b border-neutral-100 shadow-sm">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-neutral-950 font-bold" style={{ fontSize: 20, letterSpacing: "-0.02em" }}>진행 중인 캠페인</h1>
              <p className="text-neutral-400 mt-0.5" style={{ fontSize: 12 }}>총 {filtered.length}건 · Fit-Score 기반 매칭</p>
            </div>
            <div className="flex items-center gap-2">
              {!isLoggedIn && (
                <button onClick={onLogin} className="min-h-[36px] rounded-full px-5 py-2 text-xs font-semibold text-white" style={{ background: "var(--btn-gradient)" }}>
                  Fit-Score 받기
                </button>
              )}
              <SortSelect sort={sort} onSort={setSort} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[32px] rounded-full px-3 py-1 text-xs transition-all ${
                  activeCategory === cat ? "text-white" : "border border-neutral-200 text-neutral-500 bg-white hover:border-[var(--cp)]/30"
                }`}
                style={{ background: activeCategory === cat ? "var(--cp)" : undefined }}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex gap-1.5">
              {BENEFIT_OPTIONS.filter(b => b.key !== "전체").map((b) => (
                <button
                  key={b.key}
                  onClick={() => setActiveBenefit(activeBenefit === b.key ? "전체" : b.key)}
                  className={`min-h-[32px] rounded-full px-3 py-1 text-xs transition-all ${activeBenefit === b.key ? "bg-neutral-900 text-white" : "border border-neutral-200 text-neutral-500"}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="py-6">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 space-y-3">
          {filtered.map((c, i) => (
            <CardReveal key={c.id} delay={i * 40}>
              <RowB c={c} isLoggedIn={isLoggedIn} onLogin={onLogin} onCardClick={() => isLoggedIn ? setSelectedCampaign(c) : onLogin()} />
            </CardReveal>
          ))}
        </div>
      </section>

      {selectedCampaign && (
        <CampaignDetailModal c={selectedCampaign} onClose={() => setSelectedCampaign(null)} isLoggedIn={isLoggedIn} onLogin={onLogin} />
      )}
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT C — 사이드바형 (좌측 필터 + 2열 그리드) — 참고용
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarC({
  activeCategory, onCategory, activeBenefit, onBenefit, sort, onSort, count,
}: {
  activeCategory: string; onCategory: (c: string) => void;
  activeBenefit: string; onBenefit: (b: string) => void;
  sort: "latest" | "deadline" | "fit"; onSort: (s: "latest" | "deadline" | "fit") => void;
  count: number;
}) {
  return (
    <aside className="shrink-0 w-56">
      <div className="sticky top-20 space-y-5">
        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="text-neutral-400 font-semibold mb-3" style={{ fontSize: 12, letterSpacing: "0.06em" }}>정렬</p>
          {(["latest", "deadline", "fit"] as const).map((s) => {
            const labels = { latest: "최신순", deadline: "마감임박순", fit: "Fit-Score순" };
            return (
              <button
                key={s}
                onClick={() => onSort(s)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-all ${sort === s ? "bg-[var(--cbg1)] text-[var(--cp)] font-semibold" : "text-neutral-500 hover:bg-neutral-50"}`}
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${sort === s ? "bg-[var(--cp)]" : "bg-neutral-200"}`} />
                {labels[s]}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="text-neutral-400 font-semibold mb-3" style={{ fontSize: 12, letterSpacing: "0.06em" }}>카테고리</p>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-left transition-all ${activeCategory === cat ? "bg-[var(--cbg1)] text-[var(--cp)] font-semibold" : "text-neutral-500 hover:bg-neutral-50"}`}
              >
                <span className={`h-3 w-3 shrink-0 rounded-full border-2 transition-all ${activeCategory === cat ? "border-[var(--cp)] bg-[var(--cp)]" : "border-neutral-300"}`} />
                <span style={{ fontSize: 14 }}>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="text-neutral-400 font-semibold mb-3" style={{ fontSize: 12, letterSpacing: "0.06em" }}>혜택 유형</p>
          <div className="space-y-1">
            {BENEFIT_OPTIONS.map((b) => (
              <button
                key={b.key}
                onClick={() => onBenefit(b.key)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all ${activeBenefit === b.key ? "bg-[var(--cbg1)] text-[var(--cp)] font-semibold" : "text-neutral-500 hover:bg-neutral-50"}`}
                style={{ fontSize: 14 }}
              >
                <span className={`h-3 w-3 shrink-0 rounded-full border-2 transition-all ${activeBenefit === b.key ? "border-[var(--cp)] bg-[var(--cp)]" : "border-neutral-300"}`} />
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function CardC({
  c, isLoggedIn, onLogin, onCardClick,
}: {
  c: Campaign; isLoggedIn: boolean; onLogin: () => void; onCardClick: () => void;
}) {
  const isUrgent = c.dDayNum <= 20;
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl bg-white cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(var(--cp-rgb),0.22)]"
      style={{ border: "1px solid rgba(0,0,0,0.07)" }}
      onClick={onCardClick}
    >
      <div className="relative overflow-hidden" style={{ height: 148 }}>
        <ImageWithFallback src={c.img} alt={c.brand} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <TagBadge tag={c.tag} />
          <span className="rounded-full px-2 py-0.5 text-white font-bold" style={{ fontSize: 12, background: isUrgent ? "rgba(239,68,68,0.85)" : "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
            {c.dDay}
          </span>
        </div>
        {isLoggedIn ? (
          <div className="absolute right-3 top-3"><FitBadge score={c.fit} /></div>
        ) : (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ fontSize: 12, background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.65)", backdropFilter: "blur(4px)" }}>
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              매칭률
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white/60" style={{ fontSize: 12, letterSpacing: "0.04em" }}>{c.category.toUpperCase()}</p>
          <h3 className="text-white font-bold" style={{ fontSize: 16, lineHeight: 1.3 }}>{c.brand}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div>
          {isLoggedIn ? (
            <p className="text-neutral-500" style={{ fontSize: 12, lineHeight: 1.55 }}>{c.benefit}</p>
          ) : (
            <LockPlaceholder />
          )}
        </div>
        <div className="mt-auto pt-3">
          {isLoggedIn && (
            <div className="mb-2.5">
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400" style={{ fontSize: 12 }}>신청 현황</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cd)" }}>{c.applicants}/{c.quota}명</span>
              </div>
              <div className="h-1 rounded-full bg-neutral-100">
                <div className="h-full rounded-full" style={{ width: `${Math.round(c.applicants / c.quota * 100)}%`, background: "linear-gradient(90deg,var(--cp),var(--cs))" }} />
              </div>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); !isLoggedIn ? onLogin() : onCardClick(); }}
            className="w-full min-h-[36px] rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--btn-gradient)",
              color: "white",
              border: "none",
            }}
          >
            {isLoggedIn ? "신청하기" : "로그인하고 신청하기"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function CampaignsPageC({
  onNavigate, isLoggedIn, onLogin,
}: {
  onNavigate: (p: Page) => void; isLoggedIn: boolean; onLogin: () => void;
}) {
  const { activeCategory, setActiveCategory, activeBenefit, setActiveBenefit, sort, setSort, filtered, selectedCampaign, setSelectedCampaign } = useCampaignFilter();

  return (
    <main className="relative w-full bg-[var(--cbg2)] min-h-screen">

      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-neutral-950 font-bold" style={{ fontSize: 18, letterSpacing: "-0.02em" }}>캠페인 탐색</h1>
            <p className="text-neutral-400 mt-0.5" style={{ fontSize: 12 }}>팔로워 수 관계없이 Fit-Score로 매칭됩니다</p>
          </div>
          {!isLoggedIn && (
            <button onClick={onLogin} className="min-h-[40px] rounded-full px-6 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5" style={{ background: "var(--btn-gradient)", boxShadow: "0 4px 14px -6px rgba(var(--cp-rgb),0.4)" }}>
              무료로 Fit-Score 받기
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-8">
        <div className="flex gap-6 items-start">
          <SidebarC
            activeCategory={activeCategory} onCategory={setActiveCategory}
            activeBenefit={activeBenefit} onBenefit={setActiveBenefit}
            sort={sort} onSort={setSort}
            count={filtered.length}
          />
          <div className="flex-1 min-w-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((c, i) => (
                <CardReveal key={c.id} delay={i * 50} className="h-full">
                  <CardC c={c} isLoggedIn={isLoggedIn} onLogin={onLogin} onCardClick={() => isLoggedIn ? setSelectedCampaign(c) : onLogin()} />
                </CardReveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCampaign && (
        <CampaignDetailModal c={selectedCampaign} onClose={() => setSelectedCampaign(null)} isLoggedIn={isLoggedIn} onLogin={onLogin} />
      )}
    </main>
  );
}
