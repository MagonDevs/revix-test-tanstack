import { createFileRoute } from '@tanstack/react-router'

import { getBreeds } from '~/mocks/handlers/meta.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/meta/breeds')({
  server: { handlers: { GET: withMockBehaviour(getBreeds) } },
})
