import { z } from 'zod'

import { idSchema, isoDateTimeSchema } from './common.contract'

export const userSummaryDtoSchema = z.object({
  id: idSchema,
  name: z.string(),
  city: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: isoDateTimeSchema,
})
export type UserSummaryDto = z.infer<typeof userSummaryDtoSchema>

export const userDtoSchema = userSummaryDtoSchema.extend({
  bio: z.string().nullable(),
  availablePetCount: z.number().int().nonnegative(),
})
export type UserDto = z.infer<typeof userDtoSchema>

export const sessionUserDtoSchema = userDtoSchema.extend({
  email: z.string(),
  phone: z.string().nullable(),
})
export type SessionUserDto = z.infer<typeof sessionUserDtoSchema>

/** PATCH /users/me — email is intentionally excluded; the API rejects it with 422 in the MVP. */
export const updateUserRequestSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  city: z.string().min(2).max(80).optional(),
  phone: z.string().max(30).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
})
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>
