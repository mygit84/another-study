import { useEffect, type RefObject } from 'react'
import { track } from '@/lib/analytics'

/** Отправляет section_view, когда секция впервые видна на ≥50%. */
export function useSectionView(ref: RefObject<HTMLElement | null>, id: string) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track('section_view', { id })
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, id])
}
