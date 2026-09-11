import { z } from 'zod'

export const profileFormSchema = z.object({
  displayName: z.string().trim().min(1, 'Enter a name.').max(60),
  timezone: z.string().trim().min(1, 'Enter a timezone.').max(80),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
