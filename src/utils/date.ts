import { format, isBefore, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns'

/** Supabase `date` columns are plain YYYY-MM-DD; parse them without timezone drift. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function toDateOnly(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDateShort(value: string | null | undefined): string {
  const date = parseDateOnly(value)
  return date ? format(date, 'd MMM yyyy') : '—'
}

export function formatDateHuman(value: string | null | undefined): string {
  const date = parseDateOnly(value)
  if (!date) return 'No due date'
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE d MMM')
}

export function formatTime(value: string | null | undefined): string | null {
  if (!value) return null
  return value.slice(0, 5)
}

export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (completed) return false
  const date = parseDateOnly(dueDate)
  if (!date) return false
  return isBefore(startOfDay(date), startOfDay(new Date()))
}

export function editionLine(date = new Date()): string {
  return format(date, "EEEE, d MMMM yyyy").toUpperCase()
}
