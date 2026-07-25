import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { sessionQuery } from '~/features/auth'
import { ProfileForm } from '~/features/profile'

import { PageHeader } from '~/shared/components/page-header'

export const Route = createFileRoute('/_authenticated/dashboard/profile')({
  head: () => ({ meta: [{ title: 'Profile · Adopta' }] }),
  component: ProfilePage,
})

function ProfilePage() {
  // Prefetched at root per doc02 — the `_authenticated` layout already
  // guarantees a session exists here, so `data` is never null on this route.
  const { data: user } = useSuspenseQuery(sessionQuery())

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" />
      {user ? <ProfileForm user={user} /> : null}
    </div>
  )
}
