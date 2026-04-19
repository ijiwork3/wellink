/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

interface OperationSectionProps {
  shouldReduceMotion: boolean;
}

export function OperationSection({ shouldReduceMotion }: OperationSectionProps) {
  return (
    <section className="bg-gray-900 py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded-full bg-lime-400/10 px-3 py-1 text-xs font-bold tracking-wider text-[var(--color-landing-lime)] uppercase">
              04. Operation Automation
            </span>
            <h2 className="mb-6 text-3xl font-black leading-tight md:text-5xl">
              모집부터 보고서까지
              <br />
              <span className="text-[var(--color-landing-lime)]">단 10분.</span>
              <br />
              수동 업무에서 해방되세요.
            </h2>
            <p className="mb-10 text-lg text-white/60">
              수동 리스트업과 엑셀 작업은 이제 과거의 일입니다. 캠페인 운영 전 과정을 자동화하여
              마케팅 리소스를 <span className="font-bold text-white">90% 이상</span> 절감해 드립니다.
            </p>

            <ul className="space-y-4">
              {[
                '원클릭 인플루언서 모집',
                '실시간 콘텐츠 검수 시스템',
                '자동 성과 대시보드 생성',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 font-bold">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-landing-lime)] text-[var(--color-landing-dark)]">
                    <CheckCircle2 size={16} />
                  </div>
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
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Dashboard Pro
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    Total Reach
                  </div>
                  <div className="text-2xl font-black text-[var(--color-landing-lime)]">1.4M+</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    Campaign ROI
                  </div>
                  <div className="text-2xl font-black text-[var(--color-landing-lime)]">348%</div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[0.8, 0.6, 0.9].map((w, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded bg-white/10" />
                    <div className="h-2 flex-1 rounded-full bg-white/10">
                      {shouldReduceMotion ? (
                        <div
                          className="h-full rounded-full bg-[var(--color-landing-lime)]"
                          style={{ width: `${w * 100}%` }}
                        />
                      ) : (
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${w * 100}%` }}
                          className="h-full rounded-full bg-[var(--color-landing-lime)]"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
              whileInView={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
              className="absolute -bottom-10 -left-10 rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Old Process
                  </div>
                  <div className="text-sm font-black text-slate-900">엑셀 수동 리스트업</div>
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
                <div className="h-full w-1/3 rounded-full bg-red-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
