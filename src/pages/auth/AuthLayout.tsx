import * as React from 'react'
import { Masthead } from '@/components/layout/Masthead'
import { SetupNotice } from '@/components/layout/SetupNotice'
import { editionLine } from '@/utils/date'

interface AuthLayoutProps {
  headline: string
  standfirst: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthLayout({ headline, standfirst, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-[100dvh]">
      <Masthead />
      <SetupNotice />
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 border-ink lg:grid-cols-12">
        <section className="newsprint-texture border-b border-ink px-4 py-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-8 lg:py-16">
          <p className="label-meta">{editionLine()} · One reader edition</p>
          <h1 className="mt-3 font-serif text-5xl font-black leading-[0.88] tracking-tighter sm:text-6xl lg:text-8xl">
            {headline}
          </h1>
          <p className="drop-cap mt-6 max-w-xl border-t border-ink pt-5 text-justify font-body text-base leading-relaxed">
            {standfirst}
          </p>
          <dl className="mt-8 grid grid-cols-3 border-l border-t border-ink">
            {[
              { term: 'Four', detail: 'urgency ranks' },
              { term: 'Three', detail: 'ways to read your work' },
              { term: 'One', detail: 'reader: you' },
            ].map((item) => (
              <div key={item.term} className="border-b border-r border-ink px-3 py-4">
                <dt className="font-serif text-2xl font-black tracking-tight">{item.term}</dt>
                <dd className="label-meta mt-1">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="px-4 py-10 lg:col-span-5 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-sm">
            {children}
            {footer ? <div className="mt-6 border-t border-ink pt-4">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  )
}
