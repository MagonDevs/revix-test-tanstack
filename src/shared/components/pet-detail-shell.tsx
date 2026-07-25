import { Button } from '~/shared/ui/button'
import { MonoLabel } from '~/shared/ui/mono-label'
import { StatusStamp } from '~/shared/ui/status-stamp'

const RECORD_ROWS = [
  ['Species', '—'],
  ['Age', '—'],
  ['Sex', '—'],
  ['Size', '—'],
  ['Weight', '—'],
  ['City', '—'],
  ['Listed', '—'],
]

export interface PetDetailShellProps {
  petId: string
}

export function PetDetailShell({ petId }: PetDetailShellProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-hairline bg-surface">
        <MonoLabel>No photo</MonoLabel>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">
            Pet {petId}
          </h1>
          <StatusStamp status="available" />
        </div>

        <div className="rounded-lg border border-hairline">
          <div className="border-b border-hairline px-4 py-2">
            <MonoLabel>Record</MonoLabel>
          </div>
          <dl className="divide-y divide-hairline">
            {RECORD_ROWS.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-2"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.08em] text-mute">
                  {label}
                </dt>
                <dd className="text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ul className="flex flex-col gap-1 text-sm text-mute">
          <li>— Vaccinated</li>
          <li>— Neutered</li>
          <li>— Good with children</li>
        </ul>

        <div className="flex flex-col gap-2">
          <Button size="lg">Request to adopt</Button>
          <Button variant="secondary" size="lg">
            ♡ Save
          </Button>
        </div>
      </div>
    </div>
  )
}
