import { z } from 'zod'

import type { LoginRequest, RegisterRequest } from '~/contracts'

/**
 * Form schemas validate the shape TanStack Form works with (strings from
 * inputs, confirmation fields). They deliberately diverge from the wire
 * schemas in ~/contracts/auth.contract — see doc02 §7.
 */
export const loginFormSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})
export type LoginFormValues = z.infer<typeof loginFormSchema>

export const registerFormSchema = z
  .object({
    name: z.string().min(2, 'Enter your name.').max(60),
    email: z.email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm your password.'),
    city: z.string().min(2, 'Enter your city.').max(80),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
export type RegisterFormValues = z.infer<typeof registerFormSchema>

export function toLoginRequest(values: LoginFormValues): LoginRequest {
  return { email: values.email, password: values.password }
}

export function toRegisterRequest(values: RegisterFormValues): RegisterRequest {
  return {
    name: values.name,
    email: values.email,
    password: values.password,
    city: values.city,
  }
}
