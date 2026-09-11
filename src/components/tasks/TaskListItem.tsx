import { CalendarDays, CircleAlert, ListChecks } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { UrgencyBadge } from '@/components/tasks/UrgencyBadge'
import { StatusBadge } from '@/components/tasks/StatusBadge'
import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu'
import { URGENCY } from '@/lib/constants'
import { useSetTaskStatus } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { formatDateHuman } from '@/utils/date'
import { taskIsOverdue, taskProgress } from '@/utils/task'
import type { Task } from '@/types'

export function TaskListItem({ task }: { task: Task }) {
  const { openDetail } = useTaskDialogs()
  const setStatus = useSetTaskStatus()
  const progress = taskProgress(task)
  const overdue = taskIsOverdue(task)
  const completed = task.status === 'completed'

  return (
    <li className="group relative border-b border-ink bg-paper transition-colors hover:bg-neutral-100">
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: task.color ?? URGENCY[task.urgency].hex }}
        aria-hidden
      />
      <div className="flex items-start gap-3 pl-4 pr-1 py-4 sm:gap-4 sm:pl-5">
        <div className="pt-1">
          <Checkbox
            checked={completed}
            onCheckedChange={() =>
              setStatus(task.id, completed ? 'todo' : 'completed', completed ? 'Marked as to do' : 'Task completed')
            }
            aria-label={completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => openDetail(task.id)}
            className="block max-w-full text-left"
          >
            <h3
              className={`truncate font-serif text-lg font-bold leading-snug tracking-tight sm:text-xl ${completed ? 'text-neutral-500 line-through' : ''}`}
            >
              {task.title}
            </h3>
          </button>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <UrgencyBadge urgency={task.urgency} />
            <StatusBadge status={task.status} />
            <span className="label-meta inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {formatDateHuman(task.due_date)}
            </span>
            {task.category ? (
              <span className="label-meta">{task.category.name}</span>
            ) : (
              <span className="label-meta text-neutral-400">Uncategorised</span>
            )}
            {progress.total > 0 ? (
              <span className="label-meta inline-flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                {progress.done}/{progress.total} steps
              </span>
            ) : null}
            {overdue ? (
              <span className="inline-flex items-center gap-1 border border-accent px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                <CircleAlert className="h-3 w-3" strokeWidth={2} aria-hidden />
                Overdue
              </span>
            ) : null}
          </div>

          {progress.total > 0 ? (
            <div className="mt-3 flex items-center gap-3">
              <Progress value={progress.percent} className="max-w-[260px]" label={`${task.title} progress`} />
              <span className="font-mono text-[11px] tracking-widest">{progress.percent}%</span>
            </div>
          ) : null}
        </div>

        <TaskActionsMenu task={task} />
      </div>
    </li>
  )
}
