import { ApiError } from '~/server/api-client/api-error'

import { requireAuth } from '../auth-guard'
import { toAdoptionRequestDto } from '../mappers'
import { paginate } from '../pagination'
import { db, insert, mutate, newId, nowIso } from '../repository'
import { jsonResponse, noContentResponse, readJsonBody } from '../response'
import { parseOrThrow } from '../validation'

import {
  adoptionRequestListQuerySchema,
  createAdoptionRequestRequestSchema,
  respondToRequestRequestSchema,
} from '~/contracts'

export async function createAdoptionRequest(ctx: {
  request: Request
  params: { petId: string }
}): Promise<Response> {
  const adopter = requireAuth(ctx.request)
  const pet = db.pets.get(ctx.params.petId)
  // A `withdrawn` pet not owned by the caller doesn't confirm its existence — 404, per doc03 §1.1.
  // `adopted` still resolves so a stale page can surface the real 409 instead of a misleading 404.
  const visible =
    pet && (pet.status !== 'withdrawn' || pet.guardianId === adopter.id)
  if (!pet || !visible)
    throw ApiError.create(404, 'not_found', 'Pet not found.')

  const body = parseOrThrow(
    createAdoptionRequestRequestSchema,
    await readJsonBody(ctx.request),
    'The request could not be sent.',
  )

  if (pet.guardianId === adopter.id) {
    throw ApiError.create(409, 'conflict', 'You cannot request your own pet.')
  }
  if (pet.status === 'adopted' || pet.status === 'withdrawn') {
    throw ApiError.create(409, 'conflict', 'This pet is no longer available.')
  }
  const duplicate = [...db.adoptionRequests.values()].some(
    (r) =>
      r.petId === pet.id &&
      r.adopterId === adopter.id &&
      (r.status === 'pending' || r.status === 'accepted'),
  )
  if (duplicate) {
    throw ApiError.create(
      409,
      'conflict',
      'You already have an active request for this pet.',
    )
  }

  const id = newId()
  const createdAt = nowIso()
  const request = insert(db.adoptionRequests, id, {
    id,
    petId: pet.id,
    adopterId: adopter.id,
    guardianId: pet.guardianId,
    status: 'pending',
    message: body.message,
    createdAt,
    updatedAt: createdAt,
    respondedAt: null,
  })

  return jsonResponse(toAdoptionRequestDto(request, adopter.id), 201, {
    location: `/api/v1/adoption-requests/${request.id}`,
  })
}

export function listMyAdoptionRequests(ctx: { request: Request }): Response {
  const viewer = requireAuth(ctx.request)
  const url = new URL(ctx.request.url)
  const query = adoptionRequestListQuerySchema.parse({
    role: url.searchParams.get('role') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    petId: url.searchParams.get('petId') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    perPage: url.searchParams.get('perPage') ?? undefined,
  })

  let requests = [...db.adoptionRequests.values()].filter((r) =>
    query.role === 'guardian'
      ? r.guardianId === viewer.id
      : r.adopterId === viewer.id,
  )
  if (query.status) requests = requests.filter((r) => r.status === query.status)
  if (query.petId) requests = requests.filter((r) => r.petId === query.petId)

  // Default sort: pending first, then newest.
  requests = [...requests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return b.createdAt.localeCompare(a.createdAt)
  })

  const { items, meta } = paginate(requests, query.page, query.perPage)
  return jsonResponse({
    items: items.map((r) => toAdoptionRequestDto(r, viewer.id)),
    meta,
  })
}

function findRequestForViewer(request: Request, requestId: string) {
  const viewer = requireAuth(request)
  const found = db.adoptionRequests.get(requestId)
  const isParty =
    found && (found.adopterId === viewer.id || found.guardianId === viewer.id)
  if (!found || !isParty)
    throw ApiError.create(404, 'not_found', 'Adoption request not found.')
  return { viewer, request: found }
}

export function getAdoptionRequest(ctx: {
  request: Request
  params: { requestId: string }
}): Response {
  const { viewer, request } = findRequestForViewer(
    ctx.request,
    ctx.params.requestId,
  )
  return jsonResponse(toAdoptionRequestDto(request, viewer.id))
}

export async function respondToRequest(ctx: {
  request: Request
  params: { requestId: string }
}): Promise<Response> {
  const { viewer, request } = findRequestForViewer(
    ctx.request,
    ctx.params.requestId,
  )
  if (request.guardianId !== viewer.id) {
    throw ApiError.create(
      403,
      'forbidden',
      'Only the guardian can respond to this request.',
    )
  }
  const body = parseOrThrow(
    respondToRequestRequestSchema,
    await readJsonBody(ctx.request),
    'The response could not be recorded.',
  )

  if (request.status !== 'pending') {
    throw ApiError.create(
      409,
      'conflict',
      'Only a pending request can be accepted or declined.',
    )
  }

  const respondedAt = nowIso()
  const updated = mutate(db.adoptionRequests, request.id, (current) => ({
    ...current,
    status: body.status,
    respondedAt,
  }))

  if (body.status === 'accepted' && body.reservePet) {
    mutate(db.pets, request.petId, (pet) => ({
      ...pet,
      status: 'reserved' as const,
    }))
  }

  return jsonResponse(toAdoptionRequestDto(updated, viewer.id))
}

export function withdrawRequest(ctx: {
  request: Request
  params: { requestId: string }
}): Response {
  const viewer = requireAuth(ctx.request)
  const request = db.adoptionRequests.get(ctx.params.requestId)
  if (!request || request.adopterId !== viewer.id) {
    throw ApiError.create(404, 'not_found', 'Adoption request not found.')
  }
  if (request.status !== 'pending') {
    throw ApiError.create(
      409,
      'conflict',
      'Only a pending request can be withdrawn.',
    )
  }

  mutate(db.adoptionRequests, request.id, (current) => ({
    ...current,
    status: 'withdrawn' as const,
    respondedAt: nowIso(),
  }))

  return noContentResponse()
}
