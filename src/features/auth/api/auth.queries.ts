import { queryOptions } from '@tanstack/react-query'

import { getSessionFn } from './auth.serverfns'

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
} as const

export const sessionQuery = () =>
  queryOptions({
    queryKey: authKeys.session(),
    queryFn: () => getSessionFn(),
    staleTime: 60_000,
  })
