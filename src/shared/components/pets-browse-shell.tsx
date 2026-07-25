import { Checkbox } from '~/shared/ui/checkbox'
import { Input } from '~/shared/ui/input'
import { MonoLabel } from '~/shared/ui/mono-label'
import { Select } from '~/shared/ui/select'
import { Skeleton } from '~/shared/ui/skeleton'

const FILTER_GROUPS = [
  { label: 'Species', options: ['Dog', 'Cat'] },
  { label: 'Size', options: ['Small', 'Medium', 'Large'] },
  { label: 'Sex', options: ['Male', 'Female'] },
  { label: 'Age', options: ['Baby', 'Young', 'Adult', 'Senior'] },
  { label: 'City', options: ['Barcelona', 'Madrid', 'Valencia'] },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name' },
]

export function PetsBrowseShell() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="flex flex-col gap-6 lg:w-60 lg:shrink-0">
        {FILTER_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <MonoLabel>{group.label}</MonoLabel>
            {group.options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-ink"
              >
                <Checkbox aria-label={option} />
                {option}
              </label>
            ))}
          </div>
        ))}
      </aside>

      <div className="flex flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search pets…"
            aria-label="Search pets"
            className="max-w-xs"
          />
          <Select
            options={SORT_OPTIONS}
            value="newest"
            placeholder="Sort"
            aria-label="Sort"
            className="w-40"
          />
          <MonoLabel className="ml-auto">— pets</MonoLabel>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  )
}
