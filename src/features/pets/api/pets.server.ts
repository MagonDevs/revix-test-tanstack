import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'

import {
  fetchPetById,
  fetchPets,
} from '~/server/api-client/endpoints/pets.endpoints'
import {
  getUser,
  getUserPets,
} from '~/server/api-client/endpoints/users.endpoints'
import { withApiErrors } from '~/server/api-client/serialize-error'

import { toPet } from '../model/pet.model'

import { petListQuerySchema, idSchema } from '~/contracts'

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
