import {
  apiErrorBodySchema,
  type ApiErrorCode,
  type FieldError,
} from '~/contracts/common.contract'

import type { ZodError } from 'zod'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details?: FieldError[]

  private constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: FieldError[],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    if (details) this.details = details
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let body: unknown
    try {
      body = await response.json()
    } catch {
      return new ApiError(
        response.status,
        'internal_error',
        'The server returned an unexpected response.',
      )
    }
    const parsed = apiErrorBodySchema.safeParse(body)
    if (!parsed.success) {
      return new ApiError(
        response.status,
        'internal_error',
        'The server returned an unexpected response.',
      )
    }
    return new ApiError(
      response.status,
      parsed.data.error.code,
      parsed.data.error.message,
      parsed.data.error.details,
    )
  }

  static create(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: FieldError[],
  ): ApiError {
    return new ApiError(status, code, message, details)
  }

  static network(cause: unknown): ApiError {
    const error = new ApiError(0, 'internal_error', 'Network request failed')
    error.cause = cause
    return error
  }

  static contract(path: string, cause: ZodError): ApiError {
    const error = new ApiError(
      0,
      'internal_error',
      `Response for ${path} did not match the contract`,
    )
    error.cause = cause
    return error
  }
}
