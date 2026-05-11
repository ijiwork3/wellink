/**
 * useHeaderStuck — 페이지 헤더가 viewport 밖으로 나가 sticky 상태가 되었는지 추적
 *
 * AdPerformance / ProfileInsight / ViralMetrics 세 페이지에서 동일하게 사용되던 패턴.
 * IntersectionObserver로 headerRef가 화면에 보이지 않을 때 isStuck=true.
 */

import { useEffect, useRef, useState } from 'react'

export default function useHeaderStuck<T extends HTMLElement = HTMLDivElement>() {
  const headerRef = useRef<T>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { headerRef, isStuck }
}
