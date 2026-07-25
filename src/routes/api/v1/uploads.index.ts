import { createFileRoute } from '@tanstack/react-router'

import { createUpload } from '~/mocks/handlers/uploads.handlers'
import { withMockBehaviour } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/uploads/')({
  server: { handlers: { POST: withMockBehaviour(createUpload) } },
})
