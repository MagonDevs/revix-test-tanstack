import { serverEnv } from '~/server/env.server'

import { logger } from '~/shared/lib/logger'

import { ApiError } from './api-error'

import type { z } from 'zod'

type QueryValue =
  string | number | boolean | undefined | null | Array<string | number>

interface RequestConfig<TSchema extends z.ZodTypeAny | undefined> {
  path: string
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  /** Omit for 204 responses. */
  schema?: TSchema
  /** Forwarded from the incoming request so the API sees the session. */
  headers?: HeadersInit | undefined
  signal?: AbortSignal
}

export async function apiRequest<
  TSchema extends z.ZodTypeAny | undefined = undefined,
>(
  config: RequestConfig<TSchema>,
): Promise<TSchema extends z.ZodTypeAny ? z.infer<TSchema> : void> {
  const { path, method = 'GET', query, body, schema, headers, signal } = config
  const url = new URL(`${serverEnv.API_BASE_URL}${path}`)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value))
      value.forEach((v) => url.searchParams.append(key, String(v)))
    else url.searchParams.set(key, String(value))
  }

  const isFormData = body instanceof FormData

  const startedAt = performance.now()
  const init: RequestInit = {
    method,
    headers: {
      accept: 'application/json',
      // FormData bodies must not get a content-type: the browser sets the multipart boundary itself.
      ...(body !== undefined && !isFormData
        ? { 'content-type': 'application/json' }
        : {}),
      ...headers,
    },
    signal: signal ?? AbortSignal.timeout(serverEnv.API_TIMEOUT_MS),
  }
  if (body !== undefined) init.body = isFormData ? body : JSON.stringify(body)

  let response: Response
  try {
    response = await fetch(url, init)
  } catch (cause) {
    throw ApiError.network(cause)
  }

  logger.info('api', {
    method,
    path,
    status: response.status,
    ms: Math.round(performance.now() - startedAt),
  })

  if (!response.ok) throw await ApiError.fromResponse(response)
  if (response.status === 204 || !schema) return undefined as never

  const json: unknown = await response.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) throw ApiError.contract(path, parsed.error)
  return parsed.data as never
}
