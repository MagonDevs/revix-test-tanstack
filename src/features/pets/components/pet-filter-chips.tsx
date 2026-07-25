import { Chip } from '~/shared/ui/chip'
import { Button } from '~/shared/ui/button'

import type { PetSearch } from '../schemas/pet-search.schema'

export interface PetFilterChipsProps {
  search: PetSearch
  onRemove: (patch: Partial<PetSearch>) => void
  onClearAll: () => void
}

export function PetFilterChips({
  search,
  onRemove,
  onClearAll,
}: PetFilterChipsProps) {
  const chips: { key: string; label: string; remove: Partial<PetSearch> }[] = []

  if (search.q)
    chips.push({ key: 'q', label: `"${search.q}"`, remove: { q: undefined } })
  for (const species of search.species ?? [])
    chips.push({
      key: `species-${species}`,
      label: species,
      remove: {
        species: search.species?.filter((s) => s !== species) || undefined,
      },
    })
  for (const size of search.size ?? [])
    chips.push({
      key: `size-${size}`,
      label: size,
      remove: { size: search.size?.filter((s) => s !== size) || undefined },
    })
  if (search.sex)
    chips.push({ key: 'sex', label: search.sex, remove: { sex: undefined } })
  if (search.ageGroup)
    chips.push({
      key: 'ageGroup',
      label: search.ageGroup,
      remove: { ageGroup: undefined },
    })
  if (search.city)
    chips.push({ key: 'city', label: search.city, remove: { city: undefined } })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          variant="filter"
          onRemove={() => onRemove(chip.remove)}
        >
          {chip.label}
        </Chip>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Clear all filters
      </Button>
    </div>
  )
}
