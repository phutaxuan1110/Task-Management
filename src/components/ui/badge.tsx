import * as React from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
