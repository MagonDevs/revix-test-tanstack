import { apiRequest } from '../http'

import { paginatedSchema, petDtoSchema } from '~/contracts'

export function fetchFavourites(
  query: { page?: number; perPage?: number },
  headers?: HeadersInit,
) {
  return apiRequest({
    path: '/me/favourites',
    query,
    schema: paginatedSchema(petDtoSchema),
    headers,
  })
}

export function addFavourite(petId: string, headers?: HeadersInit) {
  return apiRequest({ path: `/me/favourites/${petId}`, method: 'PUT', headers })
}

export function removeFavourite(petId: string, headers?: HeadersInit) {
  return apiRequest({
    path: `/me/favourites/${petId}`,
    method: 'DELETE',
    headers,
  })
}
