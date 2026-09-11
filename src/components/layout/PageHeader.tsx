import * as React from 'react'

interface PageHeaderProps {
  kicker: string
  title: string
  standfirst?: string
  actions?: React.ReactNode
}

export function PageHeader({ kicker, title, standfirst, actions }: PageHeaderProps) {
  return (
    <header className="rule-heavy mb-6 pb-4">
      <p className="label-meta">{kicker}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-serif text-4xl font-black leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {standfirst ? (
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-neutral-600">{standfirst}</p>
      ) : null}
    </header>
  )
}
