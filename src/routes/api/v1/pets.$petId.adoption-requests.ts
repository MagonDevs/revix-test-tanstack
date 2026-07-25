import { createFileRoute } from '@tanstack/react-router'

import { createAdoptionRequest } from '~/mocks/handlers/adoption-requests.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/pets/$petId/adoption-requests')({
  server: { handlers: { POST: withMockBehaviour(createAdoptionRequest) } },
})
