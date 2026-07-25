import { z } from 'zod'

export const registerRequestSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.email().max(254),
  password: z.string().min(8).max(72),
  city: z.string().min(2).max(80),
})
export type RegisterRequest = z.infer<typeof registerRequestSchema>

export const loginRequestSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
})
export type LoginRequest = z.infer<typeof loginRequestSchema>
