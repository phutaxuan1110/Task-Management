import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Keep it',
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 animate-fade-in bg-ink/40" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[min(460px,92vw)] -translate-x-1/2 -translate-y-1/2 animate-fade-in border-4 border-ink bg-paper">
          <div className="border-b border-ink px-5 py-4">
            <p className="label-meta">{destructive ? 'Notice of removal' : 'Confirm'}</p>
            <AlertDialogPrimitive.Title className="font-serif text-2xl font-black leading-tight">
              {title}
            </AlertDialogPrimitive.Title>
          </div>
          <AlertDialogPrimitive.Description className="px-5 py-4 font-body text-sm leading-relaxed text-neutral-700">
            {body}
          </AlertDialogPrimitive.Description>
          <div className="flex flex-col gap-2 border-t border-ink px-5 py-4 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" size="sm">
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                variant={destructive ? 'danger' : 'primary'}
                size="sm"
                loading={loading}
                onClick={(event) => {
                  event.preventDefault()
                  onConfirm()
                }}
              >
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
