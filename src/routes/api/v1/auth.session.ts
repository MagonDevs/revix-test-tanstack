import { createFileRoute } from '@tanstack/react-router'

import { getSession } from '~/mocks/handlers/auth.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/auth/session')({
  server: { handlers: { GET: withMockBehaviour(getSession) } },
})
