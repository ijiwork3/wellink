import { useState } from "react";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { MainPage } from "./components/main-page";
import { AdvertiserPage } from "./components/advertiser-page";
import { InfluencerPage } from "./components/influencer-page";
import { CampaignsPage } from "./components/campaign-page";
import { LoginPage } from "./components/login-page";
import { PricingPage } from "./components/pricing-page";

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login" | "pricing";
type UserType = "influencer" | "advertiser";
// 브라우저 스크롤 복원 끄기 — 새로고침 시 중간 위치로 점프하는 문제 방지
if (typeof window !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

export default function App() {
  const [page, setPage] = useState<Page>("main");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginReturnTo, setLoginReturnTo] = useState<Page | null>(null);

  const navigate = (p: Page) => {
    if (p === page) return;
    setPage(p);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  };

  const goToLogin = (returnTo?: Page) => {
    setLoginReturnTo(returnTo ?? null);
    setPage("login");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  };

  const handleLoginSuccess = (userType: UserType) => {
    setIsLoggedIn(true);
    const dest: Page = loginReturnTo ?? (userType === "advertiser" ? "advertiser" : "influencer");
    setLoginReturnTo(null);
    setPage(dest);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  };

  if (page === "login") {
    return (
      <div className="min-h-screen w-full bg-white" style={{ fontFamily: '"Inter", "Noto Sans KR", system-ui, sans-serif' }}>
        <LoginPage onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-white text-neutral-900"
      style={{ fontFamily: '"Inter", "Noto Sans KR", system-ui, sans-serif' }}
    >
      <Header current={page} onNavigate={navigate} isLoggedIn={isLoggedIn} />

      <div key={page} className="page-transition">
        {page === "main" && <MainPage onNavigate={navigate} />}
        {page === "advertiser" && <AdvertiserPage onNavigate={navigate} />}
        {page === "influencer" && <InfluencerPage onNavigate={navigate} />}
        {page === "campaigns" && (
          <CampaignsPage onNavigate={navigate} isLoggedIn={isLoggedIn} onLogin={() => goToLogin("campaigns")} />
        )}
        {page === "pricing" && <PricingPage onNavigate={navigate} />}
        <Footer onNavigate={navigate} />
      </div>

    </div>
  );
}
