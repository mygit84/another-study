import clsx from 'clsx'
import { Bell, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { useId, useRef, type ComponentType, type KeyboardEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Toast } from '@/components/ui/Toast'
import { content } from '@/content/ru'
import { useDemoActions, useDemoState, type AppShellTab } from '@/context/DemoContext'
import { AssistantPanel } from '../AssistantPanel'
import {
  ContextView,
  HistoryView,
  LearnView,
  ProfileView,
  RecipesView,
  ShoppingView,
  TodayView,
  WeekView,
} from '../Views'
import styles from './AppShell.module.scss'
import { TAB_ICONS } from './tabIcons'

const t = content.appShell

const TABS = Object.keys(TAB_ICONS) as AppShellTab[]

const TAB_BAR: (keyof typeof t.tabBar)[] = ['today', 'week', 'shopping', 'assistant', 'profile']

const VIEWS: Record<AppShellTab, ComponentType> = {
  today: TodayView,
  week: WeekView,
  shopping: ShoppingView,
  recipes: RecipesView,
  context: ContextView,
  history: HistoryView,
  learn: LearnView,
  profile: ProfileView,
}

/** Интерактивное демо приложения; состояние — из DemoProvider. */
export function AppShell() {
  const { tab, assistantOpen, toastKey } = useDemoState()
  const { setTab, setAssistantOpen } = useDemoActions()
  const uid = useId()
  const tabRefs = useRef<Partial<Record<AppShellTab, HTMLButtonElement | null>>>({})
  const panelId = `${uid}-panel`
  const assistantId = `${uid}-assistant`
  const tabId = (key: AppShellTab) => `${uid}-tab-${key}`
  const View = VIEWS[tab]

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = TABS.indexOf(tab)
    let next = idx
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (idx + 1) % TABS.length
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    else return
    e.preventDefault()
    const key = TABS[next]
    setTab(key)
    tabRefs.current[key]?.focus()
  }

  return (
    <div className={styles.shell} role="region" aria-label={t.label}>
      <div className={styles.topbar}>
        <span className={styles.brand}>
          <span className={styles.logo}>{content.common.logo}</span>
          <Badge tone="accent" className={styles.demoBadge}>
            {t.badge}
          </Badge>
        </span>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.assistantToggle}
            aria-expanded={assistantOpen}
            aria-controls={assistantId}
            onClick={() => setAssistantOpen(!assistantOpen)}
          >
            <Sparkles size={16} strokeWidth={1.75} aria-hidden="true" />
            {t.openAssistant}
          </button>
          <span className={styles.topIcon} title={t.search}>
            <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className={styles.topIcon} title={t.notifications}>
            <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className={styles.avatar} aria-hidden="true">
            {t.avatar}
          </span>
        </div>
      </div>

      <div
        className={styles.sidebar}
        role="tablist"
        aria-label={t.tabsLabel}
        aria-orientation="vertical"
        onKeyDown={onTabKey}
      >
        {TABS.map((key) => {
          const Icon = TAB_ICONS[key]
          return (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[key] = el
              }}
              id={tabId(key)}
              type="button"
              role="tab"
              aria-selected={tab === key}
              aria-controls={panelId}
              tabIndex={tab === key ? 0 : -1}
              className={clsx(styles.tab, tab === key && styles.tabActive)}
              onClick={() => setTab(key)}
              title={t.tabs[key]}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className={styles.tabLabel}>{t.tabs[key]}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.main} role="tabpanel" id={panelId} aria-labelledby={tabId(tab)}>
        <div key={tab} className={styles.view}>
          <View />
        </div>
        <Toast message={t.toast} trigger={toastKey} />
      </div>

      <AssistantPanel id={assistantId} />

      <nav className={styles.tabbar} aria-label={t.tabsLabel}>
        {TAB_BAR.map((key) => {
          const isAssistant = key === 'assistant'
          const Icon = isAssistant ? Sparkles : TAB_ICONS[key]
          const active = isAssistant ? assistantOpen : tab === key && !assistantOpen
          return (
            <button
              key={key}
              type="button"
              className={clsx(styles.barItem, active && styles.barItemActive)}
              aria-pressed={active}
              aria-controls={isAssistant ? assistantId : panelId}
              onClick={() => {
                if (isAssistant) {
                  setAssistantOpen(!assistantOpen)
                } else {
                  setAssistantOpen(false)
                  setTab(key)
                }
              }}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              <span>{t.tabBar[key]}</span>
            </button>
          )
        })}
      </nav>

      <p className={styles.safety}>
        <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>{t.safetyBar}</span>
      </p>
    </div>
  )
}
