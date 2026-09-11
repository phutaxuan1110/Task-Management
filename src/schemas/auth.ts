import { z } from 'zod'

const email = z.string().min(1, 'Enter your email address.').email('That does not look like an email address.')
const password = z.string().min(8, 'Use at least 8 characters.')

export const signInSchema = z.object({ email, password: z.string().min(1, 'Enter your password.') })

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(1, 'Enter a name we can greet you with.').max(60),
    email,
    password,
    confirmPassword: z.string().min(1, 'Repeat your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Both passwords must match.',
  })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string().min(1, 'Repeat your password.') })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Both passwords must match.',
  })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
