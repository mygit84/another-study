import { Activity, Briefcase, Info, Leaf, ListChecks, UsersRound } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Audience.module.scss'

const ICONS = { busy: Briefcase, family: UsersRound, active: Activity, restrictions: ListChecks, beginners: Leaf }

export function Audience() {
  const a = content.audience
  return (
    <Section id="audience" title={a.title} subtitle={a.subtitle}>
      <ul className={styles.grid}>
        {a.items.map((item) => {
          const Icon = ICONS[item.key as keyof typeof ICONS]
          return (
            <li key={item.key} className={styles.card}>
              <span className={styles.icon}>
                <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </li>
          )
        })}
      </ul>
      <p className={styles.note}>
        <Info size={18} strokeWidth={1.75} aria-hidden="true" />
        {a.disclaimer}
      </p>
    </Section>
  )
}
