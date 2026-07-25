import { useQuery } from '@tanstack/react-query'

import { pendingReceivedCountQuery } from '~/features/adoption-requests/api/adoption-requests.queries'

import { AppHeader } from '~/shared/components/app-header'

import { useLogout } from '../api/auth.mutations'
import { useSession } from '../hooks/use-session'

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
