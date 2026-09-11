import * as React from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  useAddSubtask,
  useDeleteSubtask,
  useRenameSubtask,
  useReorderSubtasks,
  useToggleSubtask,
} from '@/features/subtasks/hooks'
import type { Subtask, Task } from '@/types'

function Row({ subtask, taskId }: { subtask: Subtask; taskId: string }) {
  const toggle = useToggleSubtask()
  const rename = useRenameSubtask()
  const remove = useDeleteSubtask()
  const [title, setTitle] = React.useState(subtask.title)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subtask.id })

  React.useEffect(() => setTitle(subtask.title), [subtask.title])

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 border-b border-rule bg-paper px-2 py-1.5"
    >
      <button
        type="button"
        className="flex h-9 w-7 cursor-grab items-center justify-center text-neutral-500 hover:text-ink"
        aria-label={`Reorder ${subtask.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
      <Checkbox
        checked={subtask.is_completed}
        onCheckedChange={() => toggle.mutate({ subtask })}
        aria-label={subtask.is_completed ? `Reopen ${subtask.title}` : `Complete ${subtask.title}`}
      />
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={() => {
          const next = title.trim()
          if (next && next !== subtask.title) rename.mutate({ id: subtask.id, title: next })
          else setTitle(subtask.title)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
        aria-label="Subtask title"
        className={`min-h-[36px] border-b-0 px-1 font-body text-sm ${subtask.is_completed ? 'text-neutral-500 line-through' : ''}`}
      />
      <button
        type="button"
        onClick={() => remove.mutate({ id: subtask.id, taskId })}
        aria-label={`Delete ${subtask.title}`}
        className="flex h-9 w-9 items-center justify-center text-neutral-500 transition-colors hover:text-accent"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
    </li>
  )
}

export function SubtaskList({ task }: { task: Task }) {
  const [draft, setDraft] = React.useState('')
  const add = useAddSubtask()
  const reorder = useReorderSubtasks()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function submit() {
    const title = draft.trim()
    if (!title) return
    add.mutate({ taskId: task.id, title, position: task.subtasks.length })
    setDraft('')
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = task.subtasks.map((subtask) => subtask.id)
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    const next = arrayMove(task.subtasks, from, to)
    reorder.mutate({
      taskId: task.id,
      items: next.map((subtask, index) => ({ id: subtask.id, position: index })),
    })
  }

  return (
    <section className="border border-ink">
      <header className="flex items-center justify-between border-b border-ink bg-ink px-3 py-2 text-paper">
        <h3 className="font-mono text-[11px] uppercase tracking-widest">Subtasks</h3>
        <span className="font-mono text-[11px] tracking-widest">
          {task.subtasks.filter((subtask) => subtask.is_completed).length}/{task.subtasks.length}
        </span>
      </header>

      {task.subtasks.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={task.subtasks.map((subtask) => subtask.id)} strategy={verticalListSortingStrategy}>
            <ul>
              {task.subtasks.map((subtask) => (
                <Row key={subtask.id} subtask={subtask} taskId={task.id} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="border-b border-rule px-3 py-3 font-body text-xs text-neutral-600">
          No steps yet. Add one below, or complete the task directly.
        </p>
      )}

      <div className="flex items-center gap-2 px-2 py-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="Add a step, press Enter"
          aria-label="New subtask"
          className="min-h-[40px] border-b border-ink"
        />
        <Button type="button" variant="outline" size="sm" onClick={submit} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Add
        </Button>
      </div>
    </section>
  )
}
