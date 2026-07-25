import { describe, expect, it } from 'vitest'

import { formatAge, toAgeGroup } from './pet-age'

describe('toAgeGroup', () => {
  it.each([
    [0, 'baby'],
    [5, 'baby'],
    [6, 'young'],
    [23, 'young'],
    [24, 'adult'],
    [95, 'adult'],
    [96, 'senior'],
    [360, 'senior'],
  ] as const)('maps %i months to %s', (months, expected) => {
    expect(toAgeGroup(months)).toBe(expected)
  })
})

describe('formatAge', () => {
  it('formats under a year as months only', () => {
    expect(formatAge(3)).toBe('3m')
  })

  it('formats whole years without a month suffix', () => {
    expect(formatAge(24)).toBe('2y')
  })

  it('formats years and months', () => {
    expect(formatAge(18)).toBe('1y 6m')
  })

  it('formats zero months', () => {
    expect(formatAge(0)).toBe('0m')
  })
})
