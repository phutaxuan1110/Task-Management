import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { TaskListSkeleton } from '@/components/ui/skeleton'
import { TaskListItem } from '@/components/tasks/TaskListItem'
import { useTasks } from '@/features/tasks/hooks'

export function ArchivedPage() {
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()
  const archived = (tasks ?? []).filter((task) => task.status === 'archived')

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Back issues"
        title="Archived"
        standfirst="Work you have put away. Restore anything from its actions menu, or delete it for good."
      />

      {isError ? <ErrorState error={error} onRetry={() => refetch()} /> : null}

      {isLoading ? (
        <TaskListSkeleton rows={3} />
      ) : archived.length ? (
        <ul className="border-t border-ink">
          {archived.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </ul>
      ) : (
        <EmptyState
          figure="Fig. 5.1"
          headline="The archive is empty"
          body="Archiving keeps a task out of the list, board and calendar without deleting it."
        />
      )}
    </div>
  )
}
