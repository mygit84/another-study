import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Audience.module.scss'

export function Audience() {
  const a = content.audience
  return (
    <Section id="audience" title={a.title} subtitle={a.subtitle}>
      <ul className={styles.grid}>
        {a.items.map((item) => (
          <li key={item.key} className={styles.card}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
          </li>
        ))}
      </ul>
      <p className={styles.note}>{a.disclaimer}</p>
    </Section>
  )
}
