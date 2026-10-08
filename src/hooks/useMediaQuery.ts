import { useEffect, useState } from 'react'

/** SSR-safe: на сервере и при первом рендере возвращает `serverValue`. */
export function useMediaQuery(query: string, serverValue = false) {
  const [matches, setMatches] = useState(serverValue)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])
  return matches
}
