import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { reportError } from '@/lib/errors'
import { useUserId } from '@/features/auth/AuthProvider'
import { deleteSubtask, insertSubtasks, reorderSubtasks, updateSubtask } from '@/features/subtasks/api'
import type { Subtask, Task } from '@/types'

function useTasksKey() {
  const userId = useUserId()
  return queryKeys.tasks(userId)
}

/** Optimistic helpers so ticking a subtask feels instant and progress recalculates. */
function patchLocalSubtasks(
  tasks: Task[] | undefined,
  taskId: string,
  updater: (subtasks: Subtask[]) => Subtask[],
): Task[] {
  return (tasks ?? []).map((task) => (task.id === taskId ? { ...task, subtasks: updater(task.subtasks) } : task))
}

export function useAddSubtask() {
  const userId = useUserId()
  const key = useTasksKey()
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, title, position }: { taskId: string; title: string; position: number }) =>
      insertSubtasks([{ task_id: taskId, user_id: userId, title: title.trim(), position }]),
    onError: (error) => reportError(error, 'The subtask could not be added.'),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })
}

export function useToggleSubtask() {
  const key = useTasksKey()
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ subtask }: { subtask: Subtask }) =>
      updateSubtask(subtask.id, {
        is_completed: !subtask.is_completed,
        completed_at: !subtask.is_completed ? new Date().toISOString() : null,
      }),
    onMutate: async ({ subtask }) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData<Task[]>(key)
      client.setQueryData<Task[]>(key, (tasks) =>
        patchLocalSubtasks(tasks, subtask.task_id, (subtasks) =>
          subtasks.map((item) =>
            item.id === subtask.id ? { ...item, is_completed: !item.is_completed } : item,
          ),
        ),
      )
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) client.setQueryData(key, context.previous)
      reportError(error, 'That subtask change was rolled back.')
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })
}

export function useRenameSubtask() {
  const key = useTasksKey()
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateSubtask(id, { title: title.trim() }),
    onError: (error) => reportError(error, 'The subtask could not be renamed.'),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteSubtask() {
  const key = useTasksKey()
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) => deleteSubtask(id),
    onMutate: async ({ id, taskId }) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData<Task[]>(key)
      client.setQueryData<Task[]>(key, (tasks) =>
        patchLocalSubtasks(tasks, taskId, (subtasks) => subtasks.filter((item) => item.id !== id)),
      )
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) client.setQueryData(key, context.previous)
      reportError(error, 'The subtask could not be deleted.')
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })
}

export function useReorderSubtasks() {
  const key = useTasksKey()
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ items }: { taskId: string; items: { id: string; position: number }[] }) =>
      reorderSubtasks(items),
    onMutate: async ({ taskId, items }) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData<Task[]>(key)
      const order = new Map(items.map((item) => [item.id, item.position]))
      client.setQueryData<Task[]>(key, (tasks) =>
        patchLocalSubtasks(tasks, taskId, (subtasks) =>
          [...subtasks]
            .map((item) => ({ ...item, position: order.get(item.id) ?? item.position }))
            .sort((a, b) => a.position - b.position),
        ),
      )
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) client.setQueryData(key, context.previous)
      reportError(error, 'The new order was rolled back.')
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })
}
