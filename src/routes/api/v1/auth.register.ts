import { createFileRoute } from '@tanstack/react-router'

import { register } from '~/mocks/handlers/auth.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/auth/register')({
  server: { handlers: { POST: withMockBehaviour(register) } },
})
