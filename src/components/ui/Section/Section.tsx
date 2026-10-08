import clsx from 'clsx'
import { useRef, type ReactNode } from 'react'
import { useSectionView } from '@/hooks/useSectionView'
import styles from './Section.module.scss'

interface SectionProps {
  id: string
  title: string
  subtitle?: string
  children: ReactNode
  tone?: 'default' | 'muted'
  className?: string
}

export function Section({ id, title, subtitle, children, tone = 'default', className }: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  useSectionView(ref, id)
  const titleId = `${id}-title`
  return (
    <section ref={ref} id={id} aria-labelledby={titleId} className={clsx(styles.section, styles[tone], className)}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
