import { faker } from '@faker-js/faker'

import {
  hashPassword,
  newId,
  nowIso,
  type Db,
  type StoredAdoptionRequest,
  type StoredPet,
  type StoredPhoto,
  type StoredUser,
} from './repository'

import type { PetStatus, RequestStatus, Sex, Size, Species } from '~/contracts'

/**
 * Fixed numeric seed so every developer and CI run sees an identical dataset
 * (same names, descriptions, distributions — ids and exact timestamps still vary per run,
 * which is fine: nothing in the app depends on a stable id across restarts).
 */
const FAKER_SEED = 424242

const CITIES = [
  'Barcelona',
  'Madrid',
  'Valencia',
  'Sevilla',
  'Bilbao',
  'Zaragoza',
]
const SPECIES: Species[] = ['dog', 'cat', 'rabbit', 'bird', 'other']
const SIZES: Size[] = ['small', 'medium', 'large']
const SEXES: Sex[] = ['male', 'female', 'unknown']

function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function randomInt(min: number, max: number): number {
  return faker.number.int({ min, max })
}

function makePhotos(petId: string, count: number): StoredPhoto[] {
  return Array.from({ length: count }, (_, i) => {
    const portrait = faker.datatype.boolean()
    const width = portrait ? 800 : 1200
    const height = portrait ? 1200 : 800
    return {
      id: newId(),
      // Deterministic seeded placeholder image — real network fetch required to render it.
      url: `https://picsum.photos/seed/${petId}-${i}/${width}/${height}`,
      alt: null,
      width,
      height,
    }
  })
}

function makeUser(overrides?: Partial<StoredUser>): StoredUser {
  const createdAt = daysAgoIso(randomInt(30, 400))
  return {
    id: newId(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    passwordHash: hashPassword('password123'),
    city: faker.helpers.arrayElement(CITIES),
    avatarUrl: null,
    bio: faker.lorem.sentence(),
    phone: faker.phone.number(),
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  }
}

function makePet(
  guardianId: string,
  index: number,
  status: PetStatus,
): StoredPet {
  const species = faker.helpers.arrayElement(SPECIES)
  const createdAt = daysAgoIso(randomInt(0, 90))
  const id = newId()
  return {
    id,
    guardianId,
    name: faker.person.firstName(),
    species,
    breed: faker.datatype.boolean()
      ? faker.animal[species === 'dog' ? 'dog' : 'cat']()
      : null,
    sex: faker.helpers.arrayElement(SEXES),
    ageMonths: randomInt(1, 180),
    size: faker.helpers.arrayElement(SIZES),
    weightKg: faker.datatype.boolean()
      ? Number(faker.number.float({ min: 0.5, max: 45, fractionDigits: 1 }))
      : null,
    description: faker.lorem.paragraphs({ min: 1, max: 2 }, ' '),
    photos: makePhotos(`${id}-${index}`, randomInt(1, 4)),
    city: faker.helpers.arrayElement(CITIES),
    status,
    isVaccinated: faker.datatype.boolean(),
    isNeutered: faker.datatype.boolean(),
    isGoodWithKids: faker.datatype.boolean(),
    isGoodWithPets: faker.datatype.boolean(),
    createdAt,
    updatedAt: createdAt,
  }
}

export function seedDb(): Db {
  faker.seed(FAKER_SEED)

  const users: StoredUser[] = [
    makeUser({
      name: 'Marta Ruiz',
      email: 'marta@example.com',
      city: 'Barcelona',
    }),
  ]
  for (let i = 0; i < 7; i++) users.push(makeUser())

  const marta = users[0]!

  // 40 pets: 28 available / 5 reserved / 5 adopted / 2 withdrawn.
  const statusPlan: PetStatus[] = [
    ...Array<PetStatus>(28).fill('available'),
    ...Array<PetStatus>(5).fill('reserved'),
    ...Array<PetStatus>(5).fill('adopted'),
    ...Array<PetStatus>(2).fill('withdrawn'),
  ]
  const pets: StoredPet[] = statusPlan.map((status, i) => {
    const guardian = faker.helpers.arrayElement(users)
    return makePet(guardian.id, i, status)
  })

  // 14 adoption requests, mixed statuses, at least one accepted pair.
  const requestStatuses: RequestStatus[] = [
    'accepted',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'declined',
    'declined',
    'declined',
    'withdrawn',
    'withdrawn',
    'pending',
    'pending',
    'accepted',
  ]
  const adoptionRequests: StoredAdoptionRequest[] = requestStatuses.map(
    (status, i) => {
      const pet = pets[i % pets.length]!
      const otherUsers = users.filter((u) => u.id !== pet.guardianId)
      const adopter = faker.helpers.arrayElement(
        otherUsers.length > 0 ? otherUsers : users,
      )
      const createdAt = daysAgoIso(randomInt(1, 60))
      const responded = status === 'accepted' || status === 'declined'
      return {
        id: newId(),
        petId: pet.id,
        adopterId: adopter.id,
        guardianId: pet.guardianId,
        status,
        message: faker.lorem.paragraph(),
        createdAt,
        updatedAt: createdAt,
        respondedAt: responded ? daysAgoIso(randomInt(0, 30)) : null,
      }
    },
  )

  // 6 favourites for the demo user (marta), across pets she doesn't own.
  const favouritablePets = pets
    .filter((p) => p.guardianId !== marta.id)
    .slice(0, 6)
  const favourites = favouritablePets.map((pet) => ({
    userId: marta.id,
    petId: pet.id,
    createdAt: nowIso(),
  }))

  return {
    users: new Map(users.map((u) => [u.id, u])),
    sessions: new Map(),
    pets: new Map(pets.map((p) => [p.id, p])),
    adoptionRequests: new Map(adoptionRequests.map((r) => [r.id, r])),
    favourites: new Map(favourites.map((f) => [`${f.userId}:${f.petId}`, f])),
    uploads: new Map(),
  }
}
