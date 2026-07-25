import {
  adoptionRequestDtoSchema,
  type AdoptionRequestListQuery,
  type CreateAdoptionRequestRequest,
  paginatedSchema,
  type RespondToRequestRequest,
} from '~/contracts'

import { apiRequest } from '../http'

export function createAdoptionRequest(
  petId: string,
  body: CreateAdoptionRequestRequest,
  headers?: HeadersInit,
) {
  return apiRequest({
    path: `/pets/${petId}/adoption-requests`,
    method: 'POST',
    body,
    schema: adoptionRequestDtoSchema,
    headers,
  })
}

export function fetchMyAdoptionRequests(
  query: AdoptionRequestListQuery,
  headers?: HeadersInit,
) {
  return apiRequest({
    path: '/me/adoption-requests',
    query,
    schema: paginatedSchema(adoptionRequestDtoSchema),
    headers,
  })
}

export function fetchAdoptionRequest(requestId: string, headers?: HeadersInit) {
  return apiRequest({
    path: `/adoption-requests/${requestId}`,
    schema: adoptionRequestDtoSchema,
    headers,
  })
}

export function respondToRequest(
  requestId: string,
  body: RespondToRequestRequest,
  headers?: HeadersInit,
) {
  return apiRequest({
    path: `/adoption-requests/${requestId}/status`,
    method: 'PATCH',
    body,
    schema: adoptionRequestDtoSchema,
    headers,
  })
}

export function withdrawRequest(requestId: string, headers?: HeadersInit) {
  return apiRequest({
    path: `/adoption-requests/${requestId}`,
    method: 'DELETE',
    headers,
  })
}
