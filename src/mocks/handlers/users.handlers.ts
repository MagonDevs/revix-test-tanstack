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
  const rawBody = await readJsonBody(ctx.request)

  if (typeof rawBody === 'object' && rawBody !== null && 'email' in rawBody) {
    throw ApiError.create(422, 'validation_error', 'Email cannot be changed.', [
      { field: 'email', message: 'Email cannot be changed in the MVP.' },
    ])
  }

  const body = parseOrThrow(
    updateUserRequestSchema,
    rawBody,
    'Your profile could not be saved.',
  )

  let avatarUrl: string | null | undefined
  if (body.avatarUploadId !== undefined) {
    if (body.avatarUploadId === null) {
      avatarUrl = null
    } else {
      const upload = db.uploads.get(body.avatarUploadId)
      if (!upload || upload.ownerId !== viewer.id) {
        throw ApiError.create(
          422,
          'validation_error',
          'Your profile could not be saved.',
          [
            {
              field: 'avatarUploadId',
              message: 'Upload not found or not owned by you',
            },
          ],
        )
      }
      avatarUrl = upload.url
    }
  }

  const updated = mutate(db.users, viewer.id, (current) => ({
    ...current,
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.city !== undefined ? { city: body.city } : {}),
    ...(body.phone !== undefined ? { phone: body.phone } : {}),
    ...(body.bio !== undefined ? { bio: body.bio } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
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
