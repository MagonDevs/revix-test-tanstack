import { MonoLabel } from '~/shared/ui/mono-label'

import type { Pet } from '../model/pet.model'

export function PetRecord({ pet }: { pet: Pet }) {
  const rows: [string, string][] = [
    ['Species', pet.species],
    ['Breed', pet.breed ?? '—'],
    ['Age', pet.ageLabel],
    ['Sex', pet.sex],
    ['Size', pet.size],
    ['Weight', pet.weightKg ? `${pet.weightKg} kg` : '—'],
    ['City', pet.city],
    ['Listed', pet.createdAt.toLocaleDateString()],
  ]

  return (
    <div className="rounded-lg border border-hairline">
      <div className="border-b border-hairline px-4 py-2">
        <MonoLabel>Record</MonoLabel>
      </div>
      <dl className="divide-y divide-hairline">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-2"
          >
            <dt className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
              {label}
            </dt>
            <dd className="text-sm capitalize text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
