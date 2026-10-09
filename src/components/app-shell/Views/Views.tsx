import clsx from 'clsx'
import {
  Clock,
  UtensilsCrossed,
  Lightbulb,
  MessageCircleQuestion,
  Plane,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Users,
  Wallet,
} from 'lucide-react'
import { useId, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { content } from '@/content/ru'
import { useDemoActions, useDemoState } from '@/context/DemoContext'
import {
  contextCards,
  dishes,
  GUESTS_DAY,
  GUESTS_DISH,
  history,
  learnArticles,
  profile,
  recipes,
  shopping,
  TODAY_INDEX,
  TRIP_DAYS,
  week,
  type DishId,
  type MealSlot,
} from '@/mock/demo-data'
import styles from './Views.module.scss'

const t = content.appShell
const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const ICON = { size: 18, strokeWidth: 1.75, 'aria-hidden': true } as const

function ViewHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className={styles.head}>
      <h3 className={styles.title}>{title}</h3>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}

function Time({ minutes }: { minutes: number }) {
  return (
    <span className={styles.time}>
      <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
      {minutes} {t.minutes}
    </span>
  )
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <span className={styles.tags}>
      {tags.map((tag) => (
        <Badge key={tag} tone="muted">
          {tag}
        </Badge>
      ))}
    </span>
  )
}

export function TodayView() {
  const { today, selectedDish } = useDemoState()
  const { replaceMeal, selectDish, setAssistantOpen } = useDemoActions()
  return (
    <>
      <ViewHead title={t.today.title} subtitle={t.today.subtitle} />
      <ul className={styles.mealList}>
        {SLOTS.map((slot) => {
          const dish = dishes[today[slot]]
          return (
            <li
              key={slot}
              className={clsx(styles.meal, selectedDish === today[slot] && styles.selected)}
            >
              <div className={styles.mealInfo}>
                <span className={styles.slot}>{t.today.meals[slot]}</span>
                <span key={today[slot]} className={styles.mealName}>
                  {dish.name}
                </span>
                <span className={styles.meta}>
                  <Time minutes={dish.time} />
                  <Tags tags={dish.tags} />
                </span>
              </div>
              <div className={styles.mealActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => replaceMeal(slot)}>
                  <RefreshCw {...ICON} size={16} />
                  {t.today.replace}
                </button>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => {
                    selectDish(today[slot])
                    setAssistantOpen(true)
                  }}
                >
                  <MessageCircleQuestion {...ICON} size={16} />
                  {t.today.why}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export function WeekView() {
  const { selectedCell, guests, today } = useDemoState()
  const { selectDish, setAssistantOpen } = useDemoActions()
  const days = t.week.days

  const dishFor = (day: number, slot: MealSlot): DishId => {
    if (guests && day === GUESTS_DAY && slot === 'dinner') return GUESTS_DISH
    if (day === TODAY_INDEX) return today[slot]
    return week[day][slot]
  }

  return (
    <>
      <ViewHead title={t.week.title} subtitle={t.week.subtitle} />
      <div className={styles.weekScroll}>
        <div className={styles.weekGrid}>
          {days.map((day, d) => {
            const isGuests = guests && d === GUESTS_DAY
            return (
              <div
                key={day}
                className={clsx(
                  styles.day,
                  d === TODAY_INDEX && styles.dayToday,
                  isGuests && styles.dayGuests,
                )}
              >
                <div className={styles.dayHead}>
                  <span>{day}</span>
                  {TRIP_DAYS.includes(d) && (
                    <span className={styles.dayMark}>
                      <Plane size={12} strokeWidth={1.75} aria-hidden="true" />
                      {t.week.trip}
                    </span>
                  )}
                  {isGuests && (
                    <span className={styles.dayMark}>
                      <Users size={12} strokeWidth={1.75} aria-hidden="true" />
                      {t.week.guests}
                    </span>
                  )}
                </div>
                {SLOTS.map((slot) => {
                  const id = dishFor(d, slot)
                  const cell = `${d}-${slot}`
                  return (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={selectedCell === cell}
                      aria-label={`${day}, ${t.today.meals[slot]}: ${dishes[id].name}`}
                      className={clsx(
                        styles.cell,
                        selectedCell === cell && styles.selected,
                        isGuests && slot === 'dinner' && styles.cellGuests,
                      )}
                      onClick={() => {
                        selectDish(id, cell)
                        setAssistantOpen(true)
                      }}
                    >
                      <span className={styles.cellSlot} aria-hidden="true">
                        {t.today.meals[slot]}
                      </span>
                      <span aria-hidden="true">{dishes[id].name}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

const TO_BUY = shopping.flatMap((g) => g.items).filter((i) => !('atHome' in i && i.atHome))

export function ShoppingView() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const uid = useId()
  const remaining = TO_BUY.filter((i) => !checked.has(i.id)).length

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      <div className={styles.headRow}>
        <ViewHead title={t.shopping.title} />
        <span className={styles.counter} aria-live="polite">
          {remaining > 0 ? `${t.shopping.remaining}: ${remaining}` : t.shopping.allDone}
        </span>
      </div>
      <div className={styles.groups}>
        {shopping.map((group) => (
          <fieldset key={group.group} className={styles.group}>
            <legend className={styles.groupTitle}>{group.group}</legend>
            {group.items.map((item) => {
              const atHome = 'atHome' in item && item.atHome
              const id = `${uid}-${item.id}`
              return (
                <div key={item.id} className={clsx(styles.item, checked.has(item.id) && styles.itemDone)}>
                  <input id={id} type="checkbox" checked={checked.has(item.id)} onChange={() => toggle(item.id)} />
                  <label htmlFor={id}>
                    {item.name} <span className={styles.qty}>· {item.qty}</span>
                  </label>
                  {atHome && <Badge>{t.shopping.atHome}</Badge>}
                </div>
              )
            })}
          </fieldset>
        ))}
      </div>
    </>
  )
}

const CONTEXT_ICONS = { time: Timer, family: Users, trip: Plane, budget: Wallet }

export function ContextView() {
  const { guests } = useDemoState()
  const { setGuests } = useDemoActions()
  const uid = useId()
  return (
    <>
      <ViewHead title={t.context.title} subtitle={t.context.subtitle} />
      <ul className={styles.contextGrid}>
        {contextCards.map((card) => {
          const Icon = CONTEXT_ICONS[card.key]
          return (
            <li key={card.key} className={styles.contextCard}>
              <Icon {...ICON} className={styles.contextIcon} />
              <span className={styles.subtitle}>{card.label}</span>
              <strong>{card.value}</strong>
            </li>
          )
        })}
      </ul>
      <div className={styles.switchRow}>
        <div>
          <label htmlFor={`${uid}-guests`} className={styles.switchLabel}>
            {t.context.guestsToggle}
          </label>
          <p className={styles.subtitle}>{t.context.guestsHint}</p>
        </div>
        <input
          id={`${uid}-guests`}
          type="checkbox"
          role="switch"
          className={styles.switch}
          checked={guests}
          onChange={(e) => setGuests(e.target.checked)}
        />
      </div>
    </>
  )
}

export function HistoryView() {
  return (
    <>
      <ViewHead title={t.history.title} subtitle={t.history.subtitle} />
      <p className={styles.hint}>
        <Lightbulb {...ICON} />
        {t.history.hint}
      </p>
      <div className={styles.historyCols}>
        <div>
          <h4 className={styles.groupTitle}>
            <ThumbsUp size={16} strokeWidth={1.75} aria-hidden="true" /> {t.history.liked}
          </h4>
          <ul className={styles.simpleList}>
            {history.liked.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.groupTitle}>
            <ThumbsDown size={16} strokeWidth={1.75} aria-hidden="true" /> {t.history.disliked}
          </h4>
          <ul className={styles.simpleList}>
            {history.disliked.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export function LearnView() {
  const [open, setOpen] = useState<string | null>(null)
  const uid = useId()
  return (
    <>
      <ViewHead title={t.learn.title} subtitle={t.learn.subtitle} />
      <ul className={styles.learnList}>
        {learnArticles.map((a) => {
          const isOpen = open === a.key
          return (
            <li key={a.key} className={styles.learnCard}>
              <button
                type="button"
                className={styles.learnBtn}
                aria-expanded={isOpen}
                aria-controls={`${uid}-${a.key}`}
                onClick={() => setOpen(isOpen ? null : a.key)}
              >
                <span>{a.title}</span>
                <span className={styles.learnMore}>{isOpen ? t.learn.collapse : t.learn.readMore}</span>
              </button>
              <p id={`${uid}-${a.key}`} hidden={!isOpen} className={styles.learnText}>
                {a.text}
              </p>
            </li>
          )
        })}
      </ul>
    </>
  )
}

const PROFILE_BLOCKS = [
  { title: t.profile.goals, items: profile.goals, userSet: false },
  { title: t.profile.tastes, items: profile.tastes, userSet: false },
  { title: t.profile.restrictions, items: profile.restrictions, userSet: true },
  { title: t.profile.skills, items: profile.skills, userSet: false },
]

export function ProfileView() {
  return (
    <>
      <ViewHead title={t.profile.title} />
      <div className={styles.profileGrid}>
        {PROFILE_BLOCKS.map((b) => (
          <div key={b.title} className={styles.profileBlock}>
            <h4 className={styles.groupTitle}>
              {b.title}
              {b.userSet && <Badge tone="accent">{t.profile.userSet}</Badge>}
            </h4>
            <div className={styles.chips}>
              {b.items.map((i) => (
                <span key={i} className={styles.chip}>
                  {i}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function RecipesView() {
  return (
    <>
      <ViewHead title={t.recipes.title} subtitle={t.recipes.subtitle} />
      <ul className={styles.recipeGrid}>
        {recipes.map((id) => (
          <li key={id} className={styles.recipe}>
            <span className={styles.recipeArt} aria-hidden="true">
              <UtensilsCrossed size={20} strokeWidth={1.75} />
            </span>
            <span className={styles.mealName}>{dishes[id].name}</span>
            <span className={styles.meta}>
              <Time minutes={dishes[id].time} />
            </span>
            <Tags tags={dishes[id].tags} />
          </li>
        ))}
      </ul>
    </>
  )
}
