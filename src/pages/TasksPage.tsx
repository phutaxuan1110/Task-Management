import * as React from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ViewSwitcher } from '@/components/layout/ViewSwitcher'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { TaskListSkeleton } from '@/components/ui/skeleton'
import { TaskFilterBar } from '@/components/tasks/TaskFilterBar'
import { TaskListItem } from '@/components/tasks/TaskListItem'
import { STATUS, URGENCY, URGENCY_ORDER } from '@/lib/constants'
import { useTasks } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { defaultFilters, filterAndSortTasks } from '@/utils/task'
import type { Task, TaskStatus } from '@/types'

function groupTasks(tasks: Task[], groupBy: 'none' | 'urgency' | 'status'): { key: string; label: string; tasks: Task[] }[] {
  if (groupBy === 'urgency') {
    return URGENCY_ORDER.map((urgency) => ({
      key: urgency,
      label: `${URGENCY[urgency].rank} · ${URGENCY[urgency].label}`,
      tasks: tasks.filter((task) => task.urgency === urgency),
    })).filter((group) => group.tasks.length)
  }
  if (groupBy === 'status') {
    const keys: TaskStatus[] = ['todo', 'in_progress', 'completed']
    return keys
      .map((status) => ({ key: status, label: STATUS[status].label, tasks: tasks.filter((task) => task.status === status) }))
      .filter((group) => group.tasks.length)
  }
  return [{ key: 'all', label: '', tasks }]
}

export function TasksPage() {
  const [filters, setFilters] = React.useState(defaultFilters)
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()
  const { openCreate } = useTaskDialogs()

  const visible = React.useMemo(() => filterAndSortTasks(tasks ?? [], filters), [tasks, filters])
  const groups = groupTasks(visible, filters.groupBy)
  const hasAnyTask = (tasks ?? []).some((task) => task.status !== 'archived')

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Section B · The full file"
        title="My tasks"
        standfirst="Sort by urgency or deadline, group the file, and narrow it down with filters. Completed work stays visible unless you hide it."
        actions={
          <>
            <ViewSwitcher />
            <Button onClick={() => openCreate()}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              New task
            </Button>
          </>
        }
      />

      <TaskFilterBar filters={filters} onChange={setFilters} resultCount={visible.length} />

      {isError ? <ErrorState error={error} onRetry={() => refetch()} /> : null}

      {isLoading ? (
        <TaskListSkeleton />
      ) : !hasAnyTask ? (
        <EmptyState
          figure="Fig. 2.1"
          headline="The file is empty"
          body="Create a task to start the file. Each task can hold as many steps as you need."
          action={
            <Button size="lg" onClick={() => openCreate()}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Create your first task
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          figure="Fig. 2.2"
          headline="Nothing matches those filters"
          body="Widen the date range, clear a filter, or search for a different word."
          action={
            <Button variant="outline" onClick={() => setFilters(defaultFilters())}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key}>
              {group.label ? (
                <header className="flex items-baseline justify-between border-b-4 border-ink pb-2">
                  <h2 className="font-serif text-2xl font-black tracking-tight">{group.label}</h2>
                  <span className="font-mono text-[11px] tracking-widest">
                    {String(group.tasks.length).padStart(2, '0')}
                  </span>
                </header>
              ) : null}
              <ul className="border-t border-ink">
                {group.tasks.map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
