import { z } from 'zod'

import { speciesSchema } from '~/contracts'

import { apiRequest } from '../http'

const breedsResponseSchema = z.object({ items: z.array(z.string()) })

export function getBreeds(
  species: z.infer<typeof speciesSchema>,
  headers?: HeadersInit,
) {
  return apiRequest({
    path: '/meta/breeds',
    query: { species },
    schema: breedsResponseSchema,
    headers,
  })
}
