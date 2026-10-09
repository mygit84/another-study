import { Bike, Briefcase, ListChecks, Sprout, Users, type LucideIcon } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import { useReveal } from '@/hooks/useReveal'
import styles from './Audience.module.scss'

type AudienceKey = 'busy' | 'family' | 'active' | 'restrictions' | 'beginners'

const ICONS: Record<AudienceKey, LucideIcon> = {
  busy: Briefcase,
  family: Users,
  active: Bike,
  restrictions: ListChecks,
  beginners: Sprout,
}

export function Audience() {
  const a = content.audience
  const listRef = useReveal<HTMLUListElement>({ children: true })
  return (
    <Section id="audience" title={a.title} subtitle={a.subtitle}>
      <ul ref={listRef} className={styles.grid}>
        {a.items.map((item) => {
          const Icon = ICONS[item.key as AudienceKey]
          return (
            <li key={item.key} className={styles.card}>
              <span className={styles.icon}>
                <Icon size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </li>
          )
        })}
      </ul>
      <p className={styles.note}>{a.disclaimer}</p>
    </Section>
  )
}
