import { Checkbox } from '~/shared/ui/checkbox'
import { Input } from '~/shared/ui/input'
import { MonoLabel } from '~/shared/ui/mono-label'
import { Select } from '~/shared/ui/select'

import type { PetSearch } from '../schemas/pet-search.schema'
import type { AgeGroup, Sex, Size, Species } from '~/contracts'

const SPECIES_OPTIONS: Species[] = ['dog', 'cat', 'rabbit', 'bird', 'other']
const SIZE_OPTIONS: Size[] = ['small', 'medium', 'large']
const ANY = 'any'
const SEX_OPTIONS = [
  { value: ANY, label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
]
const AGE_GROUP_OPTIONS = [
  { value: ANY, label: 'Any' },
  { value: 'baby', label: 'Baby' },
  { value: 'young', label: 'Young' },
  { value: 'adult', label: 'Adult' },
  { value: 'senior', label: 'Senior' },
]

export interface PetFiltersValue {
  species?: Species[] | undefined
  size?: Size[] | undefined
  sex?: Sex | undefined
  ageGroup?: AgeGroup | undefined
  city?: string | undefined
}

export interface PetFiltersProps {
  value: PetFiltersValue
  onChange: (patch: Partial<PetSearch>) => void
}

function toggle<T>(list: T[] | undefined, item: T): T[] | undefined {
  const next = list?.includes(item)
    ? list.filter((i) => i !== item)
    : [...(list ?? []), item]
  return next && next.length > 0 ? next : undefined
}

export function PetFilters({ value, onChange }: PetFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <MonoLabel>Species</MonoLabel>
        {SPECIES_OPTIONS.map((species) => (
          <label
            key={species}
            className="flex items-center gap-2 text-sm text-ink capitalize"
          >
            <Checkbox
              aria-label={species}
              checked={value.species?.includes(species) ?? false}
              onCheckedChange={() =>
                onChange({ species: toggle(value.species, species) })
              }
            />
            {species}
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <MonoLabel>Size</MonoLabel>
        {SIZE_OPTIONS.map((size) => (
          <label
            key={size}
            className="flex items-center gap-2 text-sm text-ink capitalize"
          >
            <Checkbox
              aria-label={size}
              checked={value.size?.includes(size) ?? false}
              onCheckedChange={() =>
                onChange({ size: toggle(value.size, size) })
              }
            />
            {size}
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <MonoLabel>Sex</MonoLabel>
        <Select
          options={SEX_OPTIONS}
          value={value.sex ?? ANY}
          onValueChange={(v) =>
            onChange({ sex: v === ANY ? undefined : (v as Sex) })
          }
          placeholder="Any"
          aria-label="Sex"
        />
      </div>

      <div className="flex flex-col gap-2">
        <MonoLabel>Age</MonoLabel>
        <Select
          options={AGE_GROUP_OPTIONS}
          value={value.ageGroup ?? ANY}
          onValueChange={(v) =>
            onChange({ ageGroup: v === ANY ? undefined : (v as AgeGroup) })
          }
          placeholder="Any"
          aria-label="Age group"
        />
      </div>

      <div className="flex flex-col gap-2">
        <MonoLabel>City</MonoLabel>
        <Input
          placeholder="Any city"
          aria-label="City"
          defaultValue={value.city ?? ''}
          onBlur={(e) => onChange({ city: e.currentTarget.value || undefined })}
        />
      </div>
    </div>
  )
}
