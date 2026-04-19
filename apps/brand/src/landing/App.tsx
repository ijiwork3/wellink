/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Users, MapPin, Trophy, Star, Menu, X } from 'lucide-react';
import { CtaLink } from './components/CtaLink';
import { getLandingConfig } from './config/landing';
import { ExpertPoolSection } from './sections/ExpertPoolSection';
import { FooterCTA } from './sections/FooterCTA';
import { HeroSection } from './sections/HeroSection';
import { ROASSection } from './sections/ROASSection';
import { OperationSection } from './OperationSection';
import { PainPointSection } from './PainPointSection';
import { CHART_COLORS } from '@wellink/ui';
import type { NavItem } from './types/landing';

const roasData = [
  { name: '가짜 팔로워 (타 매체)', value: 60, color: CHART_COLORS.inactive },
  { name: '진성 유저 (웰링크)', value: 85, color: 'var(--color-landing-lime)' },
];

const NAV_ITEMS: NavItem[] = [
  { label: '서비스 소개', href: '#service-intro' },
  { label: '전문가 풀', href: '#expert-pool' },
  { label: '성공 사례', href: '#success-case' },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();
  const mobileMenuRef = React.useRef<HTMLDivElement | null>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const landingConfig = React.useMemo(() => getLandingConfig(), []);

  const hoverScaleSubtle = shouldReduceMotion ? undefined : { scale: 1.02 };
  const hoverLiftCard = shouldReduceMotion ? undefined : { y: -10 };
  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  React.useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleEsc);
    mobileMenuRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isMenuOpen]);

  return (
    <div id="top" className="min-h-screen bg-white font-sans text-slate-900 selection:bg-lime-200">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-white px-3 py-2 font-semibold text-[var(--color-landing-dark)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        본문으로 건너뛰기
      </a>

      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-2xl font-black tracking-tighter text-[var(--color-landing-dark)]">
            WELLINK
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--color-landing-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-landing-dark)]"
              >
                {item.label}
              </a>
            ))}
            <CtaLink
              href={landingConfig.contactUrl}
              ctaLabel="상담 신청"
              ctaLocation="header_desktop"
              ctaId="header_desktop_consult"
              className="rounded-full bg-[var(--color-landing-lime)] px-6 py-2 text-sm font-bold text-[var(--color-landing-dark)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-landing-dark)]"
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
          <h2 id="mobile-menu-title" className="sr-only">
            모바일 메뉴
          </h2>
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
              className="w-full rounded-full bg-[var(--color-landing-lime)] py-4 text-center text-lg font-bold text-[var(--color-landing-dark)]"
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
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    src: 'https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=900&auto=format&fit=crop',
                    srcSet: [
                      'https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=450&auto=format&fit=crop 450w',
                      'https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=700&auto=format&fit=crop 700w',
                      'https://images.unsplash.com/photo-1754257319747-df51c384c0fa?q=80&w=900&auto=format&fit=crop 900w',
                    ].join(', '),
                    alt: '기구 필라테스 수업',
                  },
                  {
                    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop',
                    srcSet: [
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=450&auto=format&fit=crop 450w',
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=700&auto=format&fit=crop 700w',
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop 900w',
                    ].join(', '),
                    alt: 'Gym',
                  },
                  {
                    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900&auto=format&fit=crop',
                    srcSet: [
                      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=450&auto=format&fit=crop 450w',
                      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=700&auto=format&fit=crop 700w',
                      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900&auto=format&fit=crop 900w',
                    ].join(', '),
                    alt: 'Lifting',
                  },
                  {
                    src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900&auto=format&fit=crop',
                    srcSet: [
                      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=450&auto=format&fit=crop 450w',
                      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=700&auto=format&fit=crop 700w',
                      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900&auto=format&fit=crop 900w',
                    ].join(', '),
                    alt: 'Pilates',
                  },
                ].map((image) => (
                  <motion.div
                    key={image.alt}
                    whileHover={hoverScaleSubtle}
                    className="h-52 overflow-hidden rounded-3xl md:h-56"
                  >
                    <img
                      src={image.src}
                      srcSet={image.srcSet}
                      sizes="(max-width: 1024px) 50vw, 300px"
                      className="h-full w-full object-cover"
                      alt={image.alt}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width={900}
                      height={900}
                    />
                  </motion.div>
                ))}
              </div>

              <div>
                <span className="mb-4 block text-sm font-bold tracking-wider text-[var(--color-landing-dark)] uppercase">
                  01. Various Categories
                </span>
                <h2 className="mb-6 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  헬스, 크로스핏은 물론
                  <br />
                  요가, 필라테스, 바레까지.
                  <br />
                  <span className="text-[var(--color-landing-dark)]">다양한 종목을 직접 골라보세요.</span>
                </h2>
                <p className="mb-10 text-lg text-slate-600">
                  어떤 종목의 타겟을 원하든 준비되어 있습니다. 브랜드의 성격에 딱 맞는 세부 카테고리별
                  전문가 매칭을 지원합니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['#헬스', '#크로스핏', '#요가', '#필라테스', '#바레', '#러닝'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ExpertPoolSection shouldReduceMotion={Boolean(shouldReduceMotion)} />

        <ROASSection data={roasData} />

        <OperationSection shouldReduceMotion={Boolean(shouldReduceMotion)} />

        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="mb-4 block text-sm font-bold tracking-wider text-[var(--color-landing-dark)] uppercase">
              05. Multi-Layer Pool
            </span>
            <h2 className="mb-16 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
              개인을 넘어 오프라인 공간과
              <br />
              커뮤니티까지 연결하는 웰링크만의 차별점
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Star,
                  label: '1:1 Targeted',
                  title: '개인 인플루언서',
                  desc: '트레이너, 운동 선수, 신뢰도 높은 피트니스/웰니스 전문 크리에이터.',
                },
                {
                  icon: Users,
                  label: 'Community Power',
                  title: '운동 크루',
                  desc: '러닝 크루, 동호회 등 강력한 팬덤 커뮤니티.',
                },
                {
                  icon: MapPin,
                  label: 'Offline Experience',
                  title: '피트니스/웰니스 센터',
                  desc: '공간 및 체험 제공을 통해 생생한 경험을 확산하는 피트니스 센터.',
                },
                {
                  icon: Trophy,
                  label: 'Mass Exposure',
                  title: '행사/이벤트',
                  desc: '대회, 세미나 등 대형 오프라인 이벤트 스폰서십 연결.',
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={hoverLiftCard}
                  className="rounded-[2rem] border border-slate-100 bg-white p-8 text-left shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-[var(--color-landing-dark)]">
                    <item.icon size={28} />
                  </div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {item.label}
                  </div>
                  <h3 className="mb-4 text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <PainPointSection shouldReduceMotion={Boolean(shouldReduceMotion)} />

        <section className="relative overflow-hidden bg-[var(--color-landing-dark)] py-24 text-white md:py-32">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
            <span className="mb-4 block text-sm font-bold tracking-wider text-[var(--color-landing-lime)] uppercase">
              Standard Operating Procedure
            </span>
            <h2 className="mb-16 text-3xl font-black leading-tight md:text-5xl">
              피트니스 마케팅의
              <br />
              <span className="text-[var(--color-landing-lime)]">체계적인 성과 창출 프로세스</span>
            </h2>
            <p className="mx-auto mb-20 max-w-2xl text-white/60">
              우리는 운에 맡기지 않습니다. 데이터와 표준화된 프로세스로 성공할 수밖에 없는 캠페인을
              설계합니다.
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '01', title: '설계', desc: '브랜드 목표와 타겟에 최적화된 캠페인 전략 수립' },
                { step: '02', title: '매칭', desc: '5만 명의 리스트 중 브랜드 핏이 완벽한 전문가 선정' },
                { step: '03', title: '운영', desc: '콘텐츠 가이드부터 검수까지 표준화된 프로세스 진행' },
                { step: '04', title: '리포트', desc: '실시간 전환 추적 및 ROI 중심의 성과 보고서 제공' },
              ].map((item, i) => (
                <div key={item.step} className="group relative">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-landing-lime)] text-3xl font-black text-[var(--color-landing-dark)] transition-transform group-hover:scale-110">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="mb-4 text-2xl font-black">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{item.desc}</p>
                  {i < 3 && <div className="absolute right-0 top-12 hidden h-px w-1/2 bg-white/10 lg:block" />}
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
  );
}
