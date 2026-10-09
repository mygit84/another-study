import { Beams } from '@/components/backgrounds/Beams'
import { AppShell } from '@/components/app-shell/AppShell'
import { Cta } from '@/components/ui/Cta'
import { Section } from '@/components/ui/Section'
import { content } from '@/content/ru'
import styles from './Demo.module.scss'

export function Demo() {
  return (
    <Section id="demo" title={content.demo.title} subtitle={content.demo.subtitle} tone="deep" background={<Beams />} wide>
      <AppShell variant="interactive" />
      <div className={styles.cta}>
        <Cta id="cta-demo" label={content.cta.demo} note={content.cta.demoNote} tone="onDeep" className={styles.ctaInner} />
      </div>
    </Section>
  )
}
