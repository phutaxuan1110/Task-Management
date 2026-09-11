import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      offset={16}
      toastOptions={{
        classNames: {
          toast: 'border border-ink bg-paper text-ink shadow-hard font-sans text-xs uppercase tracking-widest',
          title: 'font-sans text-xs uppercase tracking-widest',
          description: 'font-body text-xs normal-case tracking-normal text-neutral-600',
          error: 'border-accent',
        },
      }}
    />
  )
}
