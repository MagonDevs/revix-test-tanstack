import { z } from 'zod'

import { ApiError } from '~/server/api-client/api-error'

import { mockConfig } from '../latency'
import { toSessionUserDto } from '../mappers'
import { db, resetDb } from '../repository'
import { jsonResponse, readJsonBody } from '../response'
import { createSession, setCookieHeader } from '../session'
import { seedDb } from '../seed'
import { parseOrThrow } from '../validation'

export function reset(): Response {
  resetDb(seedDb())
  return jsonResponse({ ok: true })
}

const configRequestSchema = z.object({
  latencyMs: z.number().int().nonnegative().optional(),
  errorRate: z.number().min(0).max(1).optional(),
  failNextRequest: z.boolean().optional(),
})

export async function config(ctx: { request: Request }): Promise<Response> {
  const body = parseOrThrow(
    configRequestSchema,
    await readJsonBody(ctx.request),
  )
  if (body.latencyMs !== undefined) mockConfig.latencyMs = body.latencyMs
  if (body.errorRate !== undefined) mockConfig.errorRate = body.errorRate
  if (body.failNextRequest !== undefined)
    mockConfig.failNextRequest = body.failNextRequest
  return jsonResponse({ ...mockConfig })
}

const loginAsRequestSchema = z.object({ email: z.string() })

export async function loginAs(ctx: { request: Request }): Promise<Response> {
  const body = parseOrThrow(
    loginAsRequestSchema,
    await readJsonBody(ctx.request),
  )
  const user = [...db.users.values()].find(
    (u) => u.email.toLowerCase() === body.email.toLowerCase(),
  )
  if (!user)
    throw ApiError.create(404, 'not_found', 'No seeded user with this email.')

  const token = createSession(user.id)
  return jsonResponse(toSessionUserDto(user), 200, {
    'set-cookie': setCookieHeader(token),
  })
}
