import { serverEnv } from '~/server/env.server'
import { ApiError } from '~/server/api-client/api-error'

import { ensureSeeded } from './init'
import { handleMockError } from './response'

export const mockConfig = {
  latencyMs: serverEnv.MOCK_LATENCY_MS,
  errorRate: serverEnv.MOCK_ERROR_RATE,
  failNextRequest: false,
}

function jitter(ms: number): number {
  const delta = ms * 0.4
  return Math.max(0, ms + (Math.random() * 2 - 1) * delta)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function withMockBehaviour<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response> | Response,
): (...args: TArgs) => Promise<Response> {
  return async (...args: TArgs) => {
    try {
      ensureSeeded()
      if (mockConfig.latencyMs > 0) await sleep(jitter(mockConfig.latencyMs))

      if (mockConfig.failNextRequest) {
        mockConfig.failNextRequest = false
        throw ApiError.create(
          500,
          'internal_error',
          'Forced failure (mock control).',
        )
      }
      if (mockConfig.errorRate > 0 && Math.random() < mockConfig.errorRate) {
        throw ApiError.create(500, 'internal_error', 'Random mock failure.')
      }

      return await handler(...args)
    } catch (error) {
      return handleMockError(error)
    }
  }
}

export function withMockControl<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response> | Response,
): (...args: TArgs) => Promise<Response> {
  return async (...args: TArgs) => {
    try {
      ensureSeeded()
      return await handler(...args)
    } catch (error) {
      return handleMockError(error)
    }
  }
}
