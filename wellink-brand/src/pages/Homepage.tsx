// UNUSED: 현재 미사용 파일. 필요 시 App.tsx에 라우트 등록
import React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, Users, MapPin, Trophy, Star, Menu, X } from 'lucide-react'
import { CtaLink } from '../landing/components/CtaLink'
import { getLandingConfig } from '../landing/config/landing'
import { cn } from '../landing/lib/classnames'
import { ExpertPoolSection } from '../landing/sections/ExpertPoolSection'
import { FooterCTA } from '../landing/sections/FooterCTA'
import { HeroSection } from '../landing/sections/HeroSection'
import { ROASSection } from '../landing/sections/ROASSection'
import type { NavItem } from '../landing/types/landing'

const roasData = [
  { name: '가짜 팔로워 (타 매체)', value: 60, color: '#D1D5DB' },
  { name: '진성 유저 (웰링크)', value: 85, color: '#BFF264' },
]

const NAV_ITEMS: NavItem[] = [
  { label: '서비스 소개', href: '#service-intro' },
  { label: '전문가 풀', href: '#expert-pool' },
  { label: '성공 사례', href: '#success-case' },
]

export default function Homepage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const shouldReduceMotion = useReducedMotion()
  const mobileMenuRef = React.useRef<HTMLDivElement | null>(null)
  const menuButtonRef = React.useRef<HTMLButtonElement | null>(null)

  const landingConfig = React.useMemo(() => getLandingConfig(), [])

  const hoverScaleSubtle = shouldReduceMotion ? undefined : { scale: 1.02 }
  const hoverLiftCard = shouldReduceMotion ? undefined : { y: -10 }
  const hoverScaleCard = shouldReduceMotion ? undefined : { scale: 1.01 }

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  React.useEffect(() => {
    if (!isMenuOpen) return
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleEsc)
    mobileMenuRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isMenuOpen])

  return (
    <div id="top" className="min-h-screen bg-white font-sans text-slate-900 selection:bg-lime-200">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-white px-3 py-2 font-semibold text-[#0A3622] focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        본문으로 건너뛰기
      </a>

      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-2xl font-black tracking-tighter text-[#0A3622]">
            WELLINK
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0A3622] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A3622]"
              >
                {item.label}
              </a>
            ))}
            <CtaLink
              href={landingConfig.contactUrl}
              ctaLabel="상담 신청"
              ctaLocation="header_desktop"
              ctaId="header_desktop_consult"
              className="rounded-full bg-[#BFF264] px-6 py-2 text-sm font-bold text-[#0A3622] transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A3622]"
            >
              상담 신청
            </CtaLink>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            className="md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-controls="mobile-navigation-menu"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? '모바일 메뉴 닫기' : '모바일 메뉴 열기'}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-navigation-menu"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          className="fixed inset-0 z-40 bg-white pt-20 md:hidden"
        >
          <h2 id="mobile-menu-title" className="sr-only">모바일 메뉴</h2>
          <div className="flex flex-col items-center gap-6 p-6">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <CtaLink
              href={landingConfig.contactUrl}
              ctaLabel="상담 신청"
              ctaLocation="header_mobile"
              ctaId="header_mobile_consult"
              className="w-full rounded-full bg-[#BFF264] py-4 text-center text-lg font-bold text-[#0A3622]"
              onClick={() => setIsMenuOpen(false)}
            >
              상담 신청
            </CtaLink>
          </div>
        </div>
      )}

      <main id="main-content">
        <HeroSection shouldReduceMotion={Boolean(shouldReduceMotion)} contactUrl={landingConfig.contactUrl} />

        <section id="service-intro" className="scroll-mt-28 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 @lg:grid-cols-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { src: 'https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=900&auto=format&fit=crop', alt: '기구 필라테스 수업' },
                  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop', alt: 'Gym' },
                  { src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900&auto=format&fit=crop', alt: 'Lifting' },
                  { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900&auto=format&fit=crop', alt: 'Pilates' },
                ].map((image) => (
                  <motion.div key={image.alt} whileHover={hoverScaleSubtle} className="h-52 overflow-hidden rounded-3xl md:h-56">
                    <img src={image.src} className="h-full w-full object-cover" alt={image.alt} referrerPolicy="no-referrer" loading="lazy" decoding="async" width={900} height={900} />
                  </motion.div>
                ))}
              </div>
              <div>
                <span className="mb-4 block text-sm font-bold tracking-wider text-[#0A3622] uppercase">01. Various Categories</span>
                <h2 className="mb-6 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  헬스, 크로스핏은 물론<br />요가, 필라테스, 바레까지.<br />
                  <span className="text-[#0A3622]">다양한 종목을 직접 골라보세요.</span>
                </h2>
                <p className="mb-10 text-lg text-slate-600">어떤 종목의 타겟을 원하든 준비되어 있습니다. 브랜드의 성격에 딱 맞는 세부 카테고리별 전문가 매칭을 지원합니다.</p>
                <div className="flex flex-wrap gap-2">
                  {['#헬스', '#크로스핏', '#요가', '#필라테스', '#바레', '#러닝'].map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ExpertPoolSection shouldReduceMotion={Boolean(shouldReduceMotion)} />
        <ROASSection data={roasData} />

        <section className="bg-[#111827] py-24 text-white md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 @lg:grid-cols-2">
              <div>
                <span className="mb-4 inline-block rounded-full bg-lime-400/10 px-3 py-1 text-xs font-bold tracking-wider text-[#BFF264] uppercase">04. Operation Automation</span>
                <h2 className="mb-6 text-3xl font-black leading-tight md:text-5xl">
                  모집부터 보고서까지<br /><span className="text-[#BFF264]">단 10분.</span><br />수동 업무에서 해방되세요.
                </h2>
                <p className="mb-10 text-lg text-white/60">수동 리스트업과 엑셀 작업은 이제 과거의 일입니다. 캠페인 운영 전 과정을 자동화하여 마케팅 리소스를 <span className="font-bold text-white">90% 이상</span> 절감해 드립니다.</p>
                <ul className="space-y-4">
                  {['원클릭 인플루언서 모집', '실시간 콘텐츠 검수 시스템', '자동 성과 대시보드 생성'].map((item) => (
                    <li key={item} className="flex items-center gap-3 font-bold">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#BFF264] text-[#0A3622]"><CheckCircle2 size={16} /></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Dashboard Pro</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/5 p-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Total Reach</div>
                      <div className="text-2xl font-black text-[#BFF264]">1.4M+</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Campaign ROI</div>
                      <div className="text-2xl font-black text-[#BFF264]">348%</div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    {[0.8, 0.6, 0.9].map((w, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded bg-white/10" />
                        <div className="h-2 flex-1 rounded-full bg-white/10">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${w * 100}%` }} className="h-full rounded-full bg-[#BFF264]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="mb-4 block text-sm font-bold tracking-wider text-[#0A3622] uppercase">05. Multi-Layer Pool</span>
            <h2 className="mb-16 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
              개인을 넘어 오프라인 공간과<br />커뮤니티까지 연결하는 웰링크만의 차별점
            </h2>
            <div className="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-4">
              {[
                { icon: Star, label: '1:1 Targeted', title: '개인 인플루언서', desc: '트레이너, 운동 선수, 신뢰도 높은 피트니스/웰니스 전문 크리에이터.' },
                { icon: Users, label: 'Community Power', title: '운동 크루', desc: '러닝 크루, 동호회 등 강력한 팬덤 커뮤니티.' },
                { icon: MapPin, label: 'Offline Experience', title: '피트니스/웰니스 센터', desc: '공간 및 체험 제공을 통해 생생한 경험을 확산하는 피트니스 센터.' },
                { icon: Trophy, label: 'Mass Exposure', title: '행사/이벤트', desc: '대회, 세미나 등 대형 오프라인 이벤트 스폰서십 연결.' },
              ].map((item) => (
                <motion.div key={item.title} whileHover={hoverLiftCard} className="rounded-[2rem] border border-slate-100 bg-white p-8 text-left shadow-sm transition-shadow hover:shadow-xl">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-[#0A3622]"><item.icon size={28} /></div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
                  <h3 className="mb-4 text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="mb-4 text-3xl font-black text-slate-900 md:text-5xl">마케터의 고민,</h2>
            <h2 className="mb-8 text-3xl font-black text-[#0A3622] md:text-5xl">웰링크가 해결해 드립니다.</h2>
            <p className="mb-16 text-slate-500">실제 필드에서 활동하는 마케터들의 가장 큰 고충을 정확히 타겟팅합니다.</p>
            <div className="grid gap-8 @lg:grid-cols-2">
              {[
                { id: 'P1', role: '브랜드 매니저', problem: '"우리 브랜드의 전문성을 이해하는 진짜 파트너를 찾기 힘들어요."', value: '검증된 인플루언서 DB: 정성·정량 스코어링을 통해 브랜드 핏이 완벽한 전문가 매칭', color: 'bg-emerald-50' },
                { id: 'P2', role: '인플루언서 마케팅 담당자', problem: '"매번 파편화된 커뮤니케이션과 운영에 리소스가 너무 많이 들어요."', value: '운영의 표준(SOP): 모집부터 콘텐츠 검수까지 표준화된 프로세스로 운영 업무 자동화', color: 'bg-blue-50' },
                { id: 'P3', role: '웰니스 스타트업', problem: '"유저 획득 단가(CAC)를 낮추고 지속 가능한 자산을 만들고 싶어요."', value: '콘텐츠 자산화: 광고 소재로 즉시 활용 가능한 고품질 UGC 및 재사용권 확보 프로세스', color: 'bg-purple-50' },
                { id: 'P4', role: '퍼포먼스 마케터', problem: '"단순 도달은 높은데, 실제 매출(ROAS)로 증명되나요?"', value: '데이터 어트리뷰션: UTM 및 전용 쿠폰 코드를 통한 실시간 전환 추적 및 성과 리포트', color: 'bg-orange-50' },
              ].map((item) => (
                <motion.div key={item.id} whileHover={hoverScaleCard} className="flex overflow-hidden rounded-[2.5rem] bg-white shadow-sm">
                  <div className={cn('flex w-1/3 flex-col items-center justify-center p-8', item.color)}>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white font-black text-[#0A3622] shadow-sm">{item.id}</div>
                    <div className="text-center font-black text-slate-900">{item.role}</div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-8 text-left">
                    <div className="mb-6">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full border border-red-400 text-[8px]">!</div>
                        Problem
                      </div>
                      <div className="text-lg font-black leading-tight text-slate-900">{item.problem}</div>
                    </div>
                    <div className="mb-6 h-px w-full bg-slate-100" />
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        <CheckCircle2 size={12} />Value
                      </div>
                      <div className="text-sm font-medium text-slate-600">{item.value}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0A3622] py-24 text-white md:py-32">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
            <span className="mb-4 block text-sm font-bold tracking-wider text-[#BFF264] uppercase">Standard Operating Procedure</span>
            <h2 className="mb-16 text-3xl font-black leading-tight md:text-5xl">
              피트니스 마케팅의<br /><span className="text-[#BFF264]">체계적인 성과 창출 프로세스</span>
            </h2>
            <p className="mx-auto mb-20 max-w-2xl text-white/60">우리는 운에 맡기지 않습니다. 데이터와 표준화된 프로세스로 성공할 수밖에 없는 캠페인을 설계합니다.</p>
            <div className="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-4">
              {[
                { step: '01', title: '설계', desc: '브랜드 목표와 타겟에 최적화된 캠페인 전략 수립' },
                { step: '02', title: '매칭', desc: '5만 명의 리스트 중 브랜드 핏이 완벽한 전문가 선정' },
                { step: '03', title: '운영', desc: '콘텐츠 가이드부터 검수까지 표준화된 프로세스 진행' },
                { step: '04', title: '리포트', desc: '실시간 전환 추적 및 ROI 중심의 성과 보고서 제공' },
              ].map((item, i) => (
                <div key={item.step} className="group relative">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#BFF264] text-3xl font-black text-[#0A3622] transition-transform group-hover:scale-110">{item.step}</div>
                  </div>
                  <h3 className="mb-4 text-2xl font-black">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{item.desc}</p>
                  {i < 3 && <div className="absolute right-0 top-12 hidden h-px w-1/2 bg-white/10 @lg:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <FooterCTA
        contactUrl={landingConfig.contactUrl}
        termsUrl={landingConfig.termsUrl}
        privacyUrl={landingConfig.privacyUrl}
        inquiryUrl={landingConfig.inquiryUrl}
      />
    </div>
  )
}
