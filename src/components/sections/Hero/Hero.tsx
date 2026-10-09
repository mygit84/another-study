import { Check } from 'lucide-react'
import { useRef } from 'react'
import { HeroPreview } from '@/components/app-shell/HeroPreview'
import { Aurora } from '@/components/backgrounds/Aurora'
import { Button } from '@/components/ui/Button'
import { Cta } from '@/components/ui/Cta'
import { content } from '@/content/ru'
import { useSectionView } from '@/hooks/useSectionView'
import { track } from '@/lib/analytics'
import { config } from '@/lib/config'
import styles from './Hero.module.scss'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useSectionView(ref, 'hero')
  const h = content.hero
  const title = h.titleVariants[config.heroVariant] ?? h.titleVariants[0]

  return (
    <section ref={ref} id="hero" aria-labelledby="hero-title" className={styles.hero}>
      <Aurora />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{h.eyebrow}</p>
          <h1 id="hero-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.subtitle}>{h.subtitle}</p>
          <ul className={styles.highlights}>
            {h.highlights.map((item) => (
              <li key={item}>
                <Check size={20} strokeWidth={2.4} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Cta id="cta-hero" label={content.cta.hero} note={content.cta.heroNote} className={styles.cta} />
            <Button
              id="cta-how"
              href="#demo"
              variant="link"
              size="lg"
              className={styles.how}
              onClick={() => track('cta_click', { id: 'cta-how' })}
            >
              {content.cta.how}
            </Button>
          </div>
        </div>
        <HeroPreview />
      </div>
    </section>
  )
}
