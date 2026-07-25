import { QueryClient } from '@tanstack/react-query'

import { parseApiError } from '~/shared/lib/api-error'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const apiError = parseApiError(error)
          if (apiError.status >= 400 && apiError.status < 500) return false
          return failureCount < 2
        },
      },
      mutations: { retry: 0 },
    },
  })
}
