import { createFileRoute } from '@tanstack/react-router'

import { createPet, listPets } from '~/mocks/handlers/pets.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/pets/')({
  server: {
    handlers: {
      GET: withMockBehaviour(listPets),
      POST: withMockBehaviour(createPet),
    },
  },
})
