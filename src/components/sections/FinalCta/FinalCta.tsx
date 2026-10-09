import { useRef } from 'react'
import { Cta } from '@/components/ui/Cta'
import { content } from '@/content/ru'
import { useSectionView } from '@/hooks/useSectionView'
import styles from './FinalCta.module.scss'

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  useSectionView(ref, 'start')
  const f = content.finalCta
  return (
    <section ref={ref} id="start" aria-labelledby="start-title" className={styles.section}>
      <div className={styles.box}>
        <h2 id="start-title" className={styles.title}>
          {f.title}
        </h2>
        <p className={styles.text}>{f.text}</p>
        <Cta
          id="cta-final"
          label={content.cta.final}
          note={content.cta.finalNote}
          tone="onDeep"
          className={styles.cta}
        />
      </div>
    </section>
  )
}
