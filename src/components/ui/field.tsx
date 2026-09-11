import * as React from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="font-mono text-[11px] uppercase tracking-widest text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="font-body text-xs text-neutral-600">{hint}</p> : null}
      {error ? (
        <p id={errorId} role="alert" className="font-mono text-[11px] uppercase tracking-wide text-accent">
          {error}
        </p>
      ) : null}
    </div>
  )
}
