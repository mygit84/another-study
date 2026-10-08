import { ArrowDown, Check } from 'lucide-react'
import { useRef } from 'react'
import { AppShell } from '@/components/app-shell/AppShell'
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
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{h.eyebrow}</p>
          <h1 id="hero-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.subtitle}>{h.subtitle}</p>
          <div className={styles.actions}>
            <Cta id="cta-hero" label={content.cta.hero} note={content.cta.heroNote} />
            <Button id="cta-how" href="#demo" variant="secondary" size="lg" onClick={() => track('cta_click', { id: 'cta-how' })}>
              {content.cta.how}
              <ArrowDown size={18} strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
          <ul className={styles.highlights}>
            {h.highlights.map((item) => (
              <li key={item}>
                <Check size={16} strokeWidth={2} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.preview}>
          <span className={styles.blobA} aria-hidden="true" />
          <span className={styles.blobB} aria-hidden="true" />
          <AppShell variant="preview" initialTab="week" />
        </div>
      </div>
    </section>
  )
}
