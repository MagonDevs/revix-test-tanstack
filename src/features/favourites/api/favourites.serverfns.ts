import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'

import {
  addFavourite,
  fetchFavourites,
  removeFavourite,
} from '~/server/api-client/endpoints/favourites.endpoints'
import { withApiErrors } from '~/server/api-client/serialize-error'

import { toPet } from '~/features/pets'

import { idSchema } from '~/contracts'

function forwardedHeaders(): HeadersInit {
  const cookie = getRequestHeader('cookie')
  return cookie ? { cookie } : {}
}

const favouritesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
})

export const getFavouritesFn = createServerFn({ method: 'GET' })
  .inputValidator(favouritesQuerySchema)
  .handler(
    withApiErrors(async ({ data }) => {
      const page = await fetchFavourites(data, forwardedHeaders())
      return { items: page.items.map(toPet), meta: page.meta }
    }),
  )

export const addFavouriteFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ petId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      await addFavourite(data.petId, forwardedHeaders())
      return { ok: true as const }
    }),
  )

export const removeFavouriteFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ petId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      await removeFavourite(data.petId, forwardedHeaders())
      return { ok: true as const }
    }),
  )
