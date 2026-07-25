import { describe, expect, it } from 'vitest'

import { toAdoptionRequest } from './adoption-request.model'

import type { AdoptionRequestDto } from '~/contracts'

const baseDto: AdoptionRequestDto = {
  id: 'req_1',
  status: 'pending',
  message: 'Hello, I would love to adopt this pet.',
  pet: { id: 'pet_1', name: 'Luna', status: 'available', coverPhoto: null },
  adopter: {
    id: 'user_1',
    name: 'Marta',
    city: 'Madrid',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  guardian: {
    id: 'user_2',
    name: 'Diego',
    city: 'Barcelona',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  contact: null,
  createdAt: '2026-07-01T10:00:00.000Z',
  respondedAt: null,
}

describe('toAdoptionRequest', () => {
  it('maps a null contact to undefined', () => {
    const model = toAdoptionRequest(baseDto)
    expect(model.contact).toBeUndefined()
  })

  it('maps a populated contact and normalises a null phone to undefined', () => {
    const model = toAdoptionRequest({
      ...baseDto,
      status: 'accepted',
      contact: { email: 'diego@example.com', phone: null },
    })
    expect(model.contact).toEqual({
      email: 'diego@example.com',
      phone: undefined,
    })
  })

  it('parses ISO date strings into Date instances', () => {
    const model = toAdoptionRequest({
      ...baseDto,
      respondedAt: '2026-07-02T10:00:00.000Z',
    })
    expect(model.createdAt).toBeInstanceOf(Date)
    expect(model.respondedAt).toBeInstanceOf(Date)
  })

  it('leaves respondedAt undefined when still pending', () => {
    const model = toAdoptionRequest(baseDto)
    expect(model.respondedAt).toBeUndefined()
  })
})
