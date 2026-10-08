export type CtaMode = 'onboarding' | 'waitlist'

export const config = {
  ctaMode: 'onboarding' as CtaMode,
  onboardingUrl: '/onboarding', // TODO: реальный URL приложения
  heroVariant: 0,
}
