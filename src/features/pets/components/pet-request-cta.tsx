import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { RequestDialog } from '~/features/adoption-requests'

import { Button } from '~/shared/ui/button'

import type { SessionUserDto } from '~/contracts'
import type { Pet } from '../model/pet.model'

export interface PetRequestCtaProps {
  pet: Pet
  viewer: SessionUserDto | null | undefined
}

export function PetRequestCta({ pet, viewer }: PetRequestCtaProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isOwnPet = viewer?.id === pet.guardian.id

  if (isOwnPet) {
    return (
      <Button size="lg" disabled>
        This is your pet
      </Button>
    )
  }

  if (pet.status !== 'available') {
    return (
      <Button size="lg" disabled>
        Not available
      </Button>
    )
  }

  if (pet.viewerRequestStatus === 'pending') {
    return (
      <Button size="lg" disabled>
        Request sent
      </Button>
    )
  }

  if (pet.viewerRequestStatus === 'accepted') {
    return (
      <Button size="lg" disabled>
        Request accepted
      </Button>
    )
  }

  if (!viewer) {
    return (
      <Button size="lg" asChild>
        <Link to="/login" search={{ redirect: `/pets/${pet.id}` }}>
          Sign in to request
        </Link>
      </Button>
    )
  }

  return (
    <>
      <Button size="lg" onClick={() => setIsDialogOpen(true)}>
        Request to adopt
      </Button>
      <RequestDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        petId={pet.id}
        petName={pet.name}
      />
    </>
  )
}
