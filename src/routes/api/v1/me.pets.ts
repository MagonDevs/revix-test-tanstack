import { createFileRoute } from '@tanstack/react-router'

import { listMyPets } from '~/mocks/handlers/pets.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/me/pets')({
  server: { handlers: { GET: withMockBehaviour(listMyPets) } },
})
