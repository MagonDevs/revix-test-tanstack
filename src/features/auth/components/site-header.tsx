import { useQuery } from '@tanstack/react-query'

import { pendingReceivedCountQuery } from '~/features/adoption-requests/api/adoption-requests.queries'

import { AppHeader } from '~/shared/components/app-header'

import { useLogout } from '../api/auth.mutations'
import { useSession } from '../hooks/use-session'

/**
 * Composes the presentational `AppHeader` (shared) with real session data.
 * `shared` may not import `features/auth` or `features/adoption-requests`,
 * so this wrapper lives in the feature slice and route files import it
 * instead of `AppHeader` directly.
 */
export function SiteHeader() {
  const { user, isAuthenticated } = useSession()
  const logout = useLogout()
  const { data: pendingRequestCount } = useQuery({
    ...pendingReceivedCountQuery(),
    enabled: isAuthenticated,
  })

  return (
    <AppHeader
      isSignedIn={isAuthenticated}
      pendingRequestCount={pendingRequestCount ?? 0}
      {...(user
        ? {
            user: {
              name: user.name,
              ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
            },
          }
        : {})}
      onSignOut={() => logout.mutate()}
    />
  )
}
