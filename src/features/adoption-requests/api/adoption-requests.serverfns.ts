import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'

import {
  createAdoptionRequest,
  fetchAdoptionRequest,
  fetchMyAdoptionRequests,
  respondToRequest,
  withdrawRequest,
} from '~/server/api-client/endpoints/adoption-requests.endpoints'
import { withApiErrors } from '~/server/api-client/serialize-error'

import {
  adoptionRequestListQuerySchema,
  createAdoptionRequestRequestSchema,
  idSchema,
  respondToRequestRequestSchema,
} from '~/contracts'

import { toAdoptionRequest } from '../model/adoption-request.model'

function forwardedHeaders(): HeadersInit {
  const cookie = getRequestHeader('cookie')
  return cookie ? { cookie } : {}
}

export const createAdoptionRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({ petId: idSchema, body: createAdoptionRequestRequestSchema }),
  )
  .handler(
    withApiErrors(async ({ data }) => {
      const dto = await createAdoptionRequest(
        data.petId,
        data.body,
        forwardedHeaders(),
      )
      return toAdoptionRequest(dto)
    }),
  )

export const getMyAdoptionRequestsFn = createServerFn({ method: 'GET' })
  .inputValidator(adoptionRequestListQuerySchema)
  .handler(
    withApiErrors(async ({ data }) => {
      const page = await fetchMyAdoptionRequests(data, forwardedHeaders())
      return { items: page.items.map(toAdoptionRequest), meta: page.meta }
    }),
  )

export const getAdoptionRequestFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ requestId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      const dto = await fetchAdoptionRequest(data.requestId, forwardedHeaders())
      return toAdoptionRequest(dto)
    }),
  )

export const respondToRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      requestId: idSchema,
      body: respondToRequestRequestSchema,
    }),
  )
  .handler(
    withApiErrors(async ({ data }) => {
      const dto = await respondToRequest(
        data.requestId,
        data.body,
        forwardedHeaders(),
      )
      return toAdoptionRequest(dto)
    }),
  )

export const withdrawRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ requestId: idSchema }))
  .handler(
    withApiErrors(async ({ data }) => {
      await withdrawRequest(data.requestId, forwardedHeaders())
      return { ok: true as const }
    }),
  )
