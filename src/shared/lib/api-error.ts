import type { ApiErrorCode, FieldError } from '~/contracts/common.contract'

export interface ParsedApiError {
  status: number
  code: ApiErrorCode
  message: string
  details?: FieldError[]
}

interface SerializedApiError extends ParsedApiError {
  __apiError: true
}

function isSerializedApiError(value: unknown): value is SerializedApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { __apiError?: unknown }).__apiError === true
  )
}

export function parseApiError(error: unknown): ParsedApiError {
  if (isSerializedApiError(error)) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    }
  }
  const nested = (error as { body?: unknown } | undefined)?.body
  if (isSerializedApiError(nested)) {
    return {
      status: nested.status,
      code: nested.code,
      message: nested.message,
      ...(nested.details ? { details: nested.details } : {}),
    }
  }
  return {
    status: 0,
    code: 'internal_error',
    message: 'Something unexpected happened.',
  }
}
