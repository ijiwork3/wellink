import React from 'react';
import { useNearViewport } from '../hooks/useNearViewport';

const ROASChart = React.lazy(() => import('../ROASChart'));

type RoasDatum = {
  name: string;
  value: number;
  color: string;
};

type ROASSectionProps = {
  data: RoasDatum[];
};

export function ROASSection({ data }: ROASSectionProps) {
  const { ref, isNearViewport } = useNearViewport<HTMLDivElement>({ rootMargin: '320px' });

  return (
    <section id="success-case" className="scroll-mt-28 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-slate-200/50 md:p-12">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900">ROAS Performance</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Efficiency Benchmark 2024
              </p>
            </div>

            <div ref={ref} className="h-64 w-full">
              {isNearViewport ? (
                <React.Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-slate-500">
                      차트 로딩 중…
                    </div>
                  }
                >
                  <ROASChart data={data} />
                </React.Suspense>
              ) : (
                <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Avg Conversion
                </div>
                <div className="text-3xl font-black text-[var(--color-landing-dark)]">+42%</div>
              </div>
            </div>
          </div>

          <div>
            <span className="mb-4 block text-sm font-bold tracking-wider text-[var(--color-landing-dark)] uppercase">
              03. Data Driven ROAS
            </span>
            <h2 className="mb-6 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
              광고비 낭비는 오늘로 끝.
              <br />
              <span className="relative inline-block">
                가짜 팔로워
                <span className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-red-400/50" />
              </span>
              에 예산을 쓰지 마세요.
            </h2>
            <p className="mb-10 text-lg text-slate-600">
              의미 없는 도달수는 버리고, 구매 전환이 검증된 진성 유저 비중을 최우선으로 매칭하여
              당신의 ROAS를 증명합니다.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-6">
                <div className="text-3xl font-black text-[var(--color-landing-dark)]">92%</div>
                <div className="text-sm font-bold text-slate-500">진성 유저 매칭률</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-6">
                <div className="text-3xl font-black text-[var(--color-landing-dark)]">0%</div>
                <div className="text-sm font-bold text-slate-500">허수 계정 차단</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
