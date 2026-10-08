import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './HowItWorks.module.scss'

export function HowItWorks() {
  const h = content.how
  return (
    <Section id="how" title={h.title} subtitle={h.subtitle}>
      <ol className={styles.steps}>
        {h.steps.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.num} aria-hidden="true">
              {i + 1}
            </span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.text}>{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
