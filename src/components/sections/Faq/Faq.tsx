import { Plus } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import { track } from '@/lib/analytics'
import styles from './Faq.module.scss'

export function Faq() {
  const f = content.faq
  const keys = Object.keys(f.items) as (keyof typeof f.items)[]
  return (
    <Section id="faq" title={f.title}>
      <div className={styles.list}>
        {keys.map((key) => (
          <details
            key={key}
            className={styles.item}
            onToggle={(e) => {
              if (e.currentTarget.open) track('faq_open', { key })
            }}
          >
            <summary className={styles.question}>
              <span>{f.items[key].question}</span>
              <Plus size={20} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
            </summary>
            <p className={styles.answer}>{f.items[key].answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
