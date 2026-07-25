import { AGE_GROUP_MONTHS, type AgeGroup } from '~/contracts'

/** Maps raw age-in-months to the coarse age-group bucket used for filtering. */
export function toAgeGroup(ageMonths: number): AgeGroup {
  for (const [group, [min, max]] of Object.entries(AGE_GROUP_MONTHS) as [
    AgeGroup,
    [number, number],
  ][]) {
    if (ageMonths >= min && ageMonths <= max) return group
  }
  // Anything beyond the table's upper bound still reads as senior.
  return 'senior'
}

/** Formats age-in-months as e.g. "1y 6m", "3m", "2y". */
export function formatAge(ageMonths: number): string {
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  if (years === 0) return `${months}m`
  if (months === 0) return `${years}y`
  return `${years}y ${months}m`
}
