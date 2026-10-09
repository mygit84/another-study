import { Minus, Plus } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import { track } from '@/lib/analytics'
import styles from './Faq.module.scss'

const f = content.faq
const KEYS = Object.keys(f.items) as (keyof typeof f.items)[]

export function Faq() {
  return (
    <Section id="faq" title={f.title} tone="surface" layout="aside">
      <div className={styles.list}>
        {KEYS.map((key) => (
          <details
            key={key}
            className={styles.item}
            onToggle={(e) => {
              if (e.currentTarget.open) track('faq_open', { key })
            }}
          >
            <summary className={styles.question}>
              <span>{f.items[key].question}</span>
              <Plus size={22} strokeWidth={2} aria-hidden="true" className={styles.iconOpen} />
              <Minus size={22} strokeWidth={2} aria-hidden="true" className={styles.iconClose} />
            </summary>
            <p className={styles.answer}>{f.items[key].answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
