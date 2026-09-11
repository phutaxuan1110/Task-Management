import { CalendarDays, CircleAlert, GripVertical } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { UrgencyBadge } from '@/components/tasks/UrgencyBadge'
import { URGENCY } from '@/lib/constants'
import { formatDateHuman } from '@/utils/date'
import { taskIsOverdue, taskProgress } from '@/utils/task'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onOpen: () => void
  dragHandle?: React.HTMLAttributes<HTMLButtonElement>
  dragging?: boolean
}

export function TaskCard({ task, onOpen, dragHandle, dragging }: TaskCardProps) {
  const progress = taskProgress(task)
  const overdue = taskIsOverdue(task)

  return (
    <article
      className={`hard-shadow-hover border border-ink bg-paper ${dragging ? 'opacity-60' : ''}`}
      style={{ borderLeft: `4px solid ${task.color ?? URGENCY[task.urgency].hex}` }}
    >
      <div className="flex items-start gap-1 px-2 pt-2">
        <UrgencyBadge urgency={task.urgency} />
        {overdue ? (
          <span className="inline-flex items-center gap-1 border border-accent px-1 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
            <CircleAlert className="h-3 w-3" strokeWidth={2} aria-hidden />
            Late
          </span>
        ) : null}
        {dragHandle ? (
          <button
            type="button"
            className="ml-auto flex h-8 w-8 cursor-grab items-center justify-center text-neutral-500 hover:text-ink"
            aria-label={`Move ${task.title}`}
            {...dragHandle}
          >
            <GripVertical className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
      </div>

      <button type="button" onClick={onOpen} className="block w-full px-2 pb-2 pt-1 text-left">
        <h3 className="font-serif text-base font-bold leading-snug tracking-tight">{task.title}</h3>
        <p className="label-meta mt-1.5 inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          {formatDateHuman(task.due_date)}
          {task.category ? ` · ${task.category.name}` : ''}
        </p>
        {progress.total > 0 ? (
          <div className="mt-2 flex items-center gap-2">
            <Progress value={progress.percent} className="h-1.5" label={`${task.title} progress`} />
            <span className="font-mono text-[10px] tracking-widest">
              {progress.done}/{progress.total}
            </span>
          </div>
        ) : null}
      </button>
    </article>
  )
}
