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
  variant?: 'primary' | 'contrast'
  align?: 'start' | 'center'
  /** onDeep — микротекст на тёмной секции */
  tone?: 'default' | 'onDeep'
  className?: string
}

/** Primary CTA: ссылка на онбординг или кнопка формы ожидания — по config.ctaMode. */
export function Cta({
  id,
  label,
  note,
  size = 'lg',
  variant = 'primary',
  align = 'start',
  tone = 'default',
  className,
}: CtaProps) {
  const { open } = useWaitlist()
  const isWaitlist = config.ctaMode === 'waitlist'
  const text = isWaitlist ? content.cta.waitlist : label

  const button = isWaitlist ? (
    <Button
      id={id}
      size={size}
      variant={variant}
      className={styles.button}
      onClick={() => {
        track('cta_click', { id })
        open()
      }}
    >
      {text}
    </Button>
  ) : (
    <Button
      id={id}
      size={size}
      variant={variant}
      className={styles.button}
      href={config.onboardingUrl}
      onClick={() => track('cta_click', { id })}
    >
      {text}
    </Button>
  )

  if (!note) return button
  return (
    <div className={clsx(styles.wrap, align === 'center' && styles.center, className)}>
      {button}
      <p className={clsx(styles.note, tone === 'onDeep' && styles.noteOnDeep)}>{note}</p>
    </div>
  )
}
