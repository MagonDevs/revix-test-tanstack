import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { SiteHeader } from '~/features/auth'
import { userPetsQuery, userQuery } from '~/features/pets/api/pets.queries'
import { PetGrid } from '~/features/pets/components/pet-grid'

import { AppFooter } from '~/shared/components/app-footer'
import { EmptyState } from '~/shared/components/empty-state'
import { Avatar } from '~/shared/ui/avatar'
import { MonoLabel } from '~/shared/ui/mono-label'
import { Pagination } from '~/shared/ui/pagination'

const userSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
})

export const Route = createFileRoute('/users/$userId')({
  validateSearch: userSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, params, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(userQuery(params.userId)),
      context.queryClient.ensureQueryData(
        userPetsQuery(params.userId, { page: deps.search.page }),
      ),
    ]),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.[0]?.name ?? 'Guardian'} · Adopta` }],
  }),
  component: UserProfilePage,
})

function UserProfilePage() {
  const { userId } = Route.useParams()
  const { page } = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: user } = useSuspenseQuery(userQuery(userId))
  const { data: pets } = useSuspenseQuery(userPetsQuery(userId, { page }))

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-5 py-8">
        <div className="flex items-center gap-4">
          <Avatar
            {...(user.avatarUrl ? { src: user.avatarUrl } : {})}
            name={user.name}
            size="lg"
          />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-semibold text-ink">
              {user.name}
            </h1>
            <MonoLabel>
              {user.city} · Member since{' '}
              {new Date(user.createdAt).getFullYear()}
            </MonoLabel>
            {user.bio ? (
              <p className="max-w-[60ch] text-sm text-mute">{user.bio}</p>
            ) : null}
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <MonoLabel>Available pets</MonoLabel>
          {pets.items.length === 0 ? (
            <EmptyState message="This person has no pets listed right now." />
          ) : (
            <>
              <PetGrid pets={pets.items} />
              <Pagination
                page={pets.meta.page}
                totalPages={pets.meta.totalPages}
                onPageChange={(nextPage) =>
                  void navigate({ search: { page: nextPage } })
                }
              />
            </>
          )}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
