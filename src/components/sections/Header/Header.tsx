import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Cta } from '@/components/ui/Cta'
import { content } from '@/content/ru'
import styles from './Header.module.scss'

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={clsx(styles.header, scrolled && styles.scrolled)}>
      <div className={styles.inner}>
        <a href="#hero" className={styles.logo} aria-label={content.common.homeLabel}>
          <span className={styles.logoMark} aria-hidden="true" />
          {content.common.logo}
        </a>
        <nav className={styles.nav} aria-label={content.header.navLabel}>
          <ul>
            {content.header.nav.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <Cta id="cta-header" label={content.cta.header} size="md" />
      </div>
    </header>
  )
}
