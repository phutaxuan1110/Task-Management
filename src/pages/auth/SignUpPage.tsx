import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signUpSchema, type SignUpValues } from '@/schemas/auth'
import { useAuth } from '@/features/auth/AuthProvider'
import { reportError } from '@/lib/errors'

export function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [confirmationSent, setConfirmationSent] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema), mode: 'onTouched' })

  return (
    <AuthLayout
      headline="Start your own edition."
      standfirst="Four urgency ranks, unlimited steps per task, and a calendar you can drag things around on. Your data lives in your own Supabase project and only you can read it."
      footer={
        <p className="font-body text-sm">
          Already a subscriber?{' '}
          <Link to="/sign-in" className="font-semibold underline decoration-accent decoration-2 underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      {confirmationSent ? (
        <div className="border border-ink p-5">
          <p className="label-meta">Confirmation required</p>
          <h2 className="font-serif text-2xl font-black tracking-tight">Check your inbox</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-neutral-600">
            We sent a confirmation link. Open it, then come back and sign in.
          </p>
          <Button className="mt-4 w-full" onClick={() => navigate('/sign-in')}>
            Go to sign in
          </Button>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(async (values) => {
            try {
              const { needsConfirmation } = await signUp(values.email, values.password, values.displayName)
              if (needsConfirmation) setConfirmationSent(true)
              else navigate('/', { replace: true })
            } catch (error) {
              reportError(error, 'Sign up failed.')
            }
          })}
        >
          <div>
            <p className="label-meta">New subscription</p>
            <h2 className="font-serif text-3xl font-black tracking-tight">Create account</h2>
          </div>

          <Field label="Name" htmlFor="displayName" error={errors.displayName?.message}>
            <Input id="displayName" autoComplete="name" {...register('displayName')} />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters.">
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          </Field>

          <Field label="Repeat password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
          </Field>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Create account
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
