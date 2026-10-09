import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import { useReveal } from '@/hooks/useReveal'
import styles from './Problem.module.scss'

export function Problem() {
  const p = content.problem
  const listRef = useReveal<HTMLUListElement>({ children: true })
  return (
    <Section id="problem" title={p.title} subtitle={p.subtitle} tone="surface">
      <ul ref={listRef}>
        {p.items.map((item) => (
          <li key={item.key} className={styles.row}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
