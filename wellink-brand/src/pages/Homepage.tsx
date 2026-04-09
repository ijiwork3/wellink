import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  Coins,
  ShieldCheck,
  Clock,
  User,
  Users,
  Building2,
  CalendarDays,
  ChevronDown,
  Sparkles,
  FileText,
  Target,
  Upload,
  Wallet,
  ArrowRight,
} from 'lucide-react'

/* ────────────────────────────────────────────
   Intersection Observer hook (fade-in on scroll)
   ──────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

/* ────────────────────────────────────────────
   Count-up animation hook
   ──────────────────────────────────────────── */
function useCountUp(target: number, duration = 1600, start = false, suffix = '') {
  const [display, setDisplay] = useState(`0${suffix}`)

  useEffect(() => {
    if (!start) return
    let raf: number
    const t0 = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = Math.round(eased * target)
      setDisplay(`${current.toLocaleString()}${suffix}`)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration, suffix])

  return display
}

/* ────────────────────────────────────────────
   Data
   ──────────────────────────────────────────── */
const uspCards = [
  {
    icon: Coins,
    title: '700원의 힘',
    desc: '인플루언서 1인당 획득 비용 700원.\n범용 플랫폼의 체리피커 대신, 진짜 웰니스 팬을 만나세요.',
  },
  {
    icon: ShieldCheck,
    title: '진성 필터링',
    desc: '운동 안 하는 인플루언서는 거릅니다.\nAI Fit-Score가 콘텐츠 진정성과 브랜드 궁합을 검증합니다.',
  },
  {
    icon: Clock,
    title: '70% 업무 절감',
    desc: '매칭부터 정산까지 원스톱 자동화.\nPoC 3건에서 업무시간 70% 절감을 실증했습니다.',
  },
]

const influencerTypes = [
  {
    icon: User,
    title: '개인 인플루언서',
    desc: '피트니스, 요가, 헬시 라이프.\n개인의 진정성이 브랜드 신뢰로 이어집니다.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Users,
    title: '크루 . 커뮤니티',
    desc: '러닝크루, 요가 모임, 피트니스 그룹.\n커뮤니티의 결속력이 바이럴의 시작점입니다.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Building2,
    title: '센터 . 스튜디오',
    desc: '필라테스, 크로스핏, PT 센터.\nO2O 체험과 리뷰가 동시에 이루어집니다.',
    gradient: 'from-orange-400 to-rose-500',
  },
  {
    icon: CalendarDays,
    title: '행사 . 이벤트',
    desc: '마라톤, 피트니스 엑스포, 웰니스 페스티벌.\n대규모 노출이 필요할 때의 최적 채널입니다.',
    gradient: 'from-violet-500 to-purple-600',
  },
]

const processSteps = [
  { icon: FileText, num: 1, title: 'AI 포트폴리오', desc: '가입만 하면 AI가 자동으로 포트폴리오를 생성합니다' },
  { icon: Target, num: 2, title: '맞춤 캠페인', desc: 'Fit-Score 기반으로 나와 맞는 캠페인만 추천받습니다' },
  { icon: Upload, num: 3, title: '콘텐츠 등록', desc: '촬영 → 업로드 → 자동 검수, 최소한의 단계로 완료' },
  { icon: Wallet, num: 4, title: '자동 수익 정산', desc: '캠페인 종료 후 자동 정산, 별도 청구 절차 없음' },
]

const plans = [
  {
    name: 'Focus',
    price: '99,000',
    unit: '원/월',
    tag: null,
    desc: '인플루언서 매칭 기본 지원',
    features: [
      '기본 인플루언서 DB 접근 (5,000명)',
      '월별 프로모션 참여',
      '기본 분석 리포트 제공',
    ],
    style: 'white' as const,
  },
  {
    name: 'Scale',
    price: '299,000',
    unit: '원/월',
    tag: '추천',
    desc: 'AI 기반 성과 분석 + 우선 매칭',
    features: [
      '50,000명+ 인플루언서 DB 접근',
      'AI 기반 성과 예측 . 분석',
      '우선 인플루언서 매칭',
      '커스텀 대시보드',
      '우선 지원',
    ],
    style: 'green' as const,
  },
  {
    name: 'Infinite',
    price: '커스텀',
    unit: '',
    tag: null,
    desc: '글로벌 엔터프라이즈 맞춤형',
    features: [
      '무제한 인플루언서 DB',
      '전담 전문가 배정',
      '실시간 전략 컨설팅',
      '글로벌 솔루션',
      '우선 기술 지원',
    ],
    style: 'dark' as const,
  },
]

const faqs = [
  {
    q: '인플루언서 DB는 얼마나 되나요?',
    a: '웰니스/피트니스 분야 5만 명 이상의 진성 인플루언서가 등록되어 있습니다.',
  },
  {
    q: 'AI Fit-Score가 뭔가요?',
    a: '브랜드와 인플루언서의 콘텐츠 성향, 팔로워 특성, 과거 캠페인 성과를 종합 분석해 최적 매칭 점수를 제공합니다.',
  },
  {
    q: '비용은 어떻게 되나요?',
    a: 'Focus 플랜은 월 99,000원부터 시작합니다. 매칭 건당 1~5만원, SaaS 월 20~50만원, 커미션 3%로 구성됩니다.',
  },
  {
    q: '기존 대행사와 뭐가 다른가요?',
    a: '대행사 대비 1/10 수준의 비용으로, 데이터 기반 매칭과 자동화된 운영을 제공합니다.',
  },
]

const NAV_LINKS = [
  { label: '광고주', target: 'usp' },
  { label: '인플루언서', target: 'influencer-hero' },
  { label: '요금제', target: 'pricing' },
  { label: 'FAQ', target: 'faq' },
]

/* ────────────────────────────────────────────
   Homepage Component
   ──────────────────────────────────────────── */
export default function Homepage() {
  const navigate = useNavigate()

  /* GNB scroll state */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* smooth scroll helper */
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  /* hero count-up */
  const heroObs = useInView(0.3)
  const ctr = useCountUp(20, 1400, heroObs.inView, '%')
  const cpa = useCountUp(700, 1400, heroObs.inView, '원')
  const save = useCountUp(70, 1400, heroObs.inView, '%')

  /* section observers */
  const uspObs = useInView()
  const typesObs = useInView()
  const inflHeroObs = useInView()
  const processObs = useInView()
  const pricingObs = useInView()
  const faqObs = useInView()
  const ctaObs = useInView()

  /* FAQ accordion */
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  /* mobile nav toggle */
  const [mobileNav, setMobileNav] = useState(false)

  /* ── render ── */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-gray-900">
      {/* ===== GNB ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-1.5">
            <span className={`text-base font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              WELLINK
            </span>
            <span className="bg-[#8CC63F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">
              AI
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button
                key={l.target}
                onClick={() => scrollTo(l.target)}
                className={`text-sm font-medium transition-colors hover:text-[#8CC63F] ${
                  scrolled ? 'text-gray-700' : 'text-white/80'
                }`}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => navigate('/login')}
              aria-label="로그인 페이지로 이동"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              로그인
            </button>
            <button
              onClick={() => navigate('/login')}
              aria-label="무료로 시작하기 — 로그인 페이지로 이동"
              className="bg-[#8CC63F] hover:bg-[#7AB832] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              무료로 시작하기
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1 p-2"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label={mobileNav ? '메뉴 닫기' : '메뉴 열기'}
          >
            <span className={`block w-5 h-0.5 rounded transition-all ${scrolled ? 'bg-gray-900' : 'bg-white'} ${mobileNav ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`block w-5 h-0.5 rounded transition-all ${scrolled ? 'bg-gray-900' : 'bg-white'} ${mobileNav ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 rounded transition-all ${scrolled ? 'bg-gray-900' : 'bg-white'} ${mobileNav ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileNav && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-4 pt-2 shadow-lg">
            {NAV_LINKS.map(l => (
              <button
                key={l.target}
                onClick={() => { scrollTo(l.target); setMobileNav(false) }}
                className="block w-full text-left py-2.5 text-sm font-medium text-gray-700 hover:text-[#8CC63F]"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { navigate('/login'); setMobileNav(false) }}
              className="mt-2 w-full text-sm text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              로그인
            </button>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 w-full bg-[#8CC63F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              무료로 시작하기
            </button>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section
        id="hero"
        ref={heroObs.ref}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        }}
      >
        {/* Green glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 800,
            height: 800,
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -30%)',
            background: 'radial-gradient(circle, rgba(140,198,63,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Secondary glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500,
            height: 500,
            bottom: '10%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(140,198,63,0.06) 0%, transparent 70%)',
          }}
        />

        <div className={`relative z-10 max-w-3xl mx-auto text-center px-6 transition-all duration-700 ${heroObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={14} className="text-[#8CC63F]" />
            <span className="text-xs text-white/70 font-medium">웰니스 . 피트니스 특화 인플루언서 마케팅</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            광고비 낭비 없이,
            <br />
            <span className="text-[#8CC63F]">AI</span>가 증명하는 진짜 성과
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
            웰니스 . 피트니스 특화 5만 명 진성 인플루언서 DB
            <br />
            AI Fit-Score 매칭으로 CTR 20%, 획득비용 700원 달성
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="group bg-[#8CC63F] hover:bg-[#7AB832] text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#8CC63F]/20 flex items-center gap-2"
            >
              무료로 시작하기
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => scrollTo('usp')}
              className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-xl text-sm transition-all"
            >
              서비스 둘러보기
            </button>
          </div>

          {/* Stat badges */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { value: ctr, label: 'CTR' },
              { value: cpa, label: '획득비용' },
              { value: save, label: '업무 절감' },
            ].map(s => (
              <div
                key={s.label}
                className="bg-white/[0.07] backdrop-blur border border-white/10 rounded-2xl px-6 py-4 min-w-[130px]"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-[#8CC63F]">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={24} className="text-white/30" />
        </div>
      </section>

      {/* ===== USP 3 Cards ===== */}
      <section id="usp" className="py-24 bg-white">
        <div
          ref={uspObs.ref}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${uspObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-16">
            <div className="w-10 h-1 bg-[#8CC63F] rounded-full mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">왜 웰링크인가요?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {uspCards.map((c, i) => (
              <div
                key={c.title}
                className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-14 h-14 bg-[#8CC63F]/10 rounded-2xl flex items-center justify-center mb-6">
                  <c.icon size={26} className="text-[#8CC63F]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4 Influencer Types ===== */}
      <section id="types" className="py-24 bg-gray-900">
        <div
          ref={typesObs.ref}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${typesObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-16">
            <div className="w-10 h-1 bg-[#8CC63F] rounded-full mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">4가지 유형의 웰니스 인플루언서</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {influencerTypes.map((t, i) => (
              <div
                key={t.title}
                className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-700/80 transition-all duration-300 group cursor-pointer"
                style={{ transitionDelay: `${i * 80}ms` }}
                onClick={() => navigate('/login')}
              >
                {/* Placeholder image area */}
                <div className={`h-40 bg-gradient-to-br ${t.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <t.icon size={48} className="text-white/80 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{t.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Influencer Hero ===== */}
      <section id="influencer-hero" className="py-24 bg-[#FAFAFA]">
        <div
          ref={inflHeroObs.ref}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${inflHeroObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8CC63F]/10 rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={14} className="text-[#8CC63F]" />
                <span className="text-xs text-[#8CC63F] font-semibold">For Influencers</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                당신의 색깔을 가장
                <br />
                잘 이해하는 브랜드
              </h2>
              <p className="mt-5 text-base text-gray-600 leading-relaxed">
                AI가 당신의 콘텐츠를 분석해
                <br />
                진짜 맞는 브랜드만 연결합니다
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-8 bg-[#8CC63F] hover:bg-[#7AB832] text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#8CC63F]/20 flex items-center gap-2 group"
              >
                인플루언서로 시작하기
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Visual: 4 step preview cards */}
            <div className="relative flex items-center justify-center min-h-[380px]">
              {processSteps.map((s, i) => (
                <div
                  key={s.num}
                  className="absolute bg-white rounded-2xl shadow-lg border border-gray-100 p-5 w-56"
                  style={{
                    top: `${i * 55 + 10}px`,
                    left: `${i * 30 + 20}px`,
                    zIndex: processSteps.length - i,
                    transform: `rotate(${-2 + i * 1.5}deg)`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#8CC63F] rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{s.num}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{s.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Process 4 Steps ===== */}
      <section id="process" className="py-24 bg-white">
        <div
          ref={processObs.ref}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${processObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-16">
            <div className="w-10 h-1 bg-[#8CC63F] rounded-full mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">참여는 간단합니다</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200">
              <div className="absolute inset-y-0 left-0 bg-[#8CC63F] w-full" style={{ clipPath: 'inset(0 0 0 0)' }} />
            </div>

            {processSteps.map((s, i) => (
              <div key={s.num} className="relative text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Number circle */}
                <div className="relative z-10 w-20 h-20 bg-[#8CC63F] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#8CC63F]/20">
                  <s.icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="py-24 bg-white">
        <div
          ref={pricingObs.ref}
          className={`max-w-5xl mx-auto px-6 transition-all duration-700 ${pricingObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-16">
            <div className="w-10 h-1 bg-[#8CC63F] rounded-full mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">가장 합리적 가격으로 시작하세요</h2>
            <p className="mt-3 text-base text-gray-500">모든 플랜에 AI Fit-Score 매칭이 포함됩니다.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Focus */}
            {plans.filter(p => p.style === 'white').map(plan => (
              <div
                key={plan.name}
                className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col relative hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.unit}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check size={15} className="shrink-0 mt-0.5 text-[#8CC63F]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-[#8CC63F] text-white hover:bg-[#7AB535] transition-colors"
                >
                  시작하기
                </button>
              </div>
            ))}

            {/* Scale */}
            {plans.filter(p => p.style === 'green').map(plan => (
              <div
                key={plan.name}
                className="bg-[#8CC63F] rounded-2xl p-7 flex flex-col relative hover:shadow-lg transition-shadow duration-300"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-[#8CC63F] text-xs px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                    {plan.tag}
                  </span>
                </div>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-white/80 mt-1">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-white/80">{plan.unit}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/90">
                      <Check size={15} className="shrink-0 mt-0.5 text-white" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-[#8CC63F] hover:bg-white/90 transition-colors"
                >
                  시작하기
                </button>
              </div>
            ))}

            {/* Infinite */}
            {plans.filter(p => p.style === 'dark').map(plan => (
              <div
                key={plan.name}
                className="bg-gray-900 rounded-2xl p-7 flex flex-col relative hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <Check size={15} className="shrink-0 mt-0.5 text-[#8CC63F]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors"
                >
                  도입 문의하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 bg-[#FAFAFA]">
        <div
          ref={faqObs.ref}
          className={`max-w-3xl mx-auto px-6 transition-all duration-700 ${faqObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-16">
            <div className="w-10 h-1 bg-[#8CC63F] rounded-full mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">자주 묻는 질문</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">{f.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="py-20 bg-[#8CC63F]">
        <div
          ref={ctaObs.ref}
          className={`max-w-4xl mx-auto px-6 text-center transition-all duration-700 ${ctaObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">지금 바로 웰링크를 시작하세요</h2>
          <p className="mt-4 text-base text-white/80">3분이면 첫 캠페인을 만들 수 있습니다</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-[#8CC63F] hover:bg-white/90 font-semibold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-black/10"
            >
              광고주로 시작하기
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-xl text-sm transition-all"
            >
              인플루언서로 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Logo + info */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-base font-bold text-white tracking-tight">WELLINK</span>
                <span className="bg-[#8CC63F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">AI</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                (주)애프터액션 | 대표: 이영준 | 사업자등록번호: 000-00-00000
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => window.open('https://wellink.co.kr/terms', '_blank')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                이용약관
              </button>
              <button
                onClick={() => window.open('https://wellink.co.kr/privacy', '_blank')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                개인정보처리방침
              </button>
              <button
                onClick={() => window.open('mailto:help@wellink.co.kr')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                고객센터
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-600 text-center">&copy; 2026 WELLINK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
