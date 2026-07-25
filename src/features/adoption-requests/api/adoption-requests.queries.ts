import { queryOptions } from '@tanstack/react-query'

import {
  getAdoptionRequestFn,
  getMyAdoptionRequestsFn,
} from './adoption-requests.serverfns'

import type { AdoptionRequestListQuery, RequestRole } from '~/contracts'

export const requestKeys = {
  all: ['adoption-requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (query: AdoptionRequestListQuery) =>
    [...requestKeys.lists(), query] as const,
  received: () => [...requestKeys.lists(), 'received'] as const,
  sent: () => [...requestKeys.lists(), 'sent'] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (requestId: string) => [...requestKeys.details(), requestId] as const,
} as const

function rolePrefix(role: RequestRole) {
  return role === 'guardian' ? requestKeys.received() : requestKeys.sent()
}

/**
 * Fetches the caller's requests for a role. Status tab counts are derived
 * client-side from a single unfiltered call per role, mirroring the
 * `myPetsQuery` pattern — one request per tab would be wasteful here too.
 */
export const requestsQuery = (query: {
  role: RequestRole
  status?: AdoptionRequestListQuery['status']
  petId?: string
}) => {
  const full: AdoptionRequestListQuery = {
    role: query.role,
    page: 1,
    perPage: 48,
    ...(query.status ? { status: query.status } : {}),
    ...(query.petId ? { petId: query.petId } : {}),
  }
  return queryOptions({
    queryKey: [...rolePrefix(query.role), full] as const,
    queryFn: () => getMyAdoptionRequestsFn({ data: full }),
  })
}

export const requestDetailQuery = (requestId: string) =>
  queryOptions({
    queryKey: requestKeys.detail(requestId),
    queryFn: () => getAdoptionRequestFn({ data: { requestId } }),
  })

/** Cheap count for the nav badge: perPage:1 on the pending/guardian slice —
 * the list endpoint's `meta.total` gives us the count without pulling every row. */
export const pendingReceivedCountQuery = () =>
  queryOptions({
    queryKey: [...requestKeys.received(), 'pending-count'] as const,
    queryFn: async () => {
      const page = await getMyAdoptionRequestsFn({
        data: { role: 'guardian', status: 'pending', page: 1, perPage: 1 },
      })
      return page.meta.total
    },
  })
