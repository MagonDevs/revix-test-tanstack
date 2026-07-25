import { createFileRoute } from '@tanstack/react-router'

import { config } from '~/mocks/handlers/mock-control.handlers'
import { withMockControl } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/mock/config')({
  server: { handlers: { POST: withMockControl(config) } },
})
