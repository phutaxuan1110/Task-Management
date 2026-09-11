import * as React from 'react'
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger

export function DropdownMenuContent({
  className,
  align = 'end',
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={4}
        className={cn('z-50 min-w-[190px] border border-ink bg-paper py-1 shadow-hard', className)}
        {...props}
      />
    </DropdownPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Item> & { destructive?: boolean }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex min-h-[40px] cursor-pointer select-none items-center gap-2 px-3 font-sans text-xs font-medium uppercase tracking-widest outline-none transition-colors data-[highlighted]:bg-ink data-[highlighted]:text-paper',
        destructive && 'text-accent data-[highlighted]:bg-accent data-[highlighted]:text-paper',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="my-1 h-px bg-rule" />
}
