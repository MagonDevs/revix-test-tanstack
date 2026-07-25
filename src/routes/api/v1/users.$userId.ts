import { createFileRoute } from '@tanstack/react-router'

import { getUser } from '~/mocks/handlers/users.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/users/$userId')({
  server: { handlers: { GET: withMockBehaviour(getUser) } },
})
