import { URGENCY } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskUrgency } from '@/types'

/** Rank number + word + fill: urgency never depends on colour alone. */
export function UrgencyBadge({ urgency, className }: { urgency: TaskUrgency; className?: string }) {
  const token = URGENCY[urgency]
  return (
    <Badge className={cn(token.badge, className)}>
      <span aria-hidden>{token.rank}</span>
      <span className="sr-only">Urgency</span>
      {token.label}
    </Badge>
  )
}
