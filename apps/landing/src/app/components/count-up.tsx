import { useEffect, useRef, useState } from "react";

/** 항상 inView=true 반환 — IntersectionObserver 제거 후 호환성 유지 */
export function useInView(_threshold = 0.35) {
  const ref = useRef<HTMLDivElement>(null);
  return { ref, inView: true as const };
}

export function useCountUp(target: number, duration = 1500, enabled = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setN(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [enabled, target, duration]);
  return n;
}

export function AnimatedNumber({
  v,
  style,
  className,
}: {
  v: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const m = v.match(/^(\d+)(.*)/);
  const num = m ? parseInt(m[1]) : 0;
  const suffix = m ? m[2] : v;
  const count = useCountUp(num, 1500, true);
  return (
    <div style={style} className={`whitespace-nowrap ${className ?? ""}`}>
      {count}{suffix}
    </div>
  );
}
