import * as React from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  React.useEffect(() => {
    const list = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(list.matches)
    list.addEventListener('change', handler)
    return () => list.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}
