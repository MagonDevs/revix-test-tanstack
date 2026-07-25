import { createFileRoute } from '@tanstack/react-router'

import { reset } from '~/mocks/handlers/mock-control.handlers'
import { withMockControl } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/mock/reset')({
  server: { handlers: { POST: withMockControl(reset) } },
})
