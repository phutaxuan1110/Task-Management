import * as React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/auth'
import { useAuth } from '@/features/auth/AuthProvider'
import { reportError } from '@/lib/errors'

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [sent, setSent] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), mode: 'onTouched' })

  return (
    <AuthLayout
      headline="Lost the key to the archive?"
      standfirst="Enter the email on your subscription and we will send a single-use link to set a new password."
      footer={
        <Link
          to="/sign-in"
          className="font-mono text-[11px] uppercase tracking-widest underline decoration-accent decoration-2 underline-offset-4"
        >
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="border border-ink p-5">
          <p className="label-meta">Sent</p>
          <h2 className="font-serif text-2xl font-black tracking-tight">Check your inbox</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-neutral-600">
            The reset link opens this app on the reset page. It expires after a short while.
          </p>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(async (values) => {
            try {
              await requestPasswordReset(values.email)
              setSent(true)
            } catch (error) {
              reportError(error, 'The reset email could not be sent.')
            }
          })}
        >
          <div>
            <p className="label-meta">Password reset</p>
            <h2 className="font-serif text-3xl font-black tracking-tight">Send reset link</h2>
          </div>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
