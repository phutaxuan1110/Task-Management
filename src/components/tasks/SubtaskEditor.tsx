import * as React from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

export interface DraftSubtask {
  id?: string
  title: string
  isCompleted: boolean
}

interface SubtaskEditorProps {
  value: DraftSubtask[]
  onChange: (next: DraftSubtask[]) => void
}

function rowKey(subtask: DraftSubtask, index: number) {
  return subtask.id ?? `draft-${index}`
}

function SortableRow({
  id,
  subtask,
  onToggle,
  onRename,
  onRemove,
}: {
  id: string
  subtask: DraftSubtask
  onToggle: () => void
  onRename: (title: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 border-b border-rule px-2 py-1.5 ${isDragging ? 'bg-neutral-100' : ''}`}
    >
      <button
        type="button"
        className="flex h-9 w-7 shrink-0 cursor-grab items-center justify-center text-neutral-500 hover:text-ink"
        aria-label={`Reorder ${subtask.title || 'subtask'}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
      <Checkbox
        checked={subtask.isCompleted}
        onCheckedChange={onToggle}
        aria-label={`Mark ${subtask.title || 'subtask'} complete`}
      />
      <Input
        value={subtask.title}
        onChange={(event) => onRename(event.target.value)}
        className="min-h-[36px] border-b-0 px-1 py-1 font-body text-sm"
        aria-label="Subtask title"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Delete ${subtask.title || 'subtask'}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center text-neutral-500 transition-colors hover:text-accent"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
    </li>
  )
}

export function SubtaskEditor({ value, onChange }: SubtaskEditorProps) {
  const [draft, setDraft] = React.useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = value.map(rowKey)

  function add() {
    const title = draft.trim()
    if (!title) return
    onChange([...value, { title, isCompleted: false }])
    setDraft('')
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    onChange(arrayMove(value, from, to))
  }

  const done = value.filter((subtask) => subtask.isCompleted).length

  return (
    <section className="border border-ink">
      <header className="flex items-center justify-between border-b border-ink bg-ink px-3 py-2 text-paper">
        <h3 className="font-mono text-[11px] uppercase tracking-widest">Subtasks</h3>
        <span className="font-mono text-[11px] tracking-widest">
          {done}/{value.length}
        </span>
      </header>

      {value.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul>
              {value.map((subtask, index) => (
                <SortableRow
                  key={rowKey(subtask, index)}
                  id={rowKey(subtask, index)}
                  subtask={subtask}
                  onToggle={() =>
                    onChange(
                      value.map((item, i) =>
                        i === index ? { ...item, isCompleted: !item.isCompleted } : item,
                      ),
                    )
                  }
                  onRename={(title) =>
                    onChange(value.map((item, i) => (i === index ? { ...item, title } : item)))
                  }
                  onRemove={() => onChange(value.filter((_, i) => i !== index))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="border-b border-rule px-3 py-3 font-body text-xs text-neutral-600">
          Break the task down into steps. Progress is counted from these.
        </p>
      )}

      <div className="flex items-center gap-2 px-2 py-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          placeholder="Add a step, press Enter"
          aria-label="New subtask"
          className="min-h-[40px] border-b border-ink"
        />
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Add
        </Button>
      </div>
    </section>
  )
}
