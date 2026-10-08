import { AppShell } from '@/components/app-shell/AppShell'
import { Cta } from '@/components/ui/Cta'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Demo.module.scss'

export function Demo() {
  return (
    <Section id="demo" title={content.demo.title} subtitle={content.demo.subtitle}>
      <AppShell variant="interactive" />
      <div className={styles.cta}>
        <Cta id="cta-demo" label={content.cta.demo} note={content.cta.demoNote} align="center" />
      </div>
    </Section>
  )
}
