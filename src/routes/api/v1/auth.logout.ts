import { createFileRoute } from '@tanstack/react-router'

import { logout } from '~/mocks/handlers/auth.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/auth/logout')({
  server: { handlers: { POST: withMockBehaviour(logout) } },
})
