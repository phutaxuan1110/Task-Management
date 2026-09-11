import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateTask } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { emptyFormValues } from '@/features/tasks/mapper'
import { toDateOnly } from '@/utils/date'

/** One line in, one task filed. Everything else is editable afterwards. */
export function QuickAdd() {
  const [title, setTitle] = React.useState('')
  const create = useCreateTask()
  const { openCreate } = useTaskDialogs()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    create.mutate(
      {
        ...emptyFormValues({ title: trimmed, dueDate: toDateOnly(new Date()) }),
        title: trimmed,
        subtasks: [],
        urgency: 'medium',
        status: 'todo',
        dueDate: toDateOnly(new Date()),
      },
      { onSuccess: () => setTitle('') },
    )
  }

  return (
    <form onSubmit={submit} className="border border-ink">
      <div className="flex items-center justify-between border-b border-ink bg-ink px-3 py-1.5 text-paper">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Late copy · file it now</p>
        <button
          type="button"
          onClick={() => openCreate({ title })}
          className="font-mono text-[10px] uppercase tracking-[0.2em] underline decoration-accent decoration-2 underline-offset-2"
        >
          More fields
        </button>
      </div>
      <div className="flex items-center gap-2 p-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing today?"
          aria-label="Quick add a task due today"
          className="border-b-0"
        />
        <Button type="submit" size="sm" loading={create.isPending} disabled={!title.trim()}>
          Add
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </Button>
      </div>
    </form>
  )
}
