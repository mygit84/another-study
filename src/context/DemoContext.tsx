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
  selectedDish: DishId | null
  /** Выбранная ячейка недели: `${day}-${slot}` */
  selectedCell: string | null
  /** Панель ассистента как overlay (планшет/мобильный); на desktop она видна всегда. */
  assistantOpen: boolean
  today: Record<MealSlot, DishId>
  guests: boolean
  toastKey: number
}

/** Действия стабильны между рендерами: компоненты, которым нужны только они, не перерисовываются при смене состояния. */
interface DemoActions {
  setTab: (tab: AppShellTab) => void
  selectDish: (dish: DishId, cell?: string) => void
  setAssistantOpen: (open: boolean) => void
  replaceMeal: (slot: MealSlot) => void
  setGuests: (value: boolean) => void
  applyQuickEdit: (edit: QuickEdit) => void
}

const DemoStateContext = createContext<DemoState | null>(null)
const DemoActionsContext = createContext<DemoActions | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<AppShellTab>('today')
  const [selectedDish, setSelectedDish] = useState<DishId | null>(week[TODAY_INDEX].breakfast)
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [today, setToday] = useState<Record<MealSlot, DishId>>({ ...week[TODAY_INDEX] })
  const [guests, setGuests] = useState(false)
  const [toastKey, setToastKey] = useState(0)

  // Актуальные значения для колбэков, чтобы те не пересоздавались при каждой смене состояния
  const tabRef = useRef(tab)
  const todayRef = useRef(today)
  useEffect(() => {
    tabRef.current = tab
    todayRef.current = today
  }, [tab, today])

  const setTab = useCallback((next: AppShellTab) => {
    if (next !== tabRef.current) track('demo_tab_change', { tab: next })
    setTabState(next)
  }, [])

  const selectDish = useCallback((dish: DishId, cell?: string) => {
    setSelectedDish(dish)
    setSelectedCell(cell ?? null)
  }, [])

  const replaceMeal = useCallback((slot: MealSlot) => {
    const list = todayAlternatives[slot]
    const nextDish = list[(list.indexOf(todayRef.current[slot]) + 1) % list.length]
    setToday((prev) => ({ ...prev, [slot]: nextDish }))
    setSelectedDish(nextDish)
  }, [])

  const applyQuickEdit = useCallback((edit: QuickEdit) => {
    track('demo_quick_edit', { chip: edit })
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

  const state = useMemo<DemoState>(
    () => ({ tab, selectedDish, selectedCell, assistantOpen, today, guests, toastKey }),
    [tab, selectedDish, selectedCell, assistantOpen, today, guests, toastKey],
  )

  const actions = useMemo<DemoActions>(
    () => ({ setTab, selectDish, setAssistantOpen, replaceMeal, setGuests, applyQuickEdit }),
    [setTab, selectDish, replaceMeal, applyQuickEdit],
  )

  return (
    <DemoActionsContext.Provider value={actions}>
      <DemoStateContext.Provider value={state}>{children}</DemoStateContext.Provider>
    </DemoActionsContext.Provider>
  )
}

export function useDemoState() {
  const ctx = useContext(DemoStateContext)
  if (!ctx) throw new Error('useDemoState must be used inside DemoProvider')
  return ctx
}

export function useDemoActions() {
  const ctx = useContext(DemoActionsContext)
  if (!ctx) throw new Error('useDemoActions must be used inside DemoProvider')
  return ctx
}
