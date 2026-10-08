import clsx from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.scss'

interface BaseProps {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  children: ReactNode
  className?: string
}

type AsLink = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type AsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

export type ButtonProps = AsLink | AsButton

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  const cls = clsx(styles.button, styles[variant], styles[size], className)
  if (rest.href !== undefined) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
