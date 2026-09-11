import { z } from 'zod'

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker.')
  .or(z.literal(''))
  .nullable()
  .optional()

const optionalTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use the time picker.')
  .or(z.literal(''))
  .nullable()
  .optional()

export const taskFormSchema = z
  .object({
    title: z.string().trim().min(1, 'A task needs a title.').max(200, 'Keep the title under 200 characters.'),
    description: z.string().max(4000, 'That description is too long.').optional().or(z.literal('')),
    urgency: z.enum(['critical', 'high', 'medium', 'low']),
    status: z.enum(['todo', 'in_progress', 'completed', 'archived']),
    categoryId: z.string().optional(),
    startDate: optionalDate,
    dueDate: optionalDate,
    startTime: optionalTime,
    dueTime: optionalTime,
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
    subtasks: z.array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(1, 'Subtasks need a title.').max(200),
        isCompleted: z.boolean(),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: 'The due date cannot be before the start date.',
      })
    }
    const sameDay = values.startDate && values.dueDate && values.startDate === values.dueDate
    if (sameDay && values.startTime && values.dueTime && values.dueTime < values.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueTime'],
        message: 'On the same day, the due time must come after the start time.',
      })
    }
  })

export type TaskFormValues = z.input<typeof taskFormSchema>
export type TaskFormParsed = z.output<typeof taskFormSchema>
