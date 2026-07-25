import { ApiError } from '~/server/api-client/api-error'

import {
  apiErrorBodySchema,
  type ApiErrorCode,
  type FieldError,
} from '~/contracts'

export function jsonResponse(
  data: unknown,
  status = 200,
  headers?: HeadersInit,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

export function noContentResponse(headers?: HeadersInit): Response {
  return new Response(null, { status: 204, ...(headers ? { headers } : {}) })
}

export function errorEnvelope(
  code: ApiErrorCode,
  message: string,
  details?: FieldError[],
) {
  const body = { error: { code, message, ...(details ? { details } : {}) } }
  apiErrorBodySchema.parse(body)
  return body
}

export function handleMockError(error: unknown): Response {
  if (error instanceof ApiError) {
    return jsonResponse(
      errorEnvelope(error.code, error.message, error.details),
      error.status,
    )
  }
  return jsonResponse(
    errorEnvelope('internal_error', 'Unexpected mock server error.'),
    500,
  )
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw ApiError.create(400, 'validation_error', 'Malformed JSON body.')
  }
}
