import { z } from 'zod'

import { idSchema, isoDateTimeSchema } from './common.contract'
import {
  ageGroupSchema,
  petSortSchema,
  petStatusSchema,
  requestStatusSchema,
  sexSchema,
  sizeSchema,
  speciesSchema,
} from './enums'
import { userSummaryDtoSchema } from './user.contract'

export const petPhotoDtoSchema = z.object({
  id: idSchema,
  url: z.string(),
  alt: z.string().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})
export type PetPhotoDto = z.infer<typeof petPhotoDtoSchema>

export const petDtoSchema = z.object({
  id: idSchema,
  name: z.string(),
  species: speciesSchema,
  breed: z.string().nullable(),
  sex: sexSchema,
  ageMonths: z.number().int().nonnegative(),
  size: sizeSchema,
  weightKg: z.number().positive().nullable(),
  description: z.string(),
  photos: z.array(petPhotoDtoSchema),
  city: z.string(),
  status: petStatusSchema,
  isVaccinated: z.boolean(),
  isNeutered: z.boolean(),
  isGoodWithKids: z.boolean(),
  isGoodWithPets: z.boolean(),
  isFavourited: z.boolean(),
  viewerRequestStatus: requestStatusSchema.nullable(),
  guardian: userSummaryDtoSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
})
export type PetDto = z.infer<typeof petDtoSchema>

export const ownedPetDtoSchema = petDtoSchema.extend({
  pendingRequestCount: z.number().int().nonnegative(),
})
export type OwnedPetDto = z.infer<typeof ownedPetDtoSchema>

const petPhotoRefSchema = z.object({
  uploadId: idSchema,
  alt: z.string().nullable().optional(),
})

export const createPetRequestSchema = z.object({
  name: z.string().min(2).max(40),
  species: speciesSchema,
  breed: z.string().max(60).nullable().optional(),
  sex: sexSchema,
  ageMonths: z.number().int().min(0).max(360),
  size: sizeSchema,
  weightKg: z.number().min(0.1).max(120).nullable().optional(),
  description: z.string().min(30).max(2000),
  city: z.string().min(2).max(80),
  photos: z.array(petPhotoRefSchema).min(1).max(6),
  isVaccinated: z.boolean(),
  isNeutered: z.boolean(),
  isGoodWithKids: z.boolean(),
  isGoodWithPets: z.boolean(),
})
export type CreatePetRequest = z.infer<typeof createPetRequestSchema>

export const updatePetRequestSchema = createPetRequestSchema.partial()
export type UpdatePetRequest = z.infer<typeof updatePetRequestSchema>

export const updatePetStatusRequestSchema = z.object({
  status: petStatusSchema,
  declinePendingRequests: z.boolean().default(true),
})
export type UpdatePetStatusRequest = z.infer<
  typeof updatePetStatusRequestSchema
>

export const petListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  species: z.array(speciesSchema).optional(),
  size: z.array(sizeSchema).optional(),
  sex: sexSchema.optional(),
  ageGroup: ageGroupSchema.optional(),
  city: z.string().trim().min(1).optional(),
  sort: petSortSchema.default('newest'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
})
export type PetListQuery = z.infer<typeof petListQuerySchema>

export const myPetsQuerySchema = z.object({
  status: petStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
  sort: petSortSchema.default('newest'),
})
export type MyPetsQuery = z.infer<typeof myPetsQuerySchema>
