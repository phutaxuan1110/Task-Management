import * as React from 'react'

interface EmptyStateProps {
  headline: string
  body: string
  figure?: string
  action?: React.ReactNode
}

export function EmptyState({ headline, body, figure = 'Fig. 0.0', action }: EmptyStateProps) {
  return (
    <div className="newsprint-texture flex flex-col items-center gap-4 border border-ink px-6 py-14 text-center">
      <div className="relative w-full max-w-[220px] border border-ink bg-neutral-200 py-10">
        <div
          className="absolute inset-0 opacity-10 [background-size:16px_16px]"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)' }}
          aria-hidden
        />
        <p className="relative font-mono text-[10px] uppercase tracking-[0.3em]">{figure}</p>
      </div>
      <h2 className="max-w-md font-serif text-3xl font-black leading-tight tracking-tight">{headline}</h2>
      <p className="max-w-md font-body text-sm leading-relaxed text-neutral-600">{body}</p>
      {action}
    </div>
  )
}
