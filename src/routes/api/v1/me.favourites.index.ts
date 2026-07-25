import { createFileRoute } from '@tanstack/react-router'

import { listFavourites } from '~/mocks/handlers/favourites.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/me/favourites/')({
  server: { handlers: { GET: withMockBehaviour(listFavourites) } },
})
