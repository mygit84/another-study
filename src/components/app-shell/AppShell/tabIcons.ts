import {
  CalendarDays,
  ChefHat,
  History,
  Lightbulb,
  ShoppingBasket,
  SlidersHorizontal,
  Sun,
  User,
  type LucideIcon,
} from 'lucide-react'
import type { AppShellTab } from '@/context/DemoContext'

/** Иконки вкладок в порядке сайдбара; их же берут карточки Features, чтобы карточка и вкладка узнавались. */
export const TAB_ICONS: Record<AppShellTab, LucideIcon> = {
  today: Sun,
  week: CalendarDays,
  shopping: ShoppingBasket,
  recipes: ChefHat,
  context: SlidersHorizontal,
  history: History,
  learn: Lightbulb,
  profile: User,
}
