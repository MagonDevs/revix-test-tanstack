import { describe, expect, it } from 'vitest'

import { petSearchSchema } from './pet-search.schema'

describe('petSearchSchema', () => {
  it('defaults sort and page when omitted', () => {
    const result = petSearchSchema.parse({})
    expect(result.sort).toBe('newest')
    expect(result.page).toBe(1)
  })

  it('falls back to defaults for an invalid sort value instead of throwing', () => {
    const result = petSearchSchema.parse({ sort: 'bogus' })
    expect(result.sort).toBe('newest')
  })

  it('falls back to default page for a negative page value', () => {
    const result = petSearchSchema.parse({ page: -3 })
    expect(result.page).toBe(1)
  })

  it('drops an invalid species entry rather than crashing', () => {
    const result = petSearchSchema.parse({ species: ['dog', 'dragon'] })
    expect(result.species).toBeUndefined()
  })

  it('parses a full valid query', () => {
    const result = petSearchSchema.parse({
      q: 'luna',
      species: ['dog', 'cat'],
      size: ['small'],
      sex: 'female',
      ageGroup: 'young',
      city: 'Madrid',
      sort: 'oldest',
      page: 2,
    })
    expect(result).toMatchObject({
      q: 'luna',
      species: ['dog', 'cat'],
      size: ['small'],
      sex: 'female',
      ageGroup: 'young',
      city: 'Madrid',
      sort: 'oldest',
      page: 2,
    })
  })
})
