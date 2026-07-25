import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { FavouriteCard } from '~/features/favourites'
import { favouritesQuery } from '~/features/favourites/api/favourites.queries'

import { EmptyState } from '~/shared/components/empty-state'
import { ErrorState } from '~/shared/components/error-state'
import { PageHeader } from '~/shared/components/page-header'
import { Button } from '~/shared/ui/button'
import { Pagination } from '~/shared/ui/pagination'

const favouritesSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
})

export const Route = createFileRoute('/_authenticated/dashboard/favourites')({
  head: () => ({ meta: [{ title: 'Favourites · Adopta' }] }),
  validateSearch: favouritesSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(favouritesQuery(deps.search)),
  component: FavouritesPage,
  errorComponent: FavouritesError,
})

function FavouritesError() {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Favourites" />
      <ErrorState onRetry={() => void router.invalidate()} />
    </div>
  )
}

function FavouritesPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data } = useSuspenseQuery(favouritesQuery(search))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Favourites" count={data.meta.total} />

      {data.items.length === 0 ? (
        <EmptyState
          message="Nothing saved yet. Tap the heart on any pet to keep it here."
          action={
            <Button asChild variant="secondary">
              <Link to="/pets">Browse pets</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((pet) => (
              <FavouriteCard key={pet.id} pet={pet} />
            ))}
          </div>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => void navigate({ search: { page } })}
          />
        </>
      )}
    </div>
  )
}
