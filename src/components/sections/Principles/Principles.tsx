import { Ripple } from '@/components/backgrounds/Ripple'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Principles.module.scss'

export function Principles() {
  const p = content.principles
  return (
    <Section id="principles" title={p.title} subtitle={p.subtitle} tone="lime" background={<Ripple />}>
      <ul className={styles.grid}>
        {(Object.keys(p.items) as (keyof typeof p.items)[]).map((key) => (
          <li key={key} className={styles.item}>
            <h3 className={styles.title}>{p.items[key].title}</h3>
            <p className={styles.text}>{p.items[key].text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
