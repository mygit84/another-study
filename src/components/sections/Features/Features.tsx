import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import type { PointerEvent } from 'react'
import { TAB_ICONS } from '@/components/app-shell/AppShell'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import { useDemoActions, type AppShellTab } from '@/context/DemoContext'
import { useReveal } from '@/hooks/useReveal'
import { track } from '@/lib/analytics'
import { scrollToId } from '@/lib/scroll'
import { dishes, TODAY_INDEX, TRIP_DAYS, week } from '@/mock/demo-data'
import styles from './Features.module.scss'

type FeatureKey = 'profile' | 'week' | 'shopping' | 'context' | 'history' | 'learn'

// Ключ карточки совпадает с вкладкой демо: иконка берётся из сайдбара, чтобы карточка и вкладка узнавались
const META: Record<FeatureKey, { tab: AppShellTab; toneClass?: string; assistant?: boolean }> = {
  profile: { tab: 'profile' },
  week: { tab: 'week', toneClass: styles.cardLime },
  shopping: { tab: 'shopping' },
  context: { tab: 'context' },
  history: { tab: 'history' },
  learn: { tab: 'today', toneClass: styles.cardPeach, assistant: true },
}

const w = content.appShell.week

/** Фрагмент «Плана недели» из демо: ужин на каждый день. Декоративный, имя кнопке даёт заголовок. */
function WeekPeek() {
  return (
    <span className={styles.peek} aria-hidden="true">
      {week.map((day, i) => (
        <span key={w.days[i]} className={clsx(styles.peekRow, i === TODAY_INDEX && styles.peekRowToday)}>
          <span className={styles.peekDay}>{w.days[i]}</span>
          <span className={styles.peekDish}>{dishes[day.dinner].name}</span>
          {TRIP_DAYS.includes(i) && <span className={styles.peekTag}>{w.trip}</span>}
        </span>
      ))}
    </span>
  )
}

/** Блик идёт за курсором: пишем только CSS-переменные карточки, без ре-рендера. */
function moveSpotlight(e: PointerEvent<HTMLButtonElement>) {
  if (e.pointerType !== 'mouse') return
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
  card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
}

export function Features() {
  const f = content.features
  const { setTab, setAssistantOpen } = useDemoActions()
  const listRef = useReveal<HTMLUListElement>({ children: true })

  const open = (key: FeatureKey) => {
    const meta = META[key]
    track('feature_card_click', { key })
    setTab(meta.tab)
    setAssistantOpen(Boolean(meta.assistant))
    scrollToId('demo')
  }

  return (
    <Section id="features" title={f.title} subtitle={f.subtitle} tone="surface">
      <ul ref={listRef} className={styles.grid}>
        {f.items.map((item) => {
          const key = item.key as FeatureKey
          const Icon = TAB_ICONS[key]
          const featured = key === 'week'
          return (
            <li key={key} className={clsx(featured && styles.featured)}>
              <button
                type="button"
                className={clsx(styles.card, META[key].toneClass)}
                onClick={() => open(key)}
                onPointerMove={moveSpotlight}
              >
                <Icon size={24} strokeWidth={2} aria-hidden="true" className={styles.icon} />
                <span className={styles.title}>{item.title}</span>
                <span className={styles.text}>{item.text}</span>
                {featured && <WeekPeek />}
                <span className={styles.more}>
                  {f.openDemo}
                  <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
