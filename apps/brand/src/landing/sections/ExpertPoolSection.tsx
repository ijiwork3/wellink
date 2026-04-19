import { motion } from 'motion/react';

type ExpertPoolSectionProps = {
  shouldReduceMotion: boolean;
};

export function ExpertPoolSection({ shouldReduceMotion }: ExpertPoolSectionProps) {
  return (
    <section id="expert-pool" className="scroll-mt-28 bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <span className="mb-4 block text-sm font-bold tracking-wider text-[var(--color-landing-dark)] uppercase">
              02. Verified Experts
            </span>
            <h2 className="mb-6 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
              진짜 운동하는
              <br />
              인플루언서만 모여있습니다.
            </h2>
            <p className="mb-10 text-lg text-slate-600">
              단순 협찬 모델이 아닌, 실제 운동 일지와 식단 소통으로 다져진{' '}
              <span className="border-b-4 border-[var(--color-landing-lime)] font-bold">5만 명의 웰니스 전문가</span>{' '}
              리스트를 바로 활용하세요.
            </p>

            <div className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-slate-200"
                  >
                    <img
                      src={`https://picsum.photos/seed/${i + 10}/100/100`}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width={100}
                      height={100}
                    />
                  </div>
                ))}
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-lime-200 text-xs font-bold text-[var(--color-landing-dark)]">
                  +50k
                </div>
              </div>
              <div>
                <div className="font-bold text-slate-900">실시간 활성 전문가</div>
                <div className="text-sm text-slate-500">매칭 대기 중인 인플루언서</div>
              </div>
            </div>

            <div className="inline-block rounded-xl bg-[var(--color-landing-dark)] px-6 py-4 text-white">
              <div className="text-xs font-bold uppercase tracking-wider opacity-60">
                Conversion Rate
              </div>
              <div className="text-2xl font-black text-[var(--color-landing-lime)]">CVR 12.8%</div>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative h-[600px] w-[300px] overflow-hidden rounded-[3rem] border-8 border-slate-900 bg-white shadow-2xl">
              <div className="absolute top-0 h-6 w-full bg-slate-900" />
              <div className="p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                    <img
                      src="https://picsum.photos/seed/profile/100/100"
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      width={100}
                      height={100}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold">@WELLINK_STAR</div>
                    <div className="text-[10px] text-slate-400">Seoul, Korea</div>
                  </div>
                </div>
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop"
                    srcSet={[
                      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop 500w',
                      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop 800w',
                      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop 1000w',
                    ].join(', ')}
                    sizes="(max-width: 768px) 80vw, 300px"
                    className="h-full w-full object-cover"
                    alt="인스타그램 피드 콘텐츠"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    width={1000}
                    height={1000}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-4 rounded bg-slate-200" />
                    <div className="h-4 w-4 rounded bg-slate-200" />
                    <div className="h-4 w-4 rounded bg-slate-200" />
                  </div>
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>

              <motion.div
                initial={shouldReduceMotion ? false : { x: 50, opacity: 0 }}
                whileInView={shouldReduceMotion ? undefined : { x: 0, opacity: 1 }}
                className="absolute top-20 -right-12 rounded-xl bg-white p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-lime-400" />
                  <div className="text-[10px] font-bold uppercase text-slate-400">Current Streak</div>
                </div>
                <div className="text-sm font-black text-slate-900">오운완 1,249일차</div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
