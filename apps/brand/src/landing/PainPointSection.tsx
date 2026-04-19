/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from './lib/classnames';

interface PainPointSectionProps {
  shouldReduceMotion: boolean;
}

const PAIN_POINTS = [
  {
    id: 'P1',
    role: '브랜드 매니저',
    problem: '"우리 브랜드의 전문성을 이해하는 진짜 파트너를 찾기 힘들어요."',
    value: '검증된 인플루언서 DB: 정성·정량 스코어링을 통해 브랜드 핏이 완벽한 전문가 매칭',
    color: 'bg-emerald-50',
  },
  {
    id: 'P2',
    role: '인플루언서 마케팅 담당자',
    problem: '"매번 파편화된 커뮤니케이션과 운영에 리소스가 너무 많이 들어요."',
    value: '운영의 표준(SOP): 모집부터 콘텐츠 검수까지 표준화된 프로세스로 운영 업무 자동화',
    color: 'bg-blue-50',
  },
  {
    id: 'P3',
    role: '웰니스 스타트업',
    problem: '"유저 획득 단가(CAC)를 낮추고 지속 가능한 자산을 만들고 싶어요."',
    value: '콘텐츠 자산화: 광고 소재로 즉시 활용 가능한 고품질 UGC 및 재사용권 확보 프로세스',
    color: 'bg-purple-50',
  },
  {
    id: 'P4',
    role: '퍼포먼스 마케터',
    problem: '"단순 도달은 높은데, 실제 매출(ROAS)로 증명되나요?"',
    value: '데이터 어트리뷰션: UTM 및 전용 쿠폰 코드를 통한 실시간 전환 추적 및 성과 리포트',
    color: 'bg-orange-50',
  },
];

export function PainPointSection({ shouldReduceMotion }: PainPointSectionProps) {
  const hoverScaleCard = shouldReduceMotion ? undefined : { scale: 1.01 };

  return (
    <section className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-black text-slate-900 md:text-5xl">마케터의 고민,</h2>
        <h2 className="mb-8 text-3xl font-black text-[var(--color-landing-dark)] md:text-5xl">
          웰링크가 해결해 드립니다.
        </h2>
        <p className="mb-16 text-slate-500">
          실제 필드에서 활동하는 마케터들의 가장 큰 고충을 정확히 타겟팅합니다.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {PAIN_POINTS.map((item) => (
            <motion.div
              key={item.id}
              whileHover={hoverScaleCard}
              className="flex overflow-hidden rounded-[2.5rem] bg-white shadow-sm"
            >
              <div className={cn('flex w-1/3 flex-col items-center justify-center p-8', item.color)}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white font-black text-[var(--color-landing-dark)] shadow-sm">
                  {item.id}
                </div>
                <div className="text-center font-black text-slate-900">{item.role}</div>
              </div>
              <div className="flex flex-1 flex-col justify-center p-8 text-left">
                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border border-red-400 text-[8px]">
                      !
                    </div>
                    Problem
                  </div>
                  <div className="text-lg font-black leading-tight text-slate-900">{item.problem}</div>
                </div>
                <div className="mb-6 h-px w-full bg-slate-100" />
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                    <CheckCircle2 size={12} />
                    Value
                  </div>
                  <div className="text-sm font-medium text-slate-600">{item.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
