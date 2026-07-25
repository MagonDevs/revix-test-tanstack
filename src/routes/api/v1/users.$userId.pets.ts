import { createFileRoute } from '@tanstack/react-router'

import { getUserPets } from '~/mocks/handlers/users.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/users/$userId/pets')({
  server: { handlers: { GET: withMockBehaviour(getUserPets) } },
})
