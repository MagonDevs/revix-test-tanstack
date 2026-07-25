import type { ApiErrorCode, FieldError } from '~/contracts/common.contract'

import { ApiError } from './api-error'

interface SerializedApiError {
  __apiError: true
  status: number
  code: ApiErrorCode
  message: string
  details?: FieldError[]
}

export function withApiErrors<TArgs extends unknown[], TResult>(
  handler: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof ApiError) {
        const payload: SerializedApiError = {
          __apiError: true,
          status: error.status,
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        }
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- crosses the RPC boundary as a plain, reconstructable payload by design
        throw payload
      }
      throw error
    }
  }
}
