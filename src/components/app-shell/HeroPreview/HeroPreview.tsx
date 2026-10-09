import clsx from 'clsx'
import { Check } from 'lucide-react'
import { content } from '@/content/ru'
import { dishes, todayAlternatives, type MealSlot } from '@/mock/demo-data'
import styles from './HeroPreview.module.scss'

const t = content.appShell

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const ACTIVE: MealSlot = 'dinner'

/** Статичная карточка «Сегодня» для hero: витрина, без интерактива (aria-hidden + inert). */
export function HeroPreview() {
  const active = dishes[todayAlternatives[ACTIVE][0]]
  return (
    <div className={styles.preview} aria-hidden="true" inert>
      <span className={styles.pill}>
        <Check size={16} strokeWidth={2.6} />
        {t.toast}
      </span>
      <div className={styles.card}>
        <div className={styles.head}>
          <p className={styles.title}>{t.today.title}</p>
          <p className={styles.subtitle}>{t.today.subtitle}</p>
        </div>
        <ul className={styles.meals}>
          {SLOTS.map((slot) => {
            const dish = dishes[todayAlternatives[slot][0]]
            const isActive = slot === ACTIVE
            return (
              <li key={slot} className={clsx(styles.meal, isActive && styles.mealActive)}>
                <span className={clsx(styles.time, styles[slot])}>
                  {dish.time} {t.minutes}
                </span>
                <span className={styles.body}>
                  <span className={styles.slot}>{t.today.meals[slot]}</span>
                  <span className={styles.name}>{dish.name}</span>
                  <span className={styles.tags}>
                    {isActive ? (
                      <>
                        <span className={styles.action}>{t.today.replace}</span>
                        <span className={clsx(styles.action, styles.actionDark)}>{t.today.why}</span>
                      </>
                    ) : (
                      dish.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))
                    )}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className={styles.why}>
        <p className={styles.whyTitle}>{t.assistant.whyTitle}</p>
        <p>{active.why}</p>
      </div>
    </div>
  )
}
