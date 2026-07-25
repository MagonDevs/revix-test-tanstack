import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { SiteHeader } from '~/features/auth'
import { petListQuery, PetCard } from '~/features/pets'

import { AppFooter } from '~/shared/components/app-footer'
import { Button } from '~/shared/ui/button'
import { MonoLabel } from '~/shared/ui/mono-label'

const RECENT_QUERY = { sort: 'newest' as const, page: 1, perPage: 3 }

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(petListQuery(RECENT_QUERY)),
  head: () => ({ meta: [{ title: 'Adopta — Find a pet a home' }] }),
  component: Home,
})

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Publish',
    body: 'Add photos and the basics. Takes a few minutes.',
  },
  {
    step: '2',
    title: 'Get requests',
    body: 'People who want to adopt reach out through the site.',
  },
  {
    step: '3',
    title: 'Meet',
    body: 'Accept a request and arrange to meet in person.',
  },
]

function Home() {
  const { data } = useSuspenseQuery(petListQuery(RECENT_QUERY))
  const total = data.meta.total
  const cityCount = new Set(data.items.map((pet) => pet.city)).size
  const isEmpty = total === 0

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-16 px-5 py-12">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            {!isEmpty ? (
              <MonoLabel>
                {total} pets{cityCount > 0 ? ` · ${cityCount}+ cities` : ''}
              </MonoLabel>
            ) : null}
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink lg:text-5xl">
              Find a pet a home
            </h1>
            <p className="max-w-[42ch] text-base text-mute">
              A quiet, careful registry of animals waiting to be adopted.
            </p>
            <div className="mt-2 flex gap-3">
              <Button asChild size="lg">
                <Link to="/pets">Browse pets</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link
                  to="/register"
                  search={{ redirect: '/dashboard/pets/new' }}
                >
                  Publish a pet
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex aspect-[3/4] items-center justify-center rounded-lg border border-hairline bg-surface"
              >
                <MonoLabel>No photo</MonoLabel>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <MonoLabel>Recently added</MonoLabel>
            <Link
              to="/pets"
              className="text-sm font-medium text-pine hover:underline"
            >
              View all pets
            </Link>
          </div>
          {isEmpty ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-hairline px-6 py-16 text-center">
              <p className="max-w-sm text-sm text-mute">
                No pets have been published yet.
              </p>
              <Button asChild variant="secondary">
                <Link
                  to="/register"
                  search={{ redirect: '/dashboard/pets/new' }}
                >
                  Be the first to publish
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-8 border-t border-hairline pt-12 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex flex-col gap-2">
              <MonoLabel>Step {item.step}</MonoLabel>
              <h2 className="font-display text-lg font-semibold text-ink">
                {item.title}
              </h2>
              <p className="text-sm text-mute">{item.body}</p>
            </div>
          ))}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
