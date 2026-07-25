import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { parseApiError } from '~/shared/lib/api-error'
import { getRouterRef } from '~/shared/config/router-ref'
import { toast } from '~/shared/ui/toast'

/**
 * US-106: a 401 from any query/mutation (other than the session query
 * itself, which treats 401 as `null` data — see `getSessionFn`) means the
 * session expired mid-visit. Clear the cache and bounce to /login.
 */
function handleGlobalError(error: unknown, queryClient: QueryClient) {
  const apiError = parseApiError(error)
  if (apiError.status !== 401) return

  const router = getRouterRef()
  if (!router) return

  queryClient.clear()
  toast.error('Your session ended. Sign in to continue.')
  void router.navigate({ to: '/login' })
}

export function createQueryClient() {
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // The session query encodes "signed out" as null data, not an
        // error — it never reaches here for a plain 401. `shared` can't
        // import `features/auth`'s `authKeys` (ESLint boundary), so the
        // root key ('auth', per authKeys.all) is duplicated here.
        if (query.queryKey[0] === 'auth') return
        handleGlobalError(error, queryClient)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => handleGlobalError(error, queryClient),
    }),
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
  return queryClient
}
