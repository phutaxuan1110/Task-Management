import { Archive, CalendarDays, FolderOpen, LayoutDashboard, ListChecks, Settings } from 'lucide-react'

export const SIDEBAR_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'My tasks', icon: ListChecks, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/categories', label: 'Categories', icon: FolderOpen, end: false },
  { to: '/archived', label: 'Archived', icon: Archive, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListChecks, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]
