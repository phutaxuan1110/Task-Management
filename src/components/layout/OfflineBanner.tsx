import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div
      role="status"
      className="flex items-center gap-2 border-b border-ink bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-paper"
    >
      <WifiOff className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      Press stopped — you are offline. Anything you type is kept until the connection returns.
    </div>
  )
}
