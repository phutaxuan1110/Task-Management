import { useTasks } from '@/features/tasks/hooks'
import { taskIsOverdue, taskProgress } from '@/utils/task'
import { toDateOnly } from '@/utils/date'

/**
 * The one loud element on the page: a stock-ticker crawl of today's numbers.
 * Everything else stays quiet black-on-paper.
 */
export function Ticker() {
  const { data: tasks = [] } = useTasks()
  const today = toDateOnly(new Date())
  const active = tasks.filter((task) => task.status !== 'archived')
  const dueToday = active.filter((task) => task.due_date === today && task.status !== 'completed').length
  const overdue = active.filter(taskIsOverdue).length
  const critical = active.filter((task) => task.urgency === 'critical' && task.status !== 'completed').length
  const completed = active.filter((task) => task.status === 'completed').length
  const steps = active.reduce((sum, task) => sum + taskProgress(task).done, 0)

  const items = [
    { label: 'Due today', value: dueToday, alert: false },
    { label: 'Overdue', value: overdue, alert: overdue > 0 },
    { label: 'Critical open', value: critical, alert: critical > 0 },
    { label: 'Completed', value: completed, alert: false },
    { label: 'Steps ticked', value: steps, alert: false },
    { label: 'On file', value: active.length, alert: false },
  ]

  const strip = (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2 whitespace-nowrap px-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">{item.label}</span>
          <span className={`font-mono text-xs font-bold ${item.alert ? 'text-accent' : 'text-paper'}`}>
            {String(item.value).padStart(2, '0')}
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="overflow-hidden border-b border-ink bg-ink py-1.5" role="status" aria-live="off">
      <div className="flex w-max animate-ticker">
        {strip}
        {strip}
      </div>
      <span className="sr-only">
        {dueToday} due today, {overdue} overdue, {critical} critical open.
      </span>
    </div>
  )
}
