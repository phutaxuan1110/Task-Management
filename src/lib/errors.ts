import { toast } from 'sonner'

export class AppError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

/** Turns any thrown value into a short, human sentence. */
export function toMessage(error: unknown, fallback = 'Something went wrong. Try again.'): string {
  if (isOffline()) return 'You are offline. Your input is kept — save again once you reconnect.'
  if (error instanceof Error && error.message) {
    const msg = error.message
    if (msg.includes('Failed to fetch')) return 'Cannot reach the server. Check your connection and try again.'
    if (msg.toLowerCase().includes('invalid login credentials')) return 'That email and password combination is not recognised.'
    if (msg.toLowerCase().includes('user already registered')) return 'That email already has an account. Sign in instead.'
    if (msg.includes('duplicate key')) return 'That name is already used. Pick another one.'
    return msg
  }
  return fallback
}

export function reportError(error: unknown, fallback?: string) {
  const message = toMessage(error, fallback)
  console.error('[app-error]', error)
  toast.error(message)
  return message
}
