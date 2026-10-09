import { GridPattern } from '@/components/backgrounds/GridPattern'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Problem.module.scss'

export function Problem() {
  const p = content.problem
  return (
    <Section id="problem" title={p.title} subtitle={p.subtitle} tone="surface" background={<GridPattern />}>
      <ul className={styles.grid}>
        {p.items.map((item) => (
          <li key={item.key} className={styles.card}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
