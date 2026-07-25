import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useDeletePet } from '~/features/pets/api/pets.mutations'
import { petDetailQuery } from '~/features/pets/api/pets.queries'
import { PetForm } from '~/features/pets/components/pet-form'
import type { PetFormValues } from '~/features/pets/schemas/pet-form.schema'

import { ConfirmDialog } from '~/shared/components/confirm-dialog'
import { EmptyState } from '~/shared/components/empty-state'
import { PageHeader } from '~/shared/components/page-header'
import { Button } from '~/shared/ui/button'

export const Route = createFileRoute(
  '/_authenticated/dashboard/pets/$petId/edit',
)({
  head: () => ({ meta: [{ title: 'Edit listing · Adopta' }] }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(petDetailQuery(params.petId)),
  component: EditPetPage,
})

function petToFormValues(pet: {
  name: string
  species: PetFormValues['species']
  breed: string | undefined
  sex: PetFormValues['sex']
  ageMonths: number
  size: PetFormValues['size']
  weightKg: number | undefined
  description: string
  city: string
  photos: { id: string; url: string }[]
  traits: {
    isVaccinated: boolean
    isNeutered: boolean
    isGoodWithKids: boolean
    isGoodWithPets: boolean
  }
}): PetFormValues {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? null,
    sex: pet.sex,
    ageMonths: pet.ageMonths,
    size: pet.size,
    weightKg: pet.weightKg ?? null,
    description: pet.description,
    city: pet.city,
    photos: pet.photos.map((photo) => ({
      localId: photo.id,
      uploadId: photo.id,
      previewUrl: photo.url,
      status: 'uploaded' as const,
    })),
    isVaccinated: pet.traits.isVaccinated,
    isNeutered: pet.traits.isNeutered,
    isGoodWithKids: pet.traits.isGoodWithKids,
    isGoodWithPets: pet.traits.isGoodWithPets,
  }
}

function EditPetPage() {
  const { petId } = Route.useParams()
  const { session } = Route.useRouteContext()
  const { data: pet } = useSuspenseQuery(petDetailQuery(petId))
  const navigate = useNavigate()
  const deletePet = useDeletePet()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const isOwner = pet.guardian.id === session.id

  if (!isOwner) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Edit listing" />
        <EmptyState
          message="This listing isn't yours."
          action={
            <Button variant="secondary" asChild>
              <Link to="/dashboard/pets">My listings</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit listing" />
      <PetForm
        mode="edit"
        petId={petId}
        initialValues={petToFormValues(pet)}
        updatedAt={pet.updatedAt}
        onCancel={() => void navigate({ to: '/dashboard/pets' })}
        onDeleteRequested={() => setIsDeleteOpen(true)}
      />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete listing"
        description={`Deleting ${pet.name}'s listing is permanent and can't be undone.`}
        confirmLabel="Delete listing"
        isDestructive
        isConfirming={deletePet.isPending}
        onConfirm={() =>
          deletePet.mutate(petId, {
            onSuccess: () => void navigate({ to: '/dashboard/pets' }),
          })
        }
      />
    </div>
  )
}
