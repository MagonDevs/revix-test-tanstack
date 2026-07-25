import { createFileRoute, Link } from '@tanstack/react-router'

import { SiteHeader } from '~/features/auth'

import { AppFooter } from '~/shared/components/app-footer'
import { PetDetailShell } from '~/shared/components/pet-detail-shell'

export const Route = createFileRoute('/pets/$petId')({
  head: () => ({ meta: [{ title: 'Pet · Adopta' }] }),
  component: PetDetailPage,
})

function PetDetailPage() {
  const { petId } = Route.useParams()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8">
        <Link
          to="/pets"
          className="font-mono text-xs uppercase tracking-[0.08em] text-mute underline-offset-4 hover:underline"
        >
          ‹ Back to pets
        </Link>
        <PetDetailShell petId={petId} />
      </main>
      <AppFooter />
    </div>
  )
}
