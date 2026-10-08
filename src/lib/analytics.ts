export type AnalyticsEvent =
  | 'cta_click'
  | 'demo_tab_change'
  | 'demo_quick_edit'
  | 'feature_card_click'
  | 'faq_open'
  | 'section_view'
  | 'waitlist_submit'

// No-op заглушка: сторонних трекеров и cookie нет.
export function track(event: AnalyticsEvent, props?: Record<string, string | number>) {
  if (import.meta.env.DEV) console.debug('[track]', event, props ?? {})
}
