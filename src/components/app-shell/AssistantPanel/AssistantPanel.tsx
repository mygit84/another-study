import clsx from 'clsx'
import { Sparkles, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { content } from '@/content/ru'
import { useDemoActions, useDemoState } from '@/context/DemoContext'
import { dishes, type QuickEdit } from '@/mock/demo-data'
import styles from './AssistantPanel.module.scss'

const t = content.appShell.assistant
const OVERLAY_QUERY = '(max-width: 1023.98px)'
const QUICK: QuickEdit[] = ['noTime', 'guests', 'emptyFridge', 'simpler']

export function AssistantPanel({ id }: { id: string }) {
  const { selectedDish, assistantOpen } = useDemoState()
  const { setAssistantOpen, applyQuickEdit } = useDemoActions()
  const ref = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const uid = useId()
  const [tooltip, setTooltip] = useState(false)
  const dish = selectedDish ? dishes[selectedDish] : null

  // На планшете и телефоне панель — overlay: фокус-трап и закрытие по Esc.
  useEffect(() => {
    if (!assistantOpen || !window.matchMedia(OVERLAY_QUERY).matches) return
    const panel = ref.current
    if (!panel) return
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAssistantOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusable = panel.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [assistantOpen, setAssistantOpen])

  return (
    <>
      <div
        className={clsx(styles.scrim, assistantOpen && styles.scrimVisible)}
        onClick={() => setAssistantOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={ref}
        id={id}
        className={clsx(styles.panel, assistantOpen && styles.open)}
        aria-labelledby={`${uid}-title`}
      >
        <div className={styles.head}>
          <h3 id={`${uid}-title`} className={styles.title}>
            <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
            {t.title}
          </h3>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={() => setAssistantOpen(false)}
            aria-label={t.close}
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.scroll}>
          <section className={styles.block} aria-live="polite">
            <h4 className={styles.blockTitle}>{t.whyTitle}</h4>
            {dish ? (
              <div key={selectedDish} className={styles.why}>
                <p className={styles.dishName}>{dish.name}</p>
                <p>{dish.why}</p>
              </div>
            ) : (
              <p className={styles.muted}>{t.whyEmpty}</p>
            )}
          </section>

          <section className={styles.block}>
            <h4 className={styles.blockTitle}>{t.quickTitle}</h4>
            <div className={styles.chips}>
              {QUICK.map((key) => (
                <button key={key} type="button" className={styles.chip} onClick={() => applyQuickEdit(key)}>
                  {t.quick[key]}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.ask}>
          <label htmlFor={`${uid}-ask`} className={styles.srOnly}>
            {t.askLabel}
          </label>
          <input
            id={`${uid}-ask`}
            className={styles.askInput}
            placeholder={t.askPlaceholder}
            readOnly
            aria-disabled="true"
            aria-describedby={`${uid}-tip`}
            onFocus={() => setTooltip(true)}
            onBlur={() => setTooltip(false)}
            onClick={() => setTooltip(true)}
          />
          <span id={`${uid}-tip`} role="tooltip" className={clsx(styles.tooltip, tooltip && styles.tooltipVisible)}>
            {t.askTooltip}
          </span>
        </div>
      </aside>
    </>
  )
}
