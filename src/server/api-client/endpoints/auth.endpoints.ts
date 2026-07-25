import { apiRequest } from '../http'

import {
  type LoginRequest,
  type RegisterRequest,
  sessionUserDtoSchema,
} from '~/contracts'

export function register(body: RegisterRequest, headers?: HeadersInit) {
  return apiRequest({
    path: '/auth/register',
    method: 'POST',
    body,
    schema: sessionUserDtoSchema,
    headers,
  })
}

export function login(body: LoginRequest, headers?: HeadersInit) {
  return apiRequest({
    path: '/auth/login',
    method: 'POST',
    body,
    schema: sessionUserDtoSchema,
    headers,
  })
}

export function logout(headers?: HeadersInit) {
  return apiRequest({ path: '/auth/logout', method: 'POST', headers })
}

export function getSession(headers?: HeadersInit) {
  return apiRequest({
    path: '/auth/session',
    schema: sessionUserDtoSchema,
    headers,
  })
}
