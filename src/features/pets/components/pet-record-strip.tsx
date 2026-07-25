import { cn } from '~/shared/lib/cn'

export interface PetRecordStripProps {
  species: string
  ageLabel: string
  size: string
  city: string
  className?: string
}

/** Single-line mono record strip used on `PetCard`. */
export function PetRecordStrip({
  species,
  ageLabel,
  size,
  city,
  className,
}: PetRecordStripProps) {
  return (
    <p
      className={cn(
        'truncate font-mono text-xs uppercase tracking-[0.08em] text-mute',
        className,
      )}
    >
      {species} · {ageLabel} · {size} · {city}
    </p>
  )
}
