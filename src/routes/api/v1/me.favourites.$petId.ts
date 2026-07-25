import { createFileRoute } from '@tanstack/react-router'

import {
  addFavourite,
  removeFavourite,
} from '~/mocks/handlers/favourites.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/me/favourites/$petId')({
  server: {
    handlers: {
      PUT: withMockBehaviour(addFavourite),
      DELETE: withMockBehaviour(removeFavourite),
    },
  },
})
