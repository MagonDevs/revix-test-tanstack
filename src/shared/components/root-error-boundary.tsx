import { logger } from '~/shared/lib/logger'
import { Button } from '~/shared/ui/button'

interface RootErrorBoundaryProps {
  error: Error
}

export function RootErrorBoundary({ error }: RootErrorBoundaryProps) {
  logger.error('root_error_boundary', { message: error.message })

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">
        Something went wrong on our side.
      </h1>
      {error.message ? (
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
          {error.message}
        </p>
      ) : null}
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </main>
  )
}
