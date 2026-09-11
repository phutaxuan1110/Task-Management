import type { TaskStatus, TaskUrgency } from '@/types'

/**
 * Newsprint prints in one ink plus a single editorial red, so urgency is encoded
 * by weight and fill first (rank number + label), colour only as reinforcement.
 * That keeps urgency readable without relying on colour alone (WCAG 1.4.1).
 */
export const URGENCY: Record<
  TaskUrgency,
  { label: string; rank: string; badge: string; bar: string; hex: string }
> = {
  critical: {
    label: 'Critical',
    rank: '01',
    badge: 'bg-accent text-paper border-accent',
    bar: 'bg-accent',
    hex: '#CC0000',
  },
  high: {
    label: 'High',
    rank: '02',
    badge: 'bg-ink text-paper border-ink',
    bar: 'bg-ink',
    hex: '#111111',
  },
  medium: {
    label: 'Medium',
    rank: '03',
    badge: 'bg-paper text-ink border-ink',
    bar: 'bg-neutral-600',
    hex: '#525252',
  },
  low: {
    label: 'Low',
    rank: '04',
    badge: 'bg-paper text-neutral-600 border-neutral-400',
    bar: 'bg-neutral-400',
    hex: '#A3A3A3',
  },
}

export const URGENCY_ORDER: TaskUrgency[] = ['critical', 'high', 'medium', 'low']

export const STATUS: Record<TaskStatus, { label: string; short: string }> = {
  todo: { label: 'To do', short: 'TODO' },
  in_progress: { label: 'In progress', short: 'WIP' },
  completed: { label: 'Completed', short: 'DONE' },
  archived: { label: 'Archived', short: 'ARCH' },
}

export const BOARD_COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'completed']

export const TASK_COLORS = ['#111111', '#CC0000', '#404040', '#737373', '#A3A3A3'] as const

export const CATEGORY_COLORS = ['#111111', '#CC0000', '#404040', '#525252', '#737373', '#A3A3A3'] as const
