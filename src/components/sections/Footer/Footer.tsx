import { Logo } from '@/components/ui/Logo'
import { content } from '@/content/ru'
import styles from './Footer.module.scss'

export function Footer() {
  const f = content.footer
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo mark={false} className={styles.logo} />
            <p className={styles.tagline}>{f.tagline}</p>
          </div>
          <nav aria-label={f.linksLabel}>
            <ul className={styles.links}>
              {f.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className={styles.disclaimer}>{content.disclaimer}</p>
        <p className={styles.bottom}>
          <span>{f.copyright}</span>
          <span>{f.age}</span>
        </p>
      </div>
    </footer>
  )
}
