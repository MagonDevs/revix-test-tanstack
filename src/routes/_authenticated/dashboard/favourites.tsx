import { createFileRoute, Link } from '@tanstack/react-router'

import { EmptyState } from '~/shared/components/empty-state'
import { PageHeader } from '~/shared/components/page-header'
import { Button } from '~/shared/ui/button'

export const Route = createFileRoute('/_authenticated/dashboard/favourites')({
  head: () => ({ meta: [{ title: 'Favourites · Adopta' }] }),
  component: FavouritesPage,
})

function FavouritesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Favourites" count={0} />
      <EmptyState
        message="Nothing saved yet. Tap the heart on any pet to keep it here."
        action={
          <Button asChild variant="secondary">
            <Link to="/pets">Browse pets</Link>
          </Button>
        }
      />
    </div>
  )
}
