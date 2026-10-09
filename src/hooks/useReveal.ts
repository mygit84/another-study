import { useEffect, useRef } from 'react'

interface RevealOptions {
  /** true — показывать каждого прямого потомка отдельно, с задержкой по очереди */
  children?: boolean
}

/**
 * Плавно показывает элемент при первом появлении в окне (стили — `[data-reveal]` в global.scss).
 * Прячет только то, что после гидрации ещё ниже экрана: в пре-рендере и без JS всё видно,
 * на первом экране ничего не мигает. При prefers-reduced-motion ничего не делает.
 * Возвращает ref, который нужно повесить на элемент.
 */
export function useReveal<T extends HTMLElement>({ children = false }: RevealOptions = {}) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = (children ? Array.from(root.children) : [root]) as HTMLElement[]
    const hidden = new Set<HTMLElement>()

    const observer = new IntersectionObserver(
      (entries) => {
        // Задержка по порядку среди тех, кто появился одновременно (одна строка сетки)
        let order = 0
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (hidden.has(el)) {
            if (!entry.isIntersecting) continue
            el.style.setProperty('--reveal-order', String(order++))
            el.dataset.reveal = 'shown'
            observer.unobserve(el)
          } else if (!entry.isIntersecting && entry.boundingClientRect.top > window.innerHeight) {
            // Первый отчёт наблюдателя: элемент ниже экрана — прячем до появления
            hidden.add(el)
            el.dataset.reveal = 'hidden'
          } else {
            observer.unobserve(el)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    for (const el of targets) observer.observe(el)
    return () => {
      observer.disconnect()
      for (const el of hidden) {
        delete el.dataset.reveal
        el.style.removeProperty('--reveal-order')
      }
    }
  }, [children])
  return ref
}
