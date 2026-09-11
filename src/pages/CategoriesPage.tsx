import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, PencilLine, Plus, Trash2, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORY_COLORS } from '@/lib/constants'
import { categoryFormSchema, type CategoryFormValues } from '@/schemas/category'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/features/categories/hooks'
import { useTasks } from '@/features/tasks/hooks'
import type { Category } from '@/types'

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Colour ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
          className={`h-11 w-11 border-2 ${value === color ? 'border-ink shadow-hard-sm' : 'border-rule'}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

function Row({ category, taskCount }: { category: Category; taskCount: number }) {
  const [editing, setEditing] = React.useState(false)
  const [confirm, setConfirm] = React.useState(false)
  const [name, setName] = React.useState(category.name)
  const [color, setColor] = React.useState(category.color)
  const update = useUpdateCategory()
  const remove = useDeleteCategory()

  return (
    <li className="border-b border-ink px-3 py-3">
      {editing ? (
        <div className="space-y-3">
          <Field label="Name" htmlFor={`cat-${category.id}`}>
            <Input id={`cat-${category.id}`} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <ColorPicker value={color} onChange={setColor} />
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={update.isPending}
              disabled={!name.trim()}
              onClick={() =>
                update.mutate(
                  { id: category.id, name: name.trim(), color },
                  { onSuccess: () => setEditing(false) },
                )
              }
            >
              <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setName(category.name)
                setColor(category.color)
                setEditing(false)
              }}
            >
              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="h-6 w-6 shrink-0 border border-ink" style={{ backgroundColor: category.color }} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-bold tracking-tight">{category.name}</p>
            <p className="label-meta">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label={`Rename ${category.name}`} onClick={() => setEditing(true)}>
            <PencilLine className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${category.name}`}
            onClick={() => setConfirm(true)}
            className="text-accent"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        destructive
        loading={remove.isPending}
        title={`Delete “${category.name}”?`}
        body={`Its ${taskCount} ${taskCount === 1 ? 'task stays' : 'tasks stay'} on file and become uncategorised. Only the label is removed.`}
        confirmLabel="Delete category"
        onConfirm={() => remove.mutate(category.id, { onSuccess: () => setConfirm(false) })}
      />
    </li>
  )
}

export function CategoriesPage() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories()
  const { data: tasks } = useTasks()
  const create = useCreateCategory()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', color: CATEGORY_COLORS[0] },
  })

  const color = watch('color')

  function countFor(categoryId: string) {
    return (tasks ?? []).filter((task) => task.category_id === categoryId).length
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Section E · The desk labels"
        title="Categories"
        standfirst="Labels group your work without adding another rank. Deleting a label never deletes tasks — they simply become uncategorised."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <form
            className="space-y-4 border border-ink p-4"
            noValidate
            onSubmit={handleSubmit((values) =>
              create.mutate(values, { onSuccess: () => reset({ name: '', color: CATEGORY_COLORS[0] }) }),
            )}
          >
            <div>
              <p className="label-meta">New label</p>
              <h2 className="font-serif text-2xl font-black tracking-tight">Add a category</h2>
            </div>
            <Field label="Name" htmlFor="new-category" error={errors.name?.message}>
              <Input id="new-category" placeholder="Deep work" {...register('name')} />
            </Field>
            <Field label="Colour" htmlFor="new-category-color" error={errors.color?.message}>
              <ColorPicker value={color} onChange={(next) => setValue('color', next, { shouldValidate: true })} />
            </Field>
            <Button type="submit" className="w-full" loading={create.isPending}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Add category
            </Button>
          </form>
        </section>

        <section className="lg:col-span-7">
          {isError ? <ErrorState error={error} onRetry={() => refetch()} /> : null}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : categories && categories.length ? (
            <ul className="border-t border-ink">
              {categories.map((category) => (
                <Row key={category.id} category={category} taskCount={countFor(category.id)} />
              ))}
            </ul>
          ) : (
            <p className="border border-ink px-4 py-8 text-center font-body text-sm text-neutral-600">
              No categories yet. Work, Personal, Study and Health are created with every new account.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
