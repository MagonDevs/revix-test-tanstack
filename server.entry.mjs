// Self-hosted node entry for the built app.
//
// `dist/server/server.js` (TanStack Start's build output) only exports a
// `{ fetch }` handler — it doesn't listen on a port itself. This wraps it
// with srvx's node adapter, which was already a transitive dependency
// (TanStack Start uses it internally for `vite dev`) and is the same
// adapter TanStack Start's own docs point to for self-hosted Node.
import { serve } from 'srvx/node'

import handler from './dist/server/server.js'

serve({
  fetch: handler.fetch,
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
})
