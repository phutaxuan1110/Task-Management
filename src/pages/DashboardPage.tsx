import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ViewSwitcher } from '@/components/layout/ViewSwitcher'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { TaskListSkeleton } from '@/components/ui/skeleton'
import { QuickAdd } from '@/components/tasks/QuickAdd'
import { TaskListItem } from '@/components/tasks/TaskListItem'
import { useTasks } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { useProfile } from '@/features/profile/hooks'
import { useAuth } from '@/features/auth/AuthProvider'
import { toDateOnly } from '@/utils/date'
import { taskIsOverdue, urgencyWeight } from '@/utils/task'
import type { Task } from '@/types'

function Figure({ value, label, alert = false }: { value: string; label: string; alert?: boolean }) {
  return (
    <div className="border-b border-r border-ink px-3 py-4">
      <p className={`font-serif text-4xl font-black leading-none tracking-tighter sm:text-5xl ${alert ? 'text-accent' : ''}`}>
        {value}
      </p>
      <p className="label-meta mt-2">{label}</p>
    </div>
  )
}

function Column({ title, kicker, tasks, empty }: { title: string; kicker: string; tasks: Task[]; empty: string }) {
  return (
    <section className="min-w-0">
      <header className="rule-heavy mb-1 flex items-baseline justify-between pb-2">
        <div>
          <p className="label-meta">{kicker}</p>
          <h2 className="font-serif text-2xl font-black tracking-tight">{title}</h2>
        </div>
        <span className="font-mono text-[11px] tracking-widest">{String(tasks.length).padStart(2, '0')}</span>
      </header>
      {tasks.length ? (
        <ul className="border-t border-ink">
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </ul>
      ) : (
        <p className="border-y border-rule py-4 font-body text-sm text-neutral-600">{empty}</p>
      )}
    </section>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()
  const { openCreate } = useTaskDialogs()

  const name = profile?.display_name || user?.email?.split('@')[0] || 'reader'
  const today = toDateOnly(new Date())

  const live = (tasks ?? []).filter((task) => task.status !== 'archived')
  const open = live.filter((task) => task.status !== 'completed')
  const dueToday = open
    .filter((task) => task.due_date === today || (task.start_date && task.due_date && task.start_date <= today && task.due_date >= today))
    .sort((a, b) => urgencyWeight(a) - urgencyWeight(b))
  const overdue = open.filter(taskIsOverdue)
  const upcoming = open
    .filter((task) => task.due_date && task.due_date > today)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
    .slice(0, 6)
  const pressing = open.filter((task) => task.urgency === 'critical' || task.urgency === 'high')
  const completionRate = live.length
    ? Math.round((live.filter((task) => task.status === 'completed').length / live.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      <PageHeader
        kicker={`Front page · Filed for ${name}`}
        title={`Good day, ${name}.`}
        standfirst={
          open.length
            ? `${open.length} open ${open.length === 1 ? 'item' : 'items'} on the desk. ${overdue.length ? `${overdue.length} overdue.` : 'Nothing overdue.'}`
            : 'Nothing open. A rare quiet edition.'
        }
        actions={<ViewSwitcher />}
      />

      {isError ? <ErrorState error={error} onRetry={() => refetch()} /> : null}

      {isLoading ? (
        <TaskListSkeleton rows={4} />
      ) : live.length === 0 ? (
        <div className="space-y-6">
          <QuickAdd />
          <EmptyState
            figure="Fig. 1.1"
            headline="No copy on the desk yet"
            body="File your first task and it will appear here, on the board, and on the calendar. Add steps to any task and the progress bar does the counting."
            action={
              <Button size="lg" onClick={() => openCreate()}>
                <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                Create your first task
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <section aria-label="Today in numbers" className="grid grid-cols-2 border-l border-t border-ink sm:grid-cols-4">
            <Figure value={String(dueToday.length).padStart(2, '0')} label="Due today" />
            <Figure value={String(overdue.length).padStart(2, '0')} label="Overdue" alert={overdue.length > 0} />
            <Figure value={String(pressing.length).padStart(2, '0')} label="Critical & high" />
            <Figure value={`${completionRate}%`} label="Completed" />
          </section>

          <QuickAdd />

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Column
                kicker="Today"
                title="On the desk"
                tasks={dueToday}
                empty="Nothing is due today. Pull something forward from Upcoming, or enjoy it."
              />
            </div>
            <div className="lg:col-span-5 lg:border-l lg:border-ink lg:pl-6">
              <Column
                kicker="Upcoming"
                title="Later this run"
                tasks={upcoming}
                empty="No dated work ahead. Add due dates to see them scheduled here."
              />
            </div>
          </div>

          {overdue.length ? (
            <section>
              <header className="rule-heavy mb-1 flex items-baseline justify-between pb-2">
                <div>
                  <p className="label-meta text-accent">Stop press</p>
                  <h2 className="font-serif text-2xl font-black tracking-tight">Overdue</h2>
                </div>
                <Link to="/tasks" className="label-meta underline decoration-accent decoration-2 underline-offset-4">
                  See all tasks
                </Link>
              </header>
              <ul className="border-t border-ink">
                {overdue.map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
