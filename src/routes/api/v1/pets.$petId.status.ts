import { createFileRoute } from '@tanstack/react-router'

import { updatePetStatus } from '~/mocks/handlers/pets.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/pets/$petId/status')({
  server: { handlers: { PATCH: withMockBehaviour(updatePetStatus) } },
})
