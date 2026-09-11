import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env, supabaseConfigured } from '@/lib/env'

if (!supabaseConfigured && import.meta.env.DEV) {
  // Surfaced in the UI by <SetupNotice />; logged once for developers.
  console.warn(
    'Supabase environment variables are missing. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient<Database>(
  env.supabaseUrl || 'http://localhost:54321',
  env.supabaseAnonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  },
)
