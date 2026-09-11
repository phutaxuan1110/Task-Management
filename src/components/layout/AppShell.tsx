import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Masthead } from '@/components/layout/Masthead'
import { Ticker } from '@/components/layout/Ticker'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { SetupNotice } from '@/components/layout/SetupNotice'
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog'
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'
import { TaskDialogProvider } from '@/features/tasks/TaskDialogProvider'

export function AppShell() {
  return (
    <TaskDialogProvider>
      <div className="flex min-h-[100dvh]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 bg-paper">
            <OfflineBanner />
            <Masthead compact />
            <Ticker />
          </header>
          <SetupNotice />
          <main className="newsprint-texture mx-auto w-full max-w-screen-xl flex-1 px-4 pb-32 pt-6 lg:pb-16">
            <Outlet />
          </main>
          <footer className="border-t border-ink px-4 py-6 pb-28 lg:pb-6">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-1 sm:flex-row sm:justify-between">
              <p className="label-meta">Edition: Vol 1.0 · Printed for one reader</p>
              <p className="label-meta">Data held in Supabase · Installable as an app</p>
            </div>
          </footer>
        </div>
        <BottomNav />
        <TaskFormDialog />
        <TaskDetailDialog />
      </div>
    </TaskDialogProvider>
  )
}
