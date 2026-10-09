import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Testimonials.module.scss'

export function Testimonials() {
  const t = content.testimonials
  return (
    <Section id="testimonials" title={t.title} subtitle={t.subtitle}>
      <ul className={styles.grid}>
        {t.items.map((item) => (
          <li key={item.name}>
            <figure className={styles.card}>
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
