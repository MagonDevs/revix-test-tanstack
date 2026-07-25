import type {
  AdoptionRequestDto,
  PetStatus,
  RequestStatus,
  UserSummaryDto,
} from '~/contracts'

export interface AdoptionRequestContact {
  email: string
  phone: string | undefined
}

/** Domain model for an adoption request — DTO shaped for UI consumption, per doc02 §5.4. */
export interface AdoptionRequest {
  id: string
  status: RequestStatus
  message: string
  pet: {
    id: string
    name: string
    status: PetStatus
    coverPhoto: AdoptionRequestDto['pet']['coverPhoto']
  }
  adopter: UserSummaryDto
  guardian: UserSummaryDto
  /** Only populated for the two parties, and only once accepted — null becomes
   * undefined per doc02 §5.4's DTO-to-model mapping convention. */
  contact: AdoptionRequestContact | undefined
  createdAt: Date
  respondedAt: Date | undefined
}

export function toAdoptionRequest(dto: AdoptionRequestDto): AdoptionRequest {
  return {
    id: dto.id,
    status: dto.status,
    message: dto.message,
    pet: dto.pet,
    adopter: dto.adopter,
    guardian: dto.guardian,
    contact: dto.contact
      ? { email: dto.contact.email, phone: dto.contact.phone ?? undefined }
      : undefined,
    createdAt: new Date(dto.createdAt),
    respondedAt: dto.respondedAt ? new Date(dto.respondedAt) : undefined,
  }
}
