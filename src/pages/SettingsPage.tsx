import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { profileFormSchema, type ProfileFormValues } from '@/schemas/profile'
import { useProfile, useUpdateProfile } from '@/features/profile/hooks'
import { useAuth } from '@/features/auth/AuthProvider'
import { useTasks } from '@/features/tasks/hooks'
import { reportError } from '@/lib/errors'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { data: tasks } = useTasks()
  const update = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  })

  React.useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.display_name ?? '',
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }
  }, [profile, reset])

  const live = (tasks ?? []).filter((task) => task.status !== 'archived')

  return (
    <div className="space-y-6">
      <PageHeader kicker="Masthead" title="Settings" standfirst="Your name, your timezone, and the door out." />

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <form
              className="space-y-4 border border-ink p-4"
              noValidate
              onSubmit={handleSubmit((values) => update.mutate(values))}
            >
              <div>
                <p className="label-meta">Byline</p>
                <h2 className="font-serif text-2xl font-black tracking-tight">Profile</h2>
              </div>
              <Field label="Display name" htmlFor="displayName" error={errors.displayName?.message}>
                <Input id="displayName" {...register('displayName')} />
              </Field>
              <Field
                label="Timezone"
                htmlFor="timezone"
                hint="Used for today's date and overdue marks."
                error={errors.timezone?.message}
              >
                <Input id="timezone" {...register('timezone')} />
              </Field>
              <Field label="Email" htmlFor="account-email" hint="Change your email from your Supabase account.">
                <Input id="account-email" value={user?.email ?? ''} readOnly disabled />
              </Field>
              <Button type="submit" loading={update.isPending} disabled={!isDirty}>
                Save changes
              </Button>
            </form>
          )}
        </section>

        <section className="space-y-6 lg:col-span-5">
          <div className="border border-ink">
            <header className="border-b border-ink bg-ink px-3 py-2 text-paper">
              <h2 className="font-mono text-[11px] uppercase tracking-widest">Circulation</h2>
            </header>
            <dl className="p-3">
              {[
                { label: 'Tasks on file', value: live.length },
                { label: 'Completed', value: live.filter((task) => task.status === 'completed').length },
                { label: 'Archived', value: (tasks ?? []).length - live.length },
                {
                  label: 'Steps written',
                  value: (tasks ?? []).reduce((sum, task) => sum + task.subtasks.length, 0),
                },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between border-b border-rule py-2 last:border-b-0">
                  <dt className="label-meta">{item.label}</dt>
                  <dd className="font-mono text-sm">{String(item.value).padStart(2, '0')}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-ink p-4">
            <p className="label-meta">Session</p>
            <h2 className="font-serif text-xl font-black tracking-tight">Sign out</h2>
            <p className="mt-1 font-body text-sm text-neutral-600">
              Your data stays in Supabase; nothing is kept on this device after you leave.
            </p>
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={() => signOut().catch((error) => reportError(error, 'Sign out failed.'))}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Sign out
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
