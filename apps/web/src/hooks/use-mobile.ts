import { useEffect, useState } from "react"

/**
 * Custom hook to detect if the screen is in mobile breakpoint
 * Breakpoint: < 768px (md breakpoint in Tailwind)
 *
 * @returns {boolean} true if screen width is less than 768px
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
