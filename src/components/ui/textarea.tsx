import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full border border-ink bg-transparent px-3 py-2 font-body text-sm leading-relaxed text-ink placeholder:text-neutral-500 focus-visible:bg-[#F0F0F0] focus-visible:outline-none',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
