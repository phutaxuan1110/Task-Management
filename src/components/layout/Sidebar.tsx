import { NavLink } from 'react-router-dom'
import { LogOut, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SIDEBAR_NAV } from '@/components/layout/NavItems'
import { useAuth } from '@/features/auth/AuthProvider'
import { useTaskDialogs } from '@/features/tasks/TaskDialogProvider'
import { useProfile } from '@/features/profile/hooks'
import { reportError } from '@/lib/errors'

export function Sidebar() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const { openCreate } = useTaskDialogs()

  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-ink bg-paper lg:flex">
      <div className="border-b-4 border-ink px-4 py-4">
        <p className="label-meta">Desk</p>
        <p className="truncate font-serif text-xl font-black tracking-tight">
          {profile?.display_name || user?.email?.split('@')[0] || 'Reader'}
        </p>
      </div>

      <div className="border-b border-ink p-3">
        <Button className="w-full" onClick={() => openCreate()}>
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          New task
        </Button>
      </div>

      <nav aria-label="Main" className="flex-1 border-b border-ink">
        <ul>
          {SIDEBAR_NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-[48px] items-center gap-3 border-b border-rule px-4 font-sans text-xs font-semibold uppercase tracking-widest transition-colors ${
                    isActive ? 'bg-ink text-paper' : 'hover:bg-rule'
                  }`
                }
              >
                <item.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3">
        <p className="label-meta mb-2 truncate">{user?.email}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => signOut().catch((error) => reportError(error, 'Sign out failed.'))}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
