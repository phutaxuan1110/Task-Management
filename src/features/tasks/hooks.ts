import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queryClient'
import { reportError } from '@/lib/errors'
import { useUserId } from '@/features/auth/AuthProvider'
import { deleteTask, fetchTasks, insertTask, updateTask } from '@/features/tasks/api'
import { deleteSubtask, insertSubtasks, updateSubtask } from '@/features/subtasks/api'
import { formToTaskPayload, formToTaskUpdate } from '@/features/tasks/mapper'
import type { TaskFormParsed } from '@/schemas/task'
import type { Task, TaskStatus } from '@/types'
import type { UpdateDto } from '@/types/database'

export function useTasks() {
  const userId = useUserId()
  return useQuery({
    queryKey: queryKeys.tasks(userId),
    queryFn: () => fetchTasks(userId),
    enabled: Boolean(userId),
  })
}

export function useTask(taskId: string | null) {
  const { data, ...rest } = useTasks()
  return { ...rest, data: data?.find((task) => task.id === taskId) ?? null }
}

/** Create a parent task plus its subtasks in one user action. */
export function useCreateTask() {
  const userId = useUserId()
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (values: TaskFormParsed) => {
      const task = await insertTask(formToTaskPayload(values, userId))
      if (values.subtasks.length) {
        await insertSubtasks(
          values.subtasks.map((subtask, index) => ({
            task_id: task.id,
            user_id: userId,
            title: subtask.title.trim(),
            is_completed: subtask.isCompleted,
            position: index,
            completed_at: subtask.isCompleted ? new Date().toISOString() : null,
          })),
        )
      }
      return task
    },
    onSuccess: (task) => {
      client.invalidateQueries({ queryKey: queryKeys.tasks(userId) })
      toast.success('Task created', { description: task.title })
    },
    onError: (error) => reportError(error, 'The task could not be created.'),
  })
}

/** Update a parent task and reconcile its subtask list (add / rename / remove). */
export function useUpdateTask() {
  const userId = useUserId()
  const client = useQueryClient()

  return useMutation({
    mutationFn: async ({ task, values }: { task: Task; values: TaskFormParsed }) => {
      const updated = await updateTask(task.id, formToTaskUpdate(values, task))

      const keptIds = new Set(values.subtasks.map((subtask) => subtask.id).filter(Boolean) as string[])
      const removed = task.subtasks.filter((subtask) => !keptIds.has(subtask.id))
      await Promise.all(removed.map((subtask) => deleteSubtask(subtask.id)))

      const newRows = values.subtasks
        .map((subtask, index) => ({ subtask, index }))
        .filter(({ subtask }) => !subtask.id)
      await insertSubtasks(
        newRows.map(({ subtask, index }) => ({
          task_id: task.id,
          user_id: userId,
          title: subtask.title.trim(),
          is_completed: subtask.isCompleted,
          position: index,
          completed_at: subtask.isCompleted ? new Date().toISOString() : null,
        })),
      )

      await Promise.all(
        values.subtasks
          .map((subtask, index) => ({ subtask, index }))
          .filter(({ subtask }) => Boolean(subtask.id))
          .map(({ subtask, index }) =>
            updateSubtask(subtask.id as string, {
              title: subtask.title.trim(),
              is_completed: subtask.isCompleted,
              position: index,
              completed_at: subtask.isCompleted ? new Date().toISOString() : null,
            }),
          ),
      )

      return updated
    },
    onSuccess: (task) => {
      client.invalidateQueries({ queryKey: queryKeys.tasks(userId) })
      toast.success('Task updated', { description: task.title })
    },
    onError: (error) => reportError(error, 'The changes could not be saved.'),
  })
}

interface PatchArgs {
  taskId: string
  patch: UpdateDto<'tasks'>
  successMessage?: string
  silent?: boolean
}

/** Optimistic patch used by checkboxes, the board and calendar drags. */
export function usePatchTask() {
  const userId = useUserId()
  const client = useQueryClient()
  const key = queryKeys.tasks(userId)

  return useMutation({
    mutationFn: ({ taskId, patch }: PatchArgs) => updateTask(taskId, patch),
    onMutate: async ({ taskId, patch }) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData<Task[]>(key)
      client.setQueryData<Task[]>(key, (tasks) =>
        (tasks ?? []).map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
      )
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) client.setQueryData(key, context.previous)
      reportError(error, 'That change was rolled back.')
    },
    onSuccess: (_data, variables) => {
      if (variables.successMessage) toast.success(variables.successMessage)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: key })
    },
  })
}

export function useSetTaskStatus() {
  const patch = usePatchTask()
  return (taskId: string, status: TaskStatus, successMessage?: string) =>
    patch.mutate({
      taskId,
      patch: { status, completed_at: status === 'completed' ? new Date().toISOString() : null },
      successMessage,
    })
}

export function useDeleteTask() {
  const userId = useUserId()
  const client = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.tasks(userId) })
      toast.success('Task deleted')
    },
    onError: (error) => reportError(error, 'The task could not be deleted.'),
  })
}

export function useDuplicateTask() {
  const userId = useUserId()
  const client = useQueryClient()

  return useMutation({
    mutationFn: async (task: Task) => {
      const copy = await insertTask({
        user_id: userId,
        category_id: task.category_id,
        title: `${task.title} (copy)`,
        description: task.description,
        urgency: task.urgency,
        status: 'todo',
        start_date: task.start_date,
        due_date: task.due_date,
        start_time: task.start_time,
        due_time: task.due_time,
        color: task.color,
      })
      if (task.subtasks.length) {
        await insertSubtasks(
          task.subtasks.map((subtask, index) => ({
            task_id: copy.id,
            user_id: userId,
            title: subtask.title,
            is_completed: false,
            position: index,
          })),
        )
      }
      return copy
    },
    onSuccess: (task) => {
      client.invalidateQueries({ queryKey: queryKeys.tasks(userId) })
      toast.success('Task duplicated', { description: task.title })
    },
    onError: (error) => reportError(error, 'The task could not be duplicated.'),
  })
}
