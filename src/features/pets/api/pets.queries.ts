import { queryOptions } from '@tanstack/react-query'

import { getPetFn, getPetsFn, getUserFn, getUserPetsFn } from './pets.server'

import type { PetListQuery } from '~/contracts'

export const petKeys = {
  all: ['pets'] as const,
  lists: () => [...petKeys.all, 'list'] as const,
  list: (query: PetListQuery) => [...petKeys.lists(), query] as const,
  details: () => [...petKeys.all, 'detail'] as const,
  detail: (petId: string) => [...petKeys.details(), petId] as const,
  byUser: (userId: string, query: { page?: number; perPage?: number }) =>
    [...petKeys.all, 'byUser', userId, query] as const,
} as const

export const petListQuery = (
  query: Omit<PetListQuery, 'perPage'> & { perPage?: number },
) => {
  const full: PetListQuery = { perPage: 12, ...query }
  return queryOptions({
    queryKey: petKeys.list(full),
    queryFn: () => getPetsFn({ data: full }),
  })
}

export const petDetailQuery = (petId: string) =>
  queryOptions({
    queryKey: petKeys.detail(petId),
    queryFn: () => getPetFn({ data: { petId } }),
  })

export const userPetsQuery = (
  userId: string,
  query: { page?: number; perPage?: number } = {},
) =>
  queryOptions({
    queryKey: petKeys.byUser(userId, query),
    queryFn: () => getUserPetsFn({ data: { userId, ...query } }),
  })

export const userKeys = {
  all: ['users'] as const,
  detail: (userId: string) => [...userKeys.all, 'detail', userId] as const,
} as const

export const userQuery = (userId: string) =>
  queryOptions({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserFn({ data: { userId } }),
  })
