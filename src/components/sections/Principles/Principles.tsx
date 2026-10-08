import { HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Principles.module.scss'

const ICONS = { noGuilt: HeartHandshake, disclaimer: ShieldCheck, data: LockKeyhole }

export function Principles() {
  const p = content.principles
  return (
    <Section id="principles" title={p.title} subtitle={p.subtitle} tone="muted">
      <ul className={styles.grid}>
        {(Object.keys(p.items) as (keyof typeof p.items)[]).map((key) => {
          const Icon = ICONS[key]
          return (
            <li key={key} className={styles.card}>
              <Icon size={28} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
              <h3 className={styles.title}>{p.items[key].title}</h3>
              <p className={styles.text}>{p.items[key].text}</p>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
