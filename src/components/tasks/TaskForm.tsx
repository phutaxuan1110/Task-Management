import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import { taskFormSchema, type TaskFormParsed, type TaskFormValues } from '@/schemas/task'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SubtaskEditor } from '@/components/tasks/SubtaskEditor'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { STATUS, TASK_COLORS, URGENCY, URGENCY_ORDER } from '@/lib/constants'
import { UNCATEGORIZED } from '@/features/tasks/mapper'
import { useCategories } from '@/features/categories/hooks'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { TaskStatus } from '@/types'

interface TaskFormProps {
  defaultValues: TaskFormValues
  submitLabel: string
  saving: boolean
  onSubmit: (values: TaskFormParsed) => void
  onCancel: () => void
}

const STATUS_KEYS: TaskStatus[] = ['todo', 'in_progress', 'completed', 'archived']

export function TaskForm({ defaultValues, submitLabel, saving, onSubmit, onCancel }: TaskFormProps) {
  const { data: categories = [] } = useCategories()
  const online = useOnlineStatus()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = form

  const subtasks = watch('subtasks') ?? []
  const status = watch('status')
  const openSubtasks = subtasks.filter((subtask) => !subtask.isCompleted).length
  const completingWithOpenSteps = status === 'completed' && openSubtasks > 0
  const disabled = saving || isSubmitting

  const titleId = React.useId()

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values as TaskFormParsed))}
      className="flex min-h-0 flex-1 flex-col"
      noValidate
    >
      <DialogBody className="space-y-5">
        {!online ? (
          <p className="border border-accent px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-accent">
            Offline — your input stays here. Save again once you reconnect.
          </p>
        ) : null}

        <Field label="Task title" htmlFor={titleId} error={errors.title?.message}>
          <Input
            id={titleId}
            autoFocus
            placeholder="File the quarterly report"
            aria-invalid={Boolean(errors.title)}
            className="font-serif text-lg tracking-tight"
            {...register('title')}
          />
        </Field>

        <Field label="Description" htmlFor="task-description" error={errors.description?.message}>
          <Textarea
            id="task-description"
            rows={3}
            placeholder="Context, links, anything worth remembering."
            {...register('description')}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urgency" htmlFor="task-urgency">
            <Controller
              control={control}
              name="urgency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="task-urgency" aria-label="Urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_ORDER.map((key) => (
                      <SelectItem key={key} value={key}>
                        {URGENCY[key].rank} · {URGENCY[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Status" htmlFor="task-status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="task-status" aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {STATUS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <Field label="Category" htmlFor="task-category">
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value || UNCATEGORIZED} onValueChange={field.onChange}>
                <SelectTrigger id="task-category" aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCATEGORIZED}>Uncategorised</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="task-start-date" error={errors.startDate?.message}>
            <Input id="task-start-date" type="date" {...register('startDate')} />
          </Field>
          <Field label="Due date" htmlFor="task-due-date" error={errors.dueDate?.message}>
            <Input
              id="task-due-date"
              type="date"
              aria-invalid={Boolean(errors.dueDate)}
              {...register('dueDate')}
            />
          </Field>
          <Field label="Start time" htmlFor="task-start-time" error={errors.startTime?.message}>
            <Input id="task-start-time" type="time" {...register('startTime')} />
          </Field>
          <Field label="Due time" htmlFor="task-due-time" error={errors.dueTime?.message}>
            <Input
              id="task-due-time"
              type="time"
              aria-invalid={Boolean(errors.dueTime)}
              {...register('dueTime')}
            />
          </Field>
        </div>

        <Field label="Colour stripe" htmlFor="task-color" hint="Used on the calendar and board.">
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <div className="flex flex-wrap items-center gap-2" id="task-color">
                {TASK_COLORS.map((color) => {
                  const active = field.value === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(active ? '' : color)}
                      aria-pressed={active}
                      aria-label={`Colour ${color}`}
                      className={`h-11 w-11 border-2 transition-transform ${active ? 'border-ink shadow-hard-sm' : 'border-rule'}`}
                      style={{ backgroundColor: color }}
                    />
                  )
                })}
                <span className="label-meta">{field.value || 'Urgency default'}</span>
              </div>
            )}
          />
        </Field>

        <Controller
          control={control}
          name="subtasks"
          render={({ field }) => (
            <SubtaskEditor value={field.value ?? []} onChange={field.onChange} />
          )}
        />

        {completingWithOpenSteps ? (
          <p className="flex items-start gap-2 border-l-4 border-accent bg-neutral-100 px-3 py-2 font-body text-xs text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
            {openSubtasks} {openSubtasks === 1 ? 'step is' : 'steps are'} still open. Saving as completed leaves them
            unfinished.
          </p>
        ) : null}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={disabled}>
          Cancel
        </Button>
        <Button type="submit" size="md" loading={disabled} disabled={!isValid}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}
