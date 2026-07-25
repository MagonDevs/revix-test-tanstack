import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '~/shared/components/page-header'
import { PetFormShell } from '~/shared/components/pet-form-shell'

export const Route = createFileRoute('/_authenticated/dashboard/pets/new')({
  head: () => ({ meta: [{ title: 'Publish a pet · Adopta' }] }),
  component: NewPetPage,
})

function NewPetPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Publish a pet" />
      <PetFormShell mode="create" />
    </div>
  )
}
