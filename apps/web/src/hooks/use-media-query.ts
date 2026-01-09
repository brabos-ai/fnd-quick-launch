import { useEffect, useState } from "react"

/**
 * Custom hook to detect if a media query matches
 *
 * @param {string} query - The media query to match (e.g., "(min-width: 768px)")
 * @returns {boolean} true if the media query matches
 *
 * @example
 * const isDesktop = useMediaQuery("(min-width: 1024px)")
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Define listener
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // Add listener
    media.addEventListener("change", listener)

    // Cleanup
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}
