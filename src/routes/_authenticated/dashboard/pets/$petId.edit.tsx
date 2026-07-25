import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '~/shared/components/page-header'
import { PetFormShell } from '~/shared/components/pet-form-shell'

export const Route = createFileRoute(
  '/_authenticated/dashboard/pets/$petId/edit',
)({
  head: () => ({ meta: [{ title: 'Edit listing · Adopta' }] }),
  component: EditPetPage,
})

function EditPetPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit listing" />
      <PetFormShell mode="edit" />
    </div>
  )
}
