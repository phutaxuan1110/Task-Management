import { supabase } from '@/lib/supabase'
import type { Subtask } from '@/types'
import type { InsertDto, UpdateDto } from '@/types/database'

export async function insertSubtasks(payload: InsertDto<'subtasks'>[]): Promise<Subtask[]> {
  if (!payload.length) return []
  const { data, error } = await supabase.from('subtasks').insert(payload).select()
  if (error) throw error
  return data ?? []
}

export async function updateSubtask(id: string, patch: UpdateDto<'subtasks'>): Promise<Subtask> {
  const { data, error } = await supabase.from('subtasks').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSubtask(id: string): Promise<void> {
  const { error } = await supabase.from('subtasks').delete().eq('id', id)
  if (error) throw error
}

export async function reorderSubtasks(items: { id: string; position: number }[]): Promise<void> {
  await Promise.all(items.map((item) => supabase.from('subtasks').update({ position: item.position }).eq('id', item.id)))
}
