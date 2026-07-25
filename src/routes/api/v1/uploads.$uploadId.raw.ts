import { createFileRoute } from '@tanstack/react-router'

import { getUploadRaw } from '~/mocks/handlers/uploads.handlers'
import { withMockControl } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/uploads/$uploadId/raw')({
  // No artificial latency/error injection here — this serves bytes for <img> loading.
  server: { handlers: { GET: withMockControl(getUploadRaw) } },
})
