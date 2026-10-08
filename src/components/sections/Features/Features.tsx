import { ArrowRight, CalendarDays, History, Lightbulb, ShoppingBasket, SlidersHorizontal, UserRound } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import { useDemo, type AppShellTab } from '@/context/DemoContext'
import { track } from '@/lib/analytics'
import { scrollToId } from '@/lib/scroll'
import styles from './Features.module.scss'

type FeatureKey = 'profile' | 'week' | 'shopping' | 'context' | 'history' | 'learn'

const META: Record<FeatureKey, { icon: typeof UserRound; tab: AppShellTab; assistant?: boolean }> = {
  profile: { icon: UserRound, tab: 'profile' },
  week: { icon: CalendarDays, tab: 'week' },
  shopping: { icon: ShoppingBasket, tab: 'shopping' },
  context: { icon: SlidersHorizontal, tab: 'context' },
  history: { icon: History, tab: 'history' },
  learn: { icon: Lightbulb, tab: 'today', assistant: true },
}

export function Features() {
  const f = content.features
  const { setTab, setAssistantOpen } = useDemo()

  const open = (key: FeatureKey) => {
    const meta = META[key]
    track('feature_card_click', { key })
    setTab(meta.tab)
    setAssistantOpen(Boolean(meta.assistant))
    scrollToId('demo')
  }

  return (
    <Section id="features" title={f.title} subtitle={f.subtitle} tone="muted">
      <ul className={styles.grid}>
        {f.items.map((item) => {
          const key = item.key as FeatureKey
          const Icon = META[key].icon
          return (
            <li key={key}>
              <button type="button" className={styles.card} onClick={() => open(key)}>
                <span className={styles.icon}>
                  <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.text}>{item.text}</span>
                <span className={styles.more}>
                  {f.openDemo}
                  <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
