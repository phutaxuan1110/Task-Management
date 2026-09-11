import * as React from 'react'
import { Archive, Copy, MoreHorizontal, PencilLine, RotateCcw, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { useDeleteTask, useDuplicateTask, usePatchTask } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import type { Task } from '@/types'

export function TaskActionsMenu({ task, onDeleted }: { task: Task; onDeleted?: () => void }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const { openEdit } = useTaskDialogs()
  const duplicate = useDuplicateTask()
  const patch = usePatchTask()
  const remove = useDeleteTask()

  const archived = task.status === 'archived'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${task.title}`}
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center border border-transparent transition-colors hover:border-ink hover:bg-ink hover:text-paper"
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => openEdit(task)}>
            <PencilLine className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => duplicate.mutate(task)}>
            <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Duplicate
          </DropdownMenuItem>
          {archived ? (
            <DropdownMenuItem
              onSelect={() =>
                patch.mutate({ taskId: task.id, patch: { status: 'todo' }, successMessage: 'Task restored' })
              }
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() =>
                patch.mutate({ taskId: task.id, patch: { status: 'archived' }, successMessage: 'Task archived' })
              }
            >
              <Archive className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        destructive
        loading={remove.isPending}
        title={`Delete “${task.title}”?`}
        body={`This removes the task and all ${task.subtasks.length} of its subtasks. Deleted tasks cannot be recovered — archive it instead if you only want it out of the way.`}
        confirmLabel="Delete task"
        onConfirm={() =>
          remove.mutate(task.id, {
            onSuccess: () => {
              setConfirmDelete(false)
              onDeleted?.()
            },
          })
        }
      />
    </>
  )
}
