import { Check, Minus } from 'lucide-react'

import type { PetTraits as PetTraitsValue } from '../model/pet.model'

const TRAIT_LABELS: { key: keyof PetTraitsValue; label: string }[] = [
  { key: 'isVaccinated', label: 'Vaccinated' },
  { key: 'isNeutered', label: 'Neutered' },
  { key: 'isGoodWithKids', label: 'Good with children' },
  { key: 'isGoodWithPets', label: 'Good with other pets' },
]

export function PetTraits({ traits }: { traits: PetTraitsValue }) {
  return (
    <ul className="flex flex-col gap-1 text-sm text-ink">
      {TRAIT_LABELS.map(({ key, label }) => (
        <li key={key} className="flex items-center gap-2">
          {traits[key] ? (
            <Check
              className="size-4 text-status-available"
              aria-hidden="true"
            />
          ) : (
            <Minus className="size-4 text-mute" aria-hidden="true" />
          )}
          <span className={traits[key] ? 'text-ink' : 'text-mute'}>
            {label}
          </span>
        </li>
      ))}
    </ul>
  )
}
