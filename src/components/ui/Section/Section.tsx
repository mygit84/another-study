import clsx from 'clsx'
import { useRef, type ReactNode } from 'react'
import { useSectionView } from '@/hooks/useSectionView'
import styles from './Section.module.scss'

interface SectionProps {
  id: string
  title: string
  subtitle?: string
  eyebrow?: string
  children: ReactNode
  /** default — фон страницы, surface — белая полоса, lime — салатовая, deep — тёмная */
  tone?: 'default' | 'surface' | 'lime' | 'deep'
  /** split — заголовок слева, подзаголовок справа (desktop) */
  head?: 'stack' | 'split'
  /** wide — контейнер 1280px (демо) */
  wide?: boolean
  /** aside — заголовок слева, контент справа (desktop) */
  layout?: 'default' | 'aside'
  /** Декоративный фон из src/components/backgrounds */
  background?: ReactNode
  className?: string
}

export function Section({
  id,
  title,
  subtitle,
  eyebrow,
  children,
  tone = 'default',
  head = 'stack',
  wide = false,
  layout = 'default',
  background,
  className,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  useSectionView(ref, id)
  const titleId = `${id}-title`
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      className={clsx(styles.section, styles[tone], background && styles.hasBackground, className)}
    >
      {background}
      <div className={clsx(styles.inner, wide && styles.wide, layout === 'aside' && styles.aside)}>
        <header className={clsx(styles.head, head === 'split' && styles.split)}>
          <div className={styles.titles}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
