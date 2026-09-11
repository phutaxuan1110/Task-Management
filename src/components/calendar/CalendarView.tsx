import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { URGENCY } from '@/lib/constants'
import { usePatchTask } from '@/features/tasks/hooks'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { parseDateOnly, toDateOnly } from '@/utils/date'
import { taskIsOverdue, taskProgress } from '@/utils/task'
import type { Task } from '@/types'

type CalendarScale = 'month' | 'week' | 'day'

/** A task occupies every day between its start and due date (inclusive). */
function occupiesDay(task: Task, dayKey: string): boolean {
  const start = task.start_date
  const due = task.due_date
  if (start && due) return dayKey >= start && dayKey <= due
  const single = due ?? start
  return single === dayKey
}

function Chip({ task, compact = false }: { task: Task; compact?: boolean }) {
  const { openDetail } = useTaskDialogs()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  const overdue = taskIsOverdue(task)
  const accent = task.color ?? URGENCY[task.urgency].hex
  const isRange = Boolean(task.start_date && task.due_date && task.start_date !== task.due_date)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => openDetail(task.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openDetail(task.id)
        }
      }}
      className={`w-full cursor-grab truncate border border-ink bg-paper px-1 text-left font-sans text-[11px] leading-tight transition-colors hover:bg-ink hover:text-paper ${isDragging ? 'opacity-40' : ''} ${compact ? 'py-0.5' : 'py-1'}`}
      style={{ borderLeft: `3px solid ${accent}` }}
      title={task.title}
    >
      {overdue ? <span className="mr-1 font-mono text-accent">!</span> : null}
      {isRange ? <span className="mr-1 font-mono">↔</span> : null}
      <span className={task.status === 'completed' ? 'line-through' : ''}>{task.title}</span>
    </div>
  )
}

function DayCell({
  day,
  monthCursor,
  tasks,
  selected,
  onSelect,
}: {
  day: Date
  monthCursor: Date
  tasks: Task[]
  selected: boolean
  onSelect: (day: Date) => void
}) {
  const { openCreate } = useTaskDialogs()
  const { setNodeRef, isOver } = useDroppable({ id: toDateOnly(day) })
  const today = isSameDay(day, new Date())
  const outside = !isSameMonth(day, monthCursor)
  const visible = tasks.slice(0, 3)

  return (
    <div
      ref={setNodeRef}
      className={`relative flex min-h-[56px] flex-col gap-1 border-b border-r border-ink p-1 transition-colors sm:min-h-[120px] ${outside ? 'bg-neutral-100/60' : 'bg-paper'} ${isOver ? 'bg-rule' : ''} ${selected ? 'ring-2 ring-inset ring-ink' : ''}`}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelect(day)}
          className={`h-6 min-w-6 px-1 font-mono text-[11px] tracking-widest transition-colors ${today ? 'bg-ink text-paper' : 'hover:bg-rule'} ${outside ? 'text-neutral-400' : ''}`}
          aria-label={`Select ${format(day, 'd MMMM yyyy')}`}
        >
          {format(day, 'd')}
        </button>
        <button
          type="button"
          onClick={() => openCreate({ dueDate: toDateOnly(day) })}
          aria-label={`Add task on ${format(day, 'd MMMM yyyy')}`}
          className="hidden h-6 w-6 items-center justify-center text-neutral-400 transition-colors hover:bg-ink hover:text-paper sm:flex"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      {/* Mobile keeps the grid minimal: density marks only, detail lives in the agenda. */}
      <div className="flex flex-wrap gap-0.5 sm:hidden" aria-hidden>
        {tasks.slice(0, 4).map((task) => (
          <span
            key={task.id}
            className="h-1.5 w-1.5"
            style={{ backgroundColor: task.color ?? URGENCY[task.urgency].hex }}
          />
        ))}
      </div>
      <div className="hidden flex-col gap-1 sm:flex">
        {visible.map((task) => (
          <Chip key={task.id} task={task} compact />
        ))}
        {tasks.length > visible.length ? (
          <button
            type="button"
            onClick={() => onSelect(day)}
            className="hidden px-1 text-left font-mono text-[10px] uppercase tracking-widest text-neutral-600 hover:text-ink sm:block"
          >
            +{tasks.length - visible.length} more
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Agenda({ day, tasks }: { day: Date; tasks: Task[] }) {
  const { openCreate, openDetail } = useTaskDialogs()

  return (
    <section className="border border-ink" aria-label={`Agenda for ${format(day, 'd MMMM yyyy')}`}>
      <header className="flex items-center justify-between border-b-4 border-ink px-3 py-2">
        <div>
          <p className="label-meta">Agenda</p>
          <h2 className="font-serif text-xl font-black tracking-tight">{format(day, 'EEEE d MMMM')}</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => openCreate({ dueDate: toDateOnly(day) })}>
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Add
        </Button>
      </header>
      {tasks.length ? (
        <ul>
          {tasks.map((task) => {
            const progress = taskProgress(task)
            return (
              <li key={task.id} className="border-b border-rule last:border-b-0">
                <button
                  type="button"
                  onClick={() => openDetail(task.id)}
                  className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-neutral-100"
                  style={{ borderLeft: `4px solid ${task.color ?? URGENCY[task.urgency].hex}` }}
                >
                  <span className="label-meta w-14 shrink-0 pt-0.5">
                    {task.due_time ? task.due_time.slice(0, 5) : 'All day'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-base font-bold tracking-tight">{task.title}</span>
                    <span className="label-meta">
                      {URGENCY[task.urgency].label}
                      {progress.total ? ` · ${progress.done}/${progress.total} steps` : ''}
                      {task.category ? ` · ${task.category.name}` : ''}
                    </span>
                  </span>
                  {taskIsOverdue(task) ? (
                    <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2} aria-hidden />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="px-3 py-6 font-body text-sm text-neutral-600">
          Nothing scheduled. Tap add to put something on this date.
        </p>
      )}
    </section>
  )
}

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const [scale, setScale] = React.useState<CalendarScale>('month')
  const [cursor, setCursor] = React.useState(() => new Date())
  const [selected, setSelected] = React.useState(() => new Date())
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const patch = usePatchTask()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const scheduled = React.useMemo(
    () => tasks.filter((task) => task.status !== 'archived' && (task.due_date || task.start_date)),
    [tasks],
  )

  const days = React.useMemo(() => {
    if (scale === 'day') return [cursor]
    if (scale === 'week') {
      return eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) })
    }
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
    })
  }, [cursor, scale])

  const tasksForDay = React.useCallback(
    (day: Date) => {
      const key = toDateOnly(day)
      return scheduled.filter((task) => occupiesDay(task, key))
    },
    [scheduled],
  )

  function shift(direction: 1 | -1) {
    if (scale === 'month') setCursor((value) => addMonths(value, direction))
    else if (scale === 'week') setCursor((value) => addWeeks(value, direction))
    else setCursor((value) => addDays(value, direction))
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  /** Dropping on a day moves the due date, keeping any range length intact. */
  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const task = tasks.find((item) => item.id === String(active.id))
    const target = parseDateOnly(String(over.id))
    if (!task || !target) return

    const currentDue = parseDateOnly(task.due_date)
    const nextDue = toDateOnly(target)
    if (task.due_date === nextDue) return

    let nextStart = task.start_date
    if (task.start_date && currentDue) {
      const span = differenceInCalendarDays(currentDue, parseDateOnly(task.start_date) as Date)
      nextStart = toDateOnly(addDays(target, -span))
    }

    patch.mutate({
      taskId: task.id,
      patch: { due_date: nextDue, start_date: nextStart },
      successMessage: `Rescheduled to ${format(target, 'd MMM')}`,
    })
  }

  const activeTask = tasks.find((task) => task.id === activeId) ?? null
  const heading =
    scale === 'month'
      ? format(cursor, 'MMMM yyyy')
      : scale === 'week'
        ? `Week of ${format(startOfWeek(cursor, { weekStartsOn: 1 }), 'd MMM yyyy')}`
        : format(cursor, 'EEEE d MMMM yyyy')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border border-ink p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous" onClick={() => shift(-1)}>
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCursor(new Date())
              setSelected(new Date())
            }}
          >
            <CalendarDays className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Today
          </Button>
          <Button variant="outline" size="icon" aria-label="Next" onClick={() => shift(1)}>
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          </Button>
          <h2 className="ml-1 font-serif text-xl font-black tracking-tight sm:text-2xl">{heading}</h2>
        </div>

        <div className="flex" role="group" aria-label="Calendar scale">
          {(['month', 'week', 'day'] as CalendarScale[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={scale === value}
              onClick={() => setScale(value)}
              className={`min-h-[44px] border border-ink px-3 font-mono text-[11px] uppercase tracking-widest transition-colors ${scale === value ? 'bg-ink text-paper' : 'hover:bg-rule'} -ml-px first:ml-0`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        {scale !== 'day' ? (
          <div className="border-l border-t border-ink">
            {scale === 'month' ? (
              <div className="grid grid-cols-7 border-b border-ink bg-ink text-paper">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                  <div key={label} className="px-1 py-1 font-mono text-[9px] uppercase tracking-widest sm:px-2 sm:text-[10px]">
                    {label}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-7">
              {days.map((day) => (
                <DayCell
                  key={day.toISOString()}
                  day={day}
                  monthCursor={scale === 'month' ? cursor : day}
                  tasks={tasksForDay(day)}
                  selected={isSameDay(day, selected)}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>
        ) : null}

        <DragOverlay>
          {activeTask ? (
            <div className="w-[200px] border border-ink bg-paper px-1 py-1 font-sans text-[11px] shadow-hard">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Agenda day={scale === 'day' ? cursor : selected} tasks={tasksForDay(scale === 'day' ? cursor : selected)} />
    </div>
  )
}
