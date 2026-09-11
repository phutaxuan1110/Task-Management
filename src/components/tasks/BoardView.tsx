import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/tasks/TaskCard'
import { BOARD_COLUMNS, STATUS } from '@/lib/constants'
import { usePatchTask } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import type { Task, TaskStatus } from '@/types'

function DraggableCard({ task }: { task: Task }) {
  const { openDetail } = useTaskDialogs()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}>
      <TaskCard
        task={task}
        dragging={isDragging}
        onOpen={() => openDetail(task.id)}
        dragHandle={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
      />
    </div>
  )
}

function Column({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <section
      ref={setNodeRef}
      aria-label={STATUS[status].label}
      className={`flex min-w-[280px] flex-1 flex-col border-ink lg:border-r lg:last:border-r-0 ${isOver ? 'bg-neutral-100' : ''}`}
    >
      <header className="flex items-baseline justify-between border-b-4 border-ink px-3 py-2">
        <h2 className="font-serif text-xl font-black tracking-tight">{STATUS[status].label}</h2>
        <span className="font-mono text-[11px] tracking-widest">{String(tasks.length).padStart(2, '0')}</span>
      </header>
      <div className="flex flex-1 flex-col gap-3 p-3">
        {tasks.length ? (
          tasks.map((task) => <DraggableCard key={task.id} task={task} />)
        ) : (
          <p className="border border-dashed border-neutral-400 px-3 py-6 text-center font-body text-xs text-neutral-600">
            Nothing filed here.
          </p>
        )}
      </div>
    </section>
  )
}

export function BoardView({ tasks }: { tasks: Task[] }) {
  const patch = usePatchTask()
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const byStatus = React.useMemo(() => {
    const map = new Map<TaskStatus, Task[]>()
    BOARD_COLUMNS.forEach((status) => map.set(status, []))
    tasks
      .filter((task) => task.status !== 'archived')
      .forEach((task) => map.get(task.status)?.push(task))
    return map
  }, [tasks])

  const activeTask = tasks.find((task) => task.id === activeId) ?? null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const nextStatus = String(over.id) as TaskStatus
    if (!BOARD_COLUMNS.includes(nextStatus)) return
    const task = tasks.find((item) => item.id === String(active.id))
    if (!task || task.status === nextStatus) return

    patch.mutate({
      taskId: task.id,
      patch: {
        status: nextStatus,
        completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
      },
      successMessage: `Moved to ${STATUS[nextStatus].label}`,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex flex-col border border-ink lg:flex-row lg:divide-y-0">
        {BOARD_COLUMNS.map((status) => (
          <div key={status} className="border-b border-ink last:border-b-0 lg:border-b-0 lg:flex lg:flex-1">
            <Column status={status} tasks={byStatus.get(status) ?? []} />
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-[280px] rotate-1">
            <TaskCard task={activeTask} onOpen={() => undefined} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
