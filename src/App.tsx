import { Audience } from '@/components/sections/Audience'
import { Demo } from '@/components/sections/Demo'
import { Faq } from '@/components/sections/Faq'
import { Features } from '@/components/sections/Features'
import { FinalCta } from '@/components/sections/FinalCta'
import { Footer } from '@/components/sections/Footer'
import { Header } from '@/components/sections/Header'
import { Hero } from '@/components/sections/Hero'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Principles } from '@/components/sections/Principles'
import { Problem } from '@/components/sections/Problem'
import { Testimonials } from '@/components/sections/Testimonials'
import { content } from '@/content/ru'
import { DemoProvider } from '@/context/DemoContext'
import { WaitlistProvider } from '@/context/WaitlistContext'

export default function App() {
  return (
    <WaitlistProvider>
      <DemoProvider>
        <a href="#main" className="skipLink">
          {content.common.skipLink}
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          <Hero />
          <Problem />
          <HowItWorks />
          <Features />
          <Demo />
          <Audience />
          <Principles />
          <Testimonials />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </DemoProvider>
    </WaitlistProvider>
  )
}
