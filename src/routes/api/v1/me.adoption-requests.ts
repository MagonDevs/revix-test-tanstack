import { createFileRoute } from '@tanstack/react-router'

import { listMyAdoptionRequests } from '~/mocks/handlers/adoption-requests.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/me/adoption-requests')({
  server: { handlers: { GET: withMockBehaviour(listMyAdoptionRequests) } },
})
