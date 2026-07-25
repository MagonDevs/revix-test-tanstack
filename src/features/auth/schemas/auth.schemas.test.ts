import { describe, expect, it } from 'vitest'

import {
  loginFormSchema,
  registerFormSchema,
  toLoginRequest,
  toRegisterRequest,
} from './auth.schemas'

describe('loginFormSchema', () => {
  it('accepts a valid email and an 8-char password', () => {
    const result = loginFormSchema.safeParse({
      email: 'marta@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginFormSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a password under 8 characters', () => {
    const result = loginFormSchema.safeParse({
      email: 'marta@example.com',
      password: 'short1',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a password of exactly 8 characters', () => {
    const result = loginFormSchema.safeParse({
      email: 'marta@example.com',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })
})

describe('registerFormSchema', () => {
  const base = {
    name: 'Marta Puig',
    email: 'marta@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    city: 'Barcelona',
  }

  it('accepts valid values with matching passwords', () => {
    expect(registerFormSchema.safeParse(base).success).toBe(true)
  })

  it('rejects mismatched passwords, attaching the error to confirmPassword', () => {
    const result = registerFormSchema.safeParse({
      ...base,
      confirmPassword: 'different123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
      expect(result.error.issues[0]?.message).toBe('Passwords do not match.')
    }
  })

  it('rejects a name under 2 characters', () => {
    expect(registerFormSchema.safeParse({ ...base, name: 'M' }).success).toBe(
      false,
    )
  })

  it('rejects a city under 2 characters', () => {
    expect(registerFormSchema.safeParse({ ...base, city: 'B' }).success).toBe(
      false,
    )
  })

  it('rejects an invalid email', () => {
    expect(
      registerFormSchema.safeParse({ ...base, email: 'nope' }).success,
    ).toBe(false)
  })
})

describe('toLoginRequest / toRegisterRequest', () => {
  it('maps login form values to the wire shape', () => {
    expect(
      toLoginRequest({ email: 'marta@example.com', password: 'password123' }),
    ).toEqual({ email: 'marta@example.com', password: 'password123' })
  })

  it('maps register form values to the wire shape, stripping confirmPassword', () => {
    const request = toRegisterRequest({
      name: 'Marta Puig',
      email: 'marta@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      city: 'Barcelona',
    })
    expect(request).toEqual({
      name: 'Marta Puig',
      email: 'marta@example.com',
      password: 'password123',
      city: 'Barcelona',
    })
    expect(request).not.toHaveProperty('confirmPassword')
  })
})
