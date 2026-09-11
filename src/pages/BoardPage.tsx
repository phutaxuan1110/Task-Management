import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ViewSwitcher } from '@/components/layout/ViewSwitcher'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { BoardView } from '@/components/tasks/BoardView'
import { useTasks } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'

export function BoardPage() {
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()
  const { openCreate } = useTaskDialogs()
  const live = (tasks ?? []).filter((task) => task.status !== 'archived')

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Section C · The stone"
        title="Board"
        standfirst="Drag a task between columns to change its status. Changes save straight away and roll back if the network drops. Archived work is kept off the board."
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
        <div className="grid gap-3 lg:grid-cols-3">
          {[0, 1, 2].map((column) => (
            <div key={column} className="space-y-3 border border-ink p-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : live.length === 0 ? (
        <EmptyState
          figure="Fig. 3.1"
          headline="Nothing on the board"
          body="Tasks appear in the To do column as soon as you create them."
          action={
            <Button size="lg" onClick={() => openCreate()}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Create your first task
            </Button>
          }
        />
      ) : (
        <BoardView tasks={live} />
      )}
    </div>
  )
}
