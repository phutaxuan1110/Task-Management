import { Link } from 'react-router-dom'
import { editionLine } from '@/utils/date'

export function Masthead({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border-b border-ink px-4 py-2">
      <div className="mx-auto flex max-w-screen-xl items-baseline justify-between gap-4">
        <p className="label-meta hidden sm:block">Vol. 1 · No. 01</p>
        <Link
          to="/"
          className={`font-serif font-black uppercase tracking-tight ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}
        >
          The Daily Task
        </Link>
        <p className="label-meta truncate">{editionLine()}</p>
      </div>
    </div>
  )
}
