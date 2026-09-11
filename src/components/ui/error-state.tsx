import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toMessage } from '@/lib/errors'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="border-4 border-accent p-5" role="alert">
      <p className="label-meta text-accent">Press failure</p>
      <h2 className="font-serif text-2xl font-black tracking-tight">This section could not be printed</h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-neutral-700">{toMessage(error)}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
