import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse border border-rule bg-neutral-200/70', className)} />
}

export function TaskListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="border-t border-ink" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="flex items-center gap-4 border-b border-ink px-4 py-5">
          <Skeleton className="h-5 w-5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="hidden h-3 w-24 sm:block" />
        </li>
      ))}
    </ul>
  )
}
