import { useEffect, useState } from 'react'
import { ShieldAlert, LogOut, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useEndImpersonation } from '@/hooks/use-impersonate-detection'

/**
 * Impersonate Banner - Professional alert bar when impersonating a user
 *
 * Design:
 * - Full-width amber/warning colored bar at the very top
 * - Properly aligned content with flexbox
 * - Clear visual hierarchy: icon > message > timer > action
 * - Consistent with design system colors
 */
export function ImpersonateBanner() {
  const { isImpersonating, impersonatedUserName, impersonateExpiresAt, clearImpersonation } =
    useAuthStore()
  const endImpersonation = useEndImpersonation()
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isLowTime, setIsLowTime] = useState(false)

  useEffect(() => {
    if (!impersonateExpiresAt) return

    const updateTimer = () => {
      const now = new Date()
      const expiresAt = new Date(impersonateExpiresAt)
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        // Session expired - auto end
        clearImpersonation()
        // Use endImpersonation mutation for proper cleanup
        endImpersonation.mutate()
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)

      // Activate pulse animation when < 5 minutes remaining
      setIsLowTime(minutes < 5)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [impersonateExpiresAt, clearImpersonation, endImpersonation])

  if (!isImpersonating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-600 dark:bg-amber-700" role="alert" aria-live="polite">
      {/* Mobile: Compact single row with truncated email */}
      <div className="h-11 px-3 flex items-center justify-between gap-3 sm:hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ShieldAlert className="h-4 w-4 text-amber-100 shrink-0" />
          <span className="text-sm text-white font-medium truncate">
            {impersonatedUserName}
          </span>
          <span className={`text-sm text-amber-200 font-mono shrink-0 ${isLowTime ? 'motion-safe:animate-pulse' : ''}`}>
            {timeRemaining}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => endImpersonation.mutate()}
          disabled={endImpersonation.isPending}
          className="h-8 px-3 bg-white/90 hover:bg-white text-amber-700 font-medium shadow-sm shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Encerrar</span>
        </Button>
      </div>

      {/* Desktop: Full layout */}
      <div className="h-11 px-4 hidden sm:flex items-center justify-between">
        {/* Left: Icon + Message */}
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-4 w-4 text-amber-100 shrink-0" />
          <span className="text-sm font-medium text-white">
            Impersonando:{' '}
            <span className="font-semibold">{impersonatedUserName}</span>
          </span>
        </div>

        {/* Right: Timer + Button */}
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 text-amber-100 ${isLowTime ? 'motion-safe:animate-pulse' : ''}`}>
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm font-mono tabular-nums">{timeRemaining}</span>
          </div>

          {/* End Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => endImpersonation.mutate()}
            disabled={endImpersonation.isPending}
            className="h-7 px-3 bg-white/90 hover:bg-white text-amber-700 font-medium shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Encerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
