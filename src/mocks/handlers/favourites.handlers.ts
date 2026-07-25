import { ApiError } from '~/server/api-client/api-error'

import { requireAuth } from '../auth-guard'
import { toPetDto } from '../mappers'
import { paginate, parsePageParams } from '../pagination'
import { db, nowIso, persist, remove } from '../repository'
import { jsonResponse, noContentResponse } from '../response'

export function listFavourites(ctx: { request: Request }): Response {
  const viewer = requireAuth(ctx.request)
  const { page, perPage } = parsePageParams(
    new URL(ctx.request.url).searchParams,
  )

  const favouritedPets = [...db.favourites.values()]
    .filter((f) => f.userId === viewer.id)
    .map((f) => db.pets.get(f.petId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const { items, meta } = paginate(favouritedPets, page, perPage)
  return jsonResponse({ items: items.map((p) => toPetDto(p, viewer.id)), meta })
}

export function addFavourite(ctx: {
  request: Request
  params: { petId: string }
}): Response {
  const viewer = requireAuth(ctx.request)
  const pet = db.pets.get(ctx.params.petId)
  if (!pet) throw ApiError.create(404, 'not_found', 'Pet not found.')

  const key = `${viewer.id}:${pet.id}`
  if (!db.favourites.has(key)) {
    db.favourites.set(key, {
      userId: viewer.id,
      petId: pet.id,
      createdAt: nowIso(),
    })
    persist()
  }
  return noContentResponse()
}

export function removeFavourite(ctx: {
  request: Request
  params: { petId: string }
}): Response {
  const viewer = requireAuth(ctx.request)
  remove(db.favourites, `${viewer.id}:${ctx.params.petId}`)
  return noContentResponse()
}
