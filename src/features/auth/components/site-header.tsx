import { AppHeader } from '~/shared/components/app-header'

import { useLogout } from '../api/auth.mutations'
import { useSession } from '../hooks/use-session'

/**
 * Composes the presentational `AppHeader` (shared) with real session data.
 * `shared` may not import `features/auth`, so this wrapper lives in the
 * feature slice and route files import it instead of `AppHeader` directly.
 */
export function SiteHeader() {
  const { user, isAuthenticated } = useSession()
  const logout = useLogout()

  return (
    <AppHeader
      isSignedIn={isAuthenticated}
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
