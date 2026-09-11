import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-screen-md px-4 py-20 text-center">
      <p className="label-meta">Page not printed</p>
      <h1 className="font-serif text-6xl font-black leading-none tracking-tighter sm:text-8xl">404</h1>
      <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-neutral-600">
        This edition has no such page. The dashboard has everything that was filed.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back to the dashboard</Link>
      </Button>
    </div>
  )
}
