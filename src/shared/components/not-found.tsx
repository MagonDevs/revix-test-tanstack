import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.08em] text-mute">
        404
      </p>
      <h1 className="font-display text-3xl font-bold text-ink">
        We couldn&apos;t find that page.
      </h1>
      <div className="mt-2 flex gap-3">
        <Link
          to="/pets"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-pine"
        >
          Browse pets
        </Link>
        <Link
          to="/"
          className="rounded-md border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-ink/40"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
