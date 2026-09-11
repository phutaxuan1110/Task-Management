import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { TaskForm } from '@/components/tasks/TaskForm'
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { emptyFormValues, taskToFormValues } from '@/features/tasks/mapper'
import { editionLine } from '@/utils/date'

/**
 * Single mount point for both create and edit, so every surface (dashboard,
 * list, board, calendar, detail) opens the same form.
 */
export function TaskFormDialog() {
  const { createOpen, createPrefill, editing, closeAll } = useTaskDialogs()
  const create = useCreateTask()
  const update = useUpdateTask()

  const open = createOpen || Boolean(editing)
  if (!open) return null

  return (
    <Dialog open onOpenChange={(next) => (!next ? closeAll() : undefined)}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader
          eyebrow={editing ? 'Revised copy' : `Desk copy · ${editionLine()}`}
          title={editing ? 'Edit task' : 'New task'}
        />
        {editing ? (
          <TaskForm
            key={editing.id}
            defaultValues={taskToFormValues(editing)}
            submitLabel="Save changes"
            saving={update.isPending}
            onCancel={closeAll}
            onSubmit={(values) =>
              update.mutate({ task: editing, values }, { onSuccess: () => closeAll() })
            }
          />
        ) : (
          <TaskForm
            defaultValues={emptyFormValues(createPrefill ?? {})}
            submitLabel="Create task"
            saving={create.isPending}
            onCancel={closeAll}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => closeAll() })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
