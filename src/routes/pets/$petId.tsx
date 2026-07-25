import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { SiteHeader, useSession } from '~/features/auth'
import { FavouriteButton } from '~/features/favourites'
import {
  petDetailQuery,
  GuardianSummary,
  PetGallery,
  PetRecord,
  PetRequestCta,
  PetStatusStamp,
  PetTraits,
} from '~/features/pets'

import { AppFooter } from '~/shared/components/app-footer'
import { EmptyState } from '~/shared/components/empty-state'
import { Button } from '~/shared/ui/button'
import { parseApiError } from '~/shared/lib/api-error'

export const Route = createFileRoute('/pets/$petId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(petDetailQuery(params.petId)),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Pet · Adopta' }] }
    const description = loaderData.description.slice(0, 160)
    return {
      meta: [
        { title: `${loaderData.name} · Adopta` },
        { property: 'og:title', content: `${loaderData.name} · Adopta` },
        { property: 'og:description', content: description },
        ...(loaderData.coverPhoto
          ? [{ property: 'og:image', content: loaderData.coverPhoto.url }]
          : []),
      ],
    }
  },
  component: PetDetailPage,
  errorComponent: PetDetailError,
})

function PetDetailError({ error }: { error: unknown }) {
  const parsed = parseApiError(error)
  if (parsed.status === 404) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8">
          <EmptyState
            message="This pet isn't available."
            action={
              <Button variant="secondary" asChild>
                <Link to="/pets">Browse pets</Link>
              </Button>
            }
          />
        </main>
        <AppFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8">
        <EmptyState
          message="We couldn't load this. Check your connection and try again."
          action={
            <Button variant="secondary" asChild>
              <Link to="/pets">Browse pets</Link>
            </Button>
          }
        />
      </main>
      <AppFooter />
    </div>
  )
}

function PetDetailPage() {
  const { petId } = Route.useParams()
  const { data: pet } = useSuspenseQuery(petDetailQuery(petId))
  const { user } = useSession()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8 pb-28 lg:pb-8">
        <Link
          to="/pets"
          className="font-mono text-xs uppercase tracking-[0.08em] text-mute underline-offset-4 hover:underline"
        >
          ‹ Back to pets
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <PetGallery photos={pet.photos} name={pet.name} />

          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-ink">
                {pet.name}
              </h1>
              <PetStatusStamp status={pet.status} />
            </div>

            <PetRecord pet={pet} />
            <PetTraits traits={pet.traits} />
            <GuardianSummary guardian={pet.guardian} />

            <div className="hidden flex-col gap-2 lg:flex">
              <div className="flex items-center gap-3">
                <PetRequestCta pet={pet} viewer={user} />
                <FavouriteButton
                  petId={pet.id}
                  isFavourited={pet.isFavourited}
                  redirectPath={`/pets/${pet.id}`}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 flex items-center gap-3 border-t border-hairline bg-surface p-4 lg:hidden">
        <div className="flex-1">
          <PetRequestCta pet={pet} viewer={user} />
        </div>
        <FavouriteButton
          petId={pet.id}
          isFavourited={pet.isFavourited}
          redirectPath={`/pets/${pet.id}`}
        />
      </div>

      <AppFooter />
    </div>
  )
}
