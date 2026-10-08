import { CircleCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from './Toast.module.scss'

interface ToastProps {
  message: string
  /** Каждое новое значение > 0 показывает тост заново. */
  trigger: number
}

export function Toast({ message, trigger }: ToastProps) {
  const [hiddenFor, setHiddenFor] = useState(0)
  const visible = trigger > 0 && hiddenFor !== trigger

  useEffect(() => {
    if (!trigger) return
    const t = window.setTimeout(() => setHiddenFor(trigger), 2400)
    return () => window.clearTimeout(t)
  }, [trigger])

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {visible && (
        <div key={trigger} className={styles.toast}>
          <CircleCheck size={18} strokeWidth={1.75} aria-hidden="true" />
          {message}
        </div>
      )}
    </div>
  )
}
