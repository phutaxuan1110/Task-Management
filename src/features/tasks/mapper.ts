import type { Task } from '@/types'
import type { InsertDto, UpdateDto } from '@/types/database'
import type { TaskFormParsed, TaskFormValues } from '@/schemas/task'

const UNCATEGORIZED = 'uncategorized'

function nullable(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export function formToTaskPayload(values: TaskFormParsed, userId: string): InsertDto<'tasks'> {
  return {
    user_id: userId,
    category_id: !values.categoryId || values.categoryId === UNCATEGORIZED ? null : values.categoryId,
    title: values.title.trim(),
    description: nullable(values.description),
    urgency: values.urgency,
    status: values.status,
    start_date: nullable(values.startDate),
    due_date: nullable(values.dueDate),
    start_time: nullable(values.startTime),
    due_time: nullable(values.dueTime),
    color: nullable(values.color),
    completed_at: values.status === 'completed' ? new Date().toISOString() : null,
  }
}

export function formToTaskUpdate(values: TaskFormParsed, previous: Task): UpdateDto<'tasks'> {
  const wasCompleted = previous.status === 'completed'
  const isCompleted = values.status === 'completed'
  return {
    category_id: !values.categoryId || values.categoryId === UNCATEGORIZED ? null : values.categoryId,
    title: values.title.trim(),
    description: nullable(values.description),
    urgency: values.urgency,
    status: values.status,
    start_date: nullable(values.startDate),
    due_date: nullable(values.dueDate),
    start_time: nullable(values.startTime),
    due_time: nullable(values.dueTime),
    color: nullable(values.color),
    completed_at: isCompleted
      ? wasCompleted
        ? previous.completed_at
        : new Date().toISOString()
      : null,
  }
}

export function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    urgency: task.urgency,
    status: task.status,
    categoryId: task.category_id ?? UNCATEGORIZED,
    startDate: task.start_date ?? '',
    dueDate: task.due_date ?? '',
    startTime: task.start_time?.slice(0, 5) ?? '',
    dueTime: task.due_time?.slice(0, 5) ?? '',
    color: task.color ?? '',
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      isCompleted: subtask.is_completed,
    })),
  }
}

export function emptyFormValues(overrides: Partial<TaskFormValues> = {}): TaskFormValues {
  return {
    title: '',
    description: '',
    urgency: 'medium',
    status: 'todo',
    categoryId: UNCATEGORIZED,
    startDate: '',
    dueDate: '',
    startTime: '',
    dueTime: '',
    color: '',
    subtasks: [],
    ...overrides,
  }
}

export { UNCATEGORIZED }
