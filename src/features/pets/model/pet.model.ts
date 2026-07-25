import { formatAge, toAgeGroup } from '../utils/pet-age'

import type {
  AgeGroup,
  PetDto,
  PetStatus,
  RequestStatus,
  Sex,
  Size,
  Species,
  UserSummaryDto,
} from '~/contracts'

export interface PetTraits {
  isVaccinated: boolean
  isNeutered: boolean
  isGoodWithKids: boolean
  isGoodWithPets: boolean
}

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string | undefined
  sex: Sex
  ageMonths: number
  ageGroup: AgeGroup
  ageLabel: string
  size: Size
  weightKg: number | undefined
  description: string
  photos: PetDto['photos']
  coverPhoto: PetDto['photos'][number] | undefined
  city: string
  status: PetStatus
  traits: PetTraits
  isFavourited: boolean
  viewerRequestStatus: RequestStatus | null
  guardian: UserSummaryDto
  createdAt: Date
  updatedAt: Date
}

export function toPet(dto: PetDto): Pet {
  return {
    id: dto.id,
    name: dto.name,
    species: dto.species,
    breed: dto.breed ?? undefined,
    sex: dto.sex,
    ageMonths: dto.ageMonths,
    ageGroup: toAgeGroup(dto.ageMonths),
    ageLabel: formatAge(dto.ageMonths),
    size: dto.size,
    weightKg: dto.weightKg ?? undefined,
    description: dto.description,
    photos: dto.photos,
    coverPhoto: dto.photos[0],
    city: dto.city,
    status: dto.status,
    traits: {
      isVaccinated: dto.isVaccinated,
      isNeutered: dto.isNeutered,
      isGoodWithKids: dto.isGoodWithKids,
      isGoodWithPets: dto.isGoodWithPets,
    },
    isFavourited: dto.isFavourited,
    viewerRequestStatus: dto.viewerRequestStatus,
    guardian: dto.guardian,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}
