import { createFileRoute } from '@tanstack/react-router'

import { SiteHeader } from '~/features/auth'

import { AppFooter } from '~/shared/components/app-footer'
import { PageHeader } from '~/shared/components/page-header'
import { PetsBrowseShell } from '~/shared/components/pets-browse-shell'

export const Route = createFileRoute('/pets/')({
  head: () => ({ meta: [{ title: 'Pets looking for a home · Adopta' }] }),
  component: PetsBrowsePage,
})

function PetsBrowsePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-5 py-8">
        <PageHeader title="Browse pets" />
        <PetsBrowseShell />
      </main>
      <AppFooter />
    </div>
  )
}
