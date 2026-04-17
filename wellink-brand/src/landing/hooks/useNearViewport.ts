import React from 'react';

type UseNearViewportOptions = {
  rootMargin?: string;
  threshold?: number;
};

export function useNearViewport<T extends Element>({
  rootMargin = '240px',
  threshold = 0.01,
}: UseNearViewportOptions = {}) {
  const ref = React.useRef<T | null>(null);
  const [isNearViewport, setIsNearViewport] = React.useState(false);

  React.useEffect(() => {
    if (isNearViewport || !ref.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isNearViewport, rootMargin, threshold]);

  return { ref, isNearViewport };
}
