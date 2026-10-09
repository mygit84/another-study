import clsx from 'clsx'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import { useReveal } from '@/hooks/useReveal'
import styles from './Testimonials.module.scss'

export function Testimonials() {
  const t = content.testimonials
  const listRef = useReveal<HTMLUListElement>({ children: true })
  return (
    <Section id="testimonials" title={t.title} subtitle={t.subtitle}>
      <ul ref={listRef} className={styles.grid}>
        {t.items.map((item, i) => (
          <li key={item.name} className={clsx(i === 0 && styles.featured)}>
            <figure className={clsx(styles.card, i === 0 && styles.cardFeatured)}>
              <blockquote className={styles.quote}>{item.quote}</blockquote>
              <figcaption className={styles.author}>
                <span className={styles.avatar} aria-hidden="true">
                  {item.name.charAt(0)}
                </span>
                <span>
                  {item.name}, {item.age}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  )
}
