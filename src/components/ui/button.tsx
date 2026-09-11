import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 border font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  {
    variants: {
      variant: {
        primary: 'border-transparent bg-ink text-paper hover:border-ink hover:bg-paper hover:text-ink',
        outline: 'border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
        ghost: 'border-transparent bg-transparent text-ink hover:bg-rule',
        danger: 'border-transparent bg-accent text-paper hover:border-accent hover:bg-paper hover:text-accent',
        link: 'border-transparent bg-transparent p-0 text-ink underline-offset-4 decoration-2 decoration-accent hover:underline',
      },
      size: {
        sm: 'min-h-[36px] px-3 py-1.5 text-[10px]',
        md: 'min-h-[44px] px-4 py-2',
        lg: 'min-h-[52px] px-6 py-3 text-sm',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden />
          <span>Saving</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { buttonVariants }
