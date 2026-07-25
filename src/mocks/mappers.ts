import { db } from './repository'

import type {
  AdoptionRequestDto,
  OwnedPetDto,
  PetDto,
  SessionUserDto,
  UploadDto,
  UserDto,
  UserSummaryDto,
} from '~/contracts'
import type {
  StoredAdoptionRequest,
  StoredPet,
  StoredUpload,
  StoredUser,
} from './repository'

import { AGE_GROUP_MONTHS } from '~/contracts'

export function toUserSummaryDto(user: StoredUser): UserSummaryDto {
  return {
    id: user.id,
    name: user.name,
    city: user.city,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }
}

export function toUserDto(user: StoredUser): UserDto {
  const availablePetCount = [...db.pets.values()].filter(
    (pet) => pet.guardianId === user.id && pet.status === 'available',
  ).length
  return { ...toUserSummaryDto(user), bio: user.bio, availablePetCount }
}

export function toSessionUserDto(user: StoredUser): SessionUserDto {
  return { ...toUserDto(user), email: user.email, phone: user.phone }
}

export function toPetDto(pet: StoredPet, viewerUserId: string | null): PetDto {
  const guardian = db.users.get(pet.guardianId)
  if (!guardian) throw new Error(`toPetDto: missing guardian ${pet.guardianId}`)

  const isFavourited = viewerUserId
    ? db.favourites.has(`${viewerUserId}:${pet.id}`)
    : false

  const viewerRequestStatus = viewerUserId
    ? ([...db.adoptionRequests.values()].find(
        (r) => r.petId === pet.id && r.adopterId === viewerUserId,
      )?.status ?? null)
    : null

  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    ageMonths: pet.ageMonths,
    size: pet.size,
    weightKg: pet.weightKg,
    description: pet.description,
    photos: pet.photos.map(({ id, url, alt, width, height }) => ({
      id,
      url,
      alt,
      width,
      height,
    })),
    city: pet.city,
    status: pet.status,
    isVaccinated: pet.isVaccinated,
    isNeutered: pet.isNeutered,
    isGoodWithKids: pet.isGoodWithKids,
    isGoodWithPets: pet.isGoodWithPets,
    isFavourited,
    viewerRequestStatus,
    guardian: toUserSummaryDto(guardian),
    createdAt: pet.createdAt,
    updatedAt: pet.updatedAt,
  }
}

export function toOwnedPetDto(pet: StoredPet): OwnedPetDto {
  const pendingRequestCount = [...db.adoptionRequests.values()].filter(
    (r) => r.petId === pet.id && r.status === 'pending',
  ).length
  return { ...toPetDto(pet, pet.guardianId), pendingRequestCount }
}

export function toAdoptionRequestDto(
  request: StoredAdoptionRequest,
  viewerUserId: string,
): AdoptionRequestDto {
  const pet = db.pets.get(request.petId)
  const adopter = db.users.get(request.adopterId)
  const guardian = db.users.get(request.guardianId)
  if (!pet || !adopter || !guardian) {
    throw new Error(
      `toAdoptionRequestDto: missing related entity for ${request.id}`,
    )
  }

  const isParty =
    viewerUserId === request.adopterId || viewerUserId === request.guardianId
  const contact =
    request.status === 'accepted' && isParty
      ? viewerUserId === request.adopterId
        ? { email: guardian.email, phone: guardian.phone }
        : { email: adopter.email, phone: adopter.phone }
      : null

  return {
    id: request.id,
    status: request.status,
    message: request.message,
    pet: {
      id: pet.id,
      name: pet.name,
      status: pet.status,
      coverPhoto: pet.photos[0]
        ? {
            id: pet.photos[0].id,
            url: pet.photos[0].url,
            alt: pet.photos[0].alt,
            width: pet.photos[0].width,
            height: pet.photos[0].height,
          }
        : null,
    },
    adopter: toUserSummaryDto(adopter),
    guardian: toUserSummaryDto(guardian),
    contact,
    createdAt: request.createdAt,
    respondedAt: request.respondedAt,
  }
}

export function toUploadDto(upload: StoredUpload): UploadDto {
  return {
    id: upload.id,
    url: upload.url,
    width: upload.width,
    height: upload.height,
    byteSize: upload.byteSize,
  }
}

export function ageMonthsInGroup(
  ageMonths: number,
  group: keyof typeof AGE_GROUP_MONTHS,
): boolean {
  const [min, max] = AGE_GROUP_MONTHS[group]
  return ageMonths >= min && ageMonths <= max
}
