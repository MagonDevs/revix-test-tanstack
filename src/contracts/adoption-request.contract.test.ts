import { describe, expect, it } from 'vitest'

import { createAdoptionRequestRequestSchema } from './adoption-request.contract'

describe('createAdoptionRequestRequestSchema', () => {
  it('rejects a message shorter than 20 characters', () => {
    const result = createAdoptionRequestRequestSchema.safeParse({
      message: 'too short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a message longer than 1000 characters', () => {
    const result = createAdoptionRequestRequestSchema.safeParse({
      message: 'a'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it('accepts a message within the 20-1000 char range', () => {
    const result = createAdoptionRequestRequestSchema.safeParse({
      message: 'a'.repeat(20),
    })
    expect(result.success).toBe(true)
  })
})
