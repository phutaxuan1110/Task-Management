import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  className?: string
  barClassName?: string
  label?: string
}

export function Progress({ value, className, barClassName, label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Completion'}
      className={cn('h-2 w-full border border-ink bg-paper', className)}
    >
      <div
        className={cn('h-full bg-ink transition-[width] duration-300 ease-out', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
