import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'

export async function fetchCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function insertCategory(userId: string, name: string, color: string): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert({ user_id: userId, name, color }).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, patch: { name?: string; color?: string }): Promise<Category> {
  const { data, error } = await supabase.from('categories').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
