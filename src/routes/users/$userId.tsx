import { createFileRoute } from '@tanstack/react-router'

import { AppFooter } from '~/shared/components/app-footer'
import { AppHeader } from '~/shared/components/app-header'
import { EmptyState } from '~/shared/components/empty-state'
import { Avatar } from '~/shared/ui/avatar'
import { MonoLabel } from '~/shared/ui/mono-label'

export const Route = createFileRoute('/users/$userId')({
  head: () => ({ meta: [{ title: 'Guardian profile · Adopta' }] }),
  component: UserProfilePage,
})

function UserProfilePage() {
  const { userId } = Route.useParams()

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-5 py-8">
        <div className="flex items-center gap-4">
          <Avatar name={`Guardian ${userId}`} size="lg" />
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-semibold text-ink">
              Guardian {userId}
            </h1>
            <MonoLabel>Member since —</MonoLabel>
            <p className="max-w-[60ch] text-sm text-mute">—</p>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <MonoLabel>Available pets</MonoLabel>
          <EmptyState message="This person has no pets listed right now." />
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
