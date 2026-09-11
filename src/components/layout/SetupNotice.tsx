import { supabaseConfigured } from '@/lib/env'

/** Shown until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are present. */
export function SetupNotice() {
  if (supabaseConfigured) return null

  return (
    <div className="border-b-4 border-ink bg-paper px-4 py-3">
      <div className="mx-auto max-w-screen-xl">
        <p className="label-meta text-accent">Stop press · configuration missing</p>
        <p className="font-body text-sm leading-relaxed">
          Supabase keys are not set, so signing in will fail. Copy <code className="font-mono">.env.example</code> to{' '}
          <code className="font-mono">.env</code>, add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>, then restart the dev server. The README has the
          full setup.
        </p>
      </div>
    </div>
  )
}
