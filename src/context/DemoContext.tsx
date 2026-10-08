import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { track } from '@/lib/analytics'
import {
  quickEdits,
  todayAlternatives,
  week,
  TODAY_INDEX,
  type DishId,
  type MealSlot,
  type QuickEdit,
} from '@/mock/demo-data'

export type AppShellTab = 'today' | 'week' | 'shopping' | 'recipes' | 'history' | 'learn' | 'profile' | 'context'

interface DemoState {
  tab: AppShellTab
  setTab: (tab: AppShellTab) => void
  selectedDish: DishId | null
  /** Выбранная ячейка недели: `${day}-${slot}` */
  selectedCell: string | null
  selectDish: (dish: DishId, cell?: string) => void
  /** Панель ассистента как overlay (планшет/мобильный); на desktop она видна всегда. */
  assistantOpen: boolean
  setAssistantOpen: (open: boolean) => void
  today: Record<MealSlot, DishId>
  replaceMeal: (slot: MealSlot) => void
  guests: boolean
  setGuests: (value: boolean) => void
  applyQuickEdit: (edit: QuickEdit) => void
  toastKey: number
}

const DemoContext = createContext<DemoState | null>(null)

interface ProviderProps {
  children: ReactNode
  initialTab?: AppShellTab
  trackEvents?: boolean
}

export function DemoProvider({ children, initialTab = 'today', trackEvents = true }: ProviderProps) {
  const [tab, setTabState] = useState<AppShellTab>(initialTab)
  const [selectedDish, setSelectedDish] = useState<DishId | null>(week[TODAY_INDEX].breakfast)
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [today, setToday] = useState<Record<MealSlot, DishId>>({ ...week[TODAY_INDEX] })
  const [guests, setGuests] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const trackRef = useRef(trackEvents)

  useEffect(() => {
    trackRef.current = trackEvents
  }, [trackEvents])

  const setTab = useCallback(
    (next: AppShellTab) => {
      if (next !== tab && trackRef.current) track('demo_tab_change', { tab: next })
      setTabState(next)
    },
    [tab],
  )

  const selectDish = useCallback((dish: DishId, cell?: string) => {
    setSelectedDish(dish)
    setSelectedCell(cell ?? null)
  }, [])

  const replaceMeal = useCallback(
    (slot: MealSlot) => {
      const list = todayAlternatives[slot]
      const nextDish = list[(list.indexOf(today[slot]) + 1) % list.length]
      setToday((prev) => ({ ...prev, [slot]: nextDish }))
      setSelectedDish(nextDish)
    },
    [today],
  )

  const applyQuickEdit = useCallback((edit: QuickEdit) => {
    if (trackRef.current) track('demo_quick_edit', { chip: edit })
    const change = quickEdits[edit]
    if (change) {
      setToday((prev) => ({ ...prev, [change.slot]: change.dish }))
      setSelectedDish(change.dish)
      setTabState('today')
    } else {
      setGuests(true)
      setTabState('week')
    }
    setToastKey((k) => k + 1)
  }, [])

  const value = useMemo<DemoState>(
    () => ({
      tab,
      setTab,
      selectedDish,
      selectedCell,
      selectDish,
      assistantOpen,
      setAssistantOpen,
      today,
      replaceMeal,
      guests,
      setGuests,
      applyQuickEdit,
      toastKey,
    }),
    [tab, setTab, selectedDish, selectedCell, selectDish, assistantOpen, today, replaceMeal, guests, applyQuickEdit, toastKey],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider')
  return ctx
}
