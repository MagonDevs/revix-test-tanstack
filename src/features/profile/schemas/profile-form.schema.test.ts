import { describe, expect, it } from 'vitest'

import {
  profileFormSchema,
  toProfileFormValues,
  toUpdateUserRequest,
} from './profile-form.schema'

const VALID = {
  name: 'Marta Puig',
  city: 'Barcelona',
  phone: null,
  bio: null,
  avatarUrl: null,
}

describe('profileFormSchema', () => {
  it('accepts valid values', () => {
    expect(profileFormSchema.safeParse(VALID).success).toBe(true)
  })

  it('rejects a name under 2 characters', () => {
    expect(profileFormSchema.safeParse({ ...VALID, name: 'M' }).success).toBe(
      false,
    )
  })

  it('accepts a name of exactly 60 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, name: 'a'.repeat(60) }).success,
    ).toBe(true)
  })

  it('rejects a name over 60 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, name: 'a'.repeat(61) }).success,
    ).toBe(false)
  })

  it('rejects a city under 2 characters', () => {
    expect(profileFormSchema.safeParse({ ...VALID, city: 'B' }).success).toBe(
      false,
    )
  })

  it('accepts a city of exactly 80 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, city: 'a'.repeat(80) }).success,
    ).toBe(true)
  })

  it('rejects a city over 80 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, city: 'a'.repeat(81) }).success,
    ).toBe(false)
  })

  it('accepts a null phone', () => {
    expect(profileFormSchema.safeParse({ ...VALID, phone: null }).success).toBe(
      true,
    )
  })

  it('accepts a phone of exactly 30 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, phone: '1'.repeat(30) }).success,
    ).toBe(true)
  })

  it('rejects a phone over 30 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, phone: '1'.repeat(31) }).success,
    ).toBe(false)
  })

  it('accepts a null bio', () => {
    expect(profileFormSchema.safeParse({ ...VALID, bio: null }).success).toBe(
      true,
    )
  })

  it('accepts a bio of exactly 500 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, bio: 'a'.repeat(500) }).success,
    ).toBe(true)
  })

  it('rejects a bio over 500 characters', () => {
    expect(
      profileFormSchema.safeParse({ ...VALID, bio: 'a'.repeat(501) }).success,
    ).toBe(false)
  })
})

describe('toProfileFormValues', () => {
  it('maps a session user to form values, excluding email', () => {
    const values = toProfileFormValues({
      id: 'u1',
      name: 'Marta Puig',
      city: 'Barcelona',
      avatarUrl: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      bio: 'Hi',
      availablePetCount: 0,
      email: 'marta@example.com',
      phone: '600000000',
    })
    expect(values).toEqual({
      name: 'Marta Puig',
      city: 'Barcelona',
      phone: '600000000',
      bio: 'Hi',
      avatarUrl: null,
    })
  })
})

describe('toUpdateUserRequest', () => {
  it('only includes changed fields', () => {
    const diff = toUpdateUserRequest({ ...VALID, city: 'Valencia' }, VALID)
    expect(diff).toEqual({ city: 'Valencia' })
  })

  it('returns an empty diff when nothing changed', () => {
    const diff = toUpdateUserRequest(VALID, VALID)
    expect(diff).toEqual({})
  })
})
