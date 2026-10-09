import { useEffect, useRef } from 'react'

/** Ставит `data-offscreen`, пока элемента нет на экране: бесконечные фоновые анимации встают на паузу. */
export function useOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      el.toggleAttribute('data-offscreen', !entry.isIntersecting)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      el.removeAttribute('data-offscreen')
    }
  }, [])
  return ref
}
