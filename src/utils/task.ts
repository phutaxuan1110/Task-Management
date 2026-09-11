import { URGENCY_ORDER } from '@/lib/constants'
import type { SortBy, Task, TaskFilters, TaskProgress } from '@/types'
import { isOverdue, parseDateOnly } from '@/utils/date'

export function taskProgress(task: Task): TaskProgress {
  const total = task.subtasks.length
  if (total === 0) {
    return { total: 0, done: 0, percent: task.status === 'completed' ? 100 : 0 }
  }
  const done = task.subtasks.filter((subtask) => subtask.is_completed).length
  return { total, done, percent: Math.round((done / total) * 100) }
}

export function isTaskCompleted(task: Task): boolean {
  return task.status === 'completed'
}

export function taskIsOverdue(task: Task): boolean {
  return isOverdue(task.due_date, isTaskCompleted(task) || task.status === 'archived')
}

export function urgencyWeight(task: Task): number {
  return URGENCY_ORDER.indexOf(task.urgency)
}

function compare(a: Task, b: Task, sortBy: SortBy): number {
  switch (sortBy) {
    case 'urgency':
      return urgencyWeight(a) - urgencyWeight(b)
    case 'due_date': {
      const dateA = parseDateOnly(a.due_date)?.getTime() ?? Number.POSITIVE_INFINITY
      const dateB = parseDateOnly(b.due_date)?.getTime() ?? Number.POSITIVE_INFINITY
      return dateA - dateB
    }
    case 'progress':
      return taskProgress(b).percent - taskProgress(a).percent
    case 'created_at':
    default:
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  }
}

export function filterAndSortTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const search = filters.search.trim().toLowerCase()

  const filtered = tasks.filter((task) => {
    if (task.status === 'archived') return false
    if (!filters.showCompleted && task.status === 'completed') return false
    if (filters.urgency.length && !filters.urgency.includes(task.urgency)) return false
    if (filters.status.length && !filters.status.includes(task.status)) return false
    if (filters.categoryId === 'uncategorized' && task.category_id) return false
    if (
      filters.categoryId !== 'all' &&
      filters.categoryId !== 'uncategorized' &&
      task.category_id !== filters.categoryId
    ) {
      return false
    }
    if (filters.from && (!task.due_date || task.due_date < filters.from)) return false
    if (filters.to && (!task.due_date || task.due_date > filters.to)) return false
    if (search) {
      const haystack = `${task.title} ${task.description ?? ''} ${task.category?.name ?? ''}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })

  return [...filtered].sort((a, b) => compare(a, b, filters.sortBy))
}

export function defaultFilters(): TaskFilters {
  return {
    search: '',
    urgency: [],
    status: [],
    categoryId: 'all',
    from: null,
    to: null,
    showCompleted: true,
    sortBy: 'urgency',
    groupBy: 'none',
  }
}

export function countActiveFilters(filters: TaskFilters): number {
  let count = 0
  if (filters.urgency.length) count += 1
  if (filters.status.length) count += 1
  if (filters.categoryId !== 'all') count += 1
  if (filters.from || filters.to) count += 1
  if (!filters.showCompleted) count += 1
  return count
}
