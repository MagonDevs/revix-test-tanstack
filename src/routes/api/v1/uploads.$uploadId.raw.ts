import { createFileRoute } from '@tanstack/react-router'

import { getUploadRaw } from '~/mocks/handlers/uploads.handlers'
import { withMockControl } from '~/mocks/latency'

export const Route = createFileRoute('/api/v1/uploads/$uploadId/raw')({
  server: { handlers: { GET: withMockControl(getUploadRaw) } },
})
