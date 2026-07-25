import { createFileRoute } from '@tanstack/react-router'

import { respondToRequest } from '~/mocks/handlers/adoption-requests.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute(
  '/api/v1/adoption-requests/$requestId/status',
)({
  server: { handlers: { PATCH: withMockBehaviour(respondToRequest) } },
})
