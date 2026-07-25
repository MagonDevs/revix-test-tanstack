import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pets/')({
  head: () => ({ meta: [{ title: 'Pets looking for a home · Adopta' }] }),
  component: PetsBrowsePage,
})

function PetsBrowsePage() {
  return (
    <main className="p-8">
      <h1 className="font-display text-3xl font-bold text-ink">Browse pets</h1>
      <p className="mt-4 text-mute">Built in Phase 4.</p>
    </main>
  )
}
