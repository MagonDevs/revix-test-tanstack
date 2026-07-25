import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'

import {
  createPet,
  deletePet,
  fetchMyPets,
  fetchPetById,
  fetchPets,
  updatePet,
  updatePetStatus,
} from '~/server/api-client/endpoints/pets.endpoints'
import { uploadFile } from '~/server/api-client/endpoints/uploads.endpoints'
import {
  getUser,
  getUserPets,
} from '~/server/api-client/endpoints/users.endpoints'
import { withApiErrors } from '~/server/api-client/serialize-error'

import {
  petListQuerySchema,
  idSchema,
  myPetsQuerySchema,
  createPetRequestSchema,
  updatePetRequestSchema,
  updatePetStatusRequestSchema,
} from '~/contracts'

import { toPet } from '../model/pet.model'

function forwardedHeaders(): HeadersInit {
  const cookie = getRequestHeader('cookie')
  return cookie ? { cookie } : {}
}

export const getPetsFn = createServerFn({ method: 'GET' })
  .inputValidator(petListQuerySchema)
  .handler(
    withApiErrors(async ({ data }) => {
      const page = await fetchPets(data, forwardedHeaders())
      return { items: page.items.map(toPet), meta: page.meta }
    }),
  )

export const getPetFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ petId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      const dto = await fetchPetById(data.petId, forwardedHeaders())
      return toPet(dto)
    }),
  )

const userPetsQuerySchema = z.object({
  userId: idSchema,
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
})

export const getUserFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      return await getUser(data.userId, forwardedHeaders())
    }),
  )

export const getUserPetsFn = createServerFn({ method: 'GET' })
  .inputValidator(userPetsQuerySchema)
  .handler(
    withApiErrors(async ({ data }) => {
      const { userId, ...query } = data
      const page = await getUserPets(userId, query, forwardedHeaders())
      return { items: page.items.map(toPet), meta: page.meta }
    }),
  )

export const getMyPetsFn = createServerFn({ method: 'GET' })
  .inputValidator(myPetsQuerySchema)
  .handler(
    withApiErrors(async ({ data }) => {
      const page = await fetchMyPets(data, forwardedHeaders())
      return { items: page.items, meta: page.meta }
    }),
  )

export const createPetFn = createServerFn({ method: 'POST' })
  .inputValidator(createPetRequestSchema)
  .handler(
    withApiErrors(async ({ data }) => {
      const dto = await createPet(data, forwardedHeaders())
      return toPet(dto)
    }),
  )

export const updatePetFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ petId: idSchema, body: updatePetRequestSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      const dto = await updatePet(data.petId, data.body, forwardedHeaders())
      return toPet(dto)
    }),
  )

export const updatePetStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({ petId: idSchema, body: updatePetStatusRequestSchema }),
  )
  .handler(
    withApiErrors(async ({ data }) => {
      const dto = await updatePetStatus(
        data.petId,
        data.body,
        forwardedHeaders(),
      )
      return toPet(dto)
    }),
  )

export const deletePetFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ petId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      await deletePet(data.petId, forwardedHeaders())
      return { ok: true as const }
    }),
  )

export const uploadPhotoFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as FormData)
  .handler(
    withApiErrors(async ({ data }) => {
      return await uploadFile(data, forwardedHeaders())
    }),
  )
