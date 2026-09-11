import { supabase } from '@/lib/supabase'
import type { InsertDto, UpdateDto } from '@/types/database'
import type { Task } from '@/types'

const TASK_SELECT = `
  id, user_id, category_id, title, description, urgency, status,
  start_date, due_date, start_time, due_time, color, position,
  completed_at, created_at, updated_at,
  subtasks (id, task_id, user_id, title, is_completed, position, completed_at, created_at, updated_at),
  category:categories (id, name, color)
`

function normalise(row: unknown): Task {
  const task = row as Task
  return {
    ...task,
    subtasks: [...(task.subtasks ?? [])].sort((a, b) => a.position - b.position),
    category: task.category ?? null,
  }
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(normalise)
}

export async function fetchTask(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase.from('tasks').select(TASK_SELECT).eq('id', taskId).maybeSingle()
  if (error) throw error
  return data ? normalise(data) : null
}

export async function insertTask(payload: InsertDto<'tasks'>): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(payload).select(TASK_SELECT).single()
  if (error) throw error
  return normalise(data)
}

export async function updateTask(taskId: string, patch: UpdateDto<'tasks'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', taskId)
    .select(TASK_SELECT)
    .single()
  if (error) throw error
  return normalise(data)
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}
