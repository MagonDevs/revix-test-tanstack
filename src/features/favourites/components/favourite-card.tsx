import { X } from 'lucide-react'

import { PetCard } from '~/features/pets/components/pet-card'
import type { Pet } from '~/features/pets/model/pet.model'

import { Button } from '~/shared/ui/button'

import { useToggleFavourite } from '../api/favourites.mutations'

export interface FavouriteCardProps {
  pet: Pet
}

export function FavouriteCard({ pet }: FavouriteCardProps) {
  const toggleFavourite = useToggleFavourite()

  return (
    <div className="group/fav relative">
      <PetCard pet={pet} />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="absolute bottom-3 right-3 opacity-100 transition-opacity duration-150 ease-out focus-visible:opacity-100 sm:opacity-0 sm:group-hover/fav:opacity-100 sm:group-focus-within/fav:opacity-100"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          toggleFavourite.mutate({ petId: pet.id, isFavourited: true })
        }}
      >
        <X className="size-4" aria-hidden="true" />
        Remove
      </Button>
    </div>
  )
}
