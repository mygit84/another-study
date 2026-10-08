import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './Badge.module.scss'

interface BadgeProps {
  children: ReactNode
  tone?: 'info' | 'accent' | 'muted'
  className?: string
}

export function Badge({ children, tone = 'info', className }: BadgeProps) {
  return <span className={clsx(styles.badge, styles[tone], className)}>{children}</span>
}
