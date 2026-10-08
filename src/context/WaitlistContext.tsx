import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { WaitlistModal } from '@/components/ui/WaitlistModal'
import { config } from '@/lib/config'

interface WaitlistState {
  open: () => void
}

const WaitlistContext = createContext<WaitlistState>({ open: () => {} })

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const value = useMemo(() => ({ open }), [open])

  return (
    <WaitlistContext.Provider value={value}>
      {children}
      {config.ctaMode === 'waitlist' && <WaitlistModal open={isOpen} onClose={() => setIsOpen(false)} />}
    </WaitlistContext.Provider>
  )
}

export function useWaitlist() {
  return useContext(WaitlistContext)
}
