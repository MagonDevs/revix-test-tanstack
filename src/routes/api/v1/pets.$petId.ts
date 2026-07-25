import { createFileRoute } from '@tanstack/react-router'

import { deletePet, getPet, updatePet } from '~/mocks/handlers/pets.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/pets/$petId')({
  server: {
    handlers: {
      GET: withMockBehaviour(getPet),
      PATCH: withMockBehaviour(updatePet),
      DELETE: withMockBehaviour(deletePet),
    },
  },
})
