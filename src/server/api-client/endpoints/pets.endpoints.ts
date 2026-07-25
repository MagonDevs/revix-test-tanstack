import { apiRequest } from '../http'

import {
  type CreatePetRequest,
  type MyPetsQuery,
  ownedPetDtoSchema,
  paginatedSchema,
  petDtoSchema,
  type PetListQuery,
  type UpdatePetRequest,
  type UpdatePetStatusRequest,
} from '~/contracts'

export function fetchPets(query: PetListQuery, headers?: HeadersInit) {
  return apiRequest({
    path: '/pets',
    query,
    schema: paginatedSchema(petDtoSchema),
    headers,
  })
}

export function fetchPetById(petId: string, headers?: HeadersInit) {
  return apiRequest({ path: `/pets/${petId}`, schema: petDtoSchema, headers })
}

export function fetchMyPets(query: MyPetsQuery, headers?: HeadersInit) {
  return apiRequest({
    path: '/me/pets',
    query,
    schema: paginatedSchema(ownedPetDtoSchema),
    headers,
  })
}

export function createPet(body: CreatePetRequest, headers?: HeadersInit) {
  return apiRequest({
    path: '/pets',
    method: 'POST',
    body,
    schema: petDtoSchema,
    headers,
  })
}

export function updatePet(
  petId: string,
  body: UpdatePetRequest,
  headers?: HeadersInit,
) {
  return apiRequest({
    path: `/pets/${petId}`,
    method: 'PATCH',
    body,
    schema: petDtoSchema,
    headers,
  })
}

export function updatePetStatus(
  petId: string,
  body: UpdatePetStatusRequest,
  headers?: HeadersInit,
) {
  return apiRequest({
    path: `/pets/${petId}/status`,
    method: 'PATCH',
    body,
    schema: petDtoSchema,
    headers,
  })
}

export function deletePet(petId: string, headers?: HeadersInit) {
  return apiRequest({ path: `/pets/${petId}`, method: 'DELETE', headers })
}
