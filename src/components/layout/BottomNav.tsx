import { NavLink } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { MOBILE_NAV } from '@/components/layout/NavItems'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'

export function BottomNav() {
  const { openCreate } = useTaskDialogs()

  return (
    <>
      <button
        type="button"
        onClick={() => openCreate()}
        aria-label="New task"
        className="fixed bottom-[calc(64px+max(0.75rem,env(safe-area-inset-bottom)))] right-4 z-40 flex h-14 w-14 items-center justify-center border-2 border-ink bg-ink text-paper shadow-hard transition-colors hover:bg-paper hover:text-ink lg:hidden"
      >
        <Plus className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </button>

      <nav
        aria-label="Main"
        className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-ink bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {MOBILE_NAV.map((item) => (
            <li key={item.to} className="border-r border-ink last:border-r-0">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    isActive ? 'bg-ink text-paper' : 'hover:bg-rule'
                  }`
                }
              >
                <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
