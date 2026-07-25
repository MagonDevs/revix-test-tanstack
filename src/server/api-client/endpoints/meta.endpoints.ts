import { z } from 'zod'

import { apiRequest } from '../http'

import { speciesSchema } from '~/contracts'

const breedsResponseSchema = z.object({ items: z.array(z.string()) })

/** Unused in the MVP — the frontend ships a static breed list. Defined so the swap to a real backend is a one-line change. */
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
