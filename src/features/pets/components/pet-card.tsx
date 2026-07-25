import { Link } from '@tanstack/react-router'

import { PetRecordStrip } from './pet-record-strip'
import { PetStatusStamp } from './pet-status-stamp'

import type { Pet } from '../model/pet.model'

export interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <Link
      to="/pets/$petId"
      params={{ petId: pet.id }}
      className="group flex flex-col gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-hairline bg-surface">
        {pet.coverPhoto ? (
          <img
            src={pet.coverPhoto.url}
            alt={pet.coverPhoto.alt ?? pet.name}
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-mono text-xs uppercase tracking-[0.08em] text-mute">
            No photo
          </div>
        )}
        <PetStatusStamp
          status={pet.status}
          className="absolute left-2 top-2 bg-surface/90"
        />
      </div>
      <h3 className="truncate font-display text-base font-semibold text-ink">
        {pet.name}
      </h3>
      <PetRecordStrip
        species={pet.species}
        ageLabel={pet.ageLabel}
        size={pet.size}
        city={pet.city}
      />
    </Link>
  )
}
