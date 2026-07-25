import { ApiError } from '~/server/api-client/api-error'

import {
  AGE_GROUP_MONTHS,
  createPetRequestSchema,
  myPetsQuerySchema,
  petListQuerySchema,
  updatePetRequestSchema,
  updatePetStatusRequestSchema,
} from '~/contracts'

import { requireAuth } from '../auth-guard'
import { toOwnedPetDto, toPetDto } from '../mappers'
import { paginate } from '../pagination'
import { currentUser } from '../session'
import {
  db,
  insert,
  mutate,
  newId,
  nowIso,
  remove,
  type StoredPet,
} from '../repository'
import { jsonResponse, noContentResponse, readJsonBody } from '../response'
import { parseOrThrow } from '../validation'

import type { FieldError, PetStatus } from '~/contracts'

const PUBLICLY_LISTED: PetStatus[] = ['available', 'reserved']

function sortPets(
  pets: StoredPet[],
  sort: 'newest' | 'oldest' | 'name_asc',
): StoredPet[] {
  const copy = [...pets]
  if (sort === 'oldest')
    return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  if (sort === 'name_asc')
    return copy.sort((a, b) => a.name.localeCompare(b.name))
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listPets(ctx: { request: Request }): Response {
  const url = new URL(ctx.request.url)
  const query = petListQuerySchema.parse({
    q: url.searchParams.get('q') ?? undefined,
    species: url.searchParams.getAll('species').length
      ? url.searchParams.getAll('species')
      : undefined,
    size: url.searchParams.getAll('size').length
      ? url.searchParams.getAll('size')
      : undefined,
    sex: url.searchParams.get('sex') ?? undefined,
    ageGroup: url.searchParams.get('ageGroup') ?? undefined,
    city: url.searchParams.get('city') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    perPage: url.searchParams.get('perPage') ?? undefined,
  })

  const viewer = currentUser(ctx.request)
  let pets = [...db.pets.values()].filter((p) =>
    PUBLICLY_LISTED.includes(p.status),
  )

  if (query.q) {
    const needle = query.q.toLowerCase()
    pets = pets.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.breed?.toLowerCase().includes(needle) ?? false) ||
        p.description.toLowerCase().includes(needle),
    )
  }
  if (query.species?.length)
    pets = pets.filter((p) => query.species!.includes(p.species))
  if (query.size?.length)
    pets = pets.filter((p) => query.size!.includes(p.size))
  if (query.sex) pets = pets.filter((p) => p.sex === query.sex)
  if (query.ageGroup) {
    const [min, max] = AGE_GROUP_MONTHS[query.ageGroup]
    pets = pets.filter((p) => p.ageMonths >= min && p.ageMonths <= max)
  }
  if (query.city) {
    const needle = query.city.toLowerCase()
    pets = pets.filter((p) => p.city.toLowerCase().includes(needle))
  }

  pets = sortPets(pets, query.sort)

  const { items, meta } = paginate(pets, query.page, query.perPage)
  return jsonResponse({
    items: items.map((p) => toPetDto(p, viewer?.id ?? null)),
    meta,
  })
}

export function getPet(ctx: {
  request: Request
  params: { petId: string }
}): Response {
  const pet = db.pets.get(ctx.params.petId)
  const viewer = currentUser(ctx.request)
  if (!pet) throw ApiError.create(404, 'not_found', 'Pet not found.')

  const visible =
    PUBLICLY_LISTED.includes(pet.status) || viewer?.id === pet.guardianId
  if (!visible) throw ApiError.create(404, 'not_found', 'Pet not found.')

  return jsonResponse(toPetDto(pet, viewer?.id ?? null))
}

export function listMyPets(ctx: { request: Request }): Response {
  const viewer = requireAuth(ctx.request)
  const url = new URL(ctx.request.url)
  const query = myPetsQuerySchema.parse({
    status: url.searchParams.get('status') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    perPage: url.searchParams.get('perPage') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
  })

  let pets = [...db.pets.values()].filter((p) => p.guardianId === viewer.id)
  if (query.status) pets = pets.filter((p) => p.status === query.status)
  pets = sortPets(pets, query.sort)

  const { items, meta } = paginate(pets, query.page, query.perPage)
  return jsonResponse({ items: items.map(toOwnedPetDto), meta })
}

function resolvePhotos(
  photoRefs: { uploadId: string; alt?: string | null | undefined }[],
): StoredPet['photos'] {
  const details: FieldError[] = []
  const resolved = photoRefs.map((ref, i) => {
    const upload = db.uploads.get(ref.uploadId)
    if (!upload) {
      details.push({
        field: `photos[${i}].uploadId`,
        message: 'Unknown upload.',
      })
      return null
    }
    if (upload.consumed) {
      details.push({
        field: `photos[${i}].uploadId`,
        message: 'This upload was already used.',
      })
      return null
    }
    return {
      id: newId(),
      url: upload.url,
      alt: ref.alt ?? null,
      width: upload.width,
      height: upload.height,
      _uploadId: upload.id,
    }
  })
  if (details.length > 0) {
    throw ApiError.create(
      422,
      'validation_error',
      'Some photos could not be attached.',
      details,
    )
  }
  const nonNull = resolved.filter(
    (photo): photo is NonNullable<typeof photo> => photo !== null,
  )
  for (const photo of nonNull) {
    mutate(db.uploads, photo._uploadId, (u) => ({ ...u, consumed: true }))
  }
  return nonNull.map(({ id, url, alt, width, height }) => ({
    id,
    url,
    alt,
    width,
    height,
  }))
}

export async function createPet(ctx: { request: Request }): Promise<Response> {
  const guardian = requireAuth(ctx.request)
  const body = parseOrThrow(
    createPetRequestSchema,
    await readJsonBody(ctx.request),
    'The listing could not be saved.',
  )

  const photos = resolvePhotos(body.photos)
  const id = newId()
  const createdAt = nowIso()
  const newPet: StoredPet = {
    id,
    guardianId: guardian.id,
    name: body.name,
    species: body.species,
    breed: body.breed ?? null,
    sex: body.sex,
    ageMonths: body.ageMonths,
    size: body.size,
    weightKg: body.weightKg ?? null,
    description: body.description,
    photos,
    city: body.city,
    status: 'available',
    isVaccinated: body.isVaccinated,
    isNeutered: body.isNeutered,
    isGoodWithKids: body.isGoodWithKids,
    isGoodWithPets: body.isGoodWithPets,
    createdAt,
    updatedAt: createdAt,
  }
  const pet = insert(db.pets, id, newPet)

  return jsonResponse(toPetDto(pet, guardian.id), 201, {
    location: `/api/v1/pets/${pet.id}`,
  })
}

function requireOwnedPet(
  request: Request,
  petId: string,
): { viewer: ReturnType<typeof requireAuth>; pet: StoredPet } {
  const viewer = requireAuth(request)
  const pet = db.pets.get(petId)
  if (!pet) throw ApiError.create(404, 'not_found', 'Pet not found.')
  if (pet.guardianId !== viewer.id)
    throw ApiError.create(403, 'forbidden', 'This is not your listing.')
  return { viewer, pet }
}

export async function updatePet(ctx: {
  request: Request
  params: { petId: string }
}): Promise<Response> {
  const { viewer, pet } = requireOwnedPet(ctx.request, ctx.params.petId)
  const body = parseOrThrow(
    updatePetRequestSchema,
    await readJsonBody(ctx.request),
    'The listing could not be saved.',
  )

  const photos = body.photos ? resolvePhotos(body.photos) : undefined

  const updated = mutate(db.pets, pet.id, (current) => ({
    ...current,
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.species !== undefined ? { species: body.species } : {}),
    ...(body.breed !== undefined ? { breed: body.breed } : {}),
    ...(body.sex !== undefined ? { sex: body.sex } : {}),
    ...(body.ageMonths !== undefined ? { ageMonths: body.ageMonths } : {}),
    ...(body.size !== undefined ? { size: body.size } : {}),
    ...(body.weightKg !== undefined ? { weightKg: body.weightKg } : {}),
    ...(body.description !== undefined
      ? { description: body.description }
      : {}),
    ...(body.city !== undefined ? { city: body.city } : {}),
    ...(photos !== undefined ? { photos } : {}),
    ...(body.isVaccinated !== undefined
      ? { isVaccinated: body.isVaccinated }
      : {}),
    ...(body.isNeutered !== undefined ? { isNeutered: body.isNeutered } : {}),
    ...(body.isGoodWithKids !== undefined
      ? { isGoodWithKids: body.isGoodWithKids }
      : {}),
    ...(body.isGoodWithPets !== undefined
      ? { isGoodWithPets: body.isGoodWithPets }
      : {}),
  }))

  return jsonResponse(toPetDto(updated, viewer.id))
}

const LEGAL_TRANSITIONS: Record<PetStatus, PetStatus[]> = {
  available: ['reserved', 'adopted', 'withdrawn'],
  reserved: ['available', 'adopted', 'withdrawn'],
  adopted: ['withdrawn'],
  withdrawn: [],
}

export async function updatePetStatus(ctx: {
  request: Request
  params: { petId: string }
}): Promise<Response> {
  const { viewer, pet } = requireOwnedPet(ctx.request, ctx.params.petId)
  const body = parseOrThrow(
    updatePetStatusRequestSchema,
    await readJsonBody(ctx.request),
    'The status could not be changed.',
  )

  if (
    body.status !== pet.status &&
    !LEGAL_TRANSITIONS[pet.status].includes(body.status)
  ) {
    throw ApiError.create(
      409,
      'conflict',
      `Cannot move a pet from ${pet.status} to ${body.status}.`,
    )
  }

  const updated = mutate(db.pets, pet.id, (current) => ({
    ...current,
    status: body.status,
  }))

  if (body.status === 'adopted' && body.declinePendingRequests) {
    for (const req of db.adoptionRequests.values()) {
      if (req.petId === pet.id && req.status === 'pending') {
        mutate(db.adoptionRequests, req.id, (current) => ({
          ...current,
          status: 'declined' as const,
          respondedAt: nowIso(),
        }))
      }
    }
  }

  return jsonResponse(toPetDto(updated, viewer.id))
}

export function deletePet(ctx: {
  request: Request
  params: { petId: string }
}): Response {
  const { pet } = requireOwnedPet(ctx.request, ctx.params.petId)

  for (const [key, req] of db.adoptionRequests) {
    if (req.petId === pet.id) remove(db.adoptionRequests, key)
  }
  for (const key of [...db.favourites.keys()]) {
    if (key.endsWith(`:${pet.id}`)) remove(db.favourites, key)
  }
  remove(db.pets, pet.id)

  return noContentResponse()
}
