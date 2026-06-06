import { useState } from "react";

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login" | "pricing";

const PAGE_MAP: Record<string, Page> = {
  "광고주 서비스": "advertiser",
  "인플루언서 서비스": "influencer",
  "진행 중인 캠페인": "campaigns",
  "가격 정보": "pricing",
};

export function Footer({ onNavigate }: { onNavigate?: (p: Page) => void }) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const cols = [
    {
      title: "서비스",
      items: ["광고주 서비스", "인플루언서 서비스", "진행 중인 캠페인", "가격 정보", "자주 묻는 질문"],
    },
    {
      title: "회사",
      items: ["이용약관", "개인정보처리방침", "고객센터", "채용 정보", "블로그"],
    },
    {
      title: "팔로우하기",
      items: ["페이스북", "인스타그램", "링크드인", "유튜브"],
    },
  ];

  return (
    <footer className="relative overflow-hidden text-white" style={{ background: "linear-gradient(180deg,#0F1E2E 0%,#060A11 100%)" }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center">
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.02em" }}>
                WELLINK
              </span>
            </div>
            <p className="mt-6 max-w-xs text-white/60" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
              웰링크의 최신 소식과 업데이트를 받아보세요.
            </p>
            {subscribed ? (
              <div className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3">
                <span className="text-[var(--cl)]">✓</span>
                <span className="text-white/70" style={{ fontSize: 14, fontWeight: 500 }}>구독해 주셔서 감사합니다!</span>
              </div>
            ) : (
              <div className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur">
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  aria-label="이메일 입력"
                  placeholder="이메일 입력"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-2 text-white placeholder:text-white/40 focus:outline-none"
                  style={{ fontSize: 14 }}
                />
                <button
                  onClick={() => email.trim() && setSubscribed(true)}
                  disabled={!email.trim()}
                  className="rounded-full px-5 py-2 text-white whitespace-nowrap shrink-0 transition-all active:scale-[0.96] active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    background: "linear-gradient(135deg,var(--cp),var(--cs))",
                  }}
                >
                  구독
                </button>
              </div>
            )}
            <p className="mt-3 max-w-sm text-white/40" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.7 }}>
              구독하면 개인정보처리방침에 동의하며 회사로부터 업데이트를 받기로 동의합니다.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-white" style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.items.map((it) => (
                  <li key={it}>
                    <a
                      className="cursor-pointer text-white/55 transition hover:text-white"
                      style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.8 }}
                      onClick={() => PAGE_MAP[it] && onNavigate?.(PAGE_MAP[it])}
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 text-white/40 sm:flex-row sm:items-center sm:justify-between" style={{ fontSize: 14, fontWeight: 500 }}>
            <span>© 2026 웰링크. 모든 권리 보유.</span>
            <div className="flex flex-wrap gap-6">
              <a className="cursor-pointer hover:text-white">개인정보처리방침</a>
              <a className="cursor-pointer hover:text-white">이용약관</a>
              <a className="cursor-pointer hover:text-white">쿠키 설정</a>
            </div>
          </div>
          <p className="mt-4 text-white/25" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.8 }}>
            (주)웰링크 · 대표자: 홍길동 · 사업자등록번호: 000-00-00000<br />
            주소: 서울특별시 강남구 테헤란로 123, 4층 · 고객센터: 1588-0000 (평일 10:00–18:00)<br />
            통신판매업신고: 제2026-서울강남-0000호 · 이메일: hello@wellink.kr
          </p>
        </div>
      </div>
    </footer>
  );
}
