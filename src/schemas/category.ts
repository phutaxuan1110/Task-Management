import { z } from 'zod'

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Give the category a name.').max(60, 'Keep it under 60 characters.'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a colour.'),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
