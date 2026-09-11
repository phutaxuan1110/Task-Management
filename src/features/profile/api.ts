import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile(
  userId: string,
  patch: { display_name?: string | null; timezone?: string },
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...patch })
    .select()
    .single()
  if (error) throw error
  return data
}
