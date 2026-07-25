import { Link } from '@tanstack/react-router'

import { Button } from '~/shared/ui/button'

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="font-mono text-5xl font-medium uppercase tracking-[0.08em] text-mute">
        404
      </p>
      <h1 className="font-display text-2xl font-bold text-ink">
        We couldn&apos;t find that page.
      </h1>
      <div className="mt-2 flex gap-3">
        <Button asChild variant="primary">
          <Link to="/pets">Browse pets</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </main>
  )
}
