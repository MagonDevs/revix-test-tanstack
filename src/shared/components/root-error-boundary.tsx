import { logger } from '~/shared/lib/logger'

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
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Reload
      </button>
    </main>
  )
}
