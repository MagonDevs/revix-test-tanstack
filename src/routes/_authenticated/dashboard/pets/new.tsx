import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { PetForm } from '~/features/pets/components/pet-form'
import { createEmptyPetFormValues } from '~/features/pets/schemas/pet-form.schema'

import { PageHeader } from '~/shared/components/page-header'

export const Route = createFileRoute('/_authenticated/dashboard/pets/new')({
  head: () => ({ meta: [{ title: 'Publish a pet · Adopta' }] }),
  component: NewPetPage,
})

function NewPetPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Publish a pet" />
      <PetForm
        mode="create"
        initialValues={createEmptyPetFormValues()}
        onCancel={() => void navigate({ to: '/dashboard/pets' })}
      />
    </div>
  )
}
