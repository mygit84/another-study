import clsx from 'clsx'
import { content } from '@/content/ru'
import { useWaitlist } from '@/context/WaitlistContext'
import { track } from '@/lib/analytics'
import { config } from '@/lib/config'
import { Button } from '../Button'
import styles from './Cta.module.scss'

export type CtaId = 'cta-header' | 'cta-hero' | 'cta-demo' | 'cta-final'

interface CtaProps {
  id: CtaId
  label: string
  note?: string
  size?: 'md' | 'lg'
  align?: 'start' | 'center'
  className?: string
}

/** Primary CTA: ссылка на онбординг или кнопка формы ожидания — по config.ctaMode. */
export function Cta({ id, label, note, size = 'lg', align = 'start', className }: CtaProps) {
  const { open } = useWaitlist()
  const isWaitlist = config.ctaMode === 'waitlist'
  const text = isWaitlist ? content.cta.waitlist : label

  const button = isWaitlist ? (
    <Button
      id={id}
      size={size}
      onClick={() => {
        track('cta_click', { id })
        open()
      }}
    >
      {text}
    </Button>
  ) : (
    <Button id={id} size={size} href={config.onboardingUrl} onClick={() => track('cta_click', { id })}>
      {text}
    </Button>
  )

  if (!note) return button
  return (
    <div className={clsx(styles.wrap, align === 'center' && styles.center, className)}>
      {button}
      <p className={styles.note}>{note}</p>
    </div>
  )
}
