import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { resetPasswordSchema, type ResetPasswordValues } from '@/schemas/auth'
import { useAuth } from '@/features/auth/AuthProvider'
import { reportError } from '@/lib/errors'

export function ResetPasswordPage() {
  const { updatePassword, session } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), mode: 'onTouched' })

  return (
    <AuthLayout
      headline="Set a new password."
      standfirst="Choose something you have not used elsewhere. You stay signed in on this device once it is saved."
    >
      {!session ? (
        <div className="border border-accent p-5">
          <p className="label-meta text-accent">Link not recognised</p>
          <h2 className="font-serif text-2xl font-black tracking-tight">Open the emailed link first</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-neutral-600">
            This page needs the recovery link from your email. Request a new one if it has expired.
          </p>
          <Button className="mt-4 w-full" onClick={() => navigate('/forgot-password')}>
            Request a new link
          </Button>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={handleSubmit(async (values) => {
            try {
              await updatePassword(values.password)
              toast.success('Password updated')
              navigate('/', { replace: true })
            } catch (error) {
              reportError(error, 'The password could not be updated.')
            }
          })}
        >
          <div>
            <p className="label-meta">Password reset</p>
            <h2 className="font-serif text-3xl font-black tracking-tight">New password</h2>
          </div>
          <Field label="New password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          </Field>
          <Field label="Repeat password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Save password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
