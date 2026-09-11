import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signInSchema, type SignInValues } from '@/schemas/auth'
import { useAuth } from '@/features/auth/AuthProvider'
import { reportError } from '@/lib/errors'

export function SignInPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), mode: 'onTouched' })

  return (
    <AuthLayout
      headline="Your day, set in type."
      standfirst="Every task gets a headline, a rank and a deadline. Break the big ones into steps, watch the progress bar fill, and read your week as a list, a board or a calendar. One reader, one desk, no noise."
      footer={
        <p className="font-body text-sm">
          No account yet?{' '}
          <Link to="/sign-up" className="font-semibold underline decoration-accent decoration-2 underline-offset-4">
            Create one
          </Link>
        </p>
      }
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          try {
            await signIn(values.email, values.password)
            navigate(from, { replace: true })
          } catch (error) {
            reportError(error, 'Sign in failed.')
          }
        })}
      >
        <div>
          <p className="label-meta">Subscriber entrance</p>
          <h2 className="font-serif text-3xl font-black tracking-tight">Sign in</h2>
        </div>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>

        <Link
          to="/forgot-password"
          className="block font-mono text-[11px] uppercase tracking-widest underline decoration-accent decoration-2 underline-offset-4"
        >
          Forgot your password?
        </Link>
      </form>
    </AuthLayout>
  )
}
