import { CookingPot, MessagesSquare, Bike, ChartNoAxesColumn } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Problem.module.scss'

const ICONS = { cook: CookingPot, delivery: Bike, advice: MessagesSquare, trackers: ChartNoAxesColumn }

export function Problem() {
  const p = content.problem
  return (
    <Section id="problem" title={p.title} subtitle={p.subtitle} tone="muted">
      <ul className={styles.grid}>
        {p.items.map((item) => {
          const Icon = ICONS[item.key as keyof typeof ICONS]
          return (
            <li key={item.key}>
              <Card className={styles.card}>
                <span className={styles.icon}>
                  <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.text}>{item.text}</p>
              </Card>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
