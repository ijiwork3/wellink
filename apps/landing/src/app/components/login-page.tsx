import { useState } from "react";
import {
  ArrowRight, Building2, Check, CheckCircle, Eye, EyeOff,
  Info, Instagram, Lock, Mail, Phone, Shield, User,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
 * 원본 랜딩 로그인·회원가입 구조를 그대로 이식
 * 컬러: 블루(#2563EB) + 에메랄드(#10B981) 단일 팔레트
 * - 인플루언서 accent → var(--cp) / 블루 계열
 * - 광고주 accent     → var(--cs) / 에메랄드 계열
 * ──────────────────────────────────────────────────────────── */

type Page = "main" | "advertiser" | "influencer" | "campaigns" | "login" | "pricing";
type UserType = "influencer" | "advertiser";
type AuthView = "login" | "register-gateway" | "register-influencer" | "register-company";

const LAST_LOGIN_KEY = "last_login_account";

/** 사업자등록번호 000-00-00000 포맷 (원본 packages/utils/utils.ts:188 동일) */
function formatBusinessNumber(value: string): string {
  return value
    .replace(/[^0-9]/g, "")
    .slice(0, 10)
    .replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
}

/* ═══════════════════════════════════════════════════
 * 공통 배경 + 상단 내비 래퍼
 * ═══════════════════════════════════════════════════ */
function AuthShell({
  children,
  onNavigate,
}: {
  children: React.ReactNode;
  onNavigate: (p: Page) => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-start justify-center sm:items-center p-4 relative overflow-hidden bg-zinc-50">
      {/* 배경 블러 */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]"
          style={{ background: "rgba(var(--cp-rgb), 0.12)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]"
          style={{ background: "rgba(var(--cs-rgb), 0.12)" }}
        />
      </div>

      {/* 상단 내비 */}
      <nav className="absolute top-0 left-0 right-0 z-50 py-5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            onClick={() => onNavigate("main")}
            className="text-2xl font-bold cursor-pointer transition-opacity hover:opacity-75 text-neutral-950"
            style={{ letterSpacing: "0.02em" }}
          >
            WELLINK
            <span
              style={{
                background: "linear-gradient(135deg, var(--cp), 70%, var(--cs))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              .AI
            </span>
          </button>

          {/* 도입문의 CTA (원본 동일) */}
          <button
            type="button"
            className="px-3 sm:px-6 py-2 text-white font-bold rounded-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--cp), 70%, var(--cs))",
              boxShadow: "0 12px 30px rgba(var(--cp-rgb), 0.25)",
            }}
          >
            도입문의
          </button>
        </div>
      </nav>

      {/* 콘텐츠 */}
      <div className="relative z-10 w-full pt-24 pb-12 sm:py-0">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * 1. 로그인 폼 (원본 AuthForm.tsx)
 * ═══════════════════════════════════════════════════ */
function AuthForm({
  onNavigate,
  onLoginSuccess,
  onGoRegister,
}: {
  onNavigate: (p: Page) => void;
  onLoginSuccess: (ut: UserType) => void;
  onGoRegister: () => void;
}) {
  type LoginMethod = "influencer" | "company";
  const [userType, setUserType] = useState<LoginMethod>(() => {
    const saved = localStorage.getItem(LAST_LOGIN_KEY);
    return saved === "company" ? "company" : "influencer";
  });
  const [influencerForm, setInfluencerForm] = useState({ email: "", password: "" });
  const [companyForm, setCompanyForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [lastLoginMethod] = useState<LoginMethod | null>(() => {
    const v = localStorage.getItem(LAST_LOGIN_KEY);
    return v === "influencer" || v === "company" ? v : null;
  });

  const currentForm = userType === "influencer" ? influencerForm : companyForm;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (userType === "influencer") setInfluencerForm((p) => ({ ...p, [name]: value }));
    else setCompanyForm((p) => ({ ...p, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(LAST_LOGIN_KEY, userType);
    onLoginSuccess(userType === "company" ? "advertiser" : "influencer");
  };

  const lastLabel = lastLoginMethod === "influencer" ? "인플루언서" : lastLoginMethod === "company" ? "광고주" : null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 animate-[fadeInUp_0.5s_ease]"
        style={{
          background: "rgba(250,250,250,0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(228,228,231,0.50)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">환영합니다!</h2>
          <p className="text-sm text-zinc-500">서비스 이용을 위해 로그인해주세요.</p>
        </div>

        {/* 역할 토글 */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 rounded-xl">
            {(["influencer", "company"] as const).map((type) => {
              const active = userType === type;
              const isInfluencer = type === "influencer";
              const label = isInfluencer ? "인플루언서" : "광고주";
              const Icon = isInfluencer ? User : Building2;
              const tooltipTop = isInfluencer ? "-top-11" : "-top-10"; // 원본 AuthForm.tsx:207 vs 245
              return (
                <div key={type} className="relative">
                  {lastLoginMethod === type && (
                    <div className={`pointer-events-none absolute ${tooltipTop} left-1/2 z-10 -translate-x-1/2 whitespace-nowrap`}>
                      <div className="rounded-lg bg-zinc-900 px-3 py-2 text-[11px] font-medium text-white shadow-lg">
                        최근에는 {lastLabel}로 로그인했어요
                      </div>
                      <div className="mx-auto h-2 w-2 -translate-y-[4px] rotate-45 bg-zinc-900" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setUserType(type); setShowPassword(false); }}
                    className={`relative flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active ? "text-zinc-900 shadow-sm bg-white" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                      <Icon size={16} className="shrink-0" />
                      {label}
                      {lastLoginMethod === type && <Info size={13} className="text-zinc-400" />}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 폼 */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 mb-1.5 ml-1">
                {userType === "influencer" ? "인플루언서 이메일" : "광고주 아이디"}
              </label>
              <div className="relative">
                {userType === "influencer"
                  ? <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  : <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                }
                <input
                  type={userType === "influencer" ? "email" : "text"}
                  name="email"
                  value={currentForm.email}
                  onChange={handleChange}
                  placeholder={userType === "influencer" ? "influencer@email.com" : "company@example.com"}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-zinc-200 rounded-xl text-sm transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-[var(--cp)]"
                  style={{ "--tw-ring-color": "rgba(var(--cp-rgb), 0.5)" } as React.CSSProperties}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={currentForm.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/50 border border-zinc-200 rounded-xl text-sm transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-[var(--cp)]"
                  style={{ "--tw-ring-color": "rgba(var(--cp-rgb), 0.5)" } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, var(--cp), 70%, var(--cs))",
                boxShadow: "0 8px 20px -10px rgba(var(--cp-rgb),0.4)",
              }}
            >
              <span>로그인</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        {/* 하단 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">
            계정이 없으신가요?{" "}
            <button
              onClick={onGoRegister}
              className="font-semibold text-zinc-900 transition-colors underline decoration-2 underline-offset-2 hover:text-[var(--cp)]"
              style={{ textDecorationColor: "rgba(var(--cp-rgb), 0.5)" }}
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * 2. 회원가입 게이트웨이 (원본 register/page.tsx)
 * ═══════════════════════════════════════════════════ */
function RegisterGateway({
  onGoInfluencer,
  onGoCompany,
  onGoLogin,
}: {
  onGoInfluencer: () => void;
  onGoCompany: () => void;
  onGoLogin: () => void;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8 sm:mb-10 animate-[fadeInUp_0.4s_ease]">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2.5" style={{ wordBreak: "keep-all" }}>
          어떤 유형으로 가입하시겠습니까?
        </h1>
        <p className="text-zinc-600 text-sm sm:text-base">WELLINK AI와 함께 성장할 파트너를 찾고 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* 인플루언서 카드 */}
        <button
          onClick={onGoInfluencer}
          className="h-full bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all group flex flex-col items-center text-center cursor-pointer animate-[fadeInUp_0.5s_ease] hover:-translate-y-1"
          style={{ "--hover-border": "var(--cp)" } as React.CSSProperties}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(var(--cp-rgb), 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
        >
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 transition-colors"
            style={{ background: "rgba(var(--cp-rgb), 0.1)" }}
          >
            <User size={28} style={{ color: "var(--cp)" }} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">인플루언서</h3>
          <p className="text-zinc-500 text-sm sm:text-base mb-6 flex-1" style={{ wordBreak: "keep-all" }}>
            자신의 영향력을 증명하고 브랜드와 함께 성장하세요.
          </p>
          <div className="flex items-center gap-2 font-bold group-hover:gap-3 transition-all" style={{ color: "var(--cp)" }}>
            <span>가입하기</span>
            <ArrowRight size={20} />
          </div>
        </button>

        {/* 광고주 카드 */}
        <button
          onClick={onGoCompany}
          className="h-full bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all group flex flex-col items-center text-center cursor-pointer animate-[fadeInUp_0.6s_ease] hover:-translate-y-1"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(var(--cs-rgb), 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
        >
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 transition-colors"
            style={{ background: "rgba(var(--cs-rgb), 0.1)" }}
          >
            <Building2 size={28} style={{ color: "var(--cs)" }} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2">광고주</h3>
          <p className="text-zinc-500 text-sm sm:text-base mb-6 flex-1" style={{ wordBreak: "keep-all" }}>
            데이터 기반의 인플루언서 매칭으로 확실한 성과를 경험하세요.
          </p>
          <div className="flex items-center gap-2 font-bold group-hover:gap-3 transition-all" style={{ color: "var(--cs)" }}>
            <span>가입하기</span>
            <ArrowRight size={20} />
          </div>
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={onGoLogin}
            className="font-semibold text-zinc-900 transition-colors underline decoration-2 underline-offset-2 hover:text-[var(--cp)]"
            style={{ textDecorationColor: "rgba(var(--cp-rgb), 0.5)" }}
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * 3. 약관 동의 (원본 TermsAgreement.tsx)
 * ═══════════════════════════════════════════════════ */
function TermsAgreement({
  type,
  onAgree,
  onSwitchType,
}: {
  type: "influencer" | "company";
  onAgree: (marketingAgree: boolean) => void;
  onSwitchType: () => void;
}) {
  const [agreements, setAgreements] = useState({
    all: false, service: false, privacy: false, age: false, marketing: false,
  });

  const handleAllCheck = () => {
    const v = !agreements.all;
    setAgreements({ all: v, service: v, privacy: v, age: v, marketing: v });
  };
  const handleSingle = (key: keyof typeof agreements) => {
    if (key === "all") return;
    setAgreements((prev) => {
      const n = { ...prev, [key]: !prev[key] };
      return { ...n, all: n.service && n.privacy && n.marketing };
    });
  };

  const isReady = agreements.service && agreements.privacy && agreements.age;
  const isInf = type === "influencer";
  const accentVar = isInf ? "--cp" : "--cs";
  const accentRgb = isInf ? "--cp-rgb" : "--cs-rgb";

  const items: { key: keyof typeof agreements; label: string; required: boolean; detailLabel?: string }[] = [
    { key: "service", label: "서비스 이용약관 동의", required: true, detailLabel: "전체보기" },
    { key: "privacy", label: "개인정보 수집 및 이용 동의", required: true, detailLabel: "전체보기" },
    { key: "age", label: "본인은 만 14세 이상입니다.", required: true },
    { key: "marketing", label: "마케팅 정보 수신 동의", required: false, detailLabel: "전체보기" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto animate-[fadeInUp_0.4s_ease]">
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: "rgba(250,250,250,0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(228,228,231,0.50)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="p-3 rounded-2xl"
              style={{ background: `rgba(var(${accentRgb}), 0.1)`, color: `var(${accentVar})` }}
            >
              <Shield size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">약관 동의</h2>
          <p className="text-sm text-zinc-500">서비스 이용을 위해 필수 약관에 동의해주세요.</p>
        </div>

        {/* 전체 동의 */}
        <div className="space-y-4 mb-8">
          <button
            type="button"
            onClick={handleAllCheck}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all text-left ${
              agreements.all ? "" : "border-zinc-200 hover:border-zinc-300"
            }`}
            style={{
              background: agreements.all ? `rgba(var(${accentRgb}), 0.05)` : "white",
              borderColor: agreements.all ? `var(${accentVar})` : undefined,
            }}
          >
            <div
              className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
              style={{
                background: agreements.all ? `var(${accentVar})` : "white",
                borderColor: agreements.all ? `var(${accentVar})` : "#d4d4d8",
              }}
            >
              {agreements.all && <Check size={12} className="text-white" />}
            </div>
            <span className="font-bold text-zinc-900">전체 동의하기</span>
          </button>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.key} className="flex items-center justify-between group">
                <button
                  type="button"
                  onClick={() => handleSingle(item.key)}
                  className="flex items-center gap-3 cursor-pointer flex-1 text-left"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      agreements[item.key] ? "" : "border-zinc-300 group-hover:border-zinc-400"
                    }`}
                    style={{
                      background: agreements[item.key] ? `var(${accentVar})` : "white",
                      borderColor: agreements[item.key] ? `var(${accentVar})` : undefined,
                    }}
                  >
                    {agreements[item.key] && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-zinc-600">
                    <span className={item.required ? "text-red-500 mr-1" : "text-zinc-400 mr-1"}>
                      {item.required ? "(필수)" : "(선택)"}
                    </span>
                    {item.label}
                  </span>
                </button>
                {item.detailLabel && (
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-zinc-600 p-1 text-sm whitespace-nowrap"
                  >
                    {item.detailLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 다음 */}
        <button
          type="button"
          onClick={() => onAgree(agreements.marketing)}
          disabled={!isReady}
          className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
            isReady ? "text-white cursor-pointer hover:shadow-xl" : "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
          }`}
          style={isReady ? {
            background: "linear-gradient(135deg, var(--cp), 70%, var(--cs))",
          } : undefined}
        >
          <span>다음으로</span>
          <ArrowRight size={18} />
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">
            {isInf ? (
              <>크리에이터와 협업하고 싶은 브랜드라면?{" "}
                <button onClick={onSwitchType} className="font-bold text-zinc-900 hover:underline ml-1">
                  광고주 계정으로 가입하기
                </button>
              </>
            ) : (
              <>광고주와 협업하고 싶은 인플루언서라면?{" "}
                <button onClick={onSwitchType} className="font-bold text-zinc-900 hover:underline ml-1">
                  인플루언서 계정으로 가입하기
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * 4. 회원가입 폼 (원본 RegisterForm.tsx)
 * ═══════════════════════════════════════════════════ */
function RegisterForm({
  type,
  onComplete,
  onBack,
}: {
  type: "influencer" | "company";
  onComplete: () => void;
  onBack: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneVerificationRequested, setPhoneVerificationRequested] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", verificationCode: "",
    companyName: "", businessRegNumber: "",
    managerName: "", managerPhone: "",
    instagramAccount: "",
    activityField: [] as string[],
    type: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "managerPhone") {
      setPhoneVerificationRequested(false);
      setPhoneVerified(false);
      setFormData((p) => ({ ...p, [name]: value, verificationCode: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleRequestPhoneAuth = () => {
    setPhoneVerificationRequested(true);
    setPhoneVerified(false);
  };

  const handleVerifyPhone = () => {
    if (formData.verificationCode.length === 6) {
      setPhoneVerified(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  const isInf = type === "influencer";
  const accentVar = isInf ? "--cp" : "--cs";
  const accentRgb = isInf ? "--cp-rgb" : "--cs-rgb";

  const inputFocusStyle = {
    "--tw-ring-color": `rgba(var(${accentRgb}), 0.5)`,
  } as React.CSSProperties;

  const inputCls = `w-full pl-10 pr-4 py-3 bg-white/50 border border-zinc-200 rounded-xl text-sm transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-[var(${accentVar})]`;
  const inputPwCls = `w-full pl-10 pr-10 py-3 bg-white/50 border border-zinc-200 rounded-xl text-sm transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-[var(${accentVar})]`;

  return (
    <div className="w-full max-w-xl mx-auto animate-[fadeInUp_0.3s_ease]">
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: "rgba(250,250,250,0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(228,228,231,0.50)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl" style={{ background: `rgba(var(${accentRgb}), 0.1)`, color: `var(${accentVar})` }}>
              {isInf ? <User size={32} /> : <Building2 size={32} />}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            {isInf ? "인플루언서 회원가입" : "광고주 회원가입"}
          </h2>
          <p className="text-sm text-zinc-500">
            {isInf ? "당신의 영향력을 가치로 만들어보세요." : "최고의 인플루언서와 함께 성장하세요."}
          </p>
        </div>

        {/* 폼 */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isInf ? (
            /* ── 인플루언서 필드 ── */
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">이름</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동"
                    className={inputCls} style={inputFocusStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com"
                    className={inputCls} style={inputFocusStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                    className={inputPwCls} style={inputFocusStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">비밀번호 확인</label>
                <div className="relative">
                  <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                    className={inputPwCls} style={inputFocusStyle} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">전화번호</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000"
                      className={inputCls} style={inputFocusStyle} />
                  </div>
                  <button type="button" onClick={handleRequestPhoneAuth} disabled={!formData.phone.trim()}
                    className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                    인증요청
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">
                  인증번호 입력
                  {phoneVerified && <span className="ml-2 text-xs" style={{ color: "var(--cp)" }}>✓ 인증 완료</span>}
                </label>
                <div className="flex gap-2">
                  <input type="text" name="verificationCode" value={formData.verificationCode} onChange={handleChange} placeholder="인증번호 6자리" maxLength={6}
                    disabled={!phoneVerificationRequested || phoneVerified}
                    className="flex-1 px-4 py-3 bg-white/50 border border-zinc-200 rounded-xl text-sm transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={inputFocusStyle} />
                  <button type="button" onClick={handleVerifyPhone}
                    disabled={!phoneVerificationRequested || formData.verificationCode.length !== 6 || phoneVerified}
                    className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                    {phoneVerified ? "인증 완료" : "인증확인"}
                  </button>
                </div>
              </div>

              {/* 활동 타입 */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">활동 타입</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "personal", label: "개인 인플루언서" },
                    { id: "crew", label: "스포츠크루, 커뮤니티" },
                    { id: "center", label: "웰니스 피트니스 센터" },
                    { id: "event", label: "대회, 이벤트" },
                  ].map((opt) => (
                    <button key={opt.id} type="button"
                      onClick={() => setFormData((p) => ({ ...p, type: opt.label }))}
                      className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
                        formData.type === opt.label
                          ? "bg-zinc-900 text-white"
                          : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 인스타그램 */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">인스타그램 계정</label>
                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="text" name="instagramAccount" value={formData.instagramAccount} onChange={handleChange} placeholder="@instagram_id"
                    className={inputCls} style={inputFocusStyle} />
                </div>
              </div>

              {/* 활동 분야 */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">활동 분야(중복 선택 가능)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "fitness", label: "헬스·웨이트" },
                    { id: "running", label: "러닝" },
                    { id: "yoga", label: "요가" },
                    { id: "pilates", label: "필라테스" },
                    { id: "barre", label: "바레" },
                    { id: "crossfit", label: "크로스핏" },
                    { id: "hybrid", label: "하이록스(하이브리드 트레이닝)" },
                    { id: "f45", label: "F45" },
                    { id: "powerlifting", label: "파워리프팅" },
                    { id: "etc", label: "기타" },
                  ].map((field) => (
                    <label
                      key={field.id}
                      className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
                      style={{
                        background: formData.activityField.includes(field.label) ? `rgba(var(${accentRgb}), 0.05)` : "rgba(255,255,255,0.5)",
                        borderColor: formData.activityField.includes(field.label) ? `var(${accentVar})` : "#e4e4e7",
                      }}
                    >
                      <input
                        type="checkbox"
                        value={field.label}
                        checked={formData.activityField.includes(field.label)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFormData((p) => ({
                            ...p,
                            activityField: p.activityField.includes(v)
                              ? p.activityField.filter((x) => x !== v)
                              : [...p.activityField, v],
                          }));
                        }}
                        className="w-4 h-4 border-zinc-300 rounded"
                        style={{ accentColor: `var(${accentVar})` }}
                      />
                      <span className="text-xs font-medium text-zinc-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ── 광고주 필드 ── */
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">기업명</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="(주)웰링크"
                    className={inputCls} style={inputFocusStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">사업자등록번호</label>
                <div className="relative">
                  <input type="text" name="businessRegNumber" value={formatBusinessNumber(formData.businessRegNumber)} onChange={handleChange} placeholder="000-00-00000"
                    className="w-full px-4 py-3 bg-white/50 border border-zinc-200 rounded-xl text-sm transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-2"
                    style={inputFocusStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@example.com"
                    className={inputCls} style={inputFocusStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                    className={inputPwCls} style={inputFocusStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">비밀번호 확인</label>
                <div className="relative">
                  <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                    className={inputPwCls} style={inputFocusStyle} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">담당자 이름</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="text" name="managerName" value={formData.managerName} onChange={handleChange} placeholder="담당자명"
                    className={inputCls} style={inputFocusStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">담당자 전화번호</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input type="tel" name="managerPhone" value={formData.managerPhone} onChange={handleChange} placeholder="010-0000-0000"
                      className={inputCls} style={inputFocusStyle} />
                  </div>
                  <button type="button" onClick={handleRequestPhoneAuth} disabled={!formData.managerPhone.trim()}
                    className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                    인증요청
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 ml-1">
                  인증번호 입력
                  {phoneVerified && <span className="ml-2 text-xs" style={{ color: "var(--cs)" }}>✓ 인증 완료</span>}
                </label>
                <div className="flex gap-2">
                  <input type="text" name="verificationCode" value={formData.verificationCode} onChange={handleChange} placeholder="인증번호 6자리" maxLength={6}
                    disabled={!phoneVerificationRequested || phoneVerified}
                    className="flex-1 px-4 py-3 bg-white/50 border border-zinc-200 rounded-xl text-sm transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={inputFocusStyle} />
                  <button type="button" onClick={handleVerifyPhone}
                    disabled={!phoneVerificationRequested || formData.verificationCode.length !== 6 || phoneVerified}
                    className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                    {phoneVerified ? "인증 완료" : "인증확인"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 제출 */}
          <button
            type="submit"
            disabled={!phoneVerified}
            className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, var(--cp), 70%, var(--cs))",
            }}
          >
            <span>{!phoneVerified ? "휴대폰 인증 후 가입 가능" : "가입하기"}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* 뒤로 */}
        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-zinc-400 hover:text-zinc-600 transition-colors text-xs flex items-center justify-center gap-1 mx-auto">
            ← 유형 선택으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
 * 메인 export — App.tsx에서 호출하는 LoginPage
 * 내부 상태로 login / register-gateway / register-* 를 관리
 * ═══════════════════════════════════════════════════ */
export function LoginPage({
  onNavigate,
  onLoginSuccess,
}: {
  onNavigate: (p: Page) => void;
  onLoginSuccess?: (userType: UserType) => void;
}) {
  const [view, setView] = useState<AuthView>("login");
  const [registerType, setRegisterType] = useState<"influencer" | "company">("influencer");
  const [termsStep, setTermsStep] = useState<"terms" | "form">("terms");
  const [marketingAgree, setMarketingAgree] = useState(false);

  const handleLoginSuccess = (ut: UserType) => {
    if (onLoginSuccess) onLoginSuccess(ut);
    else onNavigate(ut === "advertiser" ? "advertiser" : "influencer");
  };

  const handleRegisterComplete = () => {
    // 데모: 가입 완료 → 로그인 화면으로
    setView("login");
    setTermsStep("terms");
  };

  const goRegisterType = (type: "influencer" | "company") => {
    setRegisterType(type);
    setTermsStep("terms");
    setView(type === "influencer" ? "register-influencer" : "register-company");
  };

  return (
    <AuthShell onNavigate={onNavigate}>
      {view === "login" && (
        <AuthForm
          onNavigate={onNavigate}
          onLoginSuccess={handleLoginSuccess}
          onGoRegister={() => setView("register-gateway")}
        />
      )}
      {view === "register-gateway" && (
        <RegisterGateway
          onGoInfluencer={() => goRegisterType("influencer")}
          onGoCompany={() => goRegisterType("company")}
          onGoLogin={() => setView("login")}
        />
      )}
      {(view === "register-influencer" || view === "register-company") && (
        termsStep === "terms" ? (
          <TermsAgreement
            type={registerType}
            onAgree={(ma) => { setMarketingAgree(ma); setTermsStep("form"); }}
            onSwitchType={() => goRegisterType(registerType === "influencer" ? "company" : "influencer")}
          />
        ) : (
          <RegisterForm
            type={registerType}
            onComplete={handleRegisterComplete}
            onBack={() => setView("register-gateway")}
          />
        )
      )}
    </AuthShell>
  );
}
