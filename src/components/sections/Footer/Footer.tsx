import { content } from '@/content/ru'
import styles from './Footer.module.scss'

export function Footer() {
  const f = content.footer
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <span className={styles.logoMark} aria-hidden="true" />
            {content.common.logo}
          </span>
          <p className={styles.tagline}>{f.tagline}</p>
        </div>
        <p className={styles.disclaimer}>{content.disclaimer}</p>
        <nav aria-label={f.linksLabel}>
          <ul className={styles.links}>
            {f.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.bottom}>
          <span>{f.copyright}</span>
          <span className={styles.age}>{f.age}</span>
        </div>
      </div>
    </footer>
  )
}
