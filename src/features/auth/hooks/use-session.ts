import { useQuery } from '@tanstack/react-query'

import { sessionQuery } from '../api/auth.queries'

import type { SessionUserDto } from '~/contracts'

export interface UseSessionResult {
  user: SessionUserDto | undefined
  isAuthenticated: boolean
  isLoading: boolean
}

/** Single source of truth for "who am I" — no auth context provider, no duplicated state. */
export function useSession(): UseSessionResult {
  const { data, isLoading } = useQuery(sessionQuery())
  return {
    user: data ?? undefined,
    isAuthenticated: Boolean(data),
    isLoading,
  }
}
