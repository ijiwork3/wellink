import { motion } from 'motion/react';
import { ChevronDown, Download } from 'lucide-react';
import { CtaLink } from '../components/CtaLink';

type HeroSectionProps = {
  shouldReduceMotion: boolean;
  contactUrl: string;
};

export function HeroSection({ shouldReduceMotion, contactUrl }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop"
          srcSet={[
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=960&auto=format&fit=crop 960w',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1440&auto=format&fit=crop 1440w',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop 1920w',
          ].join(', ')}
          sizes="100vw"
          alt="Gym background"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          width={1920}
          height={1280}
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[#0A3622]/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.6 }}
        >
          <span className="mb-6 inline-block rounded-full border border-lime-300/30 bg-white/10 px-4 py-1 text-xs font-bold tracking-widest text-[#BFF264] uppercase">
            Fitness & Wellness Specialized
          </span>
          <h1 className="mb-8 text-4xl font-black leading-tight text-white md:text-7xl">
            피트니스·웰니스 브랜드를 위한
            <br />
            <span className="text-[#BFF264]">단 하나의 마케팅 솔루션, 웰링크</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl">
            파편화된 인플루언서 마케팅은 이제 그만,
            <br />
            웰링크와 함께 피트니스/웰니스 브랜드에 꼭 맞는 마케팅을 시작하세요.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CtaLink
              href={contactUrl}
              ctaLabel="캠페인 상담 받기"
              ctaLocation="hero_primary"
              ctaId="hero_primary_consult"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#BFF264] px-8 py-4 text-lg font-bold text-[#0A3622] transition-all hover:scale-105 active:scale-95 sm:w-auto"
            >
              캠페인 상담 받기
            </CtaLink>
            <CtaLink
              href={contactUrl}
              ctaLabel="서비스 소개서 요청"
              ctaLocation="hero_secondary"
              ctaId="hero_secondary_brochure"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/20 sm:w-auto"
            >
              서비스 소개서 요청 <Download size={20} />
            </CtaLink>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={shouldReduceMotion ? undefined : { duration: 2, repeat: Infinity }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/50"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}
