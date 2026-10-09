import clsx from 'clsx'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './HowItWorks.module.scss'

export function HowItWorks() {
  const h = content.how
  const last = h.steps.length - 1
  return (
    <Section id="how" eyebrow={h.eyebrow} title={h.title}>
      <ol className={styles.steps}>
        {h.steps.map((step, i) => (
          <li key={step.title} className={clsx(styles.step, i === last && styles.stepAccent)}>
            <span className={styles.num} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className={styles.body}>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
