import { z } from 'zod'

import { idSchema, isoDateTimeSchema } from './common.contract'
import {
  petStatusSchema,
  requestRoleSchema,
  requestStatusSchema,
} from './enums'
import { petPhotoDtoSchema } from './pet.contract'
import { userSummaryDtoSchema } from './user.contract'

export const adoptionRequestDtoSchema = z.object({
  id: idSchema,
  status: requestStatusSchema,
  message: z.string(),
  pet: z.object({
    id: idSchema,
    name: z.string(),
    status: petStatusSchema,
    coverPhoto: petPhotoDtoSchema.nullable(),
  }),
  adopter: userSummaryDtoSchema,
  guardian: userSummaryDtoSchema,
  contact: z
    .object({ email: z.string(), phone: z.string().nullable() })
    .nullable(),
  createdAt: isoDateTimeSchema,
  respondedAt: isoDateTimeSchema.nullable(),
})
export type AdoptionRequestDto = z.infer<typeof adoptionRequestDtoSchema>

export const createAdoptionRequestRequestSchema = z.object({
  message: z.string().min(20).max(1000),
})
export type CreateAdoptionRequestRequest = z.infer<
  typeof createAdoptionRequestRequestSchema
>

export const respondToRequestRequestSchema = z.object({
  status: z.enum(['accepted', 'declined']),
  reservePet: z.boolean().default(false),
})
export type RespondToRequestRequest = z.infer<
  typeof respondToRequestRequestSchema
>

export const adoptionRequestListQuerySchema = z.object({
  role: requestRoleSchema,
  status: requestStatusSchema.optional(),
  petId: idSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
})
export type AdoptionRequestListQuery = z.infer<
  typeof adoptionRequestListQuerySchema
>
