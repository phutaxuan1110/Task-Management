import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

/**
 * One component, two presentations: a centred broadsheet panel on desktop and a
 * full-screen sheet on mobile, so long forms stay scrollable when the on-screen
 * keyboard opens.
 */
export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-fade-in bg-ink/40" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-0 z-50 flex h-[100dvh] w-full flex-col border-ink bg-paper animate-sheet-up',
          'sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[92dvh] sm:w-[min(640px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:animate-fade-in',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({
  title,
  eyebrow,
  description,
}: {
  title: string
  eyebrow?: string
  description?: string
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b-4 border-ink px-4 py-4 sm:px-6">
      <div className="min-w-0">
        {eyebrow ? <p className="label-meta">{eyebrow}</p> : null}
        <DialogPrimitive.Title className="truncate font-serif text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          {title}
        </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="mt-1 font-body text-sm text-neutral-600">
            {description}
          </DialogPrimitive.Description>
        ) : null}
      </div>
      <DialogPrimitive.Close
        aria-label="Close"
        className="flex h-11 w-11 shrink-0 items-center justify-center border border-ink transition-colors hover:bg-ink hover:text-paper"
      >
        <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </DialogPrimitive.Close>
    </header>
  )
}

export function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex-1 overflow-y-auto px-4 py-5 scroll-shadow sm:px-6', className)}>{children}</div>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <footer className="sticky bottom-0 flex flex-col gap-2 border-t-4 border-ink bg-paper px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
      {children}
    </footer>
  )
}
