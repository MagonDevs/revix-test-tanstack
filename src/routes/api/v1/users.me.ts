import { createFileRoute } from '@tanstack/react-router'

import { updateMe } from '~/mocks/handlers/users.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/users/me')({
  server: { handlers: { PATCH: withMockBehaviour(updateMe) } },
})
