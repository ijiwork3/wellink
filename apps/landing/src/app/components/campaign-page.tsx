import React, { useState, useEffect } from "react";
import { Clock, Heart, X, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BackgroundGrid } from "./background-grid";
import { CardReveal } from "./card-reveal";
import { Reveal } from "./reveal";

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login" | "pricing";

const CHANNEL_STYLES: Record<string, { cls: string; style?: React.CSSProperties }> = {
  '인스타그램': { cls: 'text-[#C13584] font-medium', style: { background: 'linear-gradient(135deg,#f3e8ff 0%,#fce7f3 60%,#fff7ed 100%)', padding: '1px 8px', borderRadius: '9999px' } },
  '유튜브':     { cls: 'bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full' },
  '블로그':     { cls: 'bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full' },
}

function ChannelBadge({ channel, className = '' }: { channel?: string; className?: string }) {
  if (!channel) return null
  const s = CHANNEL_STYLES[channel] ?? { cls: 'text-gray-400' }
  return <span className={`text-xs whitespace-nowrap ${s.cls} ${className}`} style={s.style}>{channel}</span>
}

export const CATEGORIES = [
  "전체",
  "헬스·보디빌딩",
  "필라테스·요가",
  "러닝·마라톤",
  "크로스핏",
  "웰니스 푸드·보충제",
  "스포츠웨어",
];

export interface Campaign {
  id: number;
  brand: string;
  category: string;
  type?: 'delivery' | 'visit';  // 배송형 | 방문형
  channel?: string;              // 인스타그램 | 유튜브 | 블로그
  hasProduct?: boolean;
  hasFee?: boolean;
  rewardAmount?: number;         // 혜택 금액 (원) — "N원 상당 혜택" 표시용
  benefit: string;               // 상세 혜택 설명 (모달에서 사용)
  dDay: string;
  dDayNum: number;
  applicants: number;
  quota: number;
  minFollowers: string;
  fit: number;
  img: string;
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    brand: "핏플로우",
    category: "헬스·보디빌딩",
    type: 'delivery', channel: '인스타그램',
    hasProduct: true, hasFee: true,
    rewardAmount: 800000,
    benefit: "프로틴 파우더 1개월분 + 활동비 50만원",
    dDay: "D-21", dDayNum: 21,
    applicants: 12, quota: 30, minFollowers: "1만 이상", fit: 92,
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    brand: "그린바디",
    category: "웰니스 푸드·보충제",
    type: 'delivery', channel: '유튜브',
    hasProduct: true,
    rewardAmount: 350000,
    benefit: "유기농 단백질 보충제 세트 (3개월분)",
    dDay: "D-26", dDayNum: 26,
    applicants: 8, quota: 20, minFollowers: "제한 없음", fit: 87,
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    brand: "런스튜디오",
    category: "러닝·마라톤",
    type: 'visit', channel: '인스타그램',
    hasProduct: true, hasFee: true,
    rewardAmount: 580000,
    benefit: "러닝화 1켤레 + 활동비 30만원",
    dDay: "D-19", dDayNum: 19,
    applicants: 5, quota: 15, minFollowers: "5천 이상", fit: 79,
    img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    brand: "요가모먼트",
    category: "필라테스·요가",
    type: 'delivery', channel: '블로그',
    hasProduct: true,
    rewardAmount: 230000,
    benefit: "프리미엄 요가 매트 + 클래스 이용권 3매",
    dDay: "D-31", dDayNum: 31,
    applicants: 3, quota: 10, minFollowers: "제한 없음", fit: 85,
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    brand: "크로스핏코리아",
    category: "크로스핏",
    type: 'visit', channel: '인스타그램',
    hasProduct: true, hasFee: true,
    rewardAmount: 1200000,
    benefit: "크로스핏 장비 풀셋 + 활동비 40만원",
    dDay: "D-33", dDayNum: 33,
    applicants: 15, quota: 25, minFollowers: "1만 이상", fit: 71,
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    brand: "핏웨어",
    category: "스포츠웨어",
    type: 'delivery', channel: '인스타그램',
    hasProduct: true,
    rewardAmount: 180000,
    benefit: "스포츠 레깅스·탑 전 라인업 자유 선택",
    dDay: "D-23", dDayNum: 23,
    applicants: 20, quota: 40, minFollowers: "제한 없음", fit: 68,
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    brand: "필라몸",
    category: "필라테스·요가",
    type: 'delivery', channel: '유튜브',
    hasProduct: true, hasFee: true,
    rewardAmount: 420000,
    benefit: "필라테스 소도구 세트 + 활동비 20만원",
    dDay: "D-15", dDayNum: 15,
    applicants: 18, quota: 30, minFollowers: "5천 이상", fit: 83,
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    brand: "러너랩",
    category: "러닝·마라톤",
    type: 'delivery', channel: '블로그',
    hasProduct: true,
    rewardAmount: 160000,
    benefit: "러닝 아웃핏 풀세트 (상의·하의·양말)",
    dDay: "D-28", dDayNum: 28,
    applicants: 9, quota: 20, minFollowers: "제한 없음", fit: 76,
    img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80",
  },
];

export function FitBadge({ score }: { score: number }) {
  const bg = score >= 85 ? "var(--cp)" : score >= 70 ? "#D97706" : "#6B7280";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-white"
      style={{ fontSize: 12, fontWeight: 700, background: bg, letterSpacing: "-0.005em" }}
    >
      나와 {score}% 매칭
    </span>
  );
}

export function CampaignBadges({ hasProduct, hasFee }: { hasProduct?: boolean; hasFee?: boolean }) {
  if (!hasProduct && !hasFee) return null;
  return (
    <div className="inline-flex flex-wrap gap-1">
      {hasProduct && (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 backdrop-blur"
          style={{ fontSize: 12, fontWeight: 600, background: "rgba(var(--cp-rgb),0.12)", color: "var(--cp)", border: "1px solid rgba(var(--cp-rgb),0.25)" }}
        >
          제품 협찬
        </span>
      )}
      {hasFee && (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 backdrop-blur"
          style={{ fontSize: 12, fontWeight: 600, background: "rgba(var(--cs-rgb),0.12)", color: "var(--cs)", border: "1px solid rgba(var(--cs-rgb),0.25)" }}
        >
          활동비
        </span>
      )}
    </div>
  );
}

function ApplicantBar({
  applicants,
  quota,
  isLoggedIn,
}: {
  applicants: number;
  quota: number;
  isLoggedIn: boolean;
}) {
  const pct = Math.min(100, Math.max(0, Math.round((applicants / quota) * 100)));
  const urgent = pct >= 70;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-neutral-400" style={{ fontSize: 12 }}>
          신청 현황
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: urgent ? "#D97706" : "var(--cp)",
          }}
        >
          {isLoggedIn ? `${applicants}/${quota}명` : "••/••명"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: isLoggedIn ? `${pct}%` : "35%",
            background: urgent
              ? "linear-gradient(90deg,#D97706,#F59E0B)"
              : "linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)",
          }}
        />
      </div>
    </div>
  );
}

function CampaignCard({
  c,
  onCardClick,
}: {
  c: Campaign;
  isLoggedIn: boolean;
  onLogin: () => void;
  onCardClick: () => void;
}) {
  const ddayNum = c.dDayNum;
  const isEnded = ddayNum < 0;
  const isToday = ddayNum === 0;
  const ddayText = isEnded ? '캠페인 종료' : isToday ? '오늘 마감' : `마감 ${ddayNum}일 전`;
  const ddayBgClass = isEnded
    ? 'bg-gray-100 text-gray-400'
    : ddayNum <= 3 ? 'bg-red-50 text-red-600 border border-red-100'
    : ddayNum <= 7 ? 'bg-amber-50 text-amber-600 border border-amber-100'
    : 'bg-gray-100 text-gray-500 border border-gray-200';

  const benefitTags = [
    c.hasProduct ? '제품 협찬' : null,
    c.hasFee ? '활동비' : null,
  ].filter(Boolean) as string[];

  const rewardText = c.rewardAmount
    ? `${c.rewardAmount.toLocaleString('ko-KR')}원 상당 혜택`
    : c.benefit;

  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 flex flex-col h-full"
      onClick={onCardClick}
    >
      {/* 썸네일 */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <ImageWithFallback src={c.img} alt={c.brand} className="w-full h-full object-cover" />
        {/* 하트 — 인플루언서 앱과 동일: 투명 배경, 흰색 하트, drop-shadow */}
        <button
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full"
          onClick={(e) => { e.stopPropagation(); }}
          aria-label="저장하기"
        >
          <Heart
            size={22}
            fill="none"
            color="rgba(255,255,255,0.85)"
            strokeWidth={2}
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
          />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="p-4 flex flex-col flex-1">
        {/* 1행: D-day + 배송형/방문형 */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ddayBgClass}`}>
            {ddayText}
          </span>
          {c.type === 'delivery' ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 whitespace-nowrap">배송형</span>
          ) : c.type === 'visit' ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">방문형</span>
          ) : null}
        </div>

        {/* 브랜드명 */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 break-keep leading-snug mb-1">{c.brand}</h3>

        {/* 혜택 유형 + 리워드 */}
        <div className="mb-3">
          {benefitTags.length > 0 && (
            <p className="text-xs text-gray-400 mb-0.5">{benefitTags.join(' · ')}</p>
          )}
          <p className="text-sm text-gray-500 truncate">{rewardText}</p>
        </div>

        <div className="flex-1" />

        {/* 하단: 모집인원 + 채널 */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-500 whitespace-nowrap">모집 인원: {c.quota.toLocaleString('ko-KR')}</span>
          <ChannelBadge channel={c.channel} />
        </div>
      </div>
    </article>
  );
}

function Hero({
  isLoggedIn,
  onLogin,
}: {
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const [scoreReady, setScoreReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    const t = setTimeout(() => setScoreReady(true), 1100);
    return () => clearTimeout(t);
  }, [isLoggedIn]);

  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-16 sm:pb-20 sm:pt-20">
      <BackgroundGrid />
      <div
        className="pointer-events-none absolute -top-24 right-[-8%] h-[440px] w-[600px] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(var(--cl-rgb),0.38), transparent 75%)" }}
      />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-14 grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
          {/* Left */}
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[var(--cp)]/20 bg-white/80 px-4 py-2 text-[var(--cp)] backdrop-blur"
              style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.005em" }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cp)]" />
              캠페인 · 진행 중 8건
            </span>
            <h1
              className="mt-10 text-neutral-950"
              style={{
                fontSize: "clamp(26px, 4.4vw, 50px)",
                fontWeight: 700,
                lineHeight: 1.32,
                letterSpacing: "-0.025em",
                wordBreak: "keep-all",
              }}
            >
              내 채널에<br /><span className="gradient-text-loop">딱 맞는</span> 캠페인만<br />보여드립니다
            </h1>
            <p
              className="mt-8 max-w-[480px] text-neutral-500"
              style={{ fontSize: 16, lineHeight: 1.7 }}
            >
              팔로워 수가 아닌 Fit-Score로 선별됩니다.<br />
              내 채널 핏이 높은 캠페인이 먼저 노출됩니다.
            </p>
          </div>

          {/* Right: login nudge card */}
          {!isLoggedIn ? (
            <div
              className="relative overflow-hidden rounded-3xl bg-white p-8"
              style={{
                border: "1px solid rgba(var(--cp-rgb),0.16)",
                boxShadow: "0 12px 32px -20px rgba(var(--cp-rgb),0.16)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: "linear-gradient(90deg,var(--cp),var(--cl),var(--cp))" }}
              />
              <p
                className="text-neutral-950"
                style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.01em" }}
              >
                Fit-Score로 내 채널에<br />맞는 캠페인만 보세요
              </p>
              <p className="mt-3 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.7 }}>
                무료 등록 후 Fit-Score로 내 채널을 분석합니다.<br />
                팔로워가 적어도 브랜드 핏이 높으면 우선 매칭됩니다.
              </p>
              <button
                onClick={onLogin}
                className="mt-6 w-full min-h-[44px] rounded-full py-3.5 text-white transition-all duration-300 hover:translate-y-[-1px]"
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  background: "var(--btn-gradient)",
                  boxShadow: "0 6px 18px -8px rgba(var(--cp-rgb),0.4)",
                }}
              >
                무료로 Fit-Score 받기
              </button>
              <button
                onClick={onLogin}
                className="mt-2.5 w-full rounded-full border border-neutral-200 py-3 text-neutral-500 transition-all hover:border-[var(--cp)]/30 hover:text-[var(--cp)]"
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          ) : (
            <div
              className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
            >
              <div
                className="inline-flex items-center gap-2 rounded-full border border-[var(--cp)]/20 bg-[var(--cbg1)] px-3 py-1.5 text-[var(--cd)]"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cp)]" />
                로그인 상태
              </div>
              <p
                className="mt-5 text-neutral-950"
                style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.01em" }}
              >
                내 채널 Fit-Score 기반<br />맞춤 캠페인 추천 중
              </p>
              <p className="mt-3 text-neutral-500" style={{ fontSize: 14, lineHeight: 1.65 }}>
                Fit-Score 높은 캠페인부터 우선 노출됩니다.
              </p>
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-[var(--cbg1)] px-5 py-5">
                <p className="text-neutral-500" style={{ fontSize: 12, fontWeight: 500 }}>내 Fit-Score</p>
                <p className="mt-1.5 text-neutral-950 transition-opacity duration-500" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", opacity: scoreReady ? 1 : 0.35 }}>
                  {scoreReady ? "92점" : "—"}
                </p>
                <p className="mt-1 transition-all duration-500" style={{ fontSize: 12, fontWeight: 600, color: scoreReady ? "var(--cp)" : "#ccc" }}>
                  {scoreReady ? "헬스·보디빌딩 최상위 5%" : "분석 중..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const BENEFIT_OPTIONS = [
  { key: "전체", label: "혜택 전체" },
  { key: "product", label: "제품 협찬" },
  { key: "fee", label: "활동비" },
];

function FilterBar({
  activeCategory,
  onCategory,
  activeBenefit,
  onBenefit,
  sort,
  onSort,
}: {
  activeCategory: string;
  onCategory: (c: string) => void;
  activeBenefit: string;
  onBenefit: (b: string) => void;
  sort: "latest" | "deadline" | "fit";
  onSort: (s: "latest" | "deadline" | "fit") => void;
}) {
  return (
    <div className="sticky top-16 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        {/* Row 1: Category pills */}
        <div className="relative">
        <div
          className="flex gap-2 overflow-x-auto pt-3.5 pb-2 pr-4 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className={`shrink-0 min-h-[44px] rounded-full px-4 py-2.5 transition-all duration-200 ${
                  active
                    ? "text-white shadow-sm"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-[var(--cp)]/30 hover:text-[var(--cp)]"
                }`}
                style={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  background: active
                    ? "var(--btn-gradient)"
                    : undefined,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/90 to-transparent" />
        </div>

        {/* Row 2: Benefit filter + Sort */}
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {BENEFIT_OPTIONS.map((b) => {
              const active = activeBenefit === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => onBenefit(b.key)}
                  className={`min-h-[44px] rounded-full px-3 py-2 transition-all duration-200 ${
                    active
                      ? "bg-neutral-900 text-white"
                      : "border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                  }`}
                  style={{ fontSize: 12, fontWeight: active ? 600 : 500 }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as "latest" | "deadline" | "fit")}
            className="shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-white px-3 py-1 min-h-[44px] text-neutral-600 outline-none transition-colors hover:border-neutral-300"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            <option value="latest">최신순</option>
            <option value="deadline">마감임박순</option>
            <option value="fit">Fit-Score순</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-[var(--cbg2)]">
        <Clock size={28} className="text-neutral-400" />
      </div>
      <h3
        className="mt-6 text-neutral-950"
        style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}
      >
        곧 오픈 예정입니다
      </h3>
      <p
        className="mt-3 text-neutral-500"
        style={{ fontSize: 16, lineHeight: 1.75 }}
      >
        해당 카테고리 캠페인이 곧 등록됩니다.
        <br />사전 등록하면 첫 캠페인 소식을 먼저 받아볼 수 있습니다.
      </p>
      <button
        className="mt-6 min-h-[44px] rounded-full px-8 py-3 text-white transition-all hover:translate-y-[-1px]"
        style={{
          fontSize: 14,
          fontWeight: 600,
          background: "var(--btn-gradient)",
          boxShadow: "0 6px 16px -8px rgba(var(--cp-rgb),0.4)",
        }}
      >
        사전 등록하기
      </button>
    </div>
  );
}

function FeaturedCard({
  c,
  isLoggedIn,
  onLogin,
  onCardClick,
}: {
  c: Campaign;
  isLoggedIn: boolean;
  onLogin: () => void;
  onCardClick: () => void;
}) {
  const isUrgent = c.dDayNum <= 20;
  return (
    <article
      className="relative flex h-full min-h-[320px] overflow-hidden rounded-[24px] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgba(var(--cd-rgb),0.55)] cursor-pointer"
      style={{
        background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)",
      }}
      onClick={onCardClick}
    >

      {/* Background image — right half, faded */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%)" }}
      >
        <ImageWithFallback
          src={c.img}
          alt={c.brand}
          className="h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>

      {/* Left content */}
      <div className="relative z-20 flex flex-col justify-between p-8 lg:w-3/5">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2">
          <CampaignBadges hasProduct={c.hasProduct} hasFee={c.hasFee} />
          {isLoggedIn ? (
            <FitBadge score={c.fit} />
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1"
              style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.35" />
                <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
              </svg>
              로그인 후 매칭률 확인
            </span>
          )}
          <span
            className="rounded-full px-2.5 py-1 text-white"
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: isUrgent ? "rgba(239,68,68,0.85)" : "rgba(255,255,255,0.18)",
              border: isUrgent ? "none" : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {c.dDay}
          </span>
        </div>

        {/* Middle */}
        <div className="mt-6">
          <p className="text-[var(--cl)]" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>
            {c.category.toUpperCase()}
          </p>
          <h2
            className="mt-2 text-white"
            style={{ fontSize: "clamp(17px, 1.8vw, 24px)", fontWeight: 800, lineHeight: 1.35, letterSpacing: "-0.02em" }}
          >
            {c.brand}
          </h2>
          <div className="mt-3">
            {isLoggedIn ? (
              <p className="text-white/70" style={{ fontSize: 16, lineHeight: 1.65 }}>{c.benefit}</p>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.08] px-3 py-2.5">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.35"/>
                  <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.35" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>로그인하면 확인 가능</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-white/40" style={{ fontSize: 12 }}>팔로워 요건</span>
            <span
              className="rounded-full border border-white/20 px-2.5 py-0.5 text-white/70"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {c.minFollowers}
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8">
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-white/50" style={{ fontSize: 12 }}>신청 현황</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cl)" }}>
                {isLoggedIn ? `${c.applicants}/${c.quota}명` : "••/••명"}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: isLoggedIn ? `${Math.min(100, Math.max(0, Math.round((c.applicants / c.quota) * 100)))}%` : "35%",
                  background: "linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)",
                }}
              />
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); !isLoggedIn ? onLogin() : onCardClick(); }}
            className="w-full min-h-[44px] rounded-full py-3.5 font-semibold transition-all duration-300 hover:translate-y-[-1px]"
            style={{
              fontSize: 14,
              fontWeight: 600,
              background: "var(--btn-gradient)",
              color: "var(--cd-deep)",
              border: "none",
              boxShadow: "0 4px 14px -4px rgba(var(--cl-rgb),0.4)",
            }}
          >
            {isLoggedIn ? "상세 보기 · 신청하기" : "로그인하고 신청하기"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CampaignGrid({
  campaigns,
  isLoggedIn,
  onLogin,
  onCardClick,
}: {
  campaigns: Campaign[];
  isLoggedIn: boolean;
  onLogin: () => void;
  onCardClick: (c: Campaign) => void;
}) {
  if (campaigns.length === 0) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <EmptyState />
        </div>
      </section>
    );
  }

  const [featured, ...rest] = campaigns;

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        {/* Row 1: Featured (2/3) + Card 2 (1/3) */}
        <div className="mb-4 grid items-stretch gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="h-full lg:col-span-2">
            <CardReveal delay={0} className="h-full">
              <FeaturedCard c={featured} isLoggedIn={isLoggedIn} onLogin={onLogin} onCardClick={() => onCardClick(featured)} />
            </CardReveal>
          </div>
          {rest[0] && (
            <div className="h-full">
              <CardReveal delay={100} className="h-full">
                <CampaignCard c={rest[0]} isLoggedIn={isLoggedIn} onLogin={onLogin} onCardClick={() => onCardClick(rest[0])} />
              </CardReveal>
            </div>
          )}
        </div>

        {/* Remaining: 3-col grid */}
        {rest.length > 1 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(1).map((c, i) => (
              <CardReveal key={c.id} delay={i * 80} className="h-full">
                <CampaignCard c={c} isLoggedIn={isLoggedIn} onLogin={onLogin} onCardClick={() => onCardClick(c)} />
              </CardReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BottomCTA({
  onNavigate,
  onLogin,
  isLoggedIn,
}: {
  onNavigate: (p: Page) => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}) {
  if (isLoggedIn) return null;
  return (
    <Reveal bgStyle={{ background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)" }}>
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 text-center">
          <p
            className="text-[var(--cl)]"
            style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em" }}
          >
            FIT-SCORE
          </p>
          <h2
            className="mt-4 text-white"
            style={{
              fontSize: "clamp(24px,3.2vw,44px)",
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            Fit-Score 없이는 절반만 보입니다
          </h2>
          <p
            className="mt-5 text-white/60"
            style={{ fontSize: 16, lineHeight: 1.75 }}
          >
            무료 등록 후 Fit-Score로 내 채널을 분석합니다.
            <br />
            팔로워 수가 적어도 브랜드 핏이 높으면 우선 매칭됩니다.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onLogin}
              className="rounded-full px-8 py-3.5 text-[var(--cd)] transition-all hover:translate-y-[-1px]"
              style={{
                fontSize: 16,
                fontWeight: 600,
                background: "var(--btn-gradient)",
                boxShadow: "0 8px 20px -8px rgba(var(--cl-rgb),0.4)",
              }}
            >
              무료로 등록하고 Fit-Score 받기
            </button>
            <button
              onClick={() => onNavigate("influencer")}
              className="rounded-full border border-white/20 px-8 py-3.5 text-white/80 transition-all hover:border-white/40 hover:text-white"
              style={{ fontSize: 16, fontWeight: 500 }}
            >
              인플루언서 서비스 더 보기
            </button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

export function CampaignDetailModal({
  c,
  onClose,
  isLoggedIn,
  onLogin,
}: {
  c: Campaign;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const [applied, setApplied] = useState<"idle" | "loading" | "done">("idle");
  const ddayNum = c.dDayNum;
  const isEnded = ddayNum < 0;
  const isToday = ddayNum === 0;
  const ddayText = isEnded ? '캠페인 종료' : isToday ? '오늘 마감' : `마감 ${ddayNum}일 전`;
  const ddayBgClass = isEnded
    ? 'bg-gray-100 text-gray-400'
    : ddayNum <= 3 ? 'bg-red-50 text-red-600 border border-red-100'
    : ddayNum <= 7 ? 'bg-amber-50 text-amber-600 border border-amber-100'
    : 'bg-gray-100 text-gray-500 border border-gray-200';

  const benefitTags = [
    c.hasProduct ? '제품 협찬' : null,
    c.hasFee ? '활동비' : null,
  ].filter(Boolean) as string[];

  const pct = Math.min(100, Math.round((c.applicants / c.quota) * 100));
  const isUrgent = pct >= 70;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleApply = () => {
    setApplied("loading");
    setTimeout(() => setApplied("done"), 900);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-[24px] shadow-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 썸네일 — 고정, 스크롤 안 됨 */}
        <div className="relative w-full overflow-hidden rounded-t-[24px] bg-gray-100 shrink-0" style={{ height: 200 }}>
          <ImageWithFallback src={c.img} alt={c.brand} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* 헤더: 배지 행 + 브랜드명 + 혜택 유형 */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ddayBgClass}`}>{ddayText}</span>
              {c.type === 'delivery' ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 whitespace-nowrap">배송형</span>
              ) : c.type === 'visit' ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">방문형</span>
              ) : null}
              {c.channel && <ChannelBadge channel={c.channel} className="ml-auto" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-snug break-keep">{c.brand}</h2>
            {benefitTags.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">{benefitTags.join(' · ')}</p>
            )}
          </div>

          {/* 모집 현황 — 인플루언서 앱 스타일 */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">모집 현황</span>
              <span className="text-sm text-gray-500 tabular-nums whitespace-nowrap">
                {isLoggedIn ? `${c.applicants}/${c.quota}명` : '••/••명'}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: isLoggedIn ? `${pct}%` : '35%',
                  background: isUrgent
                    ? 'linear-gradient(90deg,#D97706,#F59E0B)'
                    : 'linear-gradient(90deg,var(--cp) 0%,var(--cs) 100%)',
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 tabular-nums">
              {isLoggedIn ? `${pct}% 모집 중` : '로그인 후 확인 가능'}
            </p>
          </div>

          {/* 제공 혜택 */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">제공 혜택</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              {c.hasProduct && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500 shrink-0">제품 협찬</span>
                  {isLoggedIn ? (
                    <span className="font-medium text-gray-900 text-right">
                      {c.rewardAmount ? `${c.rewardAmount.toLocaleString('ko-KR')}원 상당` : '협찬 포함'}
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth="1.35"/>
                        <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="#9CA3AF" strokeWidth="1.35" strokeLinecap="round"/>
                      </svg>
                      로그인 후 확인
                    </span>
                  )}
                </div>
              )}
              {c.hasFee && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500 shrink-0">활동비</span>
                  {isLoggedIn ? (
                    <span className="font-medium text-gray-900">포함</span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="#9CA3AF" strokeWidth="1.35"/>
                        <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="#9CA3AF" strokeWidth="1.35" strokeLinecap="round"/>
                      </svg>
                      로그인 후 확인
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 캠페인 정보 */}
          <div className="border-t border-gray-100 pt-5 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">모집 인원</span>
              <span className="font-medium text-gray-900">{c.quota.toLocaleString('ko-KR')}명</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">팔로워 요건</span>
              <span className="font-medium text-gray-900">{c.minFollowers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">카테고리</span>
              <span className="font-medium text-gray-900">{c.category}</span>
            </div>
          </div>

          {/* 신청 완료 상태 */}
          {applied === "done" && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 py-5">
              <p className="text-emerald-700 font-bold text-base">신청이 완료됐어요!</p>
              <p className="text-gray-500 text-sm">브랜드 담당자가 검토 후 연락드릴게요.</p>
              <button onClick={onClose} className="mt-1 text-gray-400 underline text-sm">닫기</button>
            </div>
          )}
        </div>

        {/* CTA — 항상 하단 고정 */}
        {applied !== "done" && (
          <div className="shrink-0 border-t border-gray-100 p-5 pt-4">
            <button
              onClick={!isLoggedIn ? onLogin : handleApply}
              disabled={applied === "loading"}
              className="w-full rounded-2xl py-4 text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: 15, background: "var(--btn-gradient)" }}
            >
              {applied === "loading" ? "신청 중…" : isLoggedIn ? "캠페인 신청하기" : "로그인하고 신청하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignSidebar({
  activeCategory, onCategory, activeBenefit, onBenefit, sort, onSort, count,
}: {
  activeCategory: string; onCategory: (c: string) => void;
  activeBenefit: string; onBenefit: (b: string) => void;
  sort: "latest" | "deadline" | "fit"; onSort: (s: "latest" | "deadline" | "fit") => void;
  count: number;
}) {
  return (
    <aside className="hidden lg:block shrink-0 w-56">
      <div className="sticky top-24 space-y-4">
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

export function CampaignsPage({
  onNavigate,
  isLoggedIn,
  onLogin,
}: {
  onNavigate: (p: Page) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const filtered = CAMPAIGNS.filter((c) => {
    const catMatch = activeCategory === "전체" || c.category === activeCategory;
    const q = search.trim().toLowerCase();
    const searchMatch = !q ||
      c.brand.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.benefit.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  return (
    <main className="relative w-full bg-white">

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-6">
        {/* 타이틀 */}
        <h1 className="text-neutral-950 font-bold" style={{ fontSize: 20, letterSpacing: "-0.02em" }}>
          진행 중인 캠페인
        </h1>
        <p className="mt-1 text-neutral-500" style={{ fontSize: 14 }}>
          채널과 잘 어울리는 브랜드를 찾아보세요
        </p>

        {/* 검색 */}
        <div className="mt-5 relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            width="16" height="16" viewBox="0 0 20 20" fill="none"
          >
            <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="관심 있는 브랜드나 키워드를 검색하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-neutral-800 outline-none transition-all focus:border-[var(--cp)]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(var(--cp-rgb),0.08)]"
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

        {/* 카테고리 탭 */}
        <div className="relative mt-3">
          <div
            className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 transition-all duration-200 ${
                    active
                      ? "text-white shadow-sm"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-[var(--cp)]/30 hover:text-[var(--cp)]"
                  }`}
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    background: active ? "var(--btn-gradient)" : undefined,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
        </div>

        {/* 결과 수 */}
        <p className="mt-5 text-neutral-500" style={{ fontSize: 14 }}>
          총 <strong className="text-neutral-900">{filtered.length}</strong>개의 캠페인
        </p>

        {/* 카드 그리드 */}
        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-100 bg-neutral-50">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <circle cx="8.5" cy="8.5" r="5.75" stroke="#D1D5DB" strokeWidth="1.6"/>
                  <path d="M13 13l3.5 3.5" stroke="#D1D5DB" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="mt-4 font-bold text-neutral-950" style={{ fontSize: 16 }}>검색 결과가 없습니다</p>
              <p className="mt-2 text-neutral-400" style={{ fontSize: 14 }}>다른 검색어나 카테고리를 시도해보세요</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("전체"); }}
                className="mt-4 rounded-full border border-neutral-200 bg-white px-5 py-2 text-neutral-600 transition-all hover:border-neutral-300"
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                전체 보기
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c, i) => (
                <CardReveal key={c.id} delay={i * 60} className="h-full">
                  <CampaignCard
                    c={c}
                    isLoggedIn={isLoggedIn}
                    onLogin={onLogin}
                    onCardClick={() => setSelectedCampaign(c)}
                  />
                </CardReveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCampaign && (
        <CampaignDetailModal
          c={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          isLoggedIn={isLoggedIn}
          onLogin={onLogin}
        />
      )}
    </main>
  );
}
