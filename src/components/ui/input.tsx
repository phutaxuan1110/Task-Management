import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full min-h-[44px] border-b-2 border-ink bg-transparent px-3 py-2 font-mono text-sm text-ink placeholder:text-neutral-500 focus-visible:bg-[#F0F0F0] focus-visible:outline-none disabled:opacity-50',
        'aria-[invalid=true]:border-accent',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
