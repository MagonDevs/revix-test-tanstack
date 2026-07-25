import { AGE_GROUP_MONTHS, type AgeGroup } from '~/contracts'

export function toAgeGroup(ageMonths: number): AgeGroup {
  for (const [group, [min, max]] of Object.entries(AGE_GROUP_MONTHS) as [
    AgeGroup,
    [number, number],
  ][]) {
    if (ageMonths >= min && ageMonths <= max) return group
  }
  return 'senior'
}

export function formatAge(ageMonths: number): string {
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  if (years === 0) return `${months}m`
  if (months === 0) return `${years}y`
  return `${years}y ${months}m`
}
