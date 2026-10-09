import clsx from 'clsx'
import { content } from '@/content/ru'
import styles from './Logo.module.scss'

interface LogoProps {
  /** Показывать знак-лист рядом с названием */
  mark?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Logo({ mark = true, size = 'md', className }: LogoProps) {
  return (
    <span className={clsx(styles.logo, styles[size], className)}>
      {mark && (
        <span className={styles.mark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
            <path d="M5 19l7-7" />
          </svg>
        </span>
      )}
      {content.common.logo}
    </span>
  )
}
