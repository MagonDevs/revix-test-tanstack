import { createFileRoute } from '@tanstack/react-router'

import {
  getAdoptionRequest,
  withdrawRequest,
} from '~/mocks/handlers/adoption-requests.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/adoption-requests/$requestId')({
  server: {
    handlers: {
      GET: withMockBehaviour(getAdoptionRequest),
      DELETE: withMockBehaviour(withdrawRequest),
    },
  },
})
