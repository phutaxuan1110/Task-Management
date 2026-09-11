import type { Tables, TaskStatus, TaskUrgency } from '@/types/database'

export type { TaskStatus, TaskUrgency }

export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Subtask = Tables<'subtasks'>
export type TaskRow = Tables<'tasks'>

/** A task joined with its subtasks and category — the shape the UI renders. */
export interface Task extends TaskRow {
  subtasks: Subtask[]
  category: Pick<Category, 'id' | 'name' | 'color'> | null
}

export interface TaskProgress {
  total: number
  done: number
  percent: number
}

export type ViewMode = 'list' | 'board' | 'calendar'
export type GroupBy = 'none' | 'urgency' | 'status'
export type SortBy = 'urgency' | 'due_date' | 'created_at' | 'progress'

export interface TaskFilters {
  search: string
  urgency: TaskUrgency[]
  status: TaskStatus[]
  categoryId: string | 'all' | 'uncategorized'
  from: string | null
  to: string | null
  showCompleted: boolean
  sortBy: SortBy
  groupBy: GroupBy
}
