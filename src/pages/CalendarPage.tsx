import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ViewSwitcher } from '@/components/layout/ViewSwitcher'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarView } from '@/components/calendar/CalendarView'
import { useTasks } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'

export function CalendarPage() {
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()
  const { openCreate } = useTaskDialogs()
  const dated = (tasks ?? []).filter((task) => task.status !== 'archived' && (task.due_date || task.start_date))

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Section D · The diary"
        title="Calendar"
        standfirst="Tasks sit on their due date, or span the range between start and due. Drag one to another day to reschedule it; tap an empty day to file something new."
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

      {isError ? <ErrorState error={error} onRetry={() => refetch()} /> : null}

      {isLoading ? (
        <Skeleton className="h-[420px] w-full" />
      ) : dated.length === 0 ? (
        <EmptyState
          figure="Fig. 4.1"
          headline="No dated work yet"
          body="Give a task a due date and it will be printed on this page. Tasks with both a start and a due date show as a range."
          action={
            <Button size="lg" onClick={() => openCreate()}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Schedule a task
            </Button>
          }
        />
      ) : (
        <CalendarView tasks={tasks ?? []} />
      )}
    </div>
  )
}
