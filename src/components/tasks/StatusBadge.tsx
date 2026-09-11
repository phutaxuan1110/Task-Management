import { STATUS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/types'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge className="border-neutral-400 text-neutral-600">
      <span className="sr-only">Status</span>
      {STATUS[status].label}
    </Badge>
  )
}
