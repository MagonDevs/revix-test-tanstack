import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

import { getSession } from '~/server/api-client/endpoints/auth.endpoints'
import { ApiError } from '~/server/api-client/api-error'
import { withApiErrors } from '~/server/api-client/serialize-error'
import { serverEnv } from '~/server/env.server'
import { relayCookie } from '~/server/session/session.server'

import {
  loginRequestSchema,
  registerRequestSchema,
  sessionUserDtoSchema,
  type LoginRequest,
  type RegisterRequest,
} from '~/contracts'

/** Only the headers the API is allowed to see. */
function forwardedHeaders(): HeadersInit {
  const cookie = getRequestHeader('cookie')
  return cookie ? { cookie } : {}
}

/**
 * Register/login/logout all set or clear the session cookie, which
 * `apiRequest` (the app's one typed HTTP client) intentionally doesn't
 * expose — see `relayCookie`'s doc comment. These three calls fetch the
 * mock/real API directly so the raw `Response` (and its `set-cookie`
 * header) is available to relay onto the outgoing server-function
 * response; everything else (error shape, body parsing) mirrors what
 * `apiRequest` does.
 */
async function fetchAuth(path: string, body?: unknown): Promise<Response> {
  const headers = forwardedHeaders()
  const init: RequestInit = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    signal: AbortSignal.timeout(serverEnv.API_TIMEOUT_MS),
  }
  if (body !== undefined) init.body = JSON.stringify(body)

  let response: Response
  try {
    response = await fetch(`${serverEnv.API_BASE_URL}${path}`, init)
  } catch (cause) {
    throw ApiError.network(cause)
  }
  if (!response.ok) throw await ApiError.fromResponse(response)
  return response
}

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerRequestSchema)
  .handler(
    withApiErrors(async ({ data }: { data: RegisterRequest }) => {
      const response = await fetchAuth('/auth/register', data)
      relayCookie(response)
      const json: unknown = await response.json()
      return sessionUserDtoSchema.parse(json)
    }),
  )

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginRequestSchema)
  .handler(
    withApiErrors(async ({ data }: { data: LoginRequest }) => {
      const response = await fetchAuth('/auth/login', data)
      relayCookie(response)
      const json: unknown = await response.json()
      return sessionUserDtoSchema.parse(json)
    }),
  )

export const logoutFn = createServerFn({ method: 'POST' }).handler(
  withApiErrors(async () => {
    const response = await fetchAuth('/auth/logout')
    relayCookie(response)
  }),
)

/** Treats a 401 (unauthenticated) as `null` data, not an error — doc03 §3.1. */
export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  withApiErrors(async () => {
    try {
      return await getSession(forwardedHeaders())
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  }),
)
