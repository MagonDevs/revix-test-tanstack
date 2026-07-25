import { ApiError } from '~/server/api-client/api-error'

import { toPetDto, toSessionUserDto, toUserDto } from '../mappers'
import { db, mutate } from '../repository'
import { jsonResponse, readJsonBody } from '../response'
import { requireAuth } from '../auth-guard'
import { paginate, parsePageParams } from '../pagination'
import { parseOrThrow } from '../validation'

import { updateUserRequestSchema } from '~/contracts'

export function getUser(ctx: { params: { userId: string } }): Response {
  const user = db.users.get(ctx.params.userId)
  if (!user) throw ApiError.create(404, 'not_found', 'User not found.')
  return jsonResponse(toUserDto(user))
}

export async function updateMe(ctx: { request: Request }): Promise<Response> {
  const viewer = requireAuth(ctx.request)
  const body = parseOrThrow(
    updateUserRequestSchema,
    await readJsonBody(ctx.request),
    'Your profile could not be saved.',
  )

  const updated = mutate(db.users, viewer.id, (current) => ({
    ...current,
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.city !== undefined ? { city: body.city } : {}),
    ...(body.phone !== undefined ? { phone: body.phone } : {}),
    ...(body.bio !== undefined ? { bio: body.bio } : {}),
    ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
  }))

  return jsonResponse(toSessionUserDto(updated))
}

export function getUserPets(ctx: {
  request: Request
  params: { userId: string }
}): Response {
  const user = db.users.get(ctx.params.userId)
  if (!user) throw ApiError.create(404, 'not_found', 'User not found.')

  const { page, perPage } = parsePageParams(
    new URL(ctx.request.url).searchParams,
  )
  const pets = [...db.pets.values()]
    .filter((p) => p.guardianId === user.id && p.status === 'available')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const { items, meta } = paginate(pets, page, perPage)
  return jsonResponse({ items: items.map((p) => toPetDto(p, null)), meta })
}
