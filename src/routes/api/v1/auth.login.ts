import { createFileRoute } from '@tanstack/react-router'

import { login } from '~/mocks/handlers/auth.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/auth/login')({
  server: { handlers: { POST: withMockBehaviour(login) } },
})
