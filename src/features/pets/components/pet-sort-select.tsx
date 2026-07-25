import { Select } from '~/shared/ui/select'

import type { PetSort } from '~/contracts'

const SORT_OPTIONS: { value: PetSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name_asc', label: 'Name (A–Z)' },
]

export function PetSortSelect({
  value,
  onChange,
}: {
  value: PetSort
  onChange: (sort: PetSort) => void
}) {
  return (
    <Select
      options={SORT_OPTIONS}
      value={value}
      onValueChange={(v) => onChange(v as PetSort)}
      aria-label="Sort"
      className="w-40"
    />
  )
}
