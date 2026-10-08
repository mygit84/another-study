import { CircleCheck, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { content } from '@/content/ru'
import { track } from '@/lib/analytics'
import { Button } from '../Button'
import styles from './WaitlistModal.module.scss'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface WaitlistModalProps {
  open: boolean
  onClose: () => void
}

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const t = content.waitlist
  const ref = useRef<HTMLDialogElement>(null)
  const uid = useId()
  const [email, setEmail] = useState('')
  const [goal, setGoal] = useState(t.goals[0])
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const emailValid = EMAIL_RE.test(email.trim())
  const emailError = touched && !emailValid
  const consentError = touched && !consent

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!emailValid || !consent) return
    // TODO: реальная отправка формы
    console.info('[waitlist]', { email: email.trim(), goal })
    track('waitlist_submit')
    setDone(true)
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={`${uid}-title`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.body}>
        <button type="button" className={styles.close} onClick={onClose} aria-label={t.close}>
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {done ? (
          <div className={styles.success}>
            <CircleCheck size={40} strokeWidth={1.75} aria-hidden="true" className={styles.successIcon} />
            <h2 id={`${uid}-title`} className={styles.title}>
              {t.successTitle}
            </h2>
            <p className={styles.text}>{t.successText}</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <h2 id={`${uid}-title`} className={styles.title}>
              {t.title}
            </h2>
            <p className={styles.text}>{t.text}</p>

            <div className={styles.field}>
              <label htmlFor={`${uid}-email`}>{t.emailLabel}</label>
              <input
                id={`${uid}-email`}
                type="email"
                autoComplete="email"
                required
                className={styles.input}
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailError}
                aria-describedby={emailError ? `${uid}-email-error` : undefined}
              />
              {emailError && (
                <p id={`${uid}-email-error`} className={styles.error}>
                  {t.emailError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor={`${uid}-goal`}>{t.goalLabel}</label>
              <select
                id={`${uid}-goal`}
                className={styles.input}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                {t.goals.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  aria-invalid={consentError}
                  aria-describedby={consentError ? `${uid}-consent-error` : undefined}
                />
                <span>
                  {t.consentBefore}
                  <a href="#privacy">{t.consentLink}</a>
                </span>
              </label>
              {consentError && (
                <p id={`${uid}-consent-error`} className={styles.error}>
                  {t.consentError}
                </p>
              )}
            </div>

            <Button type="submit" size="lg">
              {t.submit}
            </Button>
          </form>
        )}
      </div>
    </dialog>
  )
}
