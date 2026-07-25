// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'

import {
  adoptionRequestDtoSchema,
  apiErrorBodySchema,
  paginatedSchema,
  petDtoSchema,
  sessionUserDtoSchema,
  uploadDtoSchema,
  userDtoSchema,
} from '~/contracts'

import { db, resetDb } from '../repository'
import { handleMockError } from '../response'
import { seedDb } from '../seed'
import { setCookieHeader, createSession } from '../session'

import {
  createAdoptionRequest,
  listMyAdoptionRequests,
  respondToRequest,
} from './adoption-requests.handlers'
import { getSession, login, register } from './auth.handlers'
import { addFavourite, listFavourites } from './favourites.handlers'
import { getBreeds } from './meta.handlers'
import { createPet, getPet, listMyPets, listPets } from './pets.handlers'
import { createUpload } from './uploads.handlers'
import { getUser, getUserPets } from './users.handlers'

async function call<T>(fn: () => T | Promise<T>): Promise<Response> {
  try {
    return (await fn()) as Response
  } catch (error) {
    return handleMockError(error)
  }
}

function cookieHeaderFor(userId: string): string {
  const token = createSession(userId)
  return setCookieHeader(token).split(';')[0]!
}

function requestFor(
  userId: string | null,
  url: string,
  init?: RequestInit,
): Request {
  const headers = new Headers(init?.headers)
  if (userId) headers.set('cookie', cookieHeaderFor(userId))
  return new Request(url, { ...init, headers })
}

async function json(response: Response): Promise<unknown> {
  return response.status === 204 ? undefined : await response.json()
}

describe('mock contract', () => {
  beforeEach(() => {
    resetDb(seedDb())
  })

  it('POST /auth/register matches sessionUserDtoSchema', async () => {
    const request = new Request('http://x/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        city: 'Barcelona',
      }),
    })
    const response = await register({ request })
    expect(response.status).toBe(201)
    expect(sessionUserDtoSchema.parse(await json(response))).toBeTruthy()
  })

  it('POST /auth/login matches sessionUserDtoSchema', async () => {
    const request = new Request('http://x/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'marta@example.com',
        password: 'password123',
      }),
    })
    const response = await login({ request })
    expect(response.status).toBe(200)
    sessionUserDtoSchema.parse(await json(response))
  })

  it('GET /auth/session (unauthenticated) matches apiErrorBodySchema', async () => {
    const response = await call(() =>
      getSession({ request: new Request('http://x/api/v1/auth/session') }),
    )
    expect(response.status).toBe(401)
    apiErrorBodySchema.parse(await json(response))
  })

  it('GET /users/:userId matches userDtoSchema', async () => {
    const user = [...db.users.values()][0]!
    const response = getUser({ params: { userId: user.id } })
    expect(response.status).toBe(200)
    userDtoSchema.parse(await json(response))
  })

  it('GET /users/:userId/pets matches paginated petDtoSchema', async () => {
    const user = [...db.users.values()][0]!
    const request = requestFor(null, `http://x/api/v1/users/${user.id}/pets`)
    const response = getUserPets({ request, params: { userId: user.id } })
    expect(response.status).toBe(200)
    paginatedSchema(petDtoSchema).parse(await json(response))
  })

  it('GET /pets matches paginated petDtoSchema', async () => {
    const request = requestFor(null, 'http://x/api/v1/pets?page=1&perPage=5')
    const response = listPets({ request })
    expect(response.status).toBe(200)
    paginatedSchema(petDtoSchema).parse(await json(response))
  })

  it('GET /pets/:petId matches petDtoSchema', async () => {
    const pet = [...db.pets.values()].find((p) => p.status === 'available')!
    const request = requestFor(null, `http://x/api/v1/pets/${pet.id}`)
    const response = getPet({ request, params: { petId: pet.id } })
    expect(response.status).toBe(200)
    petDtoSchema.parse(await json(response))
  })

  it('GET /pets/:petId (withdrawn, not mine) matches apiErrorBodySchema 404', async () => {
    const pet = [...db.pets.values()].find((p) => p.status === 'withdrawn')!
    const request = requestFor(null, `http://x/api/v1/pets/${pet.id}`)
    const response = await call(() =>
      getPet({ request, params: { petId: pet.id } }),
    )
    expect(response.status).toBe(404)
    apiErrorBodySchema.parse(await json(response))
  })

  it('GET /me/pets matches paginated ownedPetDto shape (petDtoSchema superset)', async () => {
    const guardian = [...db.pets.values()][0]!.guardianId
    const request = requestFor(guardian, 'http://x/api/v1/me/pets')
    const response = listMyPets({ request })
    expect(response.status).toBe(200)
    const body = (await json(response)) as { items: unknown[] }
    for (const item of body.items) petDtoSchema.parse(item)
  })

  it('POST /uploads then POST /pets matches uploadDtoSchema and petDtoSchema', async () => {
    const guardian = [...db.users.values()][0]!
    const form = new FormData()
    form.set('file', new Blob(['x'], { type: 'image/png' }), 'x.png')
    const uploadRequest = requestFor(guardian.id, 'http://x/api/v1/uploads', {
      method: 'POST',
      body: form,
    })
    const uploadResponse = await createUpload({ request: uploadRequest })
    expect(uploadResponse.status).toBe(201)
    const upload = uploadDtoSchema.parse(await json(uploadResponse))

    const petRequest = requestFor(guardian.id, 'http://x/api/v1/pets', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Contract Test Pet',
        species: 'dog',
        sex: 'female',
        ageMonths: 12,
        size: 'medium',
        description:
          'A calm, friendly dog looking for a loving home to settle into quickly.',
        city: 'Barcelona',
        photos: [{ uploadId: upload.id }],
        isVaccinated: true,
        isNeutered: true,
        isGoodWithKids: true,
        isGoodWithPets: true,
      }),
    })
    const petResponse = await createPet({ request: petRequest })
    expect(petResponse.status).toBe(201)
    petDtoSchema.parse(await json(petResponse))
  })

  it('POST /pets/:petId/adoption-requests matches adoptionRequestDtoSchema', async () => {
    const pet = [...db.pets.values()].find((p) => p.status === 'available')!
    const adopter = [...db.users.values()].find((u) => u.id !== pet.guardianId)!
    const request = requestFor(
      adopter.id,
      `http://x/api/v1/pets/${pet.id}/adoption-requests`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'I would love to give this pet a warm and caring home.',
        }),
      },
    )
    const response = await createAdoptionRequest({
      request,
      params: { petId: pet.id },
    })
    expect(response.status).toBe(201)
    adoptionRequestDtoSchema.parse(await json(response))
  })

  it('GET /me/adoption-requests matches paginated adoptionRequestDtoSchema', async () => {
    const req = [...db.adoptionRequests.values()][0]!
    const request = requestFor(
      req.adopterId,
      'http://x/api/v1/me/adoption-requests?role=adopter',
    )
    const response = listMyAdoptionRequests({ request })
    expect(response.status).toBe(200)
    paginatedSchema(adoptionRequestDtoSchema).parse(await json(response))
  })

  it('PATCH /adoption-requests/:id/status (accept) matches adoptionRequestDtoSchema with contact populated', async () => {
    const req = [...db.adoptionRequests.values()].find(
      (r) => r.status === 'pending',
    )!
    const request = requestFor(
      req.guardianId,
      `http://x/api/v1/adoption-requests/${req.id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'accepted', reservePet: true }),
      },
    )
    const response = await respondToRequest({
      request,
      params: { requestId: req.id },
    })
    expect(response.status).toBe(200)
    const body = adoptionRequestDtoSchema.parse(await json(response))
    expect(body.contact).not.toBeNull()
  })

  it('GET /me/favourites matches paginated petDtoSchema', async () => {
    const fav = [...db.favourites.values()][0]!
    const request = requestFor(fav.userId, 'http://x/api/v1/me/favourites')
    const response = listFavourites({ request })
    expect(response.status).toBe(200)
    paginatedSchema(petDtoSchema).parse(await json(response))
  })

  it('PUT /me/favourites/:petId is idempotent (204 twice)', () => {
    const user = [...db.users.values()][0]!
    const pet = [...db.pets.values()].find((p) => p.guardianId !== user.id)!
    const request1 = requestFor(
      user.id,
      `http://x/api/v1/me/favourites/${pet.id}`,
      { method: 'PUT' },
    )
    const response1 = addFavourite({
      request: request1,
      params: { petId: pet.id },
    })
    expect(response1.status).toBe(204)
    const request2 = requestFor(
      user.id,
      `http://x/api/v1/me/favourites/${pet.id}`,
      { method: 'PUT' },
    )
    const response2 = addFavourite({
      request: request2,
      params: { petId: pet.id },
    })
    expect(response2.status).toBe(204)
  })

  it('GET /meta/breeds matches { items: string[] }', async () => {
    const request = new Request('http://x/api/v1/meta/breeds?species=dog')
    const response = getBreeds({ request })
    expect(response.status).toBe(200)
    const body = (await json(response)) as { items: string[] }
    expect(Array.isArray(body.items)).toBe(true)
  })
})
