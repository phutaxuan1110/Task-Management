import { NavLink } from 'react-router-dom'
import { CalendarDays, Columns3, Rows3 } from 'lucide-react'

const VIEWS = [
  { to: '/tasks', label: 'List', icon: Rows3 },
  { to: '/tasks/board', label: 'Board', icon: Columns3 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export function ViewSwitcher() {
  return (
    <div className="flex" role="group" aria-label="Switch view">
      {VIEWS.map((view) => (
        <NavLink
          key={view.to}
          to={view.to}
          end
          className={({ isActive }) =>
            `-ml-px flex min-h-[44px] items-center gap-2 border border-ink px-3 font-mono text-[11px] uppercase tracking-widest transition-colors first:ml-0 ${
              isActive ? 'bg-ink text-paper' : 'hover:bg-rule'
            }`
          }
        >
          <view.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          {view.label}
        </NavLink>
      ))}
    </div>
  )
}
