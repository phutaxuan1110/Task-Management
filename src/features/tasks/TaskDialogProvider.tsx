import * as React from 'react'
import type { Task } from '@/types'
import type { TaskFormValues } from '@/schemas/task'

interface TaskDialogState {
  openCreate: (prefill?: Partial<TaskFormValues>) => void
  openEdit: (task: Task) => void
  openDetail: (taskId: string) => void
  closeAll: () => void
  createPrefill: Partial<TaskFormValues> | null
  editing: Task | null
  detailId: string | null
  createOpen: boolean
}

const TaskDialogContext = React.createContext<TaskDialogState | undefined>(undefined)

export function TaskDialogProvider({ children }: { children: React.ReactNode }) {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [createPrefill, setCreatePrefill] = React.useState<Partial<TaskFormValues> | null>(null)
  const [editing, setEditing] = React.useState<Task | null>(null)
  const [detailId, setDetailId] = React.useState<string | null>(null)

  const value = React.useMemo<TaskDialogState>(
    () => ({
      createOpen,
      createPrefill,
      editing,
      detailId,
      openCreate: (prefill) => {
        setCreatePrefill(prefill ?? null)
        setEditing(null)
        setCreateOpen(true)
      },
      openEdit: (task) => {
        setEditing(task)
        setCreateOpen(false)
      },
      openDetail: (taskId) => setDetailId(taskId),
      closeAll: () => {
        setCreateOpen(false)
        setEditing(null)
        setDetailId(null)
        setCreatePrefill(null)
      },
    }),
    [createOpen, createPrefill, editing, detailId],
  )

  return <TaskDialogContext.Provider value={value}>{children}</TaskDialogContext.Provider>
}

export function useTaskDialogs() {
  const context = React.useContext(TaskDialogContext)
  if (!context) throw new Error('useTaskDialogs must be used inside <TaskDialogProvider>.')
  return context
}
