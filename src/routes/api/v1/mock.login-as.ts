import { createFileRoute } from '@tanstack/react-router'

import { loginAs } from '~/mocks/handlers/mock-control.handlers'
import { withMockControl } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/mock/login-as')({
  server: { handlers: { POST: withMockControl(loginAs) } },
})
