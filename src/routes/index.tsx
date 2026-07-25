import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Adopta — Find a pet a home' }] }),
  component: Home,
})

function Home() {
  return (
    <main className="p-8">
      <h1 className="font-display text-4xl font-bold text-ink">Adopta</h1>
      <p className="mt-4 text-body text-mute">
        Landing page — built in Phase 1/4.
      </p>
    </main>
  )
}
