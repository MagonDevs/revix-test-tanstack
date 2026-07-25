import { apiRequest } from '../http'

import {
  paginatedSchema,
  petDtoSchema,
  type UpdateUserRequest,
  userDtoSchema,
  sessionUserDtoSchema,
} from '~/contracts'

export function getUser(userId: string, headers?: HeadersInit) {
  return apiRequest({
    path: `/users/${userId}`,
    schema: userDtoSchema,
    headers,
  })
}

export function updateMe(body: UpdateUserRequest, headers?: HeadersInit) {
  return apiRequest({
    path: '/users/me',
    method: 'PATCH',
    body,
    schema: sessionUserDtoSchema,
    headers,
  })
}

export function getUserPets(
  userId: string,
  query: { page?: number; perPage?: number },
  headers?: HeadersInit,
) {
  return apiRequest({
    path: `/users/${userId}/pets`,
    query,
    schema: paginatedSchema(petDtoSchema),
    headers,
  })
}
