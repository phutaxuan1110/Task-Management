import { Archive, CheckCircle2, CircleAlert, Copy, PencilLine, RotateCcw } from 'lucide-react'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UrgencyBadge } from '@/components/tasks/UrgencyBadge'
import { StatusBadge } from '@/components/tasks/StatusBadge'
import { SubtaskList } from '@/components/tasks/SubtaskList'
import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { useSetTaskStatus, useDuplicateTask, usePatchTask, useTask } from '@/features/tasks/hooks'
import { formatDateShort, formatTime } from '@/utils/date'
import { taskIsOverdue, taskProgress } from '@/utils/task'

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-2">
      <dt className="label-meta">{label}</dt>
      <dd className="font-body text-sm text-ink">{value}</dd>
    </div>
  )
}

export function TaskDetailDialog() {
  const { detailId, closeAll, openEdit, openDetail } = useTaskDialogs()
  const { data: task } = useTask(detailId)
  const setStatus = useSetTaskStatus()
  const patch = usePatchTask()
  const duplicate = useDuplicateTask()

  if (!detailId || !task) return null

  const progress = taskProgress(task)
  const completed = task.status === 'completed'
  const overdue = taskIsOverdue(task)
  const allStepsDone = progress.total > 0 && progress.done === progress.total
  const openSteps = progress.total - progress.done

  return (
    <Dialog open onOpenChange={(next) => (!next ? closeAll() : undefined)}>
      <DialogContent aria-describedby={undefined} className="sm:w-[min(720px,94vw)]">
        <DialogHeader
          eyebrow={`${task.category?.name ?? 'Uncategorised'} · Filed ${formatDateShort(task.created_at.slice(0, 10))}`}
          title={task.title}
        />

        <DialogBody className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge urgency={task.urgency} />
            <StatusBadge status={task.status} />
            {overdue ? (
              <span className="inline-flex items-center gap-1 border border-accent px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                <CircleAlert className="h-3 w-3" strokeWidth={2} aria-hidden />
                Overdue
              </span>
            ) : null}
            <span className="ml-auto">
              <TaskActionsMenu task={task} onDeleted={closeAll} />
            </span>
          </div>

          {task.description ? (
            <p className="drop-cap border-y border-ink py-4 font-body text-sm leading-relaxed text-ink sm:text-base">
              {task.description}
            </p>
          ) : (
            <p className="border-y border-rule py-3 font-body text-sm text-neutral-600">
              No description. Add context so future-you knows what this was about.
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <dl>
              <Line label="Start" value={formatDateShort(task.start_date)} />
              <Line label="Due" value={formatDateShort(task.due_date)} />
              <Line label="Start time" value={formatTime(task.start_time) ?? '—'} />
              <Line label="Due time" value={formatTime(task.due_time) ?? '—'} />
            </dl>
            <dl>
              <Line label="Category" value={task.category?.name ?? 'Uncategorised'} />
              <Line label="Created" value={new Date(task.created_at).toLocaleString()} />
              <Line label="Last change" value={new Date(task.updated_at).toLocaleString()} />
              <Line
                label="Completed"
                value={task.completed_at ? new Date(task.completed_at).toLocaleString() : '—'}
              />
            </dl>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="label-meta">Progress</p>
              <p className="font-mono text-[11px] tracking-widest">
                {progress.done}/{progress.total || 0} · {progress.percent}%
              </p>
            </div>
            <Progress value={progress.percent} className="h-3" label={`${task.title} progress`} />
          </div>

          {allStepsDone && !completed ? (
            <div className="flex flex-col gap-2 border-l-4 border-ink bg-neutral-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body text-sm">Every step is ticked. Close the task out?</p>
              <Button
                size="sm"
                onClick={() => setStatus(task.id, 'completed', 'Task completed')}
              >
                Mark complete
              </Button>
            </div>
          ) : null}

          <SubtaskList task={task} />
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => duplicate.mutate(task)}>
            <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Duplicate
          </Button>
          {task.status !== 'archived' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                patch.mutate({ taskId: task.id, patch: { status: 'archived' }, successMessage: 'Task archived' })
              }
            >
              <Archive className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Archive
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              openEdit(task)
              openDetail(task.id)
            }}
          >
            <PencilLine className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Edit task
          </Button>
          <Button
            size="sm"
            onClick={() =>
              setStatus(
                task.id,
                completed ? 'todo' : 'completed',
                completed ? 'Reopened' : openSteps > 0 ? `Completed with ${openSteps} open steps` : 'Task completed',
              )
            }
          >
            {completed ? (
              <>
                <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Reopen
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Mark complete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
